import test from "node:test";
import assert from "node:assert/strict";
import { LoadQueue } from "../../load-queue.js";

const tick = () => new Promise((resolve) => setImmediate(resolve));
const deferred = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; };

test("batches intersection entries, prioritizes visible images and respects concurrency", async () => {
  const queue = new LoadQueue(2);
  const started = [];
  const gates = Array.from({ length: 4 }, deferred);
  [900, 20, 5, 1200].forEach((priority, index) => queue.enqueue(index, priority, () => { started.push(index); return gates[index].promise; }));
  await tick();
  assert.deepEqual(started, [2, 1]);
  assert.equal(queue.active.size, 2);
  gates[2].resolve(); await tick();
  assert.deepEqual(started, [2, 1, 0]);
  gates[1].resolve(); gates[0].resolve(); await tick();
  gates[3].resolve(); await tick();
  assert.equal(queue.active.size, 0);
  assert.equal(queue.pending.size, 0);
});

test("deduplicates active and pending images without extra requests", async () => {
  const queue = new LoadQueue(1);
  const gate = deferred();
  const calls = [];
  queue.enqueue("same", 100, () => calls.push("obsolete"));
  queue.enqueue("same", 0, () => { calls.push("latest"); return gate.promise; });
  await tick();
  queue.enqueue("same", -1, () => calls.push("duplicate"));
  gate.resolve(); await tick();
  assert.deepEqual(calls, ["latest"]);
});

test("scroll cancellation removes pending work, not already-downloaded bytes", async () => {
  const queue = new LoadQueue(1);
  const gate = deferred();
  let signal;
  let unnecessary = false;
  queue.enqueue("visible", 0, (s) => { signal = s; return gate.promise; });
  queue.enqueue("distant", 100, () => { unnecessary = true; });
  await tick();
  queue.cancel("visible");
  queue.cancel("distant");
  assert.equal(signal.aborted, false);
  gate.resolve(); await tick();
  assert.equal(unnecessary, false);
});

test("a cancelled image can re-enter before the previous task settles", async () => {
  const queue = new LoadQueue(3);
  const gate = deferred();
  const calls = [];
  queue.enqueue("photo", 1, async (signal) => { calls.push("old"); await gate.promise; assert.equal(signal.aborted, true); });
  await tick();
  queue.cancel("photo", true);
  queue.enqueue("photo", 0, () => { calls.push("new"); });
  await tick();
  assert.deepEqual(calls, ["old"]);
  gate.resolve(); await tick(); await tick();
  assert.deepEqual(calls, ["old", "new"]);
  assert.equal(queue.active.size, 0);
});

test("a modal/hidden tab pauses new requests and resumes without losing work", async () => {
  const queue = new LoadQueue(2);
  const calls = [];
  queue.setPaused(true);
  queue.enqueue("photo", 0, () => calls.push("photo"));
  await tick();
  assert.deepEqual(calls, []);
  queue.setLimit(1);
  queue.setPaused(false);
  await tick();
  assert.deepEqual(calls, ["photo"]);
});

test("failures and synchronous throws always release the slot", async () => {
  const queue = new LoadQueue(1);
  const calls = [];
  queue.enqueue("broken", 0, () => { throw new Error("HTTP 404"); });
  queue.enqueue("good", 1, () => calls.push("good"));
  await tick(); await tick();
  assert.deepEqual(calls, ["good"]);
  assert.equal(queue.active.size, 0);
});
