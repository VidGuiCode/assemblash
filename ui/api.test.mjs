import test from "node:test";
import assert from "node:assert/strict";

import { pngUrl } from "./dist/api.js";

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
    const { applyOperationBatch } = await import("./dist/api.js");
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
    const { applyOperation } = await import("./dist/api.js");
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
    const { getHistory } = await import("./dist/api.js");
    await getHistory("p");

    assert.equal(calls.length, 1);
    assert.equal(calls[0].path, "/api/projects/p/history?tail=100");
  } finally {
    globalThis.fetch = original;
  }
});
