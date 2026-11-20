import test from "node:test";
import assert from "node:assert/strict";

import { matchingPageSets, planPageSetOpen } from "./.test-dist/page-sets.js";
import { TabList, pageSetOrder } from "./.test-dist/tabs.js";
import { refusalMessage } from "./.test-dist/refusals.js";

test("a search shows the page sets whose name holds the text, in any case", () => {
  assert.deepEqual(matchingPageSets(["Deck", "carousel", "spring-deck"], "DECK"), ["Deck", "spring-deck"]);
  assert.deepEqual(matchingPageSets(["deck", "carousel"], "  "), ["deck", "carousel"]);
  assert.deepEqual(matchingPageSets(["deck"], "poster"), []);
});

test("a three-page set opens three tabs in manifest order", () => {
  const plan = planPageSetOpen(["cover", "middle", "back"], []);
  assert.deepEqual(plan, {
    kind: "open",
    pages: ["cover", "middle", "back"],
    toOpen: ["cover", "middle", "back"],
    order: ["cover", "middle", "back"],
  });
});

test("a page that is already open is not opened again and joins the run", () => {
  const plan = planPageSetOpen(["cover", "middle", "back"], ["notes", "back", "other"]);
  assert.equal(plan.kind, "open");
  assert.deepEqual(plan.toOpen, ["cover", "middle"]);
  // The run goes where the first open page stood.
  assert.deepEqual(plan.order, ["notes", "cover", "middle", "back", "other"]);
});

test("the run goes at the end when no page of the set is open", () => {
  assert.deepEqual(pageSetOrder(["a", "b"], ["x", "y"]), ["a", "b", "x", "y"]);
  assert.deepEqual(pageSetOrder(["y", "a", "x"], ["x", "y"]), ["x", "y", "a"]);
});

test("a set with no pages, or too many new tabs, opens nothing", () => {
  assert.deepEqual(planPageSetOpen([], ["a"]), { kind: "empty" });
  assert.deepEqual(planPageSetOpen(["p1", "p2", "p3"], ["a", "p1"], 3), { kind: "tooMany", count: 3, max: 3 });
  assert.equal(planPageSetOpen(["p1", "p2"], ["a", "p1"], 3).kind, "open", "an open page needs no new tab");
});

test("the tabs of a set carry their page numbers in manifest order", () => {
  const list = new TabList();
  for (const id of ["notes", "back", "cover", "middle"]) list.open(id, () => ({}));
  list.arrange(pageSetOrder(list.all.map((entry) => entry.id), ["cover", "middle", "back"]));
  list.setGroup("deck", ["cover", "middle", "back"]);
  assert.deepEqual(list.serialize().projects, ["notes", "cover", "middle", "back"]);
  assert.deepEqual(list.views().map((view) => [view.id, view.group?.page ?? null]), [
    ["notes", null], ["cover", 1], ["middle", 2], ["back", 3],
  ]);
  assert.deepEqual(list.find("middle").group, { set: "deck", page: 2, count: 3 });
});

test("opening a set again with other pages moves the marks; another set takes a shared page", () => {
  const list = new TabList();
  for (const id of ["a", "b", "c"]) list.open(id, () => ({}));
  list.setGroup("deck", ["a", "b", "c"]);
  list.setGroup("deck", ["c", "a"]);
  assert.equal(list.find("b").group, null);
  assert.deepEqual(list.find("c").group, { set: "deck", page: 1, count: 2 });
  list.setGroup("other", ["a"]);
  assert.deepEqual(list.find("a").group, { set: "other", page: 1, count: 1 });
});

test("arrange keeps tabs the order leaves out, and ignores ids that are not open", () => {
  const list = new TabList();
  for (const id of ["a", "b", "c", "d"]) list.open(id, () => ({}));
  list.arrange(["c", "ghost", "a", "c"]);
  assert.deepEqual(list.serialize().projects, ["c", "a", "b", "d"]);
});

test("a loop and a missing page are readable messages that name the problem", () => {
  const loop = refusalMessage({ code: "pageSetLoop", details: { chain: ["deck", "inner", "deck"] } });
  assert.equal(loop, "Page set deck contains itself: deck → inner → deck.");
  const missing = refusalMessage({
    code: "pageSetMemberMissing",
    details: { set: "deck", missing: [{ set: "deck", entry: 1, kind: "project", name: "gone" }, { set: "inner", entry: 0, kind: "set", name: "lost" }] },
  });
  assert.equal(missing, "Page set deck names pages that do not exist: gone, lost.");
  const duplicate = refusalMessage({ code: "pageSetDuplicatePage", details: { set: "deck", project: "cover", first: 0, second: 2 } });
  assert.match(duplicate, /cover as page 1 and page 3/);
});

test("the export refusals are readable, and an unknown code is left to the caller", () => {
  assert.equal(refusalMessage({ code: "lossyWebpNotSupported", details: {} }), "The engine exports lossless WebP only. For a smaller file, use JPEG.");
  assert.equal(refusalMessage({ code: "printNeedsPdf", details: null }), "Crop marks and bleed need the PDF format.");
  assert.equal(refusalMessage({ code: "pagesNeedPdf", details: null }), "More than one page needs the PDF format.");
  assert.equal(refusalMessage({ code: "somethingNew", details: {} }), null);
  // Details of the wrong shape still give a sentence.
  assert.equal(refusalMessage({ code: "pageSetLoop", details: "nonsense" }), "Page set ? contains itself: ?.");
});
