//! Parsing and validating the `d` string of a path shape or path clip.
//!
//! A path is arbitrary geometry, and arbitrary geometry is where a renderer
//! gets surprised. This engine takes the conservative subset agreed for the
//! 1.10.0 rung instead of the whole SVG path grammar, and it validates at
//! **operation time** — the moment a `create` or `update` carries a `d` — so
//! a `d` this build cannot draw never reaches the renderer at all.
//!
//! # The grammar this accepts
//!
//! | Rule | Value |
//! | --- | --- |
//! | Allowed commands | `M m L l H h V v C c S s A a Z z` only |
//! | Refused commands | `Q q T t` and everything else — named with its byte position |
//! | Leading moveto | Exactly one, and it must be first: a second `M`/`m` is refused |
//! | Closing | The path must end with `Z` or `z`; an open line is a `ShapeKind::Line`, not a path |
//! | Numbers | Finite only: `NaN` and infinities are refused, named |
//! | Arc flags | The two single-number flags of `A` must be `0` or `1` |
//!
//! SVG's implicit repetition is supported: coordinate pairs that follow a
//! command without a new letter repeat it (`M` and `m` continue as `L`/`l`,
//! the others repeat themselves), and every repeat counts as one command.
//!
//! # The limits, and why these numbers
//!
//! The inventory suggested at most 2 kB and at most 30 commands; those are
//! the values fixed here. Both are generous for hand-authored silhouettes —
//! a rounded blob is a dozen commands — and both are small enough that a
//! traced photograph cannot masquerade as a path (it belongs in as a raster
//! or an imported SVG, which has its own, larger budget in
//! [`crate::svg_import`]). The length limit counts **bytes**, not characters,
//! because the failure mode being bounded is memory and parser work, and
//! neither counts characters.
//!
//! Both limits live here, as named constants, and are enforced here at
//! operation time — never at render time.

/// Largest `d` string accepted, in **bytes** (not characters).
///
/// See the [module documentation](self) for why this number.
pub const MAX_D_BYTES: usize = 2048;

/// Largest number of commands accepted.
///
/// Every command letter is one command, and every implicit repetition of a
/// command is one too: `M 0 0 10 10Z` is two commands, not one.
pub const MAX_COMMANDS: usize = 30;

/// The command letters this grammar accepts.
const ALLOWED: &[u8] = b"MmLlHhVvCcSsAaZz";

/// How many numbers one group of each command takes.
///
/// `A` is the arc: radius-x, radius-y, rotation, and the two flags, then the
/// endpoint. `Z` takes none, which is why it is absent.
fn group_size(command: u8) -> Option<usize> {
    match command {
        b'M' | b'm' | b'L' | b'l' => Some(2),
        b'H' | b'h' | b'V' | b'v' => Some(1),
        b'C' | b'c' => Some(6),
        b'S' | b's' => Some(4),
        b'A' | b'a' => Some(7),
        _ => None,
    }
}

/// Why a `d` string was refused.
///
/// Every variant names the exact spot: the offending command and its byte
/// position, or the number and its position. A caller — usually an agent —
/// should be able to fix the string from the message alone.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[non_exhaustive]
pub enum PathError {
    /// The `d` string is empty or only whitespace.
    #[error("the d string is empty")]
    Empty,

    /// The `d` string is longer than [`MAX_D_BYTES`] bytes.
    #[error("the d string is {size} bytes, larger than the {MAX_D_BYTES} byte limit")]
    TooLong {
        /// Size of the offending string.
        size: usize,
    },

    /// More than [`MAX_COMMANDS`] commands.
    #[error("the d string has {count} commands, more than the {MAX_COMMANDS} command limit")]
    TooManyCommands {
        /// Command count found.
        count: usize,
    },

    /// A command letter (or a character where one was expected) that this
    /// grammar does not accept.
    #[error(
        "unsupported path command {command:?} at byte {position}: this grammar accepts M m L l H h V v C c S s A a Z z only"
    )]
    UnsupportedCommand {
        /// The offending character.
        command: char,
        /// Byte position in the `d` string.
        position: usize,
    },

    /// A second `M` or `m`. A path has exactly one leading moveto.
    #[error("a second moveto at byte {position}: a path has exactly one leading M")]
    SecondMoveTo {
        /// Byte position of the repeated moveto.
        position: usize,
    },

    /// A drawing command before any moveto — there is no pen position yet.
    #[error("command at byte {position} comes before the leading M")]
    MissingMoveTo {
        /// Byte position of the stray command.
        position: usize,
    },

    /// Something follows the closing `Z`. A path ends with its closepath.
    #[error("the path continues at byte {position} after the closing Z")]
    AfterClose {
        /// Byte position of what follows the closepath.
        position: usize,
    },

    /// The path never closes with `Z` or `z`.
    #[error(
        "the path is not closed: it must end with Z (an open line is a line layer, not a path)"
    )]
    NotClosed,

    /// A number that does not parse.
    #[error("invalid number {raw:?} at byte {position}")]
    InvalidNumber {
        /// The offending text.
        raw: String,
        /// Byte position where it starts.
        position: usize,
    },

    /// A number that parses but is not finite (`NaN` or an infinity).
    #[error("{raw:?} at byte {position} is not a finite number")]
    NotFinite {
        /// The offending text.
        raw: String,
        /// Byte position where it starts.
        position: usize,
    },

    /// An arc's large-arc or sweep flag, which must be `0` or `1`.
    #[error("arc flag {raw:?} at byte {position} must be 0 or 1")]
    InvalidArcFlag {
        /// The offending text.
        raw: String,
        /// Byte position where it starts.
        position: usize,
    },
}

