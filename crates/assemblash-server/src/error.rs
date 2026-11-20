//! One error shape for the whole API.
//!
//! FR-12 asks for stable error responses, which means two things a handler
//! must not be allowed to decide for itself: the status code a failure maps
//! to, and the JSON it comes back as. Everything fallible converts into
//! [`ApiError`], and there is exactly one place that turns that into a
//! response.
//!
//! ```json
//! { "error": { "code": "versionConflict",
//!              "message": "document has moved on: expected 3, found 5",
//!              "details": { "expected": 3, "actual": 5 } } }
//! ```
//!
//! The `code` is the part a client should branch on: it is a closed set,
//! and it does not change when a message is reworded.

use assemblash_core::page_sets::PageSetError;
use assemblash_core::session::SessionError;
use assemblash_core::storage::StorageError;
use assemblash_core::workspace::WorkspaceError;
use assemblash_renderer::install::InstallError;
use assemblash_renderer::store::FontStoreError;
use assemblash_renderer::RenderError;
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use serde_json::json;

/// A failure, with the status and machine-readable code it reports as.
#[derive(Debug)]
pub struct ApiError {
    status: StatusCode,
    code: &'static str,
    message: String,
    details: serde_json::Value,
}

impl ApiError {
    /// Builds an error with no structured details.
    pub fn new(status: StatusCode, code: &'static str, message: impl Into<String>) -> Self {
        Self {
            status,
            code,
            message: message.into(),
            details: json!({}),
        }
    }

    /// Attaches structured details a client can act on.
    pub fn with_details(mut self, details: serde_json::Value) -> Self {
        self.details = details;
        self
    }

    /// A malformed request.
    pub fn bad_request(message: impl Into<String>) -> Self {
        Self::new(StatusCode::BAD_REQUEST, "badRequest", message)
    }

    /// The status this error reports as.
    pub fn status(&self) -> StatusCode {
        self.status
    }

    /// The machine-readable code.
    ///
    /// A closed set that does not change when a message is reworded. The MCP
    /// server reports the same codes, so a client that has learned one
    /// transport's vocabulary does not have to learn a second.
    pub fn code(&self) -> &'static str {
        self.code
    }

    /// The human-facing message.
    pub fn message(&self) -> &str {
        &self.message
    }

    /// The structured details, `{}` when there are none.
    pub fn details(&self) -> &serde_json::Value {
        &self.details
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let body = axum::Json(json!({
            "error": {
                "code": self.code,
                "message": self.message,
                "details": self.details,
            }
        }));
        (self.status, body).into_response()
    }
}

/// A JSON body that reports its own rejection in the API's error shape.
///
/// `axum::Json` answers a malformed body with plain text, which would make
/// "the API always answers with the same envelope" false for the most common
/// client mistake there is. This wraps it so a body that does not parse comes
/// back as `badRequest` with the parser's message, like everything else.
#[derive(Debug)]
pub struct ApiJson<T>(pub T);

impl<S, T> axum::extract::FromRequest<S> for ApiJson<T>
where
    T: serde::de::DeserializeOwned,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request(
        request: axum::extract::Request,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        match axum::Json::<T>::from_request(request, state).await {
            Ok(axum::Json(value)) => Ok(Self(value)),
            Err(rejection) => Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "malformedRequest",
                rejection.body_text(),
            )),
        }
    }
}

impl From<WorkspaceError> for ApiError {
    fn from(error: WorkspaceError) -> Self {
        let message = error.to_string();
        match error {
            // A name that is really a path is a client mistake, and one worth
            // naming precisely: it is the shape a sandbox escape takes.
            WorkspaceError::InvalidProjectId { id, reason } => {
                Self::new(StatusCode::BAD_REQUEST, "invalidProjectId", message)
                    .with_details(json!({ "id": id, "reason": reason }))
            }
            WorkspaceError::NoSuchProject { id, .. } => {
                Self::new(StatusCode::NOT_FOUND, "noSuchProject", message)
                    .with_details(json!({ "id": id }))
            }
            WorkspaceError::ProjectExists { id } => {
                Self::new(StatusCode::CONFLICT, "projectExists", message)
                    .with_details(json!({ "id": id }))
            }
            _ => Self::new(StatusCode::INTERNAL_SERVER_ERROR, "workspace", message),
        }
    }
}

