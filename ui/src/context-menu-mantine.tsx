import { useEffect, useState } from "react";
import { Button, Divider, Paper, Stack } from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { t, type MessageKey } from "./i18n.js";

export type ContextMenuItem = { kind: "item"; key: MessageKey; icon: string; disabled?: boolean; run(): void } | { kind: "separator" };
type MenuState = { open: boolean; items: readonly ContextMenuItem[]; x: number; y: number };

function ContextMenuView({ state, onClose }: { state: MenuState; onClose(): void }) {
  const localeRevision = useLocaleRevision();
  void localeRevision;
  useEffect(() => {
    if (!state.open) return;
    document.querySelector<HTMLButtonElement>("#context-menu button[role=menuitem]:not(:disabled)")?.focus();
  }, [state.open, state.items]);
  return <Paper id="context-menu" className="context-menu" role="menu" tabIndex={-1}
    hidden={!state.open} shadow="md" p="xs" style={{ position: "fixed", left: state.x, top: state.y, zIndex: 500 }}
    onKeyDown={(event) => {
      const items = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)')];
      if (!items.length) return;
      const current = items.indexOf(document.activeElement as HTMLButtonElement);
      let next = current;
      if (event.key === "ArrowDown") next = (current + 1 + items.length) % items.length;
      else if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = items.length - 1;
      else if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); onClose(); return; }
      else return;
      event.preventDefault();
      items[next]?.focus();
    }}>
    <Stack gap={4}>
      {state.items.map((item, index) => item.kind === "separator"
        ? <Divider key={`separator-${index}`} role="separator" />
        : <Button key={`${item.key}-${index}`} type="button" role="menuitem" className="context-menu-item"
          variant="subtle" disabled={item.disabled} leftSection={<i className={`ph ${item.icon}`} aria-hidden="true" />}
          onClick={() => { onClose(); item.run(); }}>{t(item.key)}</Button>)}
    </Stack>
  </Paper>;
}

/** Mount the shared-root context menu and return its controller. */
export function mountContextMenu(target: HTMLElement) {
  const initial: MenuState = { open: false, items: [], x: 8, y: 8 };
  let current = initial;
  let setState = (_next: MenuState): void => {};
  function Connected() {
    const [state, set] = useState(initial);
    useEffect(() => { setState = (next) => { current = next; set(next); }; return () => { setState = () => {}; }; }, []);
    return <ContextMenuView state={state} onClose={() => setState({ ...current, open: false })} />;
  }
  const destroy = mountMantinePortal("context-menu", target, <Connected />);
  return {
    open(items: readonly ContextMenuItem[], x: number, y: number) {
      const next = { open: true, items, x: Math.min(window.innerWidth - 240, Math.max(8, x)), y: Math.min(window.innerHeight - 400, Math.max(8, y)) };
      current = next;
      setState(next);
    },
    close() { setState({ ...current, open: false }); },
    isOpen() { return current.open; },
    destroy,
  };
}
