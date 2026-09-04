export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RotatedRect extends Rect {
  rotation: number;
}

function rotate(x: number, y: number, degrees: number): { x: number; y: number } {
  const radians = (degrees * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

/** The canvas-axis box occupied by a rectangle rotated about its centre. */
export function rotatedRectBounds(rect: RotatedRect): Rect {
  const radians = (rect.rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const width = rect.width * cos + rect.height * sin;
  const height = rect.width * sin + rect.height * cos;
  const centreX = rect.x + rect.width / 2;
  const centreY = rect.y + rect.height / 2;
  return {
    x: centreX - width / 2,
    y: centreY - height / 2,
    width,
    height,
  };
}

/** The canvas-axis box containing every rotated item in a multi-selection. */
export function selectionBounds(rects: RotatedRect[]): Rect {
  if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const boxes = rects.map(rotatedRectBounds);
  const left = Math.min(...boxes.map((rect) => rect.x));
  const top = Math.min(...boxes.map((rect) => rect.y));
  const right = Math.max(...boxes.map((rect) => rect.x + rect.width));
  const bottom = Math.max(...boxes.map((rect) => rect.y + rect.height));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/** Resize an unrotated rectangle using a canvas-axis pointer delta. */
export function resizedBounds(
  bounds: Rect,
  handle: string,
  dx: number,
  dy: number,
): Rect {
  let { x, y, width, height } = bounds;
  if (handle.includes("e")) width = Math.max(1, width + dx);
  if (handle.includes("s")) height = Math.max(1, height + dy);
  if (handle.includes("w")) {
    const next = Math.max(1, width - dx);
    x += width - next;
    width = next;
  }
  if (handle.includes("n")) {
    const next = Math.max(1, height - dy);
    y += height - next;
    height = next;
  }
  return { x, y, width, height };
}

/**
 * Resize a rotated rectangle in its own axes.
 *
 * Pointer movement is projected into the layer's local coordinate system.
 * The changed local box is then rotated back around the original centre,
 * which keeps the handle's opposite anchor fixed on the canvas.
 */
export function resizedRotatedBounds(
  bounds: Rect,
  rotation: number,
  handle: string,
  dx: number,
  dy: number,
): Rect {
  if (rotation === 0) return resizedBounds(bounds, handle, dx, dy);
  const localDelta = rotate(dx, dy, -rotation);
  const local = resizedBounds(
    { x: 0, y: 0, width: bounds.width, height: bounds.height },
    handle,
    localDelta.x,
    localDelta.y,
  );
  const localCentreShift = {
    x: local.x + local.width / 2 - bounds.width / 2,
    y: local.y + local.height / 2 - bounds.height / 2,
  };
  const centreShift = rotate(localCentreShift.x, localCentreShift.y, rotation);
  const centreX = bounds.x + bounds.width / 2 + centreShift.x;
  const centreY = bounds.y + bounds.height / 2 + centreShift.y;
  return {
    x: centreX - local.width / 2,
    y: centreY - local.height / 2,
    width: local.width,
    height: local.height,
  };
}

/**
 * The box a newly imported asset is given on a canvas.
 *
 * The engine records an asset's pixel dimensions at import, so an upload can
 * arrive at its own shape instead of a fixed 300×200 that squashed everything
 * that was not 3:2. Scaled down to fit the canvas but never up: a small icon
 * dropped onto a poster should stay a small icon.
 *
 * The fallback matters as much as the sizing. `width` and `height` are
 * optional in the document model — an SVG without a `viewBox` genuinely has no
 * pixel size — and guessing one from the markup would be inventing a number
 * the engine did not record.
 */
export function placedAssetSize(
  asset: { width?: number | null; height?: number | null },
  canvas: { width: number; height: number },
): { width: number; height: number } {
  const width = asset.width ?? 0;
  const height = asset.height ?? 0;
  if (!(width > 0) || !(height > 0)) return { width: 300, height: 200 };
  const scale = Math.min(canvas.width / width, canvas.height / height, 1);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Scale one layer around its centre within a selection's canvas-axis box. */
export function resizeItemInSelection(
  item: Rect,
  selection: Rect,
  resizedSelection: Rect,
): Rect {
  const scaleX = resizedSelection.width / Math.max(1, selection.width);
  const scaleY = resizedSelection.height / Math.max(1, selection.height);
  const centreX = resizedSelection.x +
    (item.x + item.width / 2 - selection.x) * scaleX;
  const centreY = resizedSelection.y +
    (item.y + item.height / 2 - selection.y) * scaleY;
  const width = Math.max(1, item.width * scaleX);
  const height = Math.max(1, item.height * scaleY);
  return {
    x: centreX - width / 2,
    y: centreY - height / 2,
    width,
    height,
  };
}
