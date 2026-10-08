// Mantine controls for the editor's export modal.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Group, Modal, Paper, Stack, Text, TextInput } from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

import * as api from "./api.js";
import { dimensionsFor, downloadTargetFor, FORMATS, RESOLUTIONS } from "./export.js";
import type { ExportFormat } from "./export.js";
import { formatNumber, t } from "./i18n.js";
import type { Document } from "./api.js";

interface ExportHost {
  project(): string | null;
  document(): Document | null;
  say(message: string, kind?: "info" | "error"): void;
  guard(what: string, run: () => Promise<void>): Promise<void>;
}

function byId<T extends HTMLElement>(id: string): T {
  const node = window.document.getElementById(id);
  if (!node) throw new Error(`missing element #${id}`);
  return node as T;
}

function safeName(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "").slice(0, 60);
  return cleaned || "assemblash-export";
}

function humanBytes(bytes: number): string {
  if (bytes < 1024) return t("export.bytes", { count: formatNumber(bytes) });
  if (bytes < 1024 * 1024) return `${formatNumber(Math.round(bytes / 102.4) / 10)} KB`;
  return `${formatNumber(Math.round(bytes / (1024 * 1024) * 10) / 10)} MB`;
}

function ExportView({ host, controller }: { host: ExportHost; controller: { current: (() => void) | null } }) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [resolution, setResolution] = useState("8k");
  const [name, setName] = useState("assemblash-export");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  const [download, setDownload] = useState<{ url: string; filename: string } | null>(null);
  const localeTick = useLocaleRevision();
  const heldUrl = useRef<string | null>(null);

  const currentDocument = host.document();
  const vector = format === "svg";
  const selectedResolution = RESOLUTIONS.find((one) => one.id === resolution) ?? RESOLUTIONS[0]!;

  function releaseDownload() {
    if (heldUrl.current) URL.revokeObjectURL(heldUrl.current);
    heldUrl.current = null;
    setDownload(null);
  }

  function updateSummary(nextFormat = format, nextResolution = resolution) {
    const document = host.document();
    if (!document) {
      setSummary(t("export.noProject"));
      return;
    }
    const output = nextFormat === "svg"
      ? { width: document.canvas.width, height: document.canvas.height }
      : dimensionsFor(document, RESOLUTIONS.find((one) => one.id === nextResolution) ?? RESOLUTIONS[0]!);
    setSummary(`${formatNumber(output.width)} × ${formatNumber(output.height)} ${t(nextFormat === "svg" ? "export.svgSummary" : "export.pngSummary")}`);
  }

  useEffect(() => {
    const close = () => { setOpened(false); releaseDownload(); };
    const requestOpen = () => {
      const document = host.document();
      const project = host.project();
      if (!document || !project) {
        host.say(t("export.projectRequired"), "error");
        return;
      }
      releaseDownload();
      setName(safeName(document.name ?? project));
      setFormat("png");
      setResolution("8k");
      const output = dimensionsFor(document, RESOLUTIONS.find((one) => one.id === "8k")!);
      setSummary(`${formatNumber(output.width)} × ${formatNumber(output.height)} ${t("export.pngSummary")}`);
      setOpened(true);
    };
    controller.current = requestOpen;
    window.addEventListener("assemblash:export-open", requestOpen);
    return () => {
      window.removeEventListener("assemblash:export-open", requestOpen);
      controller.current = null;
      if (heldUrl.current) URL.revokeObjectURL(heldUrl.current);
    };
  }, [controller, host]);
  void localeTick;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const project = host.project();
    const document = host.document();
    if (!project || !document) return;
    const chosen = format;
    const output = chosen === "svg"
      ? { width: document.canvas.width, height: document.canvas.height, scale: 1 }
      : dimensionsFor(document, selectedResolution);
    const cleanName = safeName(name);
    setName(cleanName);
    const target = downloadTargetFor(chosen, project, document, cleanName);

    await host.guard(t("export.openButton"), async () => {
      releaseDownload();
      setBusy(true);
      setSummary(t("export.renderingSize", { width: formatNumber(output.width), height: formatNumber(output.height) }));
      try {
        const result = chosen === "svg"
          ? { width: output.width, height: output.height, bytes: 0 }
          : await api.exportDocument(project, cleanName, output.scale);
        const blob = await api.fetchBlob(target.url);
        heldUrl.current = URL.createObjectURL(blob);
        setDownload({ url: heldUrl.current, filename: target.filename });
        const bytes = chosen === "svg" ? blob.size : result.bytes;
        setSummary(`${formatNumber(result.width)} × ${formatNumber(result.height)} ${t("export.ready", { format: chosen.toUpperCase(), size: humanBytes(bytes) })}`);
        host.say(t("export.exported", { width: formatNumber(result.width), height: formatNumber(result.height), format: chosen.toUpperCase() }));
      } finally {
        setBusy(false);
      }
    });
  }

  return <Modal id="export-dialog" data-state={opened ? "open" : "closed"} opened={opened} onClose={() => { setOpened(false); releaseDownload(); }} title={null} withCloseButton={false} centered size="lg" withinPortal={false} keepMounted>
    <div className="export-mantine-root">
    <form id="export-form" onSubmit={(event) => void submit(event)}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div><Text size="xs" c="dimmed">{t("export.eyebrow")}</Text><Text component="h2" fw={700} size="lg">{t("export.title")}</Text></div>
          <Button type="button" variant="subtle" aria-label={t("common.close")} onClick={() => { setOpened(false); releaseDownload(); }}>×</Button>
        </Group>
        <Stack gap="xs">
          <Text fw={600}>{t("export.format")}</Text>
          <Group id="export-formats" role="radiogroup" aria-label={t("export.format")} grow>
            {FORMATS.map((one) => <Paper component="button" type="button" key={one.id} data-format={one.id} role="radio" aria-checked={format === one.id} withBorder p="sm" bg={format === one.id ? "red.0" : undefined} style={{ cursor: "pointer", textAlign: "left" }} onClick={() => { if (format !== one.id) { releaseDownload(); setFormat(one.id); updateSummary(one.id); } }}>
              <Stack gap={4}><Group gap="xs"><i className={`ph ${one.icon}`} aria-hidden="true" /><b>{one.label}</b></Group><Text size="sm">{t(one.id === "png" ? "export.pngDetail" : "export.svgDetail")}</Text></Stack>
            </Paper>)}
          </Group>
        </Stack>
        <Stack id="export-resolution-row" aria-disabled={vector} gap="xs">
          <Text fw={600}>{t("export.resolution")}</Text>
          <Group id="export-options" role="radiogroup" aria-label={t("export.resolution")} aria-disabled={vector} grow>
            {RESOLUTIONS.map((one) => {
              const output = currentDocument ? dimensionsFor(currentDocument, one) : null;
              return <Paper component="button" type="button" key={one.id} disabled={vector} role="radio" aria-checked={resolution === one.id && !vector} withBorder p="sm" bg={resolution === one.id && !vector ? "red.0" : undefined} style={{ cursor: vector ? "not-allowed" : "pointer", textAlign: "left" }} onClick={() => { setResolution(one.id); releaseDownload(); updateSummary(format, one.id); }}>
                <Stack gap={4}><Group gap="xs"><i className={`ph ${one.icon}`} aria-hidden="true" /><b>{one.id === "original" ? t("export.original") : one.id === "8k" ? t("export.resolution8k") : one.label}</b></Group>
                <Text size="sm">{output ? `${formatNumber(output.width)} × ${formatNumber(output.height)}` : t(one.id === "original" ? "export.documentSize" : `export.longEdge${one.id}` as "export.longEdge2k" | "export.longEdge4k" | "export.longEdge8k")}</Text></Stack>
              </Paper>;
            })}
          </Group>
        </Stack>
        <TextInput id="export-name" label={t("export.fileName")} value={name} onChange={(event) => setName(event.currentTarget.value)} pattern="[A-Za-z0-9_-]+" maxLength={60} required />
        <Text id="export-summary" aria-live="polite" fw={500}>{summary}</Text>
        <Group justify="flex-end">
          <Button id="export-download" component="a" href={download?.url ?? "#"} download={download?.filename} hidden={!download} variant="default"><i className="ph ph-download-simple" aria-hidden="true" /> {t("common.download")}</Button>
          <Button id="export-cancel" type="button" variant="default" onClick={() => { setOpened(false); releaseDownload(); }}>{t("common.cancel")}</Button>
          <Button id="export-confirm" type="submit" loading={busy} value="default"><i className={`ph ${busy ? "ph-circle-notch" : "ph-export"}`} aria-hidden="true" /> {busy ? t("export.rendering") : t("export.confirm", { format: format.toUpperCase() })}</Button>
        </Group>
      </Stack>
    </form>
    </div></Modal>;
}

/** Mount the Mantine export modal. */
export function mountExport(host: ExportHost): { open: () => void } {
  const container = byId<HTMLElement>("export-dialog-mount");
  const controller: { current: (() => void) | null } = { current: null };
  mountMantinePortal("export", container, <ExportView host={host} controller={controller} />);
  return { open: () => {
    if (controller.current) controller.current();
    else queueMicrotask(() => controller.current?.());
  } };
}
