// Filling templates from the page (PRD use case C).
//
// The last thing the interface could not do that every other surface could.
// It is deliberately a thin client: the form is generated from the slot
// definitions the engine reports, the values are posted to the same variants
// endpoint the CLI reaches through the same function, and nothing here knows
// how a slot is filled. That is why protected chrome stays unreachable from
// this panel without the panel containing a single permission check —
// filling is an ordinary `Update` operation and refuses where everything
// else does.
//
// Its own module because `app.ts` is already the largest file in the
// interface and this is a self-contained concern.

import * as api from "./api.js";
import type { Document, Slot } from "./api.js";

/** What the panel needs from the rest of the interface. */
export interface Host {
  /** The open project, or null. */
  project(): string | null;
  /** The document as the page last read it. */
  document(): Document | null;
  /** Says something in the shared status line. */
  say(message: string, kind?: "info" | "error"): void;
  /** Runs something that talks to the engine, reporting what it refuses. */
  guard(what: string, run: () => Promise<void>): Promise<void>;
  /** Re-reads the document, after an upload changes it. */
  refresh(): Promise<void>;
}

function el<T extends HTMLElement>(id: string): T {
  const found = window.document.getElementById(id);
  if (!found) throw new Error(`missing element #${id}`);
  return found as T;
}

/** Slot kind, with the schema's default applied. */
function kindOf(slot: Slot): "text" | "image" | "color" {
  return slot.kind ?? "text";
}

