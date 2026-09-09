// The one way this interface talks to the engine.
//
// Every mutation goes through `POST /api/projects/{id}/operations` with an
// Operation — the same value the CLI builds and the MCP server sends. The UI
// has no second idea of what a document is, and no code path that edits one
// locally and syncs later (PRD §7.2).

import type { Asset, Document, ImageFit, Slot } from "../../schema/document.js";
import type { Operation } from "../../schema/operation.js";
import { goToLogin, withToken } from "./token.js";

export type { Asset, Document, ImageFit, Operation, Slot };

/** A layer, as the document model defines it.
 *
 * `layers` has a default in the schema, so the generated type makes it
 * optional. Unwrapping it here means the rest of the interface can say
 * `Layer` and mean it. */
export type Layer = NonNullable<Document["layers"]>[number];

/** The layers of a document, with the schema's default applied. */
export function layersOf(document: Document): readonly Layer[] {
  return document.layers ?? [];
}

/** A document's version, with the schema's default applied. */
export function versionOf(document: Document): number {
  return document.version ?? 0;
}

/** One project in the workspace listing. */
export interface ProjectSummary {
  id: string;
  name?: string | null;
  documentId: string;
  version: number;
  layers: number;
  /**
   * Present only on the first summary fetched after the server automatically
   * cleared a stale lock on this project — the process that held it was
   * gone, so nobody had to recover it by hand. The server drains this on
   * read, so a second fetch never sees it again for the same reclaim.
   */
  reclaimedLock?: { pid: number; host: string; at: number };
}

/** What an operation did. */
export interface OperationResult {
  version: number;
  dryRun: boolean;
  transaction?: string;
  created?: string[];
  changed?: string[];
  removed?: string[];
}

export type OperationBatchCommand = Operation | {
  op: "insertLayerTree";
  sourceProject: string;
  layers: Layer[];
  position?: { at: "root"; index?: number } | { at: "in"; parent: string; index?: number };
  offsetX?: number;
  offsetY?: number;
};

export interface OperationBatchResult extends Omit<OperationResult, "dryRun" | "transaction"> {
  transactionId: string;
}

/** One entry of a project's journal. */
export interface HistoryEntry {
  transaction: string;
  position: number;
  actor: { kind: string; detail?: string | null };
  recordedAt?: number | null;
  kind: string;
}

/** The engine's answer when something is refused. */
export class ApiError extends Error {
  readonly code: string;
  readonly details: unknown;

  constructor(code: string, message: string, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: withToken(init?.headers),
  });
  if (response.status === 401) {
    // The token is missing, wrong, or the server was restarted with a new
    // one. Asking again is the only thing that helps, and continuing would
    // leave every control broken with no explanation.
    goToLogin();
    throw new ApiError("unauthorized", "this server needs an access token", null);
  }
  if (!response.ok) {
    // Every failure comes back in one envelope with a stable code, so this is
    // the only place that has to know what a refusal looks like.
    let code = `http${response.status}`;
    let message = response.statusText;
    let details: unknown = null;
    try {
      const body = await response.json();
      if (body?.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
        details = body.error.details ?? null;
      }
    } catch {
      // A response that is not the envelope is still a failure; keep the
      // status as the code rather than inventing one.
    }
    throw new ApiError(code, message, details);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

/**
 * The workspace's projects, optionally filtered.
 *
 * The filtering happens in the engine, against its cache, because a workspace
 * of two hundred projects should not have to be sent to the page in full for
 * the page to look through it.
 */
export async function listProjects(query = "", limit = 200): Promise<ProjectSummary[]> {
  const parameters = new URLSearchParams({ limit: String(limit) });
  if (query) parameters.set("query", query);
  const body = await request<{ projects: ProjectSummary[] }>(
    `/api/projects?${parameters.toString()}`,
  );
  return body.projects;
}

/** The most recently modified projects, newest first. */
export async function recentProjects(limit = 8): Promise<ProjectSummary[]> {
  const body = await request<{ projects: ProjectSummary[] }>(
    `/api/projects/recent?limit=${limit}`,
  );
  return body.projects;
}

/** One project's summary, fetched fresh by id. */
export async function projectSummary(project: string): Promise<ProjectSummary> {
  return request<ProjectSummary>(`/api/projects/${encodeURIComponent(project)}`);
}

/** Where a project's small preview lives. Cached by the engine, not the page. */
export function thumbnailUrl(project: string): string {
  return `/api/projects/${encodeURIComponent(project)}/thumbnail.png`;
}

export async function createProject(
  id: string,
  width: number,
  height: number,
  background: string | null,
  name: string | null,
): Promise<ProjectSummary> {
  return request<ProjectSummary>("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, width, height, background, name }),
  });
}

