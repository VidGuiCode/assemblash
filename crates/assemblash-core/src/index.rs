//! `index.db` — a cache of what is in the workspace, and never a source of
//! truth.
//!
//! # The rule
//!
//! **Delete it and nothing is lost.** It rebuilds by scanning `projects/`.
//! Corruption or a schema this build does not recognise is not an error a
//! person should ever see: it is a reason to throw the file away and build it
//! again. Absent entirely, every caller falls back to a directory scan and the
//! product behaves exactly as it did before this file existed.
//!
//! That rule is what makes an index safe to add at all. No operation writes
//! here instead of to a document, no render consults it, and nothing in it is
//! the only copy of anything. It exists so a project browser holding two
//! hundred projects does not have to open and parse two hundred documents to
//! draw a list.
//!
//! # What it does not do
//!
//! It does not *make* thumbnails. Rendering needs the renderer, and the
//! renderer depends on this crate rather than the other way round, so the
//! server renders and hands the bytes in. They are stored against the document
//! version they were made from, which is what makes a stale thumbnail
//! impossible rather than merely unlikely.

use std::path::{Path, PathBuf};

use rusqlite::{Connection, OptionalExtension as _};

use crate::workspace::{ProjectId, Workspace};

/// File name of the cache inside the workspace.
pub const INDEX_FILE: &str = "index.db";

/// Schema this build writes and reads.
///
/// A file carrying anything else is discarded and rebuilt. There is
/// deliberately no migration: a migration is what you write for data you
/// cannot recreate, and every row here can be recreated by reading the
/// projects directory.
const SCHEMA_VERSION: i64 = 1;

const SCHEMA: &str = "
CREATE TABLE projects (
    id            TEXT PRIMARY KEY,
    name          TEXT,
    document_id   TEXT NOT NULL,
    version       INTEGER NOT NULL,
    layers        INTEGER NOT NULL,
    width         REAL NOT NULL,
    height        REAL NOT NULL,
    modified      INTEGER NOT NULL,
    source_size   INTEGER NOT NULL,
    thumbnail     BLOB,
    thumb_version INTEGER
);
CREATE INDEX projects_modified ON projects (modified DESC);
";

/// One project, as the cache remembers it.
#[derive(Debug, Clone, PartialEq)]
pub struct IndexedProject {
    /// Project id, which is its directory name.
    pub id: ProjectId,
    /// Human-facing document name, if it has one.
    pub name: Option<String>,
    /// Document id.
    pub document_id: String,
    /// Document version when it was indexed.
    pub version: u64,
    /// How many layers it has, counting nested ones.
    pub layers: usize,
    /// Canvas width.
    pub width: f64,
    /// Canvas height.
    pub height: f64,
    /// Modification time of `document.json`, in milliseconds since the epoch.
    pub modified: i64,
}

/// The workspace cache.
pub struct Index {
    connection: Connection,
    path: PathBuf,
}

impl std::fmt::Debug for Index {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter
            .debug_struct("Index")
            .field("path", &self.path)
            .finish()
    }
}

impl Index {
    /// Opens the workspace's cache, rebuilding it if it is unusable.
    ///
    /// Returns `None` only when a usable file cannot be created at all — a
    /// read-only workspace, say. Every caller must work without one, so there
    /// is nothing to report and no error to propagate.
    pub fn open(root: &Path) -> Option<Self> {
        let path = root.join(INDEX_FILE);
        match Self::open_existing(&path) {
            Some(index) => Some(index),
            None => {
                // Unreadable, corrupt, or written by a schema this build does
                // not know. All three have the same answer.
                let _ = std::fs::remove_file(&path);
                Self::create(&path)
            }
        }
    }

    fn open_existing(path: &Path) -> Option<Self> {
        if !path.is_file() {
            return None;
        }
        let connection = Connection::open(path).ok()?;
        let version: i64 = connection
            .query_row("PRAGMA user_version", [], |row| row.get(0))
            .ok()?;
        if version != SCHEMA_VERSION {
            return None;
        }
        // Proves the tables are really there and readable, which a header
        // check alone does not: a truncated file can still report its
        // user_version.
        connection
            .query_row("SELECT count(*) FROM projects", [], |row| {
                row.get::<_, i64>(0)
            })
            .ok()?;
        Some(Self {
            connection,
            path: path.to_path_buf(),
        })
    }

