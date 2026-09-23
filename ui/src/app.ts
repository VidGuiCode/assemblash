// The reference interface.
//
// There is no canvas library and no second renderer (PRD §16.3). The canvas is
// the engine's own render, shown as an image, with plain DOM elements
// positioned on top of it for selection and handles.
//
// It shows the *rasterized* render rather than the SVG, and that is the whole
// point of the decision rather than a departure from it. A browser handed the
// SVG would re-render it — with its own fonts, not the pinned files in the
// font store — so the preview would differ from the export exactly where this
// project cares most. The PNG is byte-for-byte what `export` writes, so "what
// you see is what you get" is true by construction. Showing an image also
// means no document content is ever parsed as markup by the page.
//
// Selection lives here and only here (amended FR-7). Every edit is an
// Operation sent to the one endpoint, carrying the version the UI last read.

import * as api from "./api.js";
import type { Document, Layer, Operation } from "./api.js";
import { mountAgents } from "./agents.js";
import { mountExport } from "./export.js";
import {
  placedAssetSize,
  resizeItemInSelection,
  resizedBounds,
  resizedRotatedBounds,
  rotatedRectBounds,
  selectionBounds,
} from "./geometry.js";
import { appendInstalledFontSpecimen, facesOf, mountFontSelector, mountFonts, releaseFontSpecimens } from "./fonts.js";
import { formatCount, formatNumber, getLocale, setLocale, t as translate, type MessageKey } from "./i18n.js";
import { ActionQueue } from "./queue.js";
import type { QueueSettlement } from "./queue.js";
import { mountTemplates } from "./templates.js";

interface State {
  project: string | null;
  document: Document | null;
  /** The presets this document offers, as last read. */
  presets: api.Preset[];
  /** The slots this document offers, as last read. */
  slots: api.Slot[];
  /** Ids the user has selected. The engine never hears about this. */
  selection: string[];
  /** Layer being dragged, and where the drag started. */
  drag: {
    ids: string[];
    mode: "move" | "resize" | "rotate";
    handle?: string;
    startX: number;
    startY: number;
    bounds: { x: number; y: number; width: number; height: number };
    origins: Array<{
      id: string;
      x: number;
      y: number;
      absoluteX: number;
      absoluteY: number;
      width: number;
      height: number;
      rotation: number;
    }>;
    /** Text boxes resize their layout area; their rendered glyphs never scale. */
    preserveSelectionScale?: boolean;
    lastDelta?: { x: number; y: number };
    previewActive?: boolean;
  } | null;
  busy: boolean;
  zoom: number | null;
  pan: { x: number; y: number };
  editingText: { id: string; original: string } | null;
}

const state: State = {
  project: null,
  document: null,
  presets: [],
  slots: [],
  selection: [],
  drag: null,
  busy: false,
  zoom: null,
  pan: { x: 0, y: 0 },
  editingText: null,
};

// --- the action queue and the interaction measurements ------------------------
//
// Every interface action that talks to the engine goes through one serial
// queue. Before it existed, an action that arrived while another was in
// flight was dropped with no message, so a fast human lost edits — the
// "rapid actions rejected" report. The queue never drops: each action runs
// after the ones before it, and only a newer action that sets the same
// property of the same layer may replace one that has not run yet.

const queue = new ActionQueue();

/** One measured interaction, for the `?perf` overlay and the exit test. */
interface PerfRecord {
  label: string;
  ok: boolean;
  superseded: boolean;
  at: number;
  waitedMs: number;
  ranMs: number | null;
  /** When the authoritative preview for the outcome was shown, if yet. */
  previewSettledAt: number | null;
}

const perf: PerfRecord[] = [];

queue.onSettled = (settlement: QueueSettlement): void => {
  perf.push({
    label: settlement.label,
    ok: settlement.ok,
    superseded: settlement.superseded,
    at: performance.now() - settlement.waitedMs,
    waitedMs: settlement.waitedMs,
    ranMs: settlement.ranMs,
    previewSettledAt: null,
  });
  if (perf.length > 50) perf.shift();
  drawPerfOverlay();
};

function setSaveState(iconName: string, key: "save.working" | "save.allChangesSaved" | "save.needsAttention"): void {
  const icon = document.createElement("i");
  icon.className = `ph ${iconName}`;
  icon.setAttribute("aria-hidden", "true");
  const label = document.createElement("span");
  label.dataset["i18n"] = key;
  label.textContent = translate(key);
  dom.saveState.replaceChildren(icon, label);
}

queue.onActiveChange = (active: boolean): void => {
  state.busy = active;
  if (active) {
    dom.status.dataset["kind"] = "info";
    setSaveState("ph-circle-notch", "save.working");
  } else if (dom.status.dataset["kind"] !== "error") {
    setSaveState("ph-check-circle", "save.allChangesSaved");
  }
};

/** Stamps the preview arrival on the newest interaction still missing one. */
function markPreviewSettled(): void {
  for (let i = perf.length - 1; i >= 0; i--) {
    const record = perf[i];
    if (record && record.previewSettledAt === null) {
      record.previewSettledAt = performance.now();
      break;
    }
  }
  drawPerfOverlay();
}

const perfOverlayEnabled = new URLSearchParams(window.location.search).has("perf");
(window as unknown as { __assemblashPerf?: PerfRecord[] }).__assemblashPerf = perf;

/** A one-line diagnostic of the last interaction, shown only with `?perf`. */
function drawPerfOverlay(): void {
  if (!perfOverlayEnabled) return;
  let overlay = document.getElementById("assemblash-perf");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "assemblash-perf";
    overlay.setAttribute(
      "style",
      "position:fixed;bottom:8px;left:8px;z-index:9999;font:11px/1.5 ui-monospace,monospace"
        + ";background:rgba(0,0,0,.82);color:#eee;padding:6px 9px;border-radius:6px"
        + ";pointer-events:none;white-space:pre",
    );
    document.body.append(overlay);
  }
  const last = perf[perf.length - 1];
  const total = last && last.previewSettledAt !== null
    ? `${Math.round(last.previewSettledAt - last.at)}ms`
    : "…";
  overlay.textContent = last
    ? `${last.label}: waited ${last.waitedMs}ms, ran ${last.ranMs ?? "–"}ms, settled ${total}`
      + `\nqueue ${queue.size}, records ${perf.length}`
    : "no interactions yet";
}

/**
 * What a new shape is painted with, and what the inspector offers a shape
 * that has no paint at all.
 *
 * The operation layer applies no default of its own — a create that names
 * neither produces an invisible shape — so the defaults a person gets are
 * decided here, once, and the same numbers stand behind the Add panel and
 * the inspector.
 */
const SHAPE_FILL_COLOUR = "#3366cc";
const SHAPE_STROKE_COLOUR = "#111111";
const SHAPE_STROKE_WIDTH = 2;

/** The clip shapes this build draws. A clip of any other shape is shown as
 * itself, never replaced with one of these. */
const CLIP_SHAPES = ["rect", "ellipse"] as const;

/**
 * The `shape` of a layer's clip, or `null` when the layer has no clip.
 *
 * The generated `Clip` widens to `unknown`, because its catch-all arm carries
 * any JSON a newer build might write. So the shape is read once, defensively,
 * here — the same rule `api.shapeKindOf` follows for a shape kind. A clip
 * this build does not know is reported as itself.
 */
function clipShapeOf(layer: Layer): string | null {
  const clip: unknown = layer.clip;
  if (clip && typeof clip === "object" && !Array.isArray(clip)) {
    const shape = (clip as Record<string, unknown>)["shape"];
    if (typeof shape === "string") return shape;
  }
  return null;
}

/** A clip rect's corner radius, with the engine's default of 0 applied. */
function clipRadiusOf(layer: Layer): number {
  const clip: unknown = layer.clip;
  if (clip && typeof clip === "object" && !Array.isArray(clip)) {
    const radius = (clip as Record<string, unknown>)["cornerRadius"];
    if (typeof radius === "number") return radius;
  }
  return 0;
}

/** A layer's crop, or `null` when it draws the whole image. */
function cropOf(layer: Layer): { x: number; y: number; width: number; height: number } | null {
  if (layer.type !== "image") return null;
  const crop: unknown = layer.crop;
  if (crop && typeof crop === "object" && !Array.isArray(crop)) {
    const held = crop as Record<string, unknown>;
    const x = held["x"];
    const y = held["y"];
    const width = held["width"];
    const height = held["height"];
    if (
      typeof x === "number" && typeof y === "number" &&
      typeof width === "number" && typeof height === "number"
    ) {
      return { x, y, width, height };
    }
  }
  return null;
}

/** The asset a layer draws, or `null` when the layer draws none. */
function assetOf(layer: Layer): { width?: number | null; height?: number | null } | null {
  if (layer.type !== "image" && layer.type !== "svg") return null;
  return (state.document?.assets ?? []).find((one) => one.id === layer.asset) ?? null;
}

interface DragPreviewCache {
  key: string;
  baseUrl?: string;
  selectionUrl?: string;
  pending: Promise<void>;
}

let dragPreviewCache: DragPreviewCache | null = null;

function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`missing element #${id}`);
  return found as T;
}

function localizedSpan(key: MessageKey): HTMLSpanElement {
  const span = document.createElement("span");
  span.dataset["i18n"] = key;
  span.textContent = translate(key);
  return span;
}

const dom = {
  projects: el<HTMLSelectElement>("projects"),
  projectOptions: el<HTMLDivElement>("project-options"),
  projectPickerToggle: el<HTMLButtonElement>("project-picker-toggle"),
  newProject: el<HTMLButtonElement>("new-project"),
  renameProject: el<HTMLButtonElement>("rename-project"),
  deleteProject: el<HTMLButtonElement>("delete-project"),
  reload: el<HTMLButtonElement>("reload"),
  search: el<HTMLInputElement>("project-search"),
  recents: el<HTMLDivElement>("recents"),
  canvasEmpty: el<HTMLDivElement>("canvas-empty"),
  canvas: el<HTMLDivElement>("canvas"),
  canvasImage: el<HTMLImageElement>("canvas-image"),
  overlay: el<HTMLDivElement>("overlay"),
  structure: el<HTMLElement>("structure-panel"),
  layers: el<HTMLUListElement>("layers"),
  layerSearch: el<HTMLInputElement>("layer-search"),
  inspector: el<HTMLDivElement>("inspector"),
  advancedInspector: el<HTMLDivElement>("advanced-inspector"),
  propertiesPanel: el<HTMLElement>("properties-panel"),
  propertiesTab: el<HTMLButtonElement>("properties-tab"),
  history: el<HTMLOListElement>("history"),
  layersTab: el<HTMLButtonElement>("layers-tab"),
  historyTab: el<HTMLButtonElement>("history-tab"),
  layersView: el<HTMLElement>("layers-view"),
  historyView: el<HTMLElement>("history-view"),
  historyShortcut: el<HTMLButtonElement>("history-shortcut"),
  status: el<HTMLDivElement>("status"),
  saveState: el<HTMLSpanElement>("save-state"),
  documentDimensions: el<HTMLSpanElement>("document-dimensions"),
  version: el<HTMLSpanElement>("version"),
  selectTool: el<HTMLButtonElement>("select-tool"),
  addPanel: el<HTMLElement>("add-panel"),

  addPanelTitle: el<HTMLHeadingElement>("add-panel-title"),
  addPanelClose: el<HTMLButtonElement>("add-panel-close"),
  dockToggle: el<HTMLButtonElement>("dock-toggle"),
  addText: el<HTMLButtonElement>("add-text"),
  addShape: el<HTMLButtonElement>("add-shape"),
  addImage: el<HTMLButtonElement>("add-image"),
  imageFile: el<HTMLInputElement>("image-file"),
  uploadDropzone: el<HTMLButtonElement>("upload-dropzone"),
  uploadFeedback: el<HTMLDivElement>("upload-feedback"),
  openTemplates: el<HTMLButtonElement>("open-templates"),
  deleteLayer: el<HTMLButtonElement>("delete-layer"),
  groupLayers: el<HTMLButtonElement>("group-layers"),
  undo: el<HTMLButtonElement>("undo"),
  redo: el<HTMLButtonElement>("redo"),
  exportButton: el<HTMLButtonElement>("export"),
  shutdown: el<HTMLButtonElement>("shutdown"),
  emptyCreate: el<HTMLButtonElement>("empty-create"),
  agents: el<HTMLButtonElement>("agents"),
  agentsConnected: el<HTMLSpanElement>("agents-connected"),
  newProjectDialog: el<HTMLDialogElement>("new-project-dialog"),
  newProjectForm: el<HTMLFormElement>("new-project-form"),
  newProjectName: el<HTMLInputElement>("new-project-name"),
  newProjectWidth: el<HTMLInputElement>("new-project-width"),
  newProjectHeight: el<HTMLInputElement>("new-project-height"),
  newProjectBackground: el<HTMLInputElement>("new-project-background"),
  createProjectConfirm: el<HTMLButtonElement>("create-project-confirm"),
  canvasPresets: el<HTMLDivElement>("canvas-presets"),
  nameDialog: el<HTMLDialogElement>("name-dialog"),
  nameDialogForm: el<HTMLFormElement>("name-dialog-form"),
  nameDialogTitle: el<HTMLHeadingElement>("name-dialog-title"),
  nameDialogLabel: el<HTMLSpanElement>("name-dialog-label"),
  nameDialogInput: el<HTMLInputElement>("name-dialog-input"),
  nameDialogConfirm: el<HTMLButtonElement>("name-dialog-confirm"),
  positionPopover: el<HTMLDivElement>("position-popover"),
  positionClose: el<HTMLButtonElement>("position-close"),
  positionFields: el<HTMLDivElement>("position-fields"),
  contextMenu: el<HTMLDivElement>("context-menu"),
  stageViewport: el<HTMLDivElement>("stage-viewport"),
  zoomOut: el<HTMLButtonElement>("zoom-out"),
  zoomValue: el<HTMLButtonElement>("zoom-value"),
  zoomIn: el<HTMLButtonElement>("zoom-in"),
  zoom100: el<HTMLButtonElement>("zoom-100"),
  templatesPanel: el<HTMLElement>("templates"),
  templatesToggle: el<HTMLButtonElement>("templates-toggle"),
  templatesClose: el<HTMLButtonElement>("templates-close"),
  settings: el<HTMLButtonElement>("settings"),
  settingsDialog: el<HTMLDialogElement>("settings-dialog"),
  settingsForm: el<HTMLFormElement>("settings-form"),
  settingsGroups: [...document.querySelectorAll<HTMLDetailsElement>(".settings-section")],

  settingFollow: el<HTMLInputElement>("setting-follow"),
  settingLanguage: el<HTMLSelectElement>("setting-language"),
  settingsFontsOpen: el<HTMLButtonElement>("settings-fonts-open"),
  settingUpdateCheck: el<HTMLInputElement>("setting-update-check"),
  updateNote: el<HTMLParagraphElement>("update-note"),
  consentBar: el<HTMLElement>("consent-bar"),
  consentNotify: el<HTMLButtonElement>("consent-notify"),
  consentOff: el<HTMLButtonElement>("consent-off"),
  updateBanner: el<HTMLElement>("update-banner"),
  updateBannerText: el<HTMLSpanElement>("update-banner-text"),
  updateBannerLink: el<HTMLAnchorElement>("update-banner-link"),
  updateBannerDismiss: el<HTMLButtonElement>("update-banner-dismiss"),
  canvasHints: el<HTMLParagraphElement>("canvas-hints"),
};

let submitRequestedName: ((name: string) => void) | null = null;

function requestName(
  titleKey: MessageKey,
  labelKey: MessageKey,
  confirmKey: MessageKey,
  submit: (name: string) => void,
): void {
  submitRequestedName = submit;
  dom.nameDialogTitle.dataset["i18n"] = titleKey;
  dom.nameDialogTitle.textContent = translate(titleKey);
  dom.nameDialogLabel.dataset["i18n"] = labelKey;
  dom.nameDialogLabel.textContent = translate(labelKey);
  dom.nameDialogConfirm.dataset["i18n"] = confirmKey;
  dom.nameDialogConfirm.textContent = translate(confirmKey);
  dom.nameDialogInput.value = "";
  dom.nameDialog.showModal();
  dom.nameDialogInput.focus();
}

dom.nameDialogInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  dom.nameDialogForm.requestSubmit(dom.nameDialogConfirm);
});

dom.nameDialogForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
  if (submitter?.value === "cancel") {
    submitRequestedName = null;
    dom.nameDialog.close("cancel");
    return;
  }
  if (!dom.nameDialogForm.reportValidity()) return;
  const name = dom.nameDialogInput.value.trim();
  if (!name) return;
  const submit = submitRequestedName;
  submitRequestedName = null;
  dom.nameDialog.close("default");
  submit?.(name);
});

function say(message: string, kind: "info" | "error" = "info"): void {
  dom.status.textContent = message;
  dom.status.dataset["kind"] = kind;
}

/**
 * The font store, as the Fonts panel last read it.
 *
 * This is the data behind the font selector (register DEF-27): families are
 * the only values a selector may commit, and the faces are what the weight
 * control offers. It is refilled by the Fonts panel's own reload, so an
 * import, removal, or install updates every open selector.
 */
const fontStore: api.FontStoreListing = { families: [], faces: [] };

/**
 * Refusals a Properties control shows beside itself, keyed by control.
 *
 * Filled when the engine refuses what a control sent; cleared when that
 * control sends again and when the selection changes, so a message never
 * outlives the edit it was about.
 */
const shapeControlErrors = new Map<string, string>();
let shapeControlErrorsSelection = "";

/**
 * Runs something that talks to the engine, reporting whatever it refuses.
 *
 * The action is queued, not dropped: `guard` returns a promise that settles
 * when the action has run (or failed) — including after waiting behind
 * earlier ones. Busy chrome and error text are the queue's and `report`'s
 * business now, so nothing here decides whether "now" is a good moment.
 */
async function guard(what: string, run: () => Promise<void>): Promise<void> {
  await queue.enqueue({ label: what, coalesceKey: null, run, onError: (error) => report(what, error) });
}

const knownApiErrors = {
  unauthorized: "errors.unauthorized",
  noSuchProject: "errors.noSuchProject",
  projectExists: "errors.projectExists",
  versionConflict: "errors.versionConflict",
  projectLocked: "errors.projectLocked",
  invalidProjectId: "errors.invalidProjectId",
  malformedRequest: "errors.malformedRequest",
  payloadTooLarge: "errors.payloadTooLarge",
  invalidFilename: "errors.invalidFilename",
  unsupportedFontFormat: "errors.unsupportedFontFormat",
  unknownFontFamily: "errors.unknownFontFamily",
  layerNotFound: "errors.layerNotFound",
  invalidExportName: "errors.invalidExportName",
} as const;

function apiErrorMessage(error: api.ApiError): string {
  const key = knownApiErrors[error.code as keyof typeof knownApiErrors];
  return key ? translate(key) : `${error.message} (${error.code})`;
}

/** Shows a translated known refusal or the unchanged diagnostic for an unknown code. */
function report(_what: string, error: unknown): void {
  setSaveState("ph-warning-circle", "save.needsAttention");
  if (error instanceof api.ApiError) {
    say(apiErrorMessage(error), "error");
  } else {
    say(translate("errors.unexpected", { message: String(error) }), "error");
  }
}

/**
 * The template panel, which is a client of this page exactly as this page is
 * a client of the engine: it is handed what it needs and owns nothing else.
 */
const templates = mountTemplates({
  project: () => state.project,
  document: () => state.document,
  say,
  guard,
  refresh: () => refresh(),
});

// Template work belongs to the same creation panel as Text, Uploads, and
// Vector. Moving the existing renderer-backed controls here avoids a second
// floating workspace covering the canvas.
el<HTMLElement>("add-template-section").append(dom.templatesPanel);

/**
 * The font manager, which owns the store the renderer draws from.
 *
 * Given the same handful of things the template panel gets, plus the one
 * thing only it can report: which families exist, so the shared suggestion
 * list follows an import or a removal without a page reload.
 */
const fontsPanel = mountFonts({
  project: () => state.project,
  document: () => state.document,
  say,
  guard,
  refresh: () => refresh(),
  fontsChanged: (listing) => {
    fontStore.families = [...listing.families];
    fontStore.faces = [...listing.faces];
    drawInspector();
  },
});

const exporter = mountExport({
  project: () => state.project,
  document: () => state.document,
  say,
  guard,
});

const agents = mountAgents({ say });

// Settings hands control to the agent dialog. Only one modal stays open.
dom.agents.addEventListener("click", () => {
  if (dom.settingsDialog.open) dom.settingsDialog.close("cancel");
}, { capture: true });

// --- settings -----------------------------------------------------------------
//
// One modal collects the preferences that are about this page, not about the
// document. UI-only preferences persist in localStorage under named keys, in
// the `assemblash-agent-hint-v1` pattern:
//
// - `assemblash-follow-v1` — "on" or "off"; whether the page follows other
//   clients' edits. Absent means "on", the behaviour the page always had.
//
// Canvas settings are document data, not preferences: they are edited through
// the form below and committed as one `updateCanvas` operation, and nothing
// about them is stored here. The update-check toggle is the one preference
// that is not page-local: it is recorded in the workspace config through
// `POST /api/update-consent` (decision D28), like the consent question below.

/** The localStorage key of the follow preference. */
const FOLLOW_STORAGE_KEY = "assemblash-follow-v1";

/** Whether the page follows other clients' edits. Default: yes. */
function followEnabled(): boolean {
  return window.localStorage.getItem(FOLLOW_STORAGE_KEY) !== "off";
}

/** Opens Settings at the requested configuration group. */
function openSettings(group = "settings-agents"): void {
  dom.settingFollow.checked = followEnabled();
  dom.settingLanguage.value = getLocale();
  for (const section of dom.settingsGroups) section.open = section.id === group;
  dom.settingsDialog.showModal();
}

dom.settings.addEventListener("click", () => openSettings());

dom.settingLanguage.value = getLocale();
dom.settingLanguage.addEventListener("change", () => {
  setLocale(dom.settingLanguage.value);
});

// Update parameterized labels in place so an active input keeps its value and focus.
window.addEventListener("assemblash:localechange", () => {
  for (const element of document.querySelectorAll<HTMLElement>("[data-effect-action]")) {
    const key = element.dataset["effectAction"] as "effects.moveUp" | "effects.moveDown";
    const value = translate(key, { effect: element.dataset["effectType"] ?? "" });
    element.title = value;
    const name = element.querySelector<HTMLElement>(".sr-only");
    if (name) name.textContent = value;
  }
  for (const element of document.querySelectorAll<HTMLElement>("[data-paint-label-key]")) {
    const label = translate(element.dataset["paintLabelKey"] as MessageKey).toLowerCase();
    element.title = element instanceof HTMLInputElement
      ? translate("canvas.noColor", { label })
      : translate("canvas.removeColor", { label });
  }
  for (const element of document.querySelectorAll<HTMLElement>("[data-resize-handle]")) {
    element.setAttribute("aria-label", translate("canvas.resizeHandle", { handle: element.dataset["resizeHandle"] ?? "" }));
  }
  for (const element of document.querySelectorAll<HTMLElement>("[data-slot-name]")) {
    element.title = translate("slots.editHint", { name: element.dataset["slotName"] ?? "" });
  }
  const previewName = dom.canvasImage.dataset["previewName"];
  if (previewName) dom.canvasImage.alt = translate("canvas.previewAlt", { name: previewName });
  if (state.document) {
    dom.version.textContent = formatNumber(api.versionOf(state.document));
    dom.documentDimensions.textContent =
      `${formatNumber(Math.round(state.document.canvas.width))} × ${formatNumber(Math.round(state.document.canvas.height))}`;
    applyZoom();
  }
});

dom.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(FOLLOW_STORAGE_KEY, dom.settingFollow.checked ? "on" : "off");
});

dom.settingsFontsOpen.addEventListener("click", () => {
  dom.settingsDialog.close("cancel");
  void guard("fonts", () => openFontManager(true));
});

// --- update notices (decision D28) ---------------------------------------------
//
// The server fetches only when the workspace config says `updateCheck =
// "notify"`, at most once every 24 hours, once at serve start. This page only
// reads the answer and records the consent:
//
// - `GET /api/update-status` — read-only; the server makes no request for it.
// - `POST /api/update-consent` — the one-time answer, asked once.
//
// One localStorage key: `assemblash-update-banner-v1`, the version this
// browser dismissed. A still-newer version shows the banner again.

