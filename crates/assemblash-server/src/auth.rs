//! Who may talk to this server.
//!
//! The default is unchanged and needs no configuration: bound to loopback,
//! no token, nothing to set up. Only one machine can reach it, and on that
//! machine the projects are already readable files.
//!
//! Binding anywhere else is a different situation, so it has a different
//! rule: **a non-loopback bind refuses to start without a token** (PRD §16.1,
//! decision 14). Not "warns" — refuses, because a server that quietly went on
//! serving would be a home directory published to a network by a flag whose
//! consequence was not obvious.
//!
//! # What this is and is not
//!
//! A token is authentication, not transport security. It is sent in a header,
//! so anyone who can read the traffic can read the token. Exposing this beyond
//! a trusted network wants a reverse proxy terminating TLS — which is also
//! where identity providers belong. There are deliberately no accounts here.

use std::net::IpAddr;

use axum::http::{HeaderMap, StatusCode};

use crate::error::ApiError;

/// How many bytes of randomness a generated token carries.
///
/// 32 bytes is far past guessing, and the encoded form is still short enough
/// to paste once into a browser without hating it.
const TOKEN_BYTES: usize = 32;

/// Whether requests need a token, and which.
#[derive(Clone, Default)]
pub enum Access {
    /// Loopback only: anyone who can reach the socket is already on the
    /// machine, where the projects are ordinary files.
    #[default]
    Open,
    /// Every request must present this token.
    Token(String),
}

// Written by hand so a token cannot reach a log through a derived `Debug`.
// PRD §16.1: never logged, never in a URL.
impl std::fmt::Debug for Access {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Open => f.write_str("Access::Open"),
            Self::Token(_) => f.write_str("Access::Token(<redacted>)"),
        }
    }
}

/// Why a server would not start.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum AccessError {
    /// A non-loopback bind was asked for with no token configured.
    #[error(
        "refusing to bind {address}: it is not a loopback address, and serving a \
         network without an access token would publish this workspace to it. \
         Run `assemblash token rotate` to create one, then start again"
    )]
    TokenRequired {
        /// The address that was asked for.
        address: String,
    },

    /// The address could not be parsed.
    #[error("{address} is not an address this can bind: {reason}")]
    UnusableAddress {
        /// What was asked for.
        address: String,
        /// Why it did not work.
        reason: String,
    },

    /// The operating system would not provide randomness for a token.
    #[error("cannot generate an access token: no randomness available ({reason})")]
    NoRandomness {
        /// What the operating system said.
        reason: String,
    },
}

/// Decides what a bind address means for access, or refuses it.
///
/// The one place the rule lives, so no caller can bind wide by forgetting to
/// check. Returns the access policy the server should then enforce.
pub fn policy_for(address: IpAddr, token: Option<&str>) -> Result<Access, AccessError> {
    if is_loopback(address) {
        // A token on loopback is honoured if configured — someone may want it
        // for a shared machine — but nothing requires one.
        return Ok(match token {
            Some(token) if !token.is_empty() => Access::Token(token.to_owned()),
            _ => Access::Open,
        });
    }
    match token {
        Some(token) if !token.is_empty() => Ok(Access::Token(token.to_owned())),
        _ => Err(AccessError::TokenRequired {
            address: address.to_string(),
        }),
    }
}

/// Whether an address reaches only this machine.
///
/// `0.0.0.0` and `::` are *not* loopback: they mean every interface, which is
/// the case this rule exists for.
pub fn is_loopback(address: IpAddr) -> bool {
    match address {
        IpAddr::V4(v4) => v4.is_loopback(),
        IpAddr::V6(v6) => v6.is_loopback(),
    }
}

impl Access {
    /// Checks a request's headers, or says why not.
    ///
    /// The comparison is constant time: a byte-by-byte one leaks how much of a
    /// guess was right, and a token is guessable a byte at a time if you can
    /// measure that.
    pub fn check(&self, headers: &HeaderMap) -> Result<(), ApiError> {
        let Self::Token(expected) = self else {
            return Ok(());
        };

        let presented = headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|value| value.to_str().ok())
            .and_then(|value| value.strip_prefix("Bearer "))
            // Surrounding whitespace is legal in a header value and is what a
            // paste often carries. Tokens come from an alphabet with no
            // whitespace in it, so trimming cannot make two different tokens
            // equal — it only forgives a stray space.
            .map(str::trim)
            .unwrap_or_default();

        if constant_time_eq(presented.as_bytes(), expected.as_bytes()) {
            Ok(())
        } else {
            // The message says what to do and nothing about what was sent:
            // echoing a rejected token back would put it in whatever logs the
            // client keeps.
            Err(ApiError::new(
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                "this server requires an access token: send it as \
                 `Authorization: Bearer <token>`",
            ))
        }
    }

    /// Whether a token is required at all, for the interface to know whether
    /// to ask for one.
    pub fn needs_token(&self) -> bool {
        matches!(self, Self::Token(_))
    }
}

/// Compares two byte strings without leaking where they differ.
///
/// Length is not secret — a token's length is fixed and public — but the
/// contents are, so every byte of the longer input is still touched.
fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    let mut difference = (a.len() ^ b.len()) as u8;
    let longest = a.len().max(b.len());
    for index in 0..longest {
        let left = a.get(index).copied().unwrap_or(0);
        let right = b.get(index).copied().unwrap_or(0);
        difference |= left ^ right;
    }
    difference == 0
}

