import test from "node:test";
import assert from "node:assert/strict";
import { editableRun, newRun, patchRun, patchRunPaint, runObject, runsChanged, runsKey, runsOperation, startRuns } from "./.test-dist/text-runs.js";
import { ActionQueue } from "./.test-dist/queue.js";

const capture = (runs = []) => ({ project: "project", document: "doc", layer: "text", version: 7, text: "Aب", runs });
test("raw drafts preserve nulls, paint extras and source values while patching one field", () => {
  const raw = [{ text: "A", fontFamily: null, fontSize: null, color: { kind: "linear", angle: 20, future: { keep: 1 }, stops: [{ offset: 0, color: "#ffffff", future: { keep: 2 } }, { offset: 1, color: "#000000" }] }, future: [1, null] }, { text: "ب", color: null }];
  const draft = startRuns(capture(raw));
  assert.equal(runsChanged(draft), false);
  assert.equal(runsOperation(draft), null);
  draft.rows[0].raw = patchRun(draft.rows[0].raw, "fontWeight", 700);
  const operation = runsOperation(draft);
  assert.equal(operation.text, undefined);
  assert.equal(operation.runs[0].fontFamily, null);
  assert.deepEqual(operation.runs[0].future, [1, null]);
  assert.equal(operation.runs[1].color, null);
  assert.equal(raw[0].fontWeight, undefined);
  const paint = patchRunPaint(raw[0].color, { kind: "linear", angle: 45, stops: [{ offset: 0, color: "#ff0000" }, { offset: 1, color: "#000000" }] });
  assert.equal(paint.angle, 45);
  assert.deepEqual(paint.future, { keep: 1 });
  assert.deepEqual(paint.stops[0].future, { keep: 2 });
  assert.equal(raw[0].color.angle, 20);
  const defaults = patchRunPaint({ kind: "linear", angle: 80, future: 1, stops: [{ offset: 0, color: "#ffffff", alpha: 0.3, futureStop: 2 }] }, { kind: "linear", stops: [{ offset: 0, color: "#000000" }] });
  assert.equal(Object.hasOwn(defaults, "angle"), false);
  assert.equal(Object.hasOwn(defaults.stops[0], "alpha"), false);
  assert.equal(defaults.future, 1);
  assert.equal(defaults.stops[0].futureStop, 2);
});
test("run text changes are one atomic operation; clearing keeps authoritative text", () => {
  const draft = startRuns(capture([{ text: "A" }, { text: "ب" }]));
  draft.rows.reverse();
  assert.deepEqual(runsOperation(draft), { op: "update", id: "text", text: "بA", runs: [{ text: "ب" }, { text: "A" }] });
  draft.rows = [];
  assert.deepEqual(runsOperation(draft), { op: "update", id: "text", runs: [] });
});
test("radial center reset retains nested extras with the documented default coordinates", () => {
  const stops = [{ offset: 0, color: "#ffffff" }, { offset: 1, color: "#000000" }];
  const previous = { kind: "radial", center: { x: 0.2, y: 0.3, future: { keep: 1 } }, radius: 0.4, stops };
  const reset = patchRunPaint(previous, { kind: "radial", stops });
  assert.deepEqual(reset.center, { x: 0.5, y: 0.5, future: { keep: 1 } });
  assert.equal(Object.hasOwn(reset, "radius"), false);
  assert.equal(runObject({ text: "A", color: reset }), true);
  assert.deepEqual(previous.center, { x: 0.2, y: 0.3, future: { keep: 1 } });
  assert.deepEqual(patchRunPaint(previous, { kind: "radial", center: { x: 0.8, y: 0.6 }, stops }).center, { x: 0.8, y: 0.6, future: { keep: 1 } });
  assert.equal(Object.hasOwn(patchRunPaint({ kind: "radial", center: { x: 0.2, y: 0.3 }, stops }, { kind: "radial", stops }), "center"), false);
  assert.equal(patchRunPaint(previous, { kind: "radial", center: null, stops }).center, null);
});
test("paint stop insertion and deletion preserve only unique offset survivors", () => {
  const previous = { kind: "linear", angle: 25, futurePaint: 3, stops: [
    { offset: 0, color: "#ff0000", removedOnly: 1 },
    { offset: 1, color: "#0000ff", survivorOnly: 2, alpha: 0.3 },
  ] };
  const deleted = patchRunPaint(previous, { kind: "linear", stops: [{ offset: 1, color: "#ffffff" }] });
  assert.deepEqual(deleted, { kind: "linear", futurePaint: 3, stops: [{ offset: 1, color: "#ffffff", survivorOnly: 2 }] });
  const inserted = patchRunPaint(previous, { kind: "linear", stops: [{ offset: 0, color: "#ff0000" }, { offset: 0.5, color: "#ffffff", newOnly: 4 }, { offset: 1, color: "#0000ff" }] });
  assert.deepEqual(inserted.stops, [{ offset: 0, color: "#ff0000", removedOnly: 1 }, { offset: 0.5, color: "#ffffff", newOnly: 4 }, { offset: 1, color: "#0000ff", survivorOnly: 2 }]);
  const replaced = patchRunPaint(previous, { kind: "linear", stops: [{ offset: 0.2, color: "#ff0000" }, { offset: 0.8, color: "#0000ff", explicit: 5 }] });
  assert.deepEqual(replaced.stops, [{ offset: 0.2, color: "#ff0000" }, { offset: 0.8, color: "#0000ff", explicit: 5 }]);
  const explicit = patchRunPaint(previous, { kind: "linear", stops: [{ ...previous.stops[0], offset: 0.2 }, previous.stops[1]] });
  assert.equal(explicit.stops[0].removedOnly, 1);
  const movedSurvivor = patchRunPaint(previous, { kind: "linear", stops: [{ offset: 0.5, color: "#ffffff" }, { offset: 1, color: "#0000ff" }] });
  assert.equal(movedSurvivor.stops[0].removedOnly, undefined);
  assert.equal(movedSurvivor.stops[1].survivorOnly, 2);
  assert.equal(previous.stops[1].alpha, 0.3);
});
test("unsupported raw values stay read-only and are never coerced", () => {
  for (const raw of [17, null, {}, { text: "A", color: { kind: "future" } }, { text: "A", fontWeight: "bold" }]) {
    const draft = startRuns(capture([raw]));
    assert.equal(editableRun(draft.rows[0]), false);
    assert.deepEqual(draft.rows[0].raw, raw);
    assert.equal(runsOperation(draft), null);
  }
  assert.equal(runObject({ text: "A", color: { kind: "radial", stops: [{ offset: 0, color: "#ffffff" }, { offset: 1, color: "#000000" }] } }), true);
});
test("draft identity does not depend on version and does distinguish projects and documents", () => {
  const map = new Map();
  const draft = startRuns(capture());
  draft.rows.push(newRun("Aب"));
  map.set(runsKey(draft.capture), draft);
  assert.equal(map.get(runsKey({ ...capture(), version: 8 })), draft);
  assert.equal(map.get(runsKey({ ...capture(), project: "other" })), undefined);
  assert.equal(map.get(runsKey({ ...capture(), document: "other" })), undefined);
});
test("older stale run text is read-only and a style patch cannot replace authoritative text", () => {
  const draft = startRuns({ ...capture([{ text: "Old text" }]), text: "New text" });
  assert.equal(editableRun(draft.rows[0]), false);
  draft.rows[0].raw = patchRun(draft.rows[0].raw, "fontWeight", 700);
  assert.equal(runsOperation(draft).text, undefined);
  assert.equal(draft.capture.text, "New text");
});
test("malformed known paints remain raw read-only values", () => {
  for (const color of [
    { kind: "linear", stops: [] }, { kind: "linear", angle: null, stops: [{ offset: 0, color: "#ffffff" }] },
    { kind: "linear", stops: [{ offset: -1, color: "#ffffff" }] },
    { kind: "linear", stops: [{ offset: 0, color: "#fff" }] },
    { kind: "linear", stops: [{ offset: 0, color: "#ffffff", alpha: 2 }] },
    { kind: "radial", center: { x: 0.5 }, stops: [{ offset: 0, color: "#ffffff" }] },
    { kind: "radial", radius: 0, stops: [{ offset: 0, color: "#ffffff" }] },
  ]) assert.equal(editableRun(startRuns(capture([{ text: "Aب", color }])).rows[0]), false);
});
test("an invalid numeric draft remains editable after a refused interpretation", () => {
  const draft = startRuns(capture([{ text: "Aب", fontSize: 20 }]));
  draft.rows[0].raw = patchRun(draft.rows[0].raw, "fontSize", "");
  assert.equal(editableRun(draft.rows[0]), true);
  assert.equal(runObject(draft.rows[0].raw), false);
  draft.rows[0].raw = patchRun(draft.rows[0].raw, "fontSize", undefined);
  assert.equal(Object.hasOwn(draft.rows[0].raw, "fontSize"), false);
});
test("queue outcomes preserve captured versions and retain refused drafts behind earlier writes", async () => {
  const queue = new ActionQueue();
  const draft = startRuns(capture([{ text: "Aب" }]));
  let version = 7;
  const calls = [];
  let release;
  const first = queue.outcome("base", async () => { await new Promise((resolve) => { release = resolve; }); version++; return version; });
  const refused = queue.outcome("runs", async () => { calls.push(draft.capture.version); if (draft.capture.version !== version) throw new Error("versionConflict"); });
  const later = queue.outcome("later", async () => "done");
  release();
  assert.deepEqual(await first, { status: "applied", value: 8 });
  const result = await refused;
  assert.equal(result.status, "refused");
  assert.match(String(result.error), /versionConflict/);
  assert.deepEqual(calls, [7]);
  assert.equal(draft.capture.version, 7);
  assert.deepEqual(draft.rows[0].raw, { text: "Aب" });
  assert.deepEqual(await later, { status: "applied", value: "done" });
});
