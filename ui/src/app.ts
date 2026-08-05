// The reference interface.
//
// There is no canvas library and no second renderer (PRD §16.3). The canvas is
// the engine's own render, shown as an image, with plain DOM elements
// positioned on top of it for selection and handles.
//
// It shows the *rasterized* render rather than the SVG, and that is the whole
// point of the decision rather than a departure from it. A browser handed the
// SVG would re-render it — with its own fonts, not the pinned files in the
// font store — so the preview would differ from the export exactly where this
// project cares most. The PNG is byte-for-byte what `export` writes, so "what
// you see is what you get" is true by construction. Showing an image also
// means no document content is ever parsed as markup by the page.
//
// Selection lives here and only here (amended FR-7). Every edit is an
// Operation sent to the one endpoint, carrying the version the UI last read.

import * as api from "./api.js";
import type { Document, Layer, Operation } from "./api.js";

interface State {
  project: string | null;
  document: Document | null;
  /** Ids the user has selected. The engine never hears about this. */
  selection: string[];
  /** Layer being dragged, and where the drag started. */
  drag: {
    id: string;
    mode: "move" | "resize";
    startX: number;
    startY: number;
    origin: { x: number; y: number; width: number; height: number };
  } | null;
  busy: boolean;
}

const state: State = {
  project: null,
  document: null,
  selection: [],
  drag: null,
  busy: false,
};

function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`missing element #${id}`);
  return found as T;
}

const dom = {
  projects: el<HTMLSelectElement>("projects"),
  newProject: el<HTMLButtonElement>("new-project"),
  reload: el<HTMLButtonElement>("reload"),
  canvas: el<HTMLDivElement>("canvas"),
  canvasImage: el<HTMLImageElement>("canvas-image"),
  overlay: el<HTMLDivElement>("overlay"),
  layers: el<HTMLUListElement>("layers"),
  inspector: el<HTMLDivElement>("inspector"),
  history: el<HTMLOListElement>("history"),
  status: el<HTMLDivElement>("status"),
  version: el<HTMLSpanElement>("version"),
  addText: el<HTMLButtonElement>("add-text"),
  deleteLayer: el<HTMLButtonElement>("delete-layer"),
  groupLayers: el<HTMLButtonElement>("group-layers"),
  undo: el<HTMLButtonElement>("undo"),
  redo: el<HTMLButtonElement>("redo"),
  exportButton: el<HTMLButtonElement>("export"),
  download: el<HTMLAnchorElement>("download"),
  downloadSvg: el<HTMLAnchorElement>("download-svg"),
  shutdown: el<HTMLButtonElement>("shutdown"),
};

function say(message: string, kind: "info" | "error" = "info"): void {
  dom.status.textContent = message;
  dom.status.dataset["kind"] = kind;
}

/** Runs something that talks to the engine, reporting whatever it refuses. */
async function guard(what: string, run: () => Promise<void>): Promise<void> {
  if (state.busy) return;
  state.busy = true;
  try {
    await run();
  } catch (error) {
    if (error instanceof api.ApiError) {
      // The engine's own words. A refusal is information, not a crash.
      say(`${what}: ${error.message} (${error.code})`, "error");
    } else {
      say(`${what}: ${String(error)}`, "error");
    }
  } finally {
    state.busy = false;
  }
}

function selectedLayer(): Layer | null {
  if (!state.document || state.selection.length !== 1) return null;
  const wanted = state.selection[0];
  return (
    api.flatten(api.layersOf(state.document)).find(({ layer }) => layer.id === wanted)?.layer ?? null
  );
}

// --- rendering ---------------------------------------------------------------

async function refresh(): Promise<void> {
  if (!state.project) return;
  const doc = await api.getDocument(state.project);
  state.document = doc;
  state.selection = state.selection.filter((id) =>
    api.flatten(api.layersOf(doc)).some(({ layer }) => layer.id === id),
  );
  dom.version.textContent = String(api.versionOf(doc));

  // A render the engine produced, shown as an image. Nothing from the
  // document is ever interpreted as markup by this page. Fetched rather than
  // pointed at, because an <img src> cannot carry the access token and the
  // token must never go in a URL.
  const previous = dom.canvasImage.src;
  dom.canvasImage.src = await api.imageObjectUrl(
    api.pngUrl(state.project, api.versionOf(doc)),
  );
  if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
  dom.canvasImage.alt = `Preview of ${doc.name ?? state.project}`;
  dom.canvas.style.aspectRatio = `${doc.canvas.width} / ${doc.canvas.height}`;
  dom.downloadSvg.href = api.svgUrl(state.project, api.versionOf(doc));
  dom.downloadSvg.hidden = false;

  drawLayers();
  drawOverlay();
  drawInspector();
  await drawHistory();
}