/// Validates a `d` string against the grammar in the [module
/// documentation](self).
///
/// Pure checking: nothing is rewritten or normalised. The string is stored as
/// written and emitted into the SVG as written, so what the author typed is
/// what renders.
pub fn validate(d: &str) -> Result<(), PathError> {
    if d.len() > MAX_D_BYTES {
        return Err(PathError::TooLong { size: d.len() });
    }
    if d.trim().is_empty() {
        return Err(PathError::Empty);
    }

    let bytes = d.as_bytes();
    let mut position = 0usize;
    let mut commands = 0usize;
    // The drawing command implicit repetitions continue, when the next token
    // is a number rather than a letter. `M` continues as `L`; the rest
    // continue as themselves.
    let mut repeating: Option<u8> = None;
    // Numbers consumed since the current command's letter, so arc-flag
    // positions can be recognised.
    let mut consumed = 0usize;
    let mut seen_move = false;
    let mut closed = false;

    loop {
        while matches!(bytes.get(position), Some(b) if b.is_ascii_whitespace() || *b == b',') {
            position += 1;
        }
        let Some(&byte) = bytes.get(position) else {
            break;
        };

        if byte.is_ascii_alphabetic() {
            if closed {
                return Err(PathError::AfterClose { position });
            }
            if !ALLOWED.contains(&byte) {
                return Err(PathError::UnsupportedCommand {
                    command: byte as char,
                    position,
                });
            }
            position += 1;
            commands += 1;
            if commands > MAX_COMMANDS {
                return Err(PathError::TooManyCommands { count: commands });
            }
            match byte {
                b'M' | b'm' => {
                    if seen_move {
                        return Err(PathError::SecondMoveTo {
                            position: position - 1,
                        });
                    }
                    seen_move = true;
                }
                b'Z' | b'z' => {
                    if !seen_move {
                        return Err(PathError::MissingMoveTo { position });
                    }
                    closed = true;
                    repeating = None;
                    consumed = 0;
                    continue;
                }
                _ => {
                    if !seen_move {
                        return Err(PathError::MissingMoveTo { position });
                    }
                }
            }
            repeating = Some(byte);
            consumed = 0;
            continue;
        }

        // Not a letter: an implicit repetition of the current command.
        if closed {
            return Err(PathError::AfterClose { position });
        }
        let Some(command) = repeating else {
            return Err(PathError::UnsupportedCommand {
                command: byte as char,
                position,
            });
        };
        let size = group_size(command).unwrap_or_default();
        let within_group = consumed % size;
        let raw = scan_number(bytes, &mut position).ok_or(PathError::InvalidNumber {
            raw: char_at(bytes, position),
            position,
        })?;
        let value: f64 = raw.parse().map_err(|_| PathError::InvalidNumber {
            raw: raw.to_owned(),
            position,
        })?;
        if !value.is_finite() {
            return Err(PathError::NotFinite {
                raw: raw.to_owned(),
                position,
            });
        }
        if (command == b'A' || command == b'a')
            && (within_group == 3 || within_group == 4)
            && value != 0.0
            && value != 1.0
        {
            return Err(PathError::InvalidArcFlag {
                raw: raw.to_owned(),
                position,
            });
        }
        consumed += 1;
        // Each completed group after the first is one more command.
        if consumed.is_multiple_of(size) && consumed > size {
            commands += 1;
            if commands > MAX_COMMANDS {
                return Err(PathError::TooManyCommands { count: commands });
            }
        }
    }

    if !closed {
        return Err(PathError::NotClosed);
    }
    Ok(())
}

