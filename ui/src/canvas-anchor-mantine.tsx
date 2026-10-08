import { useEffect, useState } from "react";
import { Radio, SimpleGrid } from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { t, type MessageKey } from "./i18n.js";

export type CanvasAnchor = "top-left" | "top" | "top-right" | "left" | "center" | "right" | "bottom-left" | "bottom" | "bottom-right";

const anchors: readonly { value: CanvasAnchor; glyph: string; key: MessageKey }[] = [
  { value: "top-left", glyph: "↖", key: "position.topLeft" },
  { value: "top", glyph: "↑", key: "position.top" },
  { value: "top-right", glyph: "↗", key: "position.topRight" },
  { value: "left", glyph: "←", key: "position.left" },
  { value: "center", glyph: "•", key: "canvas.anchorCenter" },
  { value: "right", glyph: "→", key: "position.right" },
  { value: "bottom-left", glyph: "↙", key: "position.bottomLeft" },
  { value: "bottom", glyph: "↓", key: "position.bottom" },
  { value: "bottom-right", glyph: "↘", key: "position.bottomRight" },
];

function CanvasAnchorPicker({ value, disabled, onChange }: {
  value: CanvasAnchor;
  disabled: boolean;
  onChange(value: CanvasAnchor): void;
}) {
  const localeRevision = useLocaleRevision();
  void localeRevision;
  return <Radio.Group id="canvas-anchor-group" name="canvas-anchor" value={value}
    onChange={(next) => onChange(next as CanvasAnchor)}>
    <SimpleGrid cols={3} className="canvas-size-anchor-grid">
      {anchors.map((anchor) => <Radio key={anchor.value} value={anchor.value}
        label={<span title={t(anchor.key)}>{anchor.glyph}</span>}
        aria-label={t(anchor.key)} disabled={disabled} className="canvas-anchor" />)}
    </SimpleGrid>
  </Radio.Group>;
}

/** Mount the canvas resize anchor picker through the shared Mantine root. */
export function mountCanvasAnchorPicker(
  target: HTMLElement,
  initialValue: CanvasAnchor,
  initialDisabled: boolean,
  onChange: (value: CanvasAnchor) => void,
) {
  let update = (_value: CanvasAnchor, _disabled: boolean): void => {};
  function Connected() {
    const [value, setValue] = useState(initialValue);
    const [disabled, setDisabled] = useState(initialDisabled);
    useEffect(() => {
      update = (nextValue, nextDisabled) => { setValue(nextValue); setDisabled(nextDisabled); };
      return () => { update = () => {}; };
    }, []);
    return <CanvasAnchorPicker value={value} disabled={disabled} onChange={onChange} />;
  }
  const destroy = mountMantinePortal("canvas-anchor-picker", target, <Connected />);
  return { setState: (value: CanvasAnchor, disabled: boolean) => update(value, disabled), destroy };
}
