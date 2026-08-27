import assert from "node:assert/strict";
import test from "node:test";

import { RESOLUTIONS, dimensionsFor } from "./dist/export.js";

function resolution(id) {
  const found = RESOLUTIONS.find((one) => one.id === id);
  assert.ok(found, `missing resolution ${id}`);
  return found;
}

test("landscape exports preserve aspect ratio at every named resolution", () => {
  const document = { canvas: { width: 1920, height: 1080 } };

  assert.deepEqual(dimensionsFor(document, resolution("original")), {
    width: 1920,
    height: 1080,
    scale: 1,
  });
  assert.deepEqual(dimensionsFor(document, resolution("2k")), {
    width: 2048,
    height: 1152,
    scale: 2048 / 1920,
  });
  assert.deepEqual(dimensionsFor(document, resolution("4k")), {
    width: 3840,
    height: 2160,
    scale: 2,
  });
  assert.deepEqual(dimensionsFor(document, resolution("8k")), {
    width: 7680,
    height: 4320,
    scale: 4,
  });
});

test("portrait 8K exports use 7680 pixels on the long edge", () => {
  const document = { canvas: { width: 1080, height: 1920 } };
  assert.deepEqual(dimensionsFor(document, resolution("8k")), {
    width: 4320,
    height: 7680,
    scale: 4,
  });
});

test("non-standard canvases round to whole output pixels", () => {
  const document = { canvas: { width: 1000, height: 333 } };
  assert.deepEqual(dimensionsFor(document, resolution("2k")), {
    width: 2048,
    height: 682,
    scale: 2.048,
  });
});