const BANNER_DISMISSED_KEY = "assemblash-update-banner-v1";

/** Draws the consent bar, the Settings toggle, and the banner from the status. */
async function loadUpdateStatus(): Promise<void> {
  let status: api.UpdateStatus;
  try {
    status = await api.updateStatus();
  } catch {
    // A status this page cannot read must never block work: the notices
    // stay hidden and nothing else changes.
    return;
  }
  dom.settingUpdateCheck.checked = status.consent === "notify";
  // The consent question shows while no answer is recorded. It is answered
  // once; after that the config holds the answer and the bar stays hidden.
  dom.consentBar.hidden = status.consent !== null;
  const dismissed = window.localStorage.getItem(BANNER_DISMISSED_KEY);
  const showBanner = status.newer && Boolean(status.latest) && dismissed !== status.latest;
  dom.updateBanner.hidden = !showBanner;
  if (showBanner && status.latest) {
    dom.updateBannerText.textContent =
      translate("updates.versionAvailable", { latest: status.latest, current: status.current });
    dom.updateBannerText.dataset["version"] = status.latest;
    dom.updateBannerLink.href = status.notesUrl ?? "";
    dom.updateBannerLink.hidden = !status.notesUrl;
  }
}

/** Records the consent, then reflects the answer everywhere it is shown. */
async function recordConsent(consent: api.UpdateConsent): Promise<void> {
  try {
    const status = await api.setUpdateConsent(consent);
    dom.consentBar.hidden = status.consent !== null;
    dom.settingUpdateCheck.checked = status.consent === "notify";
    say(status.consent === "notify"
      ? translate("updates.checkOn")
      : translate("updates.checkOff"));
  } catch (error) {
    // A refused write changes nothing; the toggle goes back with the note.
    report(translate("updates.saveChoiceFailed"), error);
    void loadUpdateStatus();
  }
}

dom.consentNotify.addEventListener("click", () => void recordConsent("notify"));
dom.consentOff.addEventListener("click", () => void recordConsent("off"));

dom.settingUpdateCheck.addEventListener("change", () => {
  void recordConsent(dom.settingUpdateCheck.checked ? "notify" : "off");
});

dom.updateBannerDismiss.addEventListener("click", () => {
  window.localStorage.setItem(BANNER_DISMISSED_KEY, dom.updateBannerText.dataset["version"] ?? "");
  dom.updateBanner.hidden = true;
});

// The form's own Escape path closes it through the browser; this covers the
// keydown that arrives while the keyboard focus sits elsewhere on the page.
// Closing commits nothing: the canvas form applies only through its button,
// and the follow toggle commits only through its own change event.
dom.settingsForm.addEventListener("submit", (event) => {
  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
  if (submitter?.value === "cancel") {
    dom.settingsDialog.close("cancel");
  }
});

function selectedLayer(): Layer | null {
  if (!state.document || state.selection.length !== 1) return null;
  const wanted = state.selection[0];
  return (
    api.flatten(api.layersOf(state.document)).find(({ layer }) => layer.id === wanted)?.layer ?? null
  );
}

function selectedLayers(): Layer[] {
  if (!state.document) return [];
  const selected = new Set(state.selection);
  return api
    .flatten(api.layersOf(state.document))
    .map(({ layer }) => layer)
    .filter((layer) => selected.has(layer.id));
}

function wireLongPressMenu(
  target: HTMLElement,
  beforeOpen?: () => void,
): void {
  let timer = 0;
  let start = { x: 0, y: 0 };
  const cancel = (): void => {
    window.clearTimeout(timer);
    timer = 0;
  };
  target.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    start = { x: event.clientX, y: event.clientY };
    timer = window.setTimeout(() => {
      beforeOpen?.();
      openContextMenu(start.x, start.y);
      navigator.vibrate?.(20);
    }, 550);
  });
  target.addEventListener("pointermove", (event) => {
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) cancel();
  });
  target.addEventListener("pointerup", cancel);
  target.addEventListener("pointercancel", cancel);
}

// --- rendering ---------------------------------------------------------------

let hintedProject: string | null = null;
let canvasHintTimer: number | undefined;

function showCanvasHint(): void {
  if (!state.project || hintedProject === state.project) return;
  hintedProject = state.project;
  dom.canvasHints.hidden = false;
  window.clearTimeout(canvasHintTimer);
  canvasHintTimer = window.setTimeout(() => { dom.canvasHints.hidden = true; }, 5000);
}
/** Refreshes issued later own the page state; a stale response steps aside. */
let refreshSequence = 0;

async function refresh(): Promise<void> {
  if (!state.project) return;
  const sequence = ++refreshSequence;
  const doc = await api.getDocument(state.project);
  if (sequence !== refreshSequence || !state.project) return;
  state.document = doc;
  state.selection = state.selection.filter((id) =>
    api.flatten(api.layersOf(doc)).some(({ layer }) => layer.id === id),
  );
  dom.version.textContent = formatNumber(api.versionOf(doc));
  dom.canvasEmpty.hidden = true;
  dom.canvas.hidden = false;
  showCanvasHint();
  dom.documentDimensions.textContent =
    `${formatNumber(Math.round(doc.canvas.width))} × ${formatNumber(Math.round(doc.canvas.height))}`;
  // Slots come with the document itself, so there is nothing extra to fetch:
  // a template is a document that names some of its own layers.
  state.slots = (doc.slots ?? []) as api.Slot[];

  drawLayers();
  drawOverlay();
  drawInspector();

  // The pixels and the side panels trail the state on purpose. Neither
  // belongs in the serial window an interaction waits on: the preview fetch
  // is the dominant cost of a commit, and blocking further input on it is
  // what used to make rapid actions disappear.
  requestPreview();
  void loadPresets().catch((error: unknown) => report("presets", error));
  void drawHistory().catch((error: unknown) => report("history", error));
}

/** Reads the presets without holding anything open. Later reads win. */
let presetsSequence = 0;
async function loadPresets(): Promise<void> {
  if (!state.project) return;
  const sequence = ++presetsSequence;
  const presets = await api.getPresets(state.project);
  if (sequence === presetsSequence) state.presets = presets;
}

/**
 * Asks for the authoritative pixels, coalesced: while one preview streams,
 * any number of newer wants collapse into the latest, and only that one is
 * fetched next. The interaction that caused the want is already finished —
 * this is display, not commitment, and it must never hold the queue.
 */
let previewStreaming: Promise<void> | null = null;
let previewWanted: number | null = null;

function requestPreview(): void {
  if (!state.project || !state.document) return;
  previewWanted = api.versionOf(state.document);
  if (previewStreaming) return;
  const project = state.project;
  previewStreaming = (async () => {
    try {
      while (previewWanted !== null) {
        const version = previewWanted;
        previewWanted = null;
        // A render the engine produced, shown as an image. Nothing from the
        // document is ever interpreted as markup by this page. Fetched rather
        // than pointed at, because an <img src> cannot carry the access token
        // and the token must never go in a URL.
        const url = await api.imageObjectUrl(api.pngUrl(project, version, interactivePreviewScale()));
        const current = state.document;
        if (state.project !== project || !current || api.versionOf(current) !== version) {
          // A newer state owns the canvas; its want is pending. The image
          // nobody will show is released, or every skipped preview would
          // keep a PNG in memory for the life of the page.
          URL.revokeObjectURL(url);
          continue;
        }
        const previous = dom.canvasImage.src;
        dom.canvasImage.src = url;
        if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
        clearDragPreviewCache();
        dom.canvasImage.dataset["previewName"] = current.name ?? project;
        dom.canvasImage.alt = translate("canvas.previewAlt", { name: current.name ?? project });
        dom.canvas.style.aspectRatio = `${current.canvas.width} / ${current.canvas.height}`;
        applyZoom();
        markPreviewSettled();
      }
    } catch (error) {
      // Outside the queue, so nothing else would say it: a render the engine
      // refused (a missing font, say) must reach the person, not the console.
      report("preview", error);
    } finally {
      previewStreaming = null;
      if (previewWanted !== null) requestPreview();
    }
  })();
}

/**
 * Ask the deterministic renderer for the pixels the editor can actually show.
 * Export remains full resolution; rendering hidden pixels on every edit only
 * delays feedback and does not improve the fitted canvas.
 */
/**
 * The horizontal inset the stage keeps around the canvas. It mirrors the
 * stage's own spacing (the `--space-12` scale step on each side) in the two
 * places that must agree with it: the preview scale and the fit zoom.
 */
const STAGE_INSET_PX = 96;

function interactivePreviewScale(): number {
  if (!state.document) return 1;
  const availableWidth = Math.max(240, dom.stageViewport.clientWidth - STAGE_INSET_PX);
  const availableHeight = Math.max(180, dom.stageViewport.clientHeight - STAGE_INSET_PX);
  const fit = Math.min(
    availableWidth / state.document.canvas.width,
    availableHeight / state.document.canvas.height,
    1,
  );
  const displayed = state.zoom ?? fit;
  const density = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, displayed * density));
}

function drawLayers(): void {
  dom.layers.replaceChildren();
  if (!state.document) {
    dom.layerSearch.disabled = true;
    return;
  }
  const query = dom.layerSearch.value.trim().toLowerCase();
  const flat = api.flatten(api.layersOf(state.document));
  dom.layerSearch.disabled = flat.length === 0;
  const searchKey = flat.length === 0 ? "layers.noSearch" : "layers.searchPlaceholder";
  dom.layerSearch.placeholder = translate(searchKey);
  dom.layerSearch.dataset["i18nAttr"] = `placeholder:${searchKey}`;

  const appendEmptyState = (titleKey: MessageKey, hintKey: MessageKey, compact = false): void => {
    const item = document.createElement("li");
    item.className = `layers-empty${compact ? " compact" : ""}`;
    const icon = document.createElement("i");
    icon.className = `ph ${compact ? "ph-magnifying-glass" : "ph-stack-simple"}`;
    icon.setAttribute("aria-hidden", "true");
    const heading = document.createElement("strong");
    heading.dataset["i18n"] = titleKey;
    heading.textContent = translate(titleKey);
    const copy = document.createElement("span");
    copy.dataset["i18n"] = hintKey;
    copy.textContent = translate(hintKey);
    item.append(icon, heading, copy);
    dom.layers.append(item);
  };

  if (flat.length === 0) {
    dom.layerSearch.value = "";
    appendEmptyState("layers.none", "layers.emptyHint");
    return;
  }

  const appendLayer = (layer: Layer, depth: number, parent: string | null): void => {
    const visibleName = layer.name ?? (layer.type === "text" ? layer.text : layer.type) ?? layer.type;
    const childMatches =
      layer.type === "group" &&
      (layer.children ?? []).some((child) =>
        (child.name ?? (child.type === "text" ? child.text : child.type) ?? child.type)
          .toLowerCase()
          .includes(query),
      );
    if (query && !visibleName.toLowerCase().includes(query) && !childMatches) return;

    const item = document.createElement("li");
    item.className = "layer";
    item.dataset["type"] = layer.type;
    item.style.setProperty("--layer-depth", String(depth));
    item.dataset["id"] = layer.id;
    item.dataset["parent"] = parent ?? "";
    if (state.selection.includes(layer.id)) item.classList.add("selected");
    item.tabIndex = 0;
    item.draggable = api.isEditable(layer);

    const visibility = document.createElement("button");
    visibility.type = "button";
    visibility.className = "layer-control";
    visibility.title = layer.visible ? translate("layers.hide") : translate("layers.show");
    visibility.dataset["i18nAttr"] = `title:${layer.visible ? "layers.hide" : "layers.show"}`;
    visibility.disabled = !api.isEditable(layer);
    const visibilityIcon = document.createElement("i");
    visibilityIcon.className = `ph ${layer.visible ? "ph-eye" : "ph-eye-slash"}`;
    visibilityIcon.setAttribute("aria-hidden", "true");
    const visibilityName = document.createElement("span");
    visibilityName.className = "sr-only";
    visibilityName.dataset["i18n"] = layer.visible ? "layers.hide" : "layers.show";
    visibilityName.textContent = visibility.title;
    visibility.append(visibilityIcon, visibilityName);
    visibility.addEventListener("click", (event) => {
      event.stopPropagation();
      void send(layer.visible ? "hide layer" : "show layer", {
        op: "setVisible",
        id: layer.id,
        visible: !layer.visible,
      } as Operation);
    });

    const icon = document.createElement("i");
    const layerIcons: Record<string, string> = {
      text: "ph-text-t",
      image: "ph-image",
      svg: "ph-pen-nib",
      group: "ph-stack",
    };
    // A shape says which shape it is: four rects in a list would otherwise
    // read the same as four ellipses. A kind this build cannot draw gets the
    // generic mark rather than a wrong one.
    const shapeIcons: Record<string, string> = {
      rect: "ph-square",
      ellipse: "ph-circle",
      line: "ph-line-segment",
    };
    const kindIcon = layer.type === "shape"
      ? shapeIcons[api.shapeKindOf(layer) ?? ""] ?? "ph-shapes"
      : layerIcons[layer.type];
    icon.className = `ph ${kindIcon ?? "ph-square"} layer-icon`;
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "name";
    label.textContent = visibleName;
    label.title = translate("layers.renameHint");
    label.dataset["i18nAttr"] = "title:layers.renameHint";

    const lock = document.createElement("button");
    lock.type = "button";
    lock.className = "layer-control";
    lock.title = layer.locked ? translate("layers.unlock") : translate("layers.lock");
    lock.dataset["i18nAttr"] = `title:${layer.locked ? "layers.unlock" : "layers.lock"}`;
    lock.disabled = Boolean(layer.protected || layer.readOnly);
    const lockIcon = document.createElement("i");
    lockIcon.className = `ph ${layer.locked ? "ph-lock" : "ph-lock-open"}`;
    lockIcon.setAttribute("aria-hidden", "true");
    const lockName = document.createElement("span");
    lockName.className = "sr-only";
    lockName.dataset["i18n"] = layer.locked ? "layers.unlock" : "layers.lock";
    lockName.textContent = lock.title;
    lock.append(lockIcon, lockName);
    lock.addEventListener("click", (event) => {
      event.stopPropagation();
      void send(layer.locked ? "unlock layer" : "lock layer", {
        op: "setLocked",
        id: layer.id,
        locked: !layer.locked,
      } as Operation);
    });

    item.append(visibility, icon, label, lock);

    const why = api.whyNotEditable(layer);
    if (why) {
      label.title = why;
      item.classList.add("guarded");
    }
    if (!layer.visible) item.classList.add("hidden-layer");

    item.addEventListener("click", (event) => {
      // Additive selection with a modifier, which is what group needs.
      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        state.selection = state.selection.includes(layer.id)
          ? state.selection.filter((id) => id !== layer.id)
          : [...state.selection, layer.id];
      } else {
        state.selection = [layer.id];
      }
      drawLayers();
      drawOverlay();
      drawInspector();
      if (window.matchMedia("(max-width: 720px)").matches && selectedLayer()?.type !== "text") {
        dom.structure.classList.remove("mobile-open");
        dom.dockToggle.setAttribute("aria-expanded", "false");
      }
    });
    label.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      beginLayerRename(layer, label);
    });
    item.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (!state.selection.includes(layer.id)) state.selection = [layer.id];
      drawLayers();
      drawOverlay();
      drawInspector();
      openContextMenu(event.clientX, event.clientY);
    });
    wireLongPressMenu(item, () => {
      if (!state.selection.includes(layer.id)) state.selection = [layer.id];
      drawLayers();
      drawOverlay();
      drawInspector();
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "F2") {
        event.preventDefault();
        beginLayerRename(layer, label);
      }
      if (event.key === "F10" && event.shiftKey) {
        event.preventDefault();
        const rect = item.getBoundingClientRect();
        openContextMenu(rect.left + 24, rect.top + 24);
      }
    });
    item.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/plain", layer.id);
      item.classList.add("dragging");
    });
    item.addEventListener("dragend", () => item.classList.remove("dragging"));
    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      item.classList.add("drop-target");
    });
    item.addEventListener("dragleave", () => item.classList.remove("drop-target"));
    item.addEventListener("drop", (event) => {
      event.preventDefault();
      item.classList.remove("drop-target");
      const moved = event.dataTransfer?.getData("text/plain");
      if (!moved || moved === layer.id) return;
      const target = flat.find(({ layer: one }) => one.id === layer.id);
      const parentLayer = target?.parent
        ? flat.find(({ layer: one }) => one.id === target.parent)?.layer
        : null;
      const parentLayers = parentLayer?.type === "group"
        ? parentLayer.children ?? []
        : api.layersOf(state.document!);
      const targetIndex = parentLayers.findIndex((one) => one.id === layer.id);
      const to = layer.type === "group"
        ? { at: "in", parent: layer.id }
        : target?.parent
          ? { at: "in", parent: target.parent, index: Math.max(0, targetIndex + 1) }
          : { at: "root", index: Math.max(0, targetIndex + 1) };
      void send("reorder layer", { op: "reorder", id: moved, to } as Operation);
    });
    dom.layers.append(item);
    if (layer.type === "group") {
      for (const child of [...(layer.children ?? [])].reverse()) {
        appendLayer(child, depth + 1, layer.id);
      }
    }
  };

  for (const layer of [...api.layersOf(state.document)].reverse()) {
    appendLayer(layer, 0, null);
  }
  if (dom.layers.childElementCount === 0) {
    appendEmptyState("layers.noMatching", "layers.trySearch", true);
  }
}

function beginLayerRename(layer: Layer, label: HTMLElement): void {
  if (layer.protected || layer.readOnly) return;
  const input = document.createElement("input");
  input.className = "layer-rename";
  input.value = layer.name ?? (layer.type === "text" ? layer.text : layer.type) ?? layer.type;
  label.replaceWith(input);
  input.focus();
  input.select();
  let finished = false;
  const finish = (commit: boolean): void => {
    if (finished) return;
    finished = true;
    const next = input.value.trim();
    if (commit && next !== (layer.name ?? "")) {
      void send("rename layer", { op: "rename", id: layer.id, name: next || undefined } as Operation);
    } else {
      drawLayers();
    }
  };
  input.addEventListener("blur", () => finish(true));
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") finish(true);
    if (event.key === "Escape") finish(false);
  });
}

/**
 * Where a layer's parents put it, or null if a rotated group makes it
 * unanswerable with translations alone.
 */
function ancestorOffset(
  flat: Array<{ layer: Layer; parent: string | null; depth: number }>,
  parent: string | null,
): { x: number; y: number } | null {
  let offset = { x: 0, y: 0 };
  let current = parent;
  while (current !== null) {
    const found = flat.find(({ layer }) => layer.id === current);
    if (!found) return null;
    if ((found.layer.transform.rotation ?? 0) !== 0) return null;
    offset = {
      x: offset.x + found.layer.transform.x,
      y: offset.y + found.layer.transform.y,
    };
    current = found.parent;
  }
  return offset;
}

/**
 * Selection handles, as DOM elements over the SVG.
 *
 * Positioned in percentages of the canvas so they stay put when the preview is
 * scaled to fit the window, without anything having to recompute on resize.
 */
function drawOverlay(): void {
  dom.overlay.replaceChildren();
  if (!state.document) return;

  const { width, height } = state.document.canvas;
  const flat = api.flatten(api.layersOf(state.document));
  const geometries = flat.flatMap(({ layer, parent }) => {
    const offset = ancestorOffset(flat, parent);
    return offset
      ? [{
          layer,
          x: layer.transform.x + offset.x,
          y: layer.transform.y + offset.y,
          width: layer.transform.width,
          height: layer.transform.height,
        }]
      : [];
  });

  for (const geometry of geometries) {
    const hit = document.createElement("div");
    hit.className = "layer-hitbox";
    hit.dataset["id"] = geometry.layer.id;
    hit.style.left = `${(geometry.x / width) * 100}%`;
    hit.style.top = `${(geometry.y / height) * 100}%`;
    hit.style.width = `${(geometry.width / width) * 100}%`;
    hit.style.height = `${(geometry.height / height) * 100}%`;
    hit.style.transformOrigin = "center";
    hit.style.transform = `rotate(${geometry.layer.transform.rotation ?? 0}deg)`;
    hit.addEventListener("pointerdown", (event) => {
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        state.selection = state.selection.includes(geometry.layer.id)
          ? state.selection.filter((id) => id !== geometry.layer.id)
          : [...state.selection, geometry.layer.id];
      } else if (!state.selection.includes(geometry.layer.id)) {
        state.selection = [geometry.layer.id];
      }
      drawLayers();
      drawInspector();
      drawOverlay();
    });
    hit.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      if (geometry.layer.type === "text") beginInlineTextEdit(geometry.layer);
    });
    hit.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      if (!state.selection.includes(geometry.layer.id)) state.selection = [geometry.layer.id];
      drawLayers();
      drawInspector();
      drawOverlay();
      openContextMenu(event.clientX, event.clientY);
    });
    wireLongPressMenu(hit);
    dom.overlay.append(hit);
  }

  const selected = geometries.filter(({ layer }) => state.selection.includes(layer.id));
  if (selected.length === 0) return;
  void prepareDragPreview(selected.map(({ layer }) => layer.id));
  // A single layer uses its own unrotated box because the DOM box itself is
  // rotated. A multi-selection cannot have one meaningful angle, so its box
  // contains the visual (rotated) extents of every selected layer.
  const bounds = selected.length === 1
    ? {
        x: selected[0]!.x,
        y: selected[0]!.y,
        width: selected[0]!.width,
        height: selected[0]!.height,
      }
    : selectionBounds(selected.map((one) => ({
        x: one.x,
        y: one.y,
        width: one.width,
        height: one.height,
        rotation: one.layer.transform.rotation ?? 0,
      })));
  const box = document.createElement("div");
  box.className = "handle-box";
  box.style.left = `${(bounds.x / width) * 100}%`;
  box.style.top = `${(bounds.y / height) * 100}%`;
  box.style.width = `${(bounds.width / width) * 100}%`;
  box.style.height = `${(bounds.height / height) * 100}%`;
  box.style.transformOrigin = "center";
  if (selected.length === 1) {
    box.style.transform = `rotate(${selected[0]?.layer.transform.rotation ?? 0}deg)`;
  }
  box.dataset["ids"] = state.selection.join(",");
  box.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openContextMenu(event.clientX, event.clientY);
  });
  const editable = selected.every(({ layer }) => api.isEditable(layer));
  if (editable) {
    box.addEventListener("pointerdown", (event) => beginDrag(event, selected, bounds, "move"));
    box.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      const text = selected.length === 1 && selected[0]?.layer.type === "text"
        ? selected[0].layer
        : null;
      if (text) beginInlineTextEdit(text);
    });
    for (const handle of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
      const grip = document.createElement("button");
      grip.type = "button";
      grip.className = `resize-handle handle-${handle}`;
      grip.dataset["handle"] = handle;
      grip.dataset["resizeHandle"] = handle;
      grip.setAttribute("aria-label", translate("canvas.resizeHandle", { handle }));
      grip.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        beginDrag(event, selected, bounds, "resize", handle);
      });
      box.append(grip);
    }
    const rotate = document.createElement("button");
    rotate.type = "button";
    rotate.className = "rotation-handle";
    rotate.setAttribute("aria-label", translate("canvas.rotateSelection"));
    rotate.dataset["i18nAttr"] = "aria-label:canvas.rotateSelection";
    rotate.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>';
    rotate.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      beginDrag(event, selected, bounds, "rotate");
    });
    box.append(rotate);
  } else {
    box.classList.add("guarded");
    box.title = selected.map(({ layer }) => api.whyNotEditable(layer)).filter(Boolean).join("; ");
  }
  dom.overlay.append(box);
}

/** Canvas edits stay in one operation, so dimensions and placement undo together.
 *
 * The form lives in the Settings modal (the approved inventory's home for
 * document setup); `target` is the container inside it. */
