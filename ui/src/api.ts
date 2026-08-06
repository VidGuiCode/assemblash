// The one way this interface talks to the engine.
//
// Every mutation goes through `POST /api/projects/{id}/operations` with an
// Operation — the same value the CLI builds and the MCP server sends. The UI
// has no second idea of what a document is, and no code path that edits one
// locally and syncs later (PRD §7.2).

import type { Document, Slot } from "../../schema/document.js";
import type { Operation } from "../../schema/operation.js";
import { goToLogin, withToken } from "./token.js";

export type { Document, Operation, Slot };

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

export async function listProjects(): Promise<ProjectSummary[]> {
  const body = await request<{ projects: ProjectSummary[] }>("/api/projects");
  return body.projects;
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
): Promise<{ asset: { id: string }; version: number }> {
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
  return (await response.json()) as { asset: { id: string }; version: number };
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
] as const;

/** The one number worth editing for an effect, and what it is called. */
export function effectParameter(
  effect: Effect,
): { name: string; value: number } | null {
  const named = (name: string): { name: string; value: number } | null => {
    const value = effect[name];
    return typeof value === "number" ? { name, value } : null;
  };
  switch (effect.type) {
    case "brightness":
    case "contrast":
    case "saturation":
    case "grain":
      return named("amount");
    case "blur":
      return named("radius");
    default:
      // An effect this build does not know is shown but not edited: changing
      // a number in something we cannot draw would be guessing.
      return null;
  }
}

/**
 * A new effect of the given type, at its neutral value.
 *
 * Neutral rather than "a nice default": adding an effect should change
 * nothing until a number is typed, so the picture never moves under someone
 * who was only exploring the menu. Grain's seed is fixed rather than random
 * for the same reason the engine takes one at all — the same document must
 * produce the same noise.
 */
export function newEffect(type: string): Effect {
  switch (type) {
    case "blur":
      return { type: "blur", radius: 0 } as Effect;
    case "grain":
      return { type: "grain", amount: 0, seed: 1, scale: 1 } as Effect;
    default:
      return { type, amount: 1 } as Effect;
  }
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

export async function fonts(): Promise<string[]> {
  const body = await request<{ families: string[] }>("/api/fonts");
  return body.families;
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
  const response = await fetch(url, { headers: withToken() });
  if (response.status === 401) {
    goToLogin();
    throw new ApiError("unauthorized", "this server needs an access token", null);
  }
  if (!response.ok) {
    throw new ApiError(`http${response.status}`, response.statusText, null);
  }
  return URL.createObjectURL(await response.blob());
}

/**
 * Where the rendered PNG lives.
 *
 * This is what the canvas shows, and it is byte-for-byte what `export` writes
 * at the same scale — the preview and the export cannot disagree because they
 * are the same render (PRD §16.3, R3).
 */
export function pngUrl(project: string, version: number, scale = 1): string {
  return `/api/projects/${encodeURIComponent(project)}/preview.png?scale=${scale}&v=${version}`;
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
