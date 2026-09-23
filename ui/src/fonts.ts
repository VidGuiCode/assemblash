// Managing the font store from the page (DEF-15, decision D22 b).
//
// Until this panel existed the interface could report that a document needed
// a font and then send the person to a terminal to install one — a browser
// telling you to go and use the command line for the one thing it had just
// stopped you doing. The engine already imports, removes, and installs fonts
// over HTTP; this is the surface for it, and nothing here knows what a font
// file is: the extension list is the server's, the refusals are the server's
// words, and the only thing the page decides is what to ask before removing
// something a project may be drawing with.
//
// Its own module for the same reason `templates.ts` is: `app.ts` is already
// the largest file in the interface and this is a self-contained concern.

import * as api from "./api.js";
import { t, formatCount, formatNumber, getLocale } from "./i18n.js";
import type { Document, FontRecord, FontStoreListing } from "./api.js";

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
  /** Re-reads the document and its render, after the store changes. */
  refresh(): Promise<void>;
  /**
   * The store as it now stands: the families, and the faces behind them.
   *
   * The font selector (register DEF-27) reads both: families are the only
   * values it may commit, and faces are what its weight control offers.
   */
  fontsChanged(listing: FontStoreListing): void;
}

/** What this panel offers the rest of the interface. */
export interface FontPanel {
  /** Re-reads the store, redraws the list, and updates the suggestion list. */
  reload(): Promise<void>;
  /** Puts keyboard focus on the install button, when it is showing. */
  focusInstall(): void;
  /** Whether the store had a family the last time it was read. */
  hasFamilies(): boolean;
  /** Releases image URLs when the font manager is hidden. */
  releaseSamples(): void;
}

function el<T extends HTMLElement>(id: string): T {
  const found = window.document.getElementById(id);
  if (!found) throw new Error(`missing element #${id}`);
  return found as T;
}

/** One short sample is used across families so their shapes can be compared. */
export const DEFAULT_FONT_SAMPLE = "Aa Bb 0123";
const specimenBlobs = new Map<string, Promise<Blob>>();
const specimenObjectUrls = new WeakMap<HTMLImageElement, string>();
const disposedSpecimens = new WeakSet<HTMLImageElement>();

/** Reuses bounded image bytes while a picker filters rows. */
function specimenBlob(url: string): Promise<Blob> {
  let pending = specimenBlobs.get(url);
  if (!pending) {
    pending = api.fetchBlob(url).catch((error: unknown) => {
      specimenBlobs.delete(url);
      throw error;
    });
    specimenBlobs.set(url, pending);
    if (specimenBlobs.size > 64) {
      const oldest = specimenBlobs.keys().next().value;
      if (oldest) specimenBlobs.delete(oldest);
    }
  }
  return pending;
}

/** Releases object URLs before a list or inspector replaces its rows. */
export function releaseFontSpecimens(root: ParentNode): void {
  for (const image of root.querySelectorAll<HTMLImageElement>("img[data-font-specimen]")) {
    const url = specimenObjectUrls.get(image);
    if (url) URL.revokeObjectURL(url);
    specimenObjectUrls.delete(image);
    disposedSpecimens.add(image);
    image.removeAttribute("src");
  }
}

function appendSpecimen(parent: HTMLElement, url: string, unavailableKey: "fonts.previewUnavailable" | "fonts.cataloguePreviewUnavailable"): void {
  const wrapper = window.document.createElement("span");
  wrapper.className = "font-specimen";
  const image = window.document.createElement("img");
  image.className = "font-specimen-image";
  image.dataset["fontSpecimen"] = "";
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  const status = window.document.createElement("span");
  status.className = "font-specimen-status";
  status.hidden = true;
  wrapper.append(image, status);
  parent.append(wrapper);
  void specimenBlob(url).then((blob) => {
    if (!image.isConnected || disposedSpecimens.has(image)) return;
    const objectUrl = URL.createObjectURL(blob);
    specimenObjectUrls.set(image, objectUrl);
    image.src = objectUrl;
    status.hidden = true;
  }).catch(() => {
    if (!image.isConnected || disposedSpecimens.has(image)) return;
    status.textContent = t(unavailableKey);
    status.hidden = false;
  });
}