function drawCanvasInspector(target: HTMLElement): void {
  if (!state.document) return;
  const canvas = state.document.canvas;
  const form = document.createElement("form");
  form.id = "canvas-settings";
  form.className = "canvas-settings";
  form.setAttribute("aria-label", translate("canvas.settingsLabel"));
  form.innerHTML = `
    <h2 data-i18n="common.canvas">Canvas</h2>
    <div class="property-grid">
      <label class="field"><span data-i18n="canvas.widthPx">Width (px)</span><input id="canvas-width" type="number" min="0" step="any" required></label>
      <label class="field"><span data-i18n="canvas.heightPx">Height (px)</span><input id="canvas-height" type="number" min="0" step="any" required></label>
    </div>
    <label class="field canvas-background-field" for="canvas-background" data-i18n="common.background">Background</label>
    <div class="canvas-background-row">
      <input id="canvas-background-picker" type="color" aria-label="Choose canvas background colour" data-i18n-attr="aria-label:canvas.chooseBackground">
      <input id="canvas-background" type="text" spellcheck="false" pattern="#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?" required title="Use #RRGGBB or #RRGGBBAA" data-i18n-attr="title:canvas.hexHint">
    </div>
    <label class="canvas-transparent"><input id="canvas-transparent" type="checkbox"> <span data-i18n="canvas.transparentBackground">Transparent background</span></label>
    <fieldset class="canvas-anchor-fieldset" aria-describedby="canvas-anchor-hint">
      <legend data-i18n="canvas.anchor">Anchor</legend>
      <div class="canvas-size-anchor-grid"></div>
      <p id="canvas-anchor-hint" class="hint" data-i18n="canvas.anchorHint">Keep this point fixed when resizing. Layers keep their size.</p>
    </fieldset>
    <button id="canvas-apply" type="submit" class="primary" disabled data-i18n="canvas.applyChanges">Apply canvas changes</button>
  `;
  const width = form.querySelector<HTMLInputElement>("#canvas-width")!;
  const height = form.querySelector<HTMLInputElement>("#canvas-height")!;
  const background = form.querySelector<HTMLInputElement>("#canvas-background")!;
  const picker = form.querySelector<HTMLInputElement>("#canvas-background-picker")!;
  const transparent = form.querySelector<HTMLInputElement>("#canvas-transparent")!;
  const anchorFieldset = form.querySelector<HTMLFieldSetElement>(".canvas-anchor-fieldset")!;
  const anchorGrid = form.querySelector<HTMLDivElement>(".canvas-size-anchor-grid")!;
  const apply = form.querySelector<HTMLButtonElement>("#canvas-apply")!;
  width.value = String(canvas.width);
  height.value = String(canvas.height);
  background.value = canvas.background ?? "#ffffff";
  picker.value = background.value.slice(0, 7);
  transparent.checked = canvas.background == null;
  const anchors = [
    ["top-left", "Top left", "↖"], ["top", "Top", "↑"], ["top-right", "Top right", "↗"],
    ["left", "Left", "←"], ["center", "Center", "•"], ["right", "Right", "→"],
    ["bottom-left", "Bottom left", "↙"], ["bottom", "Bottom", "↓"], ["bottom-right", "Bottom right", "↘"],
  ] as const;
  for (const [value, name, glyph] of anchors) {
    const label = document.createElement("label");
    label.className = "canvas-anchor";
    const anchorKey = value === "center" ? "canvas.anchorCenter" : `position.${value === "top" || value === "bottom" || value === "left" || value === "right" ? value : value.replace(/-([a-z])/g, (_, part: string) => part.toUpperCase())}`;
    label.title = translate(anchorKey as Parameters<typeof translate>[0]);
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "canvas-anchor";
    radio.value = value;
    radio.checked = value === "top-left";
    radio.setAttribute("aria-label", label.title);
    const mark = document.createElement("span");
    mark.textContent = glyph;
    mark.setAttribute("aria-hidden", "true");
    label.append(radio, mark);
    anchorGrid.append(label);
  }
  const nextBackground = (): string | null => transparent.checked ? null : background.value;
  const resizing = (): boolean => Number(width.value) !== canvas.width || Number(height.value) !== canvas.height;
  const update = (): void => {
    for (const input of [width, height]) {
      input.setCustomValidity(Number.isFinite(input.valueAsNumber) && input.valueAsNumber > 0
        ? "" : translate("canvas.invalidDimension"));
    }
    background.disabled = transparent.checked;
    picker.disabled = transparent.checked;
    anchorFieldset.disabled = !resizing();
    apply.disabled = !resizing() && nextBackground() === (canvas.background ?? null);
    if (/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(background.value)) {
      picker.value = background.value.slice(0, 7);
    }
  };
  picker.addEventListener("input", () => { background.value = picker.value; update(); });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
    if (apply.disabled || !form.reportValidity()) return;
    const chosen = form.querySelector<HTMLInputElement>('input[name="canvas-anchor"]:checked')?.value;
    const anchor = anchors.find(([value]) => value === chosen)?.[0] ?? "top-left";
    const operation: Operation = {
      op: "updateCanvas",
      ...(resizing() ? { width: Number(width.value), height: Number(height.value), anchor } : {}),
      ...(nextBackground() !== (canvas.background ?? null) ? { background: nextBackground() } : {}),
    };
    apply.disabled = true;
    void send("update canvas", operation).finally(() => {
      if (!form.isConnected || !state.document) return;
      Object.assign(canvas, state.document.canvas);
      update();
    });
  });
  update();
  target.append(form);
}

/** Opens one collapsible Properties section in `container` and returns its body. */
function dockSection(container: HTMLElement, title: string): HTMLElement {
  const details = document.createElement("details");
  details.className = "dock-section";
  details.open = !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(title);
  const summary = document.createElement("summary");
  const icons: Record<string, string> = {
    Canvas: "ph-frame-corners",
    Transform: "ph-arrows-out-cardinal",
    Typography: "ph-text-aa",
    Image: "ph-image",
    Shape: "ph-shapes",
    "Clip and mirror": "ph-crop",
    Appearance: "ph-palette",
    Effects: "ph-magic-wand",
    Presets: "ph-swatches",
    Slots: "ph-brackets-curly",
  };
  const icon = document.createElement("i");
  icon.className = `ph ${icons[title] ?? "ph-sliders-horizontal"} dock-section-icon`;
  icon.setAttribute("aria-hidden", "true");
  const heading = document.createElement("h2");
  const sectionKeys: Record<string, MessageKey> = {
    Canvas: "canvas.section",
    Transform: "properties.transform",
    Typography: "properties.typography",
    Image: "properties.image",
    Media: "properties.media",
    Shape: "properties.shape",
    "Clip and mirror": "properties.clipMirror",
    Appearance: "properties.appearance",
    Effects: "properties.effects",
    Presets: "properties.presets",
    Slots: "properties.slots",
  };
  const headingKey = sectionKeys[title];
  if (headingKey) {
    heading.dataset["i18n"] = headingKey;
    heading.textContent = translate(headingKey);
  } else {
    heading.textContent = title;
  }
  summary.append(icon, heading);
  const body = document.createElement("div");
  body.className = "dock-section-body";
  details.append(summary, body);
  container.append(details);
  return body;
}

/**
 * Builds one font selector bound to a text layer.
 *
 * Both homes — the contextual toolbar and the Typography section — use it, so
 * a family is committed from either only when the store has it, and always as
 * one ordinary `update` operation through the queue.
 */
function fontSelectorFor(layer: Extract<Layer, { type: "text" }>, disabled: boolean): ReturnType<typeof mountFontSelector> {
  const selector = mountFontSelector({ store: () => fontStore }, (family) => {
    void send("change font", { op: "update", id: layer.id, fontFamily: family } as Operation);
  });
  selector.setFamily(layer.fontFamily);
  selector.setDisabled(disabled);
  return selector;
}

let lastPropertiesSelection = "";

function syncSelectedTextProperties(layers: Layer[]): void {
  const key = layers.map((one) => one.id).join(",");
  if (key !== lastPropertiesSelection && layers.length === 1 && layers[0]?.type === "text") {
    showDock("properties");
    if (window.matchMedia("(max-width: 720px)").matches) {
      dom.structure.classList.add("mobile-open");
      dom.dockToggle.setAttribute("aria-expanded", "true");
    }
  }
  lastPropertiesSelection = key;
}

