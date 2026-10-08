import { useRef, useState } from "react";
import { ActionIcon, Button, ColorInput, Group, Popover, SegmentedControl, Stack, Text, Textarea } from "@mantine/core";
import type { Color } from "./api.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { t } from "./i18n.js";

export interface PaintInputProps {
  id: string;
  label: string;
  value: Color;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
  onCommit(value: Color): void;
  clear?: { label: string; className?: string; title?: string; disabled?: boolean; onClear(): void };
}

function paintText(value: Color): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`,
    ).join(",")}}`;
  }
  return JSON.stringify(value);
}

function samePaint(left: Color, right: Color): boolean {
  if (typeof left === "string" && typeof right === "string") {
    const rgba = (value: string) => {
      const match = /^#([\da-f]{6})([\da-f]{2})?$/i.exec(value);
      return match ? `${match[1]!.toLowerCase()}${(match[2] ?? "ff").toLowerCase()}` : value;
    };
    return rgba(left) === rgba(right);
  }
  return canonicalJson(left) === canonicalJson(right);
}

function PaintInput({ id, label, value, className, compact = false, disabled = false, onCommit, clear }: PaintInputProps) {
  const localeRevision = useLocaleRevision();
  const initialSolid = typeof value === "string" ? value : "#000000";
  const [mode, setMode] = useState<"solid" | "json">(typeof value === "string" ? "solid" : "json");
  const [solid, setSolid] = useState(initialSolid);
  const [json, setJson] = useState(paintText(value));
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);
  const lastCommitted = useRef<Color>(value);
  void localeRevision;

  function commitSolid(raw: string): void {
    let next = raw.trim();
    if (!/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(next)) return;
    // Mantine's `hexa` input adds `ff` when a person enters six digits. Keep
    // the established six-digit document spelling when the current colour
    // also uses that spelling; save eight digits when alpha is meaningful.
    if (typeof lastCommitted.current === "string"
      && /^#[\da-f]{6}$/i.test(lastCommitted.current)
      && /^#([\da-f]{6})ff$/i.test(next)) {
      next = next.slice(0, 7);
    }
    setError("");
    if (samePaint(lastCommitted.current, next)) return;
    lastCommitted.current = next;
    onCommit(next);
  }

  function commitJson(): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError(t("paint.jsonSyntaxError"));
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !("kind" in parsed)) {
      setError(t("paint.jsonObjectError"));
      return;
    }
    setError("");
    const next = parsed as Color;
    if (samePaint(lastCommitted.current, next)) return;
    lastCommitted.current = next;
    onCommit(next);
  }

  const editor = <Stack gap="xs" className="paint-input" data-paint-editor={id}>
    <SegmentedControl
      aria-label={label}
      value={mode}
      onChange={(next) => setMode(next as "solid" | "json")}
      data={[
        { value: "solid", label: t("paint.solid") },
        { value: "json", label: t("paint.json") },
      ]}
      disabled={disabled}
      size="xs"
    />
    {mode === "solid" ? <Group align="end" wrap="nowrap" gap="xs">
      <ColorInput
        id={`${id}-solid`}
        classNames={className ? { input: className } : undefined}
        label={label}
        value={solid}
        format="hexa"
        fixOnBlur={false}
        disabled={disabled}
        onChange={(next) => setSolid(next)}
        onChangeEnd={commitSolid}
        onBlur={(event) => commitSolid(event.currentTarget.value)}
        aria-label={label}
        data-paint-solid={id}
        style={{ flex: 1 }}
      />
      {clear ? <Button type="button" size="sm" variant="light" className={clear.className}
        title={clear.title} disabled={disabled || clear.disabled} onClick={clear.onClear}>{clear.label}</Button> : null}
    </Group> : <>
      <Textarea
        id={`${id}-json`}
        classNames={{ input: className ? `${className} paint-json` : "paint-json" }}
        label={label}
        value={json}
        onChange={(event) => setJson(event.currentTarget.value)}
        minRows={4}
        autosize
        disabled={disabled}
        error={error || undefined}
        aria-label={label}
        data-paint-json={id}
      />
      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">{t("paint.jsonHint")}</Text>
        <Group gap="xs"><Button id={`${id}-apply-json`} type="button" size="xs" variant="light" disabled={disabled} onClick={commitJson}>{t("paint.applyJson")}</Button>
          {clear ? <Button type="button" size="xs" variant="light" className={clear.className}
            title={clear.title} disabled={disabled || clear.disabled} onClick={clear.onClear}>{clear.label}</Button> : null}</Group>
      </Group>
    </>}
    {error ? <Text size="xs" c="red" role="alert">{error}</Text> : null}
  </Stack>;

  if (!compact) return editor;

  const swatchStyle = typeof value === "string"
    ? { backgroundColor: value }
    : { background: "linear-gradient(135deg, var(--color-accent) 0 50%, var(--color-surface-subtle) 50% 100%)" };
  return <Popover id={id} opened={opened} onChange={setOpened} position="bottom-start" offset={6}
    width="min(20rem, calc(100vw - 1rem))" withinPortal trapFocus returnFocus zIndex={400} shadow="md">
    <Popover.Target>
      <ActionIcon className="paint-swatch-trigger" type="button" variant="default"
        aria-label={label} title={label} aria-haspopup="dialog" aria-expanded={opened}
        data-paint-trigger={id} disabled={disabled}
        onClick={() => setOpened((current) => !current)}>
        <span className="paint-swatch" aria-hidden="true" style={swatchStyle} />
      </ActionIcon>
    </Popover.Target>
    <Popover.Dropdown className="paint-popover" data-paint-popover={id}>
      {editor}
    </Popover.Dropdown>
  </Popover>;
}

let nextPaintId = 0;

/** Mount one shared solid/gradient editor into the current inspector field. */
export function mountPaintInput(target: HTMLElement, props: PaintInputProps): () => void {
  return mountMantinePortal(`paint-${++nextPaintId}`, target, <PaintInput {...props} />);
}