/** Picks the usual regular face, then the first face the store actually has. */
export function preferredFace(faces: readonly FontRecord[]): FontRecord | null {
  return faces.find((face) => face.weight === 400 && face.style === "normal")
    ?? faces.find((face) => face.style === "normal")
    ?? faces[0]
    ?? null;
}

/** Appends an image drawn by the renderer from the exact installed face. */
export function appendInstalledFontSpecimen(
  parent: HTMLElement,
  face: FontRecord,
  sample = DEFAULT_FONT_SAMPLE,
): void {
  appendSpecimen(parent, api.fontSpecimenUrl(face, sample), "fonts.previewUnavailable");
}

function appendUnavailableSpecimen(parent: HTMLElement): void {
  const status = window.document.createElement("span");
  status.className = "font-specimen-status";
  status.textContent = t("fonts.previewUnavailable");
  parent.append(status);
}

/** "a", "a and b", "a, b and c" — a list a sentence can contain. */
function sentenceList(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return new Intl.ListFormat(getLocale() === "pseudo" ? "en" : getLocale(), { style: "long", type: "conjunction" }).format(names);
}

/** Bytes as the megabytes a person would say, never rounded down to nothing. */
function megabytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 10) return `${formatNumber(Math.round(mb))} MB`;
  return `${formatNumber(Math.max(0.1, Math.round(mb * 10) / 10))} MB`;
}

