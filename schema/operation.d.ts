// Assemblash operations — the one mutating input of every transport.
// Generated from the Rust types — do not edit. Regenerate with:
//   cargo run -p assemblash-core --example generate-schema

/// Where a new layer goes.
export type LayerPosition = {
  /** Index in the layer list; `None` means on top of everything. */
  index?: number | null;
  at: "root";
  [key: string]: unknown;
} | {
  /** The group to place it in. */
  parent: LayerId;
  /** Index among the group's children; `None` means on top. */
  index?: number | null;
  at: "in";
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

/// An sRGB colour, `#rrggbb` or `#rrggbbaa`.
/// 
/// Stored as written so a document round-trips exactly; validation checks the
/// shape and [`Color::to_rgba`] parses it.
export type Color = string;

/// Horizontal text alignment inside the layer box.
export type TextAlign = "left" | "center" | "right";

/// Identifier of an imported asset.
export type AssetId = string;

/// How an image is scaled into its box.
export type ImageFit = "fill" | "contain" | "cover";

/// Add a layer to the document.
export type CreateLayer = ({
  /** The text; `\n` starts a new line. */
  text: string;
  /** Font family, resolved at render time against the caller's fonts. */
  fontFamily: string;
  /** Font size in pixels. */
  fontSize: number;
  /** Fill colour. */
  color?: Color;
  /** Horizontal alignment in the box. */
  align?: TextAlign;
  /** Line height as a multiple of the font size. */
  lineHeight?: number;
  type: "text";
  [key: string]: unknown;
} | {
  /** The asset to draw. */
  asset: AssetId;
  /** How it fills its box. */
  fit?: ImageFit;
  type: "image";
  [key: string]: unknown;
} | {
  type: "group";
  [key: string]: unknown;
} | {
  /** The asset to draw. */
  asset: AssetId;
  /** How it fills its box. */
  fit?: ImageFit;
  type: "svg";
  [key: string]: unknown;
}) & {
  /** Where it goes. */
  position?: LayerPosition;
  /** Its box in the parent's coordinate space. */
  transform: Transform;
  /** Optional human-facing name. */
  name?: string | null;
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

/// Change properties of an existing layer.
/// 
/// Every field is optional and means "leave alone" when absent. `name` is
/// doubly optional: `Some(None)` clears the name, `None` leaves it.
export type UpdateLayer = {
  /** The layer to change. */
  id: LayerId;
  /** New name, or `Some(None)` to remove it. */
  name?: string | null;
  /** Replace the whole transform. */
  transform?: Transform | null;
  /** New opacity. */
  opacity?: number | null;
  /** Show or hide. */
  visible?: boolean | null;
  /** Lock or unlock. */
  locked?: boolean | null;
  /** How the layer composites onto what is beneath it. */
  blendMode?: BlendMode | null;
  /** Replace the whole effect stack. */
  effects?: Effect[] | null;
  /** Text layers: new text. */
  text?: string | null;
  /** Text layers: new font family. */
  fontFamily?: string | null;
  /** Text layers: new font size. */
  fontSize?: number | null;
  /** Text layers: new colour. */
  color?: Color | null;
  /** Text layers: new alignment. */
  align?: TextAlign | null;
  /** Text layers: new line height. */
  lineHeight?: number | null;
  /** Image layers: new fit. */
  fit?: ImageFit | null;
  /** Image and SVG layers: draw a different asset. */
  asset?: AssetId | null;
  /** Change the layer even though it is locked. */
  allowLocked?: boolean;
  [key: string]: unknown;
};

/// Which edge or axis an alignment lines up.
export type AlignEdge = "left" | "right" | "top" | "bottom" | "centerHorizontal" | "centerVertical";

/// Which way an operation works.
export type Axis = "horizontal" | "vertical" | "both";

/// What a layer is snapped to.
export type SnapTarget = {
  /** The layer to snap against. */
  id: LayerId;
  /** Which of its edges. */
  edge: AlignEdge;
  to: "layer";
  [key: string]: unknown;
} | {
  /** Which canvas edge. */
  edge: AlignEdge;
  to: "canvas";
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

/// One mutation of a document.
export type Operation = CreateLayer & {
  op: "create";
  [key: string]: unknown;
} | UpdateLayer & {
  op: "update";
  [key: string]: unknown;
} | {
  /** Layer to remove. */
  id: LayerId;
  op: "delete";
  [key: string]: unknown;
} | {
  /** Layer to copy. */
  id: LayerId;
  op: "duplicate";
  [key: string]: unknown;
} | {
  /** Layer to move. */
  id: LayerId;
  /** Distance along x. */
  dx: number;
  /** Distance along y. */
  dy: number;
  op: "move";
  [key: string]: unknown;
} | {
  /** Layer to resize. */
  id: LayerId;
  /** New width. */
  width: number;
  /** New height. */
  height: number;
  op: "resize";
  [key: string]: unknown;
} | {
  /** Layer to rotate. */
  id: LayerId;
  /** Degrees clockwise about the layer's centre. */
  degrees: number;
  op: "rotate";
  [key: string]: unknown;
} | {
  /** Layer to move. */
  id: LayerId;
  /** Where it should end up. */
  to: LayerPosition;
  op: "reorder";
  [key: string]: unknown;
} | {
  /** Layers to wrap. They must currently share a parent. */
  ids: LayerId[];
  /** Optional name for the new group. */
  name?: string | null;
  op: "group";
  [key: string]: unknown;
} | {
  /** The group to dissolve. */
  id: LayerId;
  op: "ungroup";
  [key: string]: unknown;
} | {
  /** Layer to change. */
  id: LayerId;
  /** Whether it renders. */
  visible: boolean;
  op: "setVisible";
  [key: string]: unknown;
} | {
  /** Layer to change. */
  id: LayerId;
  /** Whether editing operations refuse to touch it. */
  locked: boolean;
  op: "setLocked";
  [key: string]: unknown;
} | {
  /** Layer to rename. */
  id: LayerId;
  /** The new name, or `None` to clear it. */
  name?: string | null;
  op: "rename";
  [key: string]: unknown;
} | {
  /** Layers to line up. */
  ids: LayerId[];
  /** Which edge or centre line. */
  edge: AlignEdge;
  op: "align";
  [key: string]: unknown;
} | {
  /** Layers to move. */
  ids: LayerId[];
  /** Which axis to centre on. */
  axis: Axis;
  op: "centerOnCanvas";
  [key: string]: unknown;
} | {
  /** Layers to spread out. */
  ids: LayerId[];
  /** Which axis to spread along. */
  axis: Axis;
  op: "distribute";
  [key: string]: unknown;
} | {
  /** Layer to move. */
  id: LayerId;
  /** What to snap it against. */
  target: SnapTarget;
  op: "snapTo";
  [key: string]: unknown;
} | {
  /** The preset to store. */
  preset: Preset;
  op: "definePreset";
  [key: string]: unknown;
} | {
  /** The preset to remove. */
  name: string;
  op: "deletePreset";
  [key: string]: unknown;
} | {
  /** The slot to declare. */
  slot: Slot;
  op: "defineSlot";
  [key: string]: unknown;
} | {
  /** Which slot to change. */
  name: string;
  /** The slot's new content. Its `name` may differ, which renames it. */
  slot: Slot;
  op: "updateSlot";
  [key: string]: unknown;
} | {
  /** Which slot to remove. */
  name: string;
  op: "removeSlot";
  [key: string]: unknown;
} | {
  /** Layer to restyle. */
  id: LayerId;
  /** Name of the preset to apply. */
  preset: string;
  /** Apply to a locked layer. */
  allow_locked?: boolean;
  op: "applyPreset";
  [key: string]: unknown;
};