function drawInspector(): void {
  releaseFontSpecimens(dom.inspector);
  releaseFontSpecimens(dom.advancedInspector);
  dom.inspector.replaceChildren();
  dom.advancedInspector.replaceChildren();
  // The Properties panel is a stack of collapsible sections (plan Step 6
  // item 3): `pane` is the body of the section being drawn, and
  // `beginSection` opens the next one. Everything appends to `pane`.
  let pane: HTMLElement = dom.advancedInspector;
  const beginSection = (title: string): HTMLElement => {
    pane = dockSection(dom.advancedInspector, title);
    return pane;
  };
  const layers = selectedLayers();
  const layer = layers.length === 1 ? layers[0] ?? null : null;
  syncSelectedTextProperties(layers);
  // A control-side refusal is about the edit that was refused, so it goes
  // when a different selection is drawn.
  const selectionKey = layers.map((one) => one.id).join(",");
  if (selectionKey !== shapeControlErrorsSelection) {
    shapeControlErrors.clear();
    shapeControlErrorsSelection = selectionKey;
  }
  dom.deleteLayer.disabled = layers.length === 0 || layers.some((one) => !api.isEditable(one));
  dom.groupLayers.disabled = layers.length < 2 || layers.some((one) => !api.isEditable(one));
  renderPositionFields(layers);
  if (state.document) {
    const canvasButton = document.createElement("button");
    canvasButton.type = "button";
    canvasButton.id = "edit-canvas";
    canvasButton.className = "toolbar-action";
    canvasButton.setAttribute("aria-label", translate("editor.canvasSizeBackground"));
    canvasButton.dataset["i18nAttr"] = "aria-label:editor.canvasSizeBackground;title:editor.canvasSizeBackground";
    canvasButton.innerHTML = '<i class="ph ph-frame-corners" aria-hidden="true"></i><span data-i18n="common.canvas">Canvas</span>';
    canvasButton.title = translate("editor.canvasSizeBackground");
    canvasButton.addEventListener("click", () => {
      dom.contextMenu.hidden = true;
      state.selection = [];
      drawLayers();
      drawOverlay();
      drawInspector();
      showDock("properties");
    });
    dom.inspector.append(canvasButton);
  }

  if (layers.length === 0) {
    const hint = document.createElement("div");
    hint.className = "inspector-empty";
    hint.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span data-i18n="editor.selectLayerHint">Select a layer to edit it</span>';
    dom.inspector.append(hint);
    const note = document.createElement("p");
    note.className = "empty-panel-copy";
    note.dataset["i18n"] = state.document ? "editor.setCanvasHint" : "editor.openProjectHint";
    note.textContent = translate(state.document ? "editor.setCanvasHint" : "editor.openProjectHint");
    pane.append(note);
    if (state.document) {
      const canvasPane = dockSection(dom.advancedInspector, "Canvas");
      drawCanvasInspector(canvasPane);
    }
    return;
  }

  const guarded = layers.some((one) => !api.isEditable(one));
  const action = (
    labelKey: MessageKey,
    icon: string,
    run: () => void,
    disabled = guarded,
    className = "toolbar-action",
  ): HTMLButtonElement => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.disabled = disabled;
    button.title = translate(labelKey);
    button.dataset["i18nAttr"] = `title:${labelKey}`;
    const symbol = document.createElement("i");
    symbol.className = `ph ${icon}`;
    symbol.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.dataset["i18n"] = labelKey;
    text.textContent = translate(labelKey);
    button.append(symbol, text);
    button.addEventListener("click", run);
    return button;
  };

  if (layer?.type === "text") {

    const font = document.createElement("label");
    font.className = "toolbar-field toolbar-font";
    font.append(localizedSpan("editor.fontFamily"));
    font.firstElementChild?.classList.add("sr-only");
    // One selector for both homes: installed families only, with the store's
    // refusal shown at the control when what is typed matches none of them.
    const selector = fontSelectorFor(layer, guarded);
    selector.input.setAttribute("aria-label", translate("editor.fontFamily"));
    selector.input.dataset["i18nAttr"] = "aria-label:editor.fontFamily";
    font.append(selector.root);
    dom.inspector.append(font);

    const size = document.createElement("label");
    size.className = "toolbar-field toolbar-number";
    const sizeInput = document.createElement("input");
    sizeInput.type = "number";
    sizeInput.min = "1";
    sizeInput.value = String(layer.fontSize);
    sizeInput.disabled = guarded;
    sizeInput.setAttribute("aria-label", translate("editor.fontSize"));
    sizeInput.dataset["i18nAttr"] = "aria-label:editor.fontSize";
    sizeInput.addEventListener("change", () =>
      void send("change font size", {
        op: "update",
        id: layer.id,
        fontSize: Number(sizeInput.value),
      } as Operation),
    );
    size.append(sizeInput);
    dom.inspector.append(size);

    const colour = document.createElement("input");
    colour.type = "color";
    colour.className = "toolbar-colour";
    colour.value = layer.color ?? "#000000";
    colour.disabled = guarded;
    colour.setAttribute("aria-label", translate("editor.textColour"));
    colour.dataset["i18nAttr"] = "aria-label:editor.textColour";
    colour.addEventListener("change", () =>
      void send("change colour", { op: "update", id: layer.id, color: colour.value } as Operation),
    );
    dom.inspector.append(colour);

    for (const [value, icon] of [
      ["left", "ph-text-align-left"],
      ["center", "ph-text-align-center"],
      ["right", "ph-text-align-right"],
    ] as const) {
      const alignKey = {
        left: "editor.alignLeft",
        center: "editor.alignCenter",
        right: "editor.alignRight",
      }[value] as MessageKey;
      const button = action(alignKey, icon, () => {
        void send(`align text ${value}`, { op: "update", id: layer.id, align: value } as Operation);
      }, guarded, "icon-button toolbar-icon");
      button.title = translate(alignKey);
      button.querySelector("span")?.classList.add("sr-only");
      button.classList.toggle("selected", (layer.align ?? "left") === value);
      dom.inspector.append(button);
    }
    const divider = document.createElement("span");
    divider.className = "toolbar-divider";
    dom.inspector.append(divider);
  } else {
    const selectionLabel = document.createElement("span");
    selectionLabel.className = "selection-label";
    if (layers.length === 1) {
      selectionLabel.textContent = layer?.type ?? translate("editor.layerGeneric");
    } else {
      selectionLabel.dataset["i18nCount"] = "editor.layerCount";
      selectionLabel.dataset["count"] = String(layers.length);
      selectionLabel.textContent = formatCount("editor.layerCount", layers.length);
    }
    dom.inspector.append(selectionLabel);
  }

  const ids = layers.map((one) => one.id);
  dom.inspector.append(
    action("editor.centreHorizontally", "ph-align-center-horizontal", () => {
      void send("centre horizontally", { op: "centerOnCanvas", ids, axis: "horizontal" } as Operation);
    }),
    action("editor.centreVertically", "ph-align-center-vertical", () => {
      void send("centre vertically", { op: "centerOnCanvas", ids, axis: "vertical" } as Operation);
    }),
    action("position.title", "ph-bounding-box", () => togglePositionPopover(), false, "toolbar-action position-button"),
    action("layers.groupButton", "ph-stack", () => {
      if (ids.length > 1) void send("group", { op: "group", ids } as Operation);
    }, guarded || ids.length < 2),
    action("editor.duplicate", "ph-copy", () => {
      void sendBatch("duplicate", ids.map((id) => ({ op: "duplicate", id } as Operation)));
    }),
  );

  if (!layer) {
    const note = document.createElement("p");
    note.className = "empty-panel-copy";
    const textLayers = layers.filter((one) => one.type === "text");
    const mixedFamilies = textLayers.length > 1 && new Set(textLayers.map((one) => one.fontFamily)).size > 1;
    note.dataset["i18n"] = mixedFamilies ? "properties.mixedFonts" : "editor.selectionCountHint";
    note.textContent = mixedFamilies ? translate("properties.mixedFonts") : translate("editor.selectionCountHint", { count: layers.length });
    pane.append(note);
    return;
  }

  const why = api.whyNotEditable(layer);
  if (why) {
    const note = document.createElement("p");
    note.className = "guarded-note";
    note.textContent = why;
    pane.append(note);
  }

  const field = (
    labelKey: MessageKey,
    value: string,
    apply: (next: string) => Operation | null,
    type = "number",
    list?: string,
    className?: string,
  ): void => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    const caption = document.createElement("span");
    caption.dataset["i18n"] = labelKey;
    caption.textContent = translate(labelKey);
    wrapper.append(caption);
    const input = document.createElement("input");
    input.type = type;
    input.value = value;
    input.disabled = why !== null;
    if (list) input.setAttribute("list", list);
    if (className) input.className = className;
    input.addEventListener("change", () => {
      if (input.value === value) return;
      const operation = apply(input.value);
      if (operation) void send(`change ${translate(labelKey)}`, operation);
    });
    wrapper.append(input);
    pane.append(wrapper);
  };


  if (layer.type === "text") {
    pane = beginSection("Typography");
    const editText = document.createElement("button");
    editText.type = "button";
    editText.className = "wide-action edit-text-button";
    editText.disabled = why !== null;
    editText.innerHTML = '<i class="ph ph-pencil-simple" aria-hidden="true"></i>';
    editText.append(localizedSpan("canvas.editText"));
    editText.addEventListener("click", () => beginInlineTextEdit(layer));
    pane.append(editText);
    const familyAvailable = fontStore.families.includes(layer.fontFamily);
    const summary = document.createElement("div");
    summary.className = "current-font-summary";
    const familyName = document.createElement("strong");
    familyName.className = "current-font-family";
    familyName.textContent = layer.fontFamily;
    const faceName = document.createElement("span");
    faceName.className = "current-font-face";
    faceName.textContent = `${layer.fontWeight ?? 400} · ${layer.fontStyle ?? "normal"} · ${layer.fontSize} px`;
    summary.append(familyName, faceName);
    if (!familyAvailable) {
      const status = document.createElement("p");
      status.className = "current-font-status";
      status.dataset["i18n"] = "properties.fontMissing";
      status.textContent = translate("properties.fontMissing");
      const install = document.createElement("button");
      install.type = "button";
      install.className = "small";
      install.dataset["i18n"] = "fonts.installFonts";
      install.textContent = translate("fonts.installFonts");
      install.addEventListener("click", () => void guard("fonts", () => openFontManager(true)));
      summary.append(status, install);
    } else {
      const specimen = document.createElement("span");
      specimen.className = "current-font-specimen";
      const exactFace = fontStore.faces.find((face) =>
        face.family === layer.fontFamily
        && face.weight === (layer.fontWeight ?? 400)
        && face.style === (layer.fontStyle ?? "normal")
      );
      if (exactFace) {
        appendInstalledFontSpecimen(specimen, exactFace);
      } else {
        const status = document.createElement("span");
        status.className = "font-specimen-status";
        status.textContent = translate("fonts.previewUnavailable");
        specimen.append(status);
      }
      summary.append(specimen);
    }
    pane.append(summary);
    const fontField = document.createElement("label");
    fontField.className = "field";
    fontField.append(localizedSpan("properties.font"));
    const fontSelector = fontSelectorFor(layer, why !== null);
    fontSelector.input.setAttribute("aria-label", translate("editor.fontFamily"));
    fontSelector.input.dataset["i18nAttr"] = "aria-label:editor.fontFamily";
    fontField.append(fontSelector.root);
    pane.append(fontField);
    field("properties.fontSize", String(layer.fontSize), (next) => ({ op: "update", id: layer.id, fontSize: Number(next) }) as Operation);
    field("properties.lineHeight", String(layer.lineHeight ?? 1.2), (next) => ({ op: "update", id: layer.id, lineHeight: Number(next) }) as Operation);
    // Weight is offered as the faces the store actually holds for this family;
    // a weight the files lack is refused at render, so it is not offered here.
    // When the store records no faces for the family, the honest fallback is
    // the number field the document carries.
    const faces = facesOf(layer.fontFamily, fontStore.faces);
    if (faces.length) {
      const weightField = document.createElement("label");
      weightField.className = "field";
      weightField.append(localizedSpan("properties.weight"));
      const weightSelect = document.createElement("select");
      weightSelect.disabled = why !== null;
      weightSelect.setAttribute("aria-label", translate("canvas.fontWeight"));
    weightSelect.dataset["i18nAttr"] = "aria-label:canvas.fontWeight";
      const currentWeight = layer.fontWeight ?? 400;
      const currentStyle = layer.fontStyle ?? "normal";
      const known = [...new Set([
        ...faces.filter((face) => face.style === currentStyle).map((face) => face.weight),
        currentWeight,
      ])].sort((a, b) => a - b);
      for (const weight of known) {
        const option = document.createElement("option");
        option.value = String(weight);
        option.textContent = String(weight);
        weightSelect.append(option);
      }
      weightSelect.value = String(currentWeight);
      weightSelect.addEventListener("change", () =>
        void send("change Weight", { op: "update", id: layer.id, fontWeight: Number(weightSelect.value) } as Operation),
      );
      weightField.append(weightSelect);
      pane.append(weightField);
    } else {
      field("properties.weight", String(layer.fontWeight ?? 400), (next) => ({ op: "update", id: layer.id, fontWeight: Number(next) }) as Operation);
    }
    field("properties.letterSpacing", String(layer.letterSpacing ?? 0), (next) => ({ op: "update", id: layer.id, letterSpacing: Number(next) }) as Operation);
    const fontStyle = document.createElement("label");
    fontStyle.className = "field";
    fontStyle.append(localizedSpan("properties.style"));
    const fontStyleSelect = document.createElement("select");
    fontStyleSelect.disabled = why !== null;
    fontStyleSelect.setAttribute("aria-label", translate("canvas.fontStyle"));
    fontStyleSelect.dataset["i18nAttr"] = "aria-label:canvas.fontStyle";
    const currentStyle = layer.fontStyle ?? "normal";
    const currentWeight = layer.fontWeight ?? 400;
    const availableStyles = faces
      .filter((face) => face.weight === currentWeight)
      .map((face) => face.style === "oblique" ? "italic" : face.style);
    const styles = faces.length
      ? [...new Set([...availableStyles, currentStyle])]
      : [currentStyle];
    for (const style of styles) {
      const option = document.createElement("option");
      option.value = style;
      option.textContent = style;
      fontStyleSelect.append(option);
    }
    fontStyleSelect.value = layer.fontStyle ?? "normal";
    fontStyleSelect.addEventListener("change", () =>
      void send("change font style", { op: "update", id: layer.id, fontStyle: fontStyleSelect.value } as Operation),
    );
    fontStyle.append(fontStyleSelect);
    pane.append(fontStyle);
    const valign = document.createElement("label");
    valign.className = "field";
    valign.append(localizedSpan("properties.verticalAlign"));
    const valignSelect = document.createElement("select");
    valignSelect.disabled = why !== null;
    valignSelect.setAttribute("aria-label", translate("canvas.verticalAlign"));
    valignSelect.dataset["i18nAttr"] = "aria-label:canvas.verticalAlign";
    for (const mode of ["top", "middle", "bottom"]) {
      const option = document.createElement("option");
      option.value = mode;
      option.textContent = mode;
      valignSelect.append(option);
    }
    valignSelect.value = layer.verticalAlign ?? "top";
    valignSelect.addEventListener("change", () =>
      void send("change vertical align", { op: "update", id: layer.id, verticalAlign: valignSelect.value } as Operation),
    );
    valign.append(valignSelect);
    pane.append(valign);
    field("properties.colour", layer.color ?? "#000000", (next) =>
      next === "none"
        ? ({ op: "update", id: layer.id, color: null }) as Operation
        : ({ op: "update", id: layer.id, color: next }) as Operation,
    "color");
    field("properties.strokeColour", layer.stroke?.color ?? "none", (next) =>
      next === "none"
        ? ({ op: "update", id: layer.id, stroke: null }) as Operation
        : ({ op: "update", id: layer.id, stroke: { color: next, width: layer.stroke?.width ?? 1 } }) as Operation,
    "color");
    field("properties.strokeWidth", String(layer.stroke?.width ?? 1), (next) => ({ op: "update", id: layer.id, stroke: { color: layer.stroke?.color ?? "#000000", width: Number(next) } }) as Operation);
  }

  beginSection("Transform");
  const grid = document.createElement("div");
  grid.className = "property-grid";
  const appendFieldToGrid = (
    labelKey: MessageKey,
    value: string,
    apply: (next: string) => Operation | null,
  ): void => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    const caption = document.createElement("span");
    caption.dataset["i18n"] = labelKey;
    caption.textContent = translate(labelKey);
    wrapper.append(caption);
    const input = document.createElement("input");
    input.type = "number";
    input.value = value;
    input.disabled = why !== null;
    input.addEventListener("change", () => {
      const operation = apply(input.value);
      if (operation) void send(`change ${translate(labelKey)}`, operation);
    });
    wrapper.append(input);
    grid.append(wrapper);
  };
  const t = layer.transform;
  appendFieldToGrid("properties.x", String(t.x), (next) => moveTo(layer, Number(next), t.y));
  appendFieldToGrid("properties.y", String(t.y), (next) => moveTo(layer, t.x, Number(next)));
  appendFieldToGrid("properties.width", String(t.width), (next) => resizeTo(layer, Number(next), t.height));
  appendFieldToGrid("properties.height", String(t.height), (next) => resizeTo(layer, t.width, Number(next)));
  appendFieldToGrid("properties.rotation", String(t.rotation ?? 0), (next) => ({ op: "rotate", id: layer.id, degrees: Number(next) }) as Operation);
  appendFieldToGrid("properties.opacity", String(layer.opacity ?? 1), (next) => ({ op: "update", id: layer.id, opacity: Number(next) }) as Operation);
  pane.append(grid);

  if (layer.type === "image" || layer.type === "svg") {
    // How the asset meets its box. The engine's default is `fill`, which
    // stretches; until now the only way to ask for anything else was to edit
    // the file, and an upload was silently given `contain` with no way back.
    pane = beginSection("Media");
    const fit = document.createElement("label");
    fit.className = "field";
    fit.append(localizedSpan("properties.fit"));
    const fitSelect = document.createElement("select");
    fitSelect.disabled = why !== null;
    fitSelect.setAttribute("aria-label", translate("canvas.fit"));
    fitSelect.dataset["i18nAttr"] = "aria-label:canvas.fit";
    for (const mode of api.IMAGE_FITS) {
      const option = document.createElement("option");
      option.value = mode;
      option.textContent = mode;
      fitSelect.append(option);
    }
    fitSelect.value = layer.fit ?? "fill";
    fitSelect.addEventListener("change", () =>
      void send("change fit", { op: "update", id: layer.id, fit: fitSelect.value } as Operation),
    );
    fit.append(fitSelect);
    pane.append(fit);

    if (layer.type === "image") {
      // A crop is a rectangle in the image's own pixels, not a fit mode. It
      // works with Fit: the engine places the crop in the box as if it were
      // the whole image. No crop on a vector layer: a vector has no source
      // pixels of its own.
      const crop = cropOf(layer);
      const asset = assetOf(layer);
      const sourceWidth = asset?.width ?? null;
      const sourceHeight = asset?.height ?? null;
      const sourceKnown =
        typeof sourceWidth === "number" && sourceWidth > 0 &&
        typeof sourceHeight === "number" && sourceHeight > 0;

      const hint = document.createElement("p");
      hint.className = "hint";
      const cropHintKey = sourceKnown ? "canvas.cropAvailableHint" : "canvas.cropUnavailableHint";
      hint.dataset["i18n"] = cropHintKey;
      hint.textContent = translate(cropHintKey);
      pane.append(hint);

      // With no crop, the fields show the whole image, so the first change
      // starts from the truth rather than from four zeros.
      const shown = crop ?? { x: 0, y: 0, width: sourceWidth ?? 0, height: sourceHeight ?? 0 };
      const cropRow = (
        labelKey: MessageKey,
        name: string,
        value: number,
        change: (next: number) => Operation | null,
      ): void => {
        const wrapper = document.createElement("label");
        wrapper.className = "field";
        wrapper.append(localizedSpan(labelKey));
        const input = document.createElement("input");
        input.type = "number";
        input.className = name;
        input.value = String(value);
        input.disabled = why !== null || !sourceKnown;
        input.addEventListener("change", () => {
          if (input.value === String(value)) return;
          const operation = change(Number(input.value));
          if (operation) void send(`change ${translate(labelKey)}`, operation);
        });
        wrapper.append(input);
        pane.append(wrapper);
      };
      // One crop is four numbers, so every field sends the whole rectangle
      // with the one value the person changed. A crop that is not a positive
      // rectangle is a typed refusal from the engine, so it is not sent.
      const setCrop = (next: { x: number; y: number; width: number; height: number }): Operation | null => {
        if (!Number.isFinite(next.x) || !Number.isFinite(next.y)) return null;
        if (!(next.width > 0) || !(next.height > 0)) return null;
        return { op: "update", id: layer.id, crop: next } as Operation;
      };
      cropRow("canvas.cropX", "crop-x", shown.x, (next) => setCrop({ ...shown, x: next }));
      cropRow("canvas.cropY", "crop-y", shown.y, (next) => setCrop({ ...shown, y: next }));
      cropRow("canvas.cropWidth", "crop-width", shown.width, (next) => setCrop({ ...shown, width: next }));
      cropRow("canvas.cropHeight", "crop-height", shown.height, (next) => setCrop({ ...shown, height: next }));

      const clearRow = document.createElement("div");
      clearRow.className = "field";
      const clear = document.createElement("button");
      clear.type = "button";
      clear.className = "small crop-clear";
      clear.dataset["i18n"] = "canvas.clearCrop";
    clear.textContent = translate("canvas.clearCrop");
      clear.dataset["i18nAttr"] = "title:canvas.wholeImage";
      clear.title = translate("canvas.wholeImage");
      clear.disabled = why !== null || crop === null;
      clear.addEventListener("click", () => {
        clear.disabled = true;
        void send("clear crop", { op: "update", id: layer.id, crop: null } as Operation);
      });
      clearRow.append(clear);
      pane.append(clearRow);
    }
  }

  if (layer.type === "shape") {
    // Fill and stroke are two independent paints, and either may be absent —
    // a shape with neither is valid, and "no fill" is not the same as white.
    // So each paint gets a colour and a control that removes it: `null`
    // clears it, an absent property leaves it alone, and every control here
    // sends exactly one update.
    pane = beginSection("Shape");

    const kind = api.shapeKindOf(layer);
    const strokeColour = layer.stroke?.color ?? SHAPE_STROKE_COLOUR;
    const strokeWidth = layer.stroke?.width ?? SHAPE_STROKE_WIDTH;
    // A colour input holds `#rrggbb` and nothing else, and a document written
    // elsewhere may carry `#rrggbbaa`. Showing the opaque part of it is much
    // closer to the truth than the black an invalid value falls back to. Only
    // the swatch is trimmed: the width row still sends the colour as stored.
    const swatch = (colour: string): string =>
      /^#[0-9a-fA-F]{8}$/.test(colour) ? colour.slice(0, 7) : colour;

    const paint = (
      labelKey: MessageKey,
      name: string,
      colour: string,
      present: boolean,
      set: (next: string) => Operation,
      clear: () => Operation,
    ): void => {
      const row = document.createElement("div");
      row.className = "field shape-field";
      const caption = document.createElement("span");
      caption.dataset["i18n"] = labelKey;
      caption.textContent = translate(labelKey);
      const controls = document.createElement("span");
      controls.className = "shape-paint";
      const input = document.createElement("input");
      input.type = "color";
      input.className = name;
      input.value = colour;
      input.disabled = why !== null;
      input.setAttribute("aria-label", translate(labelKey));
      input.dataset["i18nAttr"] = `aria-label:${labelKey}`;
      // Absent is shown as the colour this build would give it, so picking
      // one adds the paint that was described rather than a surprise.
      if (!present) {
        input.dataset["paintLabelKey"] = labelKey;
        input.title = translate("canvas.noColor", { label: translate(labelKey).toLowerCase() });
      }
      input.addEventListener("change", () => void send(`change ${translate(labelKey)}`, set(input.value)));
      const none = document.createElement("button");
      none.type = "button";
      none.className = `small ${name}-none`;
      none.dataset["i18n"] = "canvas.none";
    none.textContent = translate("canvas.none");
      none.dataset["paintLabelKey"] = labelKey;
      none.title = translate("canvas.removeColor", { label: translate(labelKey).toLowerCase() });
      none.disabled = why !== null || !present;
      none.addEventListener("click", () => void send(`clear ${translate(labelKey)}`, clear()));
      controls.append(input, none);
      row.append(caption, controls);
      pane.append(row);
    };

    paint(
      "properties.fill",
      "shape-fill",
      swatch(layer.fill ?? SHAPE_FILL_COLOUR),
      Boolean(layer.fill),
      (next) => ({ op: "update", id: layer.id, fill: next }) as Operation,
      () => ({ op: "update", id: layer.id, fill: null }) as Operation,
    );
    // A stroke is one value, not two: the colour carries the width it is
    // already drawn with, and a shape that had no stroke gets this build's
    // default width rather than a zero-width one that would draw nothing.
    paint(
      "properties.stroke",
      "shape-stroke",
      swatch(strokeColour),
      Boolean(layer.stroke),
      (next) => ({ op: "update", id: layer.id, stroke: { color: next, width: strokeWidth } }) as Operation,
      () => ({ op: "update", id: layer.id, stroke: null }) as Operation,
    );
    field(
      "properties.strokeWidth",
      String(strokeWidth),
      (next) => ({
        op: "update",
        id: layer.id,
        stroke: { color: strokeColour, width: Number(next) },
      }) as Operation,
      "number",
      undefined,
      "shape-stroke-width",
    );
    if (kind === "rect") {
      // Only a rect has corners. Sending this to an ellipse or a line is a
      // typed refusal from the engine, so the row is simply not offered.
      field(
        "properties.cornerRadius",
        String(api.cornerRadiusOf(layer)),
        (next) => ({ op: "update", id: layer.id, cornerRadius: Number(next) }) as Operation,
        "number",
        undefined,
        "shape-corner-radius",
      );
    }

    // A typed refusal can be shown beside the control that caused it, not
    // only in the status bar. The map is cleared when the selection changes
    // and when the control sends again, so a message never outlives its
    // attempt.
    const drawControlError = (row: HTMLElement, key: string): void => {
      const message = shapeControlErrors.get(key);
      if (!message) return;
      const note = document.createElement("span");
      note.className = `control-error ${key}-note`;
      note.textContent = message;
      row.append(note);
    };
    const refuseAtControl = (key: string) => (error: unknown): void => {
      shapeControlErrors.set(
        key,
        error instanceof api.ApiError ? apiErrorMessage(error) : String(error),
      );
      drawInspector();
    };

    // The path data field. Committing replaces the whole geometry with a path
    // in one update — the same whole-shape replacement a transform edit does
    // for the box. The grammar is the engine's business, so nothing is
    // pre-checked here: the typed InvalidPath refusal (which command, which
    // byte) is shown at this control, and a refused update writes nothing.
    const pathRow = document.createElement("label");
    pathRow.className = "field shape-field shape-path";
    const pathCaption = document.createElement("span");
    pathCaption.dataset["i18n"] = "canvas.pathData";
    pathCaption.textContent = translate("canvas.pathData");
    const pathInput = document.createElement("textarea");
    pathInput.className = "shape-path-d";
    pathInput.rows = 3;
    pathInput.maxLength = 2048;
    pathInput.disabled = why !== null;
    pathInput.setAttribute("aria-label", translate("canvas.pathData"));
    pathInput.dataset["i18nAttr"] = "aria-label:canvas.pathData";
    const shapeRecord = layer.shape as Record<string, unknown>;
    if (kind === "path" && typeof shapeRecord["d"] === "string") {
      pathInput.value = shapeRecord["d"];
    }
    const committedD = pathInput.value;
    pathInput.addEventListener("change", () => {
      const d = pathInput.value.trim();
      if (!d || d === committedD) return;
      shapeControlErrors.delete("path-d");
      void send("set path data", {
        op: "update",
        id: layer.id,
        shape: { kind: "path", d },
      } as Operation, refuseAtControl("path-d"));
    });
    pathRow.append(pathCaption, pathInput);
    drawControlError(pathRow, "path-d");
    pane.append(pathRow);

    // The dash pattern, as a comma list. Entry count and positivity are
    // checked here, because a form that sends a refusal it could have caught
    // buys a round trip that says nothing new; anything the engine still
    // refuses arrives back in its own words, at this control.
    const dashRow = document.createElement("label");
    dashRow.className = "field shape-field shape-dash-row";
    dashRow.append(localizedSpan("canvas.dashPattern"));
    const dashInput = document.createElement("input");
    dashInput.type = "text";
    dashInput.className = "shape-dash";
    dashInput.dataset["i18nAttr"] = "placeholder:canvas.dashExample;aria-label:canvas.dashPattern";
    dashInput.placeholder = translate("canvas.dashExample");
    dashInput.disabled = why !== null;
    dashInput.setAttribute("aria-label", translate("canvas.dashPattern"));
    dashInput.value = (layer.stroke?.dashArray ?? []).join(", ");
    dashRow.append(dashInput);
    drawControlError(dashRow, "dash");
    pane.append(dashRow);
    dashInput.addEventListener("change", () => {
      const text = dashInput.value.trim();
      shapeControlErrors.delete("dash");
      const numbers = text ? text.split(",").map((part) => Number(part.trim())) : [];
      if (numbers.some((value) => !Number.isFinite(value) || value <= 0)) {
        shapeControlErrors.set("dash", translate("canvas.dashPositiveError"));
        drawInspector();
        return;
      }
      if (numbers.length > api.MAX_DASH_ENTRIES) {
        shapeControlErrors.set("dash", translate("canvas.dashMaxError", { count: api.MAX_DASH_ENTRIES }));
        drawInspector();
        return;
      }
      const stroke = {
        ...(layer.stroke ?? { color: strokeColour, width: strokeWidth }),
        dashArray: numbers.length ? numbers : null,
      };
      void send("change dash pattern", { op: "update", id: layer.id, stroke } as Operation, refuseAtControl("dash"));
    });

    // Cap and join, from the sets the engine draws. A value written by a
    // newer build is listed as itself, so it can be seen and kept but never
    // silently retyped.
    const strokeChoice = (
      labelKey: MessageKey,
      className: string,
      key: "lineCap" | "lineJoin",
      choices: readonly string[],
    ): void => {
      const row = document.createElement("label");
      row.className = "field shape-field";
      row.append(localizedSpan(labelKey));
      const select = document.createElement("select");
      select.className = className;
      select.disabled = why !== null;
      select.setAttribute("aria-label", translate(labelKey));
      select.dataset["i18nAttr"] = `aria-label:${labelKey}`;
      // A cap or join written by a newer build round-trips verbatim, so its
      // runtime type is only ever checked here, at the control.
      const raw = layer.stroke?.[key];
      const current = typeof raw === "string" ? raw : null;
      const offered = current && !choices.includes(current)
        ? [...choices, current]
        : [...choices];
      for (const choice of offered) {
        const option = document.createElement("option");
        option.value = choice;
        option.textContent = choice;
        select.append(option);
      }
      select.value = current ?? choices[0] ?? "";
      select.addEventListener("change", () => {
        const stroke = {
          ...(layer.stroke ?? { color: strokeColour, width: strokeWidth }),
          [key]: select.value,
        };
        void send(`change ${translate(labelKey).toLowerCase()}`, { op: "update", id: layer.id, stroke } as Operation);
      });
      row.append(select);
      pane.append(row);
    };
    strokeChoice("properties.lineCap", "shape-stroke-cap", "lineCap", ["butt", "round", "square"]);
    strokeChoice("properties.lineJoin", "shape-stroke-join", "lineJoin", ["miter", "round", "bevel"]);

    // Markers live on the Line payload, so the two selects are offered only
    // on a line; the engine refuses them on every other kind in its own
    // words, so the form never invites that refusal.
    if (kind === "line") {
      const markerRow = (
        labelKey: MessageKey,
        className: string,
        key: "markerStart" | "markerEnd",
      ): void => {
        const row = document.createElement("label");
        row.className = "field shape-field";
        row.append(localizedSpan(labelKey));
        const select = document.createElement("select");
        select.className = className;
        select.disabled = why !== null;
        select.setAttribute("aria-label", translate(labelKey));
        select.dataset["i18nAttr"] = `aria-label:${labelKey}`;
        const current = shapeRecord[key];
        const offered = typeof current === "string" && current !== "none" &&
            !["arrow", "circle"].includes(current)
          ? ["none", "arrow", "circle", current]
          : ["none", "arrow", "circle"];
        for (const choice of offered) {
          const option = document.createElement("option");
          option.value = choice;
          option.textContent = choice;
          select.append(option);
        }
        select.value = typeof current === "string" ? current : "none";
        select.addEventListener("change", () =>
          void send(`change ${translate(labelKey).toLowerCase()}`, {
            op: "update",
            id: layer.id,
            [key]: select.value,
          } as Operation),
        );
        row.append(select);
        pane.append(row);
      };
      markerRow("properties.markerStart", "shape-marker-start", "markerStart");
      markerRow("properties.markerEnd", "shape-marker-end", "markerEnd");
    }
  }

  // Clip and mirror apply to every kind: a clip masks whatever the layer
  // draws, and a flip mirrors it about the box centre.
  pane = beginSection("Clip and mirror");

  const clipShape = clipShapeOf(layer);
  const clipRow = document.createElement("label");
  clipRow.className = "field";
  clipRow.append(localizedSpan("properties.clip"));
  const clipSelect = document.createElement("select");
  clipSelect.className = "clip-shape";
  clipSelect.disabled = why !== null;
  clipSelect.setAttribute("aria-label", translate("properties.clip"));
    clipSelect.dataset["i18nAttr"] = "aria-label:properties.clip";
  // A clip shape this build does not know is listed as itself, so it can be
  // seen and replaced but never silently becomes something else.
  const clipChoices: string[] = [...CLIP_SHAPES];
  if (clipShape && !clipChoices.includes(clipShape)) clipChoices.push(clipShape);
  for (const choice of ["none", ...clipChoices]) {
    const option = document.createElement("option");
    option.value = choice;
    option.textContent = choice;
    clipSelect.append(option);
  }
  clipSelect.value = clipShape ?? "none";
  clipSelect.addEventListener("change", () => {
    const chosen = clipSelect.value;
    if (chosen === (clipShape ?? "none")) return;
    const clip = chosen === "none"
      ? null
      : chosen === "rect"
        ? { shape: "rect", cornerRadius: clipRadiusOf(layer) }
        : { shape: chosen };
    void send("change clip", { op: "update", id: layer.id, clip } as Operation);
  });
  clipRow.append(clipSelect);
  pane.append(clipRow);

  if (clipShape === "rect") {
    // Only a rect clip has corners. The engine refuses this property on any
    // other shape, so the row is simply not offered.
    field(
      "properties.clipRadius",
      String(clipRadiusOf(layer)),
      (next) => ({
        op: "update",
        id: layer.id,
        clip: { shape: "rect", cornerRadius: Number(next) },
      }) as Operation,
      "number",
      undefined,
      "clip-radius",
    );
  }

  const mirror = document.createElement("div");
  mirror.className = "property-flags";
  const flip = (labelKey: MessageKey, name: string, key: string, current: boolean): void => {
    const wrapper = document.createElement("label");
    wrapper.className = "field checkbox";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = name;
    input.checked = current;
    input.disabled = why !== null;
    input.setAttribute("aria-label", translate(labelKey));
    input.dataset["i18nAttr"] = `aria-label:${labelKey}`;
    input.addEventListener("change", () =>
      void send(translate(labelKey).toLowerCase(), { op: "update", id: layer.id, [key]: input.checked } as Operation),
    );
    wrapper.append(input, localizedSpan(labelKey));
    mirror.append(wrapper);
  };
  flip("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", layer.transform.flipHorizontal ?? false);
  flip("properties.flipVertical", "flip-vertical", "flipVertical", layer.transform.flipVertical ?? false);
  pane.append(mirror);

  pane = beginSection("Appearance");
  const blend = document.createElement("label");
  blend.className = "field";
  blend.append(localizedSpan("properties.blendMode"));
  const blendSelect = document.createElement("select");
  blendSelect.disabled = why !== null;
  for (const mode of api.BLEND_MODES) {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    blendSelect.append(option);
  }
  blendSelect.value = layer.blendMode ?? "normal";
  blendSelect.addEventListener("change", () =>
    void send("change blend mode", { op: "update", id: layer.id, blendMode: blendSelect.value } as Operation),
  );
  blend.append(blendSelect);
  pane.append(blend);

  drawEffects(dom.advancedInspector, layer, why !== null);
  drawPresets(dom.advancedInspector, layer, why !== null);
  drawSlots(dom.advancedInspector, layer);

  const flags = document.createElement("div");
  flags.className = "property-flags";
  const visible = document.createElement("label");
  visible.className = "field checkbox";
  const visibleInput = document.createElement("input");
  visibleInput.type = "checkbox";
  visibleInput.checked = layer.visible ?? true;
  visibleInput.disabled = why !== null;
  visibleInput.addEventListener("change", () =>
    void send("show/hide", { op: "setVisible", id: layer.id, visible: visibleInput.checked } as Operation),
  );
  visible.append(visibleInput, localizedSpan("properties.visible"));
  const locked = document.createElement("label");
  locked.className = "field checkbox";
  const lockedInput = document.createElement("input");
  lockedInput.type = "checkbox";
  lockedInput.checked = layer.locked ?? false;
  lockedInput.disabled = Boolean(layer.protected || layer.readOnly);
  lockedInput.addEventListener("change", () =>
    void send(lockedInput.checked ? "lock layer" : "unlock layer", { op: "setLocked", id: layer.id, locked: lockedInput.checked } as Operation),
  );
  locked.append(lockedInput, localizedSpan("properties.locked"));
  flags.append(visible, locked);
  pane.append(flags);
}

/**
 * The effect stack, as rows with one number each.
 *
 * Effects are never baked: what is edited here is the list of numbers in the
 * document, and the pixels are derived from it every render. So removing an
 * effect is as complete as never having added it, and undo restores the whole
 * stack like any other property.
 */
function drawEffects(target: HTMLElement, layer: Layer, guarded: boolean): void {
  const effects = (layer.effects ?? []) as api.Effect[];

  const body = dockSection(target, "Effects");

  /** Sends the whole stack, because order is part of what it means. */
  const setStack = (next: api.Effect[]): void => {
    void send("effects", { op: "update", id: layer.id, effects: next } as Operation);
  };

  for (const [index, effect] of effects.entries()) {
    const row = document.createElement("div");
    row.className = "effect-row";
    row.dataset["effect"] = effect.type;

    const label = document.createElement("span");
    label.className = "effect-name";
    label.textContent = effect.type.replace(/([A-Z])/g, " $1").replace(/^./, (one) => one.toUpperCase());
    row.append(label);

    // Most effects have one number worth editing; grain's seed is deliberately
    // not one of them, because changing it would change the picture for no
    // reason a person asked for. A drop shadow has four values and no single
    // one of them is the parameter, so each field is named in the row.
    const fields = api.effectFields(effect);
    if (fields.length > 1) row.classList.add("multi");
    const editField = (field: api.EffectField): HTMLInputElement => {
      const input = document.createElement("input");
      input.type = field.kind === "color" ? "text" : "number";
      if (field.kind === "number") input.step = "0.05";
      input.value = String(field.value);
      input.disabled = guarded;
      input.dataset["field"] = field.name;
      input.setAttribute("aria-label", `${effect.type} ${field.name}`);
      input.addEventListener("change", () => {
        const value = field.kind === "color" ? input.value.trim() : Number(input.value);
        if (typeof value === "number" && !Number.isFinite(value)) return;
        if (value === field.value) return;
        setStack(effects.map((one, at) => (at === index ? { ...one, [field.name]: value } : one)));
      });
      return input;
    };
    if (fields.length === 1 && fields[0]) {
      row.append(editField(fields[0]));
    } else if (fields.length > 1) {
      const group = document.createElement("span");
      group.className = "effect-fields";
      for (const field of fields) {
        const wrapper = document.createElement("label");
        wrapper.className = "effect-field";
        const caption = document.createElement("span");
        caption.textContent = field.name;
        wrapper.append(caption, editField(field));
        group.append(wrapper);
      }
      row.append(group);
    }

    // Order is part of the meaning — a blur before a grain is not the same
    // picture as a grain before a blur — so the stack can be rearranged
    // without deleting and re-adding, which would lose the numbers.
    const swap = (with_: number): void => {
      const next = [...effects];
      const here = next[index];
      const there = next[with_];
      if (!here || !there) return;
      next[index] = there;
      next[with_] = here;
      setStack(next);
    };

    const up = document.createElement("button");
    up.type = "button";
    up.className = "small effect-up";
    up.innerHTML = '<i class="ph ph-arrow-up" aria-hidden="true"></i>';
    const upName = document.createElement("span");
    upName.className = "sr-only";
    up.dataset["effectAction"] = "effects.moveUp";
    up.dataset["effectType"] = effect.type;
    upName.textContent = translate("effects.moveUp", { effect: effect.type });
    up.title = upName.textContent;
    up.append(upName);
    up.disabled = guarded || index === 0;
    up.addEventListener("click", () => swap(index - 1));

    const down = document.createElement("button");
    down.type = "button";
    down.className = "small effect-down";
    down.innerHTML = '<i class="ph ph-arrow-down" aria-hidden="true"></i>';
    const downName = document.createElement("span");
    downName.className = "sr-only";
    down.dataset["effectAction"] = "effects.moveDown";
    down.dataset["effectType"] = effect.type;
    downName.textContent = translate("effects.moveDown", { effect: effect.type });
    down.title = downName.textContent;
    down.append(downName);
    down.disabled = guarded || index === effects.length - 1;
    down.addEventListener("click", () => swap(index + 1));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small effect-remove";
    remove.innerHTML = '<i class="ph ph-trash" aria-hidden="true"></i><span data-i18n="effects.remove" class="sr-only">Remove effect</span>';
    remove.disabled = guarded;
    remove.addEventListener("click", () =>
      setStack(effects.filter((_, at) => at !== index)),
    );
    row.append(up, down, remove);
    body.append(row);
  }

  const add = document.createElement("div");
  add.className = "effect-add-row";
  const chooser = document.createElement("select");
  chooser.className = "effect-chooser";
  chooser.setAttribute("aria-label", translate("effects.choose"));
    chooser.dataset["i18nAttr"] = "aria-label:effects.choose";
  chooser.disabled = guarded;
  for (const type of api.EFFECT_TYPES) {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type.replace(/([A-Z])/g, " $1").replace(/^./, (one) => one.toUpperCase());
    chooser.append(option);
  }
  const button = document.createElement("button");
  button.type = "button";
  button.className = "effect-add";
  button.innerHTML = '<i class="ph ph-plus" aria-hidden="true"></i><span data-i18n="effects.add">Add effect</span>';
  button.disabled = guarded;
  button.addEventListener("click", () => {
    setStack([...effects, api.newEffect(chooser.value)]);
  });
  add.append(chooser, button);
  body.append(add);
}

