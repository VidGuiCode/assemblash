//! Is the process that wrote a lock file still running, and on which machine?
//!
//! A lock file records a pid. A pid on its own is not evidence: pids are
//! reused, and a pid from another machine means nothing at all on this one. So
//! this module answers two narrow questions — *is this pid a live process
//! here* and *what is "here" called* — and refuses to guess when it cannot
//! tell.
//!
//! # Why three answers and not two
//!
//! The probe can fail in a way that is not "the process is gone": a live
//! process owned by another user answers `ERROR_ACCESS_DENIED` on Windows and
//! `EPERM` on Unix. Both mean *a process with this pid exists and I may not
//! ask about it* — the opposite of dead. Collapsing that into `Dead` would let
//! a lock be stolen from a running editor, so [`Liveness::Unknown`] is its own
//! answer and **every caller must treat it as alive**.
//!
//! # What this deliberately does not do
//!
//! It does not identify the process. A pid that has been reused by an
//! unrelated program reads as `Alive`, which is the safe direction: the lock
//! stays. The reverse — a reused pid belonging to a *different* program being
//! treated as the lock's owner — is prevented one level up, by matching the
//! host and by `assemblash_core::session::force_unlock_if_pid` for the interactive
//! path.

use serde::Serialize;

/// What a probe could establish about a process id.
///
/// `Unknown` is not a failure to answer: it is the answer "something is there
/// that I am not allowed to inspect". Callers deciding whether to take
/// someone's lock must treat it exactly like [`Liveness::Alive`].
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "camelCase")]
#[non_exhaustive]
pub enum Liveness {
    /// A process with this id is running.
    Alive,
    /// No process with this id exists.
    Dead,
    /// A process may exist; this build could not determine it.
    Unknown,
}

/// Asks the operating system whether `pid` names a running process.
///
/// Answers about *this machine only*. Ask it about a pid recorded by another
/// host and it will answer confidently about an unrelated local process.
///
/// `pid` 0 is always [`Liveness::Unknown`]. It is not a pid this project ever
/// writes: it is what an unreadable or corrupt lock file degrades to, and on
/// Unix it means "my whole process group" to `kill(2)`. Refusing to answer for
/// it is what keeps a corrupt lock from being reclaimed.
pub fn process_is_alive(pid: u32) -> Liveness {
    if pid == 0 {
        return Liveness::Unknown;
    }
    imp::probe(pid)
}

/// This machine's name, as it will be written into a lock file.
///
/// `None` when the platform will not say — an unnamed container, a stripped
/// environment, a target with no implementation here. A lock acquired while
/// this returns `None` records no host, and
/// `assemblash_core::session::reclaim_if_stale` never reclaims a lock without a host.
/// Losing the hostname therefore costs automatic recovery, not safety: the
/// explicit `assemblash_core::session::force_unlock_if_pid` path still works.
pub fn this_host() -> Option<String> {
    imp::hostname()
}

#[cfg(windows)]
mod imp {
    use super::Liveness;

    use windows_sys::Win32::Foundation::{
        CloseHandle, GetLastError, ERROR_ACCESS_DENIED, ERROR_INVALID_PARAMETER, STILL_ACTIVE,
    };
    use windows_sys::Win32::System::Threading::{
        GetExitCodeProcess, OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows_sys::Win32::System::WindowsProgramming::{
        GetComputerNameW, MAX_COMPUTERNAME_LENGTH,
    };

    /// `PROCESS_QUERY_LIMITED_INFORMATION` is the weakest right that still
    /// answers `GetExitCodeProcess`, so this works against processes of other
    /// integrity levels that `PROCESS_QUERY_INFORMATION` would refuse.
    #[allow(unsafe_code)]
    pub(super) fn probe(pid: u32) -> Liveness {
        // SAFETY: an FFI call with no pointer arguments. The returned handle
        // is owned by this function and closed on every path below.
        let handle = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid) };
        if handle.is_null() {
            // SAFETY: no arguments; reads this thread's last-error slot, which
            // the failed OpenProcess above just set.
            let error = unsafe { GetLastError() };
            return match error {
                // The kernel has no such process id.
                ERROR_INVALID_PARAMETER => Liveness::Dead,
                // A process exists and this token may not open it.
                ERROR_ACCESS_DENIED => Liveness::Unknown,
                _ => Liveness::Unknown,
            };
        }

        let mut exit_code: u32 = 0;
        // SAFETY: `handle` is a live process handle from OpenProcess above,
        // and `exit_code` is a valid, initialised u32 that outlives the call.
        let queried = unsafe { GetExitCodeProcess(handle, &mut exit_code) };
        // SAFETY: `handle` came from OpenProcess and is closed exactly once.
        unsafe {
            CloseHandle(handle);
        }

