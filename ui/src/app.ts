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
import { mountExport } from "./export-mantine.js";
import {
  placedAssetSize,
  resizeItemInSelection,
  resizedBounds,
  resizedRotatedBounds,
  rotatedRectBounds,
  selectionBounds,
} from "./geometry.js";
import { appendInstalledFontSpecimen, facesOf, releaseFontSpecimens } from "./fonts.js";
import type { FontSelector } from "./fonts.js";
import { mountFontSelectorMantine as mountFontSelector } from "./font-selector-mantine.js";
import { mountFontsMantine } from "./fonts-mantine.js";
import { formatCount, formatNumber, getLocale, setLocale, t as translate, type MessageKey } from "./i18n.js";
import { ActionQueue } from "./queue.js";
import type { QueueSettlement } from "./queue.js";
import { mountProjectCreate } from "./project-create-mantine.js";
import { mountNamePrompt } from "./name-prompt-mantine.js";
import { mountSettings, type SettingsGroup } from "./settings-mantine.js";
import { mountProjectPicker } from "./project-picker-mantine.js";
import { mountTemplates } from "./templates-mantine.js";
import { mountStructurePanel, type DockView, type ReorderPosition, type StructureSnapshot } from "./structure-mantine.js";
import { mountPaintInput } from "./paint-input.js";
import { mountCanvasImageInput } from "./canvas-image-input.js";
import { mountCanvasAnchorPicker, type CanvasAnchor } from "./canvas-anchor-mantine.js";
import { batchMantinePortals, registerLocaleRefresh } from "./mantine-root.js";
import { mountInspectorField, mountInspectorButton, mountInspectorCheckbox } from "./inspector-controls-mantine.js";
import { mountContextMenu, type ContextMenuItem } from "./context-menu-mantine.js";
import { mountRecentProjects } from "./canvas-surface.js";
import {
  mountStatusChrome,
  currentStatusKind,
  setAgentCount,
  setConsentVisible,
  setDocumentDimensions,
  setSaveIndicator,
  setStatusKind,
  setStatusMessage,
  setUpdateBanner,
} from "./status-chrome.js";
import { positionPopoverIsOpen, setPositionPopoverOpen } from "./position-popover-mantine.js";
import { mountDockSection } from "./dock-section-mantine.js";
import { setAssetUploadHandler } from "./chrome.js";

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
    /**
     * Where the adopted painted preview already sits, in document units.
     * Set when a new drag begins on pixels an earlier commit painted; the
     * preview then moves by `adoptedDelta + (dx, dy)`, so the layer never
     * jumps back to where the canvas image — still the older render —
     * shows it.
     */
    adoptedDelta?: { x: number; y: number };
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
  setSaveIndicator(iconName, key);
}