export async function getDocument(project: string): Promise<Document> {
  return request<Document>(`/api/projects/${encodeURIComponent(project)}/document`);
}

/** Remove only the stale lock claim that the server just reported. */
export async function recoverProjectLock(project: string, expectedPid: number): Promise<boolean> {
  const result = await request<{ unlocked: boolean }>(
    `/api/projects/${encodeURIComponent(project)}/recover-lock`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ expectedPid }),
    },
  );
  return result.unlocked;
}

export async function getHistory(
  project: string,
): Promise<{ position: number; head: number; entries: HistoryEntry[] }> {
  return request(`/api/projects/${encodeURIComponent(project)}/history`);
}

export async function validate(
  project: string,
): Promise<{ valid: boolean; errors: string[] }> {
  return request(`/api/projects/${encodeURIComponent(project)}/validate`);
}

/**
 * Applies one operation.
 *
 * `expectedVersion` is the version the UI last read. Passing it is how two
 * people — or a person and an agent — editing the same project get a
 * structured refusal instead of one silently overwriting the other.
 */
export async function applyOperation(
  project: string,
  operation: Operation,
  expectedVersion: number | null,
  dryRun = false,
): Promise<OperationResult> {
  return request<OperationResult>(
    `/api/projects/${encodeURIComponent(project)}/operations`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        operation,
        expectedVersion,
        dryRun,
        actor: { kind: "human", name: "reference UI" },
      }),
    },
  );
}

/** Applies existing operations as one atomic, one-undo UI command. */
export async function applyOperationBatch(
  project: string,
  label: string,
  commands: OperationBatchCommand[],
  expectedVersion: number,
): Promise<OperationBatchResult> {
  return request<OperationBatchResult>(
    `/api/projects/${encodeURIComponent(project)}/operation-batches`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        expectedVersion,
        label,
        commands,
        actor: { kind: "human", name: "reference UI" },
      }),
    },
  );
}

export async function undo(project: string): Promise<OperationResult> {
  return request<OperationResult>(`/api/projects/${encodeURIComponent(project)}/undo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } }),
  });
}

export async function redo(project: string): Promise<OperationResult> {
  return request<OperationResult>(`/api/projects/${encodeURIComponent(project)}/redo`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } }),
  });
}

export async function exportDocument(
  project: string,
  name: string,
  scale: number,
): Promise<{ path: string; bytes: number; width: number; height: number }> {
  return request(`/api/projects/${encodeURIComponent(project)}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name, scale }),
  });
}

/**
 * Asks the server to stop.
 *
 * Refused unless this server was started for a person — a service manager or a
 * container owns its own lifetime. The button is only offered once this has
 * been shown to work, so nobody is presented with a control that cannot do
 * anything.
 */
export async function shutdown(): Promise<void> {
  await request<{ stopping: boolean }>("/api/shutdown", { method: "POST" });
}

/** What the server is, and what it will let the page do. */
export interface ServerInfo {
  name: string;
  version: string;
  schemaVersion: number;
  /** Whether this server may be stopped from here. */
  canShutdown: boolean;
}

export async function serverInfo(): Promise<ServerInfo> {
  return request<ServerInfo>("/api/version");
}

