// Assemblash document model.
// Generated from the Rust types — do not edit. Regenerate with:
//   cargo run -p assemblash-core --example generate-schema

/// Identifier of a document.
export type DocumentId = string;

/// The fixed-size surface layers are composed on.
export type Canvas = {
  /** Width in pixels; must be positive and finite. */
  width: number;
  /** Height in pixels; must be positive and finite. */
  height: number;
  /** Background fill. `None` means transparent. */
  background?: Color | null;
  [key: string]: unknown;
};

/// An sRGB colour, `#rrggbb` or `#rrggbbaa`.
/// 
/// Stored as written so a document round-trips exactly; validation checks the
/// shape and [`Color::to_rgba`] parses it.
export type Color = string;

/// An imported file living under the project's `assets/` directory.
export type Asset = {
  /** Stable id, `asset_<ULID>`. */
  id: AssetId;
  /** Path relative to the project's `assets/` directory, `/`-separated. */
  path: string;
  /** Content hash of the file, `sha256:<hex>`. Detects silent edits. */
  hash: string;
  /** Media type, e.g. `image/png`. */
  mediaType: string;
  /** Pixel width, when known. */
  width?: number | null;
  /** Pixel height, when known. */
  height?: number | null;
  [key: string]: unknown;
};

/// Identifier of an imported asset.
export type AssetId = string;

/// One layer: the properties every layer has, plus its kind-specific payload.
export type Layer = (TextLayer & {
  type: "text";
  [key: string]: unknown;
} | ImageLayer & {
  type: "image";
  [key: string]: unknown;
} | GroupLayer & {
  type: "group";
  [key: string]: unknown;
} | SvgLayer & {
  type: "svg";
  [key: string]: unknown;
}) & {
  /** Stable id, `layer_<ULID>`. */
  id: LayerId;
  /** Human-facing name. Not an identifier. */
  name?: string | null;
  /** Placement in the parent's coordinate space. */
  transform: Transform;
  /** Opacity from 0 (invisible) to 1 (opaque). */
  opacity?: number;
  /** Whether the layer is rendered at all. */
  visible?: boolean;
  /** Whether editing tools should refuse to move this layer. */
  locked?: boolean;
  /** Whether AI adapters and agents may change this layer at all. */
  protected?: boolean;
  /** Whether the layer is inspectable but never mutable through the API. */
  readOnly?: boolean;
  /** Reserved (v0.5): only `normal` is rendered today; other values */
  blendMode?: BlendMode;
  /** Reserved (v1.x effect stack): preserved verbatim, never interpreted. */
  effects?: unknown[];
  /** Reserved (layout constraints): preserved verbatim, never interpreted. */
  constraints?: unknown;
  [key: string]: unknown;
};

/// Identifier of a layer.
export type LayerId = string;

/// Position, size, and rotation of a layer in its parent's coordinate space.
export type Transform = {
  /** Left edge. */
  x: number;
  /** Top edge. */
  y: number;
  /** Box width; must be finite and not negative. */
  width: number;
  /** Box height; must be finite and not negative. */
  height: number;
  /** Clockwise rotation in degrees about the box centre. */
  rotation?: number;
  [key: string]: unknown;
};

/// How a layer composites onto what is beneath it.
/// 
/// `normal`, `multiply`, and `screen` are rendered. The remaining CSS blend
/// modes arrive in v1.x; until then a document that names one keeps the name
/// verbatim — [`BlendMode::Other`] — and renders as `Normal`. Losing the value
/// would mean a document written by a newer build came back damaged, which is
/// the one thing the schema's round-trip promise rules out.
export type BlendMode = "normal" | "multiply" | "screen" | string;

/// Horizontal text alignment inside the layer box.
export type TextAlign = "left" | "center" | "right";

/// Text content and its single style. Per-run styling arrives in v2.0.
export type TextLayer = {
  /** The text. `\n` starts a new line. */
  text: string;
  /** Font family name, resolved against the caller's font set. */
  fontFamily: string;
  /** Font size in pixels; must be positive and finite. */
  fontSize: number;
  /** Fill colour. */
  color?: Color;
  /** Horizontal alignment within the layer box. */
  align?: TextAlign;
  /** Line height as a multiple of the font size. */
  lineHeight?: number;
  /** Reserved (v2.0 styled runs): preserved verbatim, never interpreted. */
  runs?: unknown[];
  [key: string]: unknown;
};

/// How an image is scaled into its box.
export type ImageFit = "fill" | "contain" | "cover";

/// A reference to an imported asset, drawn into the layer box.
export type ImageLayer = {
  /** Id of an asset in the document's `assets` list. */
  asset: AssetId;
  /** How the image fills its box. */
  fit?: ImageFit;
  [key: string]: unknown;
};

/// A group of layers, transformed as a unit.
export type GroupLayer = {
  /** Children, bottom first, positioned relative to the group. */
  children?: Layer[];
  [key: string]: unknown;
};

/// A reference to an imported SVG asset, drawn into the layer box.
/// 
/// Separate from [`ImageLayer`] because an SVG is vector: it scales without
/// loss, and it went through the import sanitiser (`crate::svg_import`) before
/// it was stored. Nothing in a project's `assets/` directory carries scripts
/// or external references.
export type SvgLayer = {
  /** Id of an asset in the document's `assets` list. */
  asset: AssetId;
  /** How the graphic fills its box. */
  fit?: ImageFit;
  [key: string]: unknown;
};

/// A whole document: canvas, imported assets, and the layer stack.
export type Document = {
  /** Schema version of this document, independent of the release version. */
  schemaVersion: number;
  /** Stable id, `doc_<ULID>`. */
  id: DocumentId;
  /** How many mutations this document has had. */
  version?: number;
  /** Human-facing name. Not an identifier. */
  name?: string | null;
  /** Canvas the layers are composed on. */
  canvas: Canvas;
  /** Assets imported into the project, referenced by image layers. */
  assets?: Asset[];
  /** Layers, bottom first: array order is z-order. */
  layers?: Layer[];
  [key: string]: unknown;
};

