import test from "node:test";
import assert from "node:assert/strict";

import { MAX_TABS, TabList, parseOpenTabs } from "./.test-dist/tabs.js";

function listOf(...ids) {
  const list = new TabList();
  for (const id of ids) list.open(id, () => ({ id }));
  return list;
}

test("a second open of the same project returns the existing tab", () => {
  const list = listOf("alpha", "beta");
  const first = list.find("alpha");
  const again = list.open("alpha", () => { throw new Error("must not create a second record"); });
  assert.equal(again.added, false);
  assert.equal(again.entry, first);
  assert.deepEqual(list.serialize().projects, ["alpha", "beta"]);
});

test("viewing a tab clears its change marker, and the visible tab never gets one", () => {
  const list = listOf("alpha", "beta");
  list.activate("alpha");
  assert.equal(list.markChanged("alpha"), false);
  assert.equal(list.markChanged("beta"), true);
  assert.equal(list.markChanged("beta"), false, "a marked tab is not marked twice");
  assert.deepEqual(list.views().map((view) => view.changed), [false, true]);
  list.activate("beta");
  assert.deepEqual(list.views(), [
    { id: "alpha", changed: false, active: false, group: null },
    { id: "beta", changed: false, active: true, group: null },
  ]);
});

test("closing the visible tab shows its right neighbour, else its left one", () => {
  const list = listOf("a", "b", "c");
  list.activate("b");
  assert.equal(list.close("b").next?.id, "c");
  list.activate("c");
  assert.equal(list.close("c").next?.id, "a");
  list.activate("a");
  assert.equal(list.close("a").next, null);
  assert.equal(list.size, 0);
});

test("closing a hidden tab keeps the visible one", () => {
  const list = listOf("a", "b", "c");
  list.activate("c");
  const { removed, next } = list.close("a");
  assert.equal(removed?.id, "a");
  assert.equal(next?.id, "c");
  assert.equal(list.active?.id, "c");
});

test("move reorders the strip and clamps the target", () => {
  const list = listOf("a", "b", "c", "d");
  assert.equal(list.move("a", 2), true);
  assert.deepEqual(list.serialize().projects, ["b", "c", "a", "d"]);
  assert.equal(list.move("d", -5), true);
  assert.deepEqual(list.serialize().projects, ["d", "b", "c", "a"]);
  assert.equal(list.move("d", 0), false);
  assert.equal(list.move("missing", 1), false);
});

test("rename keeps position, record, and the active tab", () => {
  const list = listOf("a", "b");
  list.activate("a");
  const record = list.find("a").record;
  assert.equal(list.rename("a", "b"), null, "a name another tab uses is refused");
  const renamed = list.rename("a", "z");
  assert.equal(renamed?.record, record);
  assert.deepEqual(list.serialize(), { projects: ["z", "b"], active: "z" });
});

test("the list refuses more than the maximum number of tabs", () => {
  const list = new TabList();
  for (let index = 0; index < MAX_TABS; index++) list.open(`p${index}`, () => ({}));
  assert.throws(() => list.open("one-more", () => ({})), RangeError);
  assert.doesNotThrow(() => list.open("p0", () => ({})), "an open tab is still found");
});

test("a persisted list is read defensively", () => {
  assert.deepEqual(parseOpenTabs(null), { projects: [], active: null });
  assert.deepEqual(parseOpenTabs({ projects: "alpha" }), { projects: [], active: null });
  assert.deepEqual(parseOpenTabs({ projects: ["a", 3, "", "b", "a"], active: "b" }), { projects: ["a", "b"], active: "b" });
  assert.deepEqual(parseOpenTabs({ projects: ["a", "b"], active: "gone" }), { projects: ["a", "b"], active: "a" });
});
