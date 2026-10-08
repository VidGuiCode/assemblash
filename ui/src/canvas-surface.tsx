import { ActionIcon, Button, Card, Group, Image, SimpleGrid, Stack, Text, UnstyledButton } from "@mantine/core";
import { mountMantinePortal, useLocaleRevision } from "./mantine-root.js";
import { t } from "./i18n.js";
import { formatCount } from "./i18n.js";
import type { ProjectSummary } from "./api.js";

const icon = (name: string) => <i className={`ph ${name}`} aria-hidden="true" />;

/**
 * The canvas boundary owns only its stable DOM and standard zoom controls.
 * The controller still owns the PNG image, pointer overlay, and drag preview.
 */
function CanvasSurface() {
  useLocaleRevision();
  return <>
    <div id="canvas-empty" className="canvas-empty">
      <div className="empty-mark">{icon("ph-sparkle")}</div>
      <p className="eyebrow">{t("editor.structuredEyebrow")}</p>
      <h1>{t("editor.emptyTitleFirst")}<br />{t("editor.emptyTitleSecond")}</h1>
      <p>{t("editor.emptyDescription")}</p>
      <Button id="empty-create" className="button button-primary" type="button" variant="filled">
        {icon("ph-plus")} {t("editor.createProject")}
      </Button>
      <div id="recents-mount" />
    </div>
    <div id="canvas" hidden tabIndex={0} aria-label={t("canvas.label")}>
      <img id="canvas-image" alt="" />
      <div id="overlay" />
    </div>
  </>;
}

function CanvasControls() {
  useLocaleRevision();
  return <>
    <div className="zoom-controls" role="group" aria-label={t("canvas.zoomLabel")}>
      <ActionIcon id="zoom-out" type="button" size={36} variant="default" title={t("canvas.zoomOut")} aria-label={t("canvas.zoomOut")}>{icon("ph-minus")}</ActionIcon>
      <Button id="zoom-value" type="button" title={t("canvas.zoomCurrent")} variant="default">{t("canvas.zoomFit")}</Button>
      <ActionIcon id="zoom-in" type="button" size={36} variant="default" title={t("canvas.zoomIn")} aria-label={t("canvas.zoomIn")}>{icon("ph-plus")}</ActionIcon>
      <Button id="zoom-100" type="button" title={t("canvas.zoomSet100")} variant="default">100%</Button>
    </div>
    <p id="canvas-hints" className="canvas-hints" hidden>{t("canvas.panHint")}</p>
  </>;
}

/** Mount the stable preview surface through the editor's shared root. */
export function mountCanvasSurface(target: HTMLElement): void {
  mountMantinePortal("canvas-surface", target, <CanvasSurface />);
}

export function mountCanvasControls(target: HTMLElement): void {
  mountMantinePortal("canvas-controls", target, <CanvasControls />);
}

export interface RecentProjectCard {
  project: ProjectSummary;
  thumbnail: string | null;
}

function RecentProjects({
  projects,
  onOpen,
  onRename,
  onDelete,
}: {
  projects: readonly RecentProjectCard[];
  onOpen(id: string): void;
  onRename(id: string, name: string | null): void;
  onDelete(id: string, name: string | null): void;
}) {
  useLocaleRevision();
  return <SimpleGrid id="recents" className="recents" type="container" cols={{ base: 1, "30rem": 2 }} spacing="sm"
    aria-label={t("projects.recentLabel")} hidden={projects.length < 2}>
    {projects.map(({ project, thumbnail }) => {
      const name = project.name ?? project.id;
      return <Card component="article" className="recent-card" key={project.id} withBorder radius="md" padding="xs">
        <UnstyledButton className="recent" type="button" title={`${name} — ${formatCount("projects.layerCount", project.layers)}`}
          onClick={() => onOpen(project.id)}>
          <Stack gap="xs">
            {thumbnail && <Image className="recent-thumbnail" src={thumbnail} alt="" h={64} fit="contain"
              styles={{ root: { backgroundColor: "var(--color-canvas)" } }} />}
            <Text size="sm" fw={600} lineClamp={1}>{name}</Text>
          </Stack>
        </UnstyledButton>
        <Group className="recent-controls" gap="xs" grow wrap="nowrap">
          <Button className="small recent-rename" type="button" size="xs" variant="subtle" title={t("projects.renameNamed", { name })}
            onClick={() => onRename(project.id, project.name ?? null)}>{t("projects.rename")}</Button>
          <Button className="small recent-delete" type="button" size="xs" variant="subtle" title={t("projects.deleteNamed", { name })}
            onClick={() => onDelete(project.id, project.name ?? null)}>{t("common.delete")}</Button>
        </Group>
      </Card>;
    })}
  </SimpleGrid>;
}

/** Render recent projects as Mantine controls while retaining the project API boundary. */
export function mountRecentProjects(
  target: HTMLElement,
  projects: readonly RecentProjectCard[],
  onOpen: (id: string) => void,
  onRename: (id: string, name: string | null) => void,
  onDelete: (id: string, name: string | null) => void,
): void {
  mountMantinePortal("recent-projects", target,
    <RecentProjects projects={projects} onOpen={onOpen} onRename={onRename} onDelete={onDelete} />);
}
