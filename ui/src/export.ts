// Resolution-aware export for the reference interface.
//
// Exporting happens in the Rust renderer, not in a browser canvas. That keeps
// preview and export on the same deterministic path and makes 8K independent
// of browser texture-size limits. The UI only chooses an output size and
// reports what the engine produced.

import * as api from "./api.js";
import type { Document } from "./api.js";

interface ExportHost {
  project(): string | null;
  document(): Document | null;
  say(message: string, kind?: "info" | "error"): void;
  guard(what: string, run: () => Promise<void>): Promise<void>;
}

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
  { id: "png", label: "PNG", detail: "Rasterized by the engine", icon: "ph-image" },
  { id: "svg", label: "SVG", detail: "Vector, document size", icon: "ph-file-svg" },
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
    label: "Original",
    detail: "Document size",
    longEdge: null,
    icon: "ph-frame-corners",
  },
  { id: "2k", label: "2K", detail: "2,048 px long edge", longEdge: 2048, icon: "ph-image" },
  { id: "4k", label: "4K", detail: "3,840 px long edge", longEdge: 3840, icon: "ph-image-square" },
  { id: "8k", label: "8K Ultra", detail: "7,680 px long edge", longEdge: 7680, icon: "ph-sparkle" },
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

function el<T extends HTMLElement>(id: string): T {
  const found = window.document.getElementById(id);
  if (!found) throw new Error(`missing element #${id}`);
  return found as T;
}

function safeName(value: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return cleaned || "assemblash-export";
}

function humanBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mountExport(host: ExportHost): { open: () => void } {
  const dom = {
    dialog: el<HTMLDialogElement>("export-dialog"),
    form: el<HTMLFormElement>("export-form"),
    formats: el<HTMLDivElement>("export-formats"),
    options: el<HTMLDivElement>("export-options"),
    resolutionRow: el<HTMLDivElement>("export-resolution-row"),
    name: el<HTMLInputElement>("export-name"),
    summary: el<HTMLDivElement>("export-summary"),
    confirm: el<HTMLButtonElement>("export-confirm"),
    download: el<HTMLAnchorElement>("export-download"),
  };

  let selected: Resolution["id"] = "8k";
  let format: ExportFormat = "png";
  let heldDownload: string | null = null;

  function selectedResolution(): Resolution {
    return RESOLUTIONS.find(({ id }) => id === selected) ?? RESOLUTIONS[0]!;
  }

  function releaseDownload(): void {
    if (heldDownload) URL.revokeObjectURL(heldDownload);
    heldDownload = null;
    dom.download.hidden = true;
    dom.download.removeAttribute("href");
  }

  function drawSummary(): void {
    const document = host.document();
    if (!document) {
      dom.summary.textContent = "Open a project to export.";
      return;
    }
    const output =
      format === "svg"
        ? { width: document.canvas.width, height: document.canvas.height }
        : dimensionsFor(document, selectedResolution());
    dom.summary.replaceChildren();

    const icon = window.document.createElement("i");
    icon.className = "ph ph-cpu";
    icon.setAttribute("aria-hidden", "true");
    const copy = window.document.createElement("span");
    const dimensions = window.document.createElement("strong");
    dimensions.textContent = `${output.width.toLocaleString()} × ${output.height.toLocaleString()}`;
    copy.append(
      dimensions,
      window.document.createTextNode(
        format === "svg"
          ? " SVG · the engine's own vector render"
          : " PNG · rendered locally by the deterministic engine",
      ),
    );
    dom.summary.append(icon, copy);
  }

  function drawFormats(): void {
    dom.formats.replaceChildren();
    for (const one of FORMATS) {
      const button = window.document.createElement("button");
      button.type = "button";
      button.className = "export-option";
      button.dataset["format"] = one.id;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(one.id === format));
      if (one.id === format) button.classList.add("selected");

      const icon = window.document.createElement("i");
      icon.className = `ph ${one.icon}`;
      icon.setAttribute("aria-hidden", "true");
      const label = window.document.createElement("b");
      label.textContent = one.label;
      const detail = window.document.createElement("span");
      detail.textContent = one.detail;
      button.append(icon, label, detail);

      button.addEventListener("click", () => {
        if (format === one.id) return;
        format = one.id;
        releaseDownload();
        drawFormats();
        drawOptions();
        drawSummary();
        drawConfirm();
      });
      dom.formats.append(button);
    }
  }

  function drawConfirm(): void {
    dom.confirm.innerHTML = `<i class="ph ph-export" aria-hidden="true"></i> Export ${format.toUpperCase()}`;
  }

  function drawOptions(): void {
    // A scale means nothing to a vector, so the row is put out of use rather
    // than left looking as though it still decides something.
    const vector = format === "svg";
    dom.resolutionRow.classList.toggle("disabled", vector);
    dom.options.setAttribute("aria-disabled", String(vector));
    dom.options.replaceChildren();
    for (const resolution of RESOLUTIONS) {
      const output = host.document() ? dimensionsFor(host.document()!, resolution) : null;
      const button = window.document.createElement("button");
      button.type = "button";
      button.className = "export-option";
      button.disabled = vector;
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(resolution.id === selected && !vector));
      if (resolution.id === selected && !vector) button.classList.add("selected");

      const icon = window.document.createElement("i");
      icon.className = `ph ${resolution.icon}`;
      icon.setAttribute("aria-hidden", "true");
      const label = window.document.createElement("b");
      label.textContent = resolution.label;
      const detail = window.document.createElement("span");
      detail.textContent = output
        ? `${output.width.toLocaleString()} × ${output.height.toLocaleString()}`
        : resolution.detail;
      button.append(icon, label, detail);

      button.addEventListener("click", () => {
        selected = resolution.id;
        releaseDownload();
        drawOptions();
        drawSummary();
      });
      dom.options.append(button);
    }
  }

  function open(): void {
    const document = host.document();
    const project = host.project();
    if (!document || !project) {
      host.say("Create or open a project before exporting.", "error");
      return;
    }
    releaseDownload();
    dom.name.value = safeName(document.name ?? project);
    drawFormats();
    drawOptions();
    drawSummary();
    drawConfirm();
    dom.dialog.showModal();
  }

  dom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value === "cancel") {
      dom.dialog.close("cancel");
      return;
    }
    if (!dom.form.reportValidity()) return;
    const project = host.project();
    const document = host.document();
    if (!project || !document) return;

    const chosen = format;
    const output =
      chosen === "svg"
        ? { width: document.canvas.width, height: document.canvas.height, scale: 1 }
        : dimensionsFor(document, selectedResolution());
    const name = safeName(dom.name.value);
    dom.name.value = name;
    const target = downloadTargetFor(chosen, project, document, name);

    void host.guard("export", async () => {
      releaseDownload();
      dom.confirm.disabled = true;
      dom.confirm.innerHTML = '<i class="ph ph-circle-notch" aria-hidden="true"></i> Rendering…';
      dom.summary.textContent = `Rendering ${output.width.toLocaleString()} × ${output.height.toLocaleString()}…`;
      try {
        // PNG is written into the project first, because that is what every
        // other surface's export does and the file is meant to stay there.
        // SVG is read straight off the render route: nothing is written, so
        // there is nothing to leave behind.
        const result =
          chosen === "svg"
            ? { width: output.width, height: output.height, bytes: 0 }
            : await api.exportDocument(project, name, output.scale);
        const blob = await api.fetchBlob(target.url);
        heldDownload = URL.createObjectURL(blob);
        dom.download.href = heldDownload;
        dom.download.download = target.filename;
        dom.download.hidden = false;
        const bytes = chosen === "svg" ? blob.size : result.bytes;
        dom.summary.innerHTML = `<strong>${result.width.toLocaleString()} × ${result.height.toLocaleString()}</strong> ${chosen.toUpperCase()} · ${humanBytes(bytes)} · ready to download`;
        host.say(
          `Exported ${result.width.toLocaleString()} × ${result.height.toLocaleString()} ${chosen.toUpperCase()}.`,
        );
      } finally {
        dom.confirm.disabled = false;
        drawConfirm();
      }
    });
  });

  dom.dialog.addEventListener("close", () => {
    if (dom.dialog.returnValue === "cancel") releaseDownload();
  });

  return { open };
}
