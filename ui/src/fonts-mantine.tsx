// Mantine font manager island. The engine remains the source of truth for
// installed faces, imports, removals, and manifest-backed font packs.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import {
  Accordion,
  Button,
  Box,
  Group,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import * as api from "./api.js";
import { formatCount, formatNumber, getLocale, t } from "./i18n.js";
import type { FontRecord } from "./api.js";
import type { FontPanel, Host } from "./fonts.js";

export type { FontPanel, Host };

export const DEFAULT_FONT_SAMPLE = "Aa Bb 0123";

function sentenceList(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  const locale = getLocale();
  return new Intl.ListFormat(locale === "pseudo" ? "en" : locale, {
    style: "long",
    type: "conjunction",
  }).format(names);
}

function megabytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 10) return `${formatNumber(Math.round(mb))} MB`;
  return `${formatNumber(Math.max(0.1, Math.round(mb * 10) / 10))} MB`;
}

const blobCache = new Map<string, Promise<Blob>>();

function specimenBlob(url: string): Promise<Blob> {
  let pending = blobCache.get(url);
  if (!pending) {
    pending = api.fetchBlob(url).catch((error: unknown) => {
      blobCache.delete(url);
      throw error;
    });
    blobCache.set(url, pending);
    if (blobCache.size > 64) {
      const oldest = blobCache.keys().next().value;
      if (oldest) blobCache.delete(oldest);
    }
  }
  return pending;
}

function Specimen({
  url,
  unavailable,
  generation,
}: {
  url: string;
  unavailable: "fonts.previewUnavailable" | "fonts.cataloguePreviewUnavailable";
  generation: number;
}) {
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    setSrc("");
    setFailed(false);
    void specimenBlob(url).then((blob) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, generation]);

  return (
    <span className="font-specimen">
      <img
        className="font-specimen-image"
        data-font-specimen=""
        src={src || undefined}
        alt=""
        aria-hidden="true"
      />
      <span className="font-specimen-status" hidden={!failed}>{t(unavailable)}</span>
    </span>
  );
}