    fn create(path: &Path) -> Option<Self> {
        let connection = Connection::open(path).ok()?;
        connection.execute_batch(SCHEMA).ok()?;
        connection
            .pragma_update(None, "user_version", SCHEMA_VERSION)
            .ok()?;
        Some(Self {
            connection,
            path: path.to_path_buf(),
        })
    }

    /// Where the file is.
    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Brings the cache up to date with the projects directory.
    ///
    /// A project whose `document.json` has the same modification time and size
    /// as when it was indexed is skipped without being read, which is what
    /// keeps a second pass over two hundred projects cheap. Anything that no
    /// longer reads as a project is dropped from the cache rather than
    /// failing the refresh — the project's own endpoint still reports exactly
    /// what is wrong with it.
    pub fn refresh(&self, workspace: &Workspace) -> usize {
        let Ok(ids) = workspace.projects() else {
            return 0;
        };
        let mut indexed = 0;

        for id in &ids {
            let directory = workspace.project_dir(id);
            let source = directory.join("document.json");
            let Ok(metadata) = std::fs::metadata(&source) else {
                self.forget(id);
                continue;
            };
            let modified = millis(&metadata);
            let size = metadata.len() as i64;

            let known: Option<(i64, i64)> = self
                .connection
                .query_row(
                    "SELECT modified, source_size FROM projects WHERE id = ?1",
                    [id.as_str()],
                    |row| Ok((row.get(0)?, row.get(1)?)),
                )
                .optional()
                .ok()
                .flatten();
            if known == Some((modified, size)) {
                continue;
            }

            match crate::storage::load(&directory) {
                Ok(document) => {
                    let mut layers = 0usize;
                    document.walk_layers(&mut |_| layers += 1);
                    let _ = self.connection.execute(
                        "INSERT INTO projects
                           (id, name, document_id, version, layers, width, height,
                            modified, source_size, thumbnail, thumb_version)
                         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, NULL, NULL)
                         ON CONFLICT(id) DO UPDATE SET
                           name = excluded.name,
                           document_id = excluded.document_id,
                           version = excluded.version,
                           layers = excluded.layers,
                           width = excluded.width,
                           height = excluded.height,
                           modified = excluded.modified,
                           source_size = excluded.source_size,
                           -- The document changed, so any thumbnail of it is
                           -- of something that no longer exists.
                           thumbnail = NULL,
                           thumb_version = NULL",
                        rusqlite::params![
                            id.as_str(),
                            document.name,
                            document.id.to_string(),
                            document.version as i64,
                            layers as i64,
                            document.canvas.width,
                            document.canvas.height,
                            modified,
                            size,
                        ],
                    );
                    indexed += 1;
                }
                Err(_) => self.forget(id),
            }
        }

        // Anything the cache holds that is no longer on disk.
        let live: std::collections::BTreeSet<&str> = ids.iter().map(ProjectId::as_str).collect();
        if let Ok(mut statement) = self.connection.prepare("SELECT id FROM projects") {
            let stale: Vec<String> = statement
                .query_map([], |row| row.get::<_, String>(0))
                .map(|rows| {
                    rows.filter_map(Result::ok)
                        .filter(|id| !live.contains(id.as_str()))
                        .collect()
                })
                .unwrap_or_default();
            for id in stale {
                let _ = self
                    .connection
                    .execute("DELETE FROM projects WHERE id = ?1", [id]);
            }
        }

