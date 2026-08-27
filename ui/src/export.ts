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
    options: el<HTMLDivElement>("export-options"),
    name: el<HTMLInputElement>("export-name"),
    summary: el<HTMLDivElement>("export-summary"),
    confirm: el<HTMLButtonElement>("export-confirm"),
    download: el<HTMLAnchorElement>("export-download"),
  };

  let selected: Resolution["id"] = "8k";
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
    const resolution = selectedResolution();
    const output = dimensionsFor(document, resolution);
    dom.summary.replaceChildren();

    const icon = window.document.createElement("i");
    icon.className = "ph ph-cpu";
    icon.setAttribute("aria-hidden", "true");
    const copy = window.document.createElement("span");
    const dimensions = window.document.createElement("strong");
    dimensions.textContent = `${output.width.toLocaleString()} × ${output.height.toLocaleString()}`;
    copy.append(
      dimensions,
      window.document.createTextNode(" PNG · rendered locally by the deterministic engine"),
    );
    dom.summary.append(icon, copy);
  }

  function drawOptions(): void {
    dom.options.replaceChildren();
    for (const resolution of RESOLUTIONS) {
      const output = host.document() ? dimensionsFor(host.document()!, resolution) : null;
      const button = window.document.createElement("button");
      button.type = "button";
      button.className = "export-option";
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(resolution.id === selected));
      if (resolution.id === selected) button.classList.add("selected");

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
    drawOptions();
    drawSummary();
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

    const resolution = selectedResolution();
    const output = dimensionsFor(document, resolution);
    const name = safeName(dom.name.value);
    dom.name.value = name;

    void host.guard("export", async () => {
      releaseDownload();
      dom.confirm.disabled = true;
      dom.confirm.innerHTML = '<i class="ph ph-circle-notch" aria-hidden="true"></i> Rendering…';
      dom.summary.textContent = `Rendering ${output.width.toLocaleString()} × ${output.height.toLocaleString()}…`;
      try {
        const result = await api.exportDocument(project, name, output.scale);
        heldDownload = await api.imageObjectUrl(api.exportUrl(project, name));
        dom.download.href = heldDownload;
        dom.download.download = `${name}.png`;
        dom.download.hidden = false;
        dom.summary.innerHTML = `<strong>${result.width.toLocaleString()} × ${result.height.toLocaleString()}</strong> PNG · ${humanBytes(result.bytes)} · ready to download`;
        host.say(
          `Exported ${result.width.toLocaleString()} × ${result.height.toLocaleString()} PNG.`,
        );
      } finally {
        dom.confirm.disabled = false;
        dom.confirm.innerHTML = '<i class="ph ph-export" aria-hidden="true"></i> Export PNG';
      }
    });
  });

  dom.dialog.addEventListener("close", () => {
    if (dom.dialog.returnValue === "cancel") releaseDownload();
  });

  return { open };
}
