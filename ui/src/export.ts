// Resolution-aware export for the reference interface.
//
// Exporting happens in the Rust renderer, not in a browser canvas. That keeps
// preview and export on the same deterministic path and makes 8K independent
// of browser texture-size limits. The UI only chooses an output size and
// reports what the engine produced.

import * as api from "./api.js";
import { t, type MessageKey } from "./i18n.js";
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

/** Which of the engine's renders is being taken away. */
export type ExportFormat = "png" | "svg" | "pdf" | "jpeg" | "webp";

interface Format {
  id: ExportFormat;
  label: string;
  /** The message key of the one-line description under the label. */
  detail: MessageKey;
  icon: string;
}

/**
 * The formats the engine can hand over.
 *
 * PNG goes through `export`, which writes a file into the project and is what
 * every other surface produces. SVG is the same render one stage earlier, read
 * straight from `preview.svg`: there is no rasterizing left to choose a size
 * for, which is why picking it puts the resolution row out of use rather than
 * quietly ignoring it. PDF, JPEG and WebP go through `export` with a format:
 * each one is the PNG render, encoded again. WebP is lossless only, because
 * the engine refuses lossy WebP.
 */
export const FORMATS: readonly Format[] = [
  { id: "png", label: "PNG", detail: "export.pngDetail", icon: "ph-image" },
  { id: "svg", label: "SVG", detail: "export.svgDetail", icon: "ph-file-svg" },
  { id: "pdf", label: "PDF", detail: "export.pdfDetail", icon: "ph-file-pdf" },
  { id: "jpeg", label: "JPEG", detail: "export.jpegDetail", icon: "ph-file-jpg" },
  { id: "webp", label: "WebP", detail: "export.webpDetail", icon: "ph-file-image" },
] as const;

/** The file name extension the engine writes for a format. A JPEG is `.jpg`. */
export function extensionFor(format: ExportFormat): string {
  return format === "jpeg" ? "jpg" : format;
}

/** The JPEG quality the dialog starts with: the engine's own default. */
export const DEFAULT_JPEG_QUALITY = 90;

/** Whether a document has a bleed of more than zero on one side or more. */
export function hasBleed(document: Document): boolean {
  const bleed = document.canvas.bleed;
  if (!bleed) return false;
  return [bleed.top, bleed.right, bleed.bottom, bleed.left]
    .some((value) => typeof value === "number" && value > 0);
}

/** What the person chose in the dialog, beside the format and the size. */
export interface ExportChoice {
  format: ExportFormat;
  /** JPEG quality. Used for JPEG only. */
  quality: number;
  /** Print geometry. Used for PDF only, and only when the document has bleed. */
  print: boolean;
  /** A page set to export as one PDF, or `null` for the visible page only. */
  pageSet: string | null;
}

/**
 * The format fields of the export request for a choice.
 *
 * PNG sends no format fields, so its request is the same as before the
 * other formats. Each field goes only with the format that can use it: the
 * engine refuses a quality, a page set or print with any other format.
 */
export function exportOptionsFor(choice: ExportChoice, document: Document): api.ExportOptions {
  switch (choice.format) {
    case "png":
    case "svg":
      return {};
    case "jpeg":
      return { format: "jpeg", quality: Math.round(choice.quality) };
    case "webp":
      return { format: "webp" };
    case "pdf": {
      const options: api.ExportOptions = { format: "pdf" };
      if (choice.pageSet) options.pages = choice.pageSet;
      if (choice.print && hasBleed(document)) options.print = true;
      return options;
    }
  }
}

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
  const extension = extensionFor(format);
  return { url: api.exportUrl(project, name, extension), filename: `${name}.${extension}` };
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