export function mountFonts(host: Host): FontPanel {
  const dom = {
    list: el<HTMLUListElement>("font-list"),
    packSection: el<HTMLDetailsElement>("font-pack-section"),
    packOptions: el<HTMLDivElement>("font-pack-options"),
    empty: el<HTMLDivElement>("font-empty"),
    install: el<HTMLButtonElement>("install-default"),
    installLabel: el<HTMLSpanElement>("install-default-label"),
    installDetail: el<HTMLSpanElement>("install-default-detail"),
    importButton: el<HTMLButtonElement>("import-font"),
    file: el<HTMLInputElement>("font-file"),
    feedback: el<HTMLDivElement>("font-feedback"),
  };

  /** Families the store had when it was last read. */
  let families: string[] = [];
  let lastFaces: FontRecord[] = [];
  /** The catalogue, read once: it is a compiled-in manifest, not a download. */
  let catalogue: api.FontCatalogue | null = null;
  let catalogueSpecimens: Record<string, api.CatalogueSpecimen> | null = null;
  let sample = DEFAULT_FONT_SAMPLE;

  /** Adds one line to the live region, which is per-file rather than shared. */
  function note(line: string): void {
    const item = window.document.createElement("p");
    item.textContent = line;
    dom.feedback.append(item);
  }

  /** Re-renders the canvas when the store changed under an open project. */
  async function redrawProject(): Promise<void> {
    // The server has already dropped its font cache; asking for the document
    // again is what re-requests the render with the store as it now is.
    if (host.project()) await host.refresh();
  }

  function drawList(faces: readonly FontRecord[]): void {
    releaseFontSpecimens(dom.list);
    dom.list.replaceChildren();
    for (const family of families) {
      const mine = faces.filter((face) => face.family === family);
      const item = window.document.createElement("li");
      item.className = "font-family";
      item.dataset["family"] = family;

      const text = window.document.createElement("div");
      text.className = "font-family-text";
      const name = window.document.createElement("strong");
      name.textContent = family;
      const faceCount = window.document.createElement("span");
      faceCount.className = "font-faces";
      // Weight and style are what distinguishes two files of one family, and
      // they are what a document names; the stored file names would tell a
      // person reading this list nothing.
      const described = mine.map((face) => `${face.style === "italic" ? t("fonts.styleItalic") : t("fonts.styleNormal")} ${formatNumber(face.weight)}`).join(", ");
      faceCount.textContent = formatCount("fonts.faceCount", mine.length, { described });
      text.append(name, faceCount);

      const remove = window.document.createElement("button");
      remove.type = "button";
      remove.className = "small danger-action";
      remove.dataset["removeFamily"] = family;
      remove.textContent = t("fonts.removeButton");
      remove.setAttribute("aria-label", t("fonts.removeFamily", { family }));

      item.append(text, remove);
      const previewFace = preferredFace(mine);
      if (previewFace) appendInstalledFontSpecimen(item, previewFace, sample);
      else appendUnavailableSpecimen(item);
      dom.list.append(item);
    }
  }

  const sampleField = window.document.createElement("label");
  sampleField.className = "font-sample-field";
  const sampleLabel = window.document.createElement("span");
  sampleLabel.textContent = t("fonts.customSample");
  const sampleInput = window.document.createElement("input");
  sampleInput.type = "text";
  sampleInput.maxLength = 64;
  sampleInput.value = sample;
  sampleInput.setAttribute("aria-label", t("fonts.customSample"));
  sampleField.append(sampleLabel, sampleInput);
  dom.list.before(sampleField);
  let sampleTimer: number | undefined;
  sampleInput.addEventListener("input", () => {
    window.clearTimeout(sampleTimer);
    sampleTimer = window.setTimeout(() => {
      const next = sampleInput.value.trim();
      if (!next || [...next].some((character) => /[\u0000-\u001f\u007f]/u.test(character))) return;
      sample = next;
      drawList(lastFaces);
    }, 180);
  });

  /**
   * Says what the install button would fetch, before it fetches anything.
   *
   * The catalogue is the server's own compiled-in manifest — reading it
   * touches no network. The download happens on the click and nowhere else,
   * which is the whole reason the button can say what it will do first.
   */
  async function describeDefaultPack(): Promise<void> {
    try {
      if (!catalogue) catalogue = await api.fontCatalogue();
      const pack = catalogue.packs["default"] ?? [];
      const bytes = catalogue.families
        .filter((entry) => pack.includes(entry.family))
        .reduce((total, entry) => total + entry.bytes, 0);
      dom.installDetail.textContent = pack.length
        ? t("fonts.defaultPackDescription", { names: sentenceList(pack), bytes: megabytes(bytes) })
        : t("fonts.noDefaultPack");
      dom.install.disabled = pack.length === 0;
    } catch (error) {
      // The button still works; only its description is missing, and saying
      // so is better than a label that quietly claims nothing.
      dom.installDetail.textContent = error instanceof api.ApiError
        ? t("fonts.packDescribeErrorCode", { error: error.message, code: error.code })
        : t("fonts.packDescribeError");
    }
  }

  async function drawPackOptions(): Promise<void> {
    try {
      if (!catalogue) catalogue = await api.fontCatalogue();
      releaseFontSpecimens(dom.packOptions);
      dom.packOptions.replaceChildren();
      if (!catalogueSpecimens) {
        try { catalogueSpecimens = await api.catalogueSpecimens(); } catch { catalogueSpecimens = {}; }
      }
      const preferred = ["text", "display", "mono"];
      const packNames = [
        ...preferred,
        ...Object.keys(catalogue.packs).filter((name) => name !== "default" && !preferred.includes(name)).sort(),
      ];
      for (const pack of packNames) {
        const names = catalogue.packs[pack] ?? [];
        if (pack === "default" || names.length === 0) continue;
        const missing = names.filter((name) => !families.includes(name));
        const bytes = catalogue.families
          .filter((entry) => missing.includes(entry.family))
          .reduce((total, entry) => total + entry.bytes, 0);
        const button = window.document.createElement("button");
        button.type = "button";
        button.className = "font-pack-button";
        button.dataset["pack"] = pack;
        button.disabled = missing.length === 0;
        const name = window.document.createElement("strong");
        name.textContent = t("fonts.namedPackTitle", { pack });
        const detail = window.document.createElement("span");
        detail.textContent = missing.length
          ? t("fonts.namedPackDownload", { names: sentenceList(names), bytes: megabytes(bytes) })
          : t("fonts.namedPackInstalled", { names: sentenceList(names) });
        button.append(name, detail);
        const samples = window.document.createElement("span");
        samples.className = "font-pack-samples";
        for (const family of names) {
          const row = window.document.createElement("span");
          row.className = "font-pack-family";
          const label = window.document.createElement("span");
          label.className = "font-pack-family-name";
          label.textContent = family;
          row.append(label);
          const installed = preferredFace(lastFaces.filter((face) => face.family === family));
          const bundled = catalogueSpecimens?.[family];
          if (installed) {
            appendInstalledFontSpecimen(row, installed);
          } else if (bundled) {
            appendSpecimen(row, `/catalogue-specimens/${bundled.src.replace(/^\.\//u, "")}`, "fonts.cataloguePreviewUnavailable");
          } else {
            const unavailable = window.document.createElement("span");
            unavailable.className = "font-specimen-status";
            unavailable.textContent = t("fonts.cataloguePreviewUnavailable");
            row.append(unavailable);
          }
          samples.append(row);
        }
        button.append(samples);
        dom.packOptions.append(button);
      }
      dom.packSection.hidden = dom.packOptions.childElementCount === 0;
    } catch {
      dom.packSection.hidden = true;
      dom.packOptions.replaceChildren();
    }
  }
  async function reload(): Promise<void> {
    const store = await api.fontFaces();
    families = [...store.families];
    lastFaces = [...store.faces];
    host.fontsChanged({ families, faces: store.faces });
    drawList(store.faces);
    const empty = families.length === 0;
    dom.empty.hidden = !empty;
    sampleField.hidden = empty;
    dom.list.hidden = empty;
    if (empty) await describeDefaultPack();
    await drawPackOptions();
  }

  dom.install.addEventListener("click", () => {
    void host.guard(t("fonts.installFonts"), async () => {
      dom.install.disabled = true;
      dom.installLabel.textContent = t("fonts.installingDefault");
      host.say(t("fonts.downloadingDefault"));
      try {
        const result = await api.installFontPack("default");
        await reload();
        await redrawProject();
        host.say(t("fonts.installedFamilies", { names: sentenceList(result.families) }));
      } finally {
        // Left enabled after a refusal: a failed install leaves the store
        // exactly as it was, so trying again is an ordinary thing to do.
        dom.install.disabled = false;
        dom.installLabel.textContent = t("fonts.installDefaultPack");
      }
    });
  });

  dom.packOptions.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-pack]");
    const pack = button?.dataset["pack"];
    if (!pack || !button || button.disabled) return;
    void host.guard(t("fonts.installNamedPack", { pack }), async () => {
      button.disabled = true;
      try {
        await api.installFontPack(pack);
        await reload();
        await redrawProject();
        host.say(t("fonts.installedNamedPack", { pack }));
      } finally {
        button.disabled = false;
      }
    });
  });
  dom.importButton.addEventListener("click", () => dom.file.click());

  dom.file.addEventListener("change", () => {
    const chosen = [...(dom.file.files ?? [])];
    // Cleared first: choosing the same file twice must still fire `change`.
    dom.file.value = "";
    if (!chosen.length) return;
    void host.guard(t("fonts.importFont"), async () => {
      dom.feedback.replaceChildren();
      let added = 0;
      for (const file of chosen) {
        try {
          const result = await api.importFont(file);
          added += 1;
          const imported = [...new Set(result.imported.map((record) => record.family))];
          note(imported.length ? `${file.name} → ${sentenceList(imported)}` : t("fonts.importedFile", { file: file.name }));
        } catch (error) {
          // One refused file does not end the batch, and it is reported in
          // the engine's own words rather than as "something went wrong".
          note(error instanceof api.ApiError
            ? `${file.name}: ${error.message} (${error.code})`
            : `${file.name}: ${String(error)}`);
        }
      }
      await reload();
      if (added) await redrawProject();
      const refused = chosen.length - added;
      if (added) {
        host.say(formatCount("fonts.importResult", added, {
          refused: refused ? formatCount("fonts.refusedCount", refused) : "",
        }));
      } else {
        host.say(t("fonts.noneImported", { refused: formatCount("fonts.refusedCount", refused) }), "error");
      }
    });
  });

  dom.list.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-remove-family]");
    const family = button?.dataset["removeFamily"];
    if (!family) return;
    // Removing a font is not removing a picture: a document that names this
    // family stops rendering until somebody puts the file back, and that has
    // to be said before it happens rather than discovered afterwards.
    const confirmed = window.confirm(t("fonts.confirmRemove", { family }));
    if (!confirmed) return;
    void host.guard(t("fonts.removeAction", { family }), async () => {
      dom.feedback.replaceChildren();
      const result = await api.removeFontFamily(family);
      note(formatCount("fonts.removedFiles", result.removed, { family }));
      await reload();
      await redrawProject();
      host.say(t("fonts.removedFromStore", { family }));
    });
  });

  window.addEventListener("assemblash:localechange", () => {
    sampleLabel.textContent = t("fonts.customSample");
    sampleInput.setAttribute("aria-label", t("fonts.customSample"));
    drawList(lastFaces);
    if (catalogue) {
      void describeDefaultPack();
      void drawPackOptions();
    }
  });

  return {
    reload,
    focusInstall(): void {
      if (!dom.empty.hidden) dom.install.focus();
    },
    hasFamilies(): boolean {
      return families.length > 0;
    },
    releaseSamples(): void {
      releaseFontSpecimens(dom.list);
      releaseFontSpecimens(dom.packOptions);
    },
  };
}

