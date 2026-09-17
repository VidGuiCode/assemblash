/**
 * A serial queue for interface actions that talk to the engine.
 *
 * It exists because the interface used to drop an action that arrived while
 * another was still in flight: a fast human lost edits with no message. The
 * queue never drops. Every action either runs, or is replaced by a newer
 * action that says the same thing more recently (latest-wins coalescing,
 * which only the caller can permit, and only for absolute intents).
 *
 * The queue owns no engine knowledge. It orders `run` callbacks, keeps one
 * running at a time, and reports outcomes. Version safety comes from the
 * callbacks themselves: each reads the document version when it is
 * dispatched, and since dispatches are serial and each refreshes the local
 * document before the next runs, the version a request carries is always the
 * one the server last reported. A fast human therefore cannot produce a
 * version conflict against their own session.
 */

/** One interface action, queued until every earlier action has settled. */
export interface QueuedAction {
  /** What this action is called in status and error messages. */
  label: string;
  /**
   * Latest-wins coalescing key. Two actions that are queued but not yet
   * dispatched and share a key do not both run: the newer replaces the
   * older, and the older's promise resolves as superseded.
   *
   * Only the caller can decide this is safe, and it is only safe for
   * *absolute* intents — "set this property to this value". A delta intent
   * (a drag's `move dx dy`, a delete) must pass `null`: dropping an earlier
   * delta would silently lose the distance it carried.
   */
  coalesceKey: string | null;
  /** Performs the action. Never called for an action that was superseded. */
  run: () => Promise<void>;
  /** Called when the action failed, with the error `run` rejected with. */
  onError?: (error: unknown) => void;
  /**
   * Called when a newer same-key action replaced this one before it was
   * dispatched. Lets the caller undo an optimistic echo it may have painted.
   */
  onSuperseded?: () => void;
}

/** What the queue tells the caller about after an action settles. */
export interface QueueSettlement {
  /** The action's label. */
  label: string;
  /** Whether `run` completed without throwing. */
  ok: boolean;
  /** Whether the action never ran because a newer same-key one replaced it. */
  superseded: boolean;
  /** Milliseconds the action waited in the queue before dispatch. */
  waitedMs: number;
  /** Milliseconds `run` took, when it ran. */
  ranMs: number | null;
}

/** An action waiting in the queue, with its settlement and its timestamp. */
interface PendingEntry {
  action: QueuedAction;
  settled: { resolve: () => void };
  queuedAt: number;
}

/**
 * Serialises interface actions. One instance per page; the reference
 * interface creates it once beside its document state.
 */
export class ActionQueue {
  private readonly pending: PendingEntry[] = [];
  private running = false;

  /**
   * Observers for page chrome: busy indicators, instrumentation. Called on
   * every state change and every settlement; must not throw.
   */
  onActiveChange: ((active: boolean) => void) | null = null;
  onSettled: ((settlement: QueueSettlement) => void) | null = null;

  /** Whether an action is running or waiting, i.e. work is outstanding. */
  get active(): boolean {
    return this.running || this.pending.length > 0;
  }

  /** How many actions are waiting. Exposed for diagnostics, not decisions. */
  get size(): number {
    return this.pending.length;
  }

  /**
   * Queues an action. The returned promise settles when the action has run
   * (or failed), or when a newer same-key action superseded it. It never
   * rejects: failures are the caller's `onError` business, so that callers
   * chaining `.finally(...)` — tearing down a drag preview, say — are never
   * handed an unhandled rejection.
   */
  enqueue(action: QueuedAction): Promise<void> {
    return new Promise<void>((resolve) => {
      const settled = { resolve };
      if (action.coalesceKey !== null) {
        // Latest-wins: an undispatched action with the same key says the
        // same thing, only staler. Replace it, tell it why, resolve it.
        for (let i = this.pending.length - 1; i >= 0; i--) {
          const earlier = this.pending[i];
          if (earlier && earlier.action.coalesceKey === action.coalesceKey) {
            this.pending.splice(i, 1);
            try {
              earlier.action.onSuperseded?.();
            } catch {
              // A listener that throws cannot be allowed to break the queue.
            }
            earlier.settled.resolve();
            this.emitSettled(earlier.action.label, false, true, earlier.queuedAt, null);
            break;
          }
        }
      }
      this.pending.push({
        action,
        settled,
        queuedAt: performance.now(),
      });
      if (!this.running) void this.pump();
      else this.emitActive();
    });
  }

  private async pump(): Promise<void> {
    this.running = true;
    this.emitActive();
    try {
      for (;;) {
        const next = this.pending.shift();
        if (!next) break;
        const startedAt = performance.now();
        try {
          await next.action.run();
          next.settled.resolve();
          this.emitSettled(next.action.label, true, false, next.queuedAt, startedAt);
        } catch (error) {
          // One refusal must not discard the actions behind it: they are
          // separate intents, each still owed a dispatch. Report and go on.
          try {
            next.action.onError?.(error);
          } catch {
            // As above: a throwing listener is the listener's problem.
          }
          next.settled.resolve();
          this.emitSettled(next.action.label, false, false, next.queuedAt, startedAt);
        }
      }
    } finally {
      this.running = false;
      this.emitActive();
    }
  }

  private emitActive(): void {
    try {
      this.onActiveChange?.(this.active);
    } catch {
      // Observers must not be able to break dispatch.
    }
  }

  private emitSettled(
    label: string,
    ok: boolean,
    superseded: boolean,
    queuedAt: number,
    startedAt: number | null,
  ): void {
    try {
      this.onSettled?.({
        label,
        ok,
        superseded,
        waitedMs: Math.round(performance.now() - queuedAt),
        ranMs: startedAt === null ? null : Math.round(performance.now() - startedAt),
      });
    } catch {
      // Observers must not be able to break dispatch.
    }
  }
}
