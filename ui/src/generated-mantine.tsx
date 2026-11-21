import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  FileInput,
  Flex,
  Modal,
  NativeSelect,
  SegmentedControl,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { CHART_TYPES } from "./api.js";
import type { ChartType, GeneratedKind, GeneratedSource } from "./api.js";
import { t } from "./i18n.js";
import type { MessageKey } from "./i18n.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

/**
 * Called with what the person chose. A rejected promise keeps the dialog open
 * and shows the refusal, so a spec the generator refuses can be corrected in
 * place.
 */
export type GeneratedSubmit = (source: GeneratedSource) => Promise<void>;

export interface GeneratedDialog {
  /** Open the dialog to insert a new chart, table or QR code. */
  insert(submit: GeneratedSubmit): void;
  /** Open the dialog to replace the spec of a generated layer. */
  replace(kind: GeneratedKind, spec: Record<string, unknown>, submit: GeneratedSubmit): void;
}

type SourceMode = "csv" | "json" | "data";

interface DialogRequest {
  mode: "insert" | "replace";
  kind: GeneratedKind;
  spec: string;
  submit: GeneratedSubmit;
}

interface DialogController {
  open?: (request: DialogRequest) => void;
}

const KIND_LABELS: Record<GeneratedKind, MessageKey> = {
  chart: "generated.kindChart",
  table: "generated.kindTable",
  qr: "generated.kindQr",
};

export const CHART_TYPE_LABELS: Record<ChartType, MessageKey> = {
  bar: "generated.typeBar",
  column: "generated.typeColumn",
  line: "generated.typeLine",
  area: "generated.typeArea",
  pie: "generated.typePie",
  donut: "generated.typeDonut",
  scatter: "generated.typeScatter",
};

function defaultSource(kind: GeneratedKind): SourceMode {
  return kind === "qr" ? "data" : "csv";
}