// --- the font selector (register DEF-27) --------------------------------------
//
// The old control was a free-text input over a `<datalist>`: a suggestion,
// not a menu. A typo was accepted at the control and failed later at render,
// because the engine never substitutes a family. This selector inverts that:
// it lists the installed families only, filters them with a search the page
// owns, and refuses a value that matches nothing — at the control, before any
// operation is queued.
//
// Preview honesty: each row now requests pixels rendered from the exact
// stored face. The browser does not load or substitute an operating system
// font. The request carries the recorded hash and a short sample.

/** What one selector instance needs from the rest of the interface. */
export interface FontSelectorHost {
  /** The store as last read: families, and the faces behind them. */
  store(): FontStoreListing;
}

/** What one selector instance offers the page. */
export interface FontSelector {
  /** The whole control, ready to append. */
  root: HTMLElement;
  /** The input, for aria labelling by the caller. */
  input: HTMLInputElement;
  /** Shows a family from the document, without committing anything. */
  setFamily(family: string): void;
  /** Enables or disables the control with the rest of the form. */
  setDisabled(disabled: boolean): void;
}

/** The canonical spelling of an installed family, matched without case. */
function installedFamily(value: string, listing: FontStoreListing): string | null {
  const wanted = value.trim().toLowerCase();
  if (!wanted) return null;
  return listing.families.find((family) => family.toLowerCase() === wanted) ?? null;
}

