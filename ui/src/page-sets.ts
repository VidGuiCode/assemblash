/**
 * Page sets in the reference interface: which sets a search shows, and what
 * opening a set does to the tab strip.
 *
 * A page set is an ordered list of projects, kept by the engine in
 * `<workspace>/page-sets/<name>.json`. The engine resolves it: nested sets
 * are expanded, and a loop or a missing page is a typed refusal. This module
 * gets the resolved page list and plans the tabs. It knows nothing about the
 * page or the engine.
 */

import { MAX_TABS, pageSetOrder } from "./tabs.js";

/** The page sets that match a search: a part of the name, in any case. */
export function matchingPageSets(names: readonly string[], query: string): string[] {
  const wanted = query.trim().toLocaleLowerCase();
  return names.filter((name) => !wanted || name.toLocaleLowerCase().includes(wanted));
}

/** What opening a page set does, before anything is read. */
export type PageSetPlan =
  | {
    kind: "open";
    /** The pages in manifest order. */
    pages: string[];
    /** The pages that have no tab yet, in manifest order. */
    toOpen: string[];
    /** The strip order after the set is open. */
    order: string[];
  }
  | { kind: "empty" }
  | { kind: "tooMany"; count: number; max: number };

/**
 * Plans the tabs for a page set.
 *
 * A page that already has a tab keeps it: it is never opened two times
 * (D33 (c)). The plan refuses a set with no pages, and a set whose new tabs
 * would go past the tab limit, so that nothing opens part of the way.
 */
export function planPageSetOpen(
  pages: readonly string[],
  open: readonly string[],
  max = MAX_TABS,
): PageSetPlan {
  if (pages.length === 0) return { kind: "empty" };
  const toOpen = pages.filter((id) => !open.includes(id));
  if (open.length + toOpen.length > max) {
    return { kind: "tooMany", count: pages.length, max };
  }
  return { kind: "open", pages: [...pages], toOpen, order: pageSetOrder(open, pages) };
}