export function mountTemplates(host: Host): { projectChanged: () => Promise<void> } {
  const dom = {
    panel: el<HTMLElement>("templates"),
    form: el<HTMLDivElement>("slot-form"),
    variantName: el<HTMLInputElement>("variant-name"),
    preview: el<HTMLButtonElement>("preview-variant"),
    addRow: el<HTMLButtonElement>("add-variant"),
    loadValues: el<HTMLButtonElement>("load-values"),
    valuesFile: el<HTMLInputElement>("values-file"),
    clearBatch: el<HTMLButtonElement>("clear-batch"),
    renderBatch: el<HTMLButtonElement>("render-batch"),
    rows: el<HTMLOListElement>("variant-rows"),
    gallery: el<HTMLDivElement>("gallery"),
    imageFile: el<HTMLInputElement>("slot-image-file"),
  };

  /** The slots this project offers, empty when it is not a template. */
  let slots: Slot[] = [];
  /** Current form values, by slot name. */
  const values = new Map<string, string>();
  /** The batch waiting to be rendered. */
  let batch: api.Variant[] = [];
  /** Blob URLs the gallery is holding, so they can be given back. */
  let held: string[] = [];
  /** The slot an upload was started for, so the new asset lands in it. */
  let uploadingFor: string | null = null;

  function releaseGallery(): void {
    for (const url of held) URL.revokeObjectURL(url);
    held = [];
  }

  /** The values as the engine wants them: names to strings, empties left out. */
  function currentValues(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const slot of slots) {
      const value = values.get(slot.name);
      // An empty field means "leave the template's own content", which is
      // exactly what omitting the name does. A required slot left empty is
      // refused by the engine, in its own words.
      if (value) out[slot.name] = value;
    }
    return out;
  }

  function drawForm(): void {
    dom.form.replaceChildren();
    const assets = host.document()?.assets ?? [];

    for (const slot of slots) {
      const kind = kindOf(slot);
      const wrapper = window.document.createElement("label");
      wrapper.className = "field slot";
      wrapper.dataset["slot"] = slot.name;

      const label = window.document.createElement("span");
      label.className = "slot-name";
      label.textContent = slot.required ? `${slot.name} *` : slot.name;
      if (slot.description) label.title = slot.description;
      wrapper.append(label);

      if (kind === "image") {
        // An image slot takes an asset id, so the field offers what the
        // project actually has rather than a box to mistype an id into.
        const select = window.document.createElement("select");
        select.dataset["slot"] = slot.name;
        const none = window.document.createElement("option");
        none.value = "";
        none.textContent = assets.length ? "— leave as it is —" : "no images imported yet";
        select.append(none);
        for (const asset of assets) {
          const option = window.document.createElement("option");
          option.value = asset.id;
          option.textContent = asset.path;
          select.append(option);
        }
        select.value = values.get(slot.name) ?? "";
        select.addEventListener("change", () => values.set(slot.name, select.value));
        wrapper.append(select);

        const upload = window.document.createElement("button");
        upload.type = "button";
        upload.className = "small";
        upload.textContent = "Import…";
        upload.addEventListener("click", () => {
          uploadingFor = slot.name;
          dom.imageFile.click();
        });
        wrapper.append(upload);
      } else {
        const input = window.document.createElement("input");
        input.type = kind === "color" ? "color" : "text";
        input.dataset["slot"] = slot.name;
        input.value = values.get(slot.name) ?? (kind === "color" ? "#000000" : "");
        if (kind === "color" && !values.has(slot.name)) {
          // A colour input has no empty state, so what it shows is what it
          // would send: record it rather than pretending nothing is set.
          values.set(slot.name, input.value);
        }
        input.addEventListener("input", () => values.set(slot.name, input.value));
        wrapper.append(input);
      }

      if (slot.description) {
        const hint = window.document.createElement("span");
        hint.className = "slot-hint";
        hint.textContent = slot.description;
        wrapper.append(hint);
      }
      dom.form.append(wrapper);
    }
  }

  function drawRows(): void {
    dom.rows.replaceChildren();
    for (const [index, variant] of batch.entries()) {
      const item = window.document.createElement("li");
      const name = window.document.createElement("span");
      name.className = "variant-name";
      name.textContent = variant.name;
      const summary = window.document.createElement("span");
      summary.className = "variant-values";
      summary.textContent = Object.entries(variant.values)
        .map(([key, value]) => `${key}=${value}`)
        .join("  ");
      const remove = window.document.createElement("button");
      remove.type = "button";
      remove.className = "small";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        batch.splice(index, 1);
        drawRows();
      });
      item.append(name, summary, remove);
      dom.rows.append(item);
    }
    dom.renderBatch.disabled = batch.length === 0;
    dom.clearBatch.disabled = batch.length === 0;
    dom.renderBatch.textContent = batch.length
      ? `Render ${batch.length} variant${batch.length === 1 ? "" : "s"}`
      : "Render batch";
  }

  /**
   * Shows what a batch produced.
   *
   * The images are fetched rather than pointed at, like every other image in
   * this interface: an `<img src>` cannot carry the access token, and the
   * token must never travel in a URL.
   */
  async function drawGallery(project: string, rendered: api.RenderedVariants): Promise<void> {
    releaseGallery();
    dom.gallery.replaceChildren();
    for (const variant of rendered.variants) {
      const figure = window.document.createElement("figure");
      figure.className = "variant";

      const url = await api.imageObjectUrl(api.exportUrl(project, variant.name));
      held.push(url);
      const image = window.document.createElement("img");
      image.src = url;
      image.alt = `Variant ${variant.name}`;
      figure.append(image);

      const caption = window.document.createElement("figcaption");
      const name = window.document.createElement("strong");
      name.textContent = variant.name;
      const size = window.document.createElement("span");
      size.textContent = `${variant.width}×${variant.height} · ${variant.bytes} bytes`;
      const hash = window.document.createElement("code");
      // Short in the caption, whole on hover: the short form is for
      // recognising it, the whole one for comparing it with what the CLI
      // printed.
      hash.textContent = variant.hash.replace(/^sha256:/, "").slice(0, 12);
      hash.title = variant.hash;
      const download = window.document.createElement("a");
      download.href = url;
      download.download = `${variant.name}.png`;
      download.textContent = "Download";
      caption.append(name, size, hash, download);
      figure.append(caption);
      dom.gallery.append(figure);
    }
  }

  async function render(what: string, variants: api.Variant[]): Promise<void> {
    await host.guard(what, async () => {
      const project = host.project();
      if (!project) return;
      const rendered = await api.renderVariants(project, variants);
      await drawGallery(project, rendered);
      host.say(
        `${what}: ${rendered.variants.length} rendered from version ${rendered.templateVersion}`,
      );
    });
  }

  dom.preview.addEventListener("click", () => {
    // A preview is a batch of one, through the same endpoint. Two code paths
    // would be two chances for the preview and the batch to disagree.
    void render("preview", [{ name: "preview", values: currentValues() }]);
  });

  dom.addRow.addEventListener("click", () => {
    const name = dom.variantName.value.trim();
    if (!name) {
      host.say("a variant needs a name — it becomes the file name", "error");
      return;
    }
    batch.push({ name, values: currentValues() });
    dom.variantName.value = "";
    drawRows();
    host.say(`${name} added to the batch`);
  });

  dom.clearBatch.addEventListener("click", () => {
    batch = [];
    drawRows();
  });

  dom.renderBatch.addEventListener("click", () => void render("batch", batch));

  dom.loadValues.addEventListener("click", () => dom.valuesFile.click());

  dom.valuesFile.addEventListener("change", () => {
    const file = dom.valuesFile.files?.[0];
    dom.valuesFile.value = "";
    if (!file) return;
    void host.guard("load values", async () => {
      const text = await file.text();
      // The same file `assemblash variants --values` takes, so a batch that
      // works at the command line works here. Checked before it is used:
      // a helpful message beats a confusing refusal from the engine.
      const parsed: unknown = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("expected a JSON array of variants");
      const loaded: api.Variant[] = [];
      for (const entry of parsed) {
        const row = entry as { name?: unknown; values?: unknown };
        if (typeof row.name !== "string") {
          throw new Error('every variant needs a "name"');
        }
        const rowValues: Record<string, string> = {};
        for (const [key, value] of Object.entries(row.values ?? {})) {
          rowValues[key] = String(value);
        }
        loaded.push({ name: row.name, values: rowValues });
      }
      batch = loaded;
      drawRows();
      host.say(`loaded ${batch.length} variants from ${file.name}`);
    });
  });

  dom.imageFile.addEventListener("change", () => {
    const file = dom.imageFile.files?.[0];
    dom.imageFile.value = "";
    const slot = uploadingFor;
    uploadingFor = null;
    if (!file || !slot) return;
    void host.guard("import image", async () => {
      const project = host.project();
      if (!project) return;
      const uploaded = await api.uploadAsset(project, file);
      values.set(slot, uploaded.asset.id);
      // The document now has an asset it did not have, and the select is
      // built from the document.
      await host.refresh();
      drawForm();
      host.say(`imported ${file.name} into ${slot}`);
    });
  });

  /** Re-reads what this project offers, after the open project changes. */
  async function projectChanged(): Promise<void> {
    const project = host.project();
    values.clear();
    batch = [];
    releaseGallery();
    dom.gallery.replaceChildren();
    drawRows();

    if (!project) {
      slots = [];
      dom.panel.hidden = true;
      return;
    }
    const list = await api.getSlots(project);
    slots = list.isTemplate ? list.slots : [];
    // A project with no slots is not a template, and a panel offering to fill
    // nothing is worse than no panel.
    dom.panel.hidden = slots.length === 0;
    drawForm();
  }

  return { projectChanged };
}
