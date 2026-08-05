// The one way this interface talks to the engine.
//
// Every mutation goes through `POST /api/projects/{id}/operations` with an
// Operation — the same value the CLI builds and the MCP server sends. The UI
// has no second idea of what a document is, and no code path that edits one
// locally and syncs later (PRD §7.2).

import type { Document } from "../../schema/document.js";
import type { Operation } from "../../schema/operation.js";

export type { Document, Operation };

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
  const response = await fetch(path, init);
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
