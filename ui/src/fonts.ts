// Shared font types and renderer specimen helpers for the Mantine controls.
// The server validates imports and provides the specimen pixels.

import * as api from "./api.js";
import { t } from "./i18n.js";
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

/** What one selector instance needs from the rest of the interface. */
export interface FontSelectorHost {
  /** The store as last read: families, and the faces behind them. */
  store(): FontStoreListing;
}

/** What one selector instance offers the page. */
export interface FontSelector {
  /** The whole control, ready to append. */
  root: HTMLElement;
  /** Shows a family from the document, without committing anything. */
  setFamily(family: string): void;
  /** Enables or disables the control with the rest of the form. */
  setDisabled(disabled: boolean): void;
  /** Releases its shared React portal when its selection is replaced. */
  destroy(): void;
}

/** The faces of one family, in weight order, as the store records them. */
export function facesOf(family: string, faces: readonly FontRecord[]): FontRecord[] {
  return faces
    .filter((face) => face.family === family)
    .sort((left, right) => left.weight - right.weight);
}