impl From<assemblash_core::color_space::ColorSpaceNotSupported> for ApiError {
    fn from(error: assemblash_core::color_space::ColorSpaceNotSupported) -> Self {
        Self::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            assemblash_core::color_space::ColorSpaceNotSupported::CODE,
            error.to_string(),
        )
        .with_details(json!({ "requested": error.requested, "supported": ["srgb"] }))
    }
}

impl From<assemblash_export::ExportFormatNotSupported> for ApiError {
    fn from(error: assemblash_export::ExportFormatNotSupported) -> Self {
        let supported: Vec<&str> = assemblash_export::ExportFormat::ALL
            .iter()
            .map(|format| format.as_str())
            .collect();
        Self::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            assemblash_export::ExportFormatNotSupported::CODE,
            error.to_string(),
        )
        .with_details(json!({ "requested": error.requested, "supported": supported }))
    }
}

impl From<assemblash_export::QualityError> for ApiError {
    fn from(error: assemblash_export::QualityError) -> Self {
        use assemblash_export::QualityError;
        let quality = match &error {
            QualityError::OutOfRange { quality }
            | QualityError::LossyWebpNotSupported { quality }
            | QualityError::NotApplicable { quality, .. } => *quality,
        };
        Self::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            error.code(),
            error.to_string(),
        )
        .with_details(json!({ "quality": quality }))
    }
}

impl From<assemblash_export::EncodeError> for ApiError {
    fn from(error: assemblash_export::EncodeError) -> Self {
        Self::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            assemblash_export::EncodeError::CODE,
            error.to_string(),
        )
    }
}

impl From<PageSetError> for ApiError {
    fn from(error: PageSetError) -> Self {
        let message = error.to_string();
        let code = error.code();
        match error {
            PageSetError::InvalidName { name, reason } => {
                Self::new(StatusCode::BAD_REQUEST, code, message)
                    .with_details(json!({ "name": name, "reason": reason }))
            }
            PageSetError::NotFound { name } => Self::new(StatusCode::NOT_FOUND, code, message)
                .with_details(json!({ "name": name })),
            PageSetError::Malformed { set, reason } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, code, message)
                    .with_details(json!({ "set": set, "reason": reason }))
            }
            PageSetError::MissingMembers { set, missing } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, code, message)
                    .with_details(json!({ "set": set, "missing": missing }))
            }
            PageSetError::Loop { chain } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, code, message)
                    .with_details(json!({ "chain": chain }))
            }
            PageSetError::TooDeep { chain, limit } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, code, message)
                    .with_details(json!({ "chain": chain, "limit": limit }))
            }
            PageSetError::DuplicatePage {
                set,
                project,
                first,
                second,
            } => Self::new(StatusCode::UNPROCESSABLE_ENTITY, code, message).with_details(
                json!({ "set": set, "project": project, "first": first, "second": second }),
            ),
            _ => Self::new(StatusCode::INTERNAL_SERVER_ERROR, code, message),
        }
    }
}

impl From<SessionError> for ApiError {
    fn from(error: SessionError) -> Self {
        let message = error.to_string();
        match error {
            SessionError::VersionConflict { expected, actual } => {
                Self::new(StatusCode::CONFLICT, "versionConflict", message)
                    .with_details(json!({ "expected": expected, "actual": actual }))
            }
            // Not the core text: over HTTP and MCP the reader is often an
            // agent, and the one thing it must never do is delete the lock
            // file while the editor that holds it is alive.
            SessionError::Locked { pid, .. } => {
                Self::new(StatusCode::CONFLICT, "projectLocked", locked_message(pid))
                    .with_details(json!({ "pid": pid }))
            }
            // A refused operation is a well-formed request the engine declined
            // — 422, not 400: nothing about the syntax was wrong.
            SessionError::Operation(_) => Self::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "operationRefused",
                message,
            ),
            SessionError::Storage(storage) => Self::from(storage),
            SessionError::History(_) => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "historyRefused", message)
            }
            _ => Self::new(StatusCode::INTERNAL_SERVER_ERROR, "session", message),
        }
    }
}

/// What `projectLocked` says on the HTTP and MCP transports.
///
/// No path and no advice to remove anything: the usual holder is the person's
/// own editor, and the fix is to use that editor's endpoint, not to break its
/// lock.
fn locked_message(pid: u32) -> String {
    format!(
        "the project is open in the Assemblash editor or another agent (pid {pid}); \
         close it there, or connect to the running editor"
    )
}

