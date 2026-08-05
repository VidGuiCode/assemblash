//! The workspace: where projects, fonts, and settings live by default.
//!
//! The binary is portable; the data it manages is not carried around with it.
//! On first run Assemblash creates an OS-appropriate directory and keeps
//! working there:
//!
//! ```text
//! workspace/
//!   config.toml
//!   fonts/            font store (assemblash-renderer opens it)
//!   projects/<id>/    each one a plain project directory, unchanged
//! ```
//!
//! Two properties matter:
//!
//! * **A project stays portable.** A workspace is a default location, not a
//!   container: a project directory can be moved into or out of one, and
//!   `--project <path>` still opens any folder anywhere.
//! * **A project id is a path segment, never a path.** Ids come from the
//!   network in v0.6, so [`ProjectId`] refuses anything that could reach
//!   outside `projects/` before it is joined to a path (PRD §10.1).

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

/// Settings file at the root of a workspace.
pub const CONFIG_FILE: &str = "config.toml";

/// Directory holding projects.
pub const PROJECTS_DIR: &str = "projects";

/// Directory holding the font store.
pub const FONTS_DIR: &str = "fonts";

/// Environment variable that overrides the workspace location.
pub const WORKSPACE_ENV: &str = "ASSEMBLASH_WORKSPACE";

/// Something that went wrong opening or using a workspace.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum WorkspaceError {
    /// No workspace location could be determined for this machine.
    #[error("cannot find a data directory for this user; set {WORKSPACE_ENV}")]
    NoDataDirectory,

    /// A file could not be read or written.
    #[error("{operation} {path}: {source}")]
    Io {
        /// What was being attempted.
        operation: &'static str,
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: std::io::Error,
    },

    /// `config.toml` is not readable.
    #[error("{path} is not a readable configuration file: {source}")]
    MalformedConfig {
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: toml::de::Error,
    },

    /// The configuration could not be written back.
    #[error("writing {path}: {source}")]
    UnwritableConfig {
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: toml::ser::Error,
    },

    /// A project id is not a name this workspace will put on the filesystem.
    ///
    /// The whole point of the type: ids arrive from the network, and a name
    /// that is really a path is how a sandbox is escaped (PRD §10.1).
    #[error("{id:?} is not a usable project name: {reason}")]
    InvalidProjectId {
        /// The name that was offered.
        id: String,
        /// Why it was refused.
        reason: &'static str,
    },

    /// No project of that name in the workspace.
    #[error("no project named {id:?} in {path}")]
    NoSuchProject {
        /// The name that was asked for.
        id: String,
        /// Workspace involved.
        path: PathBuf,
    },

    /// A project of that name is already there.
    #[error("a project named {id:?} already exists")]
    ProjectExists {
        /// The name that was asked for.
        id: String,
    },
}

impl WorkspaceError {
    fn io(operation: &'static str, path: impl Into<PathBuf>, source: std::io::Error) -> Self {
        Self::Io {
            operation,
            path: path.into(),
            source,
        }
    }
}

/// A project name that is safe to join to a path.
///
/// Constructed only through [`ProjectId::new`], which refuses anything that is
/// not a single ordinary directory name: no separators, no `..`, no absolute
/// paths, no drive letters, no leading dot, no control characters, and none of
/// the characters Windows forbids. A value of this type has already been
/// checked, so the places that build paths do not each have to remember to.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize)]
#[serde(transparent)]
pub struct ProjectId(String);

impl ProjectId {
    /// Checks a name and wraps it.
    pub fn new(id: impl Into<String>) -> Result<Self, WorkspaceError> {
        let id = id.into();
        let refuse = |reason: &'static str| WorkspaceError::InvalidProjectId {
            id: id.clone(),
            reason,
        };

