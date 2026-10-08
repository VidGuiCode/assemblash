import { ActionIcon, Button, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import "@mantine/dropzone/styles.css";
import { t } from "./i18n.js";
import { mountMantinePortal } from "./mantine-root.js";

let uploadFile: ((file: File) => void) | null = null;

/** Connect the upload control to the editor's existing asset command. */
export function setAssetUploadHandler(handler: (file: File) => void): void {
  uploadFile = handler;
}

const icon = (name: string) => <i className={`ph ${name}`} aria-hidden="true" />;

const toolButtonStyles = {
  root: {
    width: "100%",
    height: "auto",
    minHeight: "3.25rem",
    paddingInline: 4,
    paddingBlock: 2,
    overflow: "visible",
  },
  inner: { width: "100%", height: "100%", minHeight: 0, overflow: "visible" },
  label: {
    display: "flex",
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    minHeight: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    overflow: "visible",
    overflowWrap: "anywhere",
    textAlign: "center",
    whiteSpace: "normal",
    lineHeight: 1,
  },
} as const;

const headerButtonStyles = {
  root: { height: "var(--header-control-height)", minHeight: "var(--header-control-height)" },
  inner: { height: "100%" },
} as const;

const leadingButtonStyles = {
  inner: { justifyContent: "flex-start" },
  label: { flex: "0 1 auto" },
} as const;

const shapeButtonStyles = {
  root: { width: "100%", minHeight: "3rem" },
  inner: { width: "100%" },
  label: {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "2rem minmax(0, 1fr)",
    alignItems: "center",
    gap: "0.75rem",
    textAlign: "left",
  },
} as const;

const uploadButtonStyles = {
  root: { width: "100%", minHeight: "7rem" },
  inner: {
    display: "grid",
    width: "100%",
    justifyItems: "center",
    alignContent: "center",
    gap: "0.5rem",
    whiteSpace: "normal",
    textAlign: "center",
  },
} as const;

function Header() {
  return <>
    <a className="brand" href="/" aria-label="Assemblash home" data-i18n-attr="aria-label:app.homeLabel">
      <svg className="brand-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false">
        <path d="M32 6 57 19 32 32 7 19 32 6Z" fill="#ef3325" opacity=".28" />
        <path d="M32 19 57 32 32 45 7 32l25-13Z" fill="#ef3325" opacity=".58" />
        <path d="M32 32 57 45 32 58 7 45l25-13Z" fill="#ef3325" />
        <path d="m32 17 10 5.2-10 5.2-10-5.2L32 17Z" fill="white" opacity=".94" />
      </svg>
      <span>Assemblash</span>
    </a>
    <div className="project-control">
      <div className="project-combobox" />
      <ActionIcon id="new-project" className="icon-button" type="button" size={40} variant="default" title="New project" data-i18n-attr="title:projects.newButton;aria-label:projects.newButton" aria-label="New project">
        {icon("ph-plus")}
      </ActionIcon>
    </div>
    <div className="topbar-history" aria-label="Document history" data-i18n-attr="aria-label:history.documentLabel">
      <ActionIcon id="undo" className="icon-button" type="button" size={40} variant="default" disabled title="Undo" data-i18n-attr="title:history.undo;aria-label:history.undo" aria-label="Undo">{icon("ph-arrow-counter-clockwise")}</ActionIcon>
      <ActionIcon id="redo" className="icon-button" type="button" size={40} variant="default" disabled title="Redo" data-i18n-attr="title:history.redo;aria-label:history.redo" aria-label="Redo">{icon("ph-arrow-clockwise")}</ActionIcon>
      <Button id="history-shortcut" className="version-pill" type="button" variant="default" styles={headerButtonStyles} title="Show history" data-i18n-attr="title:history.show">
        {icon("ph-clock-counter-clockwise")}<span><span data-i18n="history.version">Version</span> <span id="version">–</span></span>
      </Button>
      <span id="save-state" className="save-state" />
    </div>
    <div className="topbar-actions">
      <ActionIcon id="settings" className="icon-button" type="button" size={40} variant="default" title="Settings" data-i18n-attr="title:settings.openButton;aria-label:settings.openButton" aria-label="Settings">{icon("ph-gear-six")}</ActionIcon>
      <Button id="export" className="button button-primary export-button" type="button" styles={headerButtonStyles} aria-label="Export" data-i18n-attr="aria-label:export.openButton">
        {icon("ph-export")}<span data-i18n="export.openButton">Export</span>{icon("ph-caret-down")}
      </Button>
    </div>
  </>;
}

const tools = [
  { id: "select-tool", icon: "ph-cursor", aria: "toolbar.selectButton", label: "toolbar.selectButton", pressed: "false" },
  { id: "add-text", icon: "ph-text-t", aria: "toolbar.openText", label: "toolbar.textButton", pressed: "true", controls: "add-panel", active: true },
  { id: "add-shape", icon: "ph-shapes", aria: "toolbar.openElements", label: "toolbar.elementsButton", pressed: "false", controls: "add-panel" },
  { id: "add-image", icon: "ph-image", aria: "toolbar.openUploads", label: "toolbar.uploadsButton", pressed: "false", controls: "add-panel" },
  { id: "templates-toggle", icon: "ph-layout", aria: "toolbar.openTemplates", label: "toolbar.templatesButton", pressed: "false", controls: "add-panel" },
] as const;

function ToolRail() {
  return <>
    {tools.map((tool) => <Button key={tool.id} id={tool.id} type="button" variant="subtle" className={`tool${"active" in tool && tool.active ? " active" : ""}`} styles={toolButtonStyles} aria-label={tool.aria} title={tool.label.split(".")[1]} aria-pressed={tool.pressed} aria-controls={"controls" in tool ? tool.controls : undefined} data-i18n-attr={`aria-label:${tool.aria};title:${tool.label}`}>
      {icon(tool.icon)}<span className="tool-label" data-i18n={tool.label}>{tool.label.split(".")[1]}</span>
    </Button>)}
    <span className="toolrail-spacer" />
    <Button id="dock-toggle" className="tool" type="button" variant="subtle" styles={toolButtonStyles} aria-label="Toggle properties and layers" title="Panels" aria-expanded="true" aria-controls="structure-panel" data-i18n-attr="aria-label:toolbar.togglePanels;title:toolbar.panelsButton">
      {icon("ph-sidebar-simple")}<span className="tool-label" data-i18n="toolbar.panelsButton">Panels</span>
    </Button>
  </>;
}

function AddPanel() {
  return <>
    <div className="panel-heading">
      <Text component="h2" id="add-panel-title"><span data-i18n="toolbar.textButton">Text</span></Text>
      <ActionIcon id="add-panel-close" className="icon-button" type="button" variant="subtle" title="Collapse Add panel" data-i18n-attr="title:panels.collapseAdd;aria-label:panels.collapseAdd" aria-label="Collapse Add panel">{icon("ph-x")}</ActionIcon>
    </div>
    <section className="add-section" id="add-text-section">
      <div className="section-title"><h3><span data-i18n="toolbar.textButton">Text</span></h3>{icon("ph-caret-up")}</div>
      <Button className="text-preset plain" type="button" variant="default" styles={leadingButtonStyles} data-text-preset="plain"><span data-i18n="text.plain">Plain text</span></Button>
      <Button className="text-preset heading" type="button" variant="default" styles={leadingButtonStyles} data-text-preset="heading"><span data-i18n="text.heading">Heading</span></Button>
      <Button className="text-preset subheading" type="button" variant="default" styles={leadingButtonStyles} data-text-preset="subheading"><span data-i18n="text.subheading">Subheading</span></Button>
      <Button className="text-preset body" type="button" variant="default" styles={leadingButtonStyles} data-text-preset="body"><span data-i18n="text.body">Body text</span></Button>
    </section>
    <section className="add-section" id="add-shape-section" hidden>
      <div className="section-title"><h3><span data-i18n="toolbar.elementsButton">Elements</span></h3></div>
      <div className="shape-row">
        <Text className="element-group-title" data-i18n="elements.shapes">Shapes</Text>
        <Button className="shape-preset" type="button" variant="default" radius={12} styles={shapeButtonStyles} data-shape="rect"><span className="shape-preset-icon">{icon("ph-square")}</span><span data-i18n="shapes.rectangle">Rectangle</span></Button>
        <Button className="shape-preset" type="button" variant="default" radius={12} styles={shapeButtonStyles} data-shape="ellipse"><span className="shape-preset-icon">{icon("ph-circle")}</span><span data-i18n="shapes.ellipse">Ellipse</span></Button>
        <Text className="element-group-title" data-i18n="elements.lines">Lines</Text>
        <Button className="shape-preset" type="button" variant="default" radius={12} styles={shapeButtonStyles} data-shape="line"><span className="shape-preset-icon">{icon("ph-line-segment")}</span><span data-i18n="shapes.line">Line</span></Button>
        <Text className="element-group-title" data-i18n="elements.paths">Paths</Text>
        <Button className="shape-preset" type="button" variant="default" radius={12} styles={shapeButtonStyles} data-shape="path"><span className="shape-preset-icon">{icon("ph-bezier-curve")}</span><span data-i18n="shapes.path">Path</span></Button>
      </div>
    </section>
    <section className="add-section" id="add-upload-section" hidden>
      <div className="section-title"><h3><span data-i18n="toolbar.uploadsButton">Uploads</span></h3></div>
      <Dropzone id="upload-dropzone" className="upload-dropzone" styles={uploadButtonStyles}
        multiple={false} dragEventsBubbling={false}
        accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"], "image/gif": [".gif"], "image/svg+xml": [".svg"] }}
        inputProps={{ id: "image-file" }}
        onDrop={(files) => { if (files[0]) uploadFile?.(files[0]); }}
        onReject={(files) => {
          const feedback = document.getElementById("upload-feedback");
          if (feedback && files[0]) feedback.textContent = t("uploads.failed", { name: files[0].file.name });
        }}>
        {icon("ph-cloud-arrow-up")}<strong data-i18n="uploads.dropFiles">Drop files here</strong><span data-i18n="uploads.orBrowse">or browse images and SVG</span>
      </Dropzone>
      <div id="upload-feedback" className="upload-feedback" aria-live="polite" />
    </section>
    <section className="add-section" id="add-template-section" hidden>
      <div className="section-title"><h3><span data-i18n="toolbar.templatesButton">Templates</span></h3></div>
      <p className="hint" data-i18n="templates.fillWorkspaceHint">Fill project slots and render variants from this workspace.</p>
      <Button id="open-templates" className="wide-action" type="button" variant="default" styles={leadingButtonStyles}>{icon("ph-layout")}<span data-i18n="templates.openTools">Open template tools</span></Button>
    </section>
    <section className="add-section" id="add-fonts-section" hidden>
      <div className="section-title"><h3><span data-i18n="toolbar.fontsButton">Fonts</span></h3></div>
      <p className="hint" data-i18n="fonts.rendererHint">The families the renderer draws with. Imported files are copied into the workspace font store.</p>
      <div id="fonts-mantine-mount" />
    </section>
  </>;
}

/** Mount standard editor chrome through the one Mantine provider. */
export function mountChrome(): void {
  const header = document.getElementById("chrome-header-root");
  const rail = document.getElementById("chrome-toolrail-root");
  const add = document.getElementById("chrome-add-root");
  if (!(header instanceof HTMLElement) || !(rail instanceof HTMLElement) || !(add instanceof HTMLElement)) {
    throw new Error("Missing editor chrome mounts");
  }
  mountMantinePortal("chrome-header", header, <Header />);
  mountMantinePortal("chrome-tools", rail, <ToolRail />);
  mountMantinePortal("chrome-add", add, <AddPanel />);
}