impl From<StorageError> for ApiError {
    fn from(error: StorageError) -> Self {
        let message = error.to_string();
        match error {
            StorageError::NotAProject { .. } => {
                Self::new(StatusCode::NOT_FOUND, "noSuchProject", message)
            }
            StorageError::InvalidDocument { .. } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "invalidDocument", message)
            }
            StorageError::UnsafeSvg { .. } | StorageError::NotText { .. } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "unsafeAsset", message)
            }
            StorageError::UnknownAssetType { .. } => {
                Self::new(StatusCode::BAD_REQUEST, "unknownAssetType", message)
            }
            StorageError::AssetHashMismatch { .. } | StorageError::MissingAssetFile { .. } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "assetChanged", message)
            }
            _ => Self::new(StatusCode::INTERNAL_SERVER_ERROR, "storage", message),
        }
    }
}

impl From<RenderError> for ApiError {
    fn from(error: RenderError) -> Self {
        let message = error.to_string();
        match error {
            RenderError::MissingFont {
                layer,
                family,
                weight,
                style,
            } => Self::new(StatusCode::UNPROCESSABLE_ENTITY, "missingFont", message).with_details(
                json!({ "layer": layer, "family": family, "weight": weight, "style": style }),
            ),
            RenderError::NotTextLayer { layer } => {
                Self::new(StatusCode::BAD_REQUEST, "notTextLayer", message)
                    .with_details(json!({"layer":layer}))
            }
            RenderError::InvalidTextWidth { layer, width } => {
                Self::new(StatusCode::BAD_REQUEST, "invalidTextWidth", message)
                    .with_details(json!({"layer":layer,"width":width}))
            }
            RenderError::TextLayout { layer, source } => {
                use assemblash_renderer::{TextFailureKind, TextLayoutError};
                let (code, details) = match source {
                    TextLayoutError::InvalidRuns(error) => (
                        "unsupportedTextRuns",
                        json!({"layer":layer,"runIndex":error.run_index,
                        "characterIndex":error.character_index,"byteIndex":error.byte_index,"field":error.field,"reason":error.reason}),
                    ),
                    TextLayoutError::Unsupported {
                        kind,
                        run_index,
                        character_index,
                        byte_index,
                        reason,
                    } => {
                        let code = match kind {
                            TextFailureKind::FontDataUnavailable => "textFontDataUnavailable",
                            TextFailureKind::InvalidFontData => "invalidTextFontData",
                            TextFailureKind::MissingGlyph => "missingTextGlyph",
                            TextFailureKind::IncompatibleCluster => "incompatibleTextCluster",
                            TextFailureKind::InvalidSpacing => "invalidTextSpacing",
                            TextFailureKind::InvalidGeometry => "invalidTextGeometry",
                        };
                        (
                            code,
                            json!({"layer":layer,"runIndex":run_index,"characterIndex":character_index,"byteIndex":byte_index,"reason":reason}),
                        )
                    }
                    _ => ("textLayoutFailed", json!({"layer":layer})),
                };
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, code, message).with_details(details)
            }
            RenderError::TextFilterBounds { layer, reason } => Self::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "textFilterBounds",
                message,
            )
            .with_details(json!({"layer":layer,"reason":reason})),
            RenderError::InvalidDocument(_) => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "invalidDocument", message)
            }
            RenderError::InvalidScale(_) => Self::bad_request(message),
            _ => Self::new(StatusCode::UNPROCESSABLE_ENTITY, "renderFailed", message),
        }
    }
}

impl From<FontStoreError> for ApiError {
    fn from(error: FontStoreError) -> Self {
        let message = error.to_string();
        match error {
            FontStoreError::UnknownFamily { family, .. } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "missingFont", message)
                    .with_details(json!({ "family": family }))
            }
            // Bytes that are not a font, offered under a name that said they
            // were: a well-formed request the store declined — 422, the same
            // reading `operationRefused` gets.
            FontStoreError::NotAFont { path } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "invalidFont", message)
                    .with_details(json!({ "file": path.to_string_lossy() }))
            }
            FontStoreError::Undecompressable { path, format } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "invalidFont", message)
                    .with_details(json!({ "file": path.to_string_lossy(), "format": format }))
            }
            _ => Self::new(StatusCode::INTERNAL_SERVER_ERROR, "fontStore", message),
        }
    }
}