function FontManager({ host, controller }: { host: Host; controller: Controller }) {
  const [families, setFamilies] = useState<string[]>([]);
  const [faces, setFaces] = useState<FontRecord[]>([]);
  const [sample, setSample] = useState(DEFAULT_FONT_SAMPLE);
  const [sampleDraft, setSampleDraft] = useState(DEFAULT_FONT_SAMPLE);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [catalogue, setCatalogue] = useState<api.FontCatalogue | null>(null);
  const [catalogueSpecimens, setCatalogueSpecimens] = useState<Record<string, api.CatalogueSpecimen>>({});
  const [installing, setInstalling] = useState(false);
  const [packDescription, setPackDescription] = useState("");
  const [packDescriptionError, setPackDescriptionError] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [openPackGroup, setOpenPackGroup] = useState<string | null>(null);
  const localeRevision = useLocaleRevision();
  const [specimensActive, setSpecimensActive] = useState(true);
  const familiesRef = useRef(families);
  const installRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sampleTimer = useRef<number | undefined>(undefined);
  familiesRef.current = families;

  const sayFontsChanged = useCallback((nextFamilies: string[], nextFaces: FontRecord[]) => {
    familiesRef.current = nextFamilies;
    setFamilies(nextFamilies);
    setFaces(nextFaces);
    host.fontsChanged({ families: nextFamilies, faces: nextFaces });
  }, [host]);

  const reload = useCallback(async (): Promise<void> => {
    setSpecimensActive(true);
    const listing = await api.fontFaces();
    sayFontsChanged([...listing.families], [...listing.faces]);
  }, [sayFontsChanged]);

  useLayoutEffect(() => {
    controller.reload = reload;
    controller.focusInstall = () => installRef.current?.focus();
    controller.hasFamilies = () => familiesRef.current.length > 0;
    controller.releaseSamples = () => {
      setSpecimensActive(false);
      setGeneration((value) => value + 1);
    };
    void reload();
    return () => {
      window.clearTimeout(sampleTimer.current);
      controller.reload = async () => {};
      controller.focusInstall = () => {};
      controller.hasFamilies = () => false;
      controller.releaseSamples = () => {};
    };
  }, [controller, reload]);

  const ensureCatalogue = useCallback(async (): Promise<api.FontCatalogue> => {
    if (catalogue) return catalogue;
    const next = await api.fontCatalogue();
    setCatalogue(next);
    return next;
  }, [catalogue]);

  useEffect(() => {
    void ensureCatalogue().catch(() => setCatalogue(null));
  }, [ensureCatalogue]);

  const describeDefaultPack = useCallback(async (): Promise<void> => {
    try {
      const manifest = await ensureCatalogue();
      const pack = manifest.packs.default ?? [];
      const bytes = manifest.families
        .filter((entry) => pack.includes(entry.family))
        .reduce((total, entry) => total + entry.bytes, 0);
      setPackDescription(pack.length
        ? t("fonts.defaultPackDescription", { names: sentenceList(pack), bytes: megabytes(bytes) })
        : t("fonts.noDefaultPack"));
      setPackDescriptionError(false);
    } catch (error) {
      setPackDescription(error instanceof api.ApiError
        ? t("fonts.packDescribeErrorCode", { error: error.message, code: error.code })
        : t("fonts.packDescribeError"));
      setPackDescriptionError(true);
    }
  }, [ensureCatalogue]);

  useEffect(() => {
    if (!families.length) void describeDefaultPack();
  }, [families.length, describeDefaultPack]);

  useEffect(() => {
    let active = true;
    void api.catalogueSpecimens().then((manifest) => {
      if (active) setCatalogueSpecimens(manifest);
    }).catch(() => {
      if (active) setCatalogueSpecimens({});
    });
    return () => { active = false; };
  }, []);

  const refreshProject = useCallback(async (): Promise<void> => {
    if (host.project()) await host.refresh();
  }, [host]);

  const installDefault = async (): Promise<void> => {
    await host.guard(t("fonts.installFonts"), async () => {
      setInstalling(true);
      host.say(t("fonts.downloadingDefault"));
      try {
        const result = await api.installFontPack("default");
        await reload();
        await refreshProject();
        host.say(t("fonts.installedFamilies", { names: sentenceList(result.families) }));
      } finally {
        setInstalling(false);
      }
    });
  };

  const installNamedPack = (pack: string): void => {
    void host.guard(t("fonts.installNamedPack", { pack }), async () => {
      try {
        await api.installFontPack(pack);
        await reload();
        await refreshProject();
        host.say(t("fonts.installedNamedPack", { pack }));
      } finally {
        // The manifest remains available after a refusal, so the user can retry.
        setGeneration((value) => value + 1);
      }
    });
  };

  const importFiles = (chosen: FileList | null): void => {
    const files = [...(chosen ?? [])];
    if (fileRef.current) fileRef.current.value = "";
    if (!files.length) return;
    void host.guard(t("fonts.importFont"), async () => {
      setFeedback([]);
      let added = 0;
      const lines: string[] = [];
      for (const file of files) {
        try {
          const result = await api.importFont(file);
          added += 1;
          const imported = [...new Set(result.imported.map((record) => record.family))];
          lines.push(imported.length
            ? `${file.name} → ${sentenceList(imported)}`
            : t("fonts.importedFile", { file: file.name }));
        } catch (error) {
          lines.push(error instanceof api.ApiError
            ? `${file.name}: ${error.message} (${error.code})`
            : `${file.name}: ${String(error)}`);
        }
      }
      setFeedback(lines);
      await reload();
      if (added) await refreshProject();
      const refused = files.length - added;
      if (added) {
        host.say(formatCount("fonts.importResult", added, {
          refused: refused ? formatCount("fonts.refusedCount", refused) : "",
        }));
      } else {
        host.say(t("fonts.noneImported", { refused: formatCount("fonts.refusedCount", refused) }), "error");
      }
    });
  };

  const removeFamily = (family: string): void => {
    if (!window.confirm(t("fonts.confirmRemove", { family }))) return;
    void host.guard(t("fonts.removeAction", { family }), async () => {
      setFeedback([]);
      const result = await api.removeFontFamily(family);
      setFeedback([formatCount("fonts.removedFiles", result.removed, { family })]);
      await reload();
      await refreshProject();
      host.say(t("fonts.removedFromStore", { family }));
    });
  };

  const onSampleChange = (value: string): void => {
    setSampleDraft(value);
    window.clearTimeout(sampleTimer.current);
    sampleTimer.current = window.setTimeout(() => {
      const next = value.trim();
      if (!next || [...next].some((character) => /[\u0000-\u001f\u007f]/u.test(character))) return;
      setSample(next);
    }, 180);
  };

  const packs = catalogue
    ? ["text", "display", "mono", ...Object.keys(catalogue.packs).filter((name) =>
      !["default", "text", "display", "mono"].includes(name)).sort()]
    : [];
  const empty = families.length === 0;

  return (
    <Stack gap="md" data-testid="font-manager">
      <Box id="font-empty" data-testid="font-empty" hidden={!empty}>
        <Stack gap="sm">
          <Text component="p" size="sm">{t("fonts.noneInstalled")}</Text>
          <Text component="p" className="font-install-copy" size="sm" c="dimmed">
            {t("fonts.defaultPackCopy")}
          </Text>
          <Button
            id="install-default"
            data-testid="install-default"
            ref={installRef}
            disabled={installing || (catalogue !== null && (catalogue.packs.default ?? []).length === 0)}
            onClick={() => void installDefault()}
          >
            <Stack gap={2}>
              <span id="install-default-label">
                {installing ? t("fonts.installingDefault") : t("fonts.installDefaultPack")}
              </span>
              <Text id="install-default-detail" component="span" size="xs" c={packDescriptionError ? "red" : undefined}>
                {packDescription}
              </Text>
            </Stack>
          </Button>
        </Stack>
      </Box>

      <TextInput
        className="font-sample-field"
        ref={(input) => { if (input) input.oninput = () => onSampleChange(input.value); }}
        data-testid="font-sample"
        label={t("fonts.customSample")}
        aria-label={t("fonts.customSample")}
        value={sampleDraft}
        maxLength={64}
        hidden={empty}
        onChange={(event) => onSampleChange(event.currentTarget.value)}
      />

      <ul id="font-list" data-testid="font-list" className="font-list" hidden={empty}>
        {families.map((family) => {
          const mine = faces.filter((face) => face.family === family);
          const described = mine.map((face) =>
            `${face.style === "italic" ? t("fonts.styleItalic") : t("fonts.styleNormal")} ${formatNumber(face.weight)}`,
          ).join(", ");
          const preferred = mine.find((face) => face.weight === 400 && face.style === "normal")
            ?? mine.find((face) => face.style === "normal")
            ?? mine[0];
          return (
            <li key={family} className="font-family" data-family={family}>
              <Group justify="space-between" align="center" wrap="nowrap">
                <div className="font-family-text">
                  <strong>{family}</strong>
                  <span className="font-faces">
                    {formatCount("fonts.faceCount", mine.length, { described })}
                  </span>
                </div>
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  className="small danger-action"
                  data-remove-family={family}
                  data-testid={`remove-font-${family}`}
                  aria-label={t("fonts.removeFamily", { family })}
                  onClick={() => removeFamily(family)}
                >
                  {t("fonts.removeButton")}
                </Button>
              </Group>
              {specimensActive && preferred ? (
                <Specimen
                  url={api.fontSpecimenUrl(preferred, sample)}
                  unavailable="fonts.previewUnavailable"
                  generation={generation + localeRevision}
                />
              ) : specimensActive ? (
                <span className="font-specimen-status">{t("fonts.previewUnavailable")}</span>
              ) : null}
            </li>
          );
        })}
      </ul>

      <Accordion id="font-pack-section" data-testid="font-pack-section" className="font-pack-section" hidden={packs.length === 0}
        value={openPackGroup} onChange={setOpenPackGroup} keepMounted keepMountedMode="display-none">
        <Accordion.Item value="packs">
          <Accordion.Control>{t("fonts.morePacks")}</Accordion.Control>
          <Accordion.Panel>
        <Stack id="font-pack-options" data-testid="font-pack-options" className="font-pack-options" gap="sm">
          {packs.map((pack) => {
            const names = catalogue?.packs[pack] ?? [];
            const missing = names.filter((name) => !families.includes(name));
            const bytes = catalogue?.families
              .filter((entry) => missing.includes(entry.family))
              .reduce((total, entry) => total + entry.bytes, 0) ?? 0;
            return (
              <Button
                key={pack}
                data-pack={pack}
                data-testid={`font-pack-${pack}`}
                className="font-pack-button"
                variant="default"
                disabled={missing.length === 0}
                onClick={() => installNamedPack(pack)}
              >
                <Stack gap="xs" align="stretch">
                  <strong>{t("fonts.namedPackTitle", { pack })}</strong>
                  <Text component="span" size="xs" c="dimmed">
                    {missing.length
                      ? t("fonts.namedPackDownload", { names: sentenceList(names), bytes: megabytes(bytes) })
                      : t("fonts.namedPackInstalled", { names: sentenceList(names) })}
                  </Text>
                  <Group gap="xs" wrap="wrap" className="font-pack-samples">
                    {names.map((family) => {
                      const installed = faces
                        .filter((face) => face.family === family)
                        .find((face) => face.weight === 400 && face.style === "normal")
                        ?? faces.find((face) => face.family === family);
                      const bundled = catalogueSpecimens[family];
                      const url = installed
                        ? api.fontSpecimenUrl(installed)
                        : bundled ? `/catalogue-specimens/${bundled.src.replace(/^\.\//u, "")}` : null;
                      return (
                        <span className="font-pack-family" key={family}>
                          <Text component="span" size="xs" fw={700} className="font-pack-family-name">{family}</Text>
                          {specimensActive && url ? (
                            <Specimen
                              url={url}
                              unavailable={installed ? "fonts.previewUnavailable" : "fonts.cataloguePreviewUnavailable"}
                              generation={generation + localeRevision}
                            />
                          ) : !url ? (
                            <span className="font-specimen-status">{t("fonts.cataloguePreviewUnavailable")}</span>
                          ) : null}
                        </span>
                      );
                    })}
                  </Group>
                </Stack>
              </Button>
            );
          })}
        </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Button
        id="import-font"
        data-testid="import-font"
        variant="default"
        leftSection={<i className="ph ph-upload-simple" aria-hidden="true" />}
        onClick={() => fileRef.current?.click()}
      >
        {t("fonts.importFile")}
      </Button>
      <input
        id="font-file"
        ref={fileRef}
        type="file"
        accept=".ttf,.otf,.ttc,.otc,.woff,.woff2"
        multiple
        hidden
        onChange={(event) => importFiles(event.currentTarget.files)}
      />
      <div id="font-feedback" data-testid="font-feedback" className="font-feedback" aria-live="polite">
        {feedback.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}
      </div>
    </Stack>
  );
}

// A small native wrapper keeps the host's existing #font-empty hidden contract
// while its contents use Mantine components.
type Controller = {
  reload: () => Promise<void>;
  focusInstall: () => void;
  hasFamilies: () => boolean;
  releaseSamples: () => void;
};

/** Mount the Mantine font manager into the editor's existing font section. */
export function mountFontsMantine(host: Host, target: HTMLElement): FontPanel {
  target.replaceChildren();
  const controller: Controller = {
    reload: async () => {},
    focusInstall: () => {},
    hasFamilies: () => false,
    releaseSamples: () => {},
  };
  mountMantinePortal("font-manager", target, <FontManager host={host} controller={controller} />);
  return {
    reload: () => controller.reload(),
    focusInstall: () => controller.focusInstall(),
    hasFamilies: () => controller.hasFamilies(),
    releaseSamples: () => controller.releaseSamples(),
  };
}