/// Makes a new access token.
///
/// Randomness comes from the operating system. If it is unavailable this
/// fails rather than falling back: a token from a source nobody designed
/// would look exactly like a real one, and nothing would ever say otherwise
/// (NFR-4 — a structured error, never a panic).
pub fn generate_token() -> Result<String, AccessError> {
    let mut bytes = [0u8; TOKEN_BYTES];
    getrandom::fill(&mut bytes).map_err(|source| AccessError::NoRandomness {
        reason: source.to_string(),
    })?;
    // Base32-ish alphabet without look-alikes: this gets read off a screen and
    // typed, and `0`/`O` and `1`/`l` are how that goes wrong.
    const ALPHABET: &[u8; 32] = b"abcdefghjkmnpqrstuvwxyz23456789_";
    let mut out = String::with_capacity(TOKEN_BYTES * 8 / 5 + 1);
    let mut accumulator = 0u16;
    let mut bits = 0u32;
    for byte in bytes {
        accumulator = (accumulator << 8) | u16::from(byte);
        bits += 8;
        while bits >= 5 {
            bits -= 5;
            let index = ((accumulator >> bits) & 0x1F) as usize;
            out.push(ALPHABET[index] as char);
        }
    }
    if bits > 0 {
        let index = ((accumulator << (5 - bits)) & 0x1F) as usize;
        out.push(ALPHABET[index] as char);
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    fn bearer(token: &str) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(
            axum::http::header::AUTHORIZATION,
            format!("Bearer {token}").parse().unwrap(),
        );
        headers
    }

    #[test]
    fn loopback_needs_nothing() {
        let policy = policy_for("127.0.0.1".parse().unwrap(), None).unwrap();
        assert!(matches!(policy, Access::Open));
        assert!(policy.check(&HeaderMap::new()).is_ok());
        assert!(policy_for("::1".parse().unwrap(), None).is_ok());
    }

    #[test]
    fn a_wider_bind_without_a_token_is_refused() {
        // The rule this whole module exists for. Every one of these reaches
        // beyond the machine.
        for address in ["0.0.0.0", "192.168.1.10", "::", "2001:db8::1"] {
            let error = policy_for(address.parse().unwrap(), None).unwrap_err();
            assert!(
                matches!(error, AccessError::TokenRequired { .. }),
                "{address}: {error:?}"
            );
            // An empty token is not a token.
            assert!(policy_for(address.parse().unwrap(), Some("")).is_err());
        }
    }

    #[test]
    fn a_wider_bind_with_a_token_requires_it_on_every_request() {
        let policy = policy_for("0.0.0.0".parse().unwrap(), Some("sekrit")).unwrap();
        assert!(policy.needs_token());

        assert!(policy.check(&bearer("sekrit")).is_ok());
        // A pasted token often carries a stray space; that is forgiven,
        // because no token contains whitespace so nothing is made ambiguous.
        assert!(policy.check(&bearer("sekrit ")).is_ok());
        for wrong in ["", "sekri", "Sekrit", "sekritx", "se krit"] {
            assert!(policy.check(&bearer(wrong)).is_err(), "{wrong:?}");
        }
        // No header at all, and the wrong scheme.
        assert!(policy.check(&HeaderMap::new()).is_err());
        let mut basic = HeaderMap::new();
        basic.insert(
            axum::http::header::AUTHORIZATION,
            "Basic sekrit".parse().unwrap(),
        );
        assert!(policy.check(&basic).is_err());
    }

    #[test]
    fn a_token_never_appears_in_debug_output() {
        let policy = Access::Token("the-actual-secret".to_owned());
        let printed = format!("{policy:?}");
        assert!(!printed.contains("the-actual-secret"), "{printed}");
        assert!(printed.contains("redacted"));
    }

    #[test]
    fn the_refusal_says_what_to_do() {
        let error = policy_for("0.0.0.0".parse().unwrap(), None).unwrap_err();
        let message = error.to_string();
        assert!(message.contains("token rotate"), "{message}");
        assert!(message.contains("0.0.0.0"), "{message}");
    }

    #[test]
    fn generated_tokens_are_long_random_and_readable() {
        let a = generate_token().unwrap();
        let b = generate_token().unwrap();
        assert_ne!(a, b);
        assert!(a.len() >= 50, "{} characters", a.len());
        // No look-alike characters: this gets read off a screen.
        for confusing in ['0', 'o', '1', 'l', 'i', 'O'] {
            assert!(!a.contains(confusing), "{a} contains {confusing}");
        }
    }

    #[test]
    fn comparison_does_not_depend_on_where_it_differs() {
        // Correctness of the primitive; the timing property is structural —
        // every byte of the longer input is read either way.
        assert!(constant_time_eq(b"", b""));
        assert!(constant_time_eq(b"abc", b"abc"));
        assert!(!constant_time_eq(b"abc", b"abd"));
        assert!(!constant_time_eq(b"abc", b"xbc"));
        assert!(!constant_time_eq(b"abc", b"abcd"));
        assert!(!constant_time_eq(b"", b"a"));
    }
}
