import { useEffect, useState } from "react";
import { ActionIcon, Anchor, Button, Group, Text } from "@mantine/core";
import { formatCount, t } from "./i18n.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import type { UpdateConsent } from "./api.js";

type SaveKey = "save.working" | "save.allChangesSaved" | "save.needsAttention";
interface Banner {
  version: string;
  text: string;
  notesUrl: string | null;
}
interface Snapshot {
  message: string;
  kind: "info" | "error";
  dimensions: string | null;
  agents: number | null;
  consentVisible: boolean;
  banner: Banner | null;
}

let snapshot: Snapshot = {
  message: t("status.starting"),
  kind: "info",
  dimensions: null,
  agents: null,
  consentVisible: false,
  banner: null,
};
let saveIcon = "ph-check-circle";
let saveKey: SaveKey = "save.allChangesSaved";
let setSnapshot: ((value: Snapshot) => void) | null = null;

function updateSnapshot(update: Partial<Snapshot>): void {
  snapshot = { ...snapshot, ...update };
  setSnapshot?.(snapshot);
}

function SaveIndicator() {
  useLocaleRevision();
  const [value, setValue] = useState({ icon: saveIcon, key: saveKey });
  useEffect(() => {
    saveUpdater = setValue;
    setValue({ icon: saveIcon, key: saveKey });
    return () => { saveUpdater = null; };
  }, []);
  return <><i className={`ph ${value.icon}`} aria-hidden="true" /><span>{t(value.key)}</span></>;
}
let saveUpdater: ((value: { icon: string; key: SaveKey }) => void) | null = null;

function StatusChrome({ onConsent, onDismiss }: {
  onConsent(consent: UpdateConsent): void;
  onDismiss(version: string): void;
}) {
  useLocaleRevision();
  const [state, setState] = useState(snapshot);
  useEffect(() => {
    setSnapshot = setState;
    setState(snapshot);
    return () => { setSnapshot = null; };
  }, []);
  const count = state.agents;
  const banner = state.banner;
  return <>
    <section id="consent-bar" className="notice-bar" hidden={!state.consentVisible}
      aria-label={t("updates.consentLabel")}>
      <Text className="notice-text">{t("updates.consentQuestion")}</Text>
      <Group className="notice-actions" gap="sm" justify="flex-end" wrap="wrap">
        <Button id="consent-notify" className="button button-primary" type="button" variant="filled"
          onClick={() => onConsent("notify")}>{t("updates.checkButton")}</Button>
        <Button id="consent-off" className="button button-quiet" type="button" variant="subtle"
          onClick={() => onConsent("off")}>{t("updates.dontCheckButton")}</Button>
      </Group>
    </section>
    <section id="update-banner" className="notice-bar update" hidden={!banner}
      aria-label={t("updates.newVersionLabel")}>
      <i className="ph ph-arrow-circle-up" aria-hidden="true" />
      <Text id="update-banner-text" className="notice-text" data-version={banner?.version ?? ""}>
        {banner?.text ?? ""}
      </Text>
      {banner?.notesUrl
        ? <Anchor id="update-banner-link" href={banner.notesUrl} target="_blank" rel="noopener noreferrer">{t("updates.releaseNotes")}</Anchor>
        : <Anchor id="update-banner-link" hidden target="_blank" rel="noopener noreferrer">{t("updates.releaseNotes")}</Anchor>}
      <ActionIcon id="update-banner-dismiss" className="icon-button" type="button" variant="subtle"
        title={t("updates.dismiss")} aria-label={t("updates.dismissShort")}
        onClick={() => banner && onDismiss(banner.version)}>
        <i className="ph ph-x" aria-hidden="true" />
      </ActionIcon>
    </section>
    <footer className="statusbar">
      <Text id="status" component="div" data-kind={state.kind} aria-live="polite">{state.message}</Text>
      <span id="agents-connected" className="agents-connected" hidden={!count}>
        {count ? <><i className="ph ph-robot" aria-hidden="true" /><span>{formatCount("agents.connected", count)}</span></> : null}
      </span>
      <span className="statusbar-spacer" />
      <Text id="document-dimensions" component="span">{state.dimensions ?? t("projects.noneOpen")}</Text>
    </footer>
  </>;
}

export function mountStatusChrome(
  target: HTMLElement,
  onConsent: (consent: UpdateConsent) => void,
  onDismiss: (version: string) => void,
): void {
  mountMantinePortal("status-chrome", target,
    <StatusChrome onConsent={onConsent} onDismiss={onDismiss} />);
}

export function setStatusMessage(message: string, kind: "info" | "error" = "info"): void {
  updateSnapshot({ message, kind });
}

export function setStatusKind(kind: "info" | "error"): void {
  updateSnapshot({ kind });
}

export function currentStatusKind(): "info" | "error" {
  return snapshot.kind;
}

export function setDocumentDimensions(value: string | null): void {
  updateSnapshot({ dimensions: value });
}

export function setAgentCount(count: number | null): void {
  updateSnapshot({ agents: count });
}

export function setConsentVisible(visible: boolean): void {
  updateSnapshot({ consentVisible: visible });
}

export function setUpdateBanner(banner: Banner | null): void {
  updateSnapshot({ banner });
}

export function setSaveIndicator(icon: string, key: SaveKey): void {
  saveIcon = icon;
  saveKey = key;
  saveUpdater?.({ icon, key });
}

export function mountSaveIndicator(target: HTMLElement): void {
  mountMantinePortal("save-indicator", target, <SaveIndicator />);
}
