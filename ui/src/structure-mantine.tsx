import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ActionIcon, Box, Button, Group, Stack, Tabs, Text, TextInput, Tree, useTree, type RenderTreeNodePayload, type TreeNodeData } from "@mantine/core";
import * as api from "./api.js";
import { t } from "./i18n.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

export type DockView = "properties" | "layers" | "history";
export type ReorderPosition = { at: "root"; index?: number } | { at: "in"; parent: string; index?: number };
export interface StructureSnapshot {
  document: api.Document | null;
  selectedIds: readonly string[];
  query: string;
  history: { entries: readonly api.HistoryEntry[]; position: number; head: number } | null;
  dock?: DockView;
}
export interface StructureCommands {
  setQuery(query: string): void;
  select(id: string, additive: boolean): void;
  toggleVisibility(id: string): void;
  toggleLocked(id: string): void;
  rename(id: string, name: string): void;
  reorder(draggedId: string, targetId: string, position: ReorderPosition): void;
  groupSelection(): void;
  deleteSelection(): void;
  undo(): void;
  redo(): void;
  showDock(view: DockView): void;
  contextMenu?(id: string, x: number, y: number): void;
}

const icon = (name: string) => <i className={`ph ${name}`} aria-hidden="true" />;
function layerName(layer: api.Layer): string {
  return layer.name ?? (layer.type === "text" ? layer.text : layer.type) ?? layer.type;
}
function layerIcon(layer: api.Layer): string {
  if (layer.type === "shape") {
    return ({ rect: "ph-square", ellipse: "ph-circle", line: "ph-line-segment", path: "ph-bezier-curve" } as Record<string, string>)[api.shapeKindOf(layer) ?? ""] ?? "ph-shapes";
  }
  return ({ text: "ph-text-t", image: "ph-image", svg: "ph-pen-nib", group: "ph-stack" } as Record<string, string>)[layer.type] ?? "ph-square";
}

function RenameField({ layer, finish }: { layer: api.Layer; finish(name: string | null): void }) {
  const input = useRef<HTMLInputElement>(null);
  const finished = useRef(false);
  useEffect(() => { input.current?.focus(); input.current?.select(); }, []);
  const complete = (commit: boolean) => {
    if (finished.current) return;
    finished.current = true;
    finish(commit ? input.current?.value.trim() ?? "" : null);
  };
  return <TextInput ref={input} size="xs" autoFocus defaultValue={layerName(layer)}
    classNames={{ input: "layer-rename" }} aria-label={t("layers.renameHint")}
    onClick={(event) => event.stopPropagation()} onBlur={() => complete(true)}
    onKeyDown={(event) => {
      event.stopPropagation();
      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
        complete(event.key === "Enter");
      }
    }} />;
}