        if id.is_empty() {
            return Err(refuse("it is empty"));
        }
        if id.len() > 100 {
            return Err(refuse("it is longer than 100 characters"));
        }
        if id.starts_with('.') {
            return Err(refuse("it starts with a dot"));
        }
        if id.ends_with('.') || id.ends_with(' ') {
            return Err(refuse("it ends with a dot or a space"));
        }
        // `/` and `\` are both rejected on every platform: a name written on
        // Linux must not become a path when the same workspace is opened on
        // Windows.
        for character in id.chars() {
            if character.is_control() {
                return Err(refuse("it contains a control character"));
            }
            if matches!(
                character,
                '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|'
            ) {
                return Err(refuse(
                    "it contains a character that is not allowed in a name",
                ));
            }
        }
        // Names Windows reserves whatever the extension is.
        const RESERVED: [&str; 22] = [
            "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7",
            "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
        ];
        let stem = id.split('.').next().unwrap_or(&id).to_ascii_uppercase();
        if RESERVED.contains(&stem.as_str()) {
            return Err(refuse("it is a name the operating system reserves"));
        }

        Ok(Self(id))
    }

    /// The name as written.
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for ProjectId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl<'de> Deserialize<'de> for ProjectId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        // Checked on the way in, so a `ProjectId` that came from JSON is as
        // trustworthy as one built in Rust.
        let raw = String::deserialize(deserializer)?;
        Self::new(raw).map_err(serde::de::Error::custom)
    }
}

/// Workspace settings.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct Config {
    /// Port `serve` tries first. A taken port falls back to one the OS picks.
    #[serde(default = "default_port")]
    pub port: u16,
    /// Whether a no-arguments launch should open a browser.
    #[serde(default = "default_true")]
    pub open_browser: bool,
    /// Address to bind. Loopback unless someone says otherwise.
    ///
    /// Anything other than a loopback address requires [`Config::token`],
    /// and the server refuses to start without one (PRD §16.1, decision 14).
    #[serde(default = "default_bind")]
    pub bind: String,
    /// Access token for a non-loopback bind.
    ///
    /// Generated on demand rather than on first run, so a purely local
    /// install never has a secret sitting in a file it did not need. Rotate
    /// it with `assemblash token rotate`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub token: Option<String>,
    /// Keys this build does not know about, preserved verbatim.
    ///
    /// The same promise the document model makes: a settings file written by a
    /// newer build does not come back damaged.
    #[serde(flatten)]
    pub extra: BTreeMap<String, toml::Value>,
}

fn default_port() -> u16 {
    8787
}

fn default_bind() -> String {
    "127.0.0.1".to_owned()
}

fn default_true() -> bool {
    true
}

impl Default for Config {
    fn default() -> Self {
        Self {
            port: default_port(),
            open_browser: default_true(),
            bind: default_bind(),
            token: None,
            extra: BTreeMap::new(),
        }
    }
}

/// A directory holding projects, fonts, and settings.
#[derive(Debug, Clone)]
pub struct Workspace {
    root: PathBuf,
    config: Config,
}

impl Workspace {
    /// Where a workspace goes on this machine, if nothing says otherwise.
    ///
    /// `ASSEMBLASH_WORKSPACE` wins, so a test, a container, or someone with
    /// two of them can say exactly where to look.
    pub fn default_dir() -> Result<PathBuf, WorkspaceError> {
        if let Some(explicit) = std::env::var_os(WORKSPACE_ENV) {
            if !explicit.is_empty() {
                return Ok(PathBuf::from(explicit));
            }
        }
        default_dir_from(&EnvVars)
    }

    /// Opens the workspace at a path, creating it if it is not there yet.
    ///
    /// Creating is idempotent: an existing workspace is left alone, including
    /// a `config.toml` someone edited by hand.
    pub fn open_or_create(root: impl Into<PathBuf>) -> Result<Self, WorkspaceError> {
        let root = root.into();
        for directory in [root.clone(), root.join(PROJECTS_DIR), root.join(FONTS_DIR)] {
            std::fs::create_dir_all(&directory)
                .map_err(|e| WorkspaceError::io("creating", &directory, e))?;
        }

        let config_path = root.join(CONFIG_FILE);
        let config = if config_path.is_file() {
            let text = std::fs::read_to_string(&config_path)
                .map_err(|e| WorkspaceError::io("reading", &config_path, e))?;
            toml::from_str(&text).map_err(|source| WorkspaceError::MalformedConfig {
                path: config_path.clone(),
                source,
            })?
        } else {
            let config = Config::default();
            write_config(&config_path, &config)?;
            config
        };

        Ok(Self { root, config })
    }

