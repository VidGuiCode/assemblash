//! Page sets: an ordered list of sibling projects, kept in one file.
//!
//! A page set is not a document field. It is one JSON file for each set, in
//! `<workspace>/page-sets/<name>.json`, beside `projects/`:
//!
//! ```json
//! {
//!   "pages": [
//!     { "project": "cover" },
//!     { "set": "middle-spreads" },
//!     { "project": "back" }
//!   ]
//! }
//! ```
//!
//! An entry names a project or another set. A nested set adds its pages in
//! the place where it is named. The file name without `.json` is the name of
//! the set. Keys this build does not know about are kept, at the top level and
//! in each entry.
//!
//! [`resolve`] turns a set into the flat, ordered list of its pages. It never
//! drops a page: a loop, a missing member, or a project that occurs two times
//! is a typed error. A set with no pages is valid and resolves to no pages.
//!
//! An older build does not read these files. It sees the member projects, and
//! each of them opens unchanged.

use std::collections::HashMap;
use std::path::PathBuf;

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use crate::document::Extras;
use crate::workspace::{ProjectId, WorkspaceError};

/// Directory of a workspace that holds the page-set files.
pub const PAGE_SETS_DIR: &str = "page-sets";

/// Extension of a page-set file.
pub const PAGE_SET_EXTENSION: &str = "json";

/// The most sets in one chain of nested sets, the resolved set included.
///
/// A deeper chain is refused with [`PageSetError::TooDeep`]. The limit keeps
/// the walk, and the `via` list of each page, short. 32 is far above the
/// nesting of a usual deck.
pub const MAX_PAGE_SET_DEPTH: usize = 32;

/// The name of a page set: its file name without `.json`.
///
/// The same rules as a [`ProjectId`] apply: a name is one path segment, never
/// a path.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, JsonSchema)]
#[serde(transparent)]
pub struct PageSetName(String);

impl PageSetName {
    /// Checks a name and wraps it.
    pub fn new(name: impl Into<String>) -> Result<Self, PageSetError> {
        let name = name.into();
        match ProjectId::new(name.clone()) {
            Ok(_) => Ok(Self(name)),
            Err(WorkspaceError::InvalidProjectId { reason, .. }) => {
                Err(PageSetError::InvalidName { name, reason })
            }
            Err(_) => Err(PageSetError::InvalidName {
                name,
                reason: "it is not a usable name",
            }),
        }
    }

    /// The name as written.
    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl std::fmt::Display for PageSetName {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl<'de> Deserialize<'de> for PageSetName {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let raw = String::deserialize(deserializer)?;
        Self::new(raw).map_err(serde::de::Error::custom)
    }
}

/// The contents of one page-set file.
#[derive(Debug, Clone, PartialEq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct PageSet {
    /// The entries, in page order.
    pub pages: Vec<PageSetEntry>,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: Extras,
}

/// One entry of a page set: exactly one of `project` and `set`.
#[derive(Debug, Clone, PartialEq, Default, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct PageSetEntry {
    /// A project of the workspace. It is one page.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub project: Option<ProjectId>,
    /// Another page set. Its pages are added in this place.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub set: Option<PageSetName>,
    /// Keys this build does not know about, preserved verbatim.
    #[serde(flatten)]
    pub extra: Extras,
}

impl PageSetEntry {
    /// An entry that names a project.
    pub fn project(id: ProjectId) -> Self {
        Self {
            project: Some(id),
            ..Self::default()
        }
    }

    /// An entry that names another set.
    pub fn set(name: PageSetName) -> Self {
        Self {
            set: Some(name),
            ..Self::default()
        }
    }

    /// What this entry names, or `None` when it names zero or two members.
    pub fn member(&self) -> Option<Member<'_>> {
        match (&self.project, &self.set) {
            (Some(project), None) => Some(Member::Project(project)),
            (None, Some(set)) => Some(Member::Set(set)),
            _ => None,
        }
    }
}