/**
 * Uploads a file into a project's assets.
 *
 * The client's filename contributes only its extension; the stored name is
 * the content hash, so nothing a person types becomes a path.
 */
export async function uploadAsset(
  project: string,
  file: File,
): Promise<{ asset: Asset; version: number }> {
  const response = await fetch(
    `/api/projects/${encodeURIComponent(project)}/assets?filename=${encodeURIComponent(file.name)}`,
    {
      method: "POST",
      headers: withToken({ "content-type": file.type || "application/octet-stream" }),
      body: file,
    },
  );
  if (response.status === 401) {
    goToLogin();
    throw new ApiError("unauthorized", "this server needs an access token", null);
  }
  if (!response.ok) {
    let code = `http${response.status}`;
    let message = response.statusText;
    try {
      const body = await response.json();
      code = body?.error?.code ?? code;
      message = body?.error?.message ?? message;
    } catch {
      // Not the envelope; the status still says enough.
    }
    throw new ApiError(code, message, null);
  }
  return (await response.json()) as { asset: Asset; version: number };
}

/** The fit modes the engine draws an image or SVG asset with. */
export const IMAGE_FITS = ["fill", "contain", "cover"] as const;

/** The shape kinds this build draws, and what each is called in the panel. */
export const SHAPE_KINDS = ["rect", "ellipse", "line"] as const;

/**
 * The `kind` of a shape layer's geometry, or `null` if there is not one.
 *
 * The generated `ShapeKind` widens to `unknown` in TypeScript, because its
 * catch-all arm carries any JSON a newer build might write. So the kind is
 * read once, defensively, here — rather than asserted at each of the three
 * places that want it — and a shape whose kind this build does not know is
 * simply reported as itself.
 */
export function shapeKindOf(layer: Layer): string | null {
  if (layer.type !== "shape") return null;
  const shape: unknown = layer.shape;
  if (shape && typeof shape === "object" && !Array.isArray(shape)) {
    const kind = (shape as Record<string, unknown>)["kind"];
    if (typeof kind === "string") return kind;
  }
  return null;
}

/** A rect shape's corner radius, with the schema's default applied. */
export function cornerRadiusOf(layer: Layer): number {
  if (layer.type !== "shape") return 0;
  const shape: unknown = layer.shape;
  if (shape && typeof shape === "object") {
    const radius = (shape as Record<string, unknown>)["cornerRadius"];
    if (typeof radius === "number") return radius;
  }
  return 0;
}

/** One effect in a layer's stack, as the document stores it. */
export type Effect = NonNullable<Layer["effects"]>[number] & {
  type: string;
  [key: string]: unknown;
};

/**
 * The blend modes this build renders.
 *
 * Listed here so the inspector cannot offer one the engine would refuse.
 * `color-dodge` and `color-burn` are missing on purpose: they rasterize, but
 * not to the same bytes on every target, and this engine only draws what it
 * can reproduce. A document may still carry either of those, or a mode from a
 * newer build; it is shown as itself rather than replaced.
 */
export const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

/** The effect types this build renders. */
export const EFFECT_TYPES = [
  "brightness",
  "contrast",
  "saturation",
  "blur",
  "grain",
  "dropShadow",
] as const;

/** One editable field of an effect: what it is called, and what it holds. */
export interface EffectField {
  name: string;
  value: number | string;
  /** `number` gets a number input; `color` gets `#rrggbb` or `#rrggbbaa`. */
  kind: "number" | "color";
}

/**
 * The fields worth editing for an effect, in the order they are shown.
 *
 * Most effects have exactly one number; `dropShadow` has four values and no
 * single one of them is "the" parameter, so this returns a list rather than
 * the one number the earlier shape assumed.
 */
