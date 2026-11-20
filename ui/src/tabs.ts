/**
 * The open project tabs, as an ordered list with one active entry.
 *
 * This module owns order and identity only. It knows nothing about the
 * engine, the page, or what a tab holds: the editor keeps its own record for
 * each tab and asks this list where that record sits. One tab exists for each
 * project (decision D33 (c)), so the project id is the tab id.
 */

/** The page set a tab was opened with, and its page number in that set. */
export interface TabGroup {
  /** The name of the page set. */
  set: string;
  /** The page number in the set, from 1. */
  page: number;
  /** The number of pages in the set. */
  count: number;
}

/** One tab: the project it shows, and whether it changed while hidden. */
export interface TabEntry<T> {
  id: string;
  /** The editor's own record for this tab. */
  readonly record: T;
  /**
   * Set when another client changed the project while the tab was not the
   * visible one, and cleared when the person views the tab (D33 (a)).
   */
  changed: boolean;
  /** The page set of this tab, or `null` for a tab that is not in a set. */
  group: TabGroup | null;
}

/** What the strip draws for one tab. */
export interface TabView {
  id: string;
  changed: boolean;
  active: boolean;
  group: TabGroup | null;
}

/**
 * The strip order after a page set opens: the pages of the set in manifest
 * order, as one run.
 *
 * Tabs that are not pages of the set keep their order. The run goes where the
 * first page that was already open stood, or at the end when no page was
 * open. A page that was already open moves into the run: it is never a second
 * tab.
 */
export function pageSetOrder(current: readonly string[], pages: readonly string[]): string[] {
  const inSet = new Set(pages);
  const others = current.filter((id) => !inSet.has(id));
  const first = current.findIndex((id) => inSet.has(id));
  const at = first < 0
    ? others.length
    : current.slice(0, first).filter((id) => !inSet.has(id)).length;
  return [...others.slice(0, at), ...pages, ...others.slice(at)];
}

/** The persisted form of the open tabs: project ids in order, plus the active one. */
export interface OpenTabs {
  projects: string[];
  active: string | null;
}

/** The most tabs the list keeps. More would make the strip unusable. */
export const MAX_TABS = 64;

export class TabList<T> {
  private entries: Array<TabEntry<T>> = [];
  private activeId: string | null = null;

  /** Tabs in strip order. */
  get all(): ReadonlyArray<TabEntry<T>> {
    return this.entries;
  }

  get size(): number {
    return this.entries.length;
  }

  get active(): TabEntry<T> | null {
    return this.find(this.activeId);
  }

  find(id: string | null): TabEntry<T> | null {
    if (id === null) return null;
    return this.entries.find((entry) => entry.id === id) ?? null;
  }

  has(id: string): boolean {
    return this.find(id) !== null;
  }

  /**
   * Adds a tab at the end of the strip, or returns the tab that already shows
   * this project. A second open never adds a second tab (D33 (c)).
   */
  open(id: string, create: () => T): { entry: TabEntry<T>; added: boolean } {
    const existing = this.find(id);
    if (existing) return { entry: existing, added: false };
    if (this.entries.length >= MAX_TABS) throw new RangeError(`at most ${MAX_TABS} tabs`);
    const entry: TabEntry<T> = { id, record: create(), changed: false, group: null };
    this.entries.push(entry);
    return { entry, added: true };
  }

  /** Makes a tab the visible one. Viewing a tab clears its change marker. */
  activate(id: string | null): TabEntry<T> | null {
    const entry = this.find(id);
    this.activeId = entry ? entry.id : null;
    if (entry) entry.changed = false;
    return entry;
  }

  /**
   * Removes a tab. Returns the tab that becomes visible when the removed one
   * was visible: the right neighbour, else the left one, else none.
   */
  close(id: string): { removed: TabEntry<T> | null; next: TabEntry<T> | null } {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index < 0) return { removed: null, next: this.active };
    const [removed] = this.entries.splice(index, 1);
    if (this.activeId !== id) return { removed: removed ?? null, next: this.active };
    const next = this.entries[index] ?? this.entries[index - 1] ?? null;
    this.activeId = null;
    return { removed: removed ?? null, next };
  }

  /** Moves a tab to a new index in the strip. Out-of-range indexes clamp. */
  move(id: string, to: number): boolean {
    const from = this.entries.findIndex((entry) => entry.id === id);
    if (from < 0) return false;
    const target = Math.max(0, Math.min(this.entries.length - 1, Math.trunc(to)));
    if (target === from) return false;
    const [entry] = this.entries.splice(from, 1);
    this.entries.splice(target, 0, entry!);
    return true;
  }

  /**
   * Puts the tabs in this order. Ids that are not open are ignored. Open tabs
   * that the order leaves out stay after the others, in their old order.
   */
  arrange(order: readonly string[]): void {
    const placed = order
      .map((id) => this.find(id))
      .filter((entry, index, all): entry is TabEntry<T> => entry !== null && all.indexOf(entry) === index);
    const rest = this.entries.filter((entry) => !placed.includes(entry));
    this.entries = [...placed, ...rest];
  }

  /**
   * Marks the tabs of a page set with their page numbers, in manifest order.
   * Tabs that had this set before and are not in `pages` lose the mark. A tab
   * is in one set at most: the set opened last marks it.
   */
  setGroup(set: string, pages: readonly string[]): void {
    for (const entry of this.entries) {
      if (entry.group?.set === set) entry.group = null;
    }
    pages.forEach((id, index) => {
      const entry = this.find(id);
      if (entry) entry.group = { set, page: index + 1, count: pages.length };
    });
  }

  /** Gives a tab a new project id, for a project renamed while open. */
  rename(id: string, to: string): TabEntry<T> | null {
    const entry = this.find(id);
    if (!entry || (id !== to && this.has(to))) return null;
    if (this.activeId === id) this.activeId = to;
    entry.id = to;
    return entry;
  }

  /** Sets the change marker of a hidden tab. The visible tab never gets one. */
  markChanged(id: string): boolean {
    const entry = this.find(id);
    if (!entry || entry.id === this.activeId || entry.changed) return false;
    entry.changed = true;
    return true;
  }

  views(): TabView[] {
    return this.entries.map((entry) => ({
      id: entry.id,
      changed: entry.changed,
      active: entry.id === this.activeId,
      group: entry.group,
    }));
  }

  serialize(): OpenTabs {
    return { projects: this.entries.map((entry) => entry.id), active: this.activeId };
  }
}

/**
 * Reads a persisted tab list defensively: anything that is not a list of
 * distinct non-empty strings is dropped, and the active id must be one of them.
 */
export function parseOpenTabs(value: unknown): OpenTabs {
  const empty: OpenTabs = { projects: [], active: null };
  if (!value || typeof value !== "object" || Array.isArray(value)) return empty;
  const raw = (value as Record<string, unknown>)["projects"];
  if (!Array.isArray(raw)) return empty;
  const projects: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string" || item.length === 0 || projects.includes(item)) continue;
    projects.push(item);
    if (projects.length === MAX_TABS) break;
  }
  const active = (value as Record<string, unknown>)["active"];
  return {
    projects,
    active: typeof active === "string" && projects.includes(active) ? active : projects[0] ?? null,
  };
}