/// What one entry names.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Member<'a> {
    /// A project.
    Project(&'a ProjectId),
    /// Another page set.
    Set(&'a PageSetName),
}

impl PageSet {
    /// Reads a page set from its JSON text and checks each entry.
    pub fn parse(name: &PageSetName, text: &str) -> Result<Self, PageSetError> {
        let set: Self = serde_json::from_str(text).map_err(|error| PageSetError::Malformed {
            set: name.clone(),
            reason: error.to_string(),
        })?;
        for (index, entry) in set.pages.iter().enumerate() {
            if entry.member().is_none() {
                return Err(PageSetError::Malformed {
                    set: name.clone(),
                    reason: format!(
                        "entry {index} must name exactly one of \"project\" and \"set\""
                    ),
                });
            }
        }
        Ok(set)
    }
}

/// The kind of member an entry names.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub enum MemberKind {
    /// A project.
    Project,
    /// A page set.
    Set,
}

/// One member that a page set names and that does not exist.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct MissingMember {
    /// The set whose entry names the member.
    pub set: PageSetName,
    /// The position of that entry in its set, from 0.
    pub entry: usize,
    /// Project or set.
    pub kind: MemberKind,
    /// The name that does not exist.
    pub name: String,
}

impl std::fmt::Display for MissingMember {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let kind = match self.kind {
            MemberKind::Project => "project",
            MemberKind::Set => "set",
        };
        write!(
            f,
            "{kind} {:?} (set {:?}, entry {})",
            self.name, self.set.0, self.entry
        )
    }
}

/// One page of a resolved page set.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ResolvedPage {
    /// The position of the page in the flat list, from 0.
    pub index: usize,
    /// The project that is this page.
    pub project: ProjectId,
    /// The sets that lead to this page, from the resolved set to the set that
    /// names the project.
    pub via: Vec<PageSetName>,
}

/// A page set and its flat, ordered page list.
#[derive(Debug, Clone, PartialEq, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase")]
pub struct ResolvedPageSet {
    /// The name of the set.
    pub name: PageSetName,
    /// The file contents, as read.
    pub manifest: PageSet,
    /// Every page, in order, with nested sets expanded in place.
    pub pages: Vec<ResolvedPage>,
}

/// Something wrong with a page set.
#[derive(Debug, thiserror::Error)]
#[non_exhaustive]
pub enum PageSetError {
    /// A name is not one this workspace puts on the filesystem.
    #[error("{name:?} is not a usable page-set name: {reason}")]
    InvalidName {
        /// The name that was offered.
        name: String,
        /// Why it was refused.
        reason: &'static str,
    },

    /// No page-set file has this name.
    #[error("no page set is named {name:?}")]
    NotFound {
        /// The name that was asked for.
        name: PageSetName,
    },

    /// A page-set file is not valid JSON of the page-set shape.
    #[error("page set {set:?} is not readable: {reason}")]
    Malformed {
        /// The set whose file is at fault.
        set: PageSetName,
        /// What is wrong.
        reason: String,
    },

    /// One or more entries name a project or a set that does not exist.
    ///
    /// Every missing member is listed, not only the first.
    #[error("page set {set:?} names members that do not exist: {}", list(missing))]
    MissingMembers {
        /// The set that was resolved.
        set: PageSetName,
        /// Each missing member, in the order the walk found them.
        missing: Vec<MissingMember>,
    },

    /// A set contains itself, directly or through other sets.
    #[error("page set {:?} contains itself: {}", chain[0].as_str(), chain_text(chain))]
    Loop {
        /// The sets of the loop, from the first to the same set again.
        chain: Vec<PageSetName>,
    },

    /// Sets are nested deeper than [`MAX_PAGE_SET_DEPTH`].
    #[error(
        "page set {:?} nests sets deeper than {limit}: {}",
        chain[0].as_str(),
        chain_text(chain)
    )]
    TooDeep {
        /// The nested sets, from the resolved set to the first set past the
        /// limit.
        chain: Vec<PageSetName>,
        /// The limit, [`MAX_PAGE_SET_DEPTH`].
        limit: usize,
    },

    /// The same project is two pages of one set.
    #[error(
        "project {project:?} is page {first} and page {second} of page set {set:?}; \
         a project can be one page only"
    )]
    DuplicatePage {
        /// The set that was resolved.
        set: PageSetName,
        /// The project that occurs two times.
        project: ProjectId,
        /// Its first page index.
        first: usize,
        /// Its second page index.
        second: usize,
    },

    /// A page-set file or directory could not be read.
    #[error("reading {path}: {source}")]
    Io {
        /// File involved.
        path: PathBuf,
        /// Underlying cause.
        source: std::io::Error,
    },
}

