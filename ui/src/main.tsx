import "@mantine/core/styles.css";
import "./style.css";
import { startMantineRoot } from "./mantine-root.js";
import { mountChrome } from "./chrome.js";
import { mountCanvasControls, mountCanvasSurface } from "./canvas-surface.js";
import { mountSaveIndicator } from "./status-chrome.js";
import { mountPositionPopover } from "./position-popover-mantine.js";

const root = document.getElementById("mantine-root");
if (!(root instanceof HTMLElement)) throw new Error("Missing Mantine root");
const canvasRoot = document.getElementById("canvas-surface-root");
if (!(canvasRoot instanceof HTMLElement)) throw new Error("Missing canvas surface mount");
const canvasControlsRoot = document.getElementById("canvas-controls-root");
if (!(canvasControlsRoot instanceof HTMLElement)) throw new Error("Missing canvas controls mount");
startMantineRoot(root);
mountChrome();
mountCanvasSurface(canvasRoot);
mountCanvasControls(canvasControlsRoot);
const saveIndicator = document.getElementById("save-state");
if (!(saveIndicator instanceof HTMLElement)) throw new Error("Missing save indicator mount");
mountSaveIndicator(saveIndicator);
const positionRoot = document.getElementById("position-popover-root");
if (!(positionRoot instanceof HTMLElement)) throw new Error("Missing position popover mount");
mountPositionPopover(positionRoot);

// app.ts installs the established editor controller after the shared provider
// is ready. Its DOM boundary keeps canvas pointer handling and PNG previews.
void import("./app.js");
