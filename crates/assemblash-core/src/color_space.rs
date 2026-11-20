//! The colour space of an export.
//!
//! Every export is sRGB. Professional print colour management, CMYK
//! included, is out of scope for this project. An export request may name a
//! colour space so that a caller can say what it expects. A request for
//! anything other than sRGB is refused with a typed error. It is never
//! converted without a word.

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// The colour space an export writes. sRGB is the only one.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum ColorSpace {
    /// sRGB, the colour space of every export.
    #[default]
    Srgb,
}

/// A request for a colour space this build does not write.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error(
    "colour space {requested:?} is not supported: exports are sRGB only; \
     professional print colour management, CMYK included, is out of scope"
)]
pub struct ColorSpaceNotSupported {
    /// The colour space that was asked for, as written.
    pub requested: String,
}

impl ColorSpaceNotSupported {
    /// Stable machine-readable code.
    pub const CODE: &'static str = "colorSpaceNotSupported";
}

impl ColorSpace {
    /// The name of this colour space in a request.
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Srgb => "srgb",
        }
    }

    /// Reads a requested colour space. Case does not matter.
    ///
    /// `srgb` is accepted. `cmyk` and every other value is refused.
    pub fn parse(requested: &str) -> Result<Self, ColorSpaceNotSupported> {
        if requested.trim().eq_ignore_ascii_case("srgb") {
            Ok(Self::Srgb)
        } else {
            Err(ColorSpaceNotSupported {
                requested: requested.to_owned(),
            })
        }
    }

    /// Reads an optional request: no value is sRGB.
    pub fn from_request(requested: Option<&str>) -> Result<Self, ColorSpaceNotSupported> {
        requested.map_or(Ok(Self::Srgb), Self::parse)
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;

    #[test]
    fn srgb_is_accepted_in_any_case_and_is_the_default() {
        for value in ["srgb", "sRGB", " SRGB "] {
            assert_eq!(ColorSpace::parse(value).unwrap(), ColorSpace::Srgb);
        }
        assert_eq!(ColorSpace::from_request(None).unwrap(), ColorSpace::Srgb);
    }

    #[test]
    fn cmyk_is_refused_with_a_message_that_says_why() {
        for value in ["cmyk", "CMYK", "fogra39"] {
            let error = ColorSpace::parse(value).unwrap_err();
            let message = error.to_string();
            assert!(message.contains("sRGB only"), "{message}");
            assert!(message.contains("out of scope"), "{message}");
            assert_eq!(error.requested, value);
        }
    }
}
