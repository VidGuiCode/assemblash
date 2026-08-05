//! Turning a project's asset files into hrefs a render can use.
//!
//! Assets are embedded as `data:` URIs rather than referenced by path. The
//! rendered SVG is then self-contained wherever it is written, and
//! rasterization needs no filesystem access of its own — `doc_to_svg` stays a
//! function of its inputs.
//!
//! This is the one place that reads a project's asset files for a render. It
//! lives here rather than in a transport so the command line, the HTTP API,
//! and later the MCP server cannot each grow a slightly different version of
//! it.

use std::path::Path;

use crate::svg::AssetHrefs;
use assemblash_core::storage::{self, StorageError};
use assemblash_core::Document;

/// Reads every asset of a document and returns one `data:` URI per asset.
pub fn data_uris(document: &Document, project_dir: &Path) -> Result<AssetHrefs, StorageError> {
    let mut hrefs = AssetHrefs::new();
    for asset in &document.assets {
        let path = storage::asset_path(project_dir, asset);
        let bytes = std::fs::read(&path).map_err(|source| StorageError::Io {
            operation: "reading",
            path: path.clone(),
            source,
        })?;
        hrefs.insert(
            asset.id.clone(),
            format!("data:{};base64,{}", asset.media_type, base64(&bytes)),
        );
    }
    Ok(hrefs)
}

const ALPHABET: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/// Standard base64 with padding.
///
/// Hand-rolled because this is the only place the binary needs it, and a
/// dependency is a dependency: every crate added to a single-binary product
/// has to be licence-audited and shipped (R8).
fn base64(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let b0 = u32::from(chunk[0]);
        let b1 = chunk.get(1).copied().map_or(0, u32::from);
        let b2 = chunk.get(2).copied().map_or(0, u32::from);
        let triple = (b0 << 16) | (b1 << 8) | b2;

        out.push(ALPHABET[(triple >> 18) as usize & 0x3F] as char);
        out.push(ALPHABET[(triple >> 12) as usize & 0x3F] as char);
        out.push(if chunk.len() > 1 {
            ALPHABET[(triple >> 6) as usize & 0x3F] as char
        } else {
            '='
        });
        out.push(if chunk.len() > 2 {
            ALPHABET[triple as usize & 0x3F] as char
        } else {
            '='
        });
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base64_matches_the_standard_vectors() {
        // RFC 4648 section 10.
        assert_eq!(base64(b""), "");
        assert_eq!(base64(b"f"), "Zg==");
        assert_eq!(base64(b"fo"), "Zm8=");
        assert_eq!(base64(b"foo"), "Zm9v");
        assert_eq!(base64(b"foob"), "Zm9vYg==");
        assert_eq!(base64(b"fooba"), "Zm9vYmE=");
        assert_eq!(base64(b"foobar"), "Zm9vYmFy");
    }

    #[test]
    fn all_byte_values_encode() {
        let bytes: Vec<u8> = (0..=255).collect();
        let encoded = base64(&bytes);
        assert_eq!(encoded.len(), 344);
        assert!(encoded.starts_with("AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8g"));
    }
}