queue.onActiveChange = (active: boolean): void => {
  state.busy = active;
  if (active) {
    setStatusKind("info");
    setSaveState("ph-circle-notch", "save.working");
  } else if (currentStatusKind() !== "error") {
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

/** UI colour pickers edit solid colours only. Keep gradients intact and make
 * controls that cannot represent them read-only instead of flattening them. */
function solidColour(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function colourDescription(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "kind" in value) return translate("paint.gradient");
  return "";
}
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

/**
 * The blob URLs a painted drag preview is showing. They live until the
 * preview is unmounted, not until the cache is replaced: between a commit
 * and the authoritative render's arrival, these pixels are the only honest
 * picture of the document the page has.
 */
let paintedPreviewUrls: string[] = [];
/**
 * The document version a painted preview's pixels depict, when one is
 * painted outside a drag. A commit paints its prediction and names the
 * version it asked the engine for; the preview of that version then takes
 * over, and anything else — another actor, an undo — takes the preview down.
 */
let paintedPreviewVersion: number | null = null;
/** Where the painted selection image sits, in document units. */
let paintedPreviewOrigin: { x: number; y: number } | null = null;

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

const settings = mountSettings();
let layerQuery = "";
let historySnapshot: StructureSnapshot["history"] = null;
let activeDock: DockView = "layers";
const structurePanel = mountStructurePanel(el<HTMLElement>("structure-panel"), {
  document: null,
  selectedIds: [],
  query: layerQuery,
  history: historySnapshot,
  dock: activeDock,
}, {
  setQuery(query) {
    layerQuery = query;
    drawLayers();
  },
  select(id, additive) {
    state.selection = additive
      ? state.selection.includes(id) ? state.selection.filter((one) => one !== id) : [...state.selection, id]
      : [id];
    drawLayers();
    drawOverlay();
    drawInspector();
    if (window.matchMedia("(max-width: 720px)").matches && selectedLayer()?.type !== "text") {
      dom.structure.classList.remove("mobile-open");
      dom.dockToggle.setAttribute("aria-expanded", "false");
    }
  },
  toggleVisibility(id) {
    const layer = state.document && api.flatten(api.layersOf(state.document)).find((row) => row.layer.id === id)?.layer;
    if (layer) void send(layer.visible === false ? "show layer" : "hide layer", { op: "setVisible", id, visible: layer.visible === false } as Operation);
  },
  toggleLocked(id) {
    const layer = state.document && api.flatten(api.layersOf(state.document)).find((row) => row.layer.id === id)?.layer;
    if (layer) void send(layer.locked ? "unlock layer" : "lock layer", { op: "setLocked", id, locked: !layer.locked } as Operation);
  },
  rename(id, name) {
    void send("rename layer", { op: "rename", id, name: name || undefined } as Operation);
  },
  reorder(draggedId, _targetId, position: ReorderPosition) {
    const to = position.at === "root"
      ? { at: "root" as const, index: position.index }
      : { at: "in" as const, parent: position.parent, index: position.index };
    void send("reorder layer", { op: "reorder", id: draggedId, to } as Operation);
  },
  groupSelection() {
    if (state.selection.length < 2) return;
    void send("group", { op: "group", ids: [...state.selection] } as Operation);
  },
  deleteSelection() { deleteSelection(); },
  undo() { dom.undo.click(); },
  redo() { dom.redo.click(); },
  showDock(view) { showDock(view); },
  contextMenu(_id, x, y) {
    drawOverlay();
    drawInspector();
    openContextMenu(x, y);
  },
});
const contextMenuController = mountContextMenu(el<HTMLElement>("context-menu-root"));
const dom = {
  newProject: el<HTMLButtonElement>("new-project"),
  renameProject: el<HTMLButtonElement>("rename-project"),
  deleteProject: el<HTMLButtonElement>("delete-project"),
  reload: el<HTMLButtonElement>("reload"),
  get search(): HTMLInputElement { return el<HTMLInputElement>("project-search"); },
  recents: el<HTMLDivElement>("recents-mount"),
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
  statusChromeRoot: el<HTMLDivElement>("status-chrome-root"),
  version: el<HTMLSpanElement>("version"),
  selectTool: el<HTMLButtonElement>("select-tool"),
  addPanel: el<HTMLElement>("add-panel"),

  addPanelTitle: el<HTMLHeadingElement>("add-panel-title"),
  addPanelClose: el<HTMLButtonElement>("add-panel-close"),
  dockToggle: el<HTMLButtonElement>("dock-toggle"),
  addText: el<HTMLButtonElement>("add-text"),
  addShape: el<HTMLButtonElement>("add-shape"),
  addImage: el<HTMLButtonElement>("add-image"),
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
  positionPopover: el<HTMLDivElement>("position-popover"),
  positionClose: el<HTMLButtonElement>("position-close"),
  positionFields: el<HTMLDivElement>("position-fields"),
  contextMenu: el<HTMLDivElement>("context-menu"),
  stageViewport: el<HTMLDivElement>("stage-viewport"),
  canvasControlsRoot: el<HTMLDivElement>("canvas-controls-root"),
  stage: el<HTMLDivElement>("stage"),
  zoomOut: el<HTMLButtonElement>("zoom-out"),
  zoomValue: el<HTMLButtonElement>("zoom-value"),
  zoomIn: el<HTMLButtonElement>("zoom-in"),
  zoom100: el<HTMLButtonElement>("zoom-100"),
  get templatesPanel(): HTMLElement { return el<HTMLElement>("templates"); },
  templatesToggle: el<HTMLButtonElement>("templates-toggle"),
  get templatesClose(): HTMLButtonElement { return el<HTMLButtonElement>("templates-close"); },
  settings: el<HTMLButtonElement>("settings"),
  settingsForm: el<HTMLFormElement>("settings-form"),

  settingFollow: el<HTMLInputElement>("setting-follow"),
  settingLanguage: el<HTMLSelectElement>("setting-language"),
  settingsFontsOpen: el<HTMLButtonElement>("settings-fonts-open"),
  settingUpdateCheck: el<HTMLInputElement>("setting-update-check"),
  updateNote: el<HTMLParagraphElement>("update-note"),
  canvasHints: el<HTMLParagraphElement>("canvas-hints"),
};

mountStatusChrome(
  dom.statusChromeRoot,
  (consent) => { void recordConsent(consent); },
  (version) => {
    window.localStorage.setItem("assemblash-update-banner-v1", version);
    setUpdateBanner(null);
  },
);

const projectPicker = mountProjectPicker({
  openProject: (projectId) => openFromQueue(projectId),
  search: () => { void guard("search", () => loadProjects()); },
}, document.querySelector<HTMLElement>(".project-combobox")!);

const namePrompt = mountNamePrompt();

function requestName(
  titleKey: MessageKey,
  labelKey: MessageKey,
  confirmKey: MessageKey,
  submit: (name: string) => void,
): void {
  namePrompt.request(titleKey, labelKey, confirmKey, submit);
}

function say(message: string, kind: "info" | "error" = "info"): void {
  setStatusMessage(message, kind);
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
el<HTMLElement>("add-template-section").append(el<HTMLElement>("templates-mantine-mount"));
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

/**
 * The font manager, which owns the store the renderer draws from.
 *
 * Given the same handful of things the template panel gets, plus the one
 * thing only it can report: which families exist, so the shared suggestion
 * list follows an import or a removal without a page reload.
 */
const fontsPanel = mountFontsMantine({
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
}, el<HTMLElement>("fonts-mantine-mount"));

const exporter = mountExport({
  project: () => state.project,
  document: () => state.document,
  say,
  guard,
});

const projectCreator = mountProjectCreate({
  create: async (id, width, height, background) => {
    let created = false;
    await guard("create", async () => {
      await api.createProject(id, width, height, background, id);
      await loadProjects(id);
      say(translate("projects.created", { id }));
      created = true;
    });
    return created;
  },
});

const agents = mountAgents({ say });

// Settings hands control to the agent dialog. Only one modal stays open.
dom.agents.addEventListener("click", () => {
  if (settings.isOpen()) settings.close();
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
function openSettings(group: SettingsGroup = "settings-agents"): void {
  dom.settingFollow.checked = followEnabled();
  const locale = getLocale();
  const language = locale === "pseudo" ? "en" : locale;
  dom.settingLanguage.value = language;
  settings.open(group, { follow: followEnabled(), language });
}

dom.settings.addEventListener("click", () => openSettings());

dom.settingLanguage.value = getLocale();
dom.settingLanguage.addEventListener("change", () => {
  setLocale(dom.settingLanguage.value);
});

// Update parameterized labels in place so an active input keeps its value and focus.
registerLocaleRefresh(() => {
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
    setDocumentDimensions(
      `${formatNumber(Math.round(state.document.canvas.width))} × ${formatNumber(Math.round(state.document.canvas.height))}`,
    );
    applyZoom();
  }
});

dom.settingFollow.addEventListener("change", () => {
  window.localStorage.setItem(FOLLOW_STORAGE_KEY, dom.settingFollow.checked ? "on" : "off");
});

dom.settingsFontsOpen.addEventListener("click", () => {
  settings.close();
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
  setConsentVisible(status.consent === null);
  const dismissed = window.localStorage.getItem(BANNER_DISMISSED_KEY);
  const showBanner = status.newer && Boolean(status.latest) && dismissed !== status.latest;
  setUpdateBanner(showBanner && status.latest
    ? {
        version: status.latest,
        text: translate("updates.versionAvailable", { latest: status.latest, current: status.current }),
        notesUrl: status.notesUrl ?? null,
      }
    : null);
}

/** Records the consent, then reflects the answer everywhere it is shown. */
async function recordConsent(consent: api.UpdateConsent): Promise<void> {
  try {
    const status = await api.setUpdateConsent(consent);
    setConsentVisible(status.consent === null);
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

dom.settingUpdateCheck.addEventListener("change", () => {
  void recordConsent(dom.settingUpdateCheck.checked ? "notify" : "off");
});

// The form's own Escape path closes it through the browser; this covers the
// keydown that arrives while the keyboard focus sits elsewhere on the page.
// Closing commits nothing: the canvas form applies only through its button,
// and the follow toggle commits only through its own change event.
dom.settingsForm.addEventListener("submit", (event) => {
  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
  if (submitter?.value === "cancel") {
    settings.close();
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

/** A layer inherits each parent group's editing guard. */
function layerGuardReason(layer: Layer, allowLocked = false): string | null {
  const own = api.whyNotEditable(layer);
  if (own && (!allowLocked || layer.protected || layer.readOnly)) return own;
  if (!state.document) return null;
  const flat = api.flatten(api.layersOf(state.document));
  let parent = flat.find((entry) => entry.layer.id === layer.id)?.parent;
  while (parent) {
    const ancestor = flat.find((entry) => entry.layer.id === parent);
    if (!ancestor) break;
    const reason = api.whyNotEditable(ancestor.layer);
    if (reason) return reason;
    parent = ancestor.parent;
  }
  return null;
}

function editableLayer(layer: Layer): boolean {
  return layerGuardReason(layer) === null;
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
  applyDocument(doc);
}

/**
 * Puts one authoritative document on the page.
 *
 * The pixels and the side panels trail the state on purpose. Neither belongs
 * in the serial window an interaction waits on: the preview fetch is the
 * dominant cost of a commit, and blocking further input on it is what used to
 * make rapid actions disappear. Called with a document the server handed back
 * with a write's own response, it is also what removes the second round trip
 * a read-after-write used to need.
 */
function applyDocument(doc: Document): void {
  state.document = doc;
  state.selection = state.selection.filter((id) =>
    api.flatten(api.layersOf(doc)).some(({ layer }) => layer.id === id),
  );
  dom.version.textContent = formatNumber(api.versionOf(doc));
  dom.canvasEmpty.hidden = true;
  dom.canvas.hidden = false;
  dom.canvasControlsRoot.hidden = false;
  showCanvasHint();
  setDocumentDimensions(
    `${formatNumber(Math.round(doc.canvas.width))} × ${formatNumber(Math.round(doc.canvas.height))}`,
  );
  // Slots come with the document itself, so there is nothing extra to fetch:
  // a template is a document that names some of its own layers.
  state.slots = (doc.slots ?? []) as api.Slot[];

  // A painted preview depicts one version. When the truth is a different
  // one — another actor's commit, an undo — the painted pixels are wrong
  // from this moment, so they go now rather than misleading until a render
  // happens to replace them.
  if (paintedPreviewVersion !== null && api.versionOf(doc) !== paintedPreviewVersion) {
    unmountDragPreview();
  }

  requestPreview();
  drawLayers();
  drawOverlay();
  drawInspector();
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
let lastRequestedPreviewScale: number | null = null;

function requestPreview(): void {
  if (!state.project || !state.document) return;
  lastRequestedPreviewScale = interactivePreviewScale();
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
        // This image is the truth for `version`. A painted preview — the
        // pixels a drag left behind — hands the canvas back here, and the
        // swap is invisible because both show the same state. An image older
        // than the painted prediction arriving while a commit is still in
        // flight stays behind it: the truth for that version has not landed
        // yet, and showing it would move the layer back.
        if (!state.drag && (paintedPreviewVersion === null || version >= paintedPreviewVersion)) {
          unmountDragPreview();
        }
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

function requestPreviewIfScaleChanged(): void {
  if (!state.document || interactivePreviewScale() === lastRequestedPreviewScale) return;
  requestPreview();
}

/**
 * Ask the deterministic renderer for the pixels the editor can actually show.
 * Export remains full resolution; rendering hidden pixels on every edit only
 * delays feedback and does not improve the fitted canvas.
 */
/** The stage padding is the canvas inset and comes from the active layout. */
function stageInsets(): { horizontal: number; vertical: number } {
  const style = window.getComputedStyle(dom.stage);
  const pixels = (value: string): number => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  };
  return {
    horizontal: pixels(style.paddingLeft) + pixels(style.paddingRight),
    vertical: pixels(style.paddingTop) + pixels(style.paddingBottom),
  };
}

/** The zoom that fits the canvas in the current stage content box. */
function fitZoomScale(): number {
  if (!state.document) return 1;
  const insets = stageInsets();
  const availableWidth = Math.max(1, dom.stageViewport.clientWidth - insets.horizontal);
  const availableHeight = Math.max(1, dom.stageViewport.clientHeight - insets.vertical);
  return Math.min(
    availableWidth / state.document.canvas.width,
    availableHeight / state.document.canvas.height,
    1,
  );
}

function currentZoomScale(): number {
  return state.zoom ?? fitZoomScale();
}

function interactivePreviewScale(): number {
  if (!state.document) return 1;
  const density = Math.max(1, window.devicePixelRatio || 1);
  return Math.min(1, Math.max(0.1, currentZoomScale() * density));
}

function drawLayers(): void {
  structurePanel.setSnapshot({
    document: state.document,
    selectedIds: state.selection,
    query: layerQuery,
    history: historySnapshot,
    dock: activeDock,
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
  const editable = selected.every(({ layer }) => editableLayer(layer));
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
    box.title = selected.map(({ layer }) => layerGuardReason(layer)).filter(Boolean).join("; ");
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
  form.innerHTML = [
    '<h2 data-i18n="common.canvas">Canvas</h2>',
    '<div class="property-grid"><div class="field" id="canvas-width-mount"></div><div class="field" id="canvas-height-mount"></div></div>',
    '<div class="canvas-background-field"><span data-i18n="common.background">Background</span><div id="canvas-background-paint"></div></div>',
    '<div id="canvas-background-image-mount"></div>',
    '<div class="canvas-transparent" id="canvas-transparent-mount"></div>',
    '<fieldset class="canvas-anchor-fieldset" aria-describedby="canvas-anchor-hint">',
    '<legend data-i18n="canvas.anchor">Anchor</legend><div class="canvas-size-anchor-grid" id="canvas-size-anchor-grid"></div>',
    '<p id="canvas-anchor-hint" class="hint" data-i18n="canvas.anchorHint">Keep this point fixed when resizing. Layers keep their size.</p></fieldset>',
    '<div id="canvas-apply-mount"></div>',
  ].join("");
  const widthTarget = form.querySelector<HTMLElement>("#canvas-width-mount")!;
  const heightTarget = form.querySelector<HTMLElement>("#canvas-height-mount")!;
  let width: HTMLInputElement | null = null;
  let height: HTMLInputElement | null = null;
  let apply: HTMLButtonElement | null = null;
  mountedInspectorWidgets.push(mountInspectorField(widthTarget, {
    id: "canvas-width", label: () => translate("canvas.widthPx"), value: String(canvas.width),
    type: "number", min: 0, step: "any", onMount: (element) => { width = element as HTMLInputElement; update(); }, onCommit: () => {},
  }));
  mountedInspectorWidgets.push(mountInspectorField(heightTarget, {
    id: "canvas-height", label: () => translate("canvas.heightPx"), value: String(canvas.height),
    type: "number", min: 0, step: "any", onMount: (element) => { height = element as HTMLInputElement; update(); }, onCommit: () => {},
  }));
  const transparentTarget = form.querySelector<HTMLElement>("#canvas-transparent-mount")!;
  const anchorTarget = form.querySelector<HTMLElement>("#canvas-size-anchor-grid")!;
  const anchorFieldset = form.querySelector<HTMLFieldSetElement>(".canvas-anchor-fieldset")!;
  const applyTarget = form.querySelector<HTMLElement>("#canvas-apply-mount")!;
  let backgroundDraft: api.Color = canvas.background ?? "#ffffff";
  let backgroundImage: api.BackgroundImage | null = canvas.backgroundImage ?? null;
  let transparentDraft = canvas.background == null;
  let anchorDraft: CanvasAnchor = "top-left";
  mountPaint(form.querySelector<HTMLElement>("#canvas-background-paint")!, "canvas-background",
    translate("common.background"), backgroundDraft, false, (value) => {
      backgroundDraft = value;
      transparentDraft = false;
      mountTransparency();
      update();
    });
  const transparencyProps = () => ({
    id: "canvas-transparent",
    label: () => translate("canvas.transparentBackground"),
    checked: transparentDraft,
    onChange(checked: boolean) { transparentDraft = checked; update(); },
  });
  let destroyTransparency = mountInspectorCheckbox(transparentTarget, transparencyProps());
  mountedInspectorWidgets.push(() => destroyTransparency());
  function mountTransparency(): void {
    batchMantinePortals(() => {
      destroyTransparency();
      destroyTransparency = mountInspectorCheckbox(transparentTarget, transparencyProps());
    });
  }
  const anchorPicker = mountCanvasAnchorPicker(anchorTarget, anchorDraft, true, (value) => {
    anchorDraft = value;
    update();
  });
  mountedInspectorWidgets.push(anchorPicker.destroy);
  mountedInspectorWidgets.push(mountCanvasImageInput(form.querySelector<HTMLElement>("#canvas-background-image-mount")!, {
    assets: state.document.assets ?? [], value: backgroundImage,
    onChange(value) {
      backgroundImage = value;
      const operation: Operation = value
        ? { op: "updateCanvas", backgroundImage: value } as Operation
        : { op: "updateCanvas", clearBackgroundImage: true } as Operation;
      void send(value ? "set canvas background image" : "clear canvas background image", operation);
    },
    onUpload(file) {
      const project = state.project;
      if (!project) return;
      void guard("upload canvas background image", async () => {
        const uploaded = await api.uploadAsset(project, file);
        const operation = {
          op: "updateCanvas",
          backgroundImage: { asset: uploaded.asset.id, fit: backgroundImage?.fit ?? "fill" },
        } as Operation;
        const result = await api.applyOperation(project, operation, uploaded.version);
        say(translate("status.editDone", { version: result.version }));
        if (result.document) applyDocument(result.document);
        else await refresh();
      });
    },
  }));
  mountedInspectorWidgets.push(mountInspectorButton(applyTarget, {
    id: "canvas-apply", type: "submit", label: () => translate("canvas.applyChanges"),
    className: "primary", disabled: true, onMount: (button) => { apply = button; update(); }, onClick: () => {},
  }));
  const resizing = (): boolean => Boolean(width && height && (Number(width.value) !== canvas.width || Number(height.value) !== canvas.height));
  function update(): void {
    if (!width || !height || !apply) return;
    for (const input of [width, height]) {
      input.setCustomValidity(Number.isFinite(input.valueAsNumber) && input.valueAsNumber > 0
        ? "" : translate("canvas.invalidDimension"));
    }
    anchorFieldset.disabled = !resizing();
    anchorPicker.setState(anchorDraft, !resizing());
    apply.disabled = !resizing() && samePaint(transparentDraft ? null : backgroundDraft, canvas.background ?? null);
  }
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
    if (!apply || apply.disabled || !form.reportValidity() || !width || !height) return;
    const nextBackground = transparentDraft ? null : backgroundDraft;
    const operation: Operation = {
      op: "updateCanvas",
      ...(resizing() ? { width: Number(width.value), height: Number(height.value), anchor: anchorDraft } : {}),
      ...(!samePaint(nextBackground, canvas.background ?? null) ? { background: nextBackground } : {}),
    };
    apply.disabled = true;
    void send("update canvas", operation);
  });
  update();
  target.append(form);
}

/** Opens one collapsible Properties section in `container` and returns its body. */
function dockSection(container: HTMLElement, title: string): HTMLElement {
  const section = mountDockSection(
    container,
    title,
    !["Clip and mirror", "Appearance", "Effects", "Presets", "Slots"].includes(title),
  );
  mountedInspectorSections.push(section.destroy);
  return section.body;
}

/**
 * Builds one font selector bound to a text layer.
 *
 * Both homes — the contextual toolbar and the Typography section — use it, so
 * a family is committed from either only when the store has it, and always as
 * one ordinary `update` operation through the queue.
 */
const mountedFontSelectors: FontSelector[] = [];
const mountedInspectorWidgets: Array<() => void> = [];
const mountedInspectorSections: Array<() => void> = [];
let nextInspectorControlId = 0;

function mountPaint(
  target: HTMLElement,
  id: string,
  label: string,
  value: api.Color,
  disabled: boolean,
  onCommit: (next: api.Color) => void,
  className?: string,
  clear?: { label: string; className?: string; title?: string; disabled?: boolean; onClear(): void },
  compact = false,
): void {
  mountedInspectorWidgets.push(mountPaintInput(target, { id, label, value, disabled, onCommit, className, clear, compact }));
}

function samePaint(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function fontSelectorFor(layer: Extract<Layer, { type: "text" }>, disabled: boolean): ReturnType<typeof mountFontSelector> {
  const selector = mountFontSelector({ store: () => fontStore }, (family) => {
    void send("change font", { op: "update", id: layer.id, fontFamily: family } as Operation);
  });
  mountedFontSelectors.push(selector);
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
  batchMantinePortals(drawInspectorContent);
}

function drawInspectorContent(): void {
  for (const selector of mountedFontSelectors.splice(0)) selector.destroy();
  for (const destroy of mountedInspectorWidgets.splice(0)) destroy();
  for (const destroy of mountedInspectorSections.splice(0)) destroy();
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
  dom.deleteLayer.disabled = layers.length === 0 || layers.some((one) => !editableLayer(one));
  dom.groupLayers.disabled = layers.length < 2 || layers.some((one) => !editableLayer(one));
  renderPositionFields(layers);
  if (state.document) {
    const canvasButtonHost = document.createElement("span");
    canvasButtonHost.style.display = "contents";
    mountedInspectorWidgets.push(mountInspectorButton(canvasButtonHost, {
      id: "edit-canvas",
      label: () => translate("editor.canvasSizeBackground"),
      icon: "ph-frame-corners",
      className: "toolbar-action",
      onClick() {
      contextMenuController.close();
      state.selection = [];
      drawLayers();
      drawOverlay();
      drawInspector();
      showDock("properties");
      },
    }));
    dom.inspector.append(canvasButtonHost);
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

  const guarded = layers.some((one) => !editableLayer(one));
  let nextActionId = 0;
  const action = (
    labelKey: MessageKey,
    icon: string,
    run: () => void,
    disabled = guarded,
    className = "toolbar-action",
    decorate?: (button: HTMLButtonElement) => void,
    iconOnly = false,
  ): HTMLSpanElement => {
    const target = document.createElement("span");
    target.className = "inspector-button-host";
    target.style.display = "contents";
    mountedInspectorWidgets.push(mountInspectorButton(target, {
      id: `inspector-action-${++nextActionId}`,
      label: () => translate(labelKey),
      icon,
      className,
      iconOnly,
      disabled,
      onMount(button) {
        button.title = translate(labelKey);
        decorate?.(button);
      },
      onClick: run,
    }));
    return target;
  };

  if (layer?.type === "text") {

    const font = document.createElement("label");
    font.className = "toolbar-field toolbar-font";
    font.append(localizedSpan("editor.fontFamily"));
    font.firstElementChild?.classList.add("sr-only");
    // One selector for both homes: installed families only, with the store's
    // refusal shown at the control when what is typed matches none of them.
    const selector = fontSelectorFor(layer, guarded);
    font.append(selector.root);
    dom.inspector.append(font);

    const size = document.createElement("span");
    size.className = "toolbar-field toolbar-number";
    mountedInspectorWidgets.push(mountInspectorField(size, {
      id: "toolbar-font-size",
      label: () => translate("editor.fontSize"),
      value: String(layer.fontSize),
      type: "number",
      size: "xs",
      min: 1,
      disabled: guarded,
      className: "toolbar-font-size",
      onCommit: (next) => void send("change font size", {
        op: "update", id: layer.id, fontSize: Number(next),
      } as Operation),
    }));
    dom.inspector.append(size);

    const colour = document.createElement("div");
    colour.className = "toolbar-paint";
    mountPaint(colour, "text-color", translate("editor.textColour"), layer.color ?? "#000000", guarded,
      (value) => void send("change colour", { op: "update", id: layer.id, color: value } as Operation), "toolbar-colour", undefined, true);
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
      const host = action(alignKey, icon, () => {
        void send(`align text ${value}`, { op: "update", id: layer.id, align: value } as Operation);
      }, guarded, "icon-button toolbar-icon", (button) => {
        button.classList.toggle("selected", (layer.align ?? "left") === value);
      }, true);
      dom.inspector.append(host);
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

  const why = layerGuardReason(layer);
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
    type: "number" | "text" | "textarea" = "number",
    list?: string,
    className?: string,
    disabled = false,
  ): void => {
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    mountedInspectorWidgets.push(mountInspectorField(wrapper, {
      id: className ?? `field-${labelKey.replaceAll(".", "-")}`,
      label: () => translate(labelKey),
      value,
      type,
      className,
      disabled: why !== null || disabled,
      list,
      onCommit(next) {
        if (next === value) return;
        const operation = apply(next);
        if (operation) void send(`change ${translate(labelKey)}`, operation);
      },
    }));
    pane.append(wrapper);
  };
  const choiceField = (
    labelKey: MessageKey,
    id: string,
    value: string,
    options: readonly { value: string; label: string }[],
    apply: (next: string) => void,
    disabled = false,
  ): void => {
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    mountedInspectorWidgets.push(mountInspectorField(wrapper, {
      id,
      label: () => translate(labelKey),
      value,
      className: id,
      disabled: why !== null || disabled,
      options,
      onCommit: apply,
    }));
    pane.append(wrapper);
  };
  const paintField = (
    labelKey: MessageKey,
    id: string,
    value: api.Color,
    apply: (next: api.Color) => Operation,
    clear?: { className: string; disabled: boolean; onClear(): void },
  ): void => {
    const wrapper = document.createElement("div");
    wrapper.className = "field paint-field";
    mountPaint(wrapper, id, translate(labelKey), value, why !== null,
      (next) => void send(`change ${translate(labelKey)}`, apply(next)), id,
      clear ? {
        label: translate("canvas.none"),
        className: clear.className,
        title: translate("canvas.removeColor", { label: translate(labelKey).toLowerCase() }),
        disabled: clear.disabled,
        onClear: clear.onClear,
      } : undefined);
    pane.append(wrapper);
  };


  if (layer.type === "text") {
    pane = beginSection("Typography");
    const editText = document.createElement("span");
    editText.style.display = "contents";
    mountedInspectorWidgets.push(mountInspectorButton(editText, {
      id: "edit-layer-text",
      label: () => translate("canvas.editText"),
      icon: "ph-pencil-simple",
      className: "wide-action edit-text-button",
      disabled: why !== null,
      onClick: () => beginInlineTextEdit(layer),
    }));
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
      const install = document.createElement("span");
      install.style.display = "contents";
      mountedInspectorWidgets.push(mountInspectorButton(install, {
        id: "install-fonts",
        label: () => translate("fonts.installFonts"),
        className: "small",
        onClick: () => void guard("fonts", () => openFontManager(true)),
      }));
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
      const currentWeight = layer.fontWeight ?? 400;
      const currentStyle = layer.fontStyle ?? "normal";
      const known = [...new Set([
        ...faces.filter((face) => face.style === currentStyle).map((face) => face.weight),
        currentWeight,
      ])].sort((a, b) => a - b);
      choiceField("properties.weight", "font-weight", String(currentWeight), known.map((weight) => ({ value: String(weight), label: String(weight) })),
        (next) => void send("change Weight", { op: "update", id: layer.id, fontWeight: Number(next) } as Operation));
    } else {
      field("properties.weight", String(layer.fontWeight ?? 400), (next) => ({ op: "update", id: layer.id, fontWeight: Number(next) }) as Operation);
    }
    field("properties.letterSpacing", String(layer.letterSpacing ?? 0), (next) => ({ op: "update", id: layer.id, letterSpacing: Number(next) }) as Operation);
    const currentStyle = layer.fontStyle ?? "normal";
    const currentWeight = layer.fontWeight ?? 400;
    const availableStyles = faces
      .filter((face) => face.weight === currentWeight)
      .map((face) => face.style === "oblique" ? "italic" : face.style);
    const styles = faces.length
      ? [...new Set([...availableStyles, currentStyle])]
      : [currentStyle];
    choiceField("properties.style", "font-style", layer.fontStyle ?? "normal", styles.map((style) => ({ value: style, label: style })),
      (next) => void send("change font style", { op: "update", id: layer.id, fontStyle: next } as Operation));
    choiceField("properties.verticalAlign", "vertical-align", layer.verticalAlign ?? "top", ["top", "middle", "bottom"].map((mode) => ({ value: mode, label: mode })),
      (next) => void send("change vertical align", { op: "update", id: layer.id, verticalAlign: next } as Operation));
    paintField("properties.colour", "text-fill", layer.color ?? "#000000",
      (next) => ({ op: "update", id: layer.id, color: next }) as Operation);
    paintField("properties.strokeColour", "text-stroke", layer.stroke?.color ?? "#000000",
      (next) => ({ op: "update", id: layer.id, stroke: { color: next, width: layer.stroke?.width ?? 1 } }) as Operation,
      { className: "text-stroke-none", disabled: !layer.stroke, onClear: () => void send("clear text stroke", { op: "update", id: layer.id, stroke: null } as Operation) });
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
    const className = `transform-${labelKey.split(".").at(-1)}`;
    const wrapper = document.createElement("div");
    wrapper.className = "field";
    mountedInspectorWidgets.push(mountInspectorField(wrapper, {
      id: className,
      label: () => translate(labelKey),
      value,
      type: "number",
      className,
      disabled: why !== null,
      onCommit(next) {
        const operation = apply(next);
        if (operation) void send(`change ${translate(labelKey)}`, operation);
      },
    }));
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
    choiceField("properties.fit", "layer-fit", layer.fit ?? "fill", api.IMAGE_FITS.map((mode) => ({ value: mode, label: mode })),
      (next) => void send("change fit", { op: "update", id: layer.id, fit: next } as Operation));

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
        field(labelKey, String(value), (next) => change(Number(next)), "number", undefined, name, !sourceKnown);
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
      const clear = document.createElement("span");
      clear.style.display = "contents";
      mountedInspectorWidgets.push(mountInspectorButton(clear, {
        id: "clear-image-crop",
        label: () => translate("canvas.clearCrop"),
        title: () => translate("canvas.wholeImage"),
        className: "small crop-clear",
        disabled: why !== null || crop === null,
        onClick: () => void send("clear crop", { op: "update", id: layer.id, crop: null } as Operation),
      }));
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
    const paint = (
      labelKey: MessageKey,
      name: string,
      colour: api.Color,
      present: boolean,
      set: (next: api.Color) => Operation,
      clear: () => Operation,
    ): void => {
      const row = document.createElement("div");
      row.className = "field shape-field";
      const caption = document.createElement("span");
      caption.dataset["i18n"] = labelKey;
      caption.textContent = translate(labelKey);
      const controls = document.createElement("span");
      controls.className = "shape-paint";
      mountPaint(controls, name, translate(labelKey), colour, why !== null,
        (next) => void send(`change ${translate(labelKey)}`, set(next)), name, {
          label: translate("canvas.none"),
          className: `small ${name}-none`,
          title: translate("canvas.removeColor", { label: translate(labelKey).toLowerCase() }),
          disabled: !present,
          onClear: () => void send(`clear ${translate(labelKey)}`, clear()),
        });
      if (!present) controls.title = translate("canvas.noColor", { label: translate(labelKey).toLowerCase() });
      row.append(caption, controls);
      pane.append(row);
    };

    paint(
      "properties.fill",
      "shape-fill",
      layer.fill ?? SHAPE_FILL_COLOUR,
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
      strokeColour,
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
    const pathRow = document.createElement("div");
    pathRow.className = "field shape-field shape-path";
    const shapeRecord = layer.shape as Record<string, unknown>;
    const pathValue = kind === "path" && typeof shapeRecord["d"] === "string" ? shapeRecord["d"] : "";
    mountedInspectorWidgets.push(mountInspectorField(pathRow, {
      id: "shape-path-d",
      label: () => translate("canvas.pathData"),
      type: "textarea",
      value: pathValue,
      className: "shape-path-d",
      rows: 3,
      maxLength: 2048,
      disabled: why !== null,
      onCommit: (raw) => {
      const d = raw.trim();
      if (!d || d === pathValue) return;
      shapeControlErrors.delete("path-d");
      void send("set path data", {
        op: "update",
        id: layer.id,
        shape: { kind: "path", d },
      } as Operation, refuseAtControl("path-d"));
    },
    }));
    drawControlError(pathRow, "path-d");
    pane.append(pathRow);

    // The dash pattern, as a comma list. Entry count and positivity are
    // checked here, because a form that sends a refusal it could have caught
    // buys a round trip that says nothing new; anything the engine still
    // refuses arrives back in its own words, at this control.
    const dashRow = document.createElement("div");
    dashRow.className = "field shape-field shape-dash-row";
    const dashValue = (layer.stroke?.dashArray ?? []).join(", ");
    mountedInspectorWidgets.push(mountInspectorField(dashRow, {
      id: "shape-dash",
      label: () => translate("canvas.dashPattern"),
      type: "text",
      value: dashValue,
      className: "shape-dash",
      placeholder: translate("canvas.dashExample"),
      disabled: why !== null,
      onCommit: (raw) => {
      const text = raw.trim();
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
    },
    }));
    drawControlError(dashRow, "dash");
    pane.append(dashRow);

    // Cap and join, from the sets the engine draws. A value written by a
    // newer build is listed as itself, so it can be seen and kept but never
    // silently retyped.
    const strokeChoice = (
      labelKey: MessageKey,
      className: string,
      key: "lineCap" | "lineJoin",
      choices: readonly string[],
    ): void => {
      // A cap or join written by a newer build round-trips verbatim, so its
      // runtime type is only ever checked here, at the control.
      const raw = layer.stroke?.[key];
      const current = typeof raw === "string" ? raw : null;
      const offered = current && !choices.includes(current)
        ? [...choices, current]
        : [...choices];
      choiceField(labelKey, className, current ?? choices[0] ?? "", offered.map((choice) => ({ value: choice, label: choice })), (next) => {
        const stroke = {
          ...(layer.stroke ?? { color: strokeColour, width: strokeWidth }),
          [key]: next,
        };
        void send(`change ${translate(labelKey).toLowerCase()}`, { op: "update", id: layer.id, stroke } as Operation);
      });
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
        const current = shapeRecord[key];
        const offered = typeof current === "string" && current !== "none" &&
            !["arrow", "circle"].includes(current)
          ? ["none", "arrow", "circle", current]
          : ["none", "arrow", "circle"];
        choiceField(labelKey, className, typeof current === "string" ? current : "none", offered.map((choice) => ({ value: choice, label: choice })), (next) =>
          void send(`change ${translate(labelKey).toLowerCase()}`, {
            op: "update",
            id: layer.id,
            [key]: next,
          } as Operation),
        );
      };
      markerRow("properties.markerStart", "shape-marker-start", "markerStart");
      markerRow("properties.markerEnd", "shape-marker-end", "markerEnd");
    }
  }

  // Clip and mirror apply to every kind: a clip masks whatever the layer
  // draws, and a flip mirrors it about the box centre.
  pane = beginSection("Clip and mirror");

  const clipShape = clipShapeOf(layer);
  // A clip shape this build does not know is listed as itself, so it can be
  // seen and replaced but never silently becomes something else.
  const clipChoices: string[] = [...CLIP_SHAPES];
  if (clipShape && !clipChoices.includes(clipShape)) clipChoices.push(clipShape);
  choiceField("properties.clip", "clip-shape", clipShape ?? "none", ["none", ...clipChoices].map((choice) => ({ value: choice, label: choice })), (chosen) => {
    if (chosen === (clipShape ?? "none")) return;
    const clip = chosen === "none"
      ? null
      : chosen === "rect"
        ? { shape: "rect", cornerRadius: clipRadiusOf(layer) }
        : { shape: chosen };
    void send("change clip", { op: "update", id: layer.id, clip } as Operation);
  });

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
    const wrapper = document.createElement("div");
    wrapper.className = "field checkbox";
    mountedInspectorWidgets.push(mountInspectorCheckbox(wrapper, {
      id: name,
      label: () => translate(labelKey),
      checked: current,
      disabled: why !== null,
      className: name,
      onChange: (checked) => void send(translate(labelKey).toLowerCase(), { op: "update", id: layer.id, [key]: checked } as Operation),
    }));
    mirror.append(wrapper);
  };
  flip("properties.flipHorizontal", "flip-horizontal", "flipHorizontal", layer.transform.flipHorizontal ?? false);
  flip("properties.flipVertical", "flip-vertical", "flipVertical", layer.transform.flipVertical ?? false);
  pane.append(mirror);

  pane = beginSection("Appearance");
  choiceField("properties.blendMode", "blend-mode", layer.blendMode ?? "normal", api.BLEND_MODES.map((mode) => ({ value: mode, label: mode })),
    (next) => void send("change blend mode", { op: "update", id: layer.id, blendMode: next } as Operation));

  drawEffects(dom.advancedInspector, layer, why !== null);
  drawPresets(dom.advancedInspector, layer, why !== null);
  drawSlots(dom.advancedInspector, layer);

  const flags = document.createElement("div");
  flags.className = "property-flags";
  const visible = document.createElement("div");
  visible.className = "field checkbox";
  mountedInspectorWidgets.push(mountInspectorCheckbox(visible, {
    id: "layer-visible",
    label: () => translate("properties.visible"),
    checked: layer.visible ?? true,
    disabled: why !== null,
    onChange: (checked) => void send("show/hide", { op: "setVisible", id: layer.id, visible: checked } as Operation),
  }));
  const locked = document.createElement("div");
  locked.className = "field checkbox";
  mountedInspectorWidgets.push(mountInspectorCheckbox(locked, {
    id: "layer-locked",
    label: () => translate("properties.locked"),
    checked: layer.locked ?? false,
    disabled: layerGuardReason(layer, true) !== null,
    onChange: (checked) => void send(checked ? "lock layer" : "unlock layer", { op: "setLocked", id: layer.id, locked: checked } as Operation),
  }));
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
    const editField = (field: api.EffectField): HTMLElement => {
      const host = document.createElement("span");
      host.className = "effect-input-host";
      const id = `effect-${layer.id}-${index}-${field.name}`;
      mountedInspectorWidgets.push(mountInspectorField(host, {
        id,
        label: `${label.textContent} ${field.name}`,
        value: String(field.value),
        type: field.kind === "color" ? "text" : "number",
        step: field.kind === "number" ? "0.05" : undefined,
        disabled: guarded,
        onMount: (input) => { input.dataset["field"] = field.name; },
        onCommit: (raw) => {
          const value = field.kind === "color" ? raw.trim() : Number(raw);
          if (typeof value === "number" && !Number.isFinite(value)) return;
          if (value === field.value) return;
          setStack(effects.map((one, at) => (at === index ? { ...one, [field.name]: value } : one)));
        },
      }));
      return host;
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

    const actionHost = (className: string, label: string, icon: string, disabled: boolean, onClick: () => void): HTMLElement => {
      const host = document.createElement("span");
      host.style.display = "contents";
      mountedInspectorWidgets.push(mountInspectorButton(host, {
        id: `effect-action-${layer.id}-${index}-${className}`,
        className,
        label,
        title: label,
        icon,
        disabled,
        onClick,
      }));
      return host;
    };
    row.append(
      actionHost("small effect-up", translate("effects.moveUp", { effect: effect.type }), "ph-arrow-up", guarded || index === 0, () => swap(index - 1)),
      actionHost("small effect-down", translate("effects.moveDown", { effect: effect.type }), "ph-arrow-down", guarded || index === effects.length - 1, () => swap(index + 1)),
      actionHost("small effect-remove", translate("effects.remove"), "ph-trash", guarded, () => setStack(effects.filter((_, at) => at !== index))),
    );
    body.append(row);
  }

  const add = document.createElement("div");
  add.className = "effect-add-row";
  let chosenEffect = api.EFFECT_TYPES[0] ?? "brightness";
  const chooser = document.createElement("span");
  mountedInspectorWidgets.push(mountInspectorField(chooser, {
    id: `effect-chooser-${layer.id}`,
    label: () => translate("effects.choose"),
    value: chosenEffect,
    className: "effect-chooser",
    disabled: guarded,
    options: api.EFFECT_TYPES.map((type) => ({ value: type, label: type.replace(/([A-Z])/g, " $1").replace(/^./, (one) => one.toUpperCase()) })),
    onCommit: (value) => { chosenEffect = value as typeof chosenEffect; },
  }));
  const addButton = document.createElement("span");
  addButton.style.display = "contents";
  mountedInspectorWidgets.push(mountInspectorButton(addButton, {
    id: `effect-add-${layer.id}`,
    className: "effect-add",
    icon: "ph-plus",
    label: () => translate("effects.add"),
    disabled: guarded,
    onClick: () => {
      const current = dom.advancedInspector.querySelector<HTMLSelectElement>(`.effect-chooser`);
      if (current) chosenEffect = current.value as typeof chosenEffect;
      setStack([...effects, api.newEffect(chosenEffect)]);
    },
  }));
  add.append(chooser, addButton);
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

    const apply = document.createElement("span");
    apply.style.display = "contents";
    mountedInspectorWidgets.push(mountInspectorButton(apply, {
      id: `preset-apply-${++nextInspectorControlId}`,
      label: () => translate("common.apply"),
      className: "small",
      disabled: guarded,
      onClick: () => void send(`apply ${preset.name}`, {
        op: "applyPreset",
        id: layer.id,
        preset: preset.name,
      } as Operation),
    }));
    row.append(apply);

    const remove = document.createElement("span");
    remove.style.display = "contents";
    mountedInspectorWidgets.push(mountInspectorButton(remove, {
      id: `preset-remove-${++nextInspectorControlId}`,
      label: () => translate("common.delete"),
      className: "small",
      onClick: () => void send(`delete ${preset.name}`, {
        op: "deletePreset",
        name: preset.name,
      } as Operation),
    }));
    row.append(remove);
    body.append(row);
  }

  const save = document.createElement("div");
  save.className = "inspector-add-row";
  const button = document.createElement("span");
  button.style.display = "contents";
  mountedInspectorWidgets.push(mountInspectorButton(button, {
    id: `preset-save-${++nextInspectorControlId}`,
    label: () => translate("presets.saveStyle"),
    onClick: () => {
    requestName("presets.saveTitle", "presets.name", "presets.saveButton", (name) => {
      void send(`define ${name}`, {
        op: "definePreset",
        preset: { name, properties: api.styleOf(layer) },
      } as Operation);
    });
  },
  }));
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
    const edit = document.createElement("span");
    edit.style.display = "contents";
    mountedInspectorWidgets.push(mountInspectorButton(edit, {
      id: `slot-edit-${++nextInspectorControlId}`,
      label: () => translate("common.edit"),
      className: "small slot-edit",
      title: () => translate("slots.editHint", { name: slot.name }),
      onMount(button) {
        button.dataset["slot"] = slot.name;
        button.dataset["slotName"] = slot.name;
      },
      onClick: () => beginSlotEdit(row, slot),
    }));
    row.append(edit);

    const remove = document.createElement("span");
    remove.style.display = "contents";
    mountedInspectorWidgets.push(mountInspectorButton(remove, {
      id: `slot-remove-${++nextInspectorControlId}`,
      label: () => translate("common.remove"),
      className: "small",
      onClick: () => void send(`remove slot ${slot.name}`, {
        op: "removeSlot",
        name: slot.name,
      } as Operation),
    }));
    row.append(remove);
    body.append(row);
  }

  const buttons = document.createElement("div");
  buttons.className = "inspector-add-row";
  // A text layer cannot be an image slot and vice versa; the engine refuses
  // either way, but offering the wrong one is a form that invites a refusal.
  let selectedKind = layer.type === "image" ? "image" : "text";
  const kind = document.createElement("span");
  kind.style.display = "contents";
  mountedInspectorWidgets.push(mountInspectorField(kind, {
    id: `slot-kind-${++nextInspectorControlId}`,
    label: () => translate("slots.kind"),
    value: selectedKind,
    className: "slot-kind-select",
    options: ["text", "image", "color"].map((value) => ({ value, label: value })),
    onCommit: (next) => { selectedKind = next; },
  }));
  const offer = document.createElement("span");
  offer.style.display = "contents";
  mountedInspectorWidgets.push(mountInspectorButton(offer, {
    id: `slot-offer-${++nextInspectorControlId}`,
    label: () => translate("slots.offer"),
    onClick: () => {
    requestName("slots.createTitle", "slots.name", "slots.createButton", (name) => {
      void send(`offer ${name}`, {
        op: "defineSlot",
        slot: { name, layer: layer.id, kind: selectedKind },
      } as Operation);
    });
  },
  }));
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
  const nameHost = document.createElement("span");
  const kindHost = document.createElement("span");
  const layerHost = document.createElement("span");
  const saveHost = document.createElement("span");
  const cancelHost = document.createElement("span");
  for (const host of [nameHost, kindHost, layerHost, saveHost, cancelHost]) host.style.display = "contents";
  row.append(nameHost, kindHost, layerHost, saveHost, cancelHost);
  const id = ++nextInspectorControlId;
  mountedInspectorWidgets.push(mountInspectorField(nameHost, {
    id: `slot-edit-name-${id}`,
    label: () => translate("slots.name"),
    value: slot.name,
    className: "slot-edit-name",
    onCommit: () => undefined,
  }));
  mountedInspectorWidgets.push(mountInspectorField(kindHost, {
    id: `slot-edit-kind-${id}`,
    label: () => translate("slots.kind"),
    value: slot.kind ?? "text",
    className: "slot-edit-kind",
    options: ["text", "image", "color"].map((value) => ({ value, label: value })),
    onCommit: () => undefined,
  }));
  mountedInspectorWidgets.push(mountInspectorField(layerHost, {
    id: `slot-edit-layer-${id}`,
    label: () => translate("slots.layerId"),
    title: () => translate("slots.layerIdHint"),
    value: slot.layer,
    className: "slot-edit-layer",
    onCommit: () => undefined,
  }));
  const finish = (commit: boolean): void => {
    if (!commit) {
      drawInspector();
      return;
    }
    const nextName = row.querySelector<HTMLInputElement>(".slot-edit-name")?.value.trim() ?? "";
    if (!nextName) return;
    void send(`update slot ${slot.name}`, {
      op: "updateSlot",
      name: slot.name,
      slot: {
        name: nextName,
        layer: row.querySelector<HTMLInputElement>(".slot-edit-layer")?.value.trim() || slot.layer,
        kind: row.querySelector<HTMLSelectElement>(".slot-edit-kind")?.value ?? slot.kind ?? "text",
        description: slot.description,
        required: slot.required ?? false,
      },
    } as Operation);
  };
  mountedInspectorWidgets.push(mountInspectorButton(saveHost, {
    id: `slot-edit-save-${id}`,
    label: () => translate("common.save"),
    className: "small slot-edit-save",
    onClick: () => finish(true),
  }));
  mountedInspectorWidgets.push(mountInspectorButton(cancelHost, {
    id: `slot-edit-cancel-${id}`,
    label: () => translate("common.cancel"),
    className: "small",
    onClick: () => finish(false),
  }));
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
  row.querySelector<HTMLInputElement>(".slot-edit-name")?.focus();
}

/** Draws the journal when it is still the newest one requested. */
let historySequence = 0;
async function drawHistory(): Promise<void> {
  if (!state.project) return;
  const sequence = ++historySequence;
  const history = await api.getHistory(state.project);
  if (sequence !== historySequence) return;
  historySnapshot = { entries: history.entries, position: history.position, head: history.head };
  drawLayers();
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
    // Geometry changes the canvas handles immediately. Rebuild the inspector
    // once, from the authoritative response, so controls do not delay dispatch.
    drawOverlay();
    if (positionPopoverIsOpen()) renderPositionFields(selectedLayers());
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
      // The prediction was refused: the painted pixels say a state the
      // server never accepted, so they go before anything redraws.
      unmountDragPreview();
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
      // The response carries the document when the server offers it: the
      // read-after-write round trip disappears, and the version the next
      // queued action sends is the one this write produced.
      if (result.document) applyDocument(result.document);
      else await refresh();
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
      if (result.document) applyDocument(result.document);
      else await refresh();
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
  if (!adoptPaintedPreview(state.drag)) {
    // Pixels an earlier commit painted, depicting a version the document has
    // left, are wrong from this drag's first pixel: take them down rather
    // than drag from a lie.
    if (paintedPreviewVersion !== null) unmountDragPreview();
    mountDragPreview(state.drag);
    const cache = dragPreviewCache;
    if (!state.drag.previewActive && cache) {
      void cache.pending.then(() => {
        if (state.drag && dragPreviewCache === cache) mountDragPreview(state.drag);
      });
    }
  }
  (event.target as Element).setPointerCapture?.(event.pointerId);
}

/**
 * Continues a drag from pixels an earlier commit painted, when they depict
 * the document as it is now. The painted selection image stays where the
 * commit left it, and the drag moves it from there — the layer never jumps
 * back to where the canvas image, still an older render, shows it.
 *
 * Only a move adopts. A resize or a rotate repaints its pixels through a
 * different transform, which the painted image cannot be re-anchored into.
 */
function adoptPaintedPreview(drag: NonNullable<State["drag"]>): boolean {
  if (
    drag.mode !== "move" ||
    !state.document ||
    paintedPreviewOrigin === null ||
    paintedPreviewVersion !== api.versionOf(state.document)
  ) return false;
  drag.adoptedDelta = paintedPreviewOrigin;
  drag.previewActive = true;
  updateDragPreview(drag, drag.lastDelta?.x ?? 0, drag.lastDelta?.y ?? 0);
  return true;
}

function dragPreviewKey(ids: readonly string[]): string | null {
  if (!state.project || !state.document) return null;
  return `${state.project}:${api.versionOf(state.document)}:${[...ids].sort().join(",")}`;
}

/**
 * Drops the cached pair. URLs a painted preview is showing stay alive until
 * that preview is unmounted — replacing the cache never takes the pixels
 * the page is looking at out from under it.
 */
function retireDragPreviewCache(): void {
  const cache = dragPreviewCache;
  dragPreviewCache = null;
  if (!cache) return;
  if (cache.baseUrl && !paintedPreviewUrls.includes(cache.baseUrl)) {
    URL.revokeObjectURL(cache.baseUrl);
  }
  if (cache.selectionUrl && !paintedPreviewUrls.includes(cache.selectionUrl)) {
    URL.revokeObjectURL(cache.selectionUrl);
  }
}

async function prepareDragPreview(ids: readonly string[]): Promise<void> {
  const key = dragPreviewKey(ids);
  if (!key || !state.project || !state.document) return;
  if (dragPreviewCache?.key === key) return dragPreviewCache.pending;
  retireDragPreviewCache();

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
  // The images hold these URLs from here on; unmounting is what revokes
  // them, whenever that happens — this drag, the next render's hand-off, or
  // a refusal taking the prediction back.
  paintedPreviewUrls = [cache.baseUrl, cache.selectionUrl];
  drag.previewActive = true;
  updateDragPreview(drag, drag.lastDelta?.x ?? 0, drag.lastDelta?.y ?? 0);
}

function unmountDragPreview(): void {
  document.getElementById("drag-preview-base")?.remove();
  document.getElementById("drag-preview-selection")?.remove();
  dom.canvasImage.classList.remove("drag-preview-hidden");
  for (const url of paintedPreviewUrls) URL.revokeObjectURL(url);
  paintedPreviewUrls = [];
  paintedPreviewVersion = null;
  paintedPreviewOrigin = null;
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
    // An adopted preview already sits where the last commit left it; the
    // drag moves it from there, not from where the older canvas image shows
    // the layer.
    const originX = drag.adoptedDelta?.x ?? 0;
    const originY = drag.adoptedDelta?.y ?? 0;
    selection.style.transform =
      `translate(${((originX + dx) / canvas.width) * 100}%, ${((originY + dy) / canvas.height) * 100}%)`;
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
    // No edit, so nothing to hand over. Pixels adopted from an earlier
    // commit stay until the render of that version replaces them; taking
    // them down here would flash the older canvas image underneath.
    if (paintedPreviewVersion === null) unmountDragPreview();
    return;
  }
  // The pixels this drag painted become the prediction of the state the
  // batch is about to create. Naming the version it will produce is what
  // lets the render hand-off — and a foreign commit, an undo — tell the
  // prediction and the truth apart.
  paintedPreviewVersion = api.versionOf(state.document!) + 1;
  paintedPreviewOrigin = drag.mode === "move"
    ? {
        x: (drag.adoptedDelta?.x ?? 0) + dx,
        y: (drag.adoptedDelta?.y ?? 0) + dy,
      }
    // A resized or rotated selection repaints through a different
    // transform, so it cannot be re-anchored; it hands over to the render
    // like the rest, but a later drag starts fresh.
    : null;
  if (drag.mode === "move") {
    void sendBatch("move selection", drag.ids.map((id) => ({ op: "move", id, dx, dy } as Operation)));
    return;
  }
  if (drag.mode === "resize") {
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
    void sendBatch("resize selection", operations);
    return;
  }
  const canvasRect = dom.canvas.getBoundingClientRect();
  const centreX = canvasRect.left + ((drag.bounds.x + drag.bounds.width / 2) / state.document!.canvas.width) * canvasRect.width;
  const centreY = canvasRect.top + ((drag.bounds.y + drag.bounds.height / 2) / state.document!.canvas.height) * canvasRect.height;
  const start = Math.atan2(drag.startY - centreY, drag.startX - centreX);
  const current = Math.atan2(event.clientY - centreY, event.clientX - centreX);
  const delta = ((current - start) * 180) / Math.PI;
  void sendBatch(
    "rotate selection",
    drag.origins.map((origin) => ({
      op: "rotate",
      id: origin.id,
      degrees: Math.round((origin.rotation + delta) * 10) / 10,
    } as Operation)),
  );
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
  // This runs on every pointermove of a drag, so the layer tree is walked
  // once here and every lookup below reads that one pass.
  const flat = api.flatten(api.layersOf(state.document));
  // A single selection's handle DOM is its local box plus CSS rotation. Use
  // its actual canvas extents for snapping while leaving that DOM geometry
  // untouched. Multi-selection bounds already contain rotated extents.
  let snappingBounds = bounds;
  if (ids.length === 1) {
    const one = flat.find(({ layer }) => layer.id === ids[0]);
    const offset = one ? ancestorOffset(flat, one.parent) : null;
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
  const fit = fitZoomScale();
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

function viewportCentre(): { x: number; y: number } {
  const rect = dom.stageViewport.getBoundingClientRect();
  return {
    x: rect.left + dom.stageViewport.clientLeft + dom.stageViewport.clientWidth / 2,
    y: rect.top + dom.stageViewport.clientTop + dom.stageViewport.clientHeight / 2,
  };
}

/** Change zoom while keeping the document point under the anchor in place. */
function setZoom(next: number | null, anchor = viewportCentre()): void {
  const before = dom.canvas.getBoundingClientRect();
  const fractionX = before.width > 0 ? (anchor.x - before.left) / before.width : 0.5;
  const fractionY = before.height > 0 ? (anchor.y - before.top) / before.height : 0.5;
  state.zoom = next === null ? null : Math.min(4, Math.max(0.1, next));
  applyZoom();
  requestPreviewIfScaleChanged();
  if (state.zoom === null) {
    dom.stageViewport.scrollLeft = 0;
    dom.stageViewport.scrollTop = 0;
    return;
  }
  if (before.width <= 0 || before.height <= 0) return;

  const after = dom.canvas.getBoundingClientRect();
  dom.stageViewport.scrollLeft += after.left + fractionX * after.width - anchor.x;
  dom.stageViewport.scrollTop += after.top + fractionY * after.height - anchor.y;
}

function beginInlineTextEdit(layer: Extract<Layer, { type: "text" }>): void {
  if (!state.document || !editableLayer(layer)) return;
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
  textarea.style.color = solidColour(layer.color) ?? "#000000";
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
  batchMantinePortals(() => renderPositionFieldsContent(layers));
}

function renderPositionFieldsContent(layers: Layer[]): void {
  for (const unmount of mountedPositionWidgets) unmount();
  mountedPositionWidgets = [];
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
    const unmount = mountInspectorField(dom.positionFields, {
      id: `position-${property}`,
      label,
      type: "number",
      value: String(Math.round(value * 10) / 10),
      className: "position-field-input",
      disabled: layers.some((layer) => !editableLayer(layer)) || (property === "rotation" && layers.length > 1),
      onCommit: async (raw) => {
      const next = Number(raw);
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
    },
    });
    mountedPositionWidgets.push(unmount);
  }
}

let mountedPositionWidgets: Array<() => void> = [];

function togglePositionPopover(force?: boolean): void {
  const open = force ?? !positionPopoverIsOpen();
  setPositionPopoverOpen(open);
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
  if (layers.length === 0 || layers.some((layer) => !editableLayer(layer))) return;
  void sendBatch(label, layers.map((layer) => ({ op: "delete", id: layer.id } as Operation)));
}

function moveLayerOrder(where: "front" | "forward" | "backward" | "back"): void {
  if (!state.document || state.selection.length !== 1) return;
  const id = state.selection[0];
  const flat = api.flatten(api.layersOf(state.document));
  const found = flat.find(({ layer }) => layer.id === id);
  if (!found || !editableLayer(found.layer)) return;
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
  const layers = selectedLayers();
  const editable = layers.length > 0 && layers.every(editableLayer);
  const one = layers.length === 1 ? layers[0] : null;
  const items: ContextMenuItem[] = [];
  const add = (labelKey: MessageKey, icon: string, run: () => void, disabled = false): void => {
    items.push({ kind: "item", key: labelKey, icon, disabled, run });
  };
  const divider = (): void => { items.push({ kind: "separator" }); };
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
  }, !one || layerGuardReason(one, true) !== null);
  add(one?.visible === false ? "context.show" : "context.hide", one?.visible === false ? "ph-eye" : "ph-eye-slash", () => {
    if (one) void send(one.visible === false ? "show layer" : "hide layer", { op: "setVisible", id: one.id, visible: one.visible === false } as Operation);
  }, !one || !editable);
  add("context.rename", "ph-pencil-simple", () => {
    if (!one) return;
    showDock("layers");
    const row = dom.layers.querySelector<HTMLElement>(`[data-id="${CSS.escape(one.id)}"]`);
    if (row) {
      row.focus();
      row.dispatchEvent(new KeyboardEvent("keydown", { key: "F2", bubbles: true }));
    }
  }, !one || !editable);
  divider();
  add("context.alignLeft", "ph-align-left-simple", () => alignFromContextMenu("left"), !editable);
  add("context.alignHorizontalCenters", "ph-align-center-horizontal", () => alignFromContextMenu("centerHorizontal"), !editable);
  add("context.alignRight", "ph-align-right-simple", () => alignFromContextMenu("right"), !editable);
  add("context.alignTop", "ph-align-top-simple", () => alignFromContextMenu("top"), !editable);
  add("context.alignVerticalMiddles", "ph-align-center-vertical", () => alignFromContextMenu("centerVertical"), !editable);
  add("context.alignBottom", "ph-align-bottom-simple", () => alignFromContextMenu("bottom"), !editable);
  add("context.distributeHorizontally", "ph-columns", () => void send("distribute horizontally", { op: "distribute", ids: layers.map((layer) => layer.id), axis: "horizontal" } as Operation), !editable || layers.length < 3);
  add("context.distributeVertically", "ph-rows", () => void send("distribute vertically", { op: "distribute", ids: layers.map((layer) => layer.id), axis: "vertical" } as Operation), !editable || layers.length < 3);
  contextMenuController.open(items, x, y);
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

// --- wiring ------------------------------------------------------------------

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
    projectPicker.setCurrentProject(project);
    state.selection = [];
    // Painted pixels belong to the project they were painted in. A version
    // number alone cannot vouch for them across an open.
    unmountDragPreview();
    retireDragPreviewCache();
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

dom.newProject.addEventListener("click", () => projectCreator.open());

dom.emptyCreate.addEventListener("click", () => dom.newProject.click());
dom.agents.addEventListener("click", () => void agents.open());

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
  templates.setOpen(false);
  const panelKey = addSections.find(([sectionId]) => sectionId === id)?.[1] ?? "toolbar.textButton";
  dom.addPanelTitle.dataset["i18n"] = panelKey;
  dom.addPanelTitle.textContent = translate(panelKey);
  for (const [sectionId] of addSections) {
    const section = document.getElementById(sectionId);
    if (section) section.hidden = sectionId !== id;
  }
  const templateMode = id === "add-template-section";
  templates.setOpen(templateMode && templates.isVisible());
  dom.openTemplates.hidden = templateMode && templates.isVisible();
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

setAssetUploadHandler((file) => addAssetFile(file,
  file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg") ? "svg" : "image"));

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

function showDock(view: "properties" | "layers" | "history"): void {
  activeDock = view;
  drawLayers();
}

dom.historyShortcut.addEventListener("click", () => showDock("history"));
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
  templates.setOpen(false);
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
  if (positionPopoverIsOpen() && !dom.positionPopover.contains(target) && !dom.inspector.contains(target)) {
    togglePositionPopover(false);
  }
  if (contextMenuController.isOpen() && !dom.contextMenu.contains(target)) contextMenuController.close();
});

dom.openTemplates.addEventListener("click", () => {
  if (!templates.isVisible()) {
    say(translate("editor.noSlotsHint"));
    closeAddPanel();
    showDock("properties");
    if (window.matchMedia("(max-width: 1024px)").matches) {
      dom.structure.classList.add("mobile-open");
      dom.dockToggle.setAttribute("aria-expanded", "true");
    }
    return;
  }
  templates.setOpen(true);
  dom.openTemplates.hidden = true;
  dom.templatesPanel.scrollIntoView({ block: "nearest" });
});

dom.templatesClose.addEventListener("click", () => {
  templates.setOpen(false);
  dom.openTemplates.hidden = false;
});

dom.zoomOut.addEventListener("click", () => setZoom(currentZoomScale() / 1.2));
dom.zoomIn.addEventListener("click", () => setZoom(currentZoomScale() * 1.2));
dom.zoomValue.addEventListener("click", () => setZoom(null));
dom.zoom100.addEventListener("click", () => setZoom(1));
dom.stageViewport.addEventListener("wheel", (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();
  const delta = event.deltaMode === WheelEvent.DOM_DELTA_LINE
    ? event.deltaY * 16
    : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
      ? event.deltaY * dom.stageViewport.clientHeight
      : event.deltaY;
  const factor = Math.exp((-delta * Math.log(1.1)) / 100);
  setZoom(currentZoomScale() * factor, { x: event.clientX, y: event.clientY });
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
  requestPreviewIfScaleChanged();
  syncResponsivePanels();
});
const stageResizeObserver = new ResizeObserver(() => {
  if (state.zoom === null) applyZoom();
  requestPreviewIfScaleChanged();
});
stageResizeObserver.observe(dom.stageViewport);
syncResponsivePanels();

let spacePressed = false;
let finishActivePan: (() => void) | null = null;
window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spacePressed = false;
    dom.stageViewport.classList.remove("pan-ready");
  }
});
window.addEventListener("blur", () => {
  spacePressed = false;
  dom.stageViewport.classList.remove("pan-ready");
  finishActivePan?.();
});
dom.stageViewport.addEventListener("pointerdown", (event) => {
  if (event.button !== 1 && !(spacePressed && event.button === 0)) return;
  event.preventDefault();
  event.stopPropagation();
  finishActivePan?.();
  const start = { x: event.clientX, y: event.clientY };
  const scroll = { x: dom.stageViewport.scrollLeft, y: dom.stageViewport.scrollTop };
  dom.stageViewport.classList.add("panning");
  const move = (next: PointerEvent): void => {
    if (next.pointerId !== event.pointerId) return;
    dom.stageViewport.scrollLeft = scroll.x - (next.clientX - start.x);
    dom.stageViewport.scrollTop = scroll.y - (next.clientY - start.y);
  };
  const finish = (): void => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", finishPointer);
    window.removeEventListener("pointercancel", finishPointer);
    window.removeEventListener("blur", finish);
    dom.stageViewport.classList.remove("panning");
    if (finishActivePan === finish) finishActivePan = null;
  };
  const finishPointer = (next: PointerEvent): void => {
    if (next.pointerId === event.pointerId) finish();
  };
  finishActivePan = finish;
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", finishPointer);
  window.addEventListener("pointercancel", finishPointer);
  window.addEventListener("blur", finish, { once: true });
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
    if (selectedLayers().every(editableLayer) && copySelection()) deleteSelection("cut layers");
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
    if (layers.length && layers.every(editableLayer)) {
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
    } else if (layers.length > 1 && layers.every(editableLayer)) {
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
    if (contextMenuController.isOpen()) {
      contextMenuController.close();
      dom.canvas.focus();
      return;
    }
    // A open Settings modal closes first and alone: clearing the selection or
    // a popover behind it is not something closing a dialog should do.
    if (settings.isOpen()) {
      settings.close();
      return;
    }
    if (!dom.addPanel.classList.contains("collapsed")) {
      event.preventDefault();
      closeAddPanel();
      return;
    }
    state.selection = [];
    contextMenuController.close();
    togglePositionPopover(false);
    drawLayers();
    drawOverlay();
    drawInspector();
    return;
  }

  const layer = selectedLayer();
  const layers = selectedLayers();
  if ((event.key === "Enter" || event.key === "F2") && layer?.type === "text" && editableLayer(layer)) {
    event.preventDefault();
    beginInlineTextEdit(layer);
    return;
  }
  if (layers.length === 0 || layers.some((one) => !editableLayer(one))) return;

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
  setDocumentDimensions(null);
  dom.canvas.hidden = true;
  dom.canvasControlsRoot.hidden = true;
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
  if (settings.isOpen()) settings.close();
  renameProjectFlow(current, state.document?.name ?? null);
});
dom.deleteProject.addEventListener("click", () => {
  const current = state.project;
  if (!current) return;
  if (settings.isOpen()) settings.close();
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
    state.project = select;
    projectPicker.setCurrentProject(select);
    await openProject();
  }
  await drawRecents();
}

/** Updates the visible project list from the latest API response. */
function fillProjectOptions(projects: readonly api.ProjectSummary[], query: string): void {
  listedProjects = projectListKey(projects);
  projectPicker.setProjects(projects, query, state.project);
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
    setAgentCount(count);
  } catch (error) {
    // A server without the endpoint (an older one, or one this page was not
    // served by) is not worth asking again.
    if (error instanceof api.ApiError && error.code.startsWith("http4")) {
      agentsConnectedKnown = false;
      setAgentCount(null);
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
    if (projectListKey(projects) !== listedProjects && document.activeElement !== document.getElementById("project-search")) {
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
let recentSequence = 0;

/**
 * The most recently modified projects, as thumbnails.
 *
 * Answered from the engine's cache, which is the only reason "most recent"
 * can be answered without opening every document to read a timestamp.
 */
async function drawRecents(): Promise<void> {
  const sequence = ++recentSequence;
  for (const url of recentThumbnails) URL.revokeObjectURL(url);
  recentThumbnails = [];

  const projects = await api.recentProjects(8);
  if (sequence !== recentSequence) return;
  // One project is not a list of recents, it is the project you have open.
  const cards = await Promise.all(projects.map(async (project) => {
    // Fetched rather than pointed at: an <img src> cannot carry the access
    // token, and the token must never go in a URL.
    try {
      return { project, thumbnail: await api.imageObjectUrl(api.thumbnailUrl(project.id)) };
    } catch {
      // A project that will not render still belongs in the list.
      return { project, thumbnail: null };
    }
  }));
  if (sequence !== recentSequence) {
    for (const { thumbnail } of cards) if (thumbnail) URL.revokeObjectURL(thumbnail);
    return;
  }
  recentThumbnails = cards.flatMap(({ thumbnail }) => thumbnail ? [thumbnail] : []);
  mountRecentProjects(
    dom.recents,
    cards,
    (id) => openFromQueue(id),
    (id, name) => renameProjectFlow(id, name),
    (id, name) => deleteProjectFlow(id, name),
  );
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
