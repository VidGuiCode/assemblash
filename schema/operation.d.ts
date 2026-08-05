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
};