function LayerRow({ layer, depth, parent, inheritedGuard, snapshot, commands, elementProps, renaming, startRename, finishRename, expanded, hasChildren, toggleExpanded }: {
  layer: api.Layer; depth: number; parent: string | null; inheritedGuard: boolean;
  snapshot: StructureSnapshot; commands: StructureCommands;
  elementProps: RenderTreeNodePayload["elementProps"];
  renaming: boolean; startRename(): void; finishRename(): void;
  expanded: boolean; hasChildren: boolean; toggleExpanded(): void;
}) {
  const [dragging, setDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState(false);
  const touch = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number; fired: boolean } | null>(null);
  useEffect(() => () => { if (touch.current) clearTimeout(touch.current.timer); }, []);
  const selected = snapshot.selectedIds.includes(layer.id);
  const editable = !inheritedGuard && api.isEditable(layer);
  const guarded = inheritedGuard || Boolean(api.whyNotEditable(layer));
  const mutableLock = !inheritedGuard && !layer.protected && !layer.readOnly;
  const openMenu = (x: number, y: number) => {
    if (!selected) commands.select(layer.id, false);
    commands.contextMenu?.(layer.id, x, y);
  };
  const stopTouch = () => { if (touch.current) clearTimeout(touch.current.timer); };
  return <Box {...elementProps} className={`${elementProps.className} layer${selected ? " selected" : ""}${guarded ? " guarded" : ""}${layer.visible === false ? " hidden-layer" : ""}${dragging ? " dragging" : ""}${dropTarget ? " drop-target" : ""}`}
    data-id={layer.id} data-type={layer.type} data-parent={parent ?? ""}
    style={{ ...elementProps.style, "--layer-depth": depth, paddingInlineStart: 8 + depth * 16 } as CSSProperties}
    draggable={editable}
    onClick={(event) => {
      if (touch.current?.fired) { touch.current = null; return; }
      elementProps.onClick(event);
      commands.select(layer.id, event.shiftKey || event.ctrlKey || event.metaKey);
    }}
    onContextMenu={(event) => { event.preventDefault(); openMenu(event.clientX, event.clientY); }}
    onPointerDown={(event) => {
      if (event.pointerType !== "touch" || !commands.contextMenu) return;
      stopTouch();
      const x = event.clientX, y = event.clientY;
      touch.current = { x, y, fired: false, timer: setTimeout(() => {
        if (touch.current) touch.current.fired = true;
        openMenu(x, y);
      }, 450) };
    }}
    onPointerMove={(event) => {
      if (touch.current && Math.hypot(event.clientX - touch.current.x, event.clientY - touch.current.y) > 8) stopTouch();
    }} onPointerUp={stopTouch} onPointerCancel={stopTouch}
    onDragStart={(event) => { event.dataTransfer.setData("text/plain", layer.id); setDragging(true); }}
    onDragEnd={() => { setDragging(false); setDropTarget(false); }}
    onDragOver={(event) => { event.preventDefault(); setDropTarget(true); }}
    onDragLeave={() => setDropTarget(false)}
    onDrop={(event) => {
      event.preventDefault(); setDropTarget(false);
      const moved = event.dataTransfer.getData("text/plain");
      if (!moved || moved === layer.id || !snapshot.document) return;
      const flat = api.flatten(api.layersOf(snapshot.document));
      const container = parent ? flat.find((row) => row.layer.id === parent)?.layer : null;
      const siblings = container?.type === "group" ? container.children ?? [] : api.layersOf(snapshot.document);
      const index = Math.max(0, siblings.findIndex((one) => one.id === layer.id) + 1);
      commands.reorder(moved, layer.id, layer.type === "group" ? { at: "in", parent: layer.id } : parent ? { at: "in", parent, index } : { at: "root", index });
    }}>
    <Group gap="xs" wrap="nowrap">
      {hasChildren ? <ActionIcon className="layer-control" size="sm" variant="subtle" data-layer-toggle={layer.id}
        title={t(expanded ? "layers.collapseGroup" : "layers.expandGroup")} aria-label={t(expanded ? "layers.collapseGroup" : "layers.expandGroup")}
        aria-expanded={expanded} onClick={(event) => { event.stopPropagation(); toggleExpanded(); }}>
        {icon(expanded ? "ph-caret-down" : "ph-caret-right")}</ActionIcon> : null}
      <ActionIcon className="layer-control" size="sm" variant="subtle" disabled={!editable}
        title={t(layer.visible === false ? "layers.show" : "layers.hide")} aria-label={t(layer.visible === false ? "layers.show" : "layers.hide")}
        onClick={(event) => { event.stopPropagation(); commands.toggleVisibility(layer.id); }}>{icon(layer.visible === false ? "ph-eye-slash" : "ph-eye")}</ActionIcon>
      <Box className="layer-icon">{icon(layerIcon(layer))}</Box>
      <Box style={{ flex: 1, minWidth: 0 }}>
        {renaming ? <RenameField layer={layer} finish={(name) => { finishRename(); if (name !== null && name !== (layer.name ?? "")) commands.rename(layer.id, name); }} />
          : <Text component="span" className="name" size="sm" truncate title={api.whyNotEditable(layer) ?? t("layers.renameHint")}
            onDoubleClick={(event) => { event.stopPropagation(); if (editable) startRename(); }}>{layerName(layer)}</Text>}
      </Box>
      <ActionIcon className="layer-control" size="sm" variant="subtle" disabled={!mutableLock}
        title={t(layer.locked ? "layers.unlock" : "layers.lock")} aria-label={t(layer.locked ? "layers.unlock" : "layers.lock")}
        onClick={(event) => { event.stopPropagation(); commands.toggleLocked(layer.id); }}>{icon(layer.locked ? "ph-lock" : "ph-lock-open")}</ActionIcon>
    </Group>
  </Box>;
}

