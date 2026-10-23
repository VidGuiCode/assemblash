import type { Color, Operation } from "./api.js";

export type RunObject = Record<string, unknown> & { text: string };
export type RunField = "text" | "fontFamily" | "fontSize" | "fontWeight" | "fontStyle" | "letterSpacing" | "color";
export interface RunsCapture {
  project: string;
  document: string;
  layer: string;
  version: number;
  text: string;
  runs: unknown[];
}
export interface RunsDraft {
  capture: RunsCapture;
  rows: Array<{ key: number; raw: unknown; legacy?: boolean }>;
  error: string;
  pending: boolean;
  reconcile?: boolean;
}
let nextRow = 0;
export function runsKey(capture: Pick<RunsCapture, "project" | "document" | "layer">): string {
  return JSON.stringify([capture.project, capture.document, capture.layer]);
}
export function startRuns(capture: RunsCapture): RunsDraft {
  const matches = capture.runs.every(runObject) && capture.runs.map((run) => run.text).join("") === capture.text;
  return { capture: structuredClone(capture), rows: capture.runs.map((raw) => ({ key: ++nextRow, raw: structuredClone(raw), legacy: !matches || !runObject(raw) })), error: "", pending: false };
}
export function newRun(text = ""): { key: number; raw: RunObject } {
  return { key: ++nextRow, raw: { text } };
}
export function editableRun(row: RunsDraft["rows"][number]): row is { key: number; raw: RunObject } {
  return !row.legacy && !!row.raw && typeof row.raw === "object" && !Array.isArray(row.raw) && typeof (row.raw as RunObject).text === "string";
}
export function runObject(raw: unknown): raw is RunObject {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const row = raw as Record<string, unknown>;
  if (typeof row["text"] !== "string") return false;
  for (const field of ["fontFamily", "fontStyle"] as const) {
    if (row[field] != null && typeof row[field] !== "string") return false;
  }
  if (row["fontStyle"] != null && !["normal", "italic"].includes(String(row["fontStyle"]))) return false;
  for (const field of ["fontSize", "fontWeight", "letterSpacing"] as const) {
    const value = row[field];
    if (value != null && (typeof value !== "number" || !Number.isFinite(value))) return false;
  }
  if (typeof row["fontSize"] === "number" && row["fontSize"] <= 0) return false;
  if (typeof row["fontWeight"] === "number" && (!Number.isInteger(row["fontWeight"]) || row["fontWeight"] < 100 || row["fontWeight"] > 900)) return false;
  const paint = row["color"];
  if (paint != null && !supportedPaint(paint)) return false;
  return true;
}
function supportedPaint(raw: unknown): boolean {
  if (typeof raw === "string") return /^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(raw);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const paint = raw as Record<string, unknown>;
  const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
  if (paint["kind"] === "linear") {
    if (Object.hasOwn(paint, "angle") && !finite(paint["angle"])) return false;
  } else if (paint["kind"] === "radial") {
    if (Object.hasOwn(paint, "radius") && (!finite(paint["radius"]) || paint["radius"] <= 0)) return false;
    if (Object.hasOwn(paint, "center")) {
      const center = paint["center"];
      if (!center || typeof center !== "object" || Array.isArray(center) || !finite((center as Record<string, unknown>)["x"]) || !finite((center as Record<string, unknown>)["y"])) return false;
    }
  } else return false;
  const stops = paint["stops"];
  if (!Array.isArray(stops) || stops.length === 0 || stops.length > 16) return false;
  let previous = -1;
  return stops.every((stop) => {
    if (!stop || typeof stop !== "object" || Array.isArray(stop) || !finite(stop.offset) || stop.offset < 0 || stop.offset > 1 || stop.offset <= previous || typeof stop.color !== "string" || !/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(stop.color)) return false;
    if (Object.hasOwn(stop, "alpha") && (!finite(stop.alpha) || stop.alpha < 0 || stop.alpha > 1)) return false;
    previous = stop.offset;
    return true;
  });
}
/** Patch only the edited field. Inherit removes that field, not other nulls or extras. */
export function patchRun(raw: RunObject, field: RunField, value: unknown): RunObject {
  const next = structuredClone(raw);
  if (value === undefined) delete next[field];
  else (next as Record<string, unknown>)[field] = structuredClone(value);
  return next;
}
function jsonObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function unknownFields(value: Record<string, unknown>, known: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(Object.entries(structuredClone(value)).filter(([field]) => !known.includes(field)));
}
function uniqueStops(stops: unknown[]): Map<number, Record<string, unknown>> {
  const found = new Map<number, Record<string, unknown>>();
  const duplicate = new Set<number>();
  for (const stop of stops) {
    if (!jsonObject(stop) || typeof stop["offset"] !== "number" || !Number.isFinite(stop["offset"])) continue;
    const offset = stop["offset"];
    if (found.has(offset)) duplicate.add(offset);
    found.set(offset, stop);
  }
  for (const offset of duplicate) found.delete(offset);
  return found;
}
/**
 * Preserve unknown fields within the same supported paint form.
 * Stops survive by unique unchanged offset, never by array index.
 * A changed-offset stop retains only extras explicitly present in the next JSON.
 * Omitted known fields reset defaults. Invalid explicit values stay invalid.
 */
export function patchRunPaint(previous: unknown, next: Color): Color {
  if (!jsonObject(previous) || !jsonObject(next) || previous["kind"] !== next["kind"] || !["linear", "radial"].includes(String(next["kind"]))) return structuredClone(next);
  const radial = next["kind"] === "radial";
  const merged = {
    ...unknownFields(previous, radial ? ["kind", "center", "radius", "stops"] : ["kind", "angle", "stops"]),
    ...structuredClone(next),
  };
  if (Array.isArray(previous["stops"]) && Array.isArray(next["stops"])) {
    const oldStops = uniqueStops(previous["stops"]);
    const nextStops = uniqueStops(next["stops"]);
    merged["stops"] = next["stops"].map((stop: unknown) => {
      if (!jsonObject(stop) || typeof stop["offset"] !== "number" || !nextStops.has(stop["offset"])) return structuredClone(stop);
      const old = oldStops.get(stop["offset"]);
      return { ...(old ? unknownFields(old, ["offset", "color", "alpha"]) : {}), ...structuredClone(stop) };
    });
  }
  if (radial && jsonObject(previous["center"])) {
    const extras = unknownFields(previous["center"], ["x", "y"]);
    if (jsonObject(next["center"])) merged["center"] = { ...extras, ...structuredClone(next["center"]) };
    else if (!Object.hasOwn(next, "center") && Object.keys(extras).length) merged["center"] = { ...extras, x: 0.5, y: 0.5 };
  }
  return merged as Color;
}
export function runsChanged(draft: RunsDraft): boolean {
  return JSON.stringify(draft.rows.map((row) => row.raw)) !== JSON.stringify(draft.capture.runs);
}
export function runsOperation(draft: RunsDraft): Operation | null {
  if (!runsChanged(draft)) return null;
  const runs = draft.rows.map((row) => structuredClone(row.raw));
  const operation = { op: "update", id: draft.capture.layer, runs } as Operation;
  if (runs.length && draft.rows.every(editableRun) && runs.every(runObject)) {
    const text = runs.map((run) => run.text).join("");
    if (text !== draft.capture.text) Object.assign(operation, { text });
  }
  return operation;
}
