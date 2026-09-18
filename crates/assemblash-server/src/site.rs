//! Which web pages may use a server that needs no token.
//!
//! A server on loopback with no token trusts everything that reaches its
//! socket. A program on the same machine can reach it, and so can a web page
//! in the person's browser, in two ways:
//!
//! * **DNS rebinding.** A page on `attacker.example` makes its own name
//!   resolve to 127.0.0.1. The browser then treats this server as the page's
//!   own origin, and the page can read and change the projects. The browser
//!   still sends `Host: attacker.example`, so the server refuses a `Host`
//!   that is not a loopback name.
//! * **Cross-site requests.** A page on another origin sends a request to
//!   `http://127.0.0.1:8787`. The browser sends its `Origin`, so the server
//!   refuses an `Origin` that is not the address the request was sent to.
//!
//! A request without `Origin` — a command-line client, an MCP client, a
//! script — is not a web page, and passes.
//!
//! These checks apply only to a loopback server with no token. A server with
//! a token is protected by the token: a web page cannot know it. A reverse
//! proxy that sends its own public name as `Host` to a loopback server with
//! no token needs that name in `allowed-hosts` in `config.toml`.

use std::net::IpAddr;

use axum::http::{header, HeaderMap, StatusCode};

use crate::error::ApiError;
use crate::Access;

/// The names a loopback server always answers to.
const LOOPBACK_NAMES: [&str; 3] = ["localhost", "127.0.0.1", "::1"];

/// Whether requests must come from this machine's own names and pages.
#[derive(Debug, Clone)]
pub struct SiteGuard {
    enabled: bool,
    extra_hosts: Vec<String>,
}

impl SiteGuard {
    /// The guard for a bind: on for loopback without a token, off otherwise.
    ///
    /// `extra_hosts` are further `Host` names to accept, from `allowed-hosts`
    /// in the workspace configuration.
    pub fn for_bind(address: IpAddr, access: &Access, extra_hosts: &[String]) -> Self {
        Self {
            enabled: crate::auth::is_loopback(address) && !access.needs_token(),
            extra_hosts: extra_hosts
                .iter()
                .map(|host| normalise_host(host))
                .filter(|host| !host.is_empty())
                .collect(),
        }
    }

    /// Whether the checks apply.
    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    /// The `Host` names accepted besides the loopback names.
    pub fn extra_hosts(&self) -> &[String] {
        &self.extra_hosts
    }

    fn host_allowed(&self, host: &str) -> bool {
        LOOPBACK_NAMES.contains(&host) || self.extra_hosts.iter().any(|extra| extra == host)
    }

    /// Checks a request's `Host` and `Origin`, or says why not.
    pub fn check(&self, headers: &HeaderMap) -> Result<(), ApiError> {
        if !self.enabled {
            return Ok(());
        }
        let host = match headers.get(header::HOST) {
            Some(value) => {
                let text = value
                    .to_str()
                    .map_err(|_| host_refused("an unreadable name"))?;
                let authority = split_authority(text);
                if !self.host_allowed(&authority.0) {
                    return Err(host_refused(&authority.0));
                }
                Some(authority)
            }
            None => None,
        };

        let Some(origin) = headers.get(header::ORIGIN) else {
            return Ok(());
        };
        let origin = origin.to_str().unwrap_or_default().trim();
        let Some((scheme, rest)) = origin.split_once("://") else {
            // `null` (a sandboxed page, a file) and anything unreadable.
            return Err(origin_refused(origin));
        };
        let (origin_host, origin_port) = split_authority(rest);
        let origin_port = origin_port.or(match scheme.to_ascii_lowercase().as_str() {
            "http" => Some(80),
            "https" => Some(443),
            _ => None,
        });
        let same_site = match &host {
            Some((host, host_port)) => {
                origin_host == *host && host_port.is_none_or(|port| origin_port == Some(port))
            }
            None => self.host_allowed(&origin_host),
        };
        if same_site {
            Ok(())
        } else {
            Err(origin_refused(origin))
        }
    }
}

/// A host name as compared: lower case, no brackets, no trailing dot.
fn normalise_host(host: &str) -> String {
    host.trim()
        .trim_start_matches('[')
        .trim_end_matches(']')
        .trim_end_matches('.')
        .to_ascii_lowercase()
}