function drawLayers(): void {
  dom.layers.replaceChildren();
  if (!state.document) return;
  // Top of the list is top of the stack: array order is z-order, so the list
  // reads the way the picture stacks.
  for (const { layer, depth } of api.flatten(api.layersOf(state.document)).reverse()) {
    const item = document.createElement("li");
    item.className = "layer";
    item.style.paddingLeft = `${8 + depth * 14}px`;
    item.dataset["id"] = layer.id;
    if (state.selection.includes(layer.id)) item.classList.add("selected");

    const label = document.createElement("span");
    label.className = "name";
    label.textContent =
      layer.name ?? (layer.type === "text" ? layer.text : layer.type) ?? layer.type;
    item.append(label);

    const why = api.whyNotEditable(layer);
    if (why) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = layer.protected
        ? "protected"
        : layer.readOnly
          ? "read-only"
          : "locked";
      badge.title = why;
      item.append(badge);
      item.classList.add("guarded");
    }
    if (!layer.visible) item.classList.add("hidden-layer");

    item.addEventListener("click", (event) => {
      // Additive selection with a modifier, which is what group needs.
      if (event.shiftKey || event.metaKey || event.ctrlKey) {
        state.selection = state.selection.includes(layer.id)
          ? state.selection.filter((id) => id !== layer.id)
          : [...state.selection, layer.id];
      } else {
        state.selection = [layer.id];
      }
      drawLayers();
      drawOverlay();
      drawInspector();
    });
    dom.layers.append(item);
  }
}

/**
 * Selection handles, as DOM elements over the SVG.
 *
 * Positioned in percentages of the canvas so they stay put when the preview is
 * scaled to fit the window, without anything having to recompute on resize.
 */
function drawOverlay(): void {
  dom.overlay.replaceChildren();
  if (!state.document) return;

  const { width, height } = state.document.canvas;
  for (const { layer, parent } of api.flatten(api.layersOf(state.document))) {
    if (!state.selection.includes(layer.id)) continue;
    // A layer inside a group is positioned relative to it; this build draws
    // handles for top-level layers only rather than guessing at a transform
    // chain it would then have to invert on drag.
    if (parent !== null) continue;

    const box = document.createElement("div");
    box.className = "handle-box";
    box.style.left = `${(layer.transform.x / width) * 100}%`;
    box.style.top = `${(layer.transform.y / height) * 100}%`;
    box.style.width = `${(layer.transform.width / width) * 100}%`;
    box.style.height = `${(layer.transform.height / height) * 100}%`;
    box.dataset["id"] = layer.id;

    if (api.isEditable(layer)) {
      box.addEventListener("pointerdown", (event) => beginDrag(event, layer, "move"));
      const grip = document.createElement("div");
      grip.className = "grip";
      grip.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        beginDrag(event, layer, "resize");
      });
      box.append(grip);
    } else {
      box.classList.add("guarded");
      box.title = api.whyNotEditable(layer) ?? "";
    }
    dom.overlay.append(box);
  }
}

function drawInspector(): void {
  dom.inspector.replaceChildren();
  const layer = selectedLayer();
  dom.deleteLayer.disabled = !layer || !api.isEditable(layer);
  dom.groupLayers.disabled = state.selection.length < 2;

  if (!layer) {
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent =
      state.selection.length > 1
        ? `${state.selection.length} layers selected`
        : "Select a layer to edit it.";
    dom.inspector.append(hint);
    return;
  }

  const why = api.whyNotEditable(layer);
  if (why) {
    const note = document.createElement("p");
    note.className = "guarded-note";
    note.textContent = why;
    dom.inspector.append(note);
  }

  const field = (
    label: string,
    value: string,
    apply: (next: string) => Operation | null,
    type = "text",
  ): void => {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    wrapper.append(document.createTextNode(label));
    const input = document.createElement("input");
    input.type = type;
    input.value = value;
    input.disabled = why !== null;
    input.addEventListener("change", () => {
      // Rebuilding the panel can fire `change` on an input that is being
      // removed, so a handler that trusted the event would edit the document
      // every time it redrew. Comparing with what was rendered is what makes
      // an edit an edit.
      if (input.value === value) return;
      const operation = apply(input.value);
      if (operation) void send(`change ${label}`, operation);
    });
    wrapper.append(input);
    dom.inspector.append(wrapper);
  };

  const t = layer.transform;
  field("x", String(t.x), (next) => moveTo(layer, Number(next), t.y), "number");
  field("y", String(t.y), (next) => moveTo(layer, t.x, Number(next)), "number");
  field("width", String(t.width), (next) => resizeTo(layer, Number(next), t.height), "number");
  field("height", String(t.height), (next) => resizeTo(layer, t.width, Number(next)), "number");
  field(
    "rotation",
    String(t.rotation ?? 0),
    (next) => ({ op: "rotate", id: layer.id, degrees: Number(next) }) as Operation,
    "number",
  );
  field(
    "opacity",
    String(layer.opacity ?? 1),
    (next) => ({ op: "update", id: layer.id, opacity: Number(next) }) as Operation,
    "number",
  );
  field("name", layer.name ?? "", (next) =>
    next === (layer.name ?? "")
      ? null
      : ({ op: "rename", id: layer.id, name: next || undefined } as Operation),
  );

  if (layer.type === "text") {
    field("text", layer.text, (next) => ({ op: "update", id: layer.id, text: next }) as Operation);
    field(
      "font size",
      String(layer.fontSize),
      (next) => ({ op: "update", id: layer.id, fontSize: Number(next) }) as Operation,
      "number",
    );
    field(
      "colour",
      layer.color ?? "#000000",
      (next) => ({ op: "update", id: layer.id, color: next }) as Operation,
      "color",
    );
  }

  const visible = document.createElement("label");
  visible.className = "field checkbox";
  const box = document.createElement("input");
  box.type = "checkbox";
  const wasVisible = layer.visible ?? true;
  box.checked = wasVisible;
  box.disabled = why !== null;
  box.addEventListener("change", () => {
    if (box.checked === wasVisible) return;
    void send("show/hide", { op: "setVisible", id: layer.id, visible: box.checked } as Operation);
  });
  visible.append(box, document.createTextNode("visible"));
  dom.inspector.append(visible);
}