/**
 * The document's named styles: apply one, or save this layer's as a new one.
 *
 * Applying is one operation the engine resolves — the page never assembles the
 * properties itself. That is what makes a preset applied here identical to the
 * same preset applied from the command line or by an agent.
 */
function drawPresets(target: HTMLElement, layer: Layer, guarded: boolean): void {
  const body = dockSection(target, "Presets");

  if (state.presets.length === 0) {
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.dataset["i18n"] = "presets.none";
    hint.textContent = translate("presets.none");
    body.append(hint);
  }

  for (const preset of state.presets) {
    const row = document.createElement("div");
    row.className = "preset-row";
    const label = document.createElement("span");
    label.className = "effect-name";
    label.textContent = preset.name;
    if (preset.description) label.title = preset.description;
    row.append(label);

    const apply = document.createElement("button");
    apply.type = "button";
    apply.className = "small";
    apply.dataset["i18n"] = "common.apply";
    apply.textContent = translate("common.apply");
    apply.disabled = guarded;
    apply.addEventListener("click", () =>
      void send(`apply ${preset.name}`, {
        op: "applyPreset",
        id: layer.id,
        preset: preset.name,
      } as Operation),
    );
    row.append(apply);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small";
    remove.dataset["i18n"] = "common.delete";
    remove.textContent = translate("common.delete");
    remove.addEventListener("click", () =>
      void send(`delete ${preset.name}`, {
        op: "deletePreset",
        name: preset.name,
      } as Operation),
    );
    row.append(remove);
    body.append(row);
  }

  const save = document.createElement("div");
  save.className = "inspector-add-row";
  const button = document.createElement("button");
  button.type = "button";
  button.dataset["i18n"] = "presets.saveStyle";
    button.textContent = translate("presets.saveStyle");
  button.addEventListener("click", () => {
    requestName("presets.saveTitle", "presets.name", "presets.saveButton", (name) => {
      void send(`define ${name}`, {
        op: "definePreset",
        preset: { name, properties: api.styleOf(layer) },
      } as Operation);
    });
  });
  save.append(button);
  body.append(save);
}

/**
 * The document's named openings, and a way to offer the selected layer.
 *
 * Authoring a template is an ordinary operation here as everywhere else, so it
 * is journalled and undoable — and a slot aimed at protected chrome is refused
 * by the engine, in its own words, rather than by this form knowing the rule.
 */
function drawSlots(target: HTMLElement, layer: Layer): void {
  const body = dockSection(target, "Slots");

  for (const slot of state.slots) {
    const row = document.createElement("div");
    row.className = "slot-row";
    const label = document.createElement("span");
    label.className = "effect-name";
    label.textContent = `${slot.name}${slot.required ? " *" : ""}`;
    label.title = slot.description ?? `${slot.kind ?? "text"} → ${slot.layer}`;
    if (slot.layer === layer.id) label.classList.add("slot-on-this-layer");
    row.append(label);

    // A slot an agent can update (MCP `update_slot`) needs a home here too:
    // rename it, retype it, or repoint it, in the same one operation.
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "small slot-edit";
    edit.dataset["slot"] = slot.name;
    edit.dataset["i18n"] = "common.edit";
    edit.textContent = translate("common.edit");
    edit.title = translate("slots.editHint", { name: slot.name });
    edit.dataset["slotName"] = slot.name;
    edit.addEventListener("click", () => beginSlotEdit(row, slot));
    row.append(edit);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small";
    remove.dataset["i18n"] = "common.remove";
    remove.textContent = translate("common.remove");
    remove.addEventListener("click", () =>
      void send(`remove slot ${slot.name}`, {
        op: "removeSlot",
        name: slot.name,
      } as Operation),
    );
    row.append(remove);
    body.append(row);
  }

  const buttons = document.createElement("div");
  buttons.className = "inspector-add-row";
  const kind = document.createElement("select");
  for (const option of ["text", "image", "color"]) {
    const element = document.createElement("option");
    element.value = option;
    element.textContent = option;
    kind.append(element);
  }
  // A text layer cannot be an image slot and vice versa; the engine refuses
  // either way, but offering the wrong one is a form that invites a refusal.
  kind.value = layer.type === "image" ? "image" : "text";

  const offer = document.createElement("button");
  offer.type = "button";
  offer.dataset["i18n"] = "slots.offer";
    offer.textContent = translate("slots.offer");
  offer.addEventListener("click", () => {
    requestName("slots.createTitle", "slots.name", "slots.createButton", (name) => {
      void send(`offer ${name}`, {
        op: "defineSlot",
        slot: { name, layer: layer.id, kind: kind.value },
      } as Operation);
    });
  });
  buttons.append(kind, offer);
  body.append(buttons);
}

/**
 * Edits one slot in place: name, kind, and the layer it fills.
 *
 * The commit is the same single `updateSlot` operation the MCP tool sends, so
 * the journal holds one entry and one undo restores the slot. Escape or
 * Cancel redraws the panel and sends nothing.
 */
function beginSlotEdit(row: HTMLElement, slot: api.Slot): void {
  row.replaceChildren();
  const name = document.createElement("input");
  name.type = "text";
  name.className = "slot-edit-name";
  name.value = slot.name;
  name.setAttribute("aria-label", translate("slots.name"));
    name.dataset["i18nAttr"] = "aria-label:slots.name";
  const kind = document.createElement("select");
  kind.className = "slot-edit-kind";
  kind.setAttribute("aria-label", translate("slots.kind"));
    kind.dataset["i18nAttr"] = "aria-label:slots.kind";
  for (const option of ["text", "image", "color"]) {
    const element = document.createElement("option");
    element.value = option;
    element.textContent = option;
    kind.append(element);
  }
  kind.value = slot.kind ?? "text";
  const layerId = document.createElement("input");
  layerId.type = "text";
  layerId.className = "slot-edit-layer";
  layerId.value = slot.layer;
  layerId.setAttribute("aria-label", translate("slots.layerId"));
  layerId.dataset["i18nAttr"] = "aria-label:slots.layerId;title:slots.layerIdHint";
  layerId.title = translate("slots.layerIdHint");
  const save = document.createElement("button");
  save.type = "button";
  save.className = "small slot-edit-save";
  save.dataset["i18n"] = "common.save";
    save.textContent = translate("common.save");
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "small";
  cancel.dataset["i18n"] = "common.cancel";
    cancel.textContent = translate("common.cancel");
  const finish = (commit: boolean): void => {
    if (!commit) {
      drawInspector();
      return;
    }
    const nextName = name.value.trim();
    if (!nextName) return;
    void send(`update slot ${slot.name}`, {
      op: "updateSlot",
      name: slot.name,
      slot: {
        name: nextName,
        layer: layerId.value.trim() || slot.layer,
        kind: kind.value,
        description: slot.description,
        required: slot.required ?? false,
      },
    } as Operation);
  };
  save.addEventListener("click", () => finish(true));
  cancel.addEventListener("click", () => finish(false));
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish(true);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      finish(false);
    }
  });
  row.append(name, kind, layerId, save, cancel);
  name.focus();
}

/** Draws the journal when it is still the newest one requested. */
let historySequence = 0;
async function drawHistory(): Promise<void> {
  if (!state.project) return;
  const sequence = ++historySequence;
  const history = await api.getHistory(state.project);
  if (sequence !== historySequence) return;
  dom.history.replaceChildren();
  for (const entry of history.entries.slice().reverse()) {
    const item = document.createElement("li");
    item.textContent = `${entry.position}. ${entry.kind} — ${entry.actor.kind}${
      entry.actor.detail ? ` (${entry.actor.detail})` : ""
    }`;
    if (entry.position > history.position) item.classList.add("undone");
    dom.history.append(item);
  }
  dom.undo.disabled = history.position === 0;
  dom.redo.disabled = history.position >= history.head;
}

// --- editing -----------------------------------------------------------------

function moveTo(layer: Layer, x: number, y: number): Operation | null {
  // The engine moves by a delta; the inspector edits an absolute position.
  const dx = x - layer.transform.x;
  const dy = y - layer.transform.y;
  // Setting a value to the one it already has is not an edit. Sending it
  // anyway would journal an operation that moved nothing — and, because every
  // send refreshes the inspector, would loop.
  if (dx === 0 && dy === 0) return null;
  return { op: "move", id: layer.id, dx, dy } as Operation;
}

function resizeTo(layer: Layer, width: number, height: number): Operation | null {
  if (width === layer.transform.width && height === layer.transform.height) return null;
  return { op: "resize", id: layer.id, width, height } as Operation;
}

/**
 * Latest-wins coalescing key for one operation. Only an absolute setter may
 * coalesce: a newer "set this property to this value" says everything an
 * older undelivered one said, only more recently. A delta (a drag's move), a
 * create, a delete — anything where dropping an earlier intent would lose
 * information — gets `null` and always runs.
 */
function coalesceKeyOf(operation: api.OperationBatchCommand): string | null {
  if (!("id" in operation) || operation.op !== "update") return null;
  const id = (operation as { id?: unknown }).id;
  if (typeof id !== "string") return null;
  const properties = Object.keys(operation)
    .filter((key) => key !== "op" && key !== "id" && key !== "expectedVersion")
    .sort();
  return properties.length > 0 ? `update:${id}:${properties.join(",")}` : null;
}

/**
 * Applies an operation's geometry to the local document copy, so the page
 * reflects the edit at once. This is arithmetic on the same numbers the drag
 * preview already carries — not a second renderer; the authoritative pixels
 * still come from the engine, and the response reconciles whatever this
 * predicted. Returns `null` when the operation has no geometry to echo.
 */
function echoOperations(operations: api.OperationBatchCommand[]): boolean {
  if (!state.document) return false;
  let echoed = false;
  for (const entry of operations) {
    if (entry.op === "move" || entry.op === "resize" || entry.op === "rotate") {
      const layer = api
        .flatten(api.layersOf(state.document))
        .find(({ layer }) => layer.id === entry.id)?.layer;
      if (!layer) continue;
      if (entry.op === "move") {
        layer.transform.x += entry.dx;
        layer.transform.y += entry.dy;
      } else if (entry.op === "resize") {
        layer.transform.width = entry.width;
        layer.transform.height = entry.height;
      } else {
        layer.transform.rotation = entry.degrees;
      }
      echoed = true;
    }
  }
  if (echoed) {
    drawLayers();
    drawOverlay();
    drawInspector();
  }
  return echoed;
}

/**
 * A snapshot of the local document an echo changed, restorable when the
 * engine refuses the echo'd intent: the prediction is undone and the refusal
 * is shown, so the page never keeps a state the server never accepted.
 *
 * The snapshot is only safe while the document is still at the version it
 * was taken from. When an earlier queued action has already moved the
 * document on, restoring it would bring back an old version — and every edit
 * after it would be written against that version and refused. Then the page
 * reads the document again instead.
 */
function snapshotForEcho(): () => void {
  const project = state.project;
  const before = state.document ? structuredClone(state.document) : null;
  return () => {
    if (!before || state.project !== project) return;
    const current = state.document;
    if (current && api.versionOf(current) === api.versionOf(before)) {
      state.document = before;
      drawLayers();
      drawOverlay();
      drawInspector();
      return;
    }
    void guard("reload", refresh);
  };
}

/**
 * Sends one operation through the queue.
 *
 * `onRefusal` is where a control asks to be told about the engine's own
 * refusal, so a typed error can be shown beside the field that caused it. It
 * never replaces the status-bar report; it adds the control-side message.
 */
async function send(
  what: string,
  operation: Operation,
  onRefusal?: (error: unknown) => void,
): Promise<void> {
  if (!state.project || !state.document) return;
  // The project the edit belongs to is read here, at intent time: dispatch
  // may wait behind earlier actions, and by then the page may have opened a
  // different project. An edit is never re-targeted at the project that
  // happens to be open when it leaves.
  const project = state.project;
  const restore = snapshotForEcho();
  let applied = false;
  echoOperations([operation]);
  await queue.enqueue({
    label: what,
    coalesceKey: coalesceKeyOf(operation),
    run: async () => {
      if (state.project !== project || !state.document) {
        say(translate("status.editNotSent"), "error");
        return;
      }
      const result = await api.applyOperation(
        project,
        operation,
        api.versionOf(state.document),
      );
      applied = true;
      say(translate("status.editDone", { version: result.version }));
      if (result.created?.length) state.selection = result.created;
      await refresh();
    },
    onError: (error) => {
      // The engine accepted the change if `applied` is set: only the read
      // afterwards failed. Rolling the echo back would hide an accepted edit.
      if (!applied) restore();
      if (onRefusal) onRefusal(error);
      report(what, error);
    },
    onSuperseded: restore,
  });
}

/**
 * Runs the smallest available operation sequence for one interface action.
 * The stable operation API snaps one axis at a time, so canvas corners need
 * two journalled operations. They still pass through the same operation layer
 * and use each returned version as the next optimistic-lock token.
 */
async function sendSequence(what: string, operations: Operation[]): Promise<void> {
  await sendBatch(what, operations);
}

async function sendBatch(what: string, operations: api.OperationBatchCommand[]): Promise<void> {
  if (!state.project || !state.document || operations.length === 0) return;
  // A batch is a delta intent — one drag, one paste — so it never coalesces:
  // every pointerup is one journalled transaction, and the journal must match
  // the edits a fast human actually made. As with `send`, the project is read
  // at intent time so a queued edit is never re-targeted by a later open.
  const project = state.project;
  const restore = snapshotForEcho();
  let applied = false;
  echoOperations(operations);
  await queue.enqueue({
    label: what,
    coalesceKey: null,
    run: async () => {
      if (state.project !== project || !state.document) {
        say(translate("status.editNotSent"), "error");
        return;
      }
      const result = await api.applyOperationBatch(
        project,
        what,
        operations,
        api.versionOf(state.document),
      );
      applied = true;
      if (result.created?.length) state.selection = result.created;
      say(translate("status.editDone", { version: result.version }));
      await refresh();
    },
    onError: (error) => {
      if (!applied) restore();
      report(what, error);
    },
  });
}

function beginDrag(
  event: PointerEvent,
  selected: Array<{ layer: Layer; x: number; y: number; width: number; height: number }>,
  bounds: { x: number; y: number; width: number; height: number },
  mode: "move" | "resize" | "rotate",
  handle?: string,
): void {
  event.preventDefault();
  if (!state.document || dom.canvas.getBoundingClientRect().width === 0) return;
  state.drag = {
    ids: selected.map(({ layer }) => layer.id),
    mode,
    handle,
    startX: event.clientX,
    startY: event.clientY,
    bounds,
    origins: selected.map(({ layer, x, y, width, height }) => ({
      id: layer.id,
      x: layer.transform.x,
      y: layer.transform.y,
      absoluteX: x,
      absoluteY: y,
      width,
      height,
      rotation: layer.transform.rotation ?? 0,
    })),
    preserveSelectionScale:
      mode === "resize" && selected.length === 1 && selected[0]?.layer.type === "text",
  };
  mountDragPreview(state.drag);
  const cache = dragPreviewCache;
  if (!state.drag.previewActive && cache) {
    void cache.pending.then(() => {
      if (state.drag && dragPreviewCache === cache) mountDragPreview(state.drag);
    });
  }
  (event.target as Element).setPointerCapture?.(event.pointerId);
}

function dragPreviewKey(ids: readonly string[]): string | null {
  if (!state.project || !state.document) return null;
  return `${state.project}:${api.versionOf(state.document)}:${[...ids].sort().join(",")}`;
}

function clearDragPreviewCache(): void {
  unmountDragPreview();
  const cache = dragPreviewCache;
  dragPreviewCache = null;
  if (cache?.baseUrl) URL.revokeObjectURL(cache.baseUrl);
  if (cache?.selectionUrl) URL.revokeObjectURL(cache.selectionUrl);
}

async function prepareDragPreview(ids: readonly string[]): Promise<void> {
  const key = dragPreviewKey(ids);
  if (!key || !state.project || !state.document) return;
  if (dragPreviewCache?.key === key) return dragPreviewCache.pending;
  clearDragPreviewCache();

  const project = state.project;
  const version = api.versionOf(state.document);
  const scale = interactivePreviewScale();
  const cache: DragPreviewCache = {
    key,
    pending: Promise.resolve(),
  };
  dragPreviewCache = cache;
  cache.pending = Promise.all([
    api.imageObjectUrl(api.pngUrl(project, version, scale, { exclude: ids })),
    api.imageObjectUrl(api.pngUrl(project, version, scale, { only: ids })),
  ]).then(([baseUrl, selectionUrl]) => {
    if (dragPreviewCache !== cache) {
      URL.revokeObjectURL(baseUrl);
      URL.revokeObjectURL(selectionUrl);
      return;
    }
    cache.baseUrl = baseUrl;
    cache.selectionUrl = selectionUrl;
  }).catch(() => {
    // Moving the handles still works if an auxiliary preview is refused. The
    // normal committed render remains the source of truth either way.
    if (dragPreviewCache === cache) dragPreviewCache = null;
  });
  return cache.pending;
}

function mountDragPreview(drag: NonNullable<State["drag"]>): void {
  const cache = dragPreviewCache;
  if (
    drag.previewActive ||
    cache?.key !== dragPreviewKey(drag.ids) ||
    !cache.baseUrl ||
    !cache.selectionUrl
  ) return;
  const base = document.createElement("img");
  base.id = "drag-preview-base";
  base.className = "drag-preview-image";
  base.alt = "";
  base.src = cache.baseUrl;
  const selection = document.createElement("img");
  selection.id = "drag-preview-selection";
  selection.className = "drag-preview-image drag-preview-selection";
  selection.alt = "";
  selection.src = cache.selectionUrl;
  dom.overlay.before(base, selection);
  dom.canvasImage.classList.add("drag-preview-hidden");
  drag.previewActive = true;
  updateDragPreview(drag, drag.lastDelta?.x ?? 0, drag.lastDelta?.y ?? 0);
}

function unmountDragPreview(): void {
  document.getElementById("drag-preview-base")?.remove();
  document.getElementById("drag-preview-selection")?.remove();
  dom.canvasImage.classList.remove("drag-preview-hidden");
}

function dragResizedBounds(
  drag: NonNullable<State["drag"]>,
  dx: number,
  dy: number,
): { x: number; y: number; width: number; height: number } {
  const origin = drag.origins.length === 1 ? drag.origins[0] : null;
  return origin
    ? resizedRotatedBounds(
        drag.bounds,
        origin.rotation,
        drag.handle ?? "se",
        dx,
        dy,
      )
    : resizedBounds(drag.bounds, drag.handle ?? "se", dx, dy);
}

function updateDragPreview(
  drag: NonNullable<State["drag"]>,
  dx: number,
  dy: number,
): void {
  if (!state.document || !drag.previewActive) return;
  const selection = document.getElementById("drag-preview-selection") as HTMLImageElement | null;
  if (!selection) return;
  const canvas = state.document.canvas;
  selection.style.transformOrigin = "0 0";
  if (drag.mode === "move") {
    selection.style.transform =
      `translate(${(dx / canvas.width) * 100}%, ${(dy / canvas.height) * 100}%)`;
  } else if (drag.mode === "resize") {
    const next = dragResizedBounds(drag, dx, dy);
    if (drag.preserveSelectionScale) {
      // A text resize changes its wrapping rectangle, not its glyph geometry.
      // Keep the cached Rust-rendered text at 1:1 scale while the handles move;
      // pointer-up requests the exact newly wrapped renderer image.
      const centreDx = next.x + next.width / 2 - (drag.bounds.x + drag.bounds.width / 2);
      const centreDy = next.y + next.height / 2 - (drag.bounds.y + drag.bounds.height / 2);
      selection.style.transform =
        `translate(${(centreDx / canvas.width) * 100}%, ${(centreDy / canvas.height) * 100}%)`;
      return;
    }
    const scaleX = next.width / Math.max(1, drag.bounds.width);
    const scaleY = next.height / Math.max(1, drag.bounds.height);
    if (drag.origins.length === 1) {
      const rotation = drag.origins[0]?.rotation ?? 0;
      const centreDx = next.x + next.width / 2 - (drag.bounds.x + drag.bounds.width / 2);
      const centreDy = next.y + next.height / 2 - (drag.bounds.y + drag.bounds.height / 2);
      selection.style.transformOrigin =
        `${((drag.bounds.x + drag.bounds.width / 2) / canvas.width) * 100}% ` +
        `${((drag.bounds.y + drag.bounds.height / 2) / canvas.height) * 100}%`;
      selection.style.transform =
        `translate(${(centreDx / canvas.width) * 100}%, ${(centreDy / canvas.height) * 100}%) ` +
        `rotate(${rotation}deg) scale(${scaleX}, ${scaleY}) rotate(${-rotation}deg)`;
      return;
    }
    const translateX = next.x - drag.bounds.x * scaleX;
    const translateY = next.y - drag.bounds.y * scaleY;
    selection.style.transform =
      `translate(${(translateX / canvas.width) * 100}%, ${(translateY / canvas.height) * 100}%) ` +
      `scale(${scaleX}, ${scaleY})`;
  } else {
    const rect = dom.canvas.getBoundingClientRect();
    const centreX = rect.left + ((drag.bounds.x + drag.bounds.width / 2) / canvas.width) * rect.width;
    const centreY = rect.top + ((drag.bounds.y + drag.bounds.height / 2) / canvas.height) * rect.height;
    const start = Math.atan2(drag.startY - centreY, drag.startX - centreX);
    const current = Math.atan2(drag.startY + dy / dragScale() - centreY, drag.startX + dx / dragScale() - centreX);
    selection.style.transformOrigin =
      `${((drag.bounds.x + drag.bounds.width / 2) / canvas.width) * 100}% ` +
      `${((drag.bounds.y + drag.bounds.height / 2) / canvas.height) * 100}%`;
    selection.style.transform = `rotate(${((current - start) * 180) / Math.PI}deg)`;
  }
}

function dragScale(): number {
  const rect = dom.canvas.getBoundingClientRect();
  if (!state.document || rect.width === 0) return 1;
  // Screen pixels to document units: the canvas is scaled to fit.
  return state.document.canvas.width / rect.width;
}

