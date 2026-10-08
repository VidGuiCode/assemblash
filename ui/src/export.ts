// Resolution-aware export for the reference interface.
//
// Exporting happens in the Rust renderer, not in a browser canvas. That keeps
// preview and export on the same deterministic path and makes 8K independent
// of browser texture-size limits. The UI only chooses an output size and
// reports what the engine produced.

import * as api from "./api.js";
import { t } from "./i18n.js";
import type { Document } from "./api.js";

interface Resolution {
  id: "original" | "2k" | "4k" | "8k";
  label: string;
  detail: string;
  longEdge: number | null;
  icon: string;
}

export interface ExportDimensions {
  width: number;
  height: number;
  scale: number;
}

/** Which of the engine's two renders is being taken away. */
export type ExportFormat = "png" | "svg";

interface Format {
  id: ExportFormat;
  label: string;
  detail: string;
  icon: string;
}

/**
 * The two things the engine can hand over.
 *
 * PNG goes through `export`, which writes a file into the project and is what
 * every other surface produces. SVG is the same render one stage earlier, read
 * straight from `preview.svg`: there is no rasterizing left to choose a size
 * for, which is why picking it puts the resolution row out of use rather than
 * quietly ignoring it.
 */
export const FORMATS: readonly Format[] = [
  { id: "png", label: "PNG", detail: t("export.pngDetail"), icon: "ph-image" },
  { id: "svg", label: "SVG", detail: t("export.svgDetail"), icon: "ph-file-svg" },
] as const;

/** Where a chosen format's bytes are read from, and what they are called. */
export function downloadTargetFor(
  format: ExportFormat,
  project: string,
  document: Document,
  name: string,
): { url: string; filename: string } {
  if (format === "svg") {
    return {
      url: api.svgUrl(project, api.versionOf(document)),
      filename: `${name}.svg`,
    };
  }
  return { url: api.exportUrl(project, name), filename: `${name}.png` };
}

export const RESOLUTIONS: readonly Resolution[] = [
  {
    id: "original",
    label: t("export.original"),
    detail: t("export.documentSize"),
    longEdge: null,
    icon: "ph-frame-corners",
  },
  { id: "2k", label: "2K", detail: t("export.longEdge2k"), longEdge: 2048, icon: "ph-image" },
  { id: "4k", label: "4K", detail: t("export.longEdge4k"), longEdge: 3840, icon: "ph-image-square" },
  { id: "8k", label: t("export.resolution8k"), detail: t("export.longEdge8k"), longEdge: 7680, icon: "ph-sparkle" },
] as const;

/** Exact output dimensions for a document and a selected resolution. */
export function dimensionsFor(
  document: Document,
  resolution: (typeof RESOLUTIONS)[number],
): ExportDimensions {
  const width = document.canvas.width;
  const height = document.canvas.height;
  const scale =
    resolution.longEdge === null ? 1 : resolution.longEdge / Math.max(width, height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}
