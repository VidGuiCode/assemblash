import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  ColorInput,
  Group,
  Modal,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { t } from "./i18n.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";

interface ProjectCreateHost {
  create(name: string, width: number, height: number, background: string): Promise<boolean>;
}

const presets = [
  { size: "1080x1080", width: 1080, height: 1080, label: "common.square" },
  { size: "1920x1080", width: 1920, height: 1080, label: "common.landscape" },
  { size: "1080x1350", width: 1080, height: 1350, label: "common.portrait" },
  { size: "1080x1920", width: 1080, height: 1920, label: "common.story" },
] as const;

function ProjectCreateDialog({
  host,
  controller,
}: {
  host: ProjectCreateHost;
  controller: { current: (() => void) | null };
}) {
  const [opened, setOpened] = useState(false);
  const [name, setName] = useState("");
  const [width, setWidth] = useState<number | string>(1080);
  const [height, setHeight] = useState<number | string>(1080);
  const [background, setBackground] = useState("#ffffff");
  const [selectedSize, setSelectedSize] = useState("1080x1080");
  const [busy, setBusy] = useState(false);
  const localeRevision = useLocaleRevision();
  void localeRevision;

  useEffect(() => {
    controller.current = () => {
      setName("");
      setWidth(1080);
      setHeight(1080);
      setBackground("#ffffff");
      setSelectedSize("1080x1080");
      setOpened(true);
    };
    return () => {
      controller.current = null;
    };
  }, [controller]);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const cleanName = name.trim();
    const nextWidth = Number(width);
    const nextHeight = Number(height);
    if (!cleanName || !Number.isFinite(nextWidth) || !Number.isFinite(nextHeight)) return;
    if (nextWidth <= 0 || nextHeight <= 0 || busy) return;
    setBusy(true);
    try {
      if (await host.create(cleanName, nextWidth, nextHeight, background)) setOpened(false);
    } finally {
      setBusy(false);
    }
  }

  return (
      <Modal
        id="new-project-dialog"
        data-state={opened ? "open" : "closed"}
        opened={opened}
        onClose={() => setOpened(false)}
        title={t("dialogs.newProjectTitle")}
        centered
        size="lg"
      >
        <form id="new-project-form" onSubmit={(event) => void submit(event)}>
          <Stack gap="md">
            <TextInput
              id="new-project-name"
              label={t("common.name")}
              placeholder={t("dialogs.projectNamePlaceholder")}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              autoComplete="off"
              required
              data-autofocus
            />
            <Stack gap="xs">
              <Text fw={600}>{t("canvas.label")}</Text>
              <SimpleGrid id="canvas-presets" cols={{ base: 2, sm: 4 }}>
                {presets.map((preset) => (
                  <Button
                    key={preset.size}
                    type="button"
                    data-size={preset.size}
                    variant={selectedSize === preset.size ? "light" : "default"}
                    onClick={() => {
                      setWidth(preset.width);
                      setHeight(preset.height);
                      setSelectedSize(preset.size);
                    }}
                  >
                    {t(preset.label)}
                  </Button>
                ))}
              </SimpleGrid>
            </Stack>
            <Group grow align="start">
              <NumberInput
                id="new-project-width"
                label={t("common.width")}
                value={width}
                onChange={(value) => {
                  setWidth(value);
                  setSelectedSize("");
                }}
                min={1}
                allowDecimal={false}
                required
              />
              <NumberInput
                id="new-project-height"
                label={t("common.height")}
                value={height}
                onChange={(value) => {
                  setHeight(value);
                  setSelectedSize("");
                }}
                min={1}
                allowDecimal={false}
                required
              />
              <ColorInput
                id="new-project-background"
                label={t("common.background")}
                value={background}
                onChange={setBackground}
                format="hex"
                required
              />
            </Group>
            <Group justify="flex-end">
              <Button id="new-project-cancel" type="button" variant="default" onClick={() => setOpened(false)}>
                {t("common.cancel")}
              </Button>
              <Button id="create-project-confirm" type="submit" loading={busy}>
                {t("dialogs.createProject")}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
  );
}

export function mountProjectCreate(host: ProjectCreateHost): { open: () => void } {
  const container = document.getElementById("new-project-dialog-mount");
  if (!container) throw new Error("missing element #new-project-dialog-mount");
  const controller: { current: (() => void) | null } = { current: null };
  mountMantinePortal("project-create", container, <ProjectCreateDialog host={host} controller={controller} />);
  return { open: () => controller.current?.() };
}
