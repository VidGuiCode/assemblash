// Mantine controls for the editor's export modal.

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Checkbox, Group, Modal, NumberInput, Paper, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

import * as api from "./api.js";
import {
  DEFAULT_JPEG_QUALITY,
  dimensionsFor,
  downloadTargetFor,
  exportOptionsFor,
  FORMATS,
  hasBleed,
  RESOLUTIONS,
} from "./export.js";
import type { ExportFormat } from "./export.js";
import { formatNumber, t } from "./i18n.js";
import { refusalMessage } from "./refusals.js";
import type { Document } from "./api.js";

/** The page set of the visible tab, as the export dialog needs it. */
export interface ExportPageSet {
  set: string;
  count: number;
}

interface ExportHost {
  project(): string | null;
  document(): Document | null;
  /** The page set the visible tab belongs to, or `null`. */
  pageSet(): ExportPageSet | null;
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

function labelOf(format: ExportFormat): string {
  return FORMATS.find((one) => one.id === format)?.label ?? format.toUpperCase();
}

/** The readable text of a refusal: the known ones translated, the others as the engine wrote them. */
function refusalText(error: unknown): string {
  if (error instanceof api.ApiError) return refusalMessage(error) ?? `${error.message} (${error.code})`;
  return t("errors.unexpected", { message: String(error) });
}

function ExportView({ host, controller }: { host: ExportHost; controller: { current: (() => void) | null } }) {
  const [format, setFormat] = useState<ExportFormat>("png");
  const [resolution, setResolution] = useState("8k");
  const [quality, setQuality] = useState(DEFAULT_JPEG_QUALITY);
  const [print, setPrint] = useState(false);
  const [wholeSet, setWholeSet] = useState(false);
  const [name, setName] = useState("assemblash-export");
  const [error, setError] = useState<{ code: string; text: string } | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  const [download, setDownload] = useState<{ url: string; filename: string } | null>(null);
  const localeTick = useLocaleRevision();
  const heldUrl = useRef<string | null>(null);

  const currentDocument = host.document();
  const pageSet = host.pageSet();
  const vector = format === "svg";
  const bleed = currentDocument ? hasBleed(currentDocument) : false;
  const setExport = format === "pdf" && wholeSet && pageSet !== null;
  const selectedResolution = RESOLUTIONS.find((one) => one.id === resolution) ?? RESOLUTIONS[0]!;

  function releaseDownload() {
    if (heldUrl.current) URL.revokeObjectURL(heldUrl.current);
    heldUrl.current = null;
    setDownload(null);
    setDone(null);
    setError(null);
  }

  /** What the dialog will make, before the export runs. */
  function plannedSummary(): string {
    const document = host.document();
    if (!document) return t("export.noProject");
    if (setExport && pageSet) return t("export.pageSetSummary", { count: formatNumber(pageSet.count), set: pageSet.set });
    const output = vector
      ? { width: document.canvas.width, height: document.canvas.height }
      : dimensionsFor(document, selectedResolution);
    const size = `${formatNumber(output.width)} × ${formatNumber(output.height)}`;
    if (format === "svg") return `${size} ${t("export.svgSummary")}`;
    if (format === "png") return `${size} ${t("export.pngSummary")}`;
    return `${size} ${t("export.rasterSummary", { format: labelOf(format) })}`;
  }

  useEffect(() => {
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
      setQuality(DEFAULT_JPEG_QUALITY);
      setPrint(false);
      setWholeSet(false);
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

  function chooseFormat(next: ExportFormat) {
    if (next === format) return;
    releaseDownload();
    setFormat(next);
    // A PDF page holds the image at the chosen resolution. Ten pages at 8K
    // are a very large file, so a PDF starts at the document size.
    if (next === "pdf") setResolution("original");
  }

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
    const options = exportOptionsFor({
      format: chosen,
      quality,
      print,
      pageSet: setExport && pageSet ? pageSet.set : null,
    }, document);
    const label = labelOf(chosen);

    await host.guard(t("export.openButton"), async () => {
      releaseDownload();
      setBusy(true);
      try {
        const result = chosen === "svg"
          ? { width: output.width, height: output.height, bytes: 0, pages: undefined }
          : await api.exportDocument(project, cleanName, output.scale, options);
        const blob = await api.fetchBlob(target.url);
        heldUrl.current = URL.createObjectURL(blob);
        setDownload({ url: heldUrl.current, filename: target.filename });
        const bytes = chosen === "svg" ? blob.size : result.bytes;
        if (result.pages !== undefined) {
          setDone(t("export.readyPages", { format: label, pages: formatNumber(result.pages), size: humanBytes(bytes) }));
          host.say(t("export.exportedPages", { pages: formatNumber(result.pages), format: label }));
        } else {
          setDone(`${formatNumber(result.width)} × ${formatNumber(result.height)} ${t("export.ready", { format: label, size: humanBytes(bytes) })}`);
          host.say(t("export.exported", { width: formatNumber(result.width), height: formatNumber(result.height), format: label }));
        }
      } catch (failure) {
        // The refusal shows in the dialog, where the person chose what was
        // refused, and in the status bar like every other refusal.
        setError({ code: failure instanceof api.ApiError ? failure.code : "unexpected", text: refusalText(failure) });
        throw failure;
      } finally {
        setBusy(false);
      }
    });
  }

  const summary = busy
    ? setExport && pageSet
      ? t("export.pageSetSummary", { count: formatNumber(pageSet.count), set: pageSet.set })
      : t("export.renderingSize", {
        width: formatNumber(vector || !currentDocument ? currentDocument?.canvas.width ?? 0 : dimensionsFor(currentDocument, selectedResolution).width),
        height: formatNumber(vector || !currentDocument ? currentDocument?.canvas.height ?? 0 : dimensionsFor(currentDocument, selectedResolution).height),
      })
    : done ?? (error ? "" : plannedSummary());

  const close = () => { setOpened(false); releaseDownload(); };

  return <Modal id="export-dialog" data-state={opened ? "open" : "closed"} opened={opened} onClose={close} title={null} withCloseButton={false} centered size="lg" withinPortal={false} keepMounted>
    <div className="export-mantine-root">
    <form id="export-form" onSubmit={(event) => void submit(event)}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div><Text size="xs" c="dimmed">{t("export.eyebrow")}</Text><Text component="h2" fw={700} size="lg">{t("export.title")}</Text></div>
          <Button type="button" variant="subtle" aria-label={t("common.close")} onClick={close}>×</Button>
        </Group>
        <Stack gap="xs">
          <Text fw={600}>{t("export.format")}</Text>
          <SimpleGrid id="export-formats" role="radiogroup" aria-label={t("export.format")} cols={{ base: 2, xs: 3 }} spacing="xs">
            {FORMATS.map((one) => <Paper component="button" type="button" key={one.id} data-format={one.id} role="radio" aria-checked={format === one.id} withBorder p="sm" bg={format === one.id ? "red.0" : undefined} style={{ cursor: "pointer", textAlign: "left" }} onClick={() => chooseFormat(one.id)}>
              <Stack gap={4}><Group gap="xs"><i className={`ph ${one.icon}`} aria-hidden="true" /><b>{one.label}</b></Group><Text size="sm">{t(one.detail)}</Text></Stack>
            </Paper>)}
          </SimpleGrid>
        </Stack>
        {format === "pdf" && pageSet
          ? <Stack gap="xs">
              <Text fw={600}>{t("export.pages")}</Text>
              <Group id="export-pages" role="radiogroup" aria-label={t("export.pages")} grow>
                {([["this", t("export.pagesThis")], ["set", t("export.pagesSet", { count: formatNumber(pageSet.count), set: pageSet.set })]] as const).map(([id, text]) => {
                  const checked = (id === "set") === wholeSet;
                  return <Paper component="button" type="button" key={id} data-pages={id} role="radio" aria-checked={checked} withBorder p="sm" bg={checked ? "red.0" : undefined} style={{ cursor: "pointer", textAlign: "left" }} onClick={() => { releaseDownload(); setWholeSet(id === "set"); }}>
                    <Group gap="xs"><i className={`ph ${id === "set" ? "ph-files" : "ph-file"}`} aria-hidden="true" /><b>{text}</b></Group>
                  </Paper>;
                })}
              </Group>
            </Stack>
          : null}
        <Stack id="export-resolution-row" aria-disabled={vector} gap="xs">
          <Text fw={600}>{t("export.resolution")}</Text>
          <Group id="export-options" role="radiogroup" aria-label={t("export.resolution")} aria-disabled={vector} grow>
            {RESOLUTIONS.map((one) => {
              const output = currentDocument ? dimensionsFor(currentDocument, one) : null;
              return <Paper component="button" type="button" key={one.id} data-resolution={one.id} disabled={vector} role="radio" aria-checked={resolution === one.id && !vector} withBorder p="sm" bg={resolution === one.id && !vector ? "red.0" : undefined} style={{ cursor: vector ? "not-allowed" : "pointer", textAlign: "left" }} onClick={() => { setResolution(one.id); releaseDownload(); }}>
                <Stack gap={4}><Group gap="xs"><i className={`ph ${one.icon}`} aria-hidden="true" /><b>{one.id === "original" ? t("export.original") : one.id === "8k" ? t("export.resolution8k") : one.label}</b></Group>
                <Text size="sm">{output ? `${formatNumber(output.width)} × ${formatNumber(output.height)}` : t(one.id === "original" ? "export.documentSize" : `export.longEdge${one.id}` as "export.longEdge2k" | "export.longEdge4k" | "export.longEdge8k")}</Text></Stack>
              </Paper>;
            })}
          </Group>
        </Stack>
        {format === "jpeg"
          ? <NumberInput id="export-quality" label={t("export.quality")} description={t("export.qualityHint")} value={quality} min={1} max={100} step={1} clampBehavior="strict" allowDecimal={false} required onChange={(value) => { releaseDownload(); setQuality(typeof value === "number" ? value : Number(value) || DEFAULT_JPEG_QUALITY); }} />
          : null}
        {format === "pdf" && bleed
          ? <Checkbox id="export-print" label={t("export.print")} description={t("export.printHint")} checked={print} onChange={(event) => { releaseDownload(); setPrint(event.currentTarget.checked); }} />
          : null}
        <TextInput id="export-name" label={t("export.fileName")} value={name} onChange={(event) => setName(event.currentTarget.value)} pattern="[A-Za-z0-9_-]+" maxLength={60} required />
        <Text id="export-summary" aria-live="polite" fw={500}>{summary}</Text>
        {error
          ? <Text id="export-error" role="alert" c="red" fw={500} data-error-code={error.code}>{error.text}</Text>
          : null}
        <Group justify="flex-end">
          <Button id="export-download" component="a" href={download?.url ?? "#"} download={download?.filename} hidden={!download} variant="default"><i className="ph ph-download-simple" aria-hidden="true" /> {t("common.download")}</Button>
          <Button id="export-cancel" type="button" variant="default" onClick={close}>{t("common.cancel")}</Button>
          <Button id="export-confirm" type="submit" loading={busy} value="default"><i className={`ph ${busy ? "ph-circle-notch" : "ph-export"}`} aria-hidden="true" /> {busy ? t("export.rendering") : t("export.confirm", { format: labelOf(format) })}</Button>
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