/// Splits `host[:port]`, `[v6]:port`, or `v6` into a normalised host and a
/// port. A path after the authority is ignored.
fn split_authority(authority: &str) -> (String, Option<u16>) {
    let authority = authority.trim().split('/').next().unwrap_or_default();
    if let Some(rest) = authority.strip_prefix('[') {
        let (host, after) = rest.split_once(']').unwrap_or((rest, ""));
        let port = after.strip_prefix(':').and_then(|port| port.parse().ok());
        return (normalise_host(host), port);
    }
    // More than one colon and no brackets: a bare IPv6 address, no port.
    if authority.matches(':').count() > 1 {
        return (normalise_host(authority), None);
    }
    match authority.rsplit_once(':') {
        Some((host, port)) => (normalise_host(host), port.parse().ok()),
        None => (normalise_host(authority), None),
    }
}

fn host_refused(host: &str) -> ApiError {
    ApiError::new(
        StatusCode::FORBIDDEN,
        "hostNotAllowed",
        format!(
            "this server answers only to localhost, 127.0.0.1, and ::1, not to {host}. \
             For a reverse proxy, add the name to allowed-hosts in config.toml, or set an \
             access token"
        ),
    )
}

fn origin_refused(origin: &str) -> ApiError {
    ApiError::new(
        StatusCode::FORBIDDEN,
        "originNotAllowed",
        format!("a web page from {origin:?} may not use this server"),
    )
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    fn open_loopback(extra: &[&str]) -> SiteGuard {
        let extra: Vec<String> = extra.iter().map(|host| (*host).to_owned()).collect();
        SiteGuard::for_bind("127.0.0.1".parse().unwrap(), &Access::Open, &extra)
    }

    fn headers(pairs: &[(&'static str, &str)]) -> HeaderMap {
        let mut headers = HeaderMap::new();
        for (name, value) in pairs {
            headers.insert(*name, value.parse().unwrap());
        }
        headers
    }

    fn code(result: Result<(), ApiError>) -> Option<&'static str> {
        result.err().map(|error| error.code())
    }

    #[test]
    fn loopback_names_pass_and_other_names_are_refused() {
        let guard = open_loopback(&[]);
        for host in [
            "127.0.0.1:8787",
            "localhost:8787",
            "LOCALHOST",
            "[::1]:8787",
            "::1",
        ] {
            assert_eq!(
                code(guard.check(&headers(&[("host", host)]))),
                None,
                "{host}"
            );
        }
        for host in [
            "attacker.example:8787",
            "192.168.1.10:8787",
            "127.0.0.1.nip.io",
        ] {
            assert_eq!(
                code(guard.check(&headers(&[("host", host)]))),
                Some("hostNotAllowed"),
                "{host}"
            );
        }
        // No Host at all is a client, not a browser.
        assert_eq!(code(guard.check(&HeaderMap::new())), None);
    }

    #[test]
    fn a_page_may_use_the_server_only_from_the_address_it_sent_to() {
        let guard = open_loopback(&[]);
        let own = headers(&[
            ("host", "127.0.0.1:8787"),
            ("origin", "http://127.0.0.1:8787"),
        ]);
        assert_eq!(code(guard.check(&own)), None);
        for origin in [
            "https://attacker.example",
            "http://localhost:8787",
            "http://127.0.0.1:9999",
            "null",
            "file://",
        ] {
            let request = headers(&[("host", "127.0.0.1:8787"), ("origin", origin)]);
            assert_eq!(
                code(guard.check(&request)),
                Some("originNotAllowed"),
                "{origin}"
            );
        }
    }

    #[test]
    fn a_proxy_name_in_allowed_hosts_passes_with_its_own_pages() {
        let guard = open_loopback(&["Assemblash.Example.com"]);
        // nginx with `proxy_set_header Host $host`: no port in Host.
        let request = headers(&[
            ("host", "assemblash.example.com"),
            ("origin", "https://assemblash.example.com"),
        ]);
        assert_eq!(code(guard.check(&request)), None);
        let other = headers(&[("host", "other.example.com")]);
        assert_eq!(code(guard.check(&other)), Some("hostNotAllowed"));
    }

    #[test]
    fn a_token_or_a_wide_bind_turns_the_checks_off() {
        let token = SiteGuard::for_bind(
            "127.0.0.1".parse().unwrap(),
            &Access::Token("secret".to_owned()),
            &[],
        );
        let wide = SiteGuard::for_bind(
            "0.0.0.0".parse().unwrap(),
            &Access::Token("secret".to_owned()),
            &[],
        );
        let request = headers(&[
            ("host", "attacker.example"),
            ("origin", "https://attacker.example"),
        ]);
        assert!(!token.is_enabled());
        assert!(!wide.is_enabled());
        assert_eq!(code(token.check(&request)), None);
        assert_eq!(code(wide.check(&request)), None);
    }
}