        indexed
    }

    fn forget(&self, id: &ProjectId) {
        let _ = self
            .connection
            .execute("DELETE FROM projects WHERE id = ?1", [id.as_str()]);
    }

    /// Every project, most recently modified first.
    pub fn recents(&self, limit: usize) -> Vec<IndexedProject> {
        self.query(
            "SELECT id, name, document_id, version, layers, width, height, modified
               FROM projects ORDER BY modified DESC, id ASC LIMIT ?1",
            rusqlite::params![limit as i64],
        )
    }

    /// Projects whose id or name contains the query, most recent first.
    ///
    /// Case-insensitive and substring-based: somebody typing three letters
    /// into a box is looking for anything that has them, not for a prefix.
    pub fn search(&self, query: &str, limit: usize) -> Vec<IndexedProject> {
        let pattern = format!("%{}%", escape_like(query));
        self.query(
            "SELECT id, name, document_id, version, layers, width, height, modified
               FROM projects
              WHERE id LIKE ?1 ESCAPE '\\' OR name LIKE ?1 ESCAPE '\\'
              ORDER BY modified DESC, id ASC LIMIT ?2",
            rusqlite::params![pattern, limit as i64],
        )
    }

    fn query(&self, sql: &str, params: &[&dyn rusqlite::ToSql]) -> Vec<IndexedProject> {
        let Ok(mut statement) = self.connection.prepare(sql) else {
            return Vec::new();
        };
        let rows = statement.query_map(params, |row| {
            Ok(IndexedProject {
                id: ProjectId::new(row.get::<_, String>(0)?).unwrap_or_else(|_| {
                    // Only reachable if the file was edited by hand into
                    // something no longer a legal id; such a row is skipped
                    // below rather than trusted.
                    ProjectId::new("invalid").unwrap_or_else(|_| unreachable!("literal is valid"))
                }),
                name: row.get(1)?,
                document_id: row.get(2)?,
                version: row.get::<_, i64>(3)? as u64,
                layers: row.get::<_, i64>(4)? as usize,
                width: row.get(5)?,
                height: row.get(6)?,
                modified: row.get(7)?,
            })
        });
        rows.map(|rows| rows.filter_map(Result::ok).collect())
            .unwrap_or_default()
    }

    /// The cached thumbnail for a project, if it is of the version asked for.
    ///
    /// Version-matched rather than merely present: a thumbnail of a document
    /// that has since changed is worse than no thumbnail, because it looks
    /// current.
    pub fn thumbnail(&self, id: &ProjectId, version: u64) -> Option<Vec<u8>> {
        self.connection
            .query_row(
                "SELECT thumbnail FROM projects WHERE id = ?1 AND thumb_version = ?2",
                rusqlite::params![id.as_str(), version as i64],
                |row| row.get::<_, Option<Vec<u8>>>(0),
            )
            .optional()
            .ok()
            .flatten()
            .flatten()
    }

    /// Stores a thumbnail against the version it was rendered from.
    pub fn set_thumbnail(&self, id: &ProjectId, version: u64, png: &[u8]) {
        let _ = self.connection.execute(
            "UPDATE projects SET thumbnail = ?2, thumb_version = ?3 WHERE id = ?1",
            rusqlite::params![id.as_str(), png, version as i64],
        );
    }

    /// How many projects the cache holds.
    pub fn len(&self) -> usize {
        self.connection
            .query_row("SELECT count(*) FROM projects", [], |row| {
                row.get::<_, i64>(0)
            })
            .map(|count| count as usize)
            .unwrap_or(0)
    }

    /// Whether the cache holds nothing.
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

/// Modification time in milliseconds, or 0 when the platform will not say.
fn millis(metadata: &std::fs::Metadata) -> i64 {
    metadata
        .modified()
        .ok()
        .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|elapsed| elapsed.as_millis() as i64)
        .unwrap_or(0)
}

