import { ActionIcon, Button, Paper, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { t, type MessageKey } from "./i18n.js";

const anchors = [
  ["top-left", "ph-arrow-up-left", "position.topLeft"],
  ["top-center", "ph-arrow-up", "position.topCenter"],
  ["top-right", "ph-arrow-up-right", "position.topRight"],
  ["middle-left", "ph-arrow-left", "position.middleLeft"],
  ["center", "ph-crosshair-simple", "position.center"],
  ["middle-right", "ph-arrow-right", "position.middleRight"],
  ["bottom-left", "ph-arrow-down-left", "position.bottomLeft"],
  ["bottom-center", "ph-arrow-down", "position.bottomCenter"],
  ["bottom-right", "ph-arrow-down-right", "position.bottomRight"],
] as const satisfies readonly (readonly [string, string, MessageKey])[];

const alignments = [
  ["align-left", "position.left"],
  ["align-center-horizontal", "position.centers"],
  ["align-right", "position.right"],
  ["align-top", "position.top"],
  ["align-center-vertical", "position.middles"],
  ["align-bottom", "position.bottom"],
] as const satisfies readonly (readonly [string, MessageKey])[];

let open = false;
let setOpenState: ((value: boolean) => void) | null = null;

export function setPositionPopoverOpen(value: boolean): void {
  open = value;
  setOpenState?.(value);
}

export function positionPopoverIsOpen(): boolean {
  return open;
}

function PositionPopover() {
  useLocaleRevision();
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    setOpenState = setVisible;
    setVisible(open);
    return () => { setOpenState = null; };
  }, []);
  return <Paper id="position-popover" className="position-popover" shadow="md" hidden={!visible}>
    <div className="popover-heading">
      <Text component="strong">{t("position.title")}</Text>
      <ActionIcon id="position-close" className="icon-button" type="button" variant="subtle" title={t("position.close")} aria-label={t("position.close")}>
        <i className="ph ph-x" aria-hidden="true" />
      </ActionIcon>
    </div>
    <section>
      <Text component="h3">{t("position.alignCanvas")}</Text>
      <div className="anchor-grid">
        {anchors.map(([anchor, icon, key]) => <ActionIcon key={anchor} type="button" variant="default"
          data-canvas-anchor={anchor} title={t(key)} aria-label={t(key)}>
          <i className={`ph ${icon}`} aria-hidden="true" />
        </ActionIcon>)}
      </div>
    </section>
    <section>
      <Text component="h3">{t("position.alignSelection")}</Text>
      <div className="popover-actions">
        {alignments.map(([layout, key]) => <Button key={layout} type="button" variant="default" data-layout={layout}>{t(key)}</Button>)}
      </div>
    </section>
    <section>
      <Text component="h3">{t("position.distribute")}</Text>
      <div className="popover-actions two">
        <Button type="button" variant="default" data-layout="distribute-horizontal"><i className="ph ph-columns" aria-hidden="true" /> {t("position.horizontal")}</Button>
        <Button type="button" variant="default" data-layout="distribute-vertical"><i className="ph ph-rows" aria-hidden="true" /> {t("position.vertical")}</Button>
      </div>
    </section>
    <section>
      <Text component="h3">{t("position.size")}</Text>
      <div id="position-fields" className="position-fields" />
    </section>
  </Paper>;
}

export function mountPositionPopover(target: HTMLElement): void {
  mountMantinePortal("position-popover", target, <PositionPopover />);
}
