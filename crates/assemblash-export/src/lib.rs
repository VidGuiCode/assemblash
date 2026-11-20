//! Deterministic export encoders: raster PDF, JPEG and lossless WebP.
//!
//! Every encoder in this crate takes plain pixel buffers: straight-alpha RGBA,
//! eight bits for each channel, row by row from the top. The renderer makes
//! these pixels. This crate does not know about documents.
//!
//! Equal input gives equal bytes on every release target. For that reason:
//!
//! * the PDF writer writes no date, no time and no version number;
//! * the JPEG encoder gets its pixels flattened onto white with integer
//!   arithmetic only;
//! * WebP is lossless only. Lossy WebP bytes are not the same on all
//!   targets, so a request for lossy WebP is refused.

mod format;
mod raster;

pub mod pdf;

pub use format::{
    resolve_quality, EncodeSettings, ExportFormat, ExportFormatNotSupported, QualityError,
    DEFAULT_JPEG_QUALITY,
};
pub use raster::{encode_jpeg, encode_webp_lossless, flatten_onto_white, EncodeError};