window.addEventListener("pointermove", (event) => {
  const drag = state.drag;
  if (!drag || !state.document) return;
  const scale = dragScale();
  let dx = (event.clientX - drag.startX) * scale;
  let dy = (event.clientY - drag.startY) * scale;
  dom.overlay.querySelectorAll(".smart-guide").forEach((guide) => guide.remove());
  if (drag.mode === "move") {
    ({ dx, dy } = snapMove(dx, dy, drag.bounds, drag.ids, scale));
  }
  drag.lastDelta = { x: dx, y: dy };
  updateDragPreview(drag, dx, dy);

  const box = dom.overlay.querySelector<HTMLElement>(".handle-box");
  if (!box) return;
  const { width, height } = state.document.canvas;
  if (drag.mode === "move") {
    box.style.left = `${((drag.bounds.x + dx) / width) * 100}%`;
    box.style.top = `${((drag.bounds.y + dy) / height) * 100}%`;
  } else if (drag.mode === "resize") {
    const next = dragResizedBounds(drag, dx, dy);
    box.style.left = `${(next.x / width) * 100}%`;
    box.style.top = `${(next.y / height) * 100}%`;
    box.style.width = `${(next.width / width) * 100}%`;
    box.style.height = `${(next.height / height) * 100}%`;
  } else {
    const canvasRect = dom.canvas.getBoundingClientRect();
    const centreX = canvasRect.left + ((drag.bounds.x + drag.bounds.width / 2) / state.document.canvas.width) * canvasRect.width;
    const centreY = canvasRect.top + ((drag.bounds.y + drag.bounds.height / 2) / state.document.canvas.height) * canvasRect.height;
    const start = Math.atan2(drag.startY - centreY, drag.startX - centreX);
    const current = Math.atan2(event.clientY - centreY, event.clientX - centreX);
    const baseRotation = drag.origins.length === 1 ? (drag.origins[0]?.rotation ?? 0) : 0;
    box.style.transform = `rotate(${baseRotation + ((current - start) * 180) / Math.PI}deg)`;
  }
});

window.addEventListener("pointerup", async (event) => {
  const drag = state.drag;
  state.drag = null;
  if (!drag) return;
  const scale = dragScale();
  const dx = Math.round(drag.lastDelta?.x ?? (event.clientX - drag.startX) * scale);
  const dy = Math.round(drag.lastDelta?.y ?? (event.clientY - drag.startY) * scale);
  if (dx === 0 && dy === 0) {
    unmountDragPreview();
    return;
  }
  let saving: Promise<void>;
  if (drag.mode === "move") {
    saving = sendBatch("move selection", drag.ids.map((id) => ({ op: "move", id, dx, dy } as Operation)));
  } else if (drag.mode === "resize") {
    let next = dragResizedBounds(drag, dx, dy);
    const horizontalTextResize =
      drag.ids.length === 1 && (drag.handle === "e" || drag.handle === "w");
    if (horizontalTextResize && state.project && state.document) {
      const layer = api
        .flatten(api.layersOf(state.document))
        .find(({ layer }) => layer.id === drag.ids[0])?.layer;
      if (layer?.type === "text") {
        try {
          const layout = await api.textLayout(state.project, layer.id, next.width);
          const height = Math.max(1, Math.ceil(layout.height));
          // Horizontal text resizing changes wrapping height around the box's
          // local centre, rather than making a rotated box jump vertically.
          next = {
            ...next,
            y: next.y + (next.height - height) / 2,
            height,
          };
        } catch {
          // A read-only measurement failure must not swallow the resize. The
          // renderer will still wrap to the new width; only auto-height falls
          // back to the layer's existing value.
        }
      }
    }
    const operations: Operation[] = [];
    for (const origin of drag.origins) {
      const resized = drag.origins.length === 1
        ? next
        : resizeItemInSelection(
            {
              x: origin.absoluteX,
              y: origin.absoluteY,
              width: origin.width,
              height: origin.height,
            },
            drag.bounds,
            next,
          );
      const moveX = Math.round(resized.x - origin.absoluteX);
      const moveY = Math.round(resized.y - origin.absoluteY);
      if (moveX !== 0 || moveY !== 0) {
        operations.push({ op: "move", id: origin.id, dx: moveX, dy: moveY } as Operation);
      }
      operations.push({
        op: "resize",
        id: origin.id,
        width: Math.max(1, Math.round(resized.width)),
        height: Math.max(1, Math.round(resized.height)),
      } as Operation);
    }
    saving = sendBatch("resize selection", operations);
  } else {
    const canvasRect = dom.canvas.getBoundingClientRect();
    const centreX = canvasRect.left + ((drag.bounds.x + drag.bounds.width / 2) / state.document!.canvas.width) * canvasRect.width;
    const centreY = canvasRect.top + ((drag.bounds.y + drag.bounds.height / 2) / state.document!.canvas.height) * canvasRect.height;
    const start = Math.atan2(drag.startY - centreY, drag.startX - centreX);
    const current = Math.atan2(event.clientY - centreY, event.clientX - centreX);
    const delta = ((current - start) * 180) / Math.PI;
    saving = sendBatch(
      "rotate selection",
      drag.origins.map((origin) => ({
        op: "rotate",
        id: origin.id,
        degrees: Math.round((origin.rotation + delta) * 10) / 10,
      } as Operation)),
    );
  }
  void saving.finally(() => unmountDragPreview());
});

function snapMove(
  dx: number,
  dy: number,
  bounds: { x: number; y: number; width: number; height: number },
  ids: string[],
  screenScale: number,
): { dx: number; dy: number } {
  if (!state.document) return { dx, dy };
  const threshold = 6 * screenScale;
  // A single selection's handle DOM is its local box plus CSS rotation. Use
  // its actual canvas extents for snapping while leaving that DOM geometry
  // untouched. Multi-selection bounds already contain rotated extents.
  let snappingBounds = bounds;
  if (ids.length === 1) {
    const one = api.flatten(api.layersOf(state.document)).find(({ layer }) => layer.id === ids[0]);
    const offset = one ? ancestorOffset(api.flatten(api.layersOf(state.document)), one.parent) : null;
    if (one && offset) {
      snappingBounds = rotatedRectBounds({
        x: one.layer.transform.x + offset.x,
        y: one.layer.transform.y + offset.y,
        width: one.layer.transform.width,
        height: one.layer.transform.height,
        rotation: one.layer.transform.rotation ?? 0,
      });
    }
  }
  const movingX = [
    snappingBounds.x + dx,
    snappingBounds.x + snappingBounds.width / 2 + dx,
    snappingBounds.x + snappingBounds.width + dx,
  ];
  const movingY = [
    snappingBounds.y + dy,
    snappingBounds.y + snappingBounds.height / 2 + dy,
    snappingBounds.y + snappingBounds.height + dy,
  ];
  const targetsX = [0, state.document.canvas.width / 2, state.document.canvas.width];
  const targetsY = [0, state.document.canvas.height / 2, state.document.canvas.height];
  const otherBounds: Array<{ left: number; right: number; top: number; bottom: number }> = [];
  const flat = api.flatten(api.layersOf(state.document));
  for (const { layer, parent } of flat) {
    if (ids.includes(layer.id)) continue;
    const offset = ancestorOffset(flat, parent);
    if (!offset) continue;
    const visual = rotatedRectBounds({
      x: layer.transform.x + offset.x,
      y: layer.transform.y + offset.y,
      width: layer.transform.width,
      height: layer.transform.height,
      rotation: layer.transform.rotation ?? 0,
    });
    otherBounds.push({
      left: visual.x,
      right: visual.x + visual.width,
      top: visual.y,
      bottom: visual.y + visual.height,
    });
    targetsX.push(visual.x, visual.x + visual.width / 2, visual.x + visual.width);
    targetsY.push(visual.y, visual.y + visual.height / 2, visual.y + visual.height);
  }
  const snapAxis = (moving: number[], targets: number[]): { delta: number; target: number } | null => {
    let best: { delta: number; target: number } | null = null;
    for (const movingValue of moving) for (const target of targets) {
      const delta = target - movingValue;
      if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) best = { delta, target };
    }
    return best;
  };
  const horizontal = snapAxis(movingX, targetsX);
  const vertical = snapAxis(movingY, targetsY);
  if (horizontal) {
    dx += horizontal.delta;
    addSmartGuide("vertical", horizontal.target);
  }
  if (vertical) {
    dy += vertical.delta;
    addSmartGuide("horizontal", vertical.target);
  }


  // Equal-spacing snap: when the moving bounds sit between two neighbours,
  // offer the point that gives both gaps the same size. The same normal move
  // operation commits it, so the renderer and history still own the result.
  const movedLeft = snappingBounds.x + dx;
  const movedRight = movedLeft + snappingBounds.width;
  const left = otherBounds
    .filter((one) => one.right <= movedLeft + threshold)
    .sort((a, b) => b.right - a.right)[0];
  const right = otherBounds
    .filter((one) => one.left >= movedRight - threshold)
    .sort((a, b) => a.left - b.left)[0];
  if (left && right) {
    const equalLeft = left.right + (right.left - left.right - snappingBounds.width) / 2;
    const correction = equalLeft - movedLeft;
    if (Math.abs(correction) <= threshold) {
      dx += correction;
      addSmartGuide("vertical", left.right);
      addSmartGuide("vertical", right.left);
    }
  }

  const movedTop = snappingBounds.y + dy;
  const movedBottom = movedTop + snappingBounds.height;
  const above = otherBounds
    .filter((one) => one.bottom <= movedTop + threshold)
    .sort((a, b) => b.bottom - a.bottom)[0];
  const below = otherBounds
    .filter((one) => one.top >= movedBottom - threshold)
    .sort((a, b) => a.top - b.top)[0];
  if (above && below) {
    const equalTop = above.bottom + (below.top - above.bottom - snappingBounds.height) / 2;
    const correction = equalTop - movedTop;
    if (Math.abs(correction) <= threshold) {
      dy += correction;
      addSmartGuide("horizontal", above.bottom);
      addSmartGuide("horizontal", below.top);
    }
  }
  return { dx, dy };
}

function addSmartGuide(axis: "horizontal" | "vertical", position: number): void {
  if (!state.document) return;
  const guide = document.createElement("div");
  guide.className = `smart-guide ${axis}`;
  if (axis === "vertical") guide.style.left = `${(position / state.document.canvas.width) * 100}%`;
  else guide.style.top = `${(position / state.document.canvas.height) * 100}%`;
  dom.overlay.append(guide);
}

function selectionGeometry(): Array<{
  layer: Layer;
  x: number;
  y: number;
  width: number;
  height: number;
}> {
  if (!state.document) return [];
  const flat = api.flatten(api.layersOf(state.document));
  return flat.flatMap(({ layer, parent }) => {
    if (!state.selection.includes(layer.id)) return [];
    const offset = ancestorOffset(flat, parent);
    return offset
      ? [{
          layer,
          x: layer.transform.x + offset.x,
          y: layer.transform.y + offset.y,
          width: layer.transform.width,
          height: layer.transform.height,
        }]
      : [];
  });
}

function collectiveBounds(geometry = selectionGeometry()): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  if (geometry.length === 0) return null;
  if (geometry.length === 1) {
    const one = geometry[0]!;
    return { x: one.x, y: one.y, width: one.width, height: one.height };
  }
  return selectionBounds(geometry.map((one) => ({
    x: one.x,
    y: one.y,
    width: one.width,
    height: one.height,
    rotation: one.layer.transform.rotation ?? 0,
  })));
}

/** Visible bounds for canvas alignment, including a single layer's rotation. */
function visualCollectiveBounds(geometry = selectionGeometry()): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  if (geometry.length === 0) return null;
  return selectionBounds(geometry.map((one) => ({
    x: one.x,
    y: one.y,
    width: one.width,
    height: one.height,
    rotation: one.layer.transform.rotation ?? 0,
  })));
}

function applyZoom(): void {
  if (!state.document) return;
  const availableWidth = Math.max(240, dom.stageViewport.clientWidth - STAGE_INSET_PX);
  const availableHeight = Math.max(180, dom.stageViewport.clientHeight - STAGE_INSET_PX);
  const fit = Math.min(
    availableWidth / state.document.canvas.width,
    availableHeight / state.document.canvas.height,
    1,
  );
  const scale = state.zoom ?? fit;
  dom.canvas.style.width = `${Math.max(1, Math.round(state.document.canvas.width * scale))}px`;
  dom.canvas.style.height = `${Math.max(1, Math.round(state.document.canvas.height * scale))}px`;
  dom.zoomValue.textContent = state.zoom === null
    ? translate("canvas.zoomFit")
    : `${formatNumber(Math.round(scale * 100))}%`;
  dom.zoomValue.title = state.zoom === null
    ? translate("canvas.zoomFitPercent", { percent: formatNumber(Math.round(fit * 100)) })
    : translate("canvas.zoomResetFit");
}

function setZoom(next: number | null): void {
  state.zoom = next === null ? null : Math.min(4, Math.max(0.1, next));
  applyZoom();
}

function beginInlineTextEdit(layer: Extract<Layer, { type: "text" }>): void {
  if (!state.document || !api.isEditable(layer)) return;
  dom.overlay.querySelector(".inline-text-editor")?.remove();
  const flat = api.flatten(api.layersOf(state.document));
  const found = flat.find(({ layer: one }) => one.id === layer.id);
  const offset = ancestorOffset(flat, found?.parent ?? null);
  if (!offset) return;
  const textarea = document.createElement("textarea");
  textarea.className = "inline-text-editor";
  textarea.value = layer.text;
  textarea.setAttribute("aria-label", translate("canvas.editText"));
    textarea.dataset["i18nAttr"] = "aria-label:canvas.editText";
  textarea.style.left = `${((layer.transform.x + offset.x) / state.document.canvas.width) * 100}%`;
  textarea.style.top = `${((layer.transform.y + offset.y) / state.document.canvas.height) * 100}%`;
  textarea.style.width = `${(layer.transform.width / state.document.canvas.width) * 100}%`;
  textarea.style.height = `${(layer.transform.height / state.document.canvas.height) * 100}%`;
  textarea.style.transformOrigin = "center";
  textarea.style.transform = `rotate(${layer.transform.rotation ?? 0}deg)`;
  textarea.style.fontFamily = layer.fontFamily;
  textarea.style.fontSize = `${Math.max(12, layer.fontSize * (dom.canvas.getBoundingClientRect().width / state.document.canvas.width))}px`;
  textarea.style.lineHeight = String(layer.lineHeight ?? 1.2);
  textarea.style.textAlign = layer.align ?? "left";
  textarea.style.color = layer.color ?? "#000000";
  dom.overlay.append(textarea);
  state.editingText = { id: layer.id, original: layer.text };
  textarea.focus();
  textarea.select();
  let finished = false;
  const finish = (commit: boolean): void => {
    if (finished) return;
    finished = true;
    const next = textarea.value;
    textarea.remove();
    state.editingText = null;
    if (commit && next !== layer.text) {
      void send("edit text", { op: "update", id: layer.id, text: next } as Operation);
    } else {
      drawOverlay();
    }
  };
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      finish(false);
    } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      finish(true);
    }
  });
  textarea.addEventListener("blur", () => finish(true));
}

function renderPositionFields(layers: Layer[]): void {
  dom.positionFields.replaceChildren();
  const geometry = selectionGeometry();
  const bounds = collectiveBounds(geometry);
  if (!bounds || layers.length === 0) return;
  const values: Array<[string, number, "x" | "y" | "width" | "height" | "rotation"]> = [
    ["X", bounds.x, "x"],
    ["Y", bounds.y, "y"],
    ["W", bounds.width, "width"],
    ["H", bounds.height, "height"],
    ["°", layers.length === 1 ? (layers[0]?.transform.rotation ?? 0) : 0, "rotation"],
  ];
  for (const [label, value, property] of values) {
    const wrapper = document.createElement("label");
    wrapper.append(document.createTextNode(label));
    const input = document.createElement("input");
    input.type = "number";
    input.value = String(Math.round(value * 10) / 10);
    input.disabled = layers.some((layer) => !api.isEditable(layer)) || (property === "rotation" && layers.length > 1);
    input.addEventListener("change", async () => {
      const next = Number(input.value);
      if (!Number.isFinite(next)) return;
      if (property === "x" || property === "y") {
        const dx = property === "x" ? next - bounds.x : 0;
        const dy = property === "y" ? next - bounds.y : 0;
        void sendBatch("position selection", layers.map((layer) => ({ op: "move", id: layer.id, dx, dy } as Operation)));
      } else if (property === "rotation" && layers[0]) {
        void send("rotate layer", { op: "rotate", id: layers[0].id, degrees: next } as Operation);
      } else {
        if (
          property === "width" &&
          layers.length === 1 &&
          layers[0]?.type === "text" &&
          state.project
        ) {
          try {
            const layout = await api.textLayout(state.project, layers[0].id, next);
            void sendBatch("resize text box", [{
              op: "resize",
              id: layers[0].id,
              width: Math.max(1, next),
              height: Math.max(1, Math.ceil(layout.height)),
            } as Operation]);
            return;
          } catch {
            // Fall through to the ordinary resize if measurement is refused.
          }
        }
        const resizedSelection = {
          ...bounds,
          width: property === "width" ? Math.max(1, next) : bounds.width,
          height: property === "height" ? Math.max(1, next) : bounds.height,
        };
        const operations: Operation[] = [];
        for (const one of geometry) {
          const resized = geometry.length === 1
            ? {
                x: one.x,
                y: one.y,
                width: property === "width" ? resizedSelection.width : one.width,
                height: property === "height" ? resizedSelection.height : one.height,
              }
            : resizeItemInSelection(one, bounds, resizedSelection);
          const dx = resized.x - one.x;
          const dy = resized.y - one.y;
          if (dx || dy) operations.push({ op: "move", id: one.layer.id, dx, dy } as Operation);
          operations.push({
            op: "resize",
            id: one.layer.id,
            width: resized.width,
            height: resized.height,
          } as Operation);
        }
        void sendBatch("resize selection", operations);
      }
    });
    wrapper.append(input);
    dom.positionFields.append(wrapper);
  }
}

