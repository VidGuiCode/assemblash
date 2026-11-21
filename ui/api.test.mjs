import test from "node:test";
import assert from "node:assert/strict";

import { pngUrl } from "./.test-dist/api.js";

test("hue rotation starts neutral and exposes degrees", async () => {
  const { newEffect, effectFields } = await import("./.test-dist/api.js");
  assert.deepEqual(newEffect("hueRotate"), { type: "hueRotate", degrees: 0 });
  assert.deepEqual(effectFields({ type: "hueRotate", degrees: -90 }), [
    { name: "degrees", value: -90, kind: "number" },
  ]);
});

test("invert starts neutral and exposes its amount", async () => {
  const { newEffect, effectFields } = await import("./.test-dist/api.js");
  assert.deepEqual(newEffect("invert"), { type: "invert", amount: 0 });
  assert.deepEqual(effectFields({ type: "invert", amount: 0.75 }), [
    { name: "amount", value: 0.75, kind: "number" },
  ]);
});

test("saved text styles include paragraph spacing and an explicit zero reset", async () => {
  const { styleOf } = await import("./.test-dist/api.js");
  const layer = { type: "text", fontFamily: "Noto Sans", fontSize: 32, runs: [{ text: "A", future: 7 }] };
  assert.equal(styleOf(layer).paragraphSpacing, 0);
  assert.equal(styleOf({ ...layer, paragraphSpacing: 17.25 }).paragraphSpacing, 17.25);
  assert.equal(Object.hasOwn(styleOf(layer), "runs"), false);
  assert.equal(styleOf({ ...layer, align: "justify" }).align, "justify");
});

test("drag preview URLs keep layer filtering out of the operation API", () => {
  const selected = pngUrl("my project", 7, 1, { only: ["layer_one", "layer_two"] });
  const base = pngUrl("my project", 7, 1, { exclude: ["layer_one"] });

  assert.equal(
    selected,
    "/api/projects/my%20project/preview.png?scale=1&v=7&only=layer_one%2Clayer_two",
  );
  assert.equal(
    base,
    "/api/projects/my%20project/preview.png?scale=1&v=7&exclude=layer_one",
  );
});

// The write routes carry `includeDocument`, and the history read bounds its
// read. Both are transport contracts the interface relies on: the first removes
// the read-after-write round trip from every edit, the second stops a history
// read from growing with the journal.
test("a write asks for the document it produced back in the same response", async () => {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (path, init) => {
    calls.push({ path, init });
    return new Response(
      JSON.stringify({ version: 2, dryRun: false, transactionId: "t1", document: { version: 2 } }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  try {
    const { applyOperationBatch } = await import("./.test-dist/api.js");
    const result = await applyOperationBatch("p", "move", [{ op: "move", id: "a", dx: 1, dy: 2 }], 1);

    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].path,
      "/api/projects/p/operation-batches?includeDocument=true",
      "the batch ride-along is opt-in over the URL, leaving the body schema untouched",
    );
    assert.deepEqual(result.document, { version: 2 }, "the response carries the produced document");
  } finally {
    globalThis.fetch = original;
  }
});

test("a single write asks for the document back the same way", async () => {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (path, init) => {
    calls.push({ path, init });
    return new Response(
      JSON.stringify({ version: 3, dryRun: false }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  try {
    const { applyOperation } = await import("./.test-dist/api.js");
    await applyOperation("p", { op: "move", id: "a", dx: 1, dy: 2 }, 2);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, "/api/projects/p/operations?includeDocument=true");
  } finally {
    globalThis.fetch = original;
  }
});

test("the history read names a tail instead of reading the whole journal", async () => {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (path, init) => {
    calls.push({ path, init });
    return new Response(JSON.stringify({ position: 9, head: 9, entries: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const { getHistory } = await import("./.test-dist/api.js");
    await getHistory("p");

    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, "/api/projects/p/history?tail=100");
  } finally {
    globalThis.fetch = original;
  }
});

test("a generated layer is read from its reserved key, and other layers are not", async () => {
  const { generatedRecordOf, GENERATED_META_KEYS, CHART_TYPES } = await import("./.test-dist/api.js");
  const spec = { kind: "chart", type: "bar", categories: ["a"], series: [] };
  const chart = { id: "l1", type: "svg", asset: "a1", "assemblash.chart": { spec, generator: "assemblash 1.15.0" } };
  assert.deepEqual(generatedRecordOf(chart), { kind: "chart", spec });
  const qr = { id: "l2", type: "svg", asset: "a2", "assemblash.qr": { spec: { kind: "qr", data: "x" } } };
  assert.equal(generatedRecordOf(qr)?.kind, "qr");
  // An image with the key, a record with no spec, and a plain SVG are not generated.
  assert.equal(generatedRecordOf({ ...chart, type: "image" }), null);
  assert.equal(generatedRecordOf({ id: "l3", type: "svg", "assemblash.table": { generator: "x" } }), null);
  assert.equal(generatedRecordOf({ id: "l4", type: "svg", asset: "a4" }), null);
  assert.deepEqual(Object.values(GENERATED_META_KEYS), ["assemblash.chart", "assemblash.table", "assemblash.qr"]);
  // The interface offers the chart types the engine accepts, in its order.
  assert.deepEqual(CHART_TYPES, ["bar", "column", "line", "area", "pie", "donut", "scatter"]);
});