function GeneratedView({ controller }: { controller: DialogController }) {
  const localeRevision = useLocaleRevision();
  void localeRevision;
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [opened, setOpened] = useState(false);
  const [kind, setKind] = useState<GeneratedKind>("chart");
  const [source, setSource] = useState<SourceMode>("csv");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [specText, setSpecText] = useState("");
  const [data, setData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => {
    setOpened(false);
    setRequest(null);
    setError(null);
    setBusy(false);
  }, []);

  controller.open = (next: DialogRequest) => {
    setRequest(next);
    setKind(next.kind);
    setSource(next.mode === "replace" ? "json" : defaultSource(next.kind));
    setChartType("bar");
    setTitle("");
    setFile(null);
    setSpecText(next.spec);
    setData("");
    setError(null);
    setBusy(false);
    setOpened(true);
  };

  const build = async (): Promise<GeneratedSource> => {
    if (source === "json") {
      let parsed: unknown;
      try {
        parsed = JSON.parse(specText);
      } catch {
        throw new Error(t("generated.invalidJson"));
      }
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(t("generated.invalidJson"));
      }
      // The kind comes from the dialog, so a spec file need not repeat it.
      return { spec: { ...(parsed as Record<string, unknown>), kind } };
    }
    if (source === "data") {
      if (!data) throw new Error(t("generated.dataRequired"));
      return { spec: { kind: "qr", data } };
    }
    if (!file) throw new Error(t("generated.fileRequired"));
    const text = await file.text();
    if (kind === "chart") {
      return { csv: { kind: "chart", chartType, text, ...(title.trim() ? { title: title.trim() } : {}) } };
    }
    return { csv: { kind: "table", text } };
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!request || busy) return;
    setError(null);
    let built: GeneratedSource;
    try {
      built = await build();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      return;
    }
    setBusy(true);
    try {
      await request.submit(built);
      close();
    } catch (reason) {
      setBusy(false);
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const replacing = request?.mode === "replace";
  const sourceChoices = kind === "qr"
    ? [{ value: "data", label: t("generated.sourceData") }, { value: "json", label: t("generated.sourceJson") }]
    : [{ value: "csv", label: t("generated.sourceCsv") }, { value: "json", label: t("generated.sourceJson") }];

  return (
    <Modal
      id="generated-dialog"
      data-state={opened ? "open" : "closed"}
      opened={opened}
      onClose={close}
      title={t(replacing ? "generated.replaceTitle" : "generated.insertTitle")}
      centered
      size="min(36rem, calc(100vw - 2rem))"
      padding="lg"
      trapFocus
      closeOnEscape
      closeOnClickOutside={false}
      returnFocus
      keepMounted
      keepMountedMode="display-none"
      closeButtonProps={{ "aria-label": t("common.close") }}
    >
      <form onSubmit={(event) => void submit(event)}>
        <Stack gap="sm">
          {replacing ? null : (
            <SegmentedControl
              id="generated-kind"
              fullWidth
              value={kind}
              onChange={(value) => {
                const next = value as GeneratedKind;
                setKind(next);
                setSource(defaultSource(next));
                setError(null);
              }}
              data={(["chart", "table", "qr"] as const).map((value) => ({ value, label: t(KIND_LABELS[value]) }))}
            />
          )}
          {replacing ? null : (
            <SegmentedControl
              id="generated-source"
              fullWidth
              size="xs"
              value={source}
              onChange={(value) => { setSource(value as SourceMode); setError(null); }}
              data={sourceChoices}
            />
          )}
          {source === "csv" ? (
            <>
              <FileInput
                id="generated-csv"
                label={t("generated.csvFile")}
                description={t(kind === "chart" ? "generated.csvChartHint" : "generated.csvTableHint")}
                accept=".csv,text/csv"
                value={file}
                onChange={setFile}
                clearable
              />
              {kind === "chart" ? (
                <>
                  <NativeSelect
                    id="generated-chart-type"
                    label={t("generated.chartType")}
                    value={chartType}
                    onChange={(event) => setChartType(event.currentTarget.value as ChartType)}
                    data={CHART_TYPES.map((value) => ({ value, label: t(CHART_TYPE_LABELS[value]) }))}
                  />
                  <TextInput
                    id="generated-title"
                    label={t("generated.chartTitle")}
                    value={title}
                    onChange={(event) => setTitle(event.currentTarget.value)}
                    maxLength={200}
                  />
                </>
              ) : null}
            </>
          ) : null}
          {source === "data" ? (
            <TextInput
              id="generated-qr-data"
              label={t("generated.qrData")}
              description={t("generated.qrDataHint")}
              value={data}
              onChange={(event) => setData(event.currentTarget.value)}
              autoComplete="off"
            />
          ) : null}
          {source === "json" ? (
            <Textarea
              id="generated-spec"
              label={t("generated.specJson")}
              description={t("generated.specJsonHint")}
              value={specText}
              onChange={(event) => setSpecText(event.currentTarget.value)}
              autosize
              minRows={8}
              maxRows={18}
              styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)", fontSize: "0.8rem" } }}
            />
          ) : null}
          {error ? <Alert id="generated-error" color="red" variant="light">{error}</Alert> : null}
          <Flex justify="flex-end" gap="sm" mt="sm">
            <Button type="button" variant="default" onClick={close}>{t("common.cancel")}</Button>
            <Button id="generated-confirm" type="submit" loading={busy}>
              {t(replacing ? "generated.replaceConfirm" : "generated.insertConfirm")}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Modal>
  );
}

/** Mount the generated-layer dialog once and return its two entry points. */
export function mountGeneratedDialog(): GeneratedDialog {
  const root = window.document.createElement("div");
  root.dataset["island"] = "generated-dialog";
  window.document.body.append(root);
  const controller: DialogController = {};
  mountMantinePortal("generated-dialog", root, <GeneratedView controller={controller} />);
  const open = (next: DialogRequest): void => {
    if (!controller.open) throw new Error("Mantine generated-layer dialog failed to mount");
    controller.open(next);
  };
  return {
    insert(submit): void {
      open({ mode: "insert", kind: "chart", spec: "", submit });
    },
    replace(kind, spec, submit): void {
      open({ mode: "replace", kind, spec: JSON.stringify(spec, null, 2), submit });
    },
  };
}