async function drawHistory(): Promise<void> {
  if (!state.project) return;
  const history = await api.getHistory(state.project);
  dom.history.replaceChildren();
  for (const entry of history.entries.slice().reverse()) {
    const item = document.createElement("li");
    item.textContent = `${entry.position}. ${entry.kind} — ${entry.actor.kind}${
      entry.actor.detail ? ` (${entry.actor.detail})` : ""
    }`;
    if (entry.position > history.position) item.classList.add("undone");
    dom.history.append(item);
  }
  dom.undo.disabled = history.position === 0;
  dom.redo.disabled = history.position >= history.head;
}

// --- editing -----------------------------------------------------------------

function moveTo(layer: Layer, x: number, y: number): Operation | null {
  // The engine moves by a delta; the inspector edits an absolute position.
  const dx = x - layer.transform.x;
  const dy = y - layer.transform.y;
  // Setting a value to the one it already has is not an edit. Sending it
  // anyway would journal an operation that moved nothing — and, because every
  // send refreshes the inspector, would loop.
  if (dx === 0 && dy === 0) return null;
  return { op: "move", id: layer.id, dx, dy } as Operation;
}

function resizeTo(layer: Layer, width: number, height: number): Operation | null {
  if (width === layer.transform.width && height === layer.transform.height) return null;
  return { op: "resize", id: layer.id, width, height } as Operation;
}

async function send(what: string, operation: Operation): Promise<void> {
  await guard(what, async () => {
    if (!state.project || !state.document) return;
    const result = await api.applyOperation(
      state.project,
      operation,
      api.versionOf(state.document),
    );
    say(`${what}: done (version ${result.version})`);
    if (result.created?.length) state.selection = result.created;
    await refresh();
  });
}

function beginDrag(event: PointerEvent, layer: Layer, mode: "move" | "resize"): void {
  event.preventDefault();
  const rect = dom.canvas.getBoundingClientRect();
  if (rect.width === 0 || !state.document) return;
  state.drag = {
    id: layer.id,
    mode,
    startX: event.clientX,
    startY: event.clientY,
    origin: { ...layer.transform },
  };
  (event.target as Element).setPointerCapture?.(event.pointerId);
}

function dragScale(): number {
  const rect = dom.canvas.getBoundingClientRect();
  if (!state.document || rect.width === 0) return 1;
  // Screen pixels to document units: the canvas is scaled to fit.
  return state.document.canvas.width / rect.width;
}

window.addEventListener("pointermove", (event) => {
  const drag = state.drag;
  if (!drag || !state.document) return;
  const scale = dragScale();
  const dx = (event.clientX - drag.startX) * scale;
  const dy = (event.clientY - drag.startY) * scale;

  const box = dom.overlay.querySelector<HTMLElement>(`[data-id="${drag.id}"]`);
  if (!box) return;
  const { width, height } = state.document.canvas;
  if (drag.mode === "move") {
    box.style.left = `${((drag.origin.x + dx) / width) * 100}%`;
    box.style.top = `${((drag.origin.y + dy) / height) * 100}%`;
  } else {
    box.style.width = `${(Math.max(1, drag.origin.width + dx) / width) * 100}%`;
    box.style.height = `${(Math.max(1, drag.origin.height + dy) / height) * 100}%`;
  }
});