fn list(missing: &[MissingMember]) -> String {
    missing
        .iter()
        .map(ToString::to_string)
        .collect::<Vec<_>>()
        .join(", ")
}

fn chain_text(chain: &[PageSetName]) -> String {
    chain
        .iter()
        .map(PageSetName::as_str)
        .collect::<Vec<_>>()
        .join(" -> ")
}

impl PageSetError {
    /// Stable machine-readable code. A caller switches on this code.
    pub fn code(&self) -> &'static str {
        match self {
            Self::InvalidName { .. } => "invalidPageSetName",
            Self::NotFound { .. } => "pageSetNotFound",
            Self::Malformed { .. } => "pageSetMalformed",
            Self::MissingMembers { .. } => "pageSetMemberMissing",
            Self::Loop { .. } => "pageSetLoop",
            Self::TooDeep { .. } => "pageSetTooDeep",
            Self::DuplicatePage { .. } => "pageSetDuplicatePage",
            Self::Io { .. } => "pageSetUnreadable",
        }
    }
}

/// Where [`resolve`] finds projects and sets.
///
/// The workspace is the real source. Tests use a map.
pub trait PageSetSource {
    /// Whether this project exists.
    fn has_project(&self, id: &ProjectId) -> bool;
    /// The set of this name, or `None` when there is no such set.
    fn page_set(&self, name: &PageSetName) -> Result<Option<PageSet>, PageSetError>;
}

/// Resolves a set to its flat, ordered page list.
///
/// Nested sets add their pages in place, depth first. The checks come in this
/// order: a loop, or nesting deeper than [`MAX_PAGE_SET_DEPTH`], is refused
/// at once, because the walk cannot continue past it; then every missing
/// member is reported together; then a project that is
/// two pages is refused.
///
/// The work is linear in the number of distinct sets and entries. Each file is
/// read one time, and each set is expanded one time. A second visit of a set
/// that has pages can only repeat those pages, so it is recorded as a
/// duplicate and not expanded again. This keeps a "diamond" of nested sets
/// from growing the walk exponentially.
pub fn resolve(
    name: &PageSetName,
    source: &impl PageSetSource,
) -> Result<ResolvedPageSet, PageSetError> {
    let manifest = source
        .page_set(name)?
        .ok_or_else(|| PageSetError::NotFound { name: name.clone() })?;

    let mut walk = Walk {
        source,
        stack: vec![name.clone()],
        pages: Vec::new(),
        missing: Vec::new(),
        seen: HashMap::new(),
        expanded: HashMap::new(),
        duplicate: None,
    };
    walk.expand(name, &manifest)?;

    if !walk.missing.is_empty() {
        return Err(PageSetError::MissingMembers {
            set: name.clone(),
            missing: walk.missing,
        });
    }
    if let Some((project, first, second)) = walk.duplicate {
        return Err(PageSetError::DuplicatePage {
            set: name.clone(),
            project,
            first,
            second,
        });
    }

    Ok(ResolvedPageSet {
        name: name.clone(),
        manifest,
        pages: walk.pages,
    })
}

struct Walk<'a, S> {
    source: &'a S,
    stack: Vec<PageSetName>,
    pages: Vec<ResolvedPage>,
    missing: Vec<MissingMember>,
    /// The page index of each project already in `pages`.
    seen: HashMap<ProjectId, usize>,
    /// Each set already expanded, with the index of its first page, if any.
    expanded: HashMap<PageSetName, Option<usize>>,
    /// The first duplicate page found: project, first index, second index.
    duplicate: Option<(ProjectId, usize, usize)>,
}

