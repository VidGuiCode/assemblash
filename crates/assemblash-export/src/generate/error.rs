//! Why a generator refused a spec.

/// Why a generator refused a spec. Nothing is written when it refuses.
#[derive(Debug, Clone, PartialEq, thiserror::Error)]
#[non_exhaustive]
pub enum GenerateError {
    /// A spec value is outside what the generator accepts.
    #[error("{field}: {reason}")]
    InvalidSpec {
        /// The spec field, as written in JSON, for example `series[1].values`.
        field: String,
        /// What is wrong with it.
        reason: String,
    },

    /// A colour is not `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa`.
    #[error("{field}: colour {value:?} is not #rgb, #rgba, #rrggbb or #rrggbbaa")]
    InvalidColor {
        /// The spec field.
        field: String,
        /// The value that was given.
        value: String,
    },

    /// The face has no glyph for a character of a label.
    #[error(
        "the font {family:?} has no glyph for {character:?} (U+{code:04X}) in {field}; \
         use a font that covers it"
    )]
    MissingGlyph {
        /// The family the face belongs to.
        family: String,
        /// The character.
        character: char,
        /// Its code point.
        code: u32,
        /// The spec field the label came from.
        field: String,
    },

    /// The face bytes could not be read as a font.
    #[error("the font {family:?} cannot be read: {reason}")]
    InvalidFont {
        /// The family.
        family: String,
        /// What the font parser said.
        reason: String,
    },

    /// A spec with labels was given no face.
    #[error("this spec has labels, so it needs a font face")]
    NoFace,

    /// The QR data does not fit in the largest QR code at the chosen error
    /// correction level.
    #[error(
        "the QR data is {bytes} bytes, which does not fit in a QR code at error \
         correction level {level}; shorten the data or use a lower level"
    )]
    QrDataTooLong {
        /// The data length in UTF-8 bytes.
        bytes: usize,
        /// The level: L, M, Q or H.
        level: &'static str,
    },

    /// A CSV file could not be read.
    #[error("CSV line {line}: {reason}")]
    InvalidCsv {
        /// The 1-based line the problem starts on.
        line: usize,
        /// What is wrong.
        reason: String,
    },
}

impl GenerateError {
    /// Stable machine-readable code.
    pub fn code(&self) -> &'static str {
        match self {
            Self::InvalidSpec { .. } => "invalidGeneratorSpec",
            Self::InvalidColor { .. } => "invalidGeneratorSpec",
            Self::MissingGlyph { .. } => "generatorMissingGlyph",
            Self::InvalidFont { .. } => "generatorInvalidFont",
            Self::NoFace => "generatorNeedsFont",
            Self::QrDataTooLong { .. } => "qrDataTooLong",
            Self::InvalidCsv { .. } => "invalidCsv",
        }
    }

    pub(crate) fn spec(field: impl Into<String>, reason: impl Into<String>) -> Self {
        Self::InvalidSpec {
            field: field.into(),
            reason: reason.into(),
        }
    }
}