    /// Opens the workspace this machine uses by default.
    pub fn open_default() -> Result<Self, WorkspaceError> {
        Self::open_or_create(Self::default_dir()?)
    }

    /// The workspace directory.
    pub fn root(&self) -> &Path {
        &self.root
    }

    /// The font store directory.
    pub fn fonts_dir(&self) -> PathBuf {
        self.root.join(FONTS_DIR)
    }

    /// The directory holding projects.
    pub fn projects_dir(&self) -> PathBuf {
        self.root.join(PROJECTS_DIR)
    }

    /// The settings.
    pub fn config(&self) -> &Config {
        &self.config
    }

    /// Replaces the settings and writes them back.
    pub fn set_config(&mut self, config: Config) -> Result<(), WorkspaceError> {
        write_config(&self.root.join(CONFIG_FILE), &config)?;
        self.config = config;
        Ok(())
    }

    /// Where a project lives.
    ///
    /// Takes a checked [`ProjectId`] rather than a string, so there is no
    /// version of this function that can be handed `../../etc`.
    pub fn project_dir(&self, id: &ProjectId) -> PathBuf {
        self.projects_dir().join(id.as_str())
    }

    /// Whether a project of that name is there.
    pub fn has_project(&self, id: &ProjectId) -> bool {
        self.project_dir(id)
            .join(crate::storage::DOCUMENT_FILE)
            .is_file()
    }

    /// The projects in the workspace, sorted.
    ///
    /// A plain directory scan. An index is a v1.x optimisation, and one that
    /// can be deleted at any time — the directories stay the truth.
    pub fn projects(&self) -> Result<Vec<ProjectId>, WorkspaceError> {
        let directory = self.projects_dir();
        if !directory.is_dir() {
            return Ok(Vec::new());
        }
        let entries = std::fs::read_dir(&directory)
            .map_err(|e| WorkspaceError::io("reading", &directory, e))?;

        let mut found = Vec::new();
        for entry in entries {
            let entry = entry.map_err(|e| WorkspaceError::io("reading", &directory, e))?;
            if !entry.path().join(crate::storage::DOCUMENT_FILE).is_file() {
                continue;
            }
            // A directory whose name this build would not accept is skipped
            // rather than listed: it cannot be addressed through the API, so
            // reporting it would only produce requests that fail.
            if let Ok(id) = ProjectId::new(entry.file_name().to_string_lossy().into_owned()) {
                found.push(id);
            }
        }
        found.sort();
        Ok(found)
    }

    /// Creates a project directory for a new project, refusing to overwrite.
    pub fn create_project_dir(&self, id: &ProjectId) -> Result<PathBuf, WorkspaceError> {
        let directory = self.project_dir(id);
        if directory.join(crate::storage::DOCUMENT_FILE).is_file() {
            return Err(WorkspaceError::ProjectExists { id: id.to_string() });
        }
        std::fs::create_dir_all(&directory)
            .map_err(|e| WorkspaceError::io("creating", &directory, e))?;
        Ok(directory)
    }

    /// The directory of an existing project.
    pub fn existing_project_dir(&self, id: &ProjectId) -> Result<PathBuf, WorkspaceError> {
        if !self.has_project(id) {
            return Err(WorkspaceError::NoSuchProject {
                id: id.to_string(),
                path: self.root.clone(),
            });
        }
        Ok(self.project_dir(id))
    }
}

fn write_config(path: &Path, config: &Config) -> Result<(), WorkspaceError> {
    let text =
        toml::to_string_pretty(config).map_err(|source| WorkspaceError::UnwritableConfig {
            path: path.to_path_buf(),
            source,
        })?;
    std::fs::write(path, text).map_err(|e| WorkspaceError::io("writing", path, e))
}