impl<S: PageSetSource> Walk<'_, S> {
    fn add_page(&mut self, project: &ProjectId) {
        let index = self.pages.len();
        if let Some(&first) = self.seen.get(project) {
            self.duplicate
                .get_or_insert_with(|| (project.clone(), first, index));
            return;
        }
        self.seen.insert(project.clone(), index);
        self.pages.push(ResolvedPage {
            index,
            project: project.clone(),
            via: self.stack.clone(),
        });
    }

    fn expand(&mut self, name: &PageSetName, set: &PageSet) -> Result<(), PageSetError> {
        for (entry, item) in set.pages.iter().enumerate() {
            match item.member() {
                Some(Member::Project(project)) => {
                    if self.source.has_project(project) {
                        self.add_page(project);
                    } else {
                        self.missing.push(MissingMember {
                            set: name.clone(),
                            entry,
                            kind: MemberKind::Project,
                            name: project.to_string(),
                        });
                    }
                }
                Some(Member::Set(child)) => {
                    if let Some(start) = self.stack.iter().position(|open| open == child) {
                        let mut chain = self.stack[start..].to_vec();
                        chain.push(child.clone());
                        return Err(PageSetError::Loop { chain });
                    }
                    if self.stack.len() >= MAX_PAGE_SET_DEPTH {
                        let mut chain = self.stack.clone();
                        chain.push(child.clone());
                        return Err(PageSetError::TooDeep {
                            chain,
                            limit: MAX_PAGE_SET_DEPTH,
                        });
                    }
                    if let Some(first_page) = self.expanded.get(child) {
                        // Expanded before without a loop, so its subtree has
                        // none. Its pages are already in the list.
                        if let Some(first) = *first_page {
                            let page = &self.pages[first];
                            let duplicate = (page.project.clone(), first, self.pages.len());
                            self.duplicate.get_or_insert(duplicate);
                        }
                        continue;
                    }
                    match self.source.page_set(child)? {
                        None => self.missing.push(MissingMember {
                            set: name.clone(),
                            entry,
                            kind: MemberKind::Set,
                            name: child.to_string(),
                        }),
                        Some(nested) => {
                            let before = self.pages.len();
                            self.stack.push(child.clone());
                            self.expand(child, &nested)?;
                            self.stack.pop();
                            let first = (self.pages.len() > before).then_some(before);
                            self.expanded.insert(child.clone(), first);
                        }
                    }
                }
                None => {
                    return Err(PageSetError::Malformed {
                        set: name.clone(),
                        reason: format!(
                            "entry {entry} must name exactly one of \"project\" and \"set\""
                        ),
                    })
                }
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used, clippy::panic)]

    use std::collections::{BTreeMap, BTreeSet};

    use super::*;

    #[derive(Default)]
    struct Map {
        projects: BTreeSet<String>,
        sets: BTreeMap<String, String>,
    }

    impl Map {
        fn project(mut self, id: &str) -> Self {
            self.projects.insert(id.to_owned());
            self
        }
        fn set(mut self, name: &str, json: &str) -> Self {
            self.sets.insert(name.to_owned(), json.to_owned());
            self
        }
        fn resolve(&self, name: &str) -> Result<ResolvedPageSet, PageSetError> {
            resolve(&PageSetName::new(name).unwrap(), self)
        }
    }

    impl PageSetSource for Map {
        fn has_project(&self, id: &ProjectId) -> bool {
            self.projects.contains(id.as_str())
        }
        fn page_set(&self, name: &PageSetName) -> Result<Option<PageSet>, PageSetError> {
            self.sets
                .get(name.as_str())
                .map(|text| PageSet::parse(name, text))
                .transpose()
        }
    }

    fn pages(resolved: &ResolvedPageSet) -> Vec<&str> {
        resolved.pages.iter().map(|p| p.project.as_str()).collect()
    }

    #[test]
    fn a_flat_set_keeps_its_order() {
        let map = Map::default().project("a").project("b").project("c").set(
            "deck",
            r#"{"pages":[{"project":"c"},{"project":"a"},{"project":"b"}]}"#,
        );
        let resolved = map.resolve("deck").unwrap();
        assert_eq!(pages(&resolved), ["c", "a", "b"]);
        assert_eq!(
            resolved.pages.iter().map(|p| p.index).collect::<Vec<_>>(),
            [0, 1, 2]
        );
        assert!(resolved.pages.iter().all(|p| p.via.len() == 1));
    }

    #[test]
    fn a_nested_set_adds_its_pages_in_place() {
        let map = Map::default()
            .project("cover")
            .project("one")
            .project("two")
            .project("three")
            .project("back")
            .set(
                "inner",
                r#"{"pages":[{"project":"two"},{"project":"three"}]}"#,
            )
            .set("middle", r#"{"pages":[{"project":"one"},{"set":"inner"}]}"#)
            .set(
                "book",
                r#"{"pages":[{"project":"cover"},{"set":"middle"},{"project":"back"}]}"#,
            );
        let resolved = map.resolve("book").unwrap();
        assert_eq!(pages(&resolved), ["cover", "one", "two", "three", "back"]);
        let via: Vec<&str> = resolved.pages[2].via.iter().map(|n| n.as_str()).collect();
        assert_eq!(via, ["book", "middle", "inner"]);
    }

    #[test]
    fn an_empty_set_resolves_to_no_pages() {
        let map = Map::default().set("empty", r#"{"pages":[]}"#);
        assert!(map.resolve("empty").unwrap().pages.is_empty());
    }

    #[test]
    fn a_loop_is_refused_and_named() {
        let map = Map::default()
            .project("p")
            .set("a", r#"{"pages":[{"project":"p"},{"set":"b"}]}"#)
            .set("b", r#"{"pages":[{"set":"c"}]}"#)
            .set("c", r#"{"pages":[{"set":"b"}]}"#);
        let error = map.resolve("a").unwrap_err();
        assert_eq!(error.code(), "pageSetLoop");
        let PageSetError::Loop { chain } = &error else {
            panic!("{error}")
        };
        let chain: Vec<&str> = chain.iter().map(|n| n.as_str()).collect();
        assert_eq!(chain, ["b", "c", "b"]);
        assert!(error.to_string().contains("b -> c -> b"), "{error}");
    }

    #[test]
    fn a_set_that_names_itself_is_a_loop() {
        let map = Map::default().set("self", r#"{"pages":[{"set":"self"}]}"#);
        assert_eq!(map.resolve("self").unwrap_err().code(), "pageSetLoop");
    }

    #[test]
    fn every_missing_member_is_reported() {
        let map = Map::default()
            .project("here")
            .set("inner", r#"{"pages":[{"project":"gone"}]}"#)
            .set(
                "deck",
                r#"{"pages":[{"project":"here"},{"project":"absent"},{"set":"inner"},{"set":"nowhere"}]}"#,
            );
        let error = map.resolve("deck").unwrap_err();
        assert_eq!(error.code(), "pageSetMemberMissing");
        let PageSetError::MissingMembers { missing, .. } = &error else {
            panic!("{error}")
        };
        let found: Vec<(&str, usize, MemberKind, &str)> = missing
            .iter()
            .map(|m| (m.set.as_str(), m.entry, m.kind, m.name.as_str()))
            .collect();
        assert_eq!(
            found,
            [
                ("deck", 1, MemberKind::Project, "absent"),
                ("inner", 0, MemberKind::Project, "gone"),
                ("deck", 3, MemberKind::Set, "nowhere"),
            ]
        );
    }

    #[test]
    fn a_project_on_two_pages_is_refused() {
        let map = Map::default()
            .project("a")
            .project("b")
            .set("inner", r#"{"pages":[{"project":"a"}]}"#)
            .set(
                "deck",
                r#"{"pages":[{"project":"a"},{"project":"b"},{"set":"inner"}]}"#,
            );
        let error = map.resolve("deck").unwrap_err();
        assert_eq!(error.code(), "pageSetDuplicatePage");
        assert!(matches!(
            error,
            PageSetError::DuplicatePage {
                first: 0,
                second: 2,
                ..
            }
        ));
    }

    #[test]
    fn the_same_set_on_two_branches_is_not_a_loop() {
        // Two branches reach `shared`. That is not a loop, but its page then
        // occurs two times, so the duplicate rule refuses it.
        let map = Map::default()
            .project("p")
            .set("shared", r#"{"pages":[{"project":"p"}]}"#)
            .set("deck", r#"{"pages":[{"set":"shared"},{"set":"shared"}]}"#);
        assert_eq!(
            map.resolve("deck").unwrap_err().code(),
            "pageSetDuplicatePage"
        );
    }

    #[test]
    fn a_wide_diamond_of_sets_is_refused_without_expanding_every_path() {
        // Each level names the next level twelve times: 12^12 paths if every
        // path were walked. Each set is read one time, and the repeat is a
        // duplicate page.
        let mut map = Map::default().project("leaf");
        map = map.set("level0", r#"{"pages":[{"project":"leaf"}]}"#);
        for level in 1..=12 {
            let entry = format!(r#"{{"set":"level{}"}}"#, level - 1);
            let entries = vec![entry; 12].join(",");
            map = map.set(
                &format!("level{level}"),
                &format!(r#"{{"pages":[{entries}]}}"#),
            );
        }
        let error = map.resolve("level12").unwrap_err();
        assert!(matches!(
            error,
            PageSetError::DuplicatePage {
                first: 0,
                second: 1,
                ..
            }
        ));
    }

    /// `level0` names the project `leaf`, and each `levelN` names
    /// `level(N-1)`. Resolving `level{top}` nests `top + 1` sets.
    fn chain(top: usize) -> Map {
        let mut map = Map::default()
            .project("leaf")
            .set("level0", r#"{"pages":[{"project":"leaf"}]}"#);
        for level in 1..=top {
            map = map.set(
                &format!("level{level}"),
                &format!(r#"{{"pages":[{{"set":"level{}"}}]}}"#, level - 1),
            );
        }
        map
    }

    #[test]
    fn nesting_up_to_the_depth_limit_resolves() {
        let resolved = chain(MAX_PAGE_SET_DEPTH - 1)
            .resolve(&format!("level{}", MAX_PAGE_SET_DEPTH - 1))
            .unwrap();
        assert_eq!(pages(&resolved), ["leaf"]);
        assert_eq!(resolved.pages[0].via.len(), MAX_PAGE_SET_DEPTH);
    }

    #[test]
    fn nesting_deeper_than_the_limit_is_refused_and_names_the_chain() {
        let top = MAX_PAGE_SET_DEPTH;
        let error = chain(top).resolve(&format!("level{top}")).unwrap_err();
        assert_eq!(error.code(), "pageSetTooDeep", "{error}");
        let PageSetError::TooDeep { chain, limit } = &error else {
            panic!("{error}")
        };
        assert_eq!(*limit, MAX_PAGE_SET_DEPTH);
        assert_eq!(chain.len(), MAX_PAGE_SET_DEPTH + 1);
        assert_eq!(chain[0].as_str(), format!("level{top}"));
        assert_eq!(chain[MAX_PAGE_SET_DEPTH].as_str(), "level0");
        assert!(
            error.to_string().contains(&format!("level{top} -> ")),
            "{error}"
        );
    }

    #[test]
    fn a_missing_top_level_set_is_not_found() {
        assert_eq!(
            Map::default().resolve("none").unwrap_err().code(),
            "pageSetNotFound"
        );
    }

    #[test]
    fn malformed_files_and_entries_are_refused() {
        let name = PageSetName::new("bad").unwrap();
        for text in [
            "not json",
            r#"{"pages":{}}"#,
            r#"{"pages":[{}]}"#,
            r#"{"pages":[{"project":"a","set":"b"}]}"#,
            r#"{"pages":[{"project":"../escape"}]}"#,
        ] {
            let error = PageSet::parse(&name, text).unwrap_err();
            assert_eq!(error.code(), "pageSetMalformed", "{text}: {error}");
        }
    }

    #[test]
    fn a_name_that_is_a_path_is_refused() {
        for name in ["", "../up", "a/b", "a\\b", ".hidden", "CON"] {
            assert_eq!(
                PageSetName::new(name).unwrap_err().code(),
                "invalidPageSetName",
                "{name}"
            );
        }
    }

    #[test]
    fn unknown_keys_are_kept() {
        let name = PageSetName::new("keep").unwrap();
        let text = r#"{"pages":[{"project":"a","note":"cover"}],"title":"Deck"}"#;
        let set = PageSet::parse(&name, text).unwrap();
        let written = serde_json::to_value(&set).unwrap();
        assert_eq!(
            written,
            serde_json::from_str::<serde_json::Value>(text).unwrap()
        );
    }
}
