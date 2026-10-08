// Mantine settings modal for page preferences and project actions.

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Accordion, Button, Checkbox, Group, Input, Modal, NativeSelect, SegmentedControl, Stack, Text, useMantineColorScheme } from "@mantine/core";

import { t } from "./i18n.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

export type SettingsGroup = "settings-agents" | "settings-document" | "settings-fonts" | "settings-application";
export type SettingsLanguage = "en" | "fr" | "de";

export interface SettingsController {
  open(group?: SettingsGroup, values?: { follow: boolean; language: SettingsLanguage }): void;
  close(): void;
  isOpen(): boolean;
}

function byId<T extends HTMLElement>(id: string): T {
  const node = window.document.getElementById(id);
  if (!node) throw new Error(`missing element #${id}`);
  return node as T;
}

function SettingsModal({ controller }: { controller: { current: SettingsController | null } }) {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [opened, setOpened] = useState(false);
  const [section, setSection] = useState<SettingsGroup | null>("settings-agents");
  const localeTick = useLocaleRevision();
  const followInput = useRef<HTMLInputElement>(null);
  const languageInput = useRef<HTMLSelectElement>(null);
  const dialogElement = useRef<HTMLDivElement>(null);

  function open(group: SettingsGroup = "settings-agents", values?: { follow: boolean; language: SettingsLanguage }) {
    setSection(group);
    if (values) {
      if (followInput.current) followInput.current.checked = values.follow;
      if (languageInput.current) languageInput.current.value = values.language;
    }
    setOpened(true);
  }

  function close() {
    setOpened(false);
  }

  useLayoutEffect(() => {
    controller.current = { open, close, isOpen: () => opened };
  });

  useLayoutEffect(() => {
    const element = dialogElement.current;
    if (!element) return;
    Object.defineProperty(element, "open", {
      configurable: true,
      get: () => opened,
    });
    Object.defineProperty(element, "close", {
      configurable: true,
      value: (_returnValue?: string) => close(),
    });
    return () => {
      delete (element as HTMLDivElement & { open?: boolean }).open;
      delete (element as HTMLDivElement & { close?: (returnValue?: string) => void }).close;
    };
  }, [opened]);

  useEffect(() => {
    return () => { controller.current = null; };
  }, [controller]);
  void localeTick;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value === "cancel") close();
  }

  return <Modal ref={dialogElement} id="settings-dialog" data-state={opened ? "open" : "closed"} opened={opened} onClose={close} title={null} withCloseButton={false} centered size="xl" withinPortal={false} keepMounted keepMountedMode="display-none">
      <form id="settings-form" onSubmit={submit}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div><Text size="xs" c="dimmed">{t("settings.preferences")}</Text><Text component="h2" fw={700}>{t("settings.openButton")}</Text></div>
            <Button id="settings-close" type="submit" value="cancel" variant="subtle" title={t("common.close")} aria-label={t("common.close")}>×</Button>
          </Group>
          <Accordion value={section} onChange={(value) => setSection(value as SettingsGroup | null)} variant="separated" keepMounted keepMountedMode="display-none">
            <Accordion.Item id="settings-agents" className="settings-section" value="settings-agents">
              <Accordion.Control><Group gap="sm"><i className="ph ph-robot" aria-hidden="true" /><Stack gap={0}><Text size="xs" c="dimmed">{t("settings.collaboration")}</Text><Text id="settings-agents-heading" fw={600}>{t("settings.aiAgents")}</Text></Stack></Group></Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Button id="agents" type="button" leftSection={<i className="ph ph-plugs-connected" aria-hidden="true" />}>{t("agents.dialogTitle")}</Button>
                  <Checkbox id="setting-follow" ref={followInput} defaultChecked label={t("agents.followChanges")} />
                  <Text size="sm" c="dimmed">{t("agents.followHint")}</Text>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="settings-document" className="settings-section" value="settings-document">
              <Accordion.Control><Group gap="sm"><i className="ph ph-file" aria-hidden="true" /><Stack gap={0}><Text size="xs" c="dimmed">{t("settings.project")}</Text><Text id="settings-document-heading" fw={600}>{t("settings.projectActions")}</Text></Stack></Group></Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Button id="rename-project" type="button" variant="default" disabled leftSection={<i className="ph ph-pencil-simple" aria-hidden="true" />}>{t("projects.renameButton")}</Button>
                  <Button id="reload" type="button" variant="default" disabled leftSection={<i className="ph ph-arrows-clockwise" aria-hidden="true" />}>{t("projects.reloadButton")}</Button>
                  <Button id="delete-project" type="button" color="red" variant="light" disabled leftSection={<i className="ph ph-trash" aria-hidden="true" />}>{t("projects.deleteButton")}</Button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="settings-fonts" className="settings-section" value="settings-fonts">
              <Accordion.Control><Group gap="sm"><i className="ph ph-text-aa" aria-hidden="true" /><Stack gap={0}><Text size="xs" c="dimmed">{t("settings.workspace")}</Text><Text id="settings-fonts-heading" fw={600}>{t("toolbar.fontsButton")}</Text></Stack></Group></Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <Text className="hint" size="sm" c="dimmed">{t("fonts.settingsHint")}</Text>
                  <Button id="settings-fonts-open" type="button" variant="default" leftSection={<i className="ph ph-arrow-square-out" aria-hidden="true" />}>{t("fonts.openTools")}</Button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item id="settings-application" className="settings-section" value="settings-application">
              <Accordion.Control><Group gap="sm"><i className="ph ph-gear-six" aria-hidden="true" /><Stack gap={0}><Text size="xs" c="dimmed">{t("settings.application")}</Text><Text id="settings-application-heading" fw={600}>{t("settings.updatesControl")}</Text></Stack></Group></Accordion.Control>
              <Accordion.Panel>
                <Stack gap="sm">
                  <NativeSelect id="setting-language" ref={languageInput} label={<span data-i18n="settings.languageLabel">{t("settings.languageLabel")}</span>} defaultValue="en" data={[
                    { value: "en", label: t("settings.languageEnglish") },
                    { value: "fr", label: t("settings.languageFrench") },
                    { value: "de", label: t("settings.languageGerman") },
                  ]} />
                  <Input.Wrapper id="setting-appearance-wrapper" label={t("settings.appearance")}
                    labelElement="div" labelProps={{ id: "setting-appearance-label" }}>
                    <SegmentedControl
                      id="setting-appearance"
                      name="setting-appearance"
                      aria-labelledby="setting-appearance-label"
                      fullWidth
                      value={colorScheme === "auto" ? "system" : colorScheme}
                      onChange={(value) => {
                        if (value === "system") setColorScheme("auto");
                        else if (value === "light" || value === "dark") setColorScheme(value);
                      }}
                      data={[
                        { value: "system", label: t("settings.appearanceSystem") },
                        { value: "light", label: t("settings.appearanceLight") },
                        { value: "dark", label: t("settings.appearanceDark") },
                      ]}
                    />
                  </Input.Wrapper>
                  <Checkbox id="setting-update-check" label={t("updates.dailyCheckSetting")} />
                  <Text size="sm" c="dimmed">{t("updates.dailyCheckBeforeCommand")} <code>assemblash upgrade</code>{t("updates.dailyCheckAfterCommand")}</Text>
                  <Text id="update-note" component="p" size="sm" c="dimmed" hidden aria-live="polite" />
                  <Button id="shutdown" type="button" color="red" variant="light" hidden leftSection={<i className="ph ph-power" aria-hidden="true" />}>{t("app.stop")}</Button>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </form>
    </Modal>;
}

/** Mount the settings modal and return its open and close controls. */
export function mountSettings(): SettingsController {
  const container = byId<HTMLElement>("settings-dialog-mount");
  const controller: { current: SettingsController | null } = { current: null };
  mountMantinePortal("settings", container, <SettingsModal controller={controller} />);
  return {
    open: (group, values) => controller.current?.open(group, values),
    close: () => controller.current?.close(),
    isOpen: () => controller.current?.isOpen() ?? false,
  };
}
