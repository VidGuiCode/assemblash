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

use assemblash_core::session::SessionError;
use assemblash_core::storage::StorageError;
use assemblash_core::workspace::WorkspaceError;
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

impl From<SessionError> for ApiError {
    fn from(error: SessionError) -> Self {
        let message = error.to_string();
        match error {
            SessionError::VersionConflict { expected, actual } => {
                Self::new(StatusCode::CONFLICT, "versionConflict", message)
                    .with_details(json!({ "expected": expected, "actual": actual }))
            }
            SessionError::Locked { pid, .. } => {
                Self::new(StatusCode::CONFLICT, "projectLocked", message)
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
            RenderError::MissingFont { layer, family } => {
                Self::new(StatusCode::UNPROCESSABLE_ENTITY, "missingFont", message)
                    .with_details(json!({ "layer": layer, "family": family }))
            }
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
            _ => Self::new(StatusCode::INTERNAL_SERVER_ERROR, "fontStore", message),
        }
    }
}