/** The faces of one family, in weight order, as the store records them. */
export function facesOf(family: string, faces: readonly FontRecord[]): FontRecord[] {
  return faces
    .filter((face) => face.family === family)
    .sort((left, right) => left.weight - right.weight);
}

let fontSelectorSerial = 0;

export function mountFontSelector(
  host: FontSelectorHost,
  onCommit: (family: string) => void,
): FontSelector {
  const doc = window.document;
  const root = doc.createElement("span");
  root.className = "font-selector";

  const input = doc.createElement("input");
  input.type = "text";
  input.autocomplete = "off";
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-autocomplete", "list");

  const list = doc.createElement("div");
  list.className = "font-selector-list";
  list.hidden = true;

  const heading = doc.createElement("p");
  heading.className = "font-selector-heading";
  heading.dataset["i18n"] = "fonts.selectorHeading";
  heading.textContent = t("fonts.selectorHeading");

  const rows = doc.createElement("ul");
  rows.setAttribute("role", "listbox");
  const selectorId = ++fontSelectorSerial;
  rows.id = `font-selector-options-${selectorId}`;
  input.setAttribute("aria-controls", rows.id);
  list.append(heading, rows);

  const message = doc.createElement("p");
  message.className = "font-selector-message";
  message.dataset["i18n"] = "fonts.notInstalled";
  message.hidden = true;

  root.append(input, list, message);

  let current = "";
  let activeOption = -1;

  function markOption(index: number): void {
    const options = [...rows.querySelectorAll<HTMLElement>("[data-family]")];
    if (!options.length) return;
    activeOption = (index + options.length) % options.length;
    for (const [position, option] of options.entries()) {
      option.classList.toggle("active", position === activeOption);
      option.setAttribute("aria-selected", String(position === activeOption));
    }
    const active = options[activeOption];
    if (!active) return;
    input.setAttribute("aria-activedescendant", active.id);
    active.scrollIntoView({ block: "nearest" });
  }

  function chooseFamily(family: string): void {
    input.value = family;
    current = family;
    clearMessage();
    close();
    input.blur();
    onCommit(family);
  }

  function refuse(): void {
    // The refusal is the control's own words, beside the control. Nothing is
    // sent: the engine never substitutes a family, so a value it cannot
    // render must not leave the page.
    message.textContent = t("fonts.notInstalled");
    message.hidden = false;
  }

  function clearMessage(): void {
    message.hidden = true;
  }

  /** Draws the family rows, filtered by what is typed, if anything. */
  function drawRows(filter: string): void {
    const listing = host.store();
    const wanted = filter.trim().toLowerCase();
    const shown = wanted
      ? listing.families.filter((family) => family.toLowerCase().includes(wanted))
      : listing.families;
    releaseFontSpecimens(rows);
    rows.replaceChildren();
    activeOption = -1;
    input.removeAttribute("aria-activedescendant");
    for (const [index, family] of shown.entries()) {
      const item = doc.createElement("li");
      item.setAttribute("role", "option");
      item.id = `font-option-${selectorId}-${index}`;
      item.setAttribute("aria-selected", "false");
      item.dataset["family"] = family;
      const name = doc.createElement("span");
      name.className = "font-selector-family";
      name.textContent = family;
      const faces = facesOf(family, listing.faces);
      const described = doc.createElement("span");
      described.className = "font-selector-faces";
      described.textContent = faces.length
        ? faces.map((face) => `${face.style === "italic" ? t("fonts.styleItalic") : t("fonts.styleNormal")} ${formatNumber(face.weight)}`).join(", ")
        : t("fonts.facesUnknown");
      item.append(name, described);
      const previewFace = preferredFace(faces);
      if (previewFace) appendInstalledFontSpecimen(item, previewFace);
      else appendUnavailableSpecimen(item);
      rows.append(item);
    }
    if (!shown.length) {
      const none = doc.createElement("li");
      none.className = "font-selector-none";
      none.dataset["i18n"] = "fonts.noFamilyMatches";
      none.textContent = t("fonts.noFamilyMatches");
      rows.append(none);
    }
  }

  function open(): void {
    drawRows(input.value);
    if (root.closest(".contextual-toolbar")) {
      const bounds = input.getBoundingClientRect();
      const spacing = getComputedStyle(doc.documentElement);
      const gap = parseFloat(spacing.getPropertyValue("--space-1"));
      const edge = parseFloat(spacing.getPropertyValue("--space-2"));
      const minWidth = parseFloat(getComputedStyle(list).minWidth);
      list.style.position = "fixed";
      list.style.top = `${bounds.bottom + gap}px`;
      list.style.left = `${Math.max(edge, Math.min(bounds.left, window.innerWidth - minWidth - edge))}px`;
    }
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function close(): void {
    list.hidden = true;
    input.setAttribute("aria-expanded", "false");
    releaseFontSpecimens(rows);
    rows.replaceChildren();
  }

  input.addEventListener("focus", open);
  input.addEventListener("input", () => {
    clearMessage();
    open();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (list.hidden) open();
      markOption(activeOption + (event.key === "ArrowDown" ? 1 : -1));
      return;
    }
    if (event.key === "Enter" && !list.hidden && activeOption >= 0) {
      const family = rows.querySelectorAll<HTMLElement>("[data-family]")[activeOption]?.dataset["family"];
      if (family) {
        event.preventDefault();
        chooseFamily(family);
      }
      return;
    }
    if (event.key === "Escape" && !list.hidden) {
      close();
      event.stopPropagation();
    }
  });
  input.addEventListener("blur", () => {
    // A redraw can remove the input before the blur lands; a control that is
    // no longer connected has no message to show and nothing to commit.
    close();
    const value = input.value.trim();
    if (!value || value.toLowerCase() === current.toLowerCase()) return;
    const family = installedFamily(value, host.store());
    if (!family) {
      refuse();
      return;
    }
    input.value = family;
    current = family;
    onCommit(family);
  });
  rows.addEventListener("mousedown", (event) => {
    // `mousedown`, not `click`: the click would land after the input's blur
    // has already closed the list under the pointer.
    event.preventDefault();
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-family]");
    const family = item?.dataset["family"];
    if (!family) return;
    chooseFamily(family);
  });

  return {
    root,
    input,
    setFamily(family: string): void {
      current = family;
      input.value = family;
      clearMessage();
    },
    setDisabled(disabled: boolean): void {
      input.disabled = disabled;
      if (disabled) close();
    },
  };
}