export function LayerTree({ snapshot, commands }: { snapshot: StructureSnapshot; commands: StructureCommands }) {
  useLocaleRevision();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const layers = snapshot.document ? api.layersOf(snapshot.document) : [];
  type LayerNode = TreeNodeData & { layer: api.Layer; parent: string | null; guarded: boolean };
  const data = useMemo(() => {
    const query = snapshot.query.trim().toLowerCase();
    const matches = (layer: api.Layer): boolean => layerName(layer).toLowerCase().includes(query)
      || (layer.type === "group" && (layer.children ?? []).some(matches));
    const nodes = (children: readonly api.Layer[], parent: string | null, guarded: boolean): LayerNode[] =>
      [...children].reverse().filter((layer) => !query || matches(layer)).map((layer) => ({
        value: layer.id, label: layerName(layer), layer, parent, guarded,
        ...(layer.type === "group" ? { children: nodes(layer.children ?? [], layer.id, guarded || !api.isEditable(layer)) } : {}),
      }));
    return nodes(snapshot.document ? api.layersOf(snapshot.document) : [], null, false);
  }, [snapshot.document, snapshot.query]);
  const lookup = useMemo(() => {
    const result = new Map<string, LayerNode>();
    const append = (nodes: TreeNodeData[]) => { for (const node of nodes) { result.set(node.value, node as LayerNode); if (node.children) append(node.children); } };
    append(data);
    return result;
  }, [data]);
  const expandedState = useMemo(() => Object.fromEntries([...lookup.keys()].map((id) => [id, expanded[id] ?? true])), [lookup, expanded]);
  const tree = useTree({
    multiple: true,
    selectedState: [...snapshot.selectedIds],
    expandedState,
    onExpandedStateChange: setExpanded,
    onSelectedStateChange(ids) {
      if (!ids.length) return;
      commands.select(ids[0]!, false);
      for (const id of ids.slice(1)) commands.select(id, true);
    },
  });
  if (!data.length) return <Box component="ul" id="layers" role="tree" aria-label={t("layers.tab")} m={0} p={0} style={{ listStyle: "none" }}>
    <Box component="li" className={`layers-empty${layers.length ? " compact" : ""}`} p="md">
      <Stack gap="xs" align="center"><Box>{icon(layers.length ? "ph-magnifying-glass" : "ph-stack-simple")}</Box>
        <Text fw={600}>{t(layers.length ? "layers.noMatching" : "layers.none")}</Text>
        <Text size="sm" c="dimmed">{t(layers.length ? "layers.trySearch" : "layers.emptyHint")}</Text>
      </Stack>
    </Box>
  </Box>;
  return <Tree id="layers" aria-label={t("layers.tab")} data={data} tree={tree} m={0} p={0}
    expandOnClick={false} expandOnSpace={false} selectOnClick={false} allowRangeSelection={false}
    onKeyDown={(event) => {
      const item = event.target as HTMLElement;
      if (item.getAttribute("role") !== "treeitem" && !item.classList.contains("layer")) return;
      const node = lookup.get(item.dataset["value"] ?? "");
      if (!node) return;
      if (event.key === "F2") {
        event.preventDefault(); event.stopPropagation();
        if (!node.guarded && api.isEditable(node.layer)) setRenaming(node.value);
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); event.stopPropagation(); commands.select(node.value, event.shiftKey || event.ctrlKey || event.metaKey);
      }
      if (event.key === "F10" && event.shiftKey) {
        event.preventDefault(); event.stopPropagation();
        if (!snapshot.selectedIds.includes(node.value)) commands.select(node.value, false);
        const rect = (item.classList.contains("layer") ? item : item.querySelector(".layer")!).getBoundingClientRect();
        commands.contextMenu?.(node.value, rect.left + 24, rect.top + 24);
      }
    }}
    renderNode={({ node, level, elementProps, expanded: nodeExpanded, hasChildren }) => {
      const { layer, parent, guarded } = node as LayerNode;
      return <LayerRow layer={layer} depth={level - 1} parent={parent} inheritedGuard={guarded}
        snapshot={snapshot} commands={commands} elementProps={elementProps} renaming={renaming === layer.id}
        startRename={() => setRenaming(layer.id)} finishRename={() => setRenaming(null)}
        expanded={nodeExpanded} hasChildren={hasChildren} toggleExpanded={() => tree.toggleExpanded(layer.id)} />;
    }} />;
}

export function HistoryList({ snapshot }: { snapshot: StructureSnapshot }) {
  useLocaleRevision();
  return <Box component="ol" id="history" m={0} p="sm">
    {[...(snapshot.history?.entries ?? [])].reverse().map((entry) => <Box component="li" key={entry.transaction}
      className={entry.position > (snapshot.history?.position ?? 0) ? "undone" : undefined} py="xs">
      <Text size="sm" c={entry.position > (snapshot.history?.position ?? 0) ? "dimmed" : undefined}>
        {`${entry.position}. ${entry.kind} — ${entry.actor.kind}${entry.actor.detail ? ` (${entry.actor.detail})` : ""}`}
      </Text>
    </Box>)}
  </Box>;
}