/// Reads one SVG number starting at `position`, advancing it past the number.
///
/// Follows the SVG number grammar closely enough not to fuse `1-2` into one
/// token: an exponent is only taken when an `e`/`E` is followed by an
/// optionally signed digit.
fn scan_number<'a>(bytes: &'a [u8], position: &mut usize) -> Option<&'a str> {
    // Scanned with a local cursor and committed only on success, so a failed
    // scan leaves `position` alone and the caller's error names the byte the
    // number was supposed to start at.
    let start = *position;
    let mut cursor = start;
    if matches!(bytes.get(cursor), Some(b'+' | b'-')) {
        cursor += 1;
    }
    let mut digits = 0usize;
    while matches!(bytes.get(cursor), Some(b) if b.is_ascii_digit()) {
        cursor += 1;
        digits += 1;
    }
    if bytes.get(cursor) == Some(&b'.') {
        cursor += 1;
        while matches!(bytes.get(cursor), Some(b) if b.is_ascii_digit()) {
            cursor += 1;
            digits += 1;
        }
    }
    if digits == 0 {
        return None;
    }
    if matches!(bytes.get(cursor), Some(b'e' | b'E')) {
        let mut after = cursor + 1;
        if matches!(bytes.get(after), Some(b'+' | b'-')) {
            after += 1;
        }
        if matches!(bytes.get(after), Some(b) if b.is_ascii_digit()) {
            cursor = after;
            while matches!(bytes.get(cursor), Some(b) if b.is_ascii_digit()) {
                cursor += 1;
            }
        }
    }
    let raw = std::str::from_utf8(&bytes[start..cursor]).ok()?;
    *position = cursor;
    Some(raw)
}

