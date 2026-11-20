import assert from "node:assert/strict";
import test from "node:test";

import {
  FORMATS,
  RESOLUTIONS,
  dimensionsFor,
  downloadTargetFor,
  exportOptionsFor,
  extensionFor,
  hasBleed,
} from "./.test-dist/export.js";

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

test("the dialog offers the formats the engine produces, PNG first", () => {
  assert.deepEqual(FORMATS.map((one) => one.id), ["png", "svg", "pdf", "jpeg", "webp"]);
});

test("PNG sends no format fields, so its request is the one from before the formats", () => {
  const document = { canvas: { width: 100, height: 100 } };
  const choice = { format: "png", quality: 40, print: true, pageSet: "deck" };
  assert.deepEqual(exportOptionsFor(choice, document), {});
  assert.deepEqual(exportOptionsFor({ ...choice, format: "svg" }, document), {});
});

test("each format field goes only with the format that can use it", () => {
  const plain = { canvas: { width: 100, height: 100 } };
  const bled = { canvas: { width: 100, height: 100, bleed: { top: 9, right: 9, bottom: 9, left: 9 } } };
  const choice = { format: "jpeg", quality: 72.4, print: true, pageSet: "deck" };
  assert.deepEqual(exportOptionsFor(choice, bled), { format: "jpeg", quality: 72 });
  assert.deepEqual(exportOptionsFor({ ...choice, format: "webp" }, bled), { format: "webp" }, "WebP is lossless: no quality");
  assert.deepEqual(exportOptionsFor({ ...choice, format: "pdf" }, bled), { format: "pdf", pages: "deck", print: true });
  assert.deepEqual(exportOptionsFor({ ...choice, format: "pdf" }, plain), { format: "pdf", pages: "deck" }, "no print without bleed");
  assert.deepEqual(exportOptionsFor({ ...choice, format: "pdf", pageSet: null, print: false }, bled), { format: "pdf" });
});

test("a bleed of zero on every side is no bleed", () => {
  assert.equal(hasBleed({ canvas: { width: 1, height: 1 } }), false);
  assert.equal(hasBleed({ canvas: { width: 1, height: 1, bleed: null } }), false);
  assert.equal(hasBleed({ canvas: { width: 1, height: 1, bleed: { top: 0, right: 0, bottom: 0, left: 0 } } }), false);
  assert.equal(hasBleed({ canvas: { width: 1, height: 1, bleed: { left: 3 } } }), true);
});

test("a JPEG downloads under its .jpg name, the other raster formats under their own", () => {
  const document = { canvas: { width: 10, height: 10 }, version: 1 };
  assert.equal(extensionFor("jpeg"), "jpg");
  assert.deepEqual(downloadTargetFor("jpeg", "p", document, "card"), { url: "/api/projects/p/exports/card.jpg", filename: "card.jpg" });
  assert.deepEqual(downloadTargetFor("pdf", "p", document, "card"), { url: "/api/projects/p/exports/card.pdf", filename: "card.pdf" });
  assert.deepEqual(downloadTargetFor("webp", "p", document, "card"), { url: "/api/projects/p/exports/card.webp", filename: "card.webp" });
});

test("choosing SVG downloads the vector render, not a rasterized export", () => {
  const document = { canvas: { width: 1920, height: 1080 }, version: 7 };
  assert.deepEqual(downloadTargetFor("svg", "poster shop", document, "spring-sale"), {
    url: "/api/projects/poster%20shop/preview.svg?v=7",
    filename: "spring-sale.svg",
  });
  assert.deepEqual(downloadTargetFor("png", "poster shop", document, "spring-sale"), {
    url: "/api/projects/poster%20shop/exports/spring-sale.png",
    filename: "spring-sale.png",
  });
});