        if queried == 0 {
            return Liveness::Unknown;
        }
        // A process that has exited *with* 259 is indistinguishable from a
        // running one here. That is a documented Win32 wart and it errs
        // towards "alive", which is the safe direction for a lock.
        if exit_code == STILL_ACTIVE as u32 {
            Liveness::Alive
        } else {
            Liveness::Dead
        }
    }

    #[allow(unsafe_code)]
    pub(super) fn hostname() -> Option<String> {
        // GetComputerNameW wants MAX_COMPUTERNAME_LENGTH + 1 for the NUL.
        let mut buffer = [0u16; MAX_COMPUTERNAME_LENGTH as usize + 1];
        let mut size = buffer.len() as u32;
        // SAFETY: `buffer` is a live array of exactly `size` u16s, and `size`
        // is a valid initialised u32; the call writes at most `size` elements
        // and updates `size` to the length it wrote.
        let ok = unsafe { GetComputerNameW(buffer.as_mut_ptr(), &mut size) };
        if ok != 0 {
            let written = (size as usize).min(buffer.len());
            if let Ok(name) = String::from_utf16(&buffer[..written]) {
                if !name.is_empty() {
                    return Some(name);
                }
            }
        }
        env_host("COMPUTERNAME")
    }

    fn env_host(key: &str) -> Option<String> {
        std::env::var(key).ok().filter(|name| !name.is_empty())
    }
}

#[cfg(all(unix, not(windows)))]
mod imp {
    use super::Liveness;

    /// Signal 0 asks `kill(2)` for the existence-and-permission check without
    /// delivering anything, which is the portable liveness probe.
    #[allow(unsafe_code)]
    pub(super) fn probe(pid: u32) -> Liveness {
        // A pid that does not fit `pid_t` is not a pid this kernel issued.
        // Refusing rather than truncating keeps a bogus value from probing an
        // unrelated process.
        let Ok(pid) = libc::pid_t::try_from(pid) else {
            return Liveness::Unknown;
        };
        // SAFETY: an FFI call with no pointer arguments. Signal 0 delivers
        // nothing; `pid` is positive, so this cannot address a process group.
        let result = unsafe { libc::kill(pid, 0) };
        if result == 0 {
            return Liveness::Alive;
        }
        match std::io::Error::last_os_error().raw_os_error() {
            // No such process.
            Some(libc::ESRCH) => Liveness::Dead,
            // A process exists and we may not signal it.
            Some(libc::EPERM) => Liveness::Unknown,
            _ => Liveness::Unknown,
        }
    }

    #[allow(unsafe_code)]
    pub(super) fn hostname() -> Option<String> {
        // 256 covers HOST_NAME_MAX (64 on Linux, 255 on macOS) plus the NUL.
        let mut buffer = vec![0u8; 256];
        // SAFETY: `buffer` owns `buffer.len()` writable bytes and the call
        // writes at most that many, always leaving room for the NUL because
        // the buffer starts zeroed and we never read past the first zero.
        let result = unsafe { libc::gethostname(buffer.as_mut_ptr().cast(), buffer.len() - 1) };
        if result == 0 {
            let end = buffer
                .iter()
                .position(|byte| *byte == 0)
                .unwrap_or(buffer.len());
            buffer.truncate(end);
            if let Ok(name) = String::from_utf8(buffer) {
                if !name.is_empty() {
                    return Some(name);
                }
            }
        }
        env_host("HOSTNAME")
    }

    fn env_host(key: &str) -> Option<String> {
        std::env::var(key).ok().filter(|name| !name.is_empty())
    }
}

/// Everything that is neither Windows nor Unix: answer honestly that this
/// build cannot tell, which disables automatic reclaim there rather than
/// guessing.
#[cfg(not(any(windows, unix)))]
mod imp {
    use super::Liveness;

    pub(super) fn probe(_pid: u32) -> Liveness {
        Liveness::Unknown
    }

    pub(super) fn hostname() -> Option<String> {
        None
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;

    #[test]
    fn pid_zero_is_never_answered() {
        assert_eq!(process_is_alive(0), Liveness::Unknown);
    }

    #[test]
    fn this_process_is_alive() {
        assert_eq!(process_is_alive(std::process::id()), Liveness::Alive);
    }

    #[test]
    fn liveness_serialises_as_camel_case() {
        assert_eq!(
            serde_json::to_string(&Liveness::Unknown).unwrap(),
            "\"unknown\""
        );
    }

    #[test]
    fn this_host_is_non_empty_when_it_answers() {
        if let Some(host) = this_host() {
            assert!(!host.is_empty(), "a reported host must not be empty");
        }
    }
}