function togglePositionPopover(force?: boolean): void {
  const open = force ?? dom.positionPopover.hidden;
  dom.positionPopover.hidden = !open;
  if (!open) return;
  renderPositionFields(selectedLayers());
  // Spacing exception: these are placement numbers, measured from the trigger
  // and the dock edge — not gaps from the spacing scale.
  const trigger = dom.inspector.querySelector<HTMLElement>(".position-button");
  const rect = trigger?.getBoundingClientRect();
  const editorLeft = dom.inspector.getBoundingClientRect().left + 8;
  const dockLeft = dom.structure.getBoundingClientRect().left;
  const desiredLeft = (rect?.right ?? editorLeft + 320) - 320;
  dom.positionPopover.style.left = `${Math.max(editorLeft, Math.min(dockLeft - 332, desiredLeft))}px`;
  dom.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (rect?.bottom ?? 100) + 8)}px`;
  dom.positionPopover.querySelector<HTMLElement>("[data-canvas-anchor]")?.focus();
}

const clipboardKey = "assemblash-layer-clipboard-v1";

function copySelection(): boolean {
  if (!state.project || !state.document || state.selection.length === 0) return false;
  const flat = api.flatten(api.layersOf(state.document));
  const selected = new Set(state.selection);
  const roots = flat
    .filter(({ layer, parent }) => selected.has(layer.id) && (!parent || !selected.has(parent)))
    .map(({ layer }) => structuredClone(layer));
  sessionStorage.setItem(clipboardKey, JSON.stringify({ project: state.project, layers: roots }));
  say(formatCount("editor.copiedLayers", roots.length));
  return roots.length > 0;
}

function clipboardLayers(): Layer[] | null {
  if (!state.project) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(clipboardKey) ?? "null") as {
      project?: string;
      layers?: Layer[];
    } | null;
    return value?.project === state.project && Array.isArray(value.layers) ? value.layers : null;
  } catch {
    return null;
  }
}

function pasteClipboard(): void {
  const layers = clipboardLayers();
  if (!layers || !state.project) {
    say(translate("editor.nothingToPaste"), "error");
    return;
  }
  void sendBatch("paste layers", [{
    op: "insertLayerTree",
    sourceProject: state.project,
    layers,
    position: { at: "root" },
    offsetX: 20,
    offsetY: 20,
  }]);
}

function deleteSelection(label = "delete selection"): void {
  const layers = selectedLayers();
  if (layers.length === 0 || layers.some((layer) => !api.isEditable(layer))) return;
  void sendBatch(label, layers.map((layer) => ({ op: "delete", id: layer.id } as Operation)));
}

function moveLayerOrder(where: "front" | "forward" | "backward" | "back"): void {
  if (!state.document || state.selection.length !== 1) return;
  const id = state.selection[0];
  const flat = api.flatten(api.layersOf(state.document));
  const found = flat.find(({ layer }) => layer.id === id);
  if (!found || !api.isEditable(found.layer)) return;
  const parentLayer = found.parent ? flat.find(({ layer }) => layer.id === found.parent)?.layer : null;
  const siblings = parentLayer?.type === "group" ? parentLayer.children ?? [] : api.layersOf(state.document);
  const index = siblings.findIndex((layer) => layer.id === id);
  let target = index;
  if (where === "front") target = siblings.length - 1;
  if (where === "forward") target = Math.min(siblings.length - 1, index + 1);
  if (where === "backward") target = Math.max(0, index - 1);
  if (where === "back") target = 0;
  if (target === index) return;
  const to = found.parent
    ? { at: "in" as const, parent: found.parent, index: target }
    : { at: "root" as const, index: target };
  void send(`send ${where}`, { op: "reorder", id, to } as Operation);
}

function openContextMenu(x: number, y: number): void {
  dom.contextMenu.replaceChildren();
  const layers = selectedLayers();
  const editable = layers.length > 0 && layers.every(api.isEditable);
  const one = layers.length === 1 ? layers[0] : null;
  const add = (labelKey: MessageKey, icon: string, run: () => void, disabled = false): void => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.disabled = disabled;
    const symbol = document.createElement("i");
    symbol.className = `ph ${icon}`;
    symbol.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    text.dataset["i18n"] = labelKey;
    text.textContent = translate(labelKey);
    button.append(symbol, text);
    button.addEventListener("click", () => {
      dom.contextMenu.hidden = true;
      run();
    });
    dom.contextMenu.append(button);
  };
  const divider = (): void => {
    const rule = document.createElement("hr");
    rule.setAttribute("role", "separator");
    dom.contextMenu.append(rule);
  };
  if (one?.type === "text") {
    add("context.editText", "ph-pencil-simple", () => beginInlineTextEdit(one), !editable);
    divider();
  }
  add("context.cut", "ph-scissors", () => { if (copySelection()) deleteSelection("cut layers"); }, !editable);
  add("context.copy", "ph-copy", () => { copySelection(); }, layers.length === 0);
  add("context.paste", "ph-clipboard-text", pasteClipboard, !clipboardLayers());
  add("context.duplicate", "ph-copy-simple", () => void sendBatch("duplicate", layers.map((layer) => ({ op: "duplicate", id: layer.id } as Operation))), !editable);
  add("context.delete", "ph-trash", deleteSelection, !editable);
  divider();
  add("context.bringFront", "ph-arrow-line-up", () => moveLayerOrder("front"), !one || !editable);
  add("context.bringForward", "ph-arrow-up", () => moveLayerOrder("forward"), !one || !editable);
  add("context.sendBackward", "ph-arrow-down", () => moveLayerOrder("backward"), !one || !editable);
  add("context.sendBack", "ph-arrow-line-down", () => moveLayerOrder("back"), !one || !editable);
  divider();
  add("context.group", "ph-stack", () => void send("group", { op: "group", ids: layers.map((layer) => layer.id) } as Operation), layers.length < 2 || !editable);
  add("context.ungroup", "ph-stack-minus", () => { if (one) void send("ungroup", { op: "ungroup", id: one.id } as Operation); }, one?.type !== "group" || !editable);
  add(one?.locked ? "context.unlock" : "context.lock", one?.locked ? "ph-lock-open" : "ph-lock", () => {
    if (one) void send(one.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: one.id, locked: !one.locked } as Operation);
  }, !one || Boolean(one.protected || one.readOnly));
  add(one?.visible === false ? "context.show" : "context.hide", one?.visible === false ? "ph-eye" : "ph-eye-slash", () => {
    if (one) void send(one.visible === false ? "show layer" : "hide layer", { op: "setVisible", id: one.id, visible: one.visible === false } as Operation);
  }, !one || !editable);
  add("context.rename", "ph-pencil-simple", () => {
    if (!one) return;
    showDock("layers");
    const row = dom.layers.querySelector<HTMLElement>(`[data-id="${CSS.escape(one.id)}"]`);
    const label = row?.querySelector<HTMLElement>(".name");
    if (label) beginLayerRename(one, label);
  }, !one || Boolean(one.protected || one.readOnly));
  divider();
  add("context.alignLeft", "ph-align-left-simple", () => alignFromContextMenu("left"), !editable);
  add("context.alignHorizontalCenters", "ph-align-center-horizontal", () => alignFromContextMenu("centerHorizontal"), !editable);
  add("context.alignRight", "ph-align-right-simple", () => alignFromContextMenu("right"), !editable);
  add("context.alignTop", "ph-align-top-simple", () => alignFromContextMenu("top"), !editable);
  add("context.alignVerticalMiddles", "ph-align-center-vertical", () => alignFromContextMenu("centerVertical"), !editable);
  add("context.alignBottom", "ph-align-bottom-simple", () => alignFromContextMenu("bottom"), !editable);
  add("context.distributeHorizontally", "ph-columns", () => void send("distribute horizontally", { op: "distribute", ids: layers.map((layer) => layer.id), axis: "horizontal" } as Operation), !editable || layers.length < 3);
  add("context.distributeVertically", "ph-rows", () => void send("distribute vertically", { op: "distribute", ids: layers.map((layer) => layer.id), axis: "vertical" } as Operation), !editable || layers.length < 3);
  dom.contextMenu.hidden = false;
  // Spacing exception: clamping a floating menu to the window edge is
  // placement, not spacing; 240 is roughly the menu's width plus a margin.
  dom.contextMenu.style.left = `${Math.min(window.innerWidth - 240, Math.max(8, x))}px`;
  dom.contextMenu.style.top = `${Math.min(window.innerHeight - dom.contextMenu.offsetHeight - 8, Math.max(8, y))}px`;
  dom.contextMenu.querySelector<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)')?.focus();
}

function alignFromContextMenu(
  edge: "left" | "centerHorizontal" | "right" | "top" | "centerVertical" | "bottom",
): void {
  if (!state.document) return;
  const layers = selectedLayers();
  const ids = layers.map((layer) => layer.id);
  if (layers.length !== 1) {
    void send("align selection", { op: "align", ids, edge } as Operation);
    return;
  }
  const bounds = visualCollectiveBounds(selectionGeometry());
  if (!bounds) return;
  let dx = 0;
  let dy = 0;
  if (edge === "left") dx = -bounds.x;
  if (edge === "centerHorizontal") dx = state.document.canvas.width / 2 - (bounds.x + bounds.width / 2);
  if (edge === "right") dx = state.document.canvas.width - (bounds.x + bounds.width);
  if (edge === "top") dy = -bounds.y;
  if (edge === "centerVertical") dy = state.document.canvas.height / 2 - (bounds.y + bounds.height / 2);
  if (edge === "bottom") dy = state.document.canvas.height - (bounds.y + bounds.height);
  if (dx !== 0 || dy !== 0) {
    void send("align layer to canvas", { op: "move", id: layers[0]!.id, dx, dy } as Operation);
  }
}

dom.contextMenu.addEventListener("keydown", (event) => {
  const items = [...dom.contextMenu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)')];
  if (items.length === 0) return;
  const current = items.indexOf(document.activeElement as HTMLButtonElement);
  let next = current;
  if (event.key === "ArrowDown") next = (current + 1 + items.length) % items.length;
  else if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = items.length - 1;
  else if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    dom.contextMenu.hidden = true;
    dom.canvas.focus();
    return;
  } else return;
  event.preventDefault();
  items[next]?.focus();
});

// --- wiring ------------------------------------------------------------------

let projectChoices: readonly api.ProjectSummary[] = [];
let projectMenuIndex = -1;

function projectChoice(value: string): api.ProjectSummary | null {
  const normalized = value.trim().toLocaleLowerCase();
  return projectChoices.find((project) => project.id.toLocaleLowerCase() === normalized ||
    (project.name ?? project.id).toLocaleLowerCase() === normalized) ?? null;
}

function projectRows(): HTMLButtonElement[] {
  return [...dom.projectOptions.querySelectorAll<HTMLButtonElement>("[data-project-id]")];
}

function setProjectMenuOpen(open: boolean): void {
  dom.projectOptions.hidden = !open;
  dom.search.setAttribute("aria-expanded", String(open));
  dom.projectPickerToggle.setAttribute("aria-expanded", String(open));
  if (!open) { projectMenuIndex = -1; dom.search.removeAttribute("aria-activedescendant"); }
}

function markProjectRow(index: number): void {
  const rows = projectRows();
  projectMenuIndex = Math.max(0, Math.min(index, rows.length - 1));
  rows.forEach((row, at) => row.classList.toggle("active", at === projectMenuIndex));
  const active = rows[projectMenuIndex];
  if (active) {
    dom.search.setAttribute("aria-activedescendant", active.id);
    active.scrollIntoView({ block: "nearest" });
  }
}

function openProjectChoice(projectId?: string): void {
  const project = projectId
    ? projectChoices.find((one) => one.id === projectId)
    : projectChoice(dom.search.value);
  if (!project) return;
  dom.search.value = "";
  dom.projects.value = project.id;
  setProjectMenuOpen(false);
  openFromQueue(project.id);
}

dom.projectPickerToggle.addEventListener("click", () => {
  const opening = dom.projectOptions.hidden;
  setProjectMenuOpen(opening);
  if (opening) dom.search.focus();
});
dom.search.addEventListener("focus", () => setProjectMenuOpen(true));
dom.projectOptions.addEventListener("click", (event) => {
  const row = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-project-id]");
  if (row?.dataset["projectId"]) openProjectChoice(row.dataset["projectId"]);
});
document.addEventListener("pointerdown", (event) => {
  if (!(event.target instanceof Node) || !dom.search.closest(".project-combobox")?.contains(event.target)) {
    setProjectMenuOpen(false);
  }
});

dom.projects.addEventListener("change", () => {
  const project = projectChoices.find((one) => one.id === dom.projects.value);
  if (project) dom.search.placeholder = project.name ?? project.id;
  openFromQueue(dom.projects.value || null);
});
/**
 * Opens a project as a queued action, not at the moment of the click.
 *
 * Actions already waiting belong to the project that was open when the person
 * asked for them — an undo, an added shape. Changing `state.project` at the
 * click would run them against the new project. In the queue, they run first,
 * on their own project, and the open follows them.
 */
function openFromQueue(project: string | null): void {
  void guard("open", async () => {
    state.project = project;
    state.selection = [];
    await openProject();
  });
}

/** Reads a newly opened project, and asks the template panel what it offers. */
async function openProject(): Promise<void> {
  try {
    await refresh();
  } catch (error) {
    const details = error instanceof api.ApiError
      ? error.details as { pid?: unknown } | null
      : null;
    const pid = details && typeof details.pid === "number" ? details.pid : null;
    if (
      !(error instanceof api.ApiError) ||
      error.code !== "projectLocked" ||
      pid === null ||
      !state.project
    ) {
      throw error;
    }

    const confirmed = window.confirm(translate("projects.recoverLockConfirm", { pid }));
    if (!confirmed) throw error;
    await api.recoverProjectLock(state.project, pid);
    await refresh();
    say(translate("projects.recovered"));
  }
  // After the document, because the panel's image fields are built from the
  // assets the document lists.
  await templates.projectChanged();
  dom.renameProject.disabled = !state.project;
  dom.deleteProject.disabled = !state.project;
  dom.reload.disabled = !state.project;
  say(translate("projects.opened", { name: state.document?.name ?? state.project ?? "" }));

  // The server drains a reclaimed lock the first time it is read after
  // clearing it, so one fetch here either finds nothing (the ordinary case)
  // or explains, once, why a lock nobody here took out is already gone. A
  // failure here is not a failure to open the project.
  if (state.project) {
    try {
      const summary = await api.projectSummary(state.project);
      if (summary.reclaimedLock) {
        const { pid, host } = summary.reclaimedLock;
        say(
          translate("projects.reclaimedLock", { pid, host }),
        );
      }
    } catch (error) {
      console.error("could not check for an automatically reclaimed lock", error);
    }
  }
}

dom.reload.addEventListener("click", () => void guard("reload", async () => {
  await refresh();
  say(translate("projects.refreshed"));
}));

// Searching re-asks the engine rather than filtering a list held here, so the
// page never has to hold a whole workspace to look through it.
let searchTimer = 0;
dom.search.addEventListener("input", () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    void guard("search", () => loadProjects());
  }, 150);
});
dom.search.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    if (dom.projectOptions.hidden) setProjectMenuOpen(true);
    const direction = event.key === "ArrowDown" ? 1 : -1;
    markProjectRow(projectMenuIndex < 0 ? (direction > 0 ? 0 : projectRows().length - 1) : projectMenuIndex + direction);
    return;
  }
  if (event.key === "Escape") {
    setProjectMenuOpen(false);
    return;
  }
  if (event.key !== "Enter") return;
  const highlighted = projectRows()[projectMenuIndex]?.dataset["projectId"];
  const project = projectChoice(dom.search.value);
  if (!project && !highlighted) return;
  event.preventDefault();
  openProjectChoice(project?.id ?? highlighted);
});

dom.newProject.addEventListener("click", () => {
  dom.newProjectName.value = "";
  dom.newProjectDialog.showModal();
  window.setTimeout(() => dom.newProjectName.focus(), 0);
});
dom.newProjectName.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  dom.newProjectForm.requestSubmit(dom.createProjectConfirm);
});

dom.emptyCreate.addEventListener("click", () => dom.newProject.click());
dom.agents.addEventListener("click", () => void agents.open());

dom.canvasPresets.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-size]");
  if (!button) return;
  const [width, height] = (button.dataset["size"] ?? "").split("x").map(Number);
  if (!width || !height) return;
  for (const one of dom.canvasPresets.querySelectorAll("button")) {
    one.classList.toggle("selected", one === button);
  }
  dom.newProjectWidth.value = String(width);
  dom.newProjectHeight.value = String(height);
});

dom.newProjectForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
  if (submitter?.value === "cancel") {
    dom.newProjectDialog.close("cancel");
    return;
  }
  if (!dom.newProjectForm.reportValidity()) return;
  const id = dom.newProjectName.value.trim();
  const width = Number(dom.newProjectWidth.value);
  const height = Number(dom.newProjectHeight.value);
  if (!id || !Number.isFinite(width) || !Number.isFinite(height)) return;

  void guard("create", async () => {
    await api.createProject(id, width, height, dom.newProjectBackground.value, id);
    dom.newProjectDialog.close();
    await loadProjects(id);
    say(translate("projects.created", { id }));
  });
});

const addSections = [
  ["add-text-section", "toolbar.textButton", dom.addText],
  ["add-shape-section", "toolbar.elementsButton", dom.addShape],
  ["add-upload-section", "toolbar.uploadsButton", dom.addImage],
  ["add-template-section", "toolbar.templatesButton", dom.templatesToggle],
  ["add-fonts-section", "toolbar.fontsButton", dom.selectTool],
] as const;

function activateEditorTool(active: HTMLButtonElement): void {
  for (const tool of [dom.selectTool, dom.addText, dom.addShape, dom.addImage, dom.templatesToggle]) {
    const selected = tool === active;
    tool.classList.toggle("active", selected);
    tool.setAttribute("aria-pressed", String(selected));
  }
}

function showAddSection(id = "add-text-section", active = dom.addText): void {
  if (id !== "add-fonts-section") fontsPanel.releaseSamples();
  dom.addPanel.classList.remove("collapsed");
  dom.structure.classList.remove("mobile-open");
  dom.dockToggle.setAttribute("aria-expanded", "false");
  dom.templatesPanel.classList.remove("open");
  const panelKey = addSections.find(([sectionId]) => sectionId === id)?.[1] ?? "toolbar.textButton";
  dom.addPanelTitle.dataset["i18n"] = panelKey;
  dom.addPanelTitle.textContent = translate(panelKey);
  for (const [sectionId] of addSections) {
    const section = document.getElementById(sectionId);
    if (section) section.hidden = sectionId !== id;
  }
  const templateMode = id === "add-template-section";
  dom.templatesPanel.classList.toggle("open", templateMode && !dom.templatesPanel.hidden);
  dom.openTemplates.hidden = templateMode && !dom.templatesPanel.hidden;
  dom.addPanel.scrollTop = 0;
  activateEditorTool(active);
}

function closeAddPanel(): void {
  fontsPanel.releaseSamples();
  dom.addPanel.classList.add("collapsed");
  activateEditorTool(dom.selectTool);
}

dom.addPanelClose.addEventListener("click", closeAddPanel);
dom.addText.addEventListener("click", () => showAddSection("add-text-section", dom.addText));
dom.addShape.addEventListener("click", () => showAddSection("add-shape-section", dom.addShape));
dom.addImage.addEventListener("click", () => showAddSection("add-upload-section", dom.addImage));
dom.templatesToggle.addEventListener("click", () => showAddSection("add-template-section", dom.templatesToggle));

/**
 * Shows the font manager, with the store as it is right now.
 *
 * `focusInstall` is for the one caller that arrives here because something
 * else could not be done: the button it needs is then the thing under the
 * keyboard, rather than a panel it has to go looking through.
 */
async function openFontManager(focusInstall = false): Promise<void> {
  showAddSection("add-fonts-section", dom.selectTool);
  await fontsPanel.reload();
  if (focusInstall) fontsPanel.focusInstall();
}

async function createTextPreset(preset: "plain" | "heading" | "subheading" | "body"): Promise<void> {
  const families = await api.fonts();
  const family = families[0];
  if (!family) {
    // Text needs a font, and this is a browser: sending somebody to a command
    // line for the one thing the page just refused to do is the defect, not
    // the fix. The panel that installs fonts opens instead, on the button,
    // where the full explanation of the install is written.
    say(translate("fonts.noneInstalled"), "error");
    await openFontManager(true);
    return;
  }
  if (!state.project || !state.document) return;
  const settings = {
    plain: { text: "Add text", fontSize: 24, width: 460, height: 80 },
    heading: { text: "Add a heading", fontSize: 64, width: 600, height: 100 },
    subheading: { text: "Add a subheading", fontSize: 36, width: 520, height: 64 },
    body: { text: "Add body text", fontSize: 22, width: 460, height: 120 },
  }[preset];
  const transform = {
    x: Math.round((state.document.canvas.width - settings.width) / 2),
    y: Math.round((state.document.canvas.height - settings.height) / 2),
    width: settings.width,
    height: settings.height,
  };
  const result = await api.applyOperation(
    state.project,
    {
      op: "create",
      position: { at: "root" },
      transform,
      type: "text",
      text: settings.text,
      fontFamily: family,
      fontSize: settings.fontSize,
      lineHeight: 1.15,
      color: "#101820",
    } as Operation,
    api.versionOf(state.document),
  );
  const created = result.created?.[0];
  if (created) state.selection = [created];
  const presetKey = { plain: "text.plain", heading: "text.heading", subheading: "text.subheading", body: "text.body" }[preset] as MessageKey;
  say(translate("editor.addedText", { preset: translate(presetKey) }));
  await refresh();
  const layer = selectedLayer();
  if (layer?.type === "text") beginInlineTextEdit(layer);
}

/**
 * Adds one primitive, in one operation.
 *
 * The box is picked exactly as the text presets pick theirs — a fixed size,
 * centred on the canvas — so a shape arrives where a person is already
 * looking. The line's box is 24 units tall although the segment it draws is
 * 2: the geometry runs across the box's middle and its height is layout only
 * (design §1), so a taller box costs the picture nothing and leaves the
 * selection handles far enough apart to grab.
 */
async function createShape(kind: "rect" | "ellipse" | "line"): Promise<void> {
  if (!state.project || !state.document) return;
  const settings = {
    rect: { width: 320, height: 240 },
    ellipse: { width: 320, height: 240 },
    line: { width: 400, height: 24 },
  }[kind];
  const transform = {
    x: Math.round((state.document.canvas.width - settings.width) / 2),
    y: Math.round((state.document.canvas.height - settings.height) / 2),
    width: settings.width,
    height: settings.height,
  };
  // A line has no interior, so it is given a stroke and no fill; a rect and
  // an ellipse are the other way round. Nothing here is a partial shape: the
  // one create carries the geometry and its paint together.
  const paint = kind === "line"
    ? { stroke: { color: SHAPE_STROKE_COLOUR, width: SHAPE_STROKE_WIDTH } }
    : { fill: SHAPE_FILL_COLOUR };
  const shape = kind === "rect" ? { kind: "rect", cornerRadius: 0 } : { kind };
  const result = await api.applyOperation(
    state.project,
    {
      op: "create",
      position: { at: "root" },
      transform,
      type: "shape",
      shape,
      ...paint,
    } as Operation,
    api.versionOf(state.document),
  );
  const created = result.created?.[0];
  if (created) state.selection = [created];
  const shapeKey = { rect: "shapes.rectangle", ellipse: "shapes.ellipse", line: "shapes.line" }[kind] as MessageKey;
  say(translate("editor.addedShape", { kind: translate(shapeKey) }));
  await refresh();
}

/**
 * Adds one path layer, in one create.
 *
 * The `d` is validated by the engine at operation time, so a refusal here is
 * the grammar's own message — which command, which byte — reported through
 * the queue, and nothing is created when it fires. The box is the same fixed,
 * centred box the primitives use: the path sits in its box, scaled by it.
 */
async function createPath(d: string): Promise<void> {
  if (!state.project || !state.document) return;
  const width = 320;
  const height = 240;
  const transform = {
    x: Math.round((state.document.canvas.width - width) / 2),
    y: Math.round((state.document.canvas.height - height) / 2),
    width,
    height,
  };
  const result = await api.applyOperation(
    state.project,
    {
      op: "create",
      position: { at: "root" },
      transform,
      type: "shape",
      shape: { kind: "path", d },
      fill: SHAPE_FILL_COLOUR,
    } as Operation,
    api.versionOf(state.document),
  );
  const created = result.created?.[0];
  if (created) state.selection = [created];
  say(translate("editor.addedPath"));
  await refresh();
}

dom.addPanel.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>("[data-text-preset]");
  const preset = button?.dataset["textPreset"] as "heading" | "subheading" | "body" | undefined;
  if (preset) void guard(`add ${preset}`, () => createTextPreset(preset));
  const shape = target.closest<HTMLButtonElement>("[data-shape]")?.dataset["shape"];
  if (shape === "rect" || shape === "ellipse" || shape === "line") {
    void guard(`add ${shape}`, () => createShape(shape));
  }
  // A path needs its `d` from the person, so a small form asks for it; the
  // engine validates it when the create is applied.
  if (shape === "path") {
    requestName("editor.addPathTitle", "editor.pathDataLabel", "editor.addPathButton", (d) => {
      void guard("add path", () => createPath(d));
    });
  }
});

dom.deleteLayer.addEventListener("click", () => deleteSelection());

dom.groupLayers.addEventListener("click", () => {
  if (state.selection.length < 2) return;
  void send("group", { op: "group", ids: [...state.selection] } as Operation);
});

dom.undo.addEventListener("click", () => {
  void guard("undo", async () => {
    if (!state.project) return;
    const result = await api.undo(state.project);
    say(translate("status.undoDone", { version: result.version }));
    await refresh();
  });
});

dom.redo.addEventListener("click", () => {
  void guard("redo", async () => {
    if (!state.project) return;
    const result = await api.redo(state.project);
    say(translate("status.redoDone", { version: result.version }));
    await refresh();
  });
});

dom.exportButton.addEventListener("click", () => exporter.open());

dom.uploadDropzone.addEventListener("click", () => dom.imageFile.click());

function addAssetFile(
  file: File,
  preferredType: "image" | "svg",
  point?: { x: number; y: number },
): void {
  if (!file) return;

  void guard(preferredType === "svg" ? "add vector" : "add image", async () => {
    if (!state.project || !state.document) return;
    // Two steps, because importing a file and adding a layer are different
    // things: the import copies bytes into the project and is not undoable,
    // and the layer that draws them is an ordinary operation that is.
    dom.uploadFeedback.textContent = translate("uploads.uploading", { name: file.name });
    try {
    const uploaded = await api.uploadAsset(state.project, file);
    const isSvg = uploaded.asset.mediaType === "image/svg+xml" || preferredType === "svg";
    // The importer recorded the file's own dimensions, so the layer arrives at
    // the picture's shape rather than at a fixed box that squashed it.
    const { width: layerWidth, height: layerHeight } = placedAssetSize(
      uploaded.asset,
      state.document.canvas,
    );
    const x = Math.round(point?.x ?? (state.document.canvas.width - layerWidth) / 2);
    const y = Math.round(point?.y ?? (state.document.canvas.height - layerHeight) / 2);
    const create = isSvg
      ? {
          op: "create",
          position: { at: "root" },
          transform: { x, y, width: layerWidth, height: layerHeight },
          type: "svg",
          asset: uploaded.asset.id,
        }
      : {
          op: "create",
          position: { at: "root" },
          transform: { x, y, width: layerWidth, height: layerHeight },
          type: "image",
          asset: uploaded.asset.id,
          fit: "contain",
        };
    const result = await api.applyOperation(
      state.project,
      create as Operation,
      uploaded.version,
    );
    if (result.created?.length) state.selection = result.created;
    say(translate("uploads.addedVersion", { name: file.name, version: result.version }));
    dom.uploadFeedback.textContent = translate("uploads.added", { name: file.name });
    await refresh();
    } catch (error) {
      dom.uploadFeedback.textContent = translate("uploads.failed", { name: file.name });
      throw error;
    }
  });
}

for (const type of ["dragenter", "dragover"] as const) {
  dom.uploadDropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dom.uploadDropzone.classList.add("drag-over");
  });
}
dom.uploadDropzone.addEventListener("dragleave", () => dom.uploadDropzone.classList.remove("drag-over"));
dom.uploadDropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dom.uploadDropzone.classList.remove("drag-over");
  const file = event.dataTransfer?.files[0];
  if (file) addAssetFile(file, file.type === "image/svg+xml" ? "svg" : "image");
});

for (const type of ["dragenter", "dragover"] as const) {
  dom.stageViewport.addEventListener(type, (event) => event.preventDefault());
}
dom.stageViewport.addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (!file || !state.document) return;
  const rect = dom.canvas.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
    addAssetFile(file, file.type === "image/svg+xml" ? "svg" : "image");
    return;
  }
  const point = {
    x: ((event.clientX - rect.left) / rect.width) * state.document.canvas.width - 150,
    y: ((event.clientY - rect.top) / rect.height) * state.document.canvas.height - 100,
  };
  addAssetFile(file, file.type === "image/svg+xml" ? "svg" : "image", point);
});

dom.imageFile.addEventListener("change", () => {
  const file = dom.imageFile.files?.[0];
  dom.imageFile.value = "";
  if (file) addAssetFile(file, file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg") ? "svg" : "image");
});

function showDock(view: "properties" | "layers" | "history"): void {
  dom.propertiesTab.setAttribute("aria-selected", String(view === "properties"));
  dom.layersTab.setAttribute("aria-selected", String(view === "layers"));
  dom.historyTab.setAttribute("aria-selected", String(view === "history"));
  dom.propertiesPanel.hidden = view !== "properties";
  dom.layersView.hidden = view !== "layers";
  dom.historyView.hidden = view !== "history";
}

dom.propertiesTab.addEventListener("click", () => showDock("properties"));
dom.layersTab.addEventListener("click", () => showDock("layers"));
dom.historyTab.addEventListener("click", () => showDock("history"));
dom.historyShortcut.addEventListener("click", () => showDock("history"));
dom.layerSearch.addEventListener("input", drawLayers);
dom.dockToggle.addEventListener("click", () => {
  const open = dom.structure.classList.toggle("mobile-open");
  dom.dockToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    closeAddPanel();
    dom.layersTab.focus();
  }
});
dom.selectTool.addEventListener("click", () => {
  if (!state.document) return;
  closeAddPanel();
  dom.templatesPanel.classList.remove("open");
  dom.structure.classList.remove("mobile-open");
  dom.dockToggle.setAttribute("aria-expanded", "false");
  dom.canvas.focus();
});

dom.positionClose.addEventListener("click", () => togglePositionPopover(false));
dom.positionPopover.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest(
    "[data-canvas-anchor], [data-layout]",
  ) as HTMLButtonElement | null;
  const anchor = button?.dataset["canvasAnchor"];
  if (anchor && !button.disabled && state.selection.length > 0 && state.document) {
    const geometry = selectionGeometry();
    const bounds = visualCollectiveBounds(geometry);
    if (!bounds) return;
    const anchors: Record<
      string,
      {
        horizontal: "left" | "center" | "right";
        vertical: "top" | "middle" | "bottom";
      }
    > = {
      "top-left": { horizontal: "left", vertical: "top" },
      "top-center": { horizontal: "center", vertical: "top" },
      "top-right": { horizontal: "right", vertical: "top" },
      "middle-left": { horizontal: "left", vertical: "middle" },
      center: { horizontal: "center", vertical: "middle" },
      "middle-right": { horizontal: "right", vertical: "middle" },
      "bottom-left": { horizontal: "left", vertical: "bottom" },
      "bottom-center": { horizontal: "center", vertical: "bottom" },
      "bottom-right": { horizontal: "right", vertical: "bottom" },
    };
    const target = anchors[anchor];
    if (!target) return;
    const operations: Operation[] = [];
    const targetX = target.horizontal === "left"
      ? 0
      : target.horizontal === "right"
        ? state.document.canvas.width - bounds.width
        : (state.document.canvas.width - bounds.width) / 2;
    const targetY = target.vertical === "top"
      ? 0
      : target.vertical === "bottom"
        ? state.document.canvas.height - bounds.height
        : (state.document.canvas.height - bounds.height) / 2;
    for (const layer of selectedLayers()) {
      operations.push({ op: "move", id: layer.id, dx: targetX - bounds.x, dy: targetY - bounds.y } as Operation);
    }
    togglePositionPopover(false);
    void sendSequence(`place layer ${button.title.toLowerCase()}`, operations);
    return;
  }
  const action = button?.dataset["layout"];
  if (!action || button.disabled || state.selection.length === 0) return;
  const ids = [...state.selection];
  let operation: Operation | null = null;
  switch (action) {
    case "center-horizontal":
      operation = { op: "centerOnCanvas", ids, axis: "horizontal" } as Operation;
      break;
    case "center-vertical":
      operation = { op: "centerOnCanvas", ids, axis: "vertical" } as Operation;
      break;
    case "align-left":
      operation = { op: "align", ids, edge: "left" } as Operation;
      break;
    case "align-center-horizontal":
      operation = { op: "align", ids, edge: "centerHorizontal" } as Operation;
      break;
    case "align-right":
      operation = { op: "align", ids, edge: "right" } as Operation;
      break;
    case "align-top":
      operation = { op: "align", ids, edge: "top" } as Operation;
      break;
    case "align-center-vertical":
      operation = { op: "align", ids, edge: "centerVertical" } as Operation;
      break;
    case "align-bottom":
      operation = { op: "align", ids, edge: "bottom" } as Operation;
      break;
    case "distribute-horizontal":
      operation = { op: "distribute", ids, axis: "horizontal" } as Operation;
      break;
    case "distribute-vertical":
      operation = { op: "distribute", ids, axis: "vertical" } as Operation;
      break;
  }
  if (operation) {
    togglePositionPopover(false);
    void send("arrange layers", operation);
  }
});

document.addEventListener("pointerdown", (event) => {
  const target = event.target as Node;
  if (!dom.positionPopover.hidden && !dom.positionPopover.contains(target) && !dom.inspector.contains(target)) {
    togglePositionPopover(false);
  }
  if (!dom.contextMenu.hidden && !dom.contextMenu.contains(target)) dom.contextMenu.hidden = true;
});

dom.openTemplates.addEventListener("click", () => {
  if (dom.templatesPanel.hidden) {
    say(translate("editor.noSlotsHint"));
    closeAddPanel();
    showDock("properties");
    if (window.matchMedia("(max-width: 1024px)").matches) {
      dom.structure.classList.add("mobile-open");
      dom.dockToggle.setAttribute("aria-expanded", "true");
    }
    return;
  }
  dom.templatesPanel.classList.add("open");
  dom.openTemplates.hidden = true;
  dom.templatesPanel.scrollIntoView({ block: "nearest" });
});

dom.templatesClose.addEventListener("click", () => {
  dom.templatesPanel.classList.remove("open");
  dom.openTemplates.hidden = false;
});

dom.zoomOut.addEventListener("click", () => setZoom((state.zoom ?? dragScale() ** -1) / 1.2));
dom.zoomIn.addEventListener("click", () => setZoom((state.zoom ?? dragScale() ** -1) * 1.2));
dom.zoomValue.addEventListener("click", () => setZoom(null));
dom.zoom100.addEventListener("click", () => setZoom(1));
dom.stageViewport.addEventListener("wheel", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();
  const current = state.zoom ?? dragScale() ** -1;
  setZoom(current * (event.deltaY > 0 ? 0.9 : 1.1));
}, { passive: false });
function syncResponsivePanels(): void {
  const compact = window.matchMedia("(max-width: 1024px)").matches;
  if (compact) {
    dom.structure.classList.remove("mobile-open");
    dom.dockToggle.setAttribute("aria-expanded", "false");
    fontsPanel.releaseSamples();
    dom.addPanel.classList.add("collapsed");
  } else {
    dom.structure.classList.remove("mobile-open");
    dom.dockToggle.setAttribute("aria-expanded", "true");
  }
}

window.addEventListener("resize", () => {
  if (state.zoom === null) applyZoom();
  syncResponsivePanels();
});
syncResponsivePanels();

let spacePressed = false;
window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spacePressed = false;
    dom.stageViewport.classList.remove("pan-ready");
  }
});
dom.stageViewport.addEventListener("pointerdown", (event) => {
  if (!spacePressed || event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  const start = { x: event.clientX, y: event.clientY };
  const scroll = { x: dom.stageViewport.scrollLeft, y: dom.stageViewport.scrollTop };
  dom.stageViewport.classList.add("panning");
  const move = (next: PointerEvent): void => {
    dom.stageViewport.scrollLeft = scroll.x - (next.clientX - start.x);
    dom.stageViewport.scrollTop = scroll.y - (next.clientY - start.y);
  };
  const finish = (): void => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", finish);
    dom.stageViewport.classList.remove("panning");
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", finish);
}, { capture: true });

dom.overlay.addEventListener("pointerdown", (event) => {
  if (spacePressed || event.target !== dom.overlay || event.button !== 0 || !state.document) return;
  event.preventDefault();
  const canvasRect = dom.canvas.getBoundingClientRect();
  const clampX = (value: number): number => Math.min(canvasRect.right, Math.max(canvasRect.left, value));
  const clampY = (value: number): number => Math.min(canvasRect.bottom, Math.max(canvasRect.top, value));
  const start = { x: clampX(event.clientX), y: clampY(event.clientY) };
  const marquee = document.createElement("div");
  marquee.className = "selection-marquee";
  dom.overlay.append(marquee);
  const move = (next: PointerEvent): void => {
    const x = clampX(next.clientX);
    const y = clampY(next.clientY);
    const left = Math.min(start.x, x);
    const top = Math.min(start.y, y);
    const right = Math.max(start.x, x);
    const bottom = Math.max(start.y, y);
    marquee.style.left = `${((left - canvasRect.left) / canvasRect.width) * 100}%`;
    marquee.style.top = `${((top - canvasRect.top) / canvasRect.height) * 100}%`;
    marquee.style.width = `${((right - left) / canvasRect.width) * 100}%`;
    marquee.style.height = `${((bottom - top) / canvasRect.height) * 100}%`;
  };
  const finish = (next: PointerEvent): void => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", finish);
    const x = clampX(next.clientX);
    const y = clampY(next.clientY);
    const selectionRect = {
      left: Math.min(start.x, x),
      top: Math.min(start.y, y),
      right: Math.max(start.x, x),
      bottom: Math.max(start.y, y),
    };
    const hits = [...dom.overlay.querySelectorAll<HTMLElement>(".layer-hitbox")]
      .filter((hit) => {
        const rect = hit.getBoundingClientRect();
        return rect.right >= selectionRect.left && rect.left <= selectionRect.right && rect.bottom >= selectionRect.top && rect.top <= selectionRect.bottom;
      })
      .map((hit) => hit.dataset["id"])
      .filter((id): id is string => Boolean(id));
    state.selection = event.shiftKey ? [...new Set([...state.selection, ...hits])] : hits;
    drawLayers();
    drawInspector();
    drawOverlay();
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", finish);
});

/** Whether the keyboard belongs to a field rather than to the canvas. */
function typingInAField(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT" ||
    element.isContentEditable
  );
}

window.addEventListener("keydown", (event) => {
  // Never steal a key from someone editing a value.
  if (typingInAField(event.target)) return;

  const control = event.ctrlKey || event.metaKey;
  if (event.code === "Space") {
    spacePressed = true;
    dom.stageViewport.classList.add("pan-ready");
    event.preventDefault();
    return;
  }
  if (control && event.key.toLowerCase() === "z") {
    event.preventDefault();
    (event.shiftKey ? dom.redo : dom.undo).click();
    return;
  }

  const key = event.key.toLowerCase();
  if (control && key === "c") {
    event.preventDefault();
    copySelection();
    return;
  }
  if (control && key === "x") {
    event.preventDefault();
    if (selectedLayers().every(api.isEditable) && copySelection()) deleteSelection("cut layers");
    return;
  }
  if (control && key === "v") {
    event.preventDefault();
    pasteClipboard();
    return;
  }
  if (control && key === "d") {
    event.preventDefault();
    const layers = selectedLayers();
    if (layers.length && layers.every(api.isEditable)) {
      void sendBatch("duplicate", layers.map((one) => ({ op: "duplicate", id: one.id } as Operation)));
    }
    return;
  }
  if (control && key === "g") {
    event.preventDefault();
    const layers = selectedLayers();
    if (event.shiftKey) {
      const group = layers.length === 1 && layers[0]?.type === "group" ? layers[0] : null;
      if (group) void send("ungroup", { op: "ungroup", id: group.id } as Operation);
    } else if (layers.length > 1 && layers.every(api.isEditable)) {
      void send("group", { op: "group", ids: layers.map((one) => one.id) } as Operation);
    }
    return;
  }
  if (event.key === "F10" && event.shiftKey) {
    event.preventDefault();
    const rect = dom.canvas.getBoundingClientRect();
    openContextMenu(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return;
  }
  if (event.key === "Escape") {
    // A open Settings modal closes first and alone: clearing the selection or
    // a popover behind it is not something closing a dialog should do.
    if (dom.settingsDialog.open) {
      dom.settingsDialog.close("cancel");
      return;
    }
    if (!dom.addPanel.classList.contains("collapsed")) {
      event.preventDefault();
      closeAddPanel();
      return;
    }
    state.selection = [];
    dom.contextMenu.hidden = true;
    togglePositionPopover(false);
    drawLayers();
    drawOverlay();
    drawInspector();
    return;
  }

  const layer = selectedLayer();
  const layers = selectedLayers();
  if ((event.key === "Enter" || event.key === "F2") && layer?.type === "text" && api.isEditable(layer)) {
    event.preventDefault();
    beginInlineTextEdit(layer);
    return;
  }
  if (layers.length === 0 || layers.some((one) => !api.isEditable(one))) return;

  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    deleteSelection();
    return;
  }

  // Arrows nudge; with shift, by ten. Whole pixels, because a layout nudged
  // by a fraction is a layout nobody can reproduce by hand.
  const step = event.shiftKey ? 10 : 1;
  const nudges: Record<string, [number, number]> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const nudge = nudges[event.key];
  if (nudge) {
    event.preventDefault();
    void sendBatch("nudge selection", layers.map((one) => ({
      op: "move",
      id: one.id,
      dx: nudge[0],
      dy: nudge[1],
    } as Operation)));
  }
});

/**
 * Closes the open project without opening another: the empty canvas shows,
 * and the picker keeps listing what the workspace still holds.
 */
function closeProject(): void {
  state.project = null;
  state.document = null;
  state.selection = [];
  dom.canvas.hidden = true;
  dom.canvasHints.hidden = true;
  dom.canvasImage.removeAttribute("src");
  dom.canvasEmpty.hidden = false;
  dom.renameProject.disabled = true;
  dom.deleteProject.disabled = true;
  dom.reload.disabled = true;
  drawLayers();
  drawOverlay();
  drawInspector();
}

/**
 * Offers rename for one project.
 *
 * The name dialog is the small form, and its `required` field is the check.
 * The id is the directory name, so the project comes back under a new id; the
 * picker reload answers it, and a project this page held open is reopened
 * under the new id. A refusal — `projectExists` for a name that is taken,
 * `projectLocked` for one another process holds — is reported in the
 * engine's own words.
 */
function renameProjectFlow(id: string, currentName: string | null): void {
  requestName("projects.renameTitle", "common.name", "projects.rename", (name) => {
    void guard("rename project", async () => {
      const result = await api.renameProject(id, name);
      say(translate("projects.renamed", { oldName: currentName ?? id, newName: name }));
      if (state.project === id) state.project = null;
      await loadProjects(result.project);
    });
  });
}

/**
 * Offers delete for one project.
 *
 * The confirmation names the project and says the files are gone. The server
 * closes a project this process holds open on the way in; the page also
 * closes its view of it, so nothing keeps drawing a document that is no
 * longer on disk.
 */
function deleteProjectFlow(id: string, name: string | null): void {
  const label = name ?? id;
  const question = translate("projects.deleteConfirm", { name: label });
  if (!window.confirm(question)) return;
  void guard("delete project", async () => {
    await api.deleteProject(id);
    if (state.project === id) closeProject();
    say(translate("projects.deleted", { name: label }));
    await loadProjects();
  });
}

dom.renameProject.addEventListener("click", () => {
  const current = state.project;
  if (!current) return;
  if (dom.settingsDialog.open) dom.settingsDialog.close("cancel");
  renameProjectFlow(current, state.document?.name ?? null);
});
dom.deleteProject.addEventListener("click", () => {
  const current = state.project;
  if (!current) return;
  if (dom.settingsDialog.open) dom.settingsDialog.close("cancel");
  deleteProjectFlow(current, state.document?.name ?? null);
});

async function loadProjects(select?: string): Promise<void> {
  if (select) dom.search.value = "";
  const query = dom.search.value.trim();
  // Filtered by the engine against its cache: a workspace of two hundred
  // projects should not be sent here in full for this page to look through it.
  const projects = await api.listProjects(query);
  fillProjectOptions(projects, query);
  if (select) {
    dom.projects.value = select;
    state.project = select;
    await openProject();
  }
  await drawRecents();
}

/** Updates the internal select and the visible project list. */
function fillProjectOptions(projects: readonly api.ProjectSummary[], query: string): void {
  listedProjects = projectListKey(projects);
  projectChoices = projects;
  dom.projects.replaceChildren();
  dom.projectOptions.replaceChildren();
  projectMenuIndex = -1;
  dom.search.removeAttribute("aria-activedescendant");
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = projects.length ? translate("projects.choose") : query ? translate("projects.nothingMatches") : translate("projects.none");
  dom.projects.append(placeholder);
  for (const [index, project] of projects.entries()) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name ?? project.id;
    dom.projects.append(option);
    const row = document.createElement("button");
    row.type = "button";
    row.id = `project-option-${index}`;
    row.className = "project-option";
    row.dataset["projectId"] = project.id;
    row.setAttribute("role", "option");
    row.setAttribute("aria-selected", String(project.id === state.project));
    const name = document.createElement("strong");
    name.textContent = project.name ?? project.id;
    const count = document.createElement("span");
    count.dataset["i18nCount"] = "projects.layerCount";
    count.dataset["count"] = String(project.layers);
    count.textContent = formatCount("projects.layerCount", project.layers);
    row.append(name, count);
    dom.projectOptions.append(row);
  }
  if (projects.length === 0) {
    const empty = document.createElement("p");
    empty.className = "project-options-empty";
    empty.textContent = query ? translate("projects.noMatching") : translate("projects.none");
    dom.projectOptions.append(empty);
  }
  const current = state.project ? projects.find((project) => project.id === state.project) : null;
  if (current) {
    dom.projects.value = current.id;
    if (!query) dom.search.placeholder = current.name ?? current.id;
  } else if (!query) {
    dom.search.placeholder = projects.length ? translate("projects.searchPlaceholder") : translate("projects.none");
  }
}
// --- following other clients ----------------------------------------------------
//
// An agent connected to this editor's MCP endpoint edits the same projects.
// The page reads the document after its own actions only, so without this an
// agent's edit stays invisible until the person's next action — which then
// meets a version conflict. The page asks for the project list at a slow
// interval and reads the document again when the open project has moved on.
//
// The list, not the project summary: the summary delivers a reclaimed-lock
// notice once and then drains it, and a poll must never consume a notice that
// is meant for the person. The list also shows a project an agent created.
//
// It never competes with the person. It waits while an action is queued or
// running, during a drag or an inline text edit, and while the page is hidden;
// the read itself goes through the queue like every other action.

const FOLLOW_INTERVAL_MS = 1500;

/** The ids of the listed projects, to notice a project that came or went. */
let listedProjects = "";

function projectListKey(projects: readonly api.ProjectSummary[]): string {
  // Everything an option shows: a project whose layer count changed gets a
  // fresh label, and a project that came or went rebuilds the list.
  return projects
    .map((project) => `${project.id}\u0000${project.name ?? ""}\u0000${project.layers}`)
    .join("\n");
}

/** Whether this server answers about connected agents at all. */
let agentsConnectedKnown = true;

/** Shows how many AI agents are working on this workspace. */
async function drawAgentsConnected(): Promise<void> {
  if (!agentsConnectedKnown) return;
  try {
    const { count } = await api.agentSessions();
    dom.agentsConnected.hidden = count === 0;
    dom.agentsConnected.innerHTML =
      '<i class="ph ph-robot" aria-hidden="true"></i><span></span>';
    const label = dom.agentsConnected.querySelector("span");
    if (label) {
      label.dataset["i18nCount"] = "agents.connected";
      label.dataset["count"] = String(count);
      label.textContent = formatCount("agents.connected", count);
    }
  } catch (error) {
    // A server without the endpoint (an older one, or one this page was not
    // served by) is not worth asking again.
    if (error instanceof api.ApiError && error.code.startsWith("http4")) {
      agentsConnectedKnown = false;
      dom.agentsConnected.hidden = true;
    }
  }
}

/**
 * The field the person is typing in, from the first keystroke until the value
 * is committed (`change`) or the field loses focus. A refresh redraws the
 * inspector, and a redraw in that window would discard the typed value.
 */
let typingIn: EventTarget | null = null;

function isTextEntry(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable);
}

document.addEventListener("input", (event) => {
  // The project search is not part of the document: typing there must not
  // stop the page from following another client.
  if (event.target === dom.search) return;
  if (isTextEntry(event.target)) typingIn = event.target;
}, true);
document.addEventListener("change", (event) => {
  if (event.target === typingIn) typingIn = null;
}, true);
document.addEventListener("focusout", (event) => {
  if (event.target === typingIn) typingIn = null;
}, true);

/** Whether the person is still typing. A field that was removed from the
 * page (an inline editor that closed) does not always report focusout. */
function stillTyping(): boolean {
  if (typingIn instanceof Node && !typingIn.isConnected) typingIn = null;
  return typingIn !== null;
}

function followIsQuiet(): boolean {
  return document.visibilityState === "visible" &&
    !state.busy &&
    !state.drag &&
    !state.editingText &&
    !stillTyping() &&
    !document.body.classList.contains("stopped");
}

let following = false;

async function followOtherClients(): Promise<void> {
  if (following || !followIsQuiet()) return;
  // The person turned following off in Settings: the poll stays off. The
  // agent count is status about the server, not a document read, so it still
  // refreshes.
  if (!followEnabled()) {
    void drawAgentsConnected();
    return;
  }
  following = true;
  try {
    const query = dom.search.value.trim();
    const projects = await api.listProjects(query);
    // The person may have started something while the list was on its way.
    if (!followIsQuiet()) return;
    void drawAgentsConnected();

    // Not while the person has the project list open: replacing its options
    // closes it under their pointer.
    if (projectListKey(projects) !== listedProjects && document.activeElement !== dom.projects) {
      fillProjectOptions(projects, query);
      if (!state.project) void drawRecents().catch(() => undefined);
    }

    const project = state.project;
    const listed = projects.find((one) => one.id === project);
    const current = state.document;
    if (!project || !listed || !current) return;
    // Only the document this page has already read for this project: an open
    // that failed leaves the previous project's document here, and following
    // it would repeat that failure every interval.
    if (listed.documentId !== current.id || listed.version === api.versionOf(current)) return;
    void guard("follow", async () => {
      // Checked again inside the queue: an action that ran first has already
      // read the newest document.
      if (state.project !== project || state.drag || state.editingText) return;
      await refresh();
    });
  } catch {
    // A missed poll is not worth a message: the next one tries again, and a
    // stopped server says so through the person's next action.
  } finally {
    following = false;
  }
}

window.setInterval(() => void followOtherClients(), FOLLOW_INTERVAL_MS);

/** Blob URLs the recents strip is holding, so they can be given back. */
let recentThumbnails: string[] = [];

/**
 * The most recently modified projects, as thumbnails.
 *
 * Answered from the engine's cache, which is the only reason "most recent"
 * can be answered without opening every document to read a timestamp.
 */
async function drawRecents(): Promise<void> {
  for (const url of recentThumbnails) URL.revokeObjectURL(url);
  recentThumbnails = [];
  dom.recents.replaceChildren();

  const projects = await api.recentProjects(8);
  // One project is not a list of recents, it is the project you have open.
  dom.recents.hidden = projects.length < 2;
  if (dom.recents.hidden) return;

  for (const project of projects) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent";
    button.title = `${project.name ?? project.id} — ${project.layers} layers`;

    // Fetched rather than pointed at, like every image here: an <img src>
    // cannot carry the access token, and the token must never be in a URL.
    try {
      const url = await api.imageObjectUrl(api.thumbnailUrl(project.id));
      recentThumbnails.push(url);
      const image = document.createElement("img");
      image.src = url;
      image.alt = "";
      button.append(image);
    } catch {
      // A project that will not render — a missing font, say — still belongs
      // in the list; it just has no picture.
    }

    const label = document.createElement("span");
    label.textContent = project.name ?? project.id;
    button.append(label);

    button.addEventListener("click", () => {
      dom.projects.value = project.id;
      openFromQueue(project.id);
    });

    // The same per-project rename and delete the picker offers. A button
    // cannot sit in a button, so each card is a wrapper around the opener
    // and its two controls.
    const card = document.createElement("div");
    card.className = "recent-card";
    const controls = document.createElement("span");
    controls.className = "recent-controls";
    const rename = document.createElement("button");
    rename.type = "button";
    rename.className = "small recent-rename";
    rename.textContent = translate("projects.rename");
    rename.title = translate("projects.renameNamed", { name: project.name ?? project.id });
    rename.addEventListener("click", (event) => {
      event.stopPropagation();
      renameProjectFlow(project.id, project.name ?? null);
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "small recent-delete";
    remove.dataset["i18n"] = "common.delete";
    remove.textContent = translate("common.delete");
    remove.title = translate("projects.deleteNamed", { name: project.name ?? project.id });
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteProjectFlow(project.id, project.name ?? null);
    });
    controls.append(rename, remove);
    card.append(button, controls);
    dom.recents.append(card);
  }
}

dom.shutdown.addEventListener("click", () => {
  if (!window.confirm(translate("projects.stopConfirm"))) return;
  void guard("stop", async () => {
    await api.shutdown();
    // The server finishes this request and then stops, so there is nothing
    // left to talk to. Say so plainly rather than leaving a page that looks
    // alive and answers nothing.
    dom.shutdown.disabled = true;
    document.body.classList.add("stopped");
    say(translate("app.stopped"));
  });
});

void guard("start", async () => {
  // The button is offered only by a server that would accept it: one started
  // for a person, with no console to press Ctrl-C in. A server under a service
  // manager or in a container owns its own lifetime.
  const info = await api.serverInfo();
  dom.shutdown.hidden = !info.canShutdown;
  try {
    await fontsPanel.reload();
  } catch {
    // A server with no readable font store still edits documents; only the
    // suggestion list is poorer for it, and the field still takes any name.
  }
  await loadProjects();
  void drawAgentsConnected();
  // The update notices load beside the rest of the start-up, not in front
  // of it: they never block the first paint of the project list.
  void loadUpdateStatus();
  say(translate("status.ready", { version: info.version }));
  // The moment both first users were lost: a new workspace, and nothing that
  // said an agent could connect.
  if (!listedProjects && !dom.search.value.trim()) agents.offerOnFirstRun();
});
