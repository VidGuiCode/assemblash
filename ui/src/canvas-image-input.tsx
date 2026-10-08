import { useEffect, useState } from "react";
import { Button, FileInput, Group, NativeSelect, Stack } from "@mantine/core";
import type { Asset, BackgroundImage, ImageFit } from "./api.js";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { t } from "./i18n.js";

export interface CanvasImageInputProps {
  assets: readonly Asset[];
  value: BackgroundImage | null;
  disabled?: boolean;
  onChange(value: BackgroundImage | null): void;
  onUpload(file: File): void;
}

function CanvasImageInput({ assets, value, disabled = false, onChange, onUpload }: CanvasImageInputProps) {
  const localeRevision = useLocaleRevision();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [image, setImage] = useState<BackgroundImage | null>(value);
  useEffect(() => setImage(value), [value]);
  void localeRevision;
  const images = assets.filter((asset) => asset.mediaType.startsWith("image/"));
  const choices = [
    { value: "", label: t("canvas.backgroundImageNone") },
    ...images.map((asset) => ({
      value: asset.id,
      label: `${asset.path.split("/").at(-1) ?? asset.path} (${asset.mediaType})`,
    })),
  ];

  return <Stack gap="xs" className="canvas-image-input">
    <NativeSelect
      id="canvas-background-image"
      label={t("canvas.backgroundImage")}
      value={image?.asset ?? ""}
      data={choices}
      disabled={disabled}
      onChange={(event) => {
        const id = event.currentTarget.value;
        const next = !id ? null : { asset: id, fit: image?.fit ?? "fill" };
        setImage(next);
        onChange(next);
      }}
    />
    <NativeSelect
      id="canvas-background-image-fit"
      label={t("canvas.backgroundImageFit")}
      value={image?.fit ?? "fill"}
      disabled={disabled || !image}
      data={[
        { value: "fill", label: t("canvas.imageFitFill") },
        { value: "contain", label: t("canvas.imageFitContain") },
        { value: "cover", label: t("canvas.imageFitCover") },
      ]}
      onChange={(event) => {
        if (!image) return;
        const next = { ...image, fit: event.currentTarget.value as ImageFit };
        setImage(next);
        onChange(next);
      }}
    />
    <Group align="end" gap="xs">
      <FileInput
        id="canvas-background-upload"
        label={t("canvas.backgroundImageUpload")}
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg"
        fileInputProps={{ id: "canvas-background-upload-input" }}
        value={selectedFile}
        onChange={(file) => {
          setSelectedFile(file);
          if (file) onUpload(file);
        }}
        disabled={disabled}
        clearable
        style={{ flex: 1 }}
      />
      {image ? <Button
        id="canvas-background-image-clear"
        type="button"
        variant="light"
        color="red"
        disabled={disabled}
        onClick={() => { setImage(null); onChange(null); }}
      >{t("canvas.removeBackgroundImage")}</Button> : null}
    </Group>
  </Stack>;
}

let nextCanvasImageId = 0;

export function mountCanvasImageInput(
  target: HTMLElement,
  props: CanvasImageInputProps,
): () => void {
  return mountMantinePortal(`canvas-image-${++nextCanvasImageId}`, target,
    <CanvasImageInput {...props} />);
}
