import test from "node:test";
import assert from "node:assert/strict";

import { ActionQueue } from "./dist/queue.js";

/** A promise the test resolves when it chooses to. */
function deferred() {
  let resolve;
  const promise = new Promise((settled) => { resolve = settled; });
  return { promise, resolve };
}

const settle = () => new Promise((done) => setTimeout(done, 0));

test("a rapid burst of actions runs every one of them, in order", async () => {
  const queue = new ActionQueue();
  const ran = [];
  const finished = [];
  for (let i = 0; i < 20; i++) {
    finished.push(queue.enqueue({
      label: `action ${i}`,
      coalesceKey: null,
      run: async () => { ran.push(i); },
    }));
  }
  await Promise.all(finished);
  assert.deepEqual(ran, Array.from({ length: 20 }, (_, i) => i));
});

test("an action queued while another runs waits for it, then runs", async () => {
  const queue = new ActionQueue();
  const first = deferred();
  const order = [];
  const firstDone = queue.enqueue({
    label: "slow",
    coalesceKey: null,
    run: () => first.promise.then(() => { order.push("slow"); }),
  });
  const secondDone = queue.enqueue({
    label: "quick",
    coalesceKey: null,
    run: async () => { order.push("quick"); },
  });
  await settle();
  assert.deepEqual(order, []);
  first.resolve();
  await Promise.all([firstDone, secondDone]);
  assert.deepEqual(order, ["slow", "quick"]);
});

test("a newer same-key action replaces an undelivered older one", async () => {
  const queue = new ActionQueue();
  const gate = deferred();
  const ran = [];
  const superseded = [];

  const blocker = queue.enqueue({
    label: "blocker",
    coalesceKey: null,
    run: () => gate.promise,
  });

  const older = queue.enqueue({
    label: "older",
    coalesceKey: "update:layer_1:fontSize",
    run: async () => { ran.push("older"); },
    onSuperseded: () => { superseded.push("older"); },
  });
  const newer = queue.enqueue({
    label: "newer",
    coalesceKey: "update:layer_1:fontSize",
    run: async () => { ran.push("newer"); },
    onSuperseded: () => { superseded.push("newer"); },
  });

  gate.resolve();
  await Promise.all([blocker, older, newer]);
  assert.deepEqual(ran, ["newer"]);
  assert.deepEqual(superseded, ["older"]);
});

test("coalescing never moves an edit past an action queued after it", async () => {
  // [opacity .5, undo, opacity .7]: replacing the first edit would run the
  // undo before any opacity change, and the undo would revert a different,
  // earlier transaction. Only the last waiting action may be replaced.
  const queue = new ActionQueue();
  const gate = deferred();
  const ran = [];
  const blocker = queue.enqueue({ label: "blocker", coalesceKey: null, run: () => gate.promise });
  const first = queue.enqueue({
    label: "opacity .5",
    coalesceKey: "update:layer_1:opacity",
    run: async () => { ran.push("opacity .5"); },
  });
  const undo = queue.enqueue({ label: "undo", coalesceKey: null, run: async () => { ran.push("undo"); } });
  const second = queue.enqueue({
    label: "opacity .7",
    coalesceKey: "update:layer_1:opacity",
    run: async () => { ran.push("opacity .7"); },
  });
  gate.resolve();
  await Promise.all([blocker, first, undo, second]);
  assert.deepEqual(ran, ["opacity .5", "undo", "opacity .7"]);
});

test("actions with different coalesce keys never replace each other", async () => {
  const queue = new ActionQueue();
  const gate = deferred();
  const ran = [];
  const blocker = queue.enqueue({ label: "blocker", coalesceKey: null, run: () => gate.promise });
  const a = queue.enqueue({
    label: "set size",
    coalesceKey: "update:layer_1:fontSize",
    run: async () => { ran.push("size"); },
  });
  const b = queue.enqueue({
    label: "set colour",
    coalesceKey: "update:layer_1:color",
    run: async () => { ran.push("colour"); },
  });
  gate.resolve();
  await Promise.all([blocker, a, b]);
  assert.deepEqual(ran.sort(), ["colour", "size"]);
});

test("a refusal reports through onError and never discards the actions behind it", async () => {
  const queue = new ActionQueue();
  const ran = [];
  const errors = [];
  const finished = [
    queue.enqueue({
      label: "refused",
      coalesceKey: null,
      run: async () => { throw new Error("protected layer"); },
      onError: (error) => { errors.push(String(error)); },
    }),
    queue.enqueue({
      label: "after",
      coalesceKey: null,
      run: async () => { ran.push("after"); },
    }),
  ];
  await Promise.all(finished);
  assert.deepEqual(ran, ["after"]);
  assert.equal(errors.length, 1);
  assert.match(errors[0] ?? "", /protected layer/);
});

test("the queue never rejects: a failed action's promise still resolves", async () => {
  const queue = new ActionQueue();
  const done = queue.enqueue({
    label: "refused",
    coalesceKey: null,
    run: async () => { throw new Error("no"); },
  });
  await assert.doesNotReject(done);
});

test("active reports work outstanding until the queue drains", async () => {
  const queue = new ActionQueue();
  const seen = [];
  queue.onActiveChange = (active) => { seen.push(active); };
  const gate = deferred();
  const done = queue.enqueue({ label: "slow", coalesceKey: null, run: () => gate.promise });
  await settle();
  gate.resolve();
  await done;
  assert.deepEqual(seen, [true, false]);
});

test("every settlement is reported with its label and outcome", async () => {
  const queue = new ActionQueue();
  const settlements = [];
  queue.onSettled = (settlement) => { settlements.push(settlement); };
  await queue.enqueue({ label: "fine", coalesceKey: null, run: async () => {} });
  await queue.enqueue({
    label: "bad",
    coalesceKey: null,
    run: async () => { throw new Error("x"); },
  });
  const labels = settlements.map((one) => `${one.label}:${one.ok}`);
  assert.deepEqual(labels, ["fine:true", "bad:false"]);
  assert.equal(typeof settlements[0]?.waitedMs, "number");
  assert.equal(typeof settlements[0]?.ranMs, "number");
});

test("a throwing observer cannot break dispatch", async () => {
  const queue = new ActionQueue();
  queue.onActiveChange = () => { throw new Error("observer bug"); };
  queue.onSettled = () => { throw new Error("observer bug"); };
  const ran = [];
  await queue.enqueue({ label: "still runs", coalesceKey: null, run: async () => { ran.push(1); } });
  assert.deepEqual(ran, [1]);
});