fn char_at(bytes: &[u8], position: usize) -> String {
    bytes
        .get(position..)
        .and_then(|rest| std::str::from_utf8(rest).ok())
        .and_then(|rest| rest.chars().next())
        .map(String::from)
        .unwrap_or_else(|| "(end)".to_owned())
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::panic)]

    use super::*;

    #[test]
    fn q_is_refused_naming_the_command_and_its_byte_position() {
        for (d, position) in [
            ("M0 0 Q5 5 10 0Z", 5usize),
            ("M0 0L10 10q2 2 4 0Z", 10),
            ("M0 0T10 0Z", 4),
        ] {
            let error = validate(d).unwrap_err();
            assert!(
                matches!(
                    &error,
                    PathError::UnsupportedCommand { command, position: at }
                        if *at == position
                            && (command.eq_ignore_ascii_case(&'Q')
                                || command.eq_ignore_ascii_case(&'T'))
                ),
                "{d} should name the refused command, got {error:?}"
            );
            assert!(
                error.to_string().contains('Q')
                    || error.to_string().contains('q')
                    || error.to_string().contains('T'),
                "{error}"
            );
        }
    }

    #[test]
    fn anything_that_is_not_the_subset_is_refused() {
        // A refused command letter is named as a command...
        assert!(matches!(
            validate("M0 0R10 10Z"),
            Err(PathError::UnsupportedCommand { command: 'R', .. })
        ));
        // ...and data after the closepath is refused as post-close data.
        assert!(matches!(
            validate("M0 0L10 10Z!"),
            Err(PathError::AfterClose { .. })
        ));
        assert!(matches!(
            validate("M0 0L10 10Zdraw"),
            Err(PathError::AfterClose { .. })
        ));
    }

    #[test]
    fn over_length_is_refused() {
        // One moveto and one closepath, padded with a comment-free long
        // coordinate: 2049 bytes and still a single logical path.
        let d = format!("M0 0H{}Z", "9".repeat(MAX_D_BYTES));
        let error = validate(&d).unwrap_err();
        assert!(
            matches!(&error, PathError::TooLong { size } if *size > MAX_D_BYTES),
            "{error:?}"
        );
        // Just inside the limit is fine. The padding is leading zeros: a
        // number made of 2 000 nines would parse to an infinity and be
        // refused for the wrong reason.
        let d = format!("M0 0H{}1Z", "0".repeat(MAX_D_BYTES - 7));
        assert_eq!(d.len(), MAX_D_BYTES);
        assert_eq!(validate(&d), Ok(()));
    }

    #[test]
    fn more_than_30_commands_are_refused() {
        // M + 28 linetos + Z = exactly 30.
        let ok = format!("M0 0{}Z", "L1 1".repeat(28));
        assert_eq!(validate(&ok), Ok(()), "30 commands pass");

        // One more lineto tips it to 31.
        let long = format!("M0 0{}Z", "L1 1".repeat(29));
        assert!(
            matches!(validate(&long), Err(PathError::TooManyCommands { count }) if count == 31),
            "{long:?}"
        );

        // Implicit repetitions count too: `M` continuing as `L`.
        let implicit = format!("M0 0{}Z", " 1 1".repeat(29));
        assert!(matches!(
            validate(&implicit),
            Err(PathError::TooManyCommands { .. })
        ));
    }

    #[test]
    fn two_leading_movetos_are_refused() {
        for d in ["M0 0M10 10Z", "M0 0m10 10Z", "M0 0L10 10M0 0Z"] {
            let error = validate(d).unwrap_err();
            assert!(
                matches!(error, PathError::SecondMoveTo { .. }),
                "{d} should refuse the second M, got {error:?}"
            );
        }
    }

    #[test]
    fn an_unclosed_path_is_refused() {
        for d in ["M0 0L10 10", "M0 0L10 10 ", "M0 0"] {
            assert_eq!(validate(d), Err(PathError::NotClosed), "{d}");
        }
    }

    #[test]
    fn empty_and_whitespace_only_are_refused() {
        assert_eq!(validate(""), Err(PathError::Empty));
        assert_eq!(validate("   \t\n"), Err(PathError::Empty));
    }

    #[test]
    fn a_path_must_start_with_its_moveto() {
        assert!(matches!(
            validate("L10 10Z"),
            Err(PathError::MissingMoveTo { .. })
        ));
    }

    #[test]
    fn nothing_may_follow_the_closepath() {
        assert!(matches!(
            validate("M0 0ZL10 10"),
            Err(PathError::AfterClose { .. })
        ));
    }

    #[test]
    fn non_finite_numbers_are_refused_by_name() {
        // Exponents that overflow (or underflow to an infinity) are the way a
        // `d` can carry a non-finite number; a bare `inf` is not an SVG
        // number and is refused as an invalid number instead.
        for d in ["M0 0L1e999 10Z", "M0 0L2e308 10Z", "M0 0C-2e308 2 3 4 5 6Z"] {
            let error = validate(d).unwrap_err();
            assert!(
                matches!(&error, PathError::NotFinite { .. }),
                "{d} should refuse the non-finite number, got {error:?}"
            );
        }
    }

    #[test]
    fn malformed_numbers_are_refused_naming_the_text() {
        // A dangling exponent reads as the number `1`, then a stray letter.
        assert!(matches!(
            validate("M0 0L10 10 1eZ"),
            Err(PathError::UnsupportedCommand { command: 'e', .. })
        ));
        let error = validate("M0 0L10 10 . Z").unwrap_err();
        assert!(
            matches!(&error, PathError::InvalidNumber { raw, .. } if raw == "."),
            "{error:?}"
        );
    }

    #[test]
    fn a_bare_closepath_is_refused() {
        // There is no pen position yet, so there is nothing to close.
        assert!(matches!(
            validate("Z"),
            Err(PathError::MissingMoveTo { .. })
        ));
        assert!(matches!(
            validate("L10 10Z"),
            Err(PathError::MissingMoveTo { .. })
        ));
    }

    #[test]
    fn arc_flags_must_be_0_or_1() {
        let good = "M0 0A5 5 0 1 1 10 10Z";
        assert_eq!(validate(good), Ok(()));
        let bad = "M0 0A5 5 0 2 1 10 10Z";
        assert!(
            matches!(validate(bad), Err(PathError::InvalidArcFlag { .. })),
            "{bad}"
        );
    }

    #[test]
    fn every_allowed_command_round_trips_through_validation() {
        let cases = [
            "M0 0Z",
            "m0 0Z",
            "M0 0L10 10Z",
            "M0 0l10 10Z",
            "M0 0H10Z",
            "M0 0h10Z",
            "M0 0V10Z",
            "M0 0v10Z",
            "M0 0C2 2 4 4 10 10Z",
            "M0 0c2 2 4 4 10 10Z",
            "M0 0C2 2 4 4 8 8S10 9 12 10Z",
            "M0 0c2 2 4 4 8 8s2 1 4 2Z",
            "M0 0A5 5 0 0 1 10 10Z",
            "M0 0a5 5 0 1 0 10 10Z",
        ];
        for d in cases {
            assert_eq!(validate(d), Ok(()), "{d}");
        }
    }

    #[test]
    fn implicit_repetitions_are_accepted_and_counted() {
        // `M 0 0 10 10 20 20Z` is a moveto plus two implicit linetos.
        assert_eq!(validate("M0 0 10 10 20 20Z"), Ok(()));
        assert_eq!(validate("M0 0 10 10Z"), Ok(()));
        // Repetition of a lineto.
        assert_eq!(validate("M0 0L10 10 20 20Z"), Ok(()));
        // And of an arc, flags and all.
        assert_eq!(validate("M0 0A5 5 0 0 1 10 10 20 20 0 1 1 30 30Z"), Ok(()));
    }

    #[test]
    fn separator_style_is_the_callers_problem() {
        for d in ["M 0 , 0 L 10 , 10 Z", "M0,0L10,10Z", "M\t0\n0\rL10 10Z"] {
            assert_eq!(validate(d), Ok(()), "{d}");
        }
    }
}