export function StructurePanel({ snapshot, commands }: { snapshot: StructureSnapshot; commands: StructureCommands }) {
  useLocaleRevision();
  const [dock, setDock] = useState<DockView>(snapshot.dock ?? "properties");
  useEffect(() => { if (snapshot.dock) setDock(snapshot.dock); }, [snapshot.dock]);
  const flat = snapshot.document ? api.flatten(api.layersOf(snapshot.document)) : [];
  const selected = flat.filter((row) => snapshot.selectedIds.includes(row.layer.id));
  const editable = selected.length > 0 && selected.every((row) => {
    if (!api.isEditable(row.layer)) return false;
    let parent = row.parent;
    while (parent) {
      const ancestor = flat.find((entry) => entry.layer.id === parent);
      if (!ancestor || !api.isEditable(ancestor.layer)) return false;
      parent = ancestor.parent;
    }
    return true;
  });
  const open = (value: string | null) => { if (value === "properties" || value === "layers" || value === "history") { setDock(value); commands.showDock(value); } };
  return <Tabs value={dock} onChange={open} keepMounted keepMountedMode="display-none" className="structure-tabs"
    styles={{
      root: { display: "flex", width: "100%", height: "100%", minHeight: 0, flexDirection: "column" },
      list: {
        display: "flex",
        width: "100%",
        flex: "0 0 auto",
        borderBottom: "1px solid var(--color-line-strong)",
        backgroundColor: "var(--color-surface-subtle)",
      },
      tab: {
        minWidth: 0,
        minHeight: "var(--inspector-height)",
        flex: "1 1 0",
        paddingInline: "var(--space-2)",
        whiteSpace: "nowrap",
      },
      panel: { width: "100%", minHeight: 0, flex: "1 1 auto", overflow: "auto" },
    }}>
    <Tabs.List>
      <Tabs.Tab id="properties-tab" value="properties">{t("properties.tab")}</Tabs.Tab>
      <Tabs.Tab id="layers-tab" value="layers">{t("layers.tab")}</Tabs.Tab>
      <Tabs.Tab id="history-tab" value="history">{t("history.tab")}</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="properties" id="properties-panel" className="dock-view"><div id="advanced-inspector" /></Tabs.Panel>
    <Tabs.Panel value="layers" id="layers-view" className="dock-view">
      <Stack className="layers-content" gap="sm" p="sm">
        <TextInput id="layer-search" value={snapshot.query} disabled={layersEmpty(snapshot.document)}
          placeholder={t(layersEmpty(snapshot.document) ? "layers.noSearch" : "layers.searchPlaceholder")}
          aria-label={t("layers.searchPlaceholder")} onChange={(event) => commands.setQuery(event.currentTarget.value)} />
        <LayerTree snapshot={snapshot} commands={commands} />
        <Group gap="xs"><Button id="group-layers" variant="default" size="xs" disabled={!editable || selected.length < 2} onClick={commands.groupSelection}>{t("layers.groupButton")}</Button>
          <Button id="delete-layer" variant="light" color="red" size="xs" disabled={!editable} onClick={commands.deleteSelection}>{t("layers.deleteButton")}</Button></Group>
      </Stack>
    </Tabs.Panel>
    <Tabs.Panel value="history" id="history-view" className="dock-view"><HistoryList snapshot={snapshot} /></Tabs.Panel>
  </Tabs>;
}
function layersEmpty(document: api.Document | null): boolean {
  return !document || api.layersOf(document).length === 0;
}

/** Update presentation from the controller. Operations stay in typed command callbacks. */
export function mountStructurePanel(target: HTMLElement, initialSnapshot: StructureSnapshot, commands: StructureCommands) {
  let update = (_snapshot: StructureSnapshot): void => {};
  function Connected() {
    const [snapshot, setSnapshot] = useState(initialSnapshot);
    useEffect(() => { update = (next) => setSnapshot({ ...next }); return () => { update = () => {}; }; }, []);
    return <StructurePanel snapshot={snapshot} commands={commands} />;
  }
  const destroy = mountMantinePortal("structure", target, <Connected />);
  return { setSnapshot: (snapshot: StructureSnapshot) => update(snapshot), destroy };
}