/// Escapes the wildcards `LIKE` would otherwise interpret.
///
/// Without this, searching for `_` matches everything, which looks like the
/// search is broken rather than like it is doing what it was told.
fn escape_like(query: &str) -> String {
    query
        .replace('\\', "\\\\")
        .replace('%', "\\%")
        .replace('_', "\\_")
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used)]

    use super::*;
    use crate::ids::SequentialIdSource;
    use crate::Document;

    fn workspace_with(projects: &[(&str, Option<&str>)]) -> (tempfile::TempDir, Workspace) {
        let scratch = tempfile::tempdir().unwrap();
        let workspace = Workspace::open_or_create(scratch.path().join("data")).unwrap();
        for (id, name) in projects {
            let id = ProjectId::new((*id).to_owned()).unwrap();
            let directory = workspace.create_project_dir(&id).unwrap();
            let mut document = Document::new(&mut SequentialIdSource::new(), 100.0, 50.0);
            document.name = name.map(ToOwned::to_owned);
            drop(crate::Session::create(&directory, document, None).unwrap());
        }
        (scratch, workspace)
    }

    #[test]
    fn a_refresh_finds_every_project_and_a_second_one_reads_nothing() {
        let (_scratch, workspace) = workspace_with(&[
            ("alpha", Some("Alpha poster")),
            ("beta", Some("Beta flyer")),
            ("gamma", None),
        ]);
        let index = Index::open(workspace.root()).unwrap();

        assert_eq!(index.refresh(&workspace), 3);
        assert_eq!(index.len(), 3);
        // Nothing changed, so nothing is re-read: this is what keeps two
        // hundred projects cheap on the second pass.
        assert_eq!(index.refresh(&workspace), 0);
    }

    #[test]
    fn deleting_the_file_gives_identical_answers_after_a_rebuild() {
        // The rule the whole design rests on: index.db is a cache, and losing
        // it costs time, never information.
        let (_scratch, workspace) = workspace_with(&[("alpha", Some("Alpha")), ("beta", None)]);
        let index = Index::open(workspace.root()).unwrap();
        index.refresh(&workspace);
        let before = index.recents(50);
        let path = index.path().to_path_buf();
        drop(index);

        std::fs::remove_file(&path).unwrap();
        assert!(!path.exists());

        let rebuilt = Index::open(workspace.root()).unwrap();
        rebuilt.refresh(&workspace);
        assert_eq!(rebuilt.recents(50), before);
    }

    #[test]
    fn a_corrupt_file_is_rebuilt_rather_than_reported() {
        let (_scratch, workspace) = workspace_with(&[("alpha", None)]);
        let path = workspace.root().join(INDEX_FILE);
        std::fs::write(&path, b"this is not a database, it is a shopping list").unwrap();

        let index = Index::open(workspace.root()).expect("a corrupt cache is replaced");
        index.refresh(&workspace);
        assert_eq!(index.len(), 1);
    }

    #[test]
    fn a_schema_from_another_build_is_rebuilt_rather_than_migrated() {
        let (_scratch, workspace) = workspace_with(&[("alpha", None)]);
        let path = workspace.root().join(INDEX_FILE);
        {
            let connection = Connection::open(&path).unwrap();
            connection
                .execute_batch("CREATE TABLE whatever (x TEXT)")
                .unwrap();
            connection
                .pragma_update(None, "user_version", 99_i64)
                .unwrap();
        }

        let index = Index::open(workspace.root()).expect("an unknown schema is replaced");
        index.refresh(&workspace);
        assert_eq!(index.len(), 1);
    }

    #[test]
    fn searching_matches_the_id_or_the_name_anywhere_in_it() {
        let (_scratch, workspace) = workspace_with(&[
            ("summer-sale", Some("Summer Sale")),
            ("winter-sale", Some("Winter Sale")),
            ("logo", Some("Brand mark")),
        ]);
        let index = Index::open(workspace.root()).unwrap();
        index.refresh(&workspace);

        let found: Vec<String> = index
            .search("sale", 50)
            .into_iter()
            .map(|project| project.id.as_str().to_owned())
            .collect();
        assert_eq!(found.len(), 2, "{found:?}");
        assert!(found.contains(&"summer-sale".to_owned()));

        // By name rather than id.
        assert_eq!(index.search("brand", 50).len(), 1);
        // Case-insensitively.
        assert_eq!(index.search("SUMMER", 50).len(), 1);
        // And a wildcard is a character to search for, not a pattern.
        assert!(index.search("%", 50).is_empty());
        assert!(index.search("_", 50).is_empty());
    }

    #[test]
    fn a_project_that_disappears_leaves_the_cache() {
        let (_scratch, workspace) = workspace_with(&[("alpha", None), ("beta", None)]);
        let index = Index::open(workspace.root()).unwrap();
        index.refresh(&workspace);
        assert_eq!(index.len(), 2);

        std::fs::remove_dir_all(workspace.project_dir(&ProjectId::new("beta").unwrap())).unwrap();
        index.refresh(&workspace);
        assert_eq!(index.len(), 1);
        assert_eq!(index.search("beta", 10).len(), 0);
    }

    #[test]
    fn a_thumbnail_is_only_returned_for_the_version_it_was_made_from() {
        let (_scratch, workspace) = workspace_with(&[("alpha", None)]);
        let index = Index::open(workspace.root()).unwrap();
        index.refresh(&workspace);
        let id = ProjectId::new("alpha").unwrap();

        index.set_thumbnail(&id, 0, b"png bytes");
        assert_eq!(index.thumbnail(&id, 0).as_deref(), Some(&b"png bytes"[..]));
        // A thumbnail of a document that has moved on looks current and is
        // not, which is worse than having none.
        assert_eq!(index.thumbnail(&id, 1), None);
    }
}