export function effectFields(effect: Effect): EffectField[] {
  const number = (name: string): EffectField[] => {
    const value = effect[name];
    return typeof value === "number" ? [{ name, value, kind: "number" }] : [];
  };
  switch (effect.type) {
    case "brightness":
    case "contrast":
    case "saturation":
    case "grain":
      return number("amount");
    case "blur":
      return number("radius");
    case "dropShadow": {
      const colour = effect["color"];
      return [
        ...number("dx"),
        ...number("dy"),
        ...number("blur"),
        // A colour input cannot hold the alpha this effect's default carries
        // (`#00000080`), and silently dropping it would change the picture
        // on the first edit, so the colour is typed as text.
        ...(typeof colour === "string"
          ? [{ name: "color", value: colour, kind: "color" } as EffectField]
          : []),
      ];
    }
    default:
      // An effect this build does not know is shown but not edited: changing
      // a number in something we cannot draw would be guessing.
      return [];
  }
}

/**
 * A new effect of the given type, at its neutral value.
 *
 * Neutral rather than "a nice default": adding an effect should change
 * nothing until a number is typed, so the picture never moves under someone
 * who was only exploring the menu. `dropShadow` is the exception, and says
 * why below. Grain's seed is fixed rather than random
 * for the same reason the engine takes one at all — the same document must
 * produce the same noise.
 */
export function newEffect(type: string): Effect {
  switch (type) {
    case "blur":
      return { type: "blur", radius: 0 } as Effect;
    case "grain":
      return { type: "grain", amount: 0, seed: 1, scale: 1 } as Effect;
    case "dropShadow":
      // The one effect that cannot be neutral: a shadow at dx 0, dy 0, blur 0
      // and full black is an invisible copy of the layer under itself, which
      // looks like the control did nothing. These are the numbers the design
      // contract names, and every one of them is editable in the row.
      return { type: "dropShadow", dx: 4, dy: 4, blur: 6, color: "#00000080" } as Effect;
    default:
      return { type, amount: 1 } as Effect;
  }
}

/** A named opening a caller may fill, as the document stores it. */
export interface SlotSummary {
  name: string;
  layer: string;
  kind?: string;
  description?: string | null;
  required?: boolean;
}

/** A named style bundle, as the document stores it. */
export interface Preset {
  name: string;
  description?: string | null;
  properties: Record<string, unknown>;
}

export async function getPresets(project: string): Promise<Preset[]> {
  const body = await request<{ presets: Preset[] }>(
    `/api/projects/${encodeURIComponent(project)}/presets`,
  );
  return body.presets;
}

/**
 * The style properties of a layer, as a preset would carry them.
 *
 * Used by "save as preset": what is stored is exactly what an update would
 * set, which is why applying it later reproduces this layer's look and not an
 * approximation of it. Position is deliberately absent — a style is not a
 * place.
 */
export function styleOf(layer: Layer): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    opacity: layer.opacity ?? 1,
    blendMode: layer.blendMode ?? "normal",
    effects: layer.effects ?? [],
  };
  if (layer.type === "text") {
    properties["fontFamily"] = layer.fontFamily;
    properties["fontSize"] = layer.fontSize;
    properties["color"] = layer.color ?? "#000000";
    properties["align"] = layer.align ?? "left";
    properties["lineHeight"] = layer.lineHeight ?? 1.2;
  }
  if (layer.type === "shape") {
    // A preset cannot clear a paint, so a shape with no fill contributes no
    // `fill` rather than a null that would mean something the format cannot
    // express. The geometry is not style: a preset saved from a rect applies
    // to an ellipse.
    if (layer.fill) properties["fill"] = layer.fill;
    if (layer.stroke) properties["stroke"] = layer.stroke;
  }
  return properties;
}

/** What a template offers to be filled. */
export interface SlotList {
  isTemplate: boolean;
  slots: Slot[];
}

/** One variant asked for: a file-name stem and the values that make it. */
export interface Variant {
  name: string;
  values: Record<string, string>;
}

/** One variant produced. */
export interface RenderedVariant {
  name: string;
  path: string;
  bytes: number;
  width: number;
  height: number;
  /** `sha256:<hex>` of the PNG — the same hash the CLI prints. */
  hash: string;
}

/** A batch, and the template it came from. */
export interface RenderedVariants {
  template: string;
  templateVersion: number;
  variants: RenderedVariant[];
}

