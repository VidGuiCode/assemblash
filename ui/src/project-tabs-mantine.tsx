// The project tab strip, rendered with Mantine. The editor owns the tabs and
// their records; this strip only draws them and reports what the person did.

import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent } from "react";
import { CloseButton, UnstyledButton } from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { t } from "./i18n.js";

export interface ProjectTabView {
  id: string;
  name: string;
  active: boolean;
  changed: boolean;
}

export interface ProjectTabsHost {
  activate(id: string): void;
  close(id: string): void;
  move(id: string, to: number): void;
}

export interface ProjectTabsController {
  setTabs(tabs: readonly ProjectTabView[]): void;
}

const DRAG_TYPE = "application/x-assemblash-tab";

function ProjectTabs({ host, bind }: { host: ProjectTabsHost; bind: (set: (tabs: readonly ProjectTabView[]) => void) => void }) {
  useLocaleRevision();
  const [tabs, setTabs] = useState<readonly ProjectTabView[]>([]);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const focusAfterRender = useRef<string | null>(null);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => { bind(setTabs); }, [bind]);
  useEffect(() => {
    const wanted = focusAfterRender.current;
    if (!wanted) return;
    focusAfterRender.current = null;
    strip.current?.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(wanted)}"]`)?.focus();
  }, [tabs]);

  if (tabs.length === 0) return null;

  const focusTab = (index: number): void => {
    const target = tabs[(index + tabs.length) % tabs.length];
    if (target) strip.current?.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(target.id)}"]`)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number, tab: ProjectTabView): void => {
    const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    // The strip's keys never reach the canvas shortcuts: an arrow here must
    // not also nudge the selection.
    if (step !== 0 || ["Home", "End", "Delete"].includes(event.key)) event.stopPropagation();
    if (step !== 0 && event.altKey && event.shiftKey) {
      // Reordering from the keyboard: the same change a drag makes.
      event.preventDefault();
      focusAfterRender.current = tab.id;
      host.move(tab.id, index + step);
      return;
    }
    if (step !== 0) {
      event.preventDefault();
      focusTab(index + step);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focusTab(event.key === "Home" ? 0 : tabs.length - 1);
    } else if (event.key === "Delete") {
      event.preventDefault();
      host.close(tab.id);
    }
  };

  const onAuxClick = (event: MouseEvent<HTMLButtonElement>, id: string): void => {
    if (event.button !== 1) return;
    event.preventDefault();
    host.close(id);
  };

  const dropTarget = (event: DragEvent<HTMLElement>, index: number): number => {
    const box = event.currentTarget.getBoundingClientRect();
    return event.clientX > box.left + box.width / 2 ? index + 1 : index;
  };

  return (
    <div
      ref={strip}
      className="project-tabs"
      role="tablist"
      aria-label={t("tabs.label")}
      title={t("tabs.reorderHint")}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropIndex(null);
      }}
    >
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          className="project-tab"
          data-active={tab.active || undefined}
          data-changed={tab.changed || undefined}
          data-drop={dropIndex === index ? "before" : dropIndex === index + 1 && index === tabs.length - 1 ? "after" : undefined}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(DRAG_TYPE, tab.id);
            event.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(event) => {
            if (!event.dataTransfer.types.includes(DRAG_TYPE)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            setDropIndex(dropTarget(event, index));
          }}
          onDrop={(event) => {
            const id = event.dataTransfer.getData(DRAG_TYPE);
            setDropIndex(null);
            if (!id) return;
            event.preventDefault();
            const from = tabs.findIndex((one) => one.id === id);
            let to = dropTarget(event, index);
            // Removing the tab first shifts every later index left by one.
            if (from >= 0 && from < to) to -= 1;
            host.move(id, to);
          }}
          onDragEnd={() => setDropIndex(null)}
        >
          <UnstyledButton
            className="project-tab-button"
            role="tab"
            id={`project-tab-${tab.id}`}
            data-tab-id={tab.id}
            aria-selected={tab.active}
            tabIndex={tab.active ? 0 : -1}
            title={tab.changed ? `${tab.name} — ${t("tabs.changed")}` : tab.name}
            onClick={() => host.activate(tab.id)}
            onAuxClick={(event) => onAuxClick(event, tab.id)}
            onMouseDown={(event) => { if (event.button === 1) event.preventDefault(); }}
            onKeyDown={(event) => onKeyDown(event, index, tab)}
          >
            <span className="project-tab-name">{tab.name}</span>
            {tab.changed
              ? <span className="project-tab-marker" data-tab-marker={tab.id} role="img" aria-label={t("tabs.changed")} />
              : null}
          </UnstyledButton>
          <CloseButton
            size="sm"
            className="project-tab-close"
            data-tab-close={tab.id}
            tabIndex={-1}
            aria-label={t("tabs.close", { name: tab.name })}
            title={t("tabs.close", { name: tab.name })}
            onClick={() => host.close(tab.id)}
          />
        </div>
      ))}
    </div>
  );
}

/** Mount the tab strip into its container through the shared Mantine root. */
export function mountProjectTabs(host: ProjectTabsHost, target: HTMLElement): ProjectTabsController {
  let pending: readonly ProjectTabView[] = [];
  let setter: ((tabs: readonly ProjectTabView[]) => void) | null = null;
  const bind = (set: (tabs: readonly ProjectTabView[]) => void): void => {
    setter = set;
    set(pending);
  };
  mountMantinePortal("project-tabs", target, <ProjectTabs host={host} bind={bind} />);
  return {
    setTabs(tabs) {
      pending = tabs;
      setter?.(tabs);
    },
  };
}
