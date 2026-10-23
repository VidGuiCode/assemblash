import { useRef, useState } from "react";
import { Button, Group, Select, SimpleGrid, Stack, Table, Text, Textarea, TextInput } from "@mantine/core";
import type { Color, Layer } from "./api.js";
import type { FontSelectorHost } from "./fonts.js";
import { FontFamilyControl } from "./font-selector-mantine.js";
import { PaintInput } from "./paint-input.js";
import { t, type MessageKey } from "./i18n.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { editableRun, newRun, patchRun, patchRunPaint, runsChanged, runsKey, startRuns, type RunField, type RunObject, type RunsCapture, type RunsDraft } from "./text-runs.js";

export type RunsSubmit = { status: "applied" } | { status: "refused" | "committed" | "unknown"; error: string };
export interface RunsProps {
  capture: RunsCapture;
  layer: Extract<Layer, { type: "text" }>;
  drafts: Map<string, RunsDraft>;
  disabled: boolean;
  fonts: FontSelectorHost;
  submit(draft: RunsDraft): Promise<RunsSubmit>;
  reload(): Promise<string | null>;
}
function RunsEditor(props: RunsProps) {
  useLocaleRevision();
  const [, redraw] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const key = runsKey(props.capture);
  const draft = props.drafts.get(key);
  const disabled = props.disabled || !!draft?.pending || !!draft?.reconcile;
  const refresh = () => redraw((value) => value + 1);
  const focus = (selector: string) => requestAnimationFrame(() => {
    const target = root.current ?? [...document.querySelectorAll<HTMLElement>("[data-runs-editor]")].find((element) => element.dataset["runsIdentity"] === key);
    target?.querySelector<HTMLElement>(selector)?.focus();
  });
  const save = (next: RunsDraft) => { props.drafts.set(key, next); refresh(); };
  const edit = () => { save(startRuns(props.capture)); focus("#runs-add"); };
  const patch = (index: number, field: RunField, value: unknown) => {
    if (!draft || disabled) return;
    const row = draft.rows[index]!;
    if (!editableRun(row)) return;
    row.raw = patchRun(row.raw, field, value);
    draft.error = "";
    save(draft);
  };
  async function apply() {
    if (!draft || disabled || !runsChanged(draft)) return;
    draft.pending = true; draft.error = ""; save(draft);
    const result = await props.submit(draft);
    draft.pending = false;
    if (result.status === "applied") props.drafts.delete(key);
    else { draft.error = result.error; draft.reconcile = result.status === "committed" || result.status === "unknown"; }
    refresh();
    focus(result.status === "applied" ? "#runs-edit" : "#runs-error");
  }
  async function reload() {
    if (!draft || draft.pending) return;
    draft.pending = true; save(draft);
    const error = await props.reload();
    if (error) { draft.pending = false; draft.error = error; save(draft); focus("#runs-error"); }
    else focus("textarea[data-run-text], #runs-add");
  }
  function override(row: RunObject, index: number, field: Exclude<RunField, "text" | "color">, label: MessageKey, inherited: string | number) {
    const value = row[field];
    const active = value != null;
    const id = `run-${draft!.rows[index]!.key}-${field}`;
    const name = `${t("runs.row", { number: index + 1 })}: ${t(label)}`;
    return <Stack gap={4} key={field} style={{ minWidth: 0 }}>
      <Select aria-label={`${name}: ${t("runs.mode")}`} label={t(label)} size="xs" value={active ? "value" : "inherit"}
        data={[{ value: "inherit", label: t("runs.inherit") }, { value: "value", label: t("runs.override") }]} disabled={disabled}
        onChange={(mode) => patch(index, field, mode === "inherit" ? undefined : inherited)} />
      {field === "fontFamily" ? <FontFamilyControl host={props.fonts} label={name} value={String(active ? value : inherited)} disabled={disabled || !active} onCommit={(family) => patch(index, field, family)} />
        : field === "fontStyle" ? <Select id={id} aria-label={name} size="xs" value={String(active ? value : inherited)} disabled={disabled || !active}
          data={[{ value: "normal", label: t("runs.normal") }, { value: "italic", label: t("runs.italic") }]} onChange={(next) => patch(index, field, next)} />
        : <TextInput id={id} aria-label={name} size="xs" type="number" value={String(active ? value : inherited)} disabled={disabled || !active}
          onChange={(event) => { const raw = event.currentTarget.value; patch(index, field, raw === "" ? "" : Number(raw)); }} />}
    </Stack>;
  }
  return <div ref={root} className="runs-editor" data-runs-editor data-runs-identity={key} onKeyDown={(event) => event.stopPropagation()}>
    <Stack gap="xs">
      <Text fw={600}>{t("runs.title")}</Text>
      <Text size="xs" c="dimmed">{t("runs.help")}</Text>
      {!draft ? <Button id="runs-edit" size="xs" variant="light" disabled={props.disabled} onClick={edit}>{t("runs.edit")}</Button> : <>
        {draft.capture.version !== props.capture.version && <Text size="xs" c="orange" role="status">{t("runs.conflict")}</Text>}
        <Table aria-label={t("runs.title")} style={{ tableLayout: "fixed", width: "100%" }}><Table.Tbody>
          {draft.rows.map((row, index) => <Table.Tr key={row.key} data-run-row={row.key}><Table.Td style={{ padding: "8px 0" }}>
            <Stack gap="xs">
              <Group justify="space-between" gap={4}>
                <Text size="sm" fw={600}>{t("runs.row", { number: index + 1 })}</Text>
                <Group gap={4} wrap="wrap">
                  {([[-1, "runs.up"], [1, "runs.down"]] as const).map(([delta, label]) => <Button size="compact-xs" variant="subtle" key={delta}
                    aria-label={`${t(label)}: ${index + 1}`} data-run-move={delta} disabled={disabled || index + delta < 0 || index + delta >= draft.rows.length}
                    onClick={() => { [draft.rows[index], draft.rows[index + delta]] = [draft.rows[index + delta]!, draft.rows[index]!]; save(draft); focus(`[data-run-row="${row.key}"] textarea`); }}>{t(label)}</Button>)}
                  <Button size="compact-xs" variant="subtle" color="red" aria-label={`${t("runs.delete")}: ${index + 1}`} data-run-delete disabled={disabled}
                    onClick={() => { draft.rows.splice(index, 1); save(draft); focus(draft.rows.length ? `[data-run-row="${draft.rows[Math.min(index, draft.rows.length - 1)]!.key}"] textarea` : "#runs-add"); }}>{t("runs.delete")}</Button>
                </Group>
              </Group>
              {!editableRun(row) ? <>
                <Text size="xs" c="orange">{t("runs.unsupported")}</Text>
                <Textarea aria-label={`${t("runs.raw")}: ${index + 1}`} value={JSON.stringify(row.raw, null, 2)} readOnly autosize maxRows={6} />
              </> : <>
                <Textarea data-run-text aria-label={`${t("runs.text")}: ${index + 1}`} label={t("runs.text")} value={row.raw.text} autosize minRows={2} disabled={disabled}
                  onChange={(event) => patch(index, "text", event.currentTarget.value)} />
                <SimpleGrid cols={2} spacing="xs">
                  {override(row.raw, index, "fontFamily", "editor.fontFamily", props.layer.fontFamily)}
                  {override(row.raw, index, "fontSize", "properties.fontSize", props.layer.fontSize)}
                  {override(row.raw, index, "fontWeight", "properties.weight", props.layer.fontWeight ?? 400)}
                  {override(row.raw, index, "fontStyle", "properties.style", props.layer.fontStyle ?? "normal")}
                  {override(row.raw, index, "letterSpacing", "properties.letterSpacing", props.layer.letterSpacing ?? 0)}
                </SimpleGrid>
                <Select size="xs" label={t("properties.colour")} aria-label={`${t("runs.fillMode")}: ${index + 1}`} data-run-fill-mode
                  value={!Object.hasOwn(row.raw, "color") ? "inherit" : row.raw["color"] === null ? "none" : "value"} disabled={disabled}
                  data={[{ value: "inherit", label: t("runs.inherit") }, { value: "none", label: t("runs.noFill") }, { value: "value", label: t("runs.override") }]}
                  onChange={(mode) => patch(index, "color", mode === "inherit" ? undefined : mode === "none" ? null : props.layer.color ?? "#000000")} />
                {Object.hasOwn(row.raw, "color") && row.raw["color"] !== null && <PaintInput key={`${row.key}-${typeof row.raw["color"]}`} id={`run-${row.key}-paint`}
                  label={`${t("properties.colour")}: ${index + 1}`} value={row.raw["color"] as Color} disabled={disabled}
                  onCommit={(paint) => patch(index, "color", patchRunPaint((draft.rows[index]!.raw as RunObject)["color"], paint))} />}
              </>}
            </Stack>
          </Table.Td></Table.Tr>)}
        </Table.Tbody></Table>
        <Group gap="xs">
          <Button id="runs-add" size="xs" variant="light" disabled={disabled} onClick={() => { const row = newRun(draft.rows.length === 0 && draft.capture.runs.length === 0 ? draft.capture.text : ""); draft.rows.push(row); save(draft); focus(`[data-run-row="${row.key}"] textarea`); }}>{t("runs.add")}</Button>
          <Button id="runs-clear" size="xs" variant="light" disabled={disabled || !draft.rows.length} onClick={() => { draft.rows = []; save(draft); focus("#runs-add"); }}>{t("runs.clear")}</Button>
          {draft.rows.some((row) => !editableRun(row)) && <Button id="runs-replace" size="xs" variant="light" disabled={disabled} onClick={() => { const row = newRun(draft.capture.text); draft.rows = [row]; save(draft); focus(`[data-run-row="${row.key}"] textarea`); }}>{t("runs.replace")}</Button>}
        </Group>
        {draft.error && <Text id="runs-error" role="alert" tabIndex={-1} size="xs" c="red">{draft.error}</Text>}
        {(draft.error || draft.capture.version !== props.capture.version) && <Button id="runs-reload" size="xs" variant="light" disabled={draft.pending} onClick={() => void reload()}>{t("runs.reload")}</Button>}
        <Group gap="xs">
          <Button id="runs-apply" size="xs" disabled={disabled || !runsChanged(draft)} loading={draft.pending} onClick={() => void apply()}>{t("runs.apply")}</Button>
          <Button id="runs-cancel" size="xs" variant="default" disabled={draft.pending} onClick={() => { props.drafts.delete(key); refresh(); focus("#runs-edit"); }}>{t("runs.cancel")}</Button>
        </Group>
      </>}
    </Stack>
  </div>;
}
let serial = 0;
export function mountRunsEditor(target: HTMLElement, props: RunsProps): () => void {
  return mountMantinePortal(`text-runs-${++serial}`, target, <RunsEditor {...props} />);
}