export async function getSlots(project: string): Promise<SlotList> {
  return request<SlotList>(`/api/projects/${encodeURIComponent(project)}/slots`);
}

/**
 * Renders a template once per set of values.
 *
 * The same endpoint the CLI's `assemblash variants` reaches through the same
 * function, so a batch made here and a batch made there produce the same
 * bytes — and therefore the same hashes — for the same values. The template
 * is not modified: each variant is filled on a copy.
 */
export async function renderVariants(
  project: string,
  variants: Variant[],
  scale = 1,
): Promise<RenderedVariants> {
  return request<RenderedVariants>(
    `/api/projects/${encodeURIComponent(project)}/variants`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variants, scale }),
    },
  );
}

/**
 * Where a PNG the engine exported can be read back.
 *
 * A file name, never a path: the server validates the stem with the same rule
 * that produced it, so this cannot address anything the engine did not write.
 */
export function exportUrl(project: string, name: string): string {
  return `/api/projects/${encodeURIComponent(project)}/exports/${encodeURIComponent(name)}.png`;
}

/** One face the font store holds, as the engine records it. */
export interface FontRecord {
  family: string;
  style: string;
  weight: number;
  file: string;
  hash: string;
  faceIndex: number;
  source?: string;
  license?: string;
}

/** Everything `GET /api/fonts` reports: the families, and the faces behind them. */
export interface FontStoreListing {
  families: string[];
  faces: FontRecord[];
}

/** One family the compiled-in manifest is able to fetch. */
export interface CatalogueFamily {
  family: string;
  license: string;
  bytes: number;
  packs: string[];
}

/** What an install could fetch, and how much of it. Reads no network. */
export interface FontCatalogue {
  packs: Record<string, string[]>;
  families: CatalogueFamily[];
}

/**
 * The family names in the font store.
 *
 * Kept beside `fontFaces` because most of the interface only ever wants the
 * names — the suggestion list, the text presets — and asking for faces to
 * throw them away would put the same map in three places.
 */
export async function fonts(): Promise<string[]> {
  const body = await request<{ families: string[] }>("/api/fonts");
  return body.families;
}

/** The store as the font manager shows it: families, and the faces of each. */
export async function fontFaces(): Promise<FontStoreListing> {
  const body = await request<{ families?: string[]; faces?: FontRecord[] }>("/api/fonts");
  return { families: body.families ?? [], faces: body.faces ?? [] };
}

/**
 * Imports one font file into the workspace's font store.
 *
 * Raw bytes with the client's name in the query, exactly like an asset
 * upload: only the extension of that name is used, and the stored file is
 * named by the hash of its own bytes, so nothing a person types becomes a
 * path. Re-importing bytes the store already has answers `200` rather than
 * refusing, and this returns the same shape either way.
 */
export async function importFont(file: File): Promise<{ imported: FontRecord[]; families: string[] }> {
  return request<{ imported: FontRecord[]; families: string[] }>(
    `/api/fonts?filename=${encodeURIComponent(file.name)}`,
    {
      method: "POST",
      headers: { "content-type": file.type || "application/octet-stream" },
      body: file,
    },
  );
}

/**
 * Removes every face of a family, and the files left unreferenced.
 *
 * A family the store does not have is a refusal, not a silent success: a
 * page that has just shown a Remove button needs to know whether the thing it
 * was pointing at was still there.
 */
export async function removeFontFamily(
  family: string,
): Promise<{ removed: number; families: string[] }> {
  return request<{ removed: number; families: string[] }>(
    `/api/fonts/${encodeURIComponent(family)}`,
    { method: "DELETE" },
  );
}

/** What the install route could fetch, from the server's pinned manifest. */
export async function fontCatalogue(): Promise<FontCatalogue> {
  return request<FontCatalogue>("/api/fonts/catalogue");
}

/**
 * Installs a pack from the pinned manifest.
 *
 * The only call in this interface that makes the server reach the network,
 * and it does so only when it is made. A download whose hash does not match
 * the manifest is refused before the store sees it, so a failed install
 * leaves the store exactly as it was.
 */
