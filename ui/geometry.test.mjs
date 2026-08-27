import assert from "node:assert/strict";
import test from "node:test";

import {
  resizeItemInSelection,
  resizedRotatedBounds,
  rotatedRectBounds,
  selectionBounds,
} from "./dist/geometry.js";

const closeTo = (actual, expected, epsilon = 1e-9) => {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
};

const rotate = (x, y, degrees) => {
  const radians = degrees * Math.PI / 180;
  return {
    x: x * Math.cos(radians) - y * Math.sin(radians),
    y: x * Math.sin(radians) + y * Math.cos(radians),
  };
};

const anchor = (rect, rotation, localX, localY) => {
  const offset = rotate(localX, localY, rotation);
  return {
    x: rect.x + rect.width / 2 + offset.x,
    y: rect.y + rect.height / 2 + offset.y,
  };
};

test("rotated bounds contain the rectangle's visual extents", () => {
  const bounds = rotatedRectBounds({ x: 10, y: 20, width: 100, height: 40, rotation: 45 });
  const extent = 70 * Math.SQRT2;
  closeTo(bounds.width, extent);
  closeTo(bounds.height, extent);
  closeTo(bounds.x + bounds.width / 2, 60);
  closeTo(bounds.y + bounds.height / 2, 40);
});

test("multi-selection bounds include rotated corners", () => {
  const bounds = selectionBounds([
    { x: 0, y: 0, width: 100, height: 20, rotation: 90 },
    { x: 150, y: 10, width: 30, height: 30, rotation: 0 },
  ]);
  closeTo(bounds.x, 40);
  closeTo(bounds.y, -40);
  closeTo(bounds.width, 140);
  closeTo(bounds.height, 100);
});

test("rotated east resize follows the local axis and fixes the west anchor", () => {
  const original = { x: 10, y: 20, width: 100, height: 50 };
  const resized = resizedRotatedBounds(original, 90, "e", 0, 20);
  closeTo(resized.width, 120);
  closeTo(resized.height, 50);

  const before = anchor(original, 90, -original.width / 2, 0);
  const after = anchor(resized, 90, -resized.width / 2, 0);
  closeTo(after.x, before.x);
  closeTo(after.y, before.y);
});

test("rotated corner resize fixes the opposite corner", () => {
  const original = { x: 35, y: 80, width: 120, height: 70 };
  const resized = resizedRotatedBounds(original, -33, "se", 22, 31);
  const before = anchor(original, -33, -original.width / 2, -original.height / 2);
  const after = anchor(resized, -33, -resized.width / 2, -resized.height / 2);
  closeTo(after.x, before.x);
  closeTo(after.y, before.y);
});

test("multi-selection resize scales layer centres instead of raw top-lefts", () => {
  const selection = { x: 0, y: 0, width: 200, height: 100 };
  const resized = resizeItemInSelection(
    { x: 140, y: 20, width: 20, height: 40 },
    selection,
    { x: 0, y: 0, width: 100, height: 200 },
  );
  closeTo(resized.x, 70);
  closeTo(resized.y, 40);
  closeTo(resized.width, 10);
  closeTo(resized.height, 80);
});
