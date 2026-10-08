import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { flushSync } from "react-dom";
import { MantineProvider } from "@mantine/core";
import { theme } from "./mantine-theme.js";

type Portal = { container: HTMLElement; content: ReactNode; revision: number };

let root: Root | null = null;
const portals = new Map<string, Portal>();
let revision = 0;
let portalBatchDepth = 0;
let portalRenderPending = false;
const LocaleRevision = createContext(0);
const localeRefreshers = new Set<() => void>();

function LocaleProvider({ children }: { children: ReactNode }) {
  const [revisionValue, setRevision] = useState(0);
  useEffect(() => {
    const onLocaleChange = () => {
      setRevision((value) => value + 1);
      for (const refresh of localeRefreshers) refresh();
    };
    window.addEventListener("assemblash:localechange", onLocaleChange);
    return () => window.removeEventListener("assemblash:localechange", onLocaleChange);
  }, []);
  return <LocaleRevision.Provider value={revisionValue}>{children}</LocaleRevision.Provider>;
}

/** Subscribe to the page's single locale notification through the root provider. */
export function useLocaleRevision(): number {
  return useContext(LocaleRevision);
}

/** Register imperative canvas labels with the root's single locale listener. */
export function registerLocaleRefresh(refresh: () => void): () => void {
  localeRefreshers.add(refresh);
  return () => localeRefreshers.delete(refresh);
}

function renderPortals(): void {
  if (!root) throw new Error("The Mantine root has not started");
  const children = [...portals].map(([key, portal]) =>
    createPortal(portal.content, portal.container, key),
  );
  flushSync(() => root?.render(
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
      getRootElement={() => document.documentElement}
    >
      <LocaleProvider>{children}</LocaleProvider>
    </MantineProvider>,
  ));
}

function requestPortalRender(): void {
  portalRenderPending = true;
  if (portalBatchDepth > 0) return;
  portalRenderPending = false;
  renderPortals();
}

/** Apply a group of portal mounts and removals with one shared-root render. */
export function batchMantinePortals(run: () => void): void {
  portalBatchDepth++;
  try {
    run();
  } finally {
    portalBatchDepth--;
    if (portalBatchDepth === 0 && portalRenderPending) requestPortalRender();
  }
}

/** Start the page's only React root and its shared Mantine provider. */
export function startMantineRoot(container: HTMLElement): void {
  if (root) throw new Error("The Mantine root already started");
  root = createRoot(container);
  renderPortals();
}

/** Render a widget into a legacy canvas/controller mount point through the shared root. */
export function mountMantinePortal(
  key: string,
  container: HTMLElement,
  content: ReactNode,
): () => void {
  const id = ++revision;
  portals.set(key, { container, content, revision: id });
  requestPortalRender();
  return () => {
    if (portals.get(key)?.revision !== id) return;
    portals.delete(key);
    requestPortalRender();
  };
}