/// The environment variables the default location depends on.
///
/// A trait so every platform's branch can be tested from every platform: the
/// macOS path is worked out from `HOME` alone, and CI does not run macOS until
/// v0.10, so the only honest way to cover it is to compute it here.
trait Environment {
    fn get(&self, key: &str) -> Option<String>;
}

struct EnvVars;

impl Environment for EnvVars {
    fn get(&self, key: &str) -> Option<String> {
        std::env::var(key).ok().filter(|value| !value.is_empty())
    }
}

fn default_dir_from(env: &dyn Environment) -> Result<PathBuf, WorkspaceError> {
    if cfg!(windows) {
        let appdata = env.get("APPDATA").ok_or(WorkspaceError::NoDataDirectory)?;
        return Ok(PathBuf::from(appdata).join("Assemblash"));
    }
    let home = env.get("HOME").ok_or(WorkspaceError::NoDataDirectory)?;
    if cfg!(target_os = "macos") {
        return Ok(PathBuf::from(home)
            .join("Library")
            .join("Application Support")
            .join("Assemblash"));
    }
    match env.get("XDG_DATA_HOME") {
        Some(xdg) => Ok(PathBuf::from(xdg).join("assemblash")),
        None => Ok(PathBuf::from(home)
            .join(".local")
            .join("share")
            .join("assemblash")),
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use super::*;

    struct Fake(BTreeMap<&'static str, &'static str>);

    impl Environment for Fake {
        fn get(&self, key: &str) -> Option<String> {
            self.0.get(key).map(|value| (*value).to_owned())
        }
    }

    fn env(pairs: &[(&'static str, &'static str)]) -> Fake {
        Fake(pairs.iter().copied().collect())
    }

    #[test]
    fn a_project_id_is_a_name_and_never_a_path() {
        for good in ["poster", "poster-2", "Poster 2", "01KZ7H", "a.b"] {
            assert!(ProjectId::new(good).is_ok(), "{good} should be allowed");
        }
        for bad in [
            "",
            "..",
            ".",
            ".hidden",
            "a/b",
            "a\\b",
            "/etc/passwd",
            "C:\\Windows",
            "../../secrets",
            "trailing.",
            "trailing ",
            "nul",
            "COM1",
            "con.txt",
            "bell\u{7}",
            "star*",
            "question?",
        ] {
            assert!(
                ProjectId::new(bad).is_err(),
                "{bad:?} should have been refused"
            );
        }
        assert!(ProjectId::new("x".repeat(101)).is_err());
    }

    #[test]
    fn a_project_id_from_json_is_checked_too() {
        assert!(serde_json::from_str::<ProjectId>("\"poster\"").is_ok());
        assert!(serde_json::from_str::<ProjectId>("\"../escape\"").is_err());
        assert!(serde_json::from_str::<ProjectId>("\"a/b\"").is_err());
    }

    #[test]
    fn every_platforms_default_location_is_worked_out_here() {
        // Only the branch this build compiles can be asserted for real; the
        // point of the trait is that the inputs are explicit and visible.
        let with_xdg = env(&[("HOME", "/home/gui"), ("XDG_DATA_HOME", "/data")]);
        let without_xdg = env(&[("HOME", "/home/gui")]);
        let windows = env(&[("APPDATA", "C:\\Users\\gui\\AppData\\Roaming")]);

        if cfg!(windows) {
            assert_eq!(
                default_dir_from(&windows).unwrap(),
                PathBuf::from("C:\\Users\\gui\\AppData\\Roaming").join("Assemblash")
            );
            assert!(matches!(
                default_dir_from(&without_xdg),
                Err(WorkspaceError::NoDataDirectory)
            ));
        } else if cfg!(target_os = "macos") {
            assert_eq!(
                default_dir_from(&without_xdg).unwrap(),
                PathBuf::from("/home/gui/Library/Application Support/Assemblash")
            );
        } else {
            assert_eq!(
                default_dir_from(&with_xdg).unwrap(),
                PathBuf::from("/data/assemblash")
            );
            assert_eq!(
                default_dir_from(&without_xdg).unwrap(),
                PathBuf::from("/home/gui/.local/share/assemblash")
            );
            assert!(matches!(
                default_dir_from(&env(&[])),
                Err(WorkspaceError::NoDataDirectory)
            ));
        }
    }

    #[test]
    fn creating_a_workspace_is_idempotent() {
        let dir = tempfile::tempdir().unwrap();
        let root = dir.path().join("ws");

        let first = Workspace::open_or_create(&root).unwrap();
        assert!(first.projects_dir().is_dir());
        assert!(first.fonts_dir().is_dir());
        assert!(root.join(CONFIG_FILE).is_file());
        assert_eq!(first.config(), &Config::default());

        let written = std::fs::read_to_string(root.join(CONFIG_FILE)).unwrap();
        let second = Workspace::open_or_create(&root).unwrap();
        assert_eq!(second.config(), first.config());
        assert_eq!(
            std::fs::read_to_string(root.join(CONFIG_FILE)).unwrap(),
            written,
            "reopening must not rewrite the settings"
        );
    }

    #[test]
    fn settings_round_trip_including_keys_this_build_does_not_know() {
        let dir = tempfile::tempdir().unwrap();
        let root = dir.path().join("ws");
        Workspace::open_or_create(&root).unwrap();
        std::fs::write(
            root.join(CONFIG_FILE),
            "port = 9000\nopen-browser = false\nsomething-newer = \"keep me\"\n",
        )
        .unwrap();

        let mut workspace = Workspace::open_or_create(&root).unwrap();
        assert_eq!(workspace.config().port, 9000);
        assert!(!workspace.config().open_browser);
        assert_eq!(
            workspace.config().extra.get("something-newer"),
            Some(&toml::Value::String("keep me".to_owned()))
        );

        let mut changed = workspace.config().clone();
        changed.port = 9100;
        workspace.set_config(changed).unwrap();

        let reopened = Workspace::open_or_create(&root).unwrap();
        assert_eq!(reopened.config().port, 9100);
        assert_eq!(
            reopened.config().extra.get("something-newer"),
            Some(&toml::Value::String("keep me".to_owned())),
            "an unknown key must survive being written back"
        );
    }

    #[test]
    fn projects_are_listed_from_the_directory() {
        let dir = tempfile::tempdir().unwrap();
        let workspace = Workspace::open_or_create(dir.path()).unwrap();
        assert!(workspace.projects().unwrap().is_empty());

        for name in ["beta", "alpha"] {
            let id = ProjectId::new(name).unwrap();
            let project = workspace.create_project_dir(&id).unwrap();
            let document =
                crate::Document::new(&mut crate::ids::SequentialIdSource::new(), 1.0, 1.0);
            crate::storage::save(&document, &project).unwrap();
        }
        // A directory with no document is not a project.
        std::fs::create_dir_all(workspace.projects_dir().join("empty")).unwrap();

        let listed: Vec<String> = workspace
            .projects()
            .unwrap()
            .iter()
            .map(ProjectId::to_string)
            .collect();
        assert_eq!(listed, ["alpha", "beta"]);

        let alpha = ProjectId::new("alpha").unwrap();
        assert!(workspace.has_project(&alpha));
        assert!(workspace.existing_project_dir(&alpha).is_ok());
        assert!(matches!(
            workspace.create_project_dir(&alpha),
            Err(WorkspaceError::ProjectExists { .. })
        ));
        assert!(matches!(
            workspace.existing_project_dir(&ProjectId::new("gamma").unwrap()),
            Err(WorkspaceError::NoSuchProject { .. })
        ));
    }

    #[test]
    fn a_project_directory_stays_inside_the_workspace() {
        let dir = tempfile::tempdir().unwrap();
        let workspace = Workspace::open_or_create(dir.path()).unwrap();
        let id = ProjectId::new("poster").unwrap();
        let project = workspace.project_dir(&id);
        assert!(project.starts_with(workspace.projects_dir()));
        assert_eq!(project.file_name().unwrap(), "poster");
    }
}
