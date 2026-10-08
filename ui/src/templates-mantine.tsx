// Mantine controls for filling a template and rendering variants.

import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from "react";
import { Button, Group, Paper, Select, Stack, Text, TextInput } from "@mantine/core";

import * as api from "./api.js";
import { formatCount, formatNumber, t } from "./i18n.js";
import type { Document, Slot } from "./api.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

/** What the template panel needs from the rest of the interface. */
export interface Host {
  project(): string | null;
  document(): Document | null;
  say(message: string, kind?: "info" | "error"): void;
  guard(what: string, run: () => Promise<void>): Promise<void>;
  refresh(): Promise<void>;
}

function byId<T extends HTMLElement>(id: string): T {
  const node = window.document.getElementById(id);
  if (!node) throw new Error(`missing element #${id}`);
  return node as T;
}

function kindOf(slot: Slot): "text" | "image" | "color" {
  return slot.kind ?? "text";
}

function TemplatesPanel({ host, projectController }: {
  host: Host;
  projectController: { current: TemplatesController | null };
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [values, setValues] = useState<Map<string, string>>(() => new Map());
  const [batch, setBatch] = useState<api.Variant[]>([]);
  const [variantName, setVariantName] = useState("");
  const [gallery, setGallery] = useState<Array<{ variant: api.RenderedVariants["variants"][number]; url: string }>>([]);
  const [visible, setVisible] = useState(false);
  const [opened, setOpened] = useState(false);
  const localeTick = useLocaleRevision();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const held = useRef<string[]>([]);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;
  const imageFile = useRef<HTMLInputElement>(null);
  const valuesFile = useRef<HTMLInputElement>(null);

  function releaseGallery() {
    for (const url of held.current) URL.revokeObjectURL(url);
    held.current = [];
  }

  function currentValues(): Record<string, string> {
    const output: Record<string, string> = {};
    for (const slot of slots) {
      const value = values.get(slot.name);
      if (value) output[slot.name] = value;
    }
    return output;
  }

  function setSlotValue(slot: string, value: string) {
    setValues((previous) => new Map(previous).set(slot, value));
  }

  async function drawGallery(project: string, rendered: api.RenderedVariants): Promise<void> {
    releaseGallery();
    setGallery([]);
    const next: Array<{ variant: api.RenderedVariants["variants"][number]; url: string }> = [];
    for (const variant of rendered.variants) {
      const url = await api.imageObjectUrl(api.exportUrl(project, variant.name));
      held.current.push(url);
      next.push({ variant, url });
    }
    setGallery(next);
  }

  async function render(what: string, variants: api.Variant[]): Promise<void> {
    await host.guard(what, async () => {
      const project = host.project();
      if (!project) return;
      const rendered = await api.renderVariants(project, variants);
      await drawGallery(project, rendered);
      host.say(formatCount("templates.renderedCount", rendered.variants.length, {
        what,
        version: formatNumber(rendered.templateVersion),
      }));
    });
  }

  async function projectChanged(): Promise<void> {
    const project = host.project();
    setValues(new Map());
    setBatch([]);
    setVariantName("");
    releaseGallery();
    setGallery([]);
    if (!project) {
      setSlots([]);
      visibleRef.current = false;
      setVisible(false);
      return;
    }
    const list = await api.getSlots(project);
    const nextSlots = list.isTemplate ? list.slots : [];
    setSlots(nextSlots);
    visibleRef.current = nextSlots.length > 0;
    setVisible(nextSlots.length > 0);
    const defaults = new Map<string, string>();
    for (const slot of nextSlots) {
      if (kindOf(slot) === "color") defaults.set(slot.name, "#000000");
    }
    setValues(defaults);
  }

  useLayoutEffect(() => {
    projectController.current = {
      projectChanged,
      setOpen: setOpened,
      isVisible: () => visibleRef.current,
    };
  });

  useEffect(() => {
    return () => {
      projectController.current = null;
      releaseGallery();
    };
  }, [projectController]);
  void localeTick;

  async function loadValues(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    await host.guard(t("templates.loadValues"), async () => {
      const parsed: unknown = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error(t("templates.expectedArray"));
      const loaded: api.Variant[] = [];
      for (const entry of parsed) {
        const row = entry as { name?: unknown; values?: unknown };
        if (typeof row.name !== "string") throw new Error(t("templates.missingName"));
        const rowValues: Record<string, string> = {};
        for (const [key, value] of Object.entries(row.values ?? {})) rowValues[key] = String(value);
        loaded.push({ name: row.name, values: rowValues });
      }
      setBatch(loaded);
      host.say(formatCount("templates.loadedVariants", loaded.length, { file: file.name }));
    });
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    const slot = uploadingFor;
    setUploadingFor(null);
    if (!file || !slot) return;
    await host.guard(t("templates.importImage"), async () => {
      const project = host.project();
      if (!project) return;
      const uploaded = await api.uploadAsset(project, file);
      setSlotValue(slot, uploaded.asset.id);
      await host.refresh();
      setValues((previous) => new Map(previous));
      host.say(t("templates.importedImage", { file: file.name, slot }));
    });
  }

  const assets = host.document()?.assets ?? [];
  return <Stack component="section" id="templates" className={opened ? "templates open" : "templates"} hidden={!visible} gap="md" aria-label={t("templates.drawerLabel")}>
      <Group justify="space-between" align="flex-start">
        <div><Text size="xs" c="dimmed">{t("templates.workspace")}</Text><Text component="h2" fw={700}>{t("templates.buildVariants")}</Text></div>
        <Button id="templates-close" type="button" variant="subtle" title={t("templates.close")} aria-label={t("common.close")}>×</Button>
      </Group>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: "var(--mantine-spacing-md)" }}>
        <Stack gap="sm">
          <Text component="h3" fw={600}>{t("templates.fillSlots")}</Text>
          <Stack id="slot-form" gap="sm">
            {slots.map((slot) => {
              const kind = kindOf(slot);
              const current = values.get(slot.name) ?? (kind === "color" ? "#000000" : "");
              return <Stack key={slot.name} gap={4} data-slot={slot.name}>
                {kind === "image" ? <>
                  <Select label={`${slot.name}${slot.required ? " *" : ""}`} title={slot.description ?? undefined} data-slot={slot.name} value={values.get(slot.name) ?? ""} onChange={(value) => setSlotValue(slot.name, value ?? "")} data={[{ value: "", label: t(assets.length ? "templates.leaveAsIs" : "templates.noImages") }, ...assets.map((asset) => ({ value: asset.id, label: asset.path }))]} />
                  <Button type="button" size="xs" variant="default" onClick={() => { setUploadingFor(slot.name); imageFile.current?.click(); }}>{t("templates.importButton")}</Button>
                </> : kind === "color" ? <TextInput type="color" label={`${slot.name}${slot.required ? " *" : ""}`} title={slot.description ?? undefined} data-slot={slot.name} value={current} onChange={(event) => setSlotValue(slot.name, event.currentTarget.value)} />
                  : <TextInput label={`${slot.name}${slot.required ? " *" : ""}`} title={slot.description ?? undefined} data-slot={slot.name} value={current} onChange={(event) => setSlotValue(slot.name, event.currentTarget.value)} />}
                {slot.description && <Text size="xs" c="dimmed">{slot.description}</Text>}
              </Stack>;
            })}
          </Stack>
          <input ref={imageFile} id="slot-image-file" type="file" accept="image/*,.svg" hidden onChange={(event) => void uploadImage(event)} />
          <Group align="end" wrap="wrap">
            <Button id="preview-variant" type="button" onClick={() => void render(t("templates.preview"), [{ name: "preview", values: currentValues() }])}>{t("templates.preview")}</Button>
            <TextInput id="variant-name" label={t("templates.variantName")} value={variantName} onChange={(event) => setVariantName(event.currentTarget.value)} />
            <Button id="add-variant" type="button" variant="default" onClick={() => {
              const name = variantName.trim();
              if (!name) { host.say(t("templates.variantNameRequired"), "error"); return; }
              setBatch((previous) => [...previous, { name, values: currentValues() }]);
              setVariantName("");
              host.say(t("templates.addedToBatch", { name }));
            }}>{t("templates.addToBatch")}</Button>
          </Group>
        </Stack>

        <Stack gap="sm">
          <Text component="h3" fw={600}>{t("templates.batch")}</Text>
          <Stack component="ol" id="variant-rows" gap="xs" m={0} p={0}>
            {batch.map((variant, index) => <Paper component="li" key={`${index}-${variant.name}`} withBorder p="xs">
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={2} style={{ minWidth: 0 }}><Text fw={600}>{variant.name}</Text><Text size="xs" c="dimmed">{Object.entries(variant.values).map(([key, value]) => `${key}=${value}`).join("  ")}</Text></Stack>
                <Button type="button" size="xs" variant="subtle" onClick={() => setBatch((previous) => previous.filter((_, row) => row !== index))}>{t("templates.removeButton")}</Button>
              </Group>
            </Paper>)}
          </Stack>
          <input ref={valuesFile} id="values-file" type="file" accept="application/json,.json" hidden onChange={(event) => void loadValues(event)} />
          <Group wrap="wrap">
            <Button id="load-values" type="button" variant="default" onClick={() => valuesFile.current?.click()}>{t("templates.loadJson")}</Button>
            <Button id="render-batch" type="button" disabled={!batch.length} onClick={() => void render(t("templates.renderBatch"), batch)}>{batch.length ? formatCount("templates.renderVariants", batch.length) : t("templates.renderBatch")}</Button>
            <Button id="clear-batch" type="button" variant="default" disabled={!batch.length} onClick={() => setBatch([])}>{t("templates.clear")}</Button>
          </Group>
        </Stack>

        <Stack gap="sm">
          <Text component="h3" fw={600}>{t("templates.renderedVariants")}</Text>
          <div id="gallery" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "var(--mantine-spacing-sm)" }}>
            {gallery.map(({ variant, url }) => <Paper component="figure" key={`${variant.name}-${variant.hash}`} withBorder p="sm" m={0}>
              <img src={url} alt={t("templates.variantAlt", { name: variant.name })} style={{ display: "block", width: "100%", height: "auto" }} />
              <Stack component="figcaption" gap={4} mt="sm">
                <Text component="strong">{variant.name}</Text>
                <Text size="xs">{t("templates.bytesSize", { width: formatNumber(variant.width), height: formatNumber(variant.height), bytes: formatNumber(variant.bytes) })}</Text>
                <Text component="code" size="xs" title={variant.hash}>{variant.hash.replace(/^sha256:/, "").slice(0, 12)}</Text>
                <Button component="a" href={url} download={`${variant.name}.png`} variant="default" size="xs">{t("templates.downloadButton")}</Button>
              </Stack>
            </Paper>)}
          </div>
        </Stack>
      </div>
    </Stack>;
}

export interface TemplatesController {
  projectChanged(): Promise<void>;
  setOpen(open: boolean): void;
  isVisible(): boolean;
}

/** Mount the template variants panel and return its project refresh hooks. */
export function mountTemplates(host: Host): TemplatesController {
  const container = byId<HTMLElement>("templates-mantine-mount");
  const projectController: { current: TemplatesController | null } = { current: null };
  mountMantinePortal("templates", container, <TemplatesPanel host={host} projectController={projectController} />);
  return {
    projectChanged: async () => { await projectController.current?.projectChanged(); },
    setOpen: (open) => projectController.current?.setOpen(open),
    isVisible: () => projectController.current?.isVisible() ?? false,
  };
}