export async function installFontPack(
  pack: string,
): Promise<{ installed: FontRecord[]; families: string[] }> {
  return request<{ installed: FontRecord[]; families: string[] }>("/api/fonts/install", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pack }),
  });
}

/**
 * The engine's vector render, for downloading.
 *
 * Not what the canvas shows: a browser would re-render this with its own
 * fonts rather than the pinned files in the font store, and the preview would
 * then differ from the export precisely where determinism matters. The canvas
 * shows the rasterized render; this is here because an SVG is a useful thing
 * to be able to take away.
 */
export function svgUrl(project: string, version: number): string {
  return `/api/projects/${encodeURIComponent(project)}/preview.svg?v=${version}`;
}

/**
 * Fetches an image as a blob URL, carrying the token.
 *
 * An `<img src>` cannot send a header, and putting the token in the query
 * string is exactly what "never in a URL" rules out — it would land in
 * history, in referrers, and in any proxy log on the way. So the bytes are
 * fetched properly and handed to the element as a blob.
 */
export async function imageObjectUrl(url: string): Promise<string> {
  return URL.createObjectURL(await fetchBlob(url));
}

/**
 * The bytes behind a rendered file, carrying the token.
 *
 * Separate from `imageObjectUrl` because a download wants to say how big the
 * file is, and a blob URL has thrown that away by the time it is handed to an
 * anchor.
 */
export async function fetchBlob(url: string): Promise<Blob> {
  const response = await fetch(url, { headers: withToken() });
  if (response.status === 401) {
    goToLogin();
    throw new ApiError("unauthorized", "this server needs an access token", null);
  }
  if (!response.ok) {
    throw new ApiError(`http${response.status}`, response.statusText, null);
  }
  return await response.blob();
}

/**
 * Where the rendered PNG lives.
 *
 * This is what the canvas shows, and it is byte-for-byte what `export` writes
 * at the same scale — the preview and the export cannot disagree because they
 * are the same render (PRD §16.3, R3).
 */
export function pngUrl(
  project: string,
  version: number,
  scale = 1,
  filter?: { only?: readonly string[]; exclude?: readonly string[] },
): string {
  const query = new URLSearchParams({ scale: String(scale), v: String(version) });
  if (filter?.only?.length) query.set("only", filter.only.join(","));
  if (filter?.exclude?.length) query.set("exclude", filter.exclude.join(","));
  return `/api/projects/${encodeURIComponent(project)}/preview.png?${query.toString()}`;
}

/** Exact wrapped text height from the pinned-font renderer. */
export async function textLayout(
  project: string,
  id: string,
  width: number,
): Promise<{ lineCount: number; height: number }> {
  const query = new URLSearchParams({ id, width: String(width) });
  return request<{ lineCount: number; height: number }>(
    `/api/projects/${encodeURIComponent(project)}/text-layout?${query.toString()}`,
  );
}

/** Every layer, flattened, with the group each one sits in. */
export function flatten(
  layers: readonly Layer[],
  parent: string | null = null,
  depth = 0,
  out: Array<{ layer: Layer; parent: string | null; depth: number }> = [],
): Array<{ layer: Layer; parent: string | null; depth: number }> {
  for (const layer of layers) {
    out.push({ layer, parent, depth });
    if (layer.type === "group") {
      flatten(layer.children ?? [], layer.id, depth + 1, out);
    }
  }
  return out;
}

/** Whether the engine will refuse to change this layer. */
export function isEditable(layer: Layer): boolean {
  return !layer.protected && !layer.readOnly && !layer.locked;
}

/** Why it is not editable, for saying so rather than just greying it out. */
export function whyNotEditable(layer: Layer): string | null {
  if (layer.protected) return "protected — no tool can change this layer";
  if (layer.readOnly) return "read-only — inspectable but never mutable";
  if (layer.locked) return "locked — unlock it to make changes";
  return null;
}
