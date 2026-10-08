import { Accordion, Group, Text } from "@mantine/core";
import { useState } from "react";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { t, type MessageKey } from "./i18n.js";

const sectionKeys: Record<string, MessageKey> = {
  Canvas: "canvas.section",
  Transform: "properties.transform",
  Typography: "properties.typography",
  Image: "properties.image",
  Media: "properties.media",
  Shape: "properties.shape",
  "Clip and mirror": "properties.clipMirror",
  Appearance: "properties.appearance",
  Effects: "properties.effects",
  Presets: "properties.presets",
  Slots: "properties.slots",
};

const sectionIcons: Record<string, string> = {
  Canvas: "ph-frame-corners",
  Transform: "ph-arrows-out-cardinal",
  Typography: "ph-text-aa",
  Image: "ph-image",
  Media: "ph-image",
  Shape: "ph-shapes",
  "Clip and mirror": "ph-crop",
  Appearance: "ph-palette",
  Effects: "ph-magic-wand",
  Presets: "ph-swatches",
  Slots: "ph-brackets-curly",
};

function Section({ title, initiallyOpen, bodyElement }: {
  title: string;
  initiallyOpen: boolean;
  bodyElement: HTMLDivElement;
}) {
  useLocaleRevision();
  const [value, setValue] = useState<string | null>(initiallyOpen ? title : null);
  const key = sectionKeys[title];
  const label = key ? t(key) : title;
  return <Accordion value={value} onChange={setValue} keepMounted keepMountedMode="display-none"
    className="dock-accordion" classNames={{ item: "dock-section", control: "dock-section-control", panel: "dock-section-panel", content: "dock-section-content" }}>
    <Accordion.Item value={title}>
      <Accordion.Control>
        <Group gap="xs" wrap="nowrap">
          <span className="dock-section-icon"><i className={`ph ${sectionIcons[title] ?? "ph-sliders-horizontal"}`} aria-hidden="true" /></span>
          <Text component="span" className="dock-section-heading">{label}</Text>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <div ref={(node) => {
          if (node && bodyElement.parentElement !== node) node.append(bodyElement);
        }} />
      </Accordion.Panel>
    </Accordion.Item>
  </Accordion>;
}

let nextSection = 0;

/** Mount one Mantine disclosure and return its stable body for controller content. */
export function mountDockSection(container: HTMLElement, title: string, initiallyOpen: boolean): {
  body: HTMLElement;
  destroy(): void;
} {
  const host = document.createElement("div");
  host.className = "dock-section-host";
  container.append(host);
  const body = document.createElement("div");
  body.className = "dock-section-body";
  const key = `inspector-section-${++nextSection}`;
  const destroyPortal = mountMantinePortal(key, host,
    <Section title={title} initiallyOpen={initiallyOpen} bodyElement={body} />);
  return {
    body,
    destroy() {
      destroyPortal();
      host.remove();
    },
  };
}