window.addEventListener("pointerup", (event) => {
  const drag = state.drag;
  state.drag = null;
  if (!drag) return;
  const scale = dragScale();
  const dx = Math.round((event.clientX - drag.startX) * scale);
  const dy = Math.round((event.clientY - drag.startY) * scale);
  if (dx === 0 && dy === 0) {
    drawOverlay();
    return;
  }
  if (drag.mode === "move") {
    void send("move", { op: "move", id: drag.id, dx, dy } as Operation);
  } else {
    void send("resize", {
      op: "resize",
      id: drag.id,
      width: Math.max(1, drag.origin.width + dx),
      height: Math.max(1, drag.origin.height + dy),
    } as Operation);
  }
});

// --- wiring ------------------------------------------------------------------

dom.projects.addEventListener("change", () => {
  state.project = dom.projects.value || null;
  state.selection = [];
  void guard("open", refresh);
});

dom.reload.addEventListener("click", () => void guard("reload", refresh));

dom.newProject.addEventListener("click", () => {
  const id = window.prompt("Project name (letters, digits, spaces, hyphens):");
  if (!id) return;
  void guard("create", async () => {
    await api.createProject(id, 1080, 1080, "#ffffff", id);
    await loadProjects(id);
    say(`created ${id}`);
  });
});

dom.addText.addEventListener("click", () => {
  void guard("add text", async () => {
    const families = await api.fonts();
    const family = families[0];
    if (!family) {
      say("no fonts installed — run: assemblash font install \"Noto Sans\"", "error");
      return;
    }
    if (!state.project || !state.document) return;
    const result = await api.applyOperation(
      state.project,
      {
        op: "create",
        position: { at: "root" },
        transform: { x: 40, y: 40, width: 400, height: 80 },
        type: "text",
        text: "New text",
        fontFamily: family,
        fontSize: 48,
        color: "#101820",
      } as Operation,
      api.versionOf(state.document),
    );
    if (result.created?.length) state.selection = result.created;
    say(`added a text layer (version ${result.version})`);
    await refresh();
  });
});

dom.deleteLayer.addEventListener("click", () => {
  const layer = selectedLayer();
  if (!layer) return;
  void send("delete", { op: "delete", id: layer.id } as Operation);
});

dom.groupLayers.addEventListener("click", () => {
  if (state.selection.length < 2) return;
  void send("group", { op: "group", ids: [...state.selection] } as Operation);
});

dom.undo.addEventListener("click", () => {
  void guard("undo", async () => {
    if (!state.project) return;
    const result = await api.undo(state.project);
    say(`undone (version ${result.version})`);
    await refresh();
  });
});

dom.redo.addEventListener("click", () => {
  void guard("redo", async () => {
    if (!state.project) return;
    const result = await api.redo(state.project);
    say(`redone (version ${result.version})`);
    await refresh();
  });
});

dom.exportButton.addEventListener("click", () => {
  void guard("export", async () => {
    if (!state.project || !state.document) return;
    const result = await api.exportDocument(state.project, "ui-export", 1);
    say(`exported ${result.path} — ${result.width}x${result.height}, ${result.bytes} bytes`);
    dom.download.href = api.pngUrl(state.project, api.versionOf(state.document));
    dom.download.hidden = false;
  });
});

async function loadProjects(select?: string): Promise<void> {
  const projects = await api.listProjects();
  dom.projects.replaceChildren();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = projects.length ? "Choose a project…" : "No projects yet";
  dom.projects.append(placeholder);
  for (const project of projects) {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = `${project.name ?? project.id} — ${project.layers} layers`;
    dom.projects.append(option);
  }
  if (select) {
    dom.projects.value = select;
    state.project = select;
    await refresh();
  }
}

dom.shutdown.addEventListener("click", () => {
  if (!window.confirm("Stop Assemblash? Any unsaved work is already on disk.")) return;
  void guard("stop", async () => {
    await api.shutdown();
    // The server finishes this request and then stops, so there is nothing
    // left to talk to. Say so plainly rather than leaving a page that looks
    // alive and answers nothing.
    dom.shutdown.disabled = true;
    document.body.classList.add("stopped");
    say("Assemblash has stopped. You can close this window.");
  });
});

void guard("start", async () => {
  // The button is offered only by a server that would accept it: one started
  // for a person, with no console to press Ctrl-C in. A server under a service
  // manager or in a container owns its own lifetime.
  const info = await api.serverInfo();
  dom.shutdown.hidden = !info.canShutdown;
  await loadProjects();
  say(`ready — Assemblash ${info.version}`);
});
