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
  /** How this layer composites with what is underneath it. */
  blendMode?: BlendMode;
  /** Adjustments applied to this layer when it is drawn, in order. */
  effects?: Effect[];
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
/// The whole CSS separable-and-non-separable set, every one of which was
/// checked to rasterize before it was named here — a mode that only
/// round-trips would be a promise the pixels do not keep.
///
/// [`BlendMode::Other`] is what a mode written by some newer build becomes:
/// preserved verbatim, because losing it would mean a document came back
/// damaged, but **refused at render time** rather than quietly composited as
/// `normal`. Silently drawing the wrong thing is the worse failure: it looks
/// like it worked.
export type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity" | string;

/// One adjustment in a layer's effect stack.
///
/// Tagged by `type`, so the JSON reads as what it is. [`Effect::Other`] keeps
/// an effect written by a newer build verbatim and refuses to render it —
/// the same bargain as [`BlendMode::Other`]: never lose it, never guess at it.
///
/// The amounts are multipliers where 1 means "unchanged", which is what
/// `filter: brightness(1.2)` means everywhere else, so a number copied from a
/// CSS example does what it looks like it does.
export type Effect = {
  /** The multiplier. */
  amount: number;
  type: "brightness";
  [key: string]: unknown;
} | {
  /** The multiplier. */
  amount: number;
  type: "contrast";
  [key: string]: unknown;
} | {
  /** The multiplier. */
  amount: number;
  type: "saturation";
  [key: string]: unknown;
} | {
  /** Standard deviation, in document units. 0 does nothing. */
  radius: number;
  type: "blur";
  [key: string]: unknown;
} | {
  /** How far the noise swings either side of unchanged, 0 to 1. */
  amount: number;
  /** The noise seed. */
  seed: number;
  /** Size of the noise features; 1 is fine grain, larger is coarser. */
  scale?: number;
  type: "grain";
  [key: string]: unknown;
} | unknown;

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

/// A named bundle of style properties.
export type Preset = {
  /** What it is called. Unique within a document. */
  name: string;
  /** What it is for, for whoever is choosing between presets — including an */
  description?: string | null;
  /** The properties it sets. Anything left out is left alone on apply. */
  properties: PresetProperties;
  [key: string]: unknown;
};

/// What a preset sets.
///
/// Every field optional, and absent means "leave alone" — so a preset that
/// only names a colour is a colour preset, and applying it does not quietly
/// reset a layer's font.
///
/// Deliberately no transform: a style is not a position. A preset that moved
/// layers would be a template, and templates already exist.
export type PresetProperties = {
  /** Text layers: font family. */
  fontFamily?: string | null;
  /** Text layers: font size. */
  fontSize?: number | null;
  /** Text layers: fill colour. */
  color?: Color | null;
  /** Text layers: horizontal alignment. */
  align?: TextAlign | null;
  /** Text layers: line height. */
  lineHeight?: number | null;
  /** Any layer: opacity. */
  opacity?: number | null;
  /** Any layer: how it composites. */
  blendMode?: BlendMode | null;
  /** Any layer: the whole effect stack. */
  effects?: Effect[] | null;
  [key: string]: unknown;
};

/// A named opening in a template.
export type Slot = {
  /** What a caller names this slot by. Unique within a document. */
  name: string;
  /** The layer it fills. */
  layer: LayerId;
  /** What may be supplied for it. */
  kind?: SlotKind;
  /** What this slot is for, for whoever is filling it — including an agent, */
  description?: string | null;
  /** Whether a variant must supply it. */
  required?: boolean;
  [key: string]: unknown;
};

/// What a slot lets a caller supply.
export type SlotKind = "text" | "image" | "color";

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
  /** Named style bundles this document offers. */
  presets?: Preset[];
  /** Named openings a caller may fill, making this document a template */
  slots?: Slot[];
  [key: string]: unknown;
};

