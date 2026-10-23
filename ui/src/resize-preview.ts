import type { Document, Layer } from "./api.js";
import type { Rect } from "./geometry.js";

/** Cached pixels are used only for an independent, uppermost paint-stack suffix. */
export function resizePreviewLayers(document: Document, ids: readonly string[]): Layer[] | null {
  const selected = new Set(ids);
  const roots = (document.layers ?? []).filter((layer) => layer.visible !== false);
  const first = roots.findIndex((layer) => selected.has(layer.id));
  if (first < 0 || roots.slice(first).some((layer) => !selected.has(layer.id))) return null;
  const items = roots.slice(first);
  // This also excludes nested selections and parent/descendant duplicates.
  if (items.length !== selected.size) return null;
  if (items.some((layer) => layer.clip || (layer.effects?.length ?? 0) > 0 ||
      (layer.blendMode !== undefined && layer.blendMode !== "normal"))) return null;
  for (const layer of items) {
    if (layer.type === "text") {
      // Browser image sampling cannot preserve translated glyph pixels exactly.
      return null;
    } else if (layer.type === "image") {
      if (layer.fit !== "fill") return null;
    } else if (layer.type === "shape") {
      const shape = layer["shape"];
      if (layer.stroke || typeof layer.fill !== "string" || typeof shape !== "object" || shape === null ||
          !("kind" in shape) || shape.kind !== "rect" || ("cornerRadius" in shape && shape.cornerRadius !== 0)) return null;
    } else return null; // Group box-only semantics use the authoritative-image fallback.
  }
  return items;
}

/** Document-unit affine transform for one cached Rust image. */
export function resizePreviewMatrix(layer: Layer, before: Rect, after: Rect): number[] | null {
  const angle = (layer.transform.rotation ?? 0) * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);
  const fx = layer.transform.flipHorizontal ? -1 : 1;
  const fy = layer.transform.flipVertical ? -1 : 1;
  const halfX = (after.width - before.width) / 2;
  const halfY = (after.height - before.height) / 2;
  const dx = after.x - before.x, dy = after.y - before.y;
  if (layer.type === "text" || layer.type === "group") {
    const qx = c * fx * halfX - s * fy * halfY;
    const qy = s * fx * halfX + c * fy * halfY;
    const flippedGroup = layer.type === "group" && (fx < 0 || fy < 0);
    const result = [1, 0, 0, 1, dx + (flippedGroup ? 0 : halfX) - qx, dy + (flippedGroup ? 0 : halfY) - qy];
    return result.every(Number.isFinite) ? result : null;
  }
  const sx = after.width / before.width, sy = after.height / before.height;
  const a = c * c * sx + s * s * sy;
  const b = c * s * (sx - sy);
  const d = s * s * sx + c * c * sy;
  const x = before.x + before.width / 2, y = before.y + before.height / 2;
  const result = [a, b, b, d, after.x + after.width / 2 - a * x - b * y, after.y + after.height / 2 - b * x - d * y];
  return result.every(Number.isFinite) ? result : null;
}
