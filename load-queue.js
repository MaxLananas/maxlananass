// Queue only the nearby images. Batch enqueues before starting so the first observer
// entry cannot jump ahead of a more important, actually visible photo.
export class LoadQueue {
  constructor(limit = 4) {
    this.limit = limit;
    this.pending = new Map();
    this.active = new Map();
    this.paused = false;
    this.scheduled = false;
  }

  enqueue(key, priority, task) {
    const active = this.active.get(key);
    if (active && !active.signal.aborted) return;
    this.pending.set(key, { key, priority, task });
    this.schedule();
  }

  cancel(key, abortActive = false) {
    this.pending.delete(key);
    // Scrolling away must not throw away bytes that have already been downloaded.
    if (abortActive) this.active.get(key)?.abort();
  }

  setLimit(limit) {
    this.limit = Math.max(1, limit);
    this.schedule();
  }

  setPaused(paused) {
    this.paused = paused;
    if (!paused) this.schedule();
  }

  schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    queueMicrotask(() => {
      this.scheduled = false;
      this.drain();
    });
  }

  drain() {
    if (this.paused) return;
    while (this.active.size < this.limit && this.pending.size) {
      const next = [...this.pending.values()].filter((item) => !this.active.has(item.key))
        .sort((a, b) => a.priority - b.priority)[0];
      if (!next) break;
      this.pending.delete(next.key);
      const controller = new AbortController();
      this.active.set(next.key, controller);
      Promise.resolve()
        .then(() => next.task(controller.signal))
        .catch(() => {}) // A failed image must not block every following image.
        .finally(() => {
          this.active.delete(next.key);
          this.schedule();
        });
    }
  }
}