impl From<InstallError> for ApiError {
    fn from(error: InstallError) -> Self {
        let message = error.to_string();
        match error {
            InstallError::UnknownFamily { family } => {
                Self::new(StatusCode::NOT_FOUND, "unknownFontFamily", message)
                    .with_details(json!({ "family": family }))
            }
            InstallError::UnknownPack { pack } => {
                Self::new(StatusCode::NOT_FOUND, "unknownFontPack", message)
                    .with_details(json!({ "pack": pack }))
            }
            // 502, not 500: the request was fine and this server is fine —
            // what failed is the upstream the download came from, and a file
            // that is not the one the manifest pins is exactly that failure
            // seen from the other end.
            InstallError::Fetch { url, .. } => {
                Self::new(StatusCode::BAD_GATEWAY, "fontInstallFailed", message)
                    .with_details(json!({ "url": url }))
            }
            InstallError::HashMismatch {
                family,
                expected,
                actual,
            } => Self::new(StatusCode::BAD_GATEWAY, "fontInstallFailed", message)
                .with_details(json!({ "family": family, "expected": expected, "actual": actual })),
            InstallError::Store(store) => Self::from(store),
            // The manifest is compiled in, so this is a broken build rather
            // than anything the caller did.
            _ => Self::new(StatusCode::INTERNAL_SERVER_ERROR, "fontManifest", message),
        }
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used)]

    use super::*;
    use assemblash_core::ids::LayerId;

    #[test]
    fn styled_layout_errors_keep_codes_and_original_indices() {
        use assemblash_renderer::{TextFailureKind, TextLayoutError};
        let error = ApiError::from(RenderError::TextLayout {
            layer: LayerId::new("layer_text"),
            source: TextLayoutError::Unsupported {
                kind: TextFailureKind::IncompatibleCluster,
                run_index: 2,
                character_index: 4,
                byte_index: 7,
                reason: "incompatible effective styles".into(),
            },
        });
        assert_eq!(error.code(), "incompatibleTextCluster");
        assert_eq!(error.details()["runIndex"], 2);
        assert_eq!(error.details()["characterIndex"], 4);
        assert_eq!(error.details()["byteIndex"], 7);
        assert_eq!(error.details()["layer"], "layer_text");
        let error = ApiError::from(RenderError::TextFilterBounds {
            layer: LayerId::new("layer_parent"),
            reason: "an in-memory image cannot provide filter bounds".into(),
        });
        assert_eq!(error.code(), "textFilterBounds");
        assert_eq!(error.details()["layer"], "layer_parent");
        assert_eq!(
            error.details()["reason"],
            "an in-memory image cannot provide filter bounds"
        );
    }

    /// Agents act on error text. A `projectLocked` that told them to delete
    /// the lock file would let one break the editor's lock while it is alive.
    #[test]
    fn a_locked_project_never_advises_deleting_the_lock() {
        let error = ApiError::from(SessionError::Locked {
            pid: 4242,
            path: std::path::PathBuf::from("/w/projects/demo/.assemblash-lock"),
        });
        assert_eq!(error.code(), "projectLocked");
        assert_eq!(error.status(), StatusCode::CONFLICT);
        assert_eq!(error.details()["pid"], 4242);
        let message = error.message();
        for forbidden in [".assemblash-lock", "remove", "delete", "unlock"] {
            assert!(!message.contains(forbidden), "{forbidden:?} in {message}");
        }
        assert!(message.contains("editor"), "{message}");

        // The core text, which the command line prints, names no file either.
        let core = SessionError::Locked {
            pid: 4242,
            path: std::path::PathBuf::from("/w/projects/demo/.assemblash-lock"),
        }
        .to_string();
        assert!(!core.contains(".assemblash-lock"), "{core}");
        assert!(!core.contains("remove"), "{core}");
    }

    /// A geometry this build cannot draw reports like an effect it cannot
    /// draw: the document is fine, the request was fine, and the render is
    /// the thing that could not be done.
    #[test]
    fn a_shape_this_build_cannot_draw_reports_like_an_effect_it_cannot_draw() {
        let effect = ApiError::from(RenderError::UnsupportedEffect {
            layer: LayerId::new("layer_01J"),
            effect: "kaleidoscope".to_owned(),
        });
        let shape = ApiError::from(RenderError::UnsupportedShape {
            layer: LayerId::new("layer_01J"),
            kind: "star".to_owned(),
        });

        assert_eq!(shape.status(), StatusCode::UNPROCESSABLE_ENTITY);
        assert_eq!(shape.status(), effect.status());
        assert_eq!(shape.code(), "renderFailed");
        assert_eq!(shape.code(), effect.code());
        assert!(
            shape.message().contains("star"),
            "the message must name the kind: {}",
            shape.message()
        );
    }
}
