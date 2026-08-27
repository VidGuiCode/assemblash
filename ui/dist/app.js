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
import { mountExport } from "./export.js";
import { resizeItemInSelection, resizedBounds, resizedRotatedBounds, rotatedRectBounds, selectionBounds, } from "./geometry.js";
import { mountTemplates } from "./templates.js";
const state = {
    project: null,
    document: null,
    presets: [],
    slots: [],
    selection: [],
    drag: null,
    busy: false,
    zoom: null,
    pan: { x: 0, y: 0 },
    editingText: null,
};
let dragPreviewCache = null;
function el(id) {
    const found = document.getElementById(id);
    if (!found)
        throw new Error(`missing element #${id}`);
    return found;
}
const dom = {
    projects: el("projects"),
    newProject: el("new-project"),
    reload: el("reload"),
    search: el("project-search"),
    recents: el("recents"),
    canvasEmpty: el("canvas-empty"),
    canvas: el("canvas"),
    canvasImage: el("canvas-image"),
    overlay: el("overlay"),
    structure: el("structure-panel"),
    layers: el("layers"),
    layerSearch: el("layer-search"),
    inspector: el("inspector"),
    advancedInspector: el("advanced-inspector"),
    propertiesPanel: el("properties-panel"),
    propertiesTab: el("properties-tab"),
    history: el("history"),
    layersTab: el("layers-tab"),
    historyTab: el("history-tab"),
    layersView: el("layers-view"),
    historyView: el("history-view"),
    historyShortcut: el("history-shortcut"),
    status: el("status"),
    saveState: el("save-state"),
    documentDimensions: el("document-dimensions"),
    version: el("version"),
    selectTool: el("select-tool"),
    addToggle: el("add-toggle"),
    addPanel: el("add-panel"),
    addPanelTitle: el("add-panel-title"),
    addPanelClose: el("add-panel-close"),
    dockToggle: el("dock-toggle"),
    addText: el("add-text"),
    addImage: el("add-image"),
    addVector: el("add-vector"),
    imageFile: el("image-file"),
    vectorFile: el("vector-file"),
    uploadDropzone: el("upload-dropzone"),
    uploadFeedback: el("upload-feedback"),
    browseVector: el("browse-vector"),
    openTemplates: el("open-templates"),
    deleteLayer: el("delete-layer"),
    groupLayers: el("group-layers"),
    undo: el("undo"),
    redo: el("redo"),
    exportButton: el("export"),
    downloadSvg: el("download-svg"),
    shutdown: el("shutdown"),
    emptyCreate: el("empty-create"),
    newProjectDialog: el("new-project-dialog"),
    newProjectForm: el("new-project-form"),
    newProjectName: el("new-project-name"),
    newProjectWidth: el("new-project-width"),
    newProjectHeight: el("new-project-height"),
    newProjectBackground: el("new-project-background"),
    canvasPresets: el("canvas-presets"),
    nameDialog: el("name-dialog"),
    nameDialogForm: el("name-dialog-form"),
    nameDialogTitle: el("name-dialog-title"),
    nameDialogLabel: el("name-dialog-label"),
    nameDialogInput: el("name-dialog-input"),
    nameDialogConfirm: el("name-dialog-confirm"),
    positionPopover: el("position-popover"),
    positionClose: el("position-close"),
    positionFields: el("position-fields"),
    contextMenu: el("context-menu"),
    stageViewport: el("stage-viewport"),
    zoomOut: el("zoom-out"),
    zoomValue: el("zoom-value"),
    zoomIn: el("zoom-in"),
    zoomFit: el("zoom-fit"),
    zoom100: el("zoom-100"),
    templatesPanel: el("templates"),
    templatesToggle: el("templates-toggle"),
    templatesClose: el("templates-close"),
};
let submitRequestedName = null;
function requestName(title, label, confirmLabel, submit) {
    submitRequestedName = submit;
    dom.nameDialogTitle.textContent = title;
    dom.nameDialogLabel.textContent = label;
    dom.nameDialogConfirm.textContent = confirmLabel;
    dom.nameDialogInput.value = "";
    dom.nameDialog.showModal();
    dom.nameDialogInput.focus();
}
dom.nameDialogForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    if (submitter?.value === "cancel") {
        submitRequestedName = null;
        dom.nameDialog.close("cancel");
        return;
    }
    if (!dom.nameDialogForm.reportValidity())
        return;
    const name = dom.nameDialogInput.value.trim();
    if (!name)
        return;
    const submit = submitRequestedName;
    submitRequestedName = null;
    dom.nameDialog.close("default");
    submit?.(name);
});
function say(message, kind = "info") {
    dom.status.textContent = message;
    dom.status.dataset["kind"] = kind;
}
/** Runs something that talks to the engine, reporting whatever it refuses. */
async function guard(what, run) {
    if (state.busy)
        return;
    state.busy = true;
    dom.status.dataset["kind"] = "info";
    dom.saveState.innerHTML =
        '<i class="ph ph-circle-notch" aria-hidden="true"></i><span>Working…</span>';
    try {
        await run();
    }
    catch (error) {
        dom.saveState.innerHTML =
            '<i class="ph ph-warning-circle" aria-hidden="true"></i><span>Needs attention</span>';
        if (error instanceof api.ApiError) {
            // The engine's own words. A refusal is information, not a crash.
            say(`${what}: ${error.message} (${error.code})`, "error");
        }
        else {
            say(`${what}: ${String(error)}`, "error");
        }
    }
    finally {
        state.busy = false;
        if (dom.status.dataset["kind"] !== "error") {
            dom.saveState.innerHTML =
                '<i class="ph ph-check-circle" aria-hidden="true"></i><span>All changes saved</span>';
        }
    }
}
/**
 * The template panel, which is a client of this page exactly as this page is
 * a client of the engine: it is handed what it needs and owns nothing else.
 */
const templates = mountTemplates({
    project: () => state.project,
    document: () => state.document,
    say,
    guard,
    refresh: () => refresh(),
});
// Template work belongs to the same creation panel as Text, Uploads, and
// Vector. Moving the existing renderer-backed controls here avoids a second
// floating workspace covering the canvas.
el("add-template-section").append(dom.templatesPanel);
const exporter = mountExport({
    project: () => state.project,
    document: () => state.document,
    say,
    guard,
});
function selectedLayer() {
    if (!state.document || state.selection.length !== 1)
        return null;
    const wanted = state.selection[0];
    return (api.flatten(api.layersOf(state.document)).find(({ layer }) => layer.id === wanted)?.layer ?? null);
}
function selectedLayers() {
    if (!state.document)
        return [];
    const selected = new Set(state.selection);
    return api
        .flatten(api.layersOf(state.document))
        .map(({ layer }) => layer)
        .filter((layer) => selected.has(layer.id));
}
function wireLongPressMenu(target, beforeOpen) {
    let timer = 0;
    let start = { x: 0, y: 0 };
    const cancel = () => {
        window.clearTimeout(timer);
        timer = 0;
    };
    target.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "touch" && event.pointerType !== "pen")
            return;
        start = { x: event.clientX, y: event.clientY };
        timer = window.setTimeout(() => {
            beforeOpen?.();
            openContextMenu(start.x, start.y);
            navigator.vibrate?.(20);
        }, 550);
    });
    target.addEventListener("pointermove", (event) => {
        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8)
            cancel();
    });
    target.addEventListener("pointerup", cancel);
    target.addEventListener("pointercancel", cancel);
}
// --- rendering ---------------------------------------------------------------
async function refresh() {
    if (!state.project)
        return;
    const doc = await api.getDocument(state.project);
    state.document = doc;
    state.selection = state.selection.filter((id) => api.flatten(api.layersOf(doc)).some(({ layer }) => layer.id === id));
    dom.version.textContent = String(api.versionOf(doc));
    dom.canvasEmpty.hidden = true;
    dom.canvas.hidden = false;
    dom.documentDimensions.textContent =
        `${Math.round(doc.canvas.width).toLocaleString()} × ${Math.round(doc.canvas.height).toLocaleString()}`;
    // A render the engine produced, shown as an image. Nothing from the
    // document is ever interpreted as markup by this page. Fetched rather than
    // pointed at, because an <img src> cannot carry the access token and the
    // token must never go in a URL.
    const previous = dom.canvasImage.src;
    dom.canvasImage.src = await api.imageObjectUrl(api.pngUrl(state.project, api.versionOf(doc), interactivePreviewScale()));
    if (previous.startsWith("blob:"))
        URL.revokeObjectURL(previous);
    clearDragPreviewCache();
    dom.canvasImage.alt = `Preview of ${doc.name ?? state.project}`;
    dom.canvas.style.aspectRatio = `${doc.canvas.width} / ${doc.canvas.height}`;
    applyZoom();
    dom.downloadSvg.href = api.svgUrl(state.project, api.versionOf(doc));
    dom.downloadSvg.hidden = false;
    // Read with the document, because defining or deleting one is an ordinary
    // operation and every operation refreshes.
    state.presets = await api.getPresets(state.project);
    // Slots come with the document itself, so there is nothing extra to fetch:
    // a template is a document that names some of its own layers.
    state.slots = (doc.slots ?? []);
    drawLayers();
    drawOverlay();
    drawInspector();
    await drawHistory();
}
/**
 * Ask the deterministic renderer for the pixels the editor can actually show.
 * Export remains full resolution; rendering hidden pixels on every edit only
 * delays feedback and does not improve the fitted canvas.
 */
function interactivePreviewScale() {
    if (!state.document)
        return 1;
    const availableWidth = Math.max(240, dom.stageViewport.clientWidth - 96);
    const availableHeight = Math.max(180, dom.stageViewport.clientHeight - 96);
    const fit = Math.min(availableWidth / state.document.canvas.width, availableHeight / state.document.canvas.height, 1);
    const displayed = state.zoom ?? fit;
    const density = Math.max(1, window.devicePixelRatio || 1);
    return Math.min(1, Math.max(0.1, displayed * density));
}
function drawLayers() {
    dom.layers.replaceChildren();
    if (!state.document)
        return;
    const query = dom.layerSearch.value.trim().toLowerCase();
    const flat = api.flatten(api.layersOf(state.document));
    const appendLayer = (layer, depth, parent) => {
        const visibleName = layer.name ?? (layer.type === "text" ? layer.text : layer.type) ?? layer.type;
        const childMatches = layer.type === "group" &&
            (layer.children ?? []).some((child) => (child.name ?? (child.type === "text" ? child.text : child.type) ?? child.type)
                .toLowerCase()
                .includes(query));
        if (query && !visibleName.toLowerCase().includes(query) && !childMatches)
            return;
        const item = document.createElement("li");
        item.className = "layer";
        item.dataset["type"] = layer.type;
        item.style.setProperty("--layer-depth", String(depth));
        item.dataset["id"] = layer.id;
        item.dataset["parent"] = parent ?? "";
        if (state.selection.includes(layer.id))
            item.classList.add("selected");
        item.tabIndex = 0;
        item.draggable = api.isEditable(layer);
        const visibility = document.createElement("button");
        visibility.type = "button";
        visibility.className = "layer-control";
        visibility.title = layer.visible ? "Hide layer" : "Show layer";
        visibility.disabled = !api.isEditable(layer);
        visibility.innerHTML = `<i class="ph ${layer.visible ? "ph-eye" : "ph-eye-slash"}" aria-hidden="true"></i><span class="sr-only">${visibility.title}</span>`;
        visibility.addEventListener("click", (event) => {
            event.stopPropagation();
            void send(layer.visible ? "hide layer" : "show layer", {
                op: "setVisible",
                id: layer.id,
                visible: !layer.visible,
            });
        });
        const icon = document.createElement("i");
        const layerIcons = {
            text: "ph-text-t",
            image: "ph-image",
            svg: "ph-pen-nib",
            group: "ph-stack",
        };
        icon.className = `ph ${layerIcons[layer.type] ?? "ph-square"} layer-icon`;
        icon.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.className = "name";
        label.textContent = visibleName;
        label.title = "Double-click to rename";
        const lock = document.createElement("button");
        lock.type = "button";
        lock.className = "layer-control";
        lock.title = layer.locked ? "Unlock layer" : "Lock layer";
        lock.disabled = Boolean(layer.protected || layer.readOnly);
        lock.innerHTML = `<i class="ph ${layer.locked ? "ph-lock" : "ph-lock-open"}" aria-hidden="true"></i><span class="sr-only">${lock.title}</span>`;
        lock.addEventListener("click", (event) => {
            event.stopPropagation();
            void send(layer.locked ? "unlock layer" : "lock layer", {
                op: "setLocked",
                id: layer.id,
                locked: !layer.locked,
            });
        });
        item.append(visibility, icon, label, lock);
        const why = api.whyNotEditable(layer);
        if (why) {
            label.title = why;
            item.classList.add("guarded");
        }
        if (!layer.visible)
            item.classList.add("hidden-layer");
        item.addEventListener("click", (event) => {
            // Additive selection with a modifier, which is what group needs.
            if (event.shiftKey || event.metaKey || event.ctrlKey) {
                state.selection = state.selection.includes(layer.id)
                    ? state.selection.filter((id) => id !== layer.id)
                    : [...state.selection, layer.id];
            }
            else {
                state.selection = [layer.id];
            }
            drawLayers();
            drawOverlay();
            drawInspector();
            if (window.matchMedia("(max-width: 720px)").matches) {
                dom.structure.classList.remove("mobile-open");
                dom.dockToggle.setAttribute("aria-expanded", "false");
            }
        });
        label.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            beginLayerRename(layer, label);
        });
        item.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            if (!state.selection.includes(layer.id))
                state.selection = [layer.id];
            drawLayers();
            drawOverlay();
            drawInspector();
            openContextMenu(event.clientX, event.clientY);
        });
        wireLongPressMenu(item, () => {
            if (!state.selection.includes(layer.id))
                state.selection = [layer.id];
            drawLayers();
            drawOverlay();
            drawInspector();
        });
        item.addEventListener("keydown", (event) => {
            if (event.key === "F2") {
                event.preventDefault();
                beginLayerRename(layer, label);
            }
            if (event.key === "F10" && event.shiftKey) {
                event.preventDefault();
                const rect = item.getBoundingClientRect();
                openContextMenu(rect.left + 24, rect.top + 24);
            }
        });
        item.addEventListener("dragstart", (event) => {
            event.dataTransfer?.setData("text/plain", layer.id);
            item.classList.add("dragging");
        });
        item.addEventListener("dragend", () => item.classList.remove("dragging"));
        item.addEventListener("dragover", (event) => {
            event.preventDefault();
            item.classList.add("drop-target");
        });
        item.addEventListener("dragleave", () => item.classList.remove("drop-target"));
        item.addEventListener("drop", (event) => {
            event.preventDefault();
            item.classList.remove("drop-target");
            const moved = event.dataTransfer?.getData("text/plain");
            if (!moved || moved === layer.id)
                return;
            const target = flat.find(({ layer: one }) => one.id === layer.id);
            const parentLayer = target?.parent
                ? flat.find(({ layer: one }) => one.id === target.parent)?.layer
                : null;
            const parentLayers = parentLayer?.type === "group"
                ? parentLayer.children ?? []
                : api.layersOf(state.document);
            const targetIndex = parentLayers.findIndex((one) => one.id === layer.id);
            const to = layer.type === "group"
                ? { at: "in", parent: layer.id }
                : target?.parent
                    ? { at: "in", parent: target.parent, index: Math.max(0, targetIndex + 1) }
                    : { at: "root", index: Math.max(0, targetIndex + 1) };
            void send("reorder layer", { op: "reorder", id: moved, to });
        });
        dom.layers.append(item);
        if (layer.type === "group") {
            for (const child of [...(layer.children ?? [])].reverse()) {
                appendLayer(child, depth + 1, layer.id);
            }
        }
    };
    for (const layer of [...api.layersOf(state.document)].reverse()) {
        appendLayer(layer, 0, null);
    }
}
function beginLayerRename(layer, label) {
    if (layer.protected || layer.readOnly)
        return;
    const input = document.createElement("input");
    input.className = "layer-rename";
    input.value = layer.name ?? (layer.type === "text" ? layer.text : layer.type) ?? layer.type;
    label.replaceWith(input);
    input.focus();
    input.select();
    let finished = false;
    const finish = (commit) => {
        if (finished)
            return;
        finished = true;
        const next = input.value.trim();
        if (commit && next !== (layer.name ?? "")) {
            void send("rename layer", { op: "rename", id: layer.id, name: next || undefined });
        }
        else {
            drawLayers();
        }
    };
    input.addEventListener("blur", () => finish(true));
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter")
            finish(true);
        if (event.key === "Escape")
            finish(false);
    });
}
/**
 * Where a layer's parents put it, or null if a rotated group makes it
 * unanswerable with translations alone.
 */
function ancestorOffset(flat, parent) {
    let offset = { x: 0, y: 0 };
    let current = parent;
    while (current !== null) {
        const found = flat.find(({ layer }) => layer.id === current);
        if (!found)
            return null;
        if ((found.layer.transform.rotation ?? 0) !== 0)
            return null;
        offset = {
            x: offset.x + found.layer.transform.x,
            y: offset.y + found.layer.transform.y,
        };
        current = found.parent;
    }
    return offset;
}
/**
 * Selection handles, as DOM elements over the SVG.
 *
 * Positioned in percentages of the canvas so they stay put when the preview is
 * scaled to fit the window, without anything having to recompute on resize.
 */
function drawOverlay() {
    dom.overlay.replaceChildren();
    if (!state.document)
        return;
    const { width, height } = state.document.canvas;
    const flat = api.flatten(api.layersOf(state.document));
    const geometries = flat.flatMap(({ layer, parent }) => {
        const offset = ancestorOffset(flat, parent);
        return offset
            ? [{
                    layer,
                    x: layer.transform.x + offset.x,
                    y: layer.transform.y + offset.y,
                    width: layer.transform.width,
                    height: layer.transform.height,
                }]
            : [];
    });
    for (const geometry of geometries) {
        const hit = document.createElement("div");
        hit.className = "layer-hitbox";
        hit.dataset["id"] = geometry.layer.id;
        hit.style.left = `${(geometry.x / width) * 100}%`;
        hit.style.top = `${(geometry.y / height) * 100}%`;
        hit.style.width = `${(geometry.width / width) * 100}%`;
        hit.style.height = `${(geometry.height / height) * 100}%`;
        hit.style.transformOrigin = "center";
        hit.style.transform = `rotate(${geometry.layer.transform.rotation ?? 0}deg)`;
        hit.addEventListener("pointerdown", (event) => {
            if (event.shiftKey || event.ctrlKey || event.metaKey) {
                state.selection = state.selection.includes(geometry.layer.id)
                    ? state.selection.filter((id) => id !== geometry.layer.id)
                    : [...state.selection, geometry.layer.id];
            }
            else if (!state.selection.includes(geometry.layer.id)) {
                state.selection = [geometry.layer.id];
            }
            drawLayers();
            drawInspector();
            drawOverlay();
        });
        hit.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            if (geometry.layer.type === "text")
                beginInlineTextEdit(geometry.layer);
        });
        hit.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            if (!state.selection.includes(geometry.layer.id))
                state.selection = [geometry.layer.id];
            drawLayers();
            drawInspector();
            drawOverlay();
            openContextMenu(event.clientX, event.clientY);
        });
        wireLongPressMenu(hit);
        dom.overlay.append(hit);
    }
    const selected = geometries.filter(({ layer }) => state.selection.includes(layer.id));
    if (selected.length === 0)
        return;
    void prepareDragPreview(selected.map(({ layer }) => layer.id));
    // A single layer uses its own unrotated box because the DOM box itself is
    // rotated. A multi-selection cannot have one meaningful angle, so its box
    // contains the visual (rotated) extents of every selected layer.
    const bounds = selected.length === 1
        ? {
            x: selected[0].x,
            y: selected[0].y,
            width: selected[0].width,
            height: selected[0].height,
        }
        : selectionBounds(selected.map((one) => ({
            x: one.x,
            y: one.y,
            width: one.width,
            height: one.height,
            rotation: one.layer.transform.rotation ?? 0,
        })));
    const box = document.createElement("div");
    box.className = "handle-box";
    box.style.left = `${(bounds.x / width) * 100}%`;
    box.style.top = `${(bounds.y / height) * 100}%`;
    box.style.width = `${(bounds.width / width) * 100}%`;
    box.style.height = `${(bounds.height / height) * 100}%`;
    box.style.transformOrigin = "center";
    if (selected.length === 1) {
        box.style.transform = `rotate(${selected[0]?.layer.transform.rotation ?? 0}deg)`;
    }
    box.dataset["ids"] = state.selection.join(",");
    box.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openContextMenu(event.clientX, event.clientY);
    });
    const editable = selected.every(({ layer }) => api.isEditable(layer));
    if (editable) {
        box.addEventListener("pointerdown", (event) => beginDrag(event, selected, bounds, "move"));
        box.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            const text = selected.length === 1 && selected[0]?.layer.type === "text"
                ? selected[0].layer
                : null;
            if (text)
                beginInlineTextEdit(text);
        });
        for (const handle of ["nw", "n", "ne", "e", "se", "s", "sw", "w"]) {
            const grip = document.createElement("button");
            grip.type = "button";
            grip.className = `resize-handle handle-${handle}`;
            grip.dataset["handle"] = handle;
            grip.setAttribute("aria-label", `Resize ${handle}`);
            grip.addEventListener("pointerdown", (event) => {
                event.stopPropagation();
                beginDrag(event, selected, bounds, "resize", handle);
            });
            box.append(grip);
        }
        const rotate = document.createElement("button");
        rotate.type = "button";
        rotate.className = "rotation-handle";
        rotate.setAttribute("aria-label", "Rotate selection");
        rotate.innerHTML = '<i class="ph ph-arrow-clockwise" aria-hidden="true"></i>';
        rotate.addEventListener("pointerdown", (event) => {
            event.stopPropagation();
            beginDrag(event, selected, bounds, "rotate");
        });
        box.append(rotate);
    }
    else {
        box.classList.add("guarded");
        box.title = selected.map(({ layer }) => api.whyNotEditable(layer)).filter(Boolean).join("; ");
    }
    dom.overlay.append(box);
}
function drawInspectorLegacy() {
    dom.inspector.replaceChildren();
    delete dom.inspector.dataset["layerType"];
    dom.advancedInspector.replaceChildren();
    const layer = selectedLayer();
    dom.deleteLayer.disabled = !layer || !api.isEditable(layer);
    dom.groupLayers.disabled = state.selection.length < 2;
    if (!layer) {
        const hint = document.createElement("div");
        hint.className = "inspector-empty";
        const icon = document.createElement("i");
        icon.className = "ph ph-cursor-click";
        icon.setAttribute("aria-hidden", "true");
        const copy = document.createElement("span");
        copy.textContent =
            state.selection.length > 1
                ? `${state.selection.length} layers selected`
                : "Select a layer to edit it";
        hint.append(icon, copy);
        dom.inspector.append(hint);
        const advancedHint = document.createElement("p");
        advancedHint.className = "hint";
        advancedHint.textContent = "Choose one layer to see all of its properties.";
        dom.advancedInspector.append(advancedHint);
        return;
    }
    const why = api.whyNotEditable(layer);
    dom.inspector.dataset["layerType"] = layer.type;
    if (why) {
        const note = document.createElement("p");
        note.className = "guarded-note";
        note.textContent = why;
        dom.advancedInspector.append(note);
    }
    const field = (target, label, value, apply, type = "text") => {
        const wrapper = document.createElement("label");
        wrapper.className = "field";
        wrapper.dataset["field"] = label.toLowerCase().replace(/\s+/g, "-");
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
            if (input.value === value)
                return;
            const operation = apply(input.value);
            if (operation)
                void send(`change ${label}`, operation);
        });
        wrapper.append(input);
        target.append(wrapper);
    };
    const t = layer.transform;
    // The strip above the canvas contains only the properties people reach for
    // repeatedly. Everything else remains one click away in the full panel.
    field(dom.inspector, "Layer", layer.name ?? layer.type, (next) => next === (layer.name ?? layer.type)
        ? null
        : { op: "rename", id: layer.id, name: next || undefined });
    if (layer.type === "text") {
        field(dom.inspector, "Text", layer.text, (next) => ({ op: "update", id: layer.id, text: next }));
        field(dom.inspector, "Size", String(layer.fontSize), (next) => ({ op: "update", id: layer.id, fontSize: Number(next) }), "number");
        field(dom.inspector, "Colour", layer.color ?? "#000000", (next) => ({ op: "update", id: layer.id, color: next }), "color");
        const align = document.createElement("div");
        align.className = "align-control";
        align.dataset["field"] = "align";
        for (const [value, iconName] of [
            ["left", "ph-text-align-left"],
            ["center", "ph-text-align-center"],
            ["right", "ph-text-align-right"],
        ]) {
            const button = document.createElement("button");
            button.type = "button";
            button.title = `Align ${value}`;
            button.disabled = why !== null;
            if ((layer.align ?? "left") === value)
                button.classList.add("selected");
            const icon = document.createElement("i");
            icon.className = `ph ${iconName}`;
            icon.setAttribute("aria-hidden", "true");
            button.append(icon);
            button.addEventListener("click", () => {
                if ((layer.align ?? "left") === value)
                    return;
                void send(`align text ${value}`, {
                    op: "update",
                    id: layer.id,
                    align: value,
                });
            });
            align.append(button);
        }
        dom.inspector.append(align);
    }
    field(dom.inspector, "X", String(t.x), (next) => moveTo(layer, Number(next), t.y), "number");
    field(dom.inspector, "Y", String(t.y), (next) => moveTo(layer, t.x, Number(next)), "number");
    const centreOnCanvas = document.createElement("button");
    centreOnCanvas.type = "button";
    centreOnCanvas.className = "inspector-action";
    centreOnCanvas.title = "Calculate and place this layer at the centre of the canvas";
    centreOnCanvas.disabled = why !== null;
    const centreIcon = document.createElement("i");
    centreIcon.className = "ph ph-crosshair-simple";
    centreIcon.setAttribute("aria-hidden", "true");
    const centreLabel = document.createElement("span");
    centreLabel.textContent = "Centre on canvas";
    centreOnCanvas.append(centreIcon, centreLabel);
    centreOnCanvas.addEventListener("click", () => {
        void send("centre layer on canvas", {
            op: "centerOnCanvas",
            ids: [layer.id],
            axis: "both",
        });
    });
    dom.inspector.append(centreOnCanvas);
    field(dom.inspector, "Width", String(t.width), (next) => resizeTo(layer, Number(next), t.height), "number");
    field(dom.inspector, "Height", String(t.height), (next) => resizeTo(layer, t.width, Number(next)), "number");
    const heading = document.createElement("h2");
    heading.textContent = "Transform";
    dom.advancedInspector.append(heading);
    field(dom.advancedInspector, "Name", layer.name ?? "", (next) => next === (layer.name ?? "")
        ? null
        : { op: "rename", id: layer.id, name: next || undefined });
    field(dom.advancedInspector, "X", String(t.x), (next) => moveTo(layer, Number(next), t.y), "number");
    field(dom.advancedInspector, "Y", String(t.y), (next) => moveTo(layer, t.x, Number(next)), "number");
    field(dom.advancedInspector, "Width", String(t.width), (next) => resizeTo(layer, Number(next), t.height), "number");
    field(dom.advancedInspector, "Height", String(t.height), (next) => resizeTo(layer, t.width, Number(next)), "number");
    field(dom.advancedInspector, "Rotation", String(t.rotation ?? 0), (next) => ({ op: "rotate", id: layer.id, degrees: Number(next) }), "number");
    field(dom.advancedInspector, "Opacity", String(layer.opacity ?? 1), (next) => ({ op: "update", id: layer.id, opacity: Number(next) }), "number");
    if (layer.type === "text") {
        const textHeading = document.createElement("h2");
        textHeading.textContent = "Typography";
        dom.advancedInspector.append(textHeading);
        field(dom.advancedInspector, "Text", layer.text, (next) => ({ op: "update", id: layer.id, text: next }));
        field(dom.advancedInspector, "Font", layer.fontFamily, (next) => ({ op: "update", id: layer.id, fontFamily: next }));
        field(dom.advancedInspector, "Font size", String(layer.fontSize), (next) => ({ op: "update", id: layer.id, fontSize: Number(next) }), "number");
        field(dom.advancedInspector, "Colour", layer.color ?? "#000000", (next) => ({ op: "update", id: layer.id, color: next }), "color");
    }
    // How it composites. The list comes from the schema's own enumeration, so
    // the picker cannot offer a mode the engine would refuse.
    const blend = document.createElement("label");
    blend.className = "field";
    blend.append(document.createTextNode("Blend mode"));
    const blendSelect = document.createElement("select");
    blendSelect.disabled = why !== null;
    const currentBlend = layer.blendMode ?? "normal";
    for (const mode of api.BLEND_MODES) {
        const option = document.createElement("option");
        option.value = mode;
        option.textContent = mode;
        blendSelect.append(option);
    }
    // A mode this build does not know — written by a newer one — is shown
    // rather than silently replaced by whatever happens to be first.
    if (!api.BLEND_MODES.includes(currentBlend)) {
        const option = document.createElement("option");
        option.value = currentBlend;
        option.textContent = `${currentBlend} (not rendered here)`;
        blendSelect.append(option);
    }
    blendSelect.value = currentBlend;
    blendSelect.addEventListener("change", () => {
        if (blendSelect.value === currentBlend)
            return;
        void send("blend mode", {
            op: "update",
            id: layer.id,
            blendMode: blendSelect.value,
        });
    });
    blend.append(blendSelect);
    dom.advancedInspector.append(blend);
    drawEffects(dom.advancedInspector, layer, why !== null);
    drawPresets(dom.advancedInspector, layer, why !== null);
    drawSlots(dom.advancedInspector, layer);
    const visible = document.createElement("label");
    visible.className = "field checkbox";
    const box = document.createElement("input");
    box.type = "checkbox";
    const wasVisible = layer.visible ?? true;
    box.checked = wasVisible;
    box.disabled = why !== null;
    box.addEventListener("change", () => {
        if (box.checked === wasVisible)
            return;
        void send("show/hide", { op: "setVisible", id: layer.id, visible: box.checked });
    });
    visible.append(box, document.createTextNode("visible"));
    dom.advancedInspector.append(visible);
    const locked = document.createElement("label");
    locked.className = "field checkbox";
    const lockBox = document.createElement("input");
    lockBox.type = "checkbox";
    lockBox.checked = layer.locked ?? false;
    lockBox.disabled = Boolean(layer.protected || layer.readOnly);
    lockBox.addEventListener("change", () => {
        if (lockBox.checked === (layer.locked ?? false))
            return;
        void send(lockBox.checked ? "lock layer" : "unlock layer", {
            op: "setLocked",
            id: layer.id,
            locked: lockBox.checked,
        });
    });
    locked.append(lockBox, document.createTextNode("locked"));
    dom.advancedInspector.append(locked);
}
function drawInspector() {
    dom.inspector.replaceChildren();
    dom.advancedInspector.replaceChildren();
    const layers = selectedLayers();
    const layer = layers.length === 1 ? layers[0] ?? null : null;
    dom.deleteLayer.disabled = layers.length === 0 || layers.some((one) => !api.isEditable(one));
    dom.groupLayers.disabled = layers.length < 2 || layers.some((one) => !api.isEditable(one));
    renderPositionFields(layers);
    if (layers.length === 0) {
        const hint = document.createElement("div");
        hint.className = "inspector-empty";
        hint.innerHTML = '<i class="ph ph-cursor-click" aria-hidden="true"></i><span>Select a layer to edit it</span>';
        dom.inspector.append(hint);
        const copy = document.createElement("p");
        copy.className = "empty-panel-copy";
        copy.textContent = "Select a layer to edit its properties. Text content is edited directly on the canvas; layer names live only in Layers.";
        dom.advancedInspector.append(copy);
        return;
    }
    const guarded = layers.some((one) => !api.isEditable(one));
    const action = (label, icon, run, disabled = guarded, className = "toolbar-action") => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.disabled = disabled;
        button.title = label;
        button.innerHTML = `<i class="ph ${icon}" aria-hidden="true"></i><span>${label}</span>`;
        button.addEventListener("click", run);
        return button;
    };
    if (layer?.type === "text") {
        dom.inspector.append(action("Edit text", "ph-pencil-simple", () => beginInlineTextEdit(layer), guarded, "toolbar-action edit-text-button"));
        const font = document.createElement("label");
        font.className = "toolbar-field toolbar-font";
        font.innerHTML = '<span class="sr-only">Font family</span>';
        const fontInput = document.createElement("input");
        fontInput.value = layer.fontFamily;
        fontInput.disabled = guarded;
        fontInput.setAttribute("aria-label", "Font family");
        fontInput.addEventListener("change", () => {
            if (fontInput.value !== layer.fontFamily) {
                void send("change font", { op: "update", id: layer.id, fontFamily: fontInput.value });
            }
        });
        font.append(fontInput);
        dom.inspector.append(font);
        const size = document.createElement("label");
        size.className = "toolbar-field toolbar-number";
        const sizeInput = document.createElement("input");
        sizeInput.type = "number";
        sizeInput.min = "1";
        sizeInput.value = String(layer.fontSize);
        sizeInput.disabled = guarded;
        sizeInput.setAttribute("aria-label", "Font size");
        sizeInput.addEventListener("change", () => void send("change font size", {
            op: "update",
            id: layer.id,
            fontSize: Number(sizeInput.value),
        }));
        size.append(sizeInput);
        dom.inspector.append(size);
        const colour = document.createElement("input");
        colour.type = "color";
        colour.className = "toolbar-colour";
        colour.value = layer.color ?? "#000000";
        colour.disabled = guarded;
        colour.setAttribute("aria-label", "Text colour");
        colour.addEventListener("change", () => void send("change colour", { op: "update", id: layer.id, color: colour.value }));
        dom.inspector.append(colour);
        for (const [value, icon] of [
            ["left", "ph-text-align-left"],
            ["center", "ph-text-align-center"],
            ["right", "ph-text-align-right"],
        ]) {
            const button = action(`Align ${value}`, icon, () => {
                void send(`align text ${value}`, { op: "update", id: layer.id, align: value });
            }, guarded, "icon-button toolbar-icon");
            button.title = `Align text ${value}`;
            button.querySelector("span")?.classList.add("sr-only");
            button.classList.toggle("selected", (layer.align ?? "left") === value);
            dom.inspector.append(button);
        }
        const divider = document.createElement("span");
        divider.className = "toolbar-divider";
        dom.inspector.append(divider);
    }
    else {
        const selectionLabel = document.createElement("span");
        selectionLabel.className = "selection-label";
        selectionLabel.textContent = layers.length === 1 ? (layer?.type ?? "Layer") : `${layers.length} layers`;
        dom.inspector.append(selectionLabel);
    }
    const ids = layers.map((one) => one.id);
    dom.inspector.append(action("Centre horizontally", "ph-align-center-horizontal", () => {
        void send("centre horizontally", { op: "centerOnCanvas", ids, axis: "horizontal" });
    }), action("Centre vertically", "ph-align-center-vertical", () => {
        void send("centre vertically", { op: "centerOnCanvas", ids, axis: "vertical" });
    }), action("Position", "ph-bounding-box", () => togglePositionPopover(), false, "toolbar-action position-button"), action("Group", "ph-stack", () => {
        if (ids.length > 1)
            void send("group", { op: "group", ids });
    }, guarded || ids.length < 2), action("Duplicate", "ph-copy", () => {
        void sendBatch("duplicate", ids.map((id) => ({ op: "duplicate", id })));
    }));
    if (!layer) {
        const note = document.createElement("p");
        note.className = "empty-panel-copy";
        note.textContent = `${layers.length} layers selected. Use Position for alignment, distribution, ordering, and exact transforms.`;
        dom.advancedInspector.append(note);
        return;
    }
    const why = api.whyNotEditable(layer);
    if (why) {
        const note = document.createElement("p");
        note.className = "guarded-note";
        note.textContent = why;
        dom.advancedInspector.append(note);
    }
    const field = (label, value, apply, type = "number") => {
        const wrapper = document.createElement("label");
        wrapper.className = "field";
        wrapper.append(document.createTextNode(label));
        const input = document.createElement("input");
        input.type = type;
        input.value = value;
        input.disabled = why !== null;
        input.addEventListener("change", () => {
            if (input.value === value)
                return;
            const operation = apply(input.value);
            if (operation)
                void send(`change ${label}`, operation);
        });
        wrapper.append(input);
        dom.advancedInspector.append(wrapper);
    };
    const transformHeading = document.createElement("h2");
    transformHeading.textContent = "Transform";
    dom.advancedInspector.append(transformHeading);
    const grid = document.createElement("div");
    grid.className = "property-grid";
    const previousTarget = dom.advancedInspector;
    const appendFieldToGrid = (label, value, apply) => {
        const wrapper = document.createElement("label");
        wrapper.className = "field";
        wrapper.append(document.createTextNode(label));
        const input = document.createElement("input");
        input.type = "number";
        input.value = value;
        input.disabled = why !== null;
        input.addEventListener("change", () => {
            const operation = apply(input.value);
            if (operation)
                void send(`change ${label}`, operation);
        });
        wrapper.append(input);
        grid.append(wrapper);
    };
    const t = layer.transform;
    appendFieldToGrid("X", String(t.x), (next) => moveTo(layer, Number(next), t.y));
    appendFieldToGrid("Y", String(t.y), (next) => moveTo(layer, t.x, Number(next)));
    appendFieldToGrid("Width", String(t.width), (next) => resizeTo(layer, Number(next), t.height));
    appendFieldToGrid("Height", String(t.height), (next) => resizeTo(layer, t.width, Number(next)));
    appendFieldToGrid("Rotation", String(t.rotation ?? 0), (next) => ({ op: "rotate", id: layer.id, degrees: Number(next) }));
    appendFieldToGrid("Opacity", String(layer.opacity ?? 1), (next) => ({ op: "update", id: layer.id, opacity: Number(next) }));
    previousTarget.append(grid);
    if (layer.type === "text") {
        const heading = document.createElement("h2");
        heading.textContent = "Typography";
        dom.advancedInspector.append(heading);
        field("Font", layer.fontFamily, (next) => ({ op: "update", id: layer.id, fontFamily: next }), "text");
        field("Font size", String(layer.fontSize), (next) => ({ op: "update", id: layer.id, fontSize: Number(next) }));
        field("Line height", String(layer.lineHeight ?? 1.2), (next) => ({ op: "update", id: layer.id, lineHeight: Number(next) }));
        field("Colour", layer.color ?? "#000000", (next) => ({ op: "update", id: layer.id, color: next }), "color");
    }
    const appearanceHeading = document.createElement("h2");
    appearanceHeading.textContent = "Appearance";
    dom.advancedInspector.append(appearanceHeading);
    const blend = document.createElement("label");
    blend.className = "field";
    blend.append(document.createTextNode("Blend mode"));
    const blendSelect = document.createElement("select");
    blendSelect.disabled = why !== null;
    for (const mode of api.BLEND_MODES) {
        const option = document.createElement("option");
        option.value = mode;
        option.textContent = mode;
        blendSelect.append(option);
    }
    blendSelect.value = layer.blendMode ?? "normal";
    blendSelect.addEventListener("change", () => void send("change blend mode", { op: "update", id: layer.id, blendMode: blendSelect.value }));
    blend.append(blendSelect);
    dom.advancedInspector.append(blend);
    drawEffects(dom.advancedInspector, layer, why !== null);
    drawPresets(dom.advancedInspector, layer, why !== null);
    drawSlots(dom.advancedInspector, layer);
    const flags = document.createElement("div");
    flags.className = "property-flags";
    const visible = document.createElement("label");
    visible.className = "field checkbox";
    const visibleInput = document.createElement("input");
    visibleInput.type = "checkbox";
    visibleInput.checked = layer.visible ?? true;
    visibleInput.disabled = why !== null;
    visibleInput.addEventListener("change", () => void send("show/hide", { op: "setVisible", id: layer.id, visible: visibleInput.checked }));
    visible.append(visibleInput, document.createTextNode("Visible"));
    const locked = document.createElement("label");
    locked.className = "field checkbox";
    const lockedInput = document.createElement("input");
    lockedInput.type = "checkbox";
    lockedInput.checked = layer.locked ?? false;
    lockedInput.disabled = Boolean(layer.protected || layer.readOnly);
    lockedInput.addEventListener("change", () => void send(lockedInput.checked ? "lock layer" : "unlock layer", { op: "setLocked", id: layer.id, locked: lockedInput.checked }));
    locked.append(lockedInput, document.createTextNode("Locked"));
    flags.append(visible, locked);
    dom.advancedInspector.append(flags);
}
/**
 * The effect stack, as rows with one number each.
 *
 * Effects are never baked: what is edited here is the list of numbers in the
 * document, and the pixels are derived from it every render. So removing an
 * effect is as complete as never having added it, and undo restores the whole
 * stack like any other property.
 */
function drawEffects(target, layer, guarded) {
    const effects = (layer.effects ?? []);
    const heading = document.createElement("h2");
    heading.textContent = "Effects";
    target.append(heading);
    /** Sends the whole stack, because order is part of what it means. */
    const setStack = (next) => {
        void send("effects", { op: "update", id: layer.id, effects: next });
    };
    for (const [index, effect] of effects.entries()) {
        const row = document.createElement("div");
        row.className = "effect-row";
        const label = document.createElement("span");
        label.className = "effect-name";
        label.textContent = effect.type;
        row.append(label);
        // Every effect this build renders has exactly one number worth a slider;
        // grain's seed is deliberately not one of them, because changing it would
        // change the picture for no reason a person asked for.
        const parameter = api.effectParameter(effect);
        if (parameter) {
            const input = document.createElement("input");
            input.type = "number";
            input.step = "0.05";
            input.value = String(parameter.value);
            input.disabled = guarded;
            input.addEventListener("change", () => {
                const value = Number(input.value);
                if (!Number.isFinite(value) || value === parameter.value)
                    return;
                const next = effects.map((one, at) => at === index ? { ...one, [parameter.name]: value } : one);
                setStack(next);
            });
            row.append(input);
        }
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "small";
        remove.textContent = "Remove";
        remove.disabled = guarded;
        remove.addEventListener("click", () => setStack(effects.filter((_, at) => at !== index)));
        row.append(remove);
        target.append(row);
    }
    const add = document.createElement("div");
    add.className = "buttons";
    const chooser = document.createElement("select");
    chooser.disabled = guarded;
    for (const type of api.EFFECT_TYPES) {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        chooser.append(option);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Add effect";
    button.disabled = guarded;
    button.addEventListener("click", () => {
        setStack([...effects, api.newEffect(chooser.value)]);
    });
    add.append(chooser, button);
    target.append(add);
}
/**
 * The document's named styles: apply one, or save this layer's as a new one.
 *
 * Applying is one operation the engine resolves — the page never assembles the
 * properties itself. That is what makes a preset applied here identical to the
 * same preset applied from the command line or by an agent.
 */
function drawPresets(target, layer, guarded) {
    const heading = document.createElement("h2");
    heading.textContent = "Presets";
    target.append(heading);
    if (state.presets.length === 0) {
        const hint = document.createElement("p");
        hint.className = "hint";
        hint.textContent = "No presets in this document yet.";
        target.append(hint);
    }
    for (const preset of state.presets) {
        const row = document.createElement("div");
        row.className = "effect-row";
        const label = document.createElement("span");
        label.className = "effect-name";
        label.textContent = preset.name;
        if (preset.description)
            label.title = preset.description;
        row.append(label);
        const apply = document.createElement("button");
        apply.type = "button";
        apply.className = "small";
        apply.textContent = "Apply";
        apply.disabled = guarded;
        apply.addEventListener("click", () => void send(`apply ${preset.name}`, {
            op: "applyPreset",
            id: layer.id,
            preset: preset.name,
        }));
        row.append(apply);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "small";
        remove.textContent = "Delete";
        remove.addEventListener("click", () => void send(`delete ${preset.name}`, {
            op: "deletePreset",
            name: preset.name,
        }));
        row.append(remove);
        target.append(row);
    }
    const save = document.createElement("div");
    save.className = "buttons";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Save style as preset";
    button.addEventListener("click", () => {
        requestName("Save style preset", "Preset name", "Save preset", (name) => {
            void send(`define ${name}`, {
                op: "definePreset",
                preset: { name, properties: api.styleOf(layer) },
            });
        });
    });
    save.append(button);
    target.append(save);
}
/**
 * The document's named openings, and a way to offer the selected layer.
 *
 * Authoring a template is an ordinary operation here as everywhere else, so it
 * is journalled and undoable — and a slot aimed at protected chrome is refused
 * by the engine, in its own words, rather than by this form knowing the rule.
 */
function drawSlots(target, layer) {
    const heading = document.createElement("h2");
    heading.textContent = "Slots";
    target.append(heading);
    for (const slot of state.slots) {
        const row = document.createElement("div");
        row.className = "effect-row";
        const label = document.createElement("span");
        label.className = "effect-name";
        label.textContent = `${slot.name}${slot.required ? " *" : ""}`;
        label.title = slot.description ?? `${slot.kind ?? "text"} → ${slot.layer}`;
        if (slot.layer === layer.id)
            label.classList.add("slot-on-this-layer");
        row.append(label);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "small";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => void send(`remove slot ${slot.name}`, {
            op: "removeSlot",
            name: slot.name,
        }));
        row.append(remove);
        target.append(row);
    }
    const buttons = document.createElement("div");
    buttons.className = "buttons";
    const kind = document.createElement("select");
    for (const option of ["text", "image", "color"]) {
        const element = document.createElement("option");
        element.value = option;
        element.textContent = option;
        kind.append(element);
    }
    // A text layer cannot be an image slot and vice versa; the engine refuses
    // either way, but offering the wrong one is a form that invites a refusal.
    kind.value = layer.type === "image" ? "image" : "text";
    const offer = document.createElement("button");
    offer.type = "button";
    offer.textContent = "Offer as slot";
    offer.addEventListener("click", () => {
        requestName("Create template slot", "Slot name", "Create slot", (name) => {
            void send(`offer ${name}`, {
                op: "defineSlot",
                slot: { name, layer: layer.id, kind: kind.value },
            });
        });
    });
    buttons.append(kind, offer);
    target.append(buttons);
}
async function drawHistory() {
    if (!state.project)
        return;
    const history = await api.getHistory(state.project);
    dom.history.replaceChildren();
    for (const entry of history.entries.slice().reverse()) {
        const item = document.createElement("li");
        item.textContent = `${entry.position}. ${entry.kind} — ${entry.actor.kind}${entry.actor.detail ? ` (${entry.actor.detail})` : ""}`;
        if (entry.position > history.position)
            item.classList.add("undone");
        dom.history.append(item);
    }
    dom.undo.disabled = history.position === 0;
    dom.redo.disabled = history.position >= history.head;
}
// --- editing -----------------------------------------------------------------
function moveTo(layer, x, y) {
    // The engine moves by a delta; the inspector edits an absolute position.
    const dx = x - layer.transform.x;
    const dy = y - layer.transform.y;
    // Setting a value to the one it already has is not an edit. Sending it
    // anyway would journal an operation that moved nothing — and, because every
    // send refreshes the inspector, would loop.
    if (dx === 0 && dy === 0)
        return null;
    return { op: "move", id: layer.id, dx, dy };
}
function resizeTo(layer, width, height) {
    if (width === layer.transform.width && height === layer.transform.height)
        return null;
    return { op: "resize", id: layer.id, width, height };
}
async function send(what, operation) {
    await guard(what, async () => {
        if (!state.project || !state.document)
            return;
        const result = await api.applyOperation(state.project, operation, api.versionOf(state.document));
        say(`${what}: done (version ${result.version})`);
        if (result.created?.length)
            state.selection = result.created;
        await refresh();
    });
}
/**
 * Runs the smallest available operation sequence for one interface action.
 * The stable operation API snaps one axis at a time, so canvas corners need
 * two journalled operations. They still pass through the same operation layer
 * and use each returned version as the next optimistic-lock token.
 */
async function sendSequence(what, operations) {
    await sendBatch(what, operations);
}
async function sendBatch(what, operations) {
    await guard(what, async () => {
        if (!state.project || !state.document || operations.length === 0)
            return;
        const result = await api.applyOperationBatch(state.project, what, operations, api.versionOf(state.document));
        if (result.created?.length)
            state.selection = result.created;
        say(`${what}: done (version ${result.version})`);
        await refresh();
    });
}
function beginDrag(event, selected, bounds, mode, handle) {
    event.preventDefault();
    if (!state.document || dom.canvas.getBoundingClientRect().width === 0)
        return;
    state.drag = {
        ids: selected.map(({ layer }) => layer.id),
        mode,
        handle,
        startX: event.clientX,
        startY: event.clientY,
        bounds,
        origins: selected.map(({ layer, x, y, width, height }) => ({
            id: layer.id,
            x: layer.transform.x,
            y: layer.transform.y,
            absoluteX: x,
            absoluteY: y,
            width,
            height,
            rotation: layer.transform.rotation ?? 0,
        })),
        preserveSelectionScale: mode === "resize" && selected.length === 1 && selected[0]?.layer.type === "text",
    };
    mountDragPreview(state.drag);
    const cache = dragPreviewCache;
    if (!state.drag.previewActive && cache) {
        void cache.pending.then(() => {
            if (state.drag && dragPreviewCache === cache)
                mountDragPreview(state.drag);
        });
    }
    event.target.setPointerCapture?.(event.pointerId);
}
function dragPreviewKey(ids) {
    if (!state.project || !state.document)
        return null;
    return `${state.project}:${api.versionOf(state.document)}:${[...ids].sort().join(",")}`;
}
function clearDragPreviewCache() {
    unmountDragPreview();
    const cache = dragPreviewCache;
    dragPreviewCache = null;
    if (cache?.baseUrl)
        URL.revokeObjectURL(cache.baseUrl);
    if (cache?.selectionUrl)
        URL.revokeObjectURL(cache.selectionUrl);
}
async function prepareDragPreview(ids) {
    const key = dragPreviewKey(ids);
    if (!key || !state.project || !state.document)
        return;
    if (dragPreviewCache?.key === key)
        return dragPreviewCache.pending;
    clearDragPreviewCache();
    const project = state.project;
    const version = api.versionOf(state.document);
    const scale = interactivePreviewScale();
    const cache = {
        key,
        pending: Promise.resolve(),
    };
    dragPreviewCache = cache;
    cache.pending = Promise.all([
        api.imageObjectUrl(api.pngUrl(project, version, scale, { exclude: ids })),
        api.imageObjectUrl(api.pngUrl(project, version, scale, { only: ids })),
    ]).then(([baseUrl, selectionUrl]) => {
        if (dragPreviewCache !== cache) {
            URL.revokeObjectURL(baseUrl);
            URL.revokeObjectURL(selectionUrl);
            return;
        }
        cache.baseUrl = baseUrl;
        cache.selectionUrl = selectionUrl;
    }).catch(() => {
        // Moving the handles still works if an auxiliary preview is refused. The
        // normal committed render remains the source of truth either way.
        if (dragPreviewCache === cache)
            dragPreviewCache = null;
    });
    return cache.pending;
}
function mountDragPreview(drag) {
    const cache = dragPreviewCache;
    if (drag.previewActive ||
        cache?.key !== dragPreviewKey(drag.ids) ||
        !cache.baseUrl ||
        !cache.selectionUrl)
        return;
    const base = document.createElement("img");
    base.id = "drag-preview-base";
    base.className = "drag-preview-image";
    base.alt = "";
    base.src = cache.baseUrl;
    const selection = document.createElement("img");
    selection.id = "drag-preview-selection";
    selection.className = "drag-preview-image drag-preview-selection";
    selection.alt = "";
    selection.src = cache.selectionUrl;
    dom.overlay.before(base, selection);
    dom.canvasImage.classList.add("drag-preview-hidden");
    drag.previewActive = true;
    updateDragPreview(drag, drag.lastDelta?.x ?? 0, drag.lastDelta?.y ?? 0);
}
function unmountDragPreview() {
    document.getElementById("drag-preview-base")?.remove();
    document.getElementById("drag-preview-selection")?.remove();
    dom.canvasImage.classList.remove("drag-preview-hidden");
}
function dragResizedBounds(drag, dx, dy) {
    const origin = drag.origins.length === 1 ? drag.origins[0] : null;
    return origin
        ? resizedRotatedBounds(drag.bounds, origin.rotation, drag.handle ?? "se", dx, dy)
        : resizedBounds(drag.bounds, drag.handle ?? "se", dx, dy);
}
function updateDragPreview(drag, dx, dy) {
    if (!state.document || !drag.previewActive)
        return;
    const selection = document.getElementById("drag-preview-selection");
    if (!selection)
        return;
    const canvas = state.document.canvas;
    selection.style.transformOrigin = "0 0";
    if (drag.mode === "move") {
        selection.style.transform =
            `translate(${(dx / canvas.width) * 100}%, ${(dy / canvas.height) * 100}%)`;
    }
    else if (drag.mode === "resize") {
        const next = dragResizedBounds(drag, dx, dy);
        if (drag.preserveSelectionScale) {
            // A text resize changes its wrapping rectangle, not its glyph geometry.
            // Keep the cached Rust-rendered text at 1:1 scale while the handles move;
            // pointer-up requests the exact newly wrapped renderer image.
            const centreDx = next.x + next.width / 2 - (drag.bounds.x + drag.bounds.width / 2);
            const centreDy = next.y + next.height / 2 - (drag.bounds.y + drag.bounds.height / 2);
            selection.style.transform =
                `translate(${(centreDx / canvas.width) * 100}%, ${(centreDy / canvas.height) * 100}%)`;
            return;
        }
        const scaleX = next.width / Math.max(1, drag.bounds.width);
        const scaleY = next.height / Math.max(1, drag.bounds.height);
        if (drag.origins.length === 1) {
            const rotation = drag.origins[0]?.rotation ?? 0;
            const centreDx = next.x + next.width / 2 - (drag.bounds.x + drag.bounds.width / 2);
            const centreDy = next.y + next.height / 2 - (drag.bounds.y + drag.bounds.height / 2);
            selection.style.transformOrigin =
                `${((drag.bounds.x + drag.bounds.width / 2) / canvas.width) * 100}% ` +
                    `${((drag.bounds.y + drag.bounds.height / 2) / canvas.height) * 100}%`;
            selection.style.transform =
                `translate(${(centreDx / canvas.width) * 100}%, ${(centreDy / canvas.height) * 100}%) ` +
                    `rotate(${rotation}deg) scale(${scaleX}, ${scaleY}) rotate(${-rotation}deg)`;
            return;
        }
        const translateX = next.x - drag.bounds.x * scaleX;
        const translateY = next.y - drag.bounds.y * scaleY;
        selection.style.transform =
            `translate(${(translateX / canvas.width) * 100}%, ${(translateY / canvas.height) * 100}%) ` +
                `scale(${scaleX}, ${scaleY})`;
    }
    else {
        const rect = dom.canvas.getBoundingClientRect();
        const centreX = rect.left + ((drag.bounds.x + drag.bounds.width / 2) / canvas.width) * rect.width;
        const centreY = rect.top + ((drag.bounds.y + drag.bounds.height / 2) / canvas.height) * rect.height;
        const start = Math.atan2(drag.startY - centreY, drag.startX - centreX);
        const current = Math.atan2(drag.startY + dy / dragScale() - centreY, drag.startX + dx / dragScale() - centreX);
        selection.style.transformOrigin =
            `${((drag.bounds.x + drag.bounds.width / 2) / canvas.width) * 100}% ` +
                `${((drag.bounds.y + drag.bounds.height / 2) / canvas.height) * 100}%`;
        selection.style.transform = `rotate(${((current - start) * 180) / Math.PI}deg)`;
    }
}
function dragScale() {
    const rect = dom.canvas.getBoundingClientRect();
    if (!state.document || rect.width === 0)
        return 1;
    // Screen pixels to document units: the canvas is scaled to fit.
    return state.document.canvas.width / rect.width;
}
window.addEventListener("pointermove", (event) => {
    const drag = state.drag;
    if (!drag || !state.document)
        return;
    const scale = dragScale();
    let dx = (event.clientX - drag.startX) * scale;
    let dy = (event.clientY - drag.startY) * scale;
    dom.overlay.querySelectorAll(".smart-guide").forEach((guide) => guide.remove());
    if (drag.mode === "move") {
        ({ dx, dy } = snapMove(dx, dy, drag.bounds, drag.ids, scale));
    }
    drag.lastDelta = { x: dx, y: dy };
    updateDragPreview(drag, dx, dy);
    const box = dom.overlay.querySelector(".handle-box");
    if (!box)
        return;
    const { width, height } = state.document.canvas;
    if (drag.mode === "move") {
        box.style.left = `${((drag.bounds.x + dx) / width) * 100}%`;
        box.style.top = `${((drag.bounds.y + dy) / height) * 100}%`;
    }
    else if (drag.mode === "resize") {
        const next = dragResizedBounds(drag, dx, dy);
        box.style.left = `${(next.x / width) * 100}%`;
        box.style.top = `${(next.y / height) * 100}%`;
        box.style.width = `${(next.width / width) * 100}%`;
        box.style.height = `${(next.height / height) * 100}%`;
    }
    else {
        const canvasRect = dom.canvas.getBoundingClientRect();
        const centreX = canvasRect.left + ((drag.bounds.x + drag.bounds.width / 2) / state.document.canvas.width) * canvasRect.width;
        const centreY = canvasRect.top + ((drag.bounds.y + drag.bounds.height / 2) / state.document.canvas.height) * canvasRect.height;
        const start = Math.atan2(drag.startY - centreY, drag.startX - centreX);
        const current = Math.atan2(event.clientY - centreY, event.clientX - centreX);
        const baseRotation = drag.origins.length === 1 ? (drag.origins[0]?.rotation ?? 0) : 0;
        box.style.transform = `rotate(${baseRotation + ((current - start) * 180) / Math.PI}deg)`;
    }
});
window.addEventListener("pointerup", async (event) => {
    const drag = state.drag;
    state.drag = null;
    if (!drag)
        return;
    const scale = dragScale();
    const dx = Math.round(drag.lastDelta?.x ?? (event.clientX - drag.startX) * scale);
    const dy = Math.round(drag.lastDelta?.y ?? (event.clientY - drag.startY) * scale);
    if (dx === 0 && dy === 0) {
        unmountDragPreview();
        return;
    }
    let saving;
    if (drag.mode === "move") {
        saving = sendBatch("move selection", drag.ids.map((id) => ({ op: "move", id, dx, dy })));
    }
    else if (drag.mode === "resize") {
        let next = dragResizedBounds(drag, dx, dy);
        const horizontalTextResize = drag.ids.length === 1 && (drag.handle === "e" || drag.handle === "w");
        if (horizontalTextResize && state.project && state.document) {
            const layer = api
                .flatten(api.layersOf(state.document))
                .find(({ layer }) => layer.id === drag.ids[0])?.layer;
            if (layer?.type === "text") {
                try {
                    const layout = await api.textLayout(state.project, layer.id, next.width);
                    const height = Math.max(1, Math.ceil(layout.height));
                    // Horizontal text resizing changes wrapping height around the box's
                    // local centre, rather than making a rotated box jump vertically.
                    next = {
                        ...next,
                        y: next.y + (next.height - height) / 2,
                        height,
                    };
                }
                catch {
                    // A read-only measurement failure must not swallow the resize. The
                    // renderer will still wrap to the new width; only auto-height falls
                    // back to the layer's existing value.
                }
            }
        }
        const operations = [];
        for (const origin of drag.origins) {
            const resized = drag.origins.length === 1
                ? next
                : resizeItemInSelection({
                    x: origin.absoluteX,
                    y: origin.absoluteY,
                    width: origin.width,
                    height: origin.height,
                }, drag.bounds, next);
            const moveX = Math.round(resized.x - origin.absoluteX);
            const moveY = Math.round(resized.y - origin.absoluteY);
            if (moveX !== 0 || moveY !== 0) {
                operations.push({ op: "move", id: origin.id, dx: moveX, dy: moveY });
            }
            operations.push({
                op: "resize",
                id: origin.id,
                width: Math.max(1, Math.round(resized.width)),
                height: Math.max(1, Math.round(resized.height)),
            });
        }
        saving = sendBatch("resize selection", operations);
    }
    else {
        const canvasRect = dom.canvas.getBoundingClientRect();
        const centreX = canvasRect.left + ((drag.bounds.x + drag.bounds.width / 2) / state.document.canvas.width) * canvasRect.width;
        const centreY = canvasRect.top + ((drag.bounds.y + drag.bounds.height / 2) / state.document.canvas.height) * canvasRect.height;
        const start = Math.atan2(drag.startY - centreY, drag.startX - centreX);
        const current = Math.atan2(event.clientY - centreY, event.clientX - centreX);
        const delta = ((current - start) * 180) / Math.PI;
        saving = sendBatch("rotate selection", drag.origins.map((origin) => ({
            op: "rotate",
            id: origin.id,
            degrees: Math.round((origin.rotation + delta) * 10) / 10,
        })));
    }
    void saving.finally(() => unmountDragPreview());
});
function snapMove(dx, dy, bounds, ids, screenScale) {
    if (!state.document)
        return { dx, dy };
    const threshold = 6 * screenScale;
    // A single selection's handle DOM is its local box plus CSS rotation. Use
    // its actual canvas extents for snapping while leaving that DOM geometry
    // untouched. Multi-selection bounds already contain rotated extents.
    let snappingBounds = bounds;
    if (ids.length === 1) {
        const one = api.flatten(api.layersOf(state.document)).find(({ layer }) => layer.id === ids[0]);
        const offset = one ? ancestorOffset(api.flatten(api.layersOf(state.document)), one.parent) : null;
        if (one && offset) {
            snappingBounds = rotatedRectBounds({
                x: one.layer.transform.x + offset.x,
                y: one.layer.transform.y + offset.y,
                width: one.layer.transform.width,
                height: one.layer.transform.height,
                rotation: one.layer.transform.rotation ?? 0,
            });
        }
    }
    const movingX = [
        snappingBounds.x + dx,
        snappingBounds.x + snappingBounds.width / 2 + dx,
        snappingBounds.x + snappingBounds.width + dx,
    ];
    const movingY = [
        snappingBounds.y + dy,
        snappingBounds.y + snappingBounds.height / 2 + dy,
        snappingBounds.y + snappingBounds.height + dy,
    ];
    const targetsX = [0, state.document.canvas.width / 2, state.document.canvas.width];
    const targetsY = [0, state.document.canvas.height / 2, state.document.canvas.height];
    const otherBounds = [];
    const flat = api.flatten(api.layersOf(state.document));
    for (const { layer, parent } of flat) {
        if (ids.includes(layer.id))
            continue;
        const offset = ancestorOffset(flat, parent);
        if (!offset)
            continue;
        const visual = rotatedRectBounds({
            x: layer.transform.x + offset.x,
            y: layer.transform.y + offset.y,
            width: layer.transform.width,
            height: layer.transform.height,
            rotation: layer.transform.rotation ?? 0,
        });
        otherBounds.push({
            left: visual.x,
            right: visual.x + visual.width,
            top: visual.y,
            bottom: visual.y + visual.height,
        });
        targetsX.push(visual.x, visual.x + visual.width / 2, visual.x + visual.width);
        targetsY.push(visual.y, visual.y + visual.height / 2, visual.y + visual.height);
    }
    const snapAxis = (moving, targets) => {
        let best = null;
        for (const movingValue of moving)
            for (const target of targets) {
                const delta = target - movingValue;
                if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta)))
                    best = { delta, target };
            }
        return best;
    };
    const horizontal = snapAxis(movingX, targetsX);
    const vertical = snapAxis(movingY, targetsY);
    if (horizontal) {
        dx += horizontal.delta;
        addSmartGuide("vertical", horizontal.target);
    }
    if (vertical) {
        dy += vertical.delta;
        addSmartGuide("horizontal", vertical.target);
    }
    // Equal-spacing snap: when the moving bounds sit between two neighbours,
    // offer the point that gives both gaps the same size. The same normal move
    // operation commits it, so the renderer and history still own the result.
    const movedLeft = snappingBounds.x + dx;
    const movedRight = movedLeft + snappingBounds.width;
    const left = otherBounds
        .filter((one) => one.right <= movedLeft + threshold)
        .sort((a, b) => b.right - a.right)[0];
    const right = otherBounds
        .filter((one) => one.left >= movedRight - threshold)
        .sort((a, b) => a.left - b.left)[0];
    if (left && right) {
        const equalLeft = left.right + (right.left - left.right - snappingBounds.width) / 2;
        const correction = equalLeft - movedLeft;
        if (Math.abs(correction) <= threshold) {
            dx += correction;
            addSmartGuide("vertical", left.right);
            addSmartGuide("vertical", right.left);
        }
    }
    const movedTop = snappingBounds.y + dy;
    const movedBottom = movedTop + snappingBounds.height;
    const above = otherBounds
        .filter((one) => one.bottom <= movedTop + threshold)
        .sort((a, b) => b.bottom - a.bottom)[0];
    const below = otherBounds
        .filter((one) => one.top >= movedBottom - threshold)
        .sort((a, b) => a.top - b.top)[0];
    if (above && below) {
        const equalTop = above.bottom + (below.top - above.bottom - snappingBounds.height) / 2;
        const correction = equalTop - movedTop;
        if (Math.abs(correction) <= threshold) {
            dy += correction;
            addSmartGuide("horizontal", above.bottom);
            addSmartGuide("horizontal", below.top);
        }
    }
    return { dx, dy };
}
function addSmartGuide(axis, position) {
    if (!state.document)
        return;
    const guide = document.createElement("div");
    guide.className = `smart-guide ${axis}`;
    if (axis === "vertical")
        guide.style.left = `${(position / state.document.canvas.width) * 100}%`;
    else
        guide.style.top = `${(position / state.document.canvas.height) * 100}%`;
    dom.overlay.append(guide);
}
function selectionGeometry() {
    if (!state.document)
        return [];
    const flat = api.flatten(api.layersOf(state.document));
    return flat.flatMap(({ layer, parent }) => {
        if (!state.selection.includes(layer.id))
            return [];
        const offset = ancestorOffset(flat, parent);
        return offset
            ? [{
                    layer,
                    x: layer.transform.x + offset.x,
                    y: layer.transform.y + offset.y,
                    width: layer.transform.width,
                    height: layer.transform.height,
                }]
            : [];
    });
}
function collectiveBounds(geometry = selectionGeometry()) {
    if (geometry.length === 0)
        return null;
    if (geometry.length === 1) {
        const one = geometry[0];
        return { x: one.x, y: one.y, width: one.width, height: one.height };
    }
    return selectionBounds(geometry.map((one) => ({
        x: one.x,
        y: one.y,
        width: one.width,
        height: one.height,
        rotation: one.layer.transform.rotation ?? 0,
    })));
}
/** Visible bounds for canvas alignment, including a single layer's rotation. */
function visualCollectiveBounds(geometry = selectionGeometry()) {
    if (geometry.length === 0)
        return null;
    return selectionBounds(geometry.map((one) => ({
        x: one.x,
        y: one.y,
        width: one.width,
        height: one.height,
        rotation: one.layer.transform.rotation ?? 0,
    })));
}
function applyZoom() {
    if (!state.document)
        return;
    const availableWidth = Math.max(240, dom.stageViewport.clientWidth - 96);
    const availableHeight = Math.max(180, dom.stageViewport.clientHeight - 96);
    const fit = Math.min(availableWidth / state.document.canvas.width, availableHeight / state.document.canvas.height, 1);
    const scale = state.zoom ?? fit;
    dom.canvas.style.width = `${Math.max(1, Math.round(state.document.canvas.width * scale))}px`;
    dom.canvas.style.height = `${Math.max(1, Math.round(state.document.canvas.height * scale))}px`;
    dom.zoomValue.textContent = state.zoom === null ? "Fit" : `${Math.round(scale * 100)}%`;
    dom.zoomValue.title = state.zoom === null ? `Fit (${Math.round(fit * 100)}%)` : "Reset to Fit";
}
function setZoom(next) {
    state.zoom = next === null ? null : Math.min(4, Math.max(0.1, next));
    applyZoom();
}
function beginInlineTextEdit(layer) {
    if (!state.document || !api.isEditable(layer))
        return;
    dom.overlay.querySelector(".inline-text-editor")?.remove();
    const flat = api.flatten(api.layersOf(state.document));
    const found = flat.find(({ layer: one }) => one.id === layer.id);
    const offset = ancestorOffset(flat, found?.parent ?? null);
    if (!offset)
        return;
    const textarea = document.createElement("textarea");
    textarea.className = "inline-text-editor";
    textarea.value = layer.text;
    textarea.setAttribute("aria-label", "Edit text on canvas");
    textarea.style.left = `${((layer.transform.x + offset.x) / state.document.canvas.width) * 100}%`;
    textarea.style.top = `${((layer.transform.y + offset.y) / state.document.canvas.height) * 100}%`;
    textarea.style.width = `${(layer.transform.width / state.document.canvas.width) * 100}%`;
    textarea.style.height = `${(layer.transform.height / state.document.canvas.height) * 100}%`;
    textarea.style.transformOrigin = "center";
    textarea.style.transform = `rotate(${layer.transform.rotation ?? 0}deg)`;
    textarea.style.fontFamily = layer.fontFamily;
    textarea.style.fontSize = `${Math.max(12, layer.fontSize * (dom.canvas.getBoundingClientRect().width / state.document.canvas.width))}px`;
    textarea.style.lineHeight = String(layer.lineHeight ?? 1.2);
    textarea.style.textAlign = layer.align ?? "left";
    textarea.style.color = layer.color ?? "#000000";
    dom.overlay.append(textarea);
    state.editingText = { id: layer.id, original: layer.text };
    textarea.focus();
    textarea.select();
    let finished = false;
    const finish = (commit) => {
        if (finished)
            return;
        finished = true;
        const next = textarea.value;
        textarea.remove();
        state.editingText = null;
        if (commit && next !== layer.text) {
            void send("edit text", { op: "update", id: layer.id, text: next });
        }
        else {
            drawOverlay();
        }
    };
    textarea.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            finish(false);
        }
        else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            finish(true);
        }
    });
    textarea.addEventListener("blur", () => finish(true));
}
function renderPositionFields(layers) {
    dom.positionFields.replaceChildren();
    const geometry = selectionGeometry();
    const bounds = collectiveBounds(geometry);
    if (!bounds || layers.length === 0)
        return;
    const values = [
        ["X", bounds.x, "x"],
        ["Y", bounds.y, "y"],
        ["W", bounds.width, "width"],
        ["H", bounds.height, "height"],
        ["°", layers.length === 1 ? (layers[0]?.transform.rotation ?? 0) : 0, "rotation"],
    ];
    for (const [label, value, property] of values) {
        const wrapper = document.createElement("label");
        wrapper.append(document.createTextNode(label));
        const input = document.createElement("input");
        input.type = "number";
        input.value = String(Math.round(value * 10) / 10);
        input.disabled = layers.some((layer) => !api.isEditable(layer)) || (property === "rotation" && layers.length > 1);
        input.addEventListener("change", async () => {
            const next = Number(input.value);
            if (!Number.isFinite(next))
                return;
            if (property === "x" || property === "y") {
                const dx = property === "x" ? next - bounds.x : 0;
                const dy = property === "y" ? next - bounds.y : 0;
                void sendBatch("position selection", layers.map((layer) => ({ op: "move", id: layer.id, dx, dy })));
            }
            else if (property === "rotation" && layers[0]) {
                void send("rotate layer", { op: "rotate", id: layers[0].id, degrees: next });
            }
            else {
                if (property === "width" &&
                    layers.length === 1 &&
                    layers[0]?.type === "text" &&
                    state.project) {
                    try {
                        const layout = await api.textLayout(state.project, layers[0].id, next);
                        void sendBatch("resize text box", [{
                                op: "resize",
                                id: layers[0].id,
                                width: Math.max(1, next),
                                height: Math.max(1, Math.ceil(layout.height)),
                            }]);
                        return;
                    }
                    catch {
                        // Fall through to the ordinary resize if measurement is refused.
                    }
                }
                const resizedSelection = {
                    ...bounds,
                    width: property === "width" ? Math.max(1, next) : bounds.width,
                    height: property === "height" ? Math.max(1, next) : bounds.height,
                };
                const operations = [];
                for (const one of geometry) {
                    const resized = geometry.length === 1
                        ? {
                            x: one.x,
                            y: one.y,
                            width: property === "width" ? resizedSelection.width : one.width,
                            height: property === "height" ? resizedSelection.height : one.height,
                        }
                        : resizeItemInSelection(one, bounds, resizedSelection);
                    const dx = resized.x - one.x;
                    const dy = resized.y - one.y;
                    if (dx || dy)
                        operations.push({ op: "move", id: one.layer.id, dx, dy });
                    operations.push({
                        op: "resize",
                        id: one.layer.id,
                        width: resized.width,
                        height: resized.height,
                    });
                }
                void sendBatch("resize selection", operations);
            }
        });
        wrapper.append(input);
        dom.positionFields.append(wrapper);
    }
}
function togglePositionPopover(force) {
    const open = force ?? dom.positionPopover.hidden;
    dom.positionPopover.hidden = !open;
    if (!open)
        return;
    renderPositionFields(selectedLayers());
    const trigger = dom.inspector.querySelector(".position-button");
    const rect = trigger?.getBoundingClientRect();
    const editorLeft = dom.inspector.getBoundingClientRect().left + 8;
    const dockLeft = dom.structure.getBoundingClientRect().left;
    const desiredLeft = (rect?.right ?? editorLeft + 320) - 320;
    dom.positionPopover.style.left = `${Math.max(editorLeft, Math.min(dockLeft - 332, desiredLeft))}px`;
    dom.positionPopover.style.top = `${Math.min(window.innerHeight - 520, (rect?.bottom ?? 100) + 8)}px`;
    dom.positionPopover.querySelector("[data-canvas-anchor]")?.focus();
}
const clipboardKey = "assemblash-layer-clipboard-v1";
function copySelection() {
    if (!state.project || !state.document || state.selection.length === 0)
        return false;
    const flat = api.flatten(api.layersOf(state.document));
    const selected = new Set(state.selection);
    const roots = flat
        .filter(({ layer, parent }) => selected.has(layer.id) && (!parent || !selected.has(parent)))
        .map(({ layer }) => structuredClone(layer));
    sessionStorage.setItem(clipboardKey, JSON.stringify({ project: state.project, layers: roots }));
    say(`Copied ${roots.length} layer${roots.length === 1 ? "" : "s"}.`);
    return roots.length > 0;
}
function clipboardLayers() {
    if (!state.project)
        return null;
    try {
        const value = JSON.parse(sessionStorage.getItem(clipboardKey) ?? "null");
        return value?.project === state.project && Array.isArray(value.layers) ? value.layers : null;
    }
    catch {
        return null;
    }
}
function pasteClipboard() {
    const layers = clipboardLayers();
    if (!layers || !state.project) {
        say("Nothing from this project is ready to paste.", "error");
        return;
    }
    void sendBatch("paste layers", [{
            op: "insertLayerTree",
            sourceProject: state.project,
            layers,
            position: { at: "root" },
            offsetX: 20,
            offsetY: 20,
        }]);
}
function deleteSelection(label = "delete selection") {
    const layers = selectedLayers();
    if (layers.length === 0 || layers.some((layer) => !api.isEditable(layer)))
        return;
    void sendBatch(label, layers.map((layer) => ({ op: "delete", id: layer.id })));
}
function moveLayerOrder(where) {
    if (!state.document || state.selection.length !== 1)
        return;
    const id = state.selection[0];
    const flat = api.flatten(api.layersOf(state.document));
    const found = flat.find(({ layer }) => layer.id === id);
    if (!found || !api.isEditable(found.layer))
        return;
    const parentLayer = found.parent ? flat.find(({ layer }) => layer.id === found.parent)?.layer : null;
    const siblings = parentLayer?.type === "group" ? parentLayer.children ?? [] : api.layersOf(state.document);
    const index = siblings.findIndex((layer) => layer.id === id);
    let target = index;
    if (where === "front")
        target = siblings.length - 1;
    if (where === "forward")
        target = Math.min(siblings.length - 1, index + 1);
    if (where === "backward")
        target = Math.max(0, index - 1);
    if (where === "back")
        target = 0;
    if (target === index)
        return;
    const to = found.parent
        ? { at: "in", parent: found.parent, index: target }
        : { at: "root", index: target };
    void send(`send ${where}`, { op: "reorder", id, to });
}
function openContextMenu(x, y) {
    dom.contextMenu.replaceChildren();
    const layers = selectedLayers();
    const editable = layers.length > 0 && layers.every(api.isEditable);
    const one = layers.length === 1 ? layers[0] : null;
    const add = (label, icon, run, disabled = false) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "menuitem");
        button.disabled = disabled;
        button.innerHTML = `<i class="ph ${icon}" aria-hidden="true"></i><span>${label}</span>`;
        button.addEventListener("click", () => {
            dom.contextMenu.hidden = true;
            run();
        });
        dom.contextMenu.append(button);
    };
    const divider = () => {
        const rule = document.createElement("hr");
        rule.setAttribute("role", "separator");
        dom.contextMenu.append(rule);
    };
    if (one?.type === "text") {
        add("Edit text", "ph-pencil-simple", () => beginInlineTextEdit(one), !editable);
        divider();
    }
    add("Cut", "ph-scissors", () => { if (copySelection())
        deleteSelection("cut layers"); }, !editable);
    add("Copy", "ph-copy", () => { copySelection(); }, layers.length === 0);
    add("Paste", "ph-clipboard-text", pasteClipboard, !clipboardLayers());
    add("Duplicate", "ph-copy-simple", () => void sendBatch("duplicate", layers.map((layer) => ({ op: "duplicate", id: layer.id }))), !editable);
    add("Delete", "ph-trash", deleteSelection, !editable);
    divider();
    add("Bring to front", "ph-arrow-line-up", () => moveLayerOrder("front"), !one || !editable);
    add("Bring forward", "ph-arrow-up", () => moveLayerOrder("forward"), !one || !editable);
    add("Send backward", "ph-arrow-down", () => moveLayerOrder("backward"), !one || !editable);
    add("Send to back", "ph-arrow-line-down", () => moveLayerOrder("back"), !one || !editable);
    divider();
    add("Group", "ph-stack", () => void send("group", { op: "group", ids: layers.map((layer) => layer.id) }), layers.length < 2 || !editable);
    add("Ungroup", "ph-stack-minus", () => { if (one)
        void send("ungroup", { op: "ungroup", id: one.id }); }, one?.type !== "group" || !editable);
    add(one?.locked ? "Unlock" : "Lock", one?.locked ? "ph-lock-open" : "ph-lock", () => {
        if (one)
            void send(one.locked ? "unlock layer" : "lock layer", { op: "setLocked", id: one.id, locked: !one.locked });
    }, !one || Boolean(one.protected || one.readOnly));
    add(one?.visible === false ? "Show" : "Hide", one?.visible === false ? "ph-eye" : "ph-eye-slash", () => {
        if (one)
            void send(one.visible === false ? "show layer" : "hide layer", { op: "setVisible", id: one.id, visible: one.visible === false });
    }, !one || !editable);
    add("Rename in Layers", "ph-pencil-simple", () => {
        if (!one)
            return;
        showDock("layers");
        const row = dom.layers.querySelector(`[data-id="${CSS.escape(one.id)}"]`);
        const label = row?.querySelector(".name");
        if (label)
            beginLayerRename(one, label);
    }, !one || Boolean(one.protected || one.readOnly));
    divider();
    add("Align left", "ph-align-left-simple", () => alignFromContextMenu("left"), !editable);
    add("Align horizontal centres", "ph-align-center-horizontal", () => alignFromContextMenu("centerHorizontal"), !editable);
    add("Align right", "ph-align-right-simple", () => alignFromContextMenu("right"), !editable);
    add("Align top", "ph-align-top-simple", () => alignFromContextMenu("top"), !editable);
    add("Align vertical middles", "ph-align-center-vertical", () => alignFromContextMenu("centerVertical"), !editable);
    add("Align bottom", "ph-align-bottom-simple", () => alignFromContextMenu("bottom"), !editable);
    add("Distribute horizontally", "ph-columns", () => void send("distribute horizontally", { op: "distribute", ids: layers.map((layer) => layer.id), axis: "horizontal" }), !editable || layers.length < 3);
    add("Distribute vertically", "ph-rows", () => void send("distribute vertically", { op: "distribute", ids: layers.map((layer) => layer.id), axis: "vertical" }), !editable || layers.length < 3);
    dom.contextMenu.hidden = false;
    dom.contextMenu.style.left = `${Math.min(window.innerWidth - 240, Math.max(8, x))}px`;
    dom.contextMenu.style.top = `${Math.min(window.innerHeight - dom.contextMenu.offsetHeight - 8, Math.max(8, y))}px`;
    dom.contextMenu.querySelector('button[role="menuitem"]:not(:disabled)')?.focus();
}
function alignFromContextMenu(edge) {
    if (!state.document)
        return;
    const layers = selectedLayers();
    const ids = layers.map((layer) => layer.id);
    if (layers.length !== 1) {
        void send("align selection", { op: "align", ids, edge });
        return;
    }
    const bounds = visualCollectiveBounds(selectionGeometry());
    if (!bounds)
        return;
    let dx = 0;
    let dy = 0;
    if (edge === "left")
        dx = -bounds.x;
    if (edge === "centerHorizontal")
        dx = state.document.canvas.width / 2 - (bounds.x + bounds.width / 2);
    if (edge === "right")
        dx = state.document.canvas.width - (bounds.x + bounds.width);
    if (edge === "top")
        dy = -bounds.y;
    if (edge === "centerVertical")
        dy = state.document.canvas.height / 2 - (bounds.y + bounds.height / 2);
    if (edge === "bottom")
        dy = state.document.canvas.height - (bounds.y + bounds.height);
    if (dx !== 0 || dy !== 0) {
        void send("align layer to canvas", { op: "move", id: layers[0].id, dx, dy });
    }
}
dom.contextMenu.addEventListener("keydown", (event) => {
    const items = [...dom.contextMenu.querySelectorAll('button[role="menuitem"]:not(:disabled)')];
    if (items.length === 0)
        return;
    const current = items.indexOf(document.activeElement);
    let next = current;
    if (event.key === "ArrowDown")
        next = (current + 1 + items.length) % items.length;
    else if (event.key === "ArrowUp")
        next = (current - 1 + items.length) % items.length;
    else if (event.key === "Home")
        next = 0;
    else if (event.key === "End")
        next = items.length - 1;
    else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        dom.contextMenu.hidden = true;
        dom.canvas.focus();
        return;
    }
    else
        return;
    event.preventDefault();
    items[next]?.focus();
});
// --- wiring ------------------------------------------------------------------
dom.projects.addEventListener("change", () => {
    state.project = dom.projects.value || null;
    state.selection = [];
    void guard("open", openProject);
});
/** Reads a newly opened project, and asks the template panel what it offers. */
async function openProject() {
    try {
        await refresh();
    }
    catch (error) {
        const details = error instanceof api.ApiError
            ? error.details
            : null;
        const pid = details && typeof details.pid === "number" ? details.pid : null;
        if (!(error instanceof api.ApiError) ||
            error.code !== "projectLocked" ||
            pid === null ||
            !state.project) {
            throw error;
        }
        const confirmed = window.confirm(`This project was left locked by process ${pid}. ` +
            "If that Assemblash process is still running, close it first. " +
            "Recover this project now?");
        if (!confirmed)
            throw error;
        await api.recoverProjectLock(state.project, pid);
        await refresh();
        say("Recovered the project after the previous process stopped.");
    }
    // After the document, because the panel's image fields are built from the
    // assets the document lists.
    await templates.projectChanged();
    say(`Opened ${state.document?.name ?? state.project}.`);
}
dom.reload.addEventListener("click", () => void guard("reload", async () => {
    await refresh();
    say("Project refreshed.");
}));
// Searching re-asks the engine rather than filtering a list held here, so the
// page never has to hold a whole workspace to look through it.
let searchTimer = 0;
dom.search.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
        void guard("search", () => loadProjects());
    }, 150);
});
dom.newProject.addEventListener("click", () => {
    dom.newProjectName.value = "";
    dom.newProjectDialog.showModal();
    window.setTimeout(() => dom.newProjectName.focus(), 0);
});
dom.emptyCreate.addEventListener("click", () => dom.newProject.click());
dom.canvasPresets.addEventListener("click", (event) => {
    const button = event.target.closest("[data-size]");
    if (!button)
        return;
    const [width, height] = (button.dataset["size"] ?? "").split("x").map(Number);
    if (!width || !height)
        return;
    for (const one of dom.canvasPresets.querySelectorAll("button")) {
        one.classList.toggle("selected", one === button);
    }
    dom.newProjectWidth.value = String(width);
    dom.newProjectHeight.value = String(height);
});
dom.newProjectForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    if (submitter?.value === "cancel") {
        dom.newProjectDialog.close("cancel");
        return;
    }
    if (!dom.newProjectForm.reportValidity())
        return;
    const id = dom.newProjectName.value.trim();
    const width = Number(dom.newProjectWidth.value);
    const height = Number(dom.newProjectHeight.value);
    if (!id || !Number.isFinite(width) || !Number.isFinite(height))
        return;
    void guard("create", async () => {
        await api.createProject(id, width, height, dom.newProjectBackground.value, id);
        dom.newProjectDialog.close();
        await loadProjects(id);
        say(`Created ${id}. Add text or drop in an image to begin.`);
    });
});
const addSections = [
    ["add-text-section", "Text", dom.addText],
    ["add-upload-section", "Uploads", dom.addImage],
    ["add-vector-section", "Vector", dom.addVector],
    ["add-template-section", "Templates", dom.templatesToggle],
];
function activateEditorTool(active) {
    for (const tool of [dom.addToggle, dom.selectTool, dom.addText, dom.addImage, dom.addVector, dom.templatesToggle]) {
        const selected = tool === active;
        tool.classList.toggle("active", selected);
        tool.setAttribute("aria-pressed", String(selected));
    }
}
function showAddSection(id, active = dom.addToggle) {
    dom.addPanel.classList.remove("collapsed");
    dom.addToggle.setAttribute("aria-expanded", "true");
    dom.structure.classList.remove("mobile-open");
    dom.dockToggle.setAttribute("aria-expanded", "false");
    dom.templatesPanel.classList.remove("open");
    dom.addPanelTitle.textContent = id
        ? (addSections.find(([sectionId]) => sectionId === id)?.[1] ?? "Add")
        : "Add";
    for (const [sectionId] of addSections) {
        const section = document.getElementById(sectionId);
        if (section)
            section.hidden = Boolean(id && sectionId !== id);
    }
    const templateMode = id === "add-template-section";
    dom.templatesPanel.classList.toggle("open", templateMode && !dom.templatesPanel.hidden);
    dom.openTemplates.hidden = templateMode && !dom.templatesPanel.hidden;
    dom.addPanel.scrollTop = 0;
    activateEditorTool(active);
}
function closeAddPanel() {
    dom.addPanel.classList.add("collapsed");
    dom.addToggle.setAttribute("aria-expanded", "false");
    activateEditorTool(dom.selectTool);
}
dom.addToggle.addEventListener("click", () => {
    if (dom.addPanel.classList.contains("collapsed"))
        showAddSection();
    else
        closeAddPanel();
});
dom.addPanelClose.addEventListener("click", closeAddPanel);
dom.addText.addEventListener("click", () => showAddSection("add-text-section", dom.addText));
dom.addImage.addEventListener("click", () => showAddSection("add-upload-section", dom.addImage));
dom.addVector.addEventListener("click", () => showAddSection("add-vector-section", dom.addVector));
dom.templatesToggle.addEventListener("click", () => showAddSection("add-template-section", dom.templatesToggle));
async function createTextPreset(preset) {
    const families = await api.fonts();
    const family = families[0];
    if (!family) {
        say("no fonts installed — run: assemblash font install \"Noto Sans\"", "error");
        return;
    }
    if (!state.project || !state.document)
        return;
    const settings = {
        heading: { text: "Add a heading", fontSize: 64, width: 600, height: 100 },
        subheading: { text: "Add a subheading", fontSize: 36, width: 520, height: 64 },
        body: { text: "Add body text", fontSize: 22, width: 460, height: 120 },
    }[preset];
    const transform = {
        x: Math.round((state.document.canvas.width - settings.width) / 2),
        y: Math.round((state.document.canvas.height - settings.height) / 2),
        width: settings.width,
        height: settings.height,
    };
    const result = await api.applyOperation(state.project, {
        op: "create",
        position: { at: "root" },
        transform,
        type: "text",
        text: settings.text,
        fontFamily: family,
        fontSize: settings.fontSize,
        lineHeight: 1.15,
        color: "#101820",
    }, api.versionOf(state.document));
    const created = result.created?.[0];
    if (created)
        state.selection = [created];
    say(`Added ${preset} text. Type directly on the canvas.`);
    await refresh();
    const layer = selectedLayer();
    if (layer?.type === "text")
        beginInlineTextEdit(layer);
}
dom.addPanel.addEventListener("click", (event) => {
    const button = event.target.closest("[data-text-preset]");
    const preset = button?.dataset["textPreset"];
    if (preset)
        void guard(`add ${preset}`, () => createTextPreset(preset));
});
dom.deleteLayer.addEventListener("click", () => deleteSelection());
dom.groupLayers.addEventListener("click", () => {
    if (state.selection.length < 2)
        return;
    void send("group", { op: "group", ids: [...state.selection] });
});
dom.undo.addEventListener("click", () => {
    void guard("undo", async () => {
        if (!state.project)
            return;
        const result = await api.undo(state.project);
        say(`undone (version ${result.version})`);
        await refresh();
    });
});
dom.redo.addEventListener("click", () => {
    void guard("redo", async () => {
        if (!state.project)
            return;
        const result = await api.redo(state.project);
        say(`redone (version ${result.version})`);
        await refresh();
    });
});
dom.exportButton.addEventListener("click", () => exporter.open());
dom.uploadDropzone.addEventListener("click", () => dom.imageFile.click());
dom.browseVector.addEventListener("click", () => dom.vectorFile.click());
function addAssetFile(file, preferredType, point) {
    if (!file)
        return;
    void guard(preferredType === "svg" ? "add vector" : "add image", async () => {
        if (!state.project || !state.document)
            return;
        // Two steps, because importing a file and adding a layer are different
        // things: the import copies bytes into the project and is not undoable,
        // and the layer that draws them is an ordinary operation that is.
        dom.uploadFeedback.textContent = `Uploading ${file.name}…`;
        try {
            const uploaded = await api.uploadAsset(state.project, file);
            const isSvg = uploaded.asset.mediaType === "image/svg+xml" || preferredType === "svg";
            const layerWidth = 300;
            const layerHeight = 200;
            const x = Math.round(point?.x ?? (state.document.canvas.width - layerWidth) / 2);
            const y = Math.round(point?.y ?? (state.document.canvas.height - layerHeight) / 2);
            const create = isSvg
                ? {
                    op: "create",
                    position: { at: "root" },
                    transform: { x, y, width: layerWidth, height: layerHeight },
                    type: "svg",
                    asset: uploaded.asset.id,
                }
                : {
                    op: "create",
                    position: { at: "root" },
                    transform: { x, y, width: layerWidth, height: layerHeight },
                    type: "image",
                    asset: uploaded.asset.id,
                    fit: "contain",
                };
            const result = await api.applyOperation(state.project, create, uploaded.version);
            if (result.created?.length)
                state.selection = result.created;
            say(`added ${file.name} (version ${result.version})`);
            dom.uploadFeedback.textContent = `${file.name} added`;
            await refresh();
        }
        catch (error) {
            dom.uploadFeedback.textContent = `${file.name} could not be added. Try again.`;
            throw error;
        }
    });
}
for (const type of ["dragenter", "dragover"]) {
    dom.uploadDropzone.addEventListener(type, (event) => {
        event.preventDefault();
        dom.uploadDropzone.classList.add("drag-over");
    });
}
dom.uploadDropzone.addEventListener("dragleave", () => dom.uploadDropzone.classList.remove("drag-over"));
dom.uploadDropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dom.uploadDropzone.classList.remove("drag-over");
    const file = event.dataTransfer?.files[0];
    if (file)
        addAssetFile(file, file.type === "image/svg+xml" ? "svg" : "image");
});
for (const type of ["dragenter", "dragover"]) {
    dom.stageViewport.addEventListener(type, (event) => event.preventDefault());
}
dom.stageViewport.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (!file || !state.document)
        return;
    const rect = dom.canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        addAssetFile(file, file.type === "image/svg+xml" ? "svg" : "image");
        return;
    }
    const point = {
        x: ((event.clientX - rect.left) / rect.width) * state.document.canvas.width - 150,
        y: ((event.clientY - rect.top) / rect.height) * state.document.canvas.height - 100,
    };
    addAssetFile(file, file.type === "image/svg+xml" ? "svg" : "image", point);
});
dom.imageFile.addEventListener("change", () => {
    const file = dom.imageFile.files?.[0];
    dom.imageFile.value = "";
    if (file)
        addAssetFile(file, "image");
});
dom.vectorFile.addEventListener("change", () => {
    const file = dom.vectorFile.files?.[0];
    dom.vectorFile.value = "";
    if (file)
        addAssetFile(file, "svg");
});
function showDock(view) {
    dom.propertiesTab.setAttribute("aria-selected", String(view === "properties"));
    dom.layersTab.setAttribute("aria-selected", String(view === "layers"));
    dom.historyTab.setAttribute("aria-selected", String(view === "history"));
    dom.propertiesPanel.hidden = view !== "properties";
    dom.layersView.hidden = view !== "layers";
    dom.historyView.hidden = view !== "history";
}
dom.propertiesTab.addEventListener("click", () => showDock("properties"));
dom.layersTab.addEventListener("click", () => showDock("layers"));
dom.historyTab.addEventListener("click", () => showDock("history"));
dom.historyShortcut.addEventListener("click", () => showDock("history"));
dom.layerSearch.addEventListener("input", drawLayers);
dom.dockToggle.addEventListener("click", () => {
    const open = dom.structure.classList.toggle("mobile-open");
    dom.dockToggle.setAttribute("aria-expanded", String(open));
    if (open) {
        closeAddPanel();
        dom.layersTab.focus();
    }
});
dom.selectTool.addEventListener("click", () => {
    closeAddPanel();
    dom.templatesPanel.classList.remove("open");
    dom.structure.classList.remove("mobile-open");
    dom.dockToggle.setAttribute("aria-expanded", "false");
    dom.canvas.focus();
});
dom.positionClose.addEventListener("click", () => togglePositionPopover(false));
dom.positionPopover.addEventListener("click", (event) => {
    const button = event.target.closest("[data-canvas-anchor], [data-layout]");
    const anchor = button?.dataset["canvasAnchor"];
    if (anchor && !button.disabled && state.selection.length > 0 && state.document) {
        const geometry = selectionGeometry();
        const bounds = visualCollectiveBounds(geometry);
        if (!bounds)
            return;
        const anchors = {
            "top-left": { horizontal: "left", vertical: "top" },
            "top-center": { horizontal: "center", vertical: "top" },
            "top-right": { horizontal: "right", vertical: "top" },
            "middle-left": { horizontal: "left", vertical: "middle" },
            center: { horizontal: "center", vertical: "middle" },
            "middle-right": { horizontal: "right", vertical: "middle" },
            "bottom-left": { horizontal: "left", vertical: "bottom" },
            "bottom-center": { horizontal: "center", vertical: "bottom" },
            "bottom-right": { horizontal: "right", vertical: "bottom" },
        };
        const target = anchors[anchor];
        if (!target)
            return;
        const operations = [];
        const targetX = target.horizontal === "left"
            ? 0
            : target.horizontal === "right"
                ? state.document.canvas.width - bounds.width
                : (state.document.canvas.width - bounds.width) / 2;
        const targetY = target.vertical === "top"
            ? 0
            : target.vertical === "bottom"
                ? state.document.canvas.height - bounds.height
                : (state.document.canvas.height - bounds.height) / 2;
        for (const layer of selectedLayers()) {
            operations.push({ op: "move", id: layer.id, dx: targetX - bounds.x, dy: targetY - bounds.y });
        }
        togglePositionPopover(false);
        void sendSequence(`place layer ${button.title.toLowerCase()}`, operations);
        return;
    }
    const action = button?.dataset["layout"];
    if (!action || button.disabled || state.selection.length === 0)
        return;
    const ids = [...state.selection];
    let operation = null;
    switch (action) {
        case "center-horizontal":
            operation = { op: "centerOnCanvas", ids, axis: "horizontal" };
            break;
        case "center-vertical":
            operation = { op: "centerOnCanvas", ids, axis: "vertical" };
            break;
        case "align-left":
            operation = { op: "align", ids, edge: "left" };
            break;
        case "align-center-horizontal":
            operation = { op: "align", ids, edge: "centerHorizontal" };
            break;
        case "align-right":
            operation = { op: "align", ids, edge: "right" };
            break;
        case "align-top":
            operation = { op: "align", ids, edge: "top" };
            break;
        case "align-center-vertical":
            operation = { op: "align", ids, edge: "centerVertical" };
            break;
        case "align-bottom":
            operation = { op: "align", ids, edge: "bottom" };
            break;
        case "distribute-horizontal":
            operation = { op: "distribute", ids, axis: "horizontal" };
            break;
        case "distribute-vertical":
            operation = { op: "distribute", ids, axis: "vertical" };
            break;
    }
    if (operation) {
        togglePositionPopover(false);
        void send("arrange layers", operation);
    }
});
document.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!dom.positionPopover.hidden && !dom.positionPopover.contains(target) && !dom.inspector.contains(target)) {
        togglePositionPopover(false);
    }
    if (!dom.contextMenu.hidden && !dom.contextMenu.contains(target))
        dom.contextMenu.hidden = true;
});
dom.openTemplates.addEventListener("click", () => {
    if (dom.templatesPanel.hidden) {
        say("This project has no template slots. Select a layer and define a slot in Properties.");
        closeAddPanel();
        showDock("properties");
        if (window.matchMedia("(max-width: 1024px)").matches) {
            dom.structure.classList.add("mobile-open");
            dom.dockToggle.setAttribute("aria-expanded", "true");
        }
        return;
    }
    dom.templatesPanel.classList.add("open");
    dom.openTemplates.hidden = true;
    dom.templatesPanel.scrollIntoView({ block: "nearest" });
});
dom.templatesClose.addEventListener("click", () => {
    dom.templatesPanel.classList.remove("open");
    dom.openTemplates.hidden = false;
});
dom.zoomOut.addEventListener("click", () => setZoom((state.zoom ?? dragScale() ** -1) / 1.2));
dom.zoomIn.addEventListener("click", () => setZoom((state.zoom ?? dragScale() ** -1) * 1.2));
dom.zoomFit.addEventListener("click", () => setZoom(null));
dom.zoomValue.addEventListener("click", () => setZoom(null));
dom.zoom100.addEventListener("click", () => setZoom(1));
dom.stageViewport.addEventListener("wheel", (event) => {
    if (!(event.ctrlKey || event.metaKey))
        return;
    event.preventDefault();
    const current = state.zoom ?? dragScale() ** -1;
    setZoom(current * (event.deltaY > 0 ? 0.9 : 1.1));
}, { passive: false });
function syncResponsivePanels() {
    const compact = window.matchMedia("(max-width: 1024px)").matches;
    if (compact) {
        dom.structure.classList.remove("mobile-open");
        dom.dockToggle.setAttribute("aria-expanded", "false");
        dom.addPanel.classList.add("collapsed");
        dom.addToggle.setAttribute("aria-expanded", "false");
    }
    else {
        dom.structure.classList.remove("mobile-open");
        dom.dockToggle.setAttribute("aria-expanded", "true");
    }
}
window.addEventListener("resize", () => {
    if (state.zoom === null)
        applyZoom();
    syncResponsivePanels();
});
syncResponsivePanels();
let spacePressed = false;
window.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
        spacePressed = false;
        dom.stageViewport.classList.remove("pan-ready");
    }
});
dom.stageViewport.addEventListener("pointerdown", (event) => {
    if (!spacePressed || event.button !== 0)
        return;
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY };
    const scroll = { x: dom.stageViewport.scrollLeft, y: dom.stageViewport.scrollTop };
    dom.stageViewport.classList.add("panning");
    const move = (next) => {
        dom.stageViewport.scrollLeft = scroll.x - (next.clientX - start.x);
        dom.stageViewport.scrollTop = scroll.y - (next.clientY - start.y);
    };
    const finish = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        dom.stageViewport.classList.remove("panning");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
});
dom.overlay.addEventListener("pointerdown", (event) => {
    if (event.target !== dom.overlay || event.button !== 0 || !state.document)
        return;
    event.preventDefault();
    const canvasRect = dom.canvas.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY };
    const marquee = document.createElement("div");
    marquee.className = "selection-marquee";
    dom.overlay.append(marquee);
    const move = (next) => {
        const left = Math.min(start.x, next.clientX);
        const top = Math.min(start.y, next.clientY);
        const right = Math.max(start.x, next.clientX);
        const bottom = Math.max(start.y, next.clientY);
        marquee.style.left = `${((left - canvasRect.left) / canvasRect.width) * 100}%`;
        marquee.style.top = `${((top - canvasRect.top) / canvasRect.height) * 100}%`;
        marquee.style.width = `${((right - left) / canvasRect.width) * 100}%`;
        marquee.style.height = `${((bottom - top) / canvasRect.height) * 100}%`;
    };
    const finish = (next) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        const selectionRect = {
            left: Math.min(start.x, next.clientX),
            top: Math.min(start.y, next.clientY),
            right: Math.max(start.x, next.clientX),
            bottom: Math.max(start.y, next.clientY),
        };
        const hits = [...dom.overlay.querySelectorAll(".layer-hitbox")]
            .filter((hit) => {
            const rect = hit.getBoundingClientRect();
            return rect.right >= selectionRect.left && rect.left <= selectionRect.right && rect.bottom >= selectionRect.top && rect.top <= selectionRect.bottom;
        })
            .map((hit) => hit.dataset["id"])
            .filter((id) => Boolean(id));
        state.selection = event.shiftKey ? [...new Set([...state.selection, ...hits])] : hits;
        drawLayers();
        drawInspector();
        drawOverlay();
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish);
});
/** Whether the keyboard belongs to a field rather than to the canvas. */
function typingInAField(target) {
    const element = target;
    if (!element)
        return false;
    return (element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT" ||
        element.isContentEditable);
}
window.addEventListener("keydown", (event) => {
    // Never steal a key from someone editing a value.
    if (typingInAField(event.target))
        return;
    const control = event.ctrlKey || event.metaKey;
    if (event.code === "Space") {
        spacePressed = true;
        dom.stageViewport.classList.add("pan-ready");
        event.preventDefault();
        return;
    }
    if (control && event.key.toLowerCase() === "z") {
        event.preventDefault();
        (event.shiftKey ? dom.redo : dom.undo).click();
        return;
    }
    const key = event.key.toLowerCase();
    if (control && key === "c") {
        event.preventDefault();
        copySelection();
        return;
    }
    if (control && key === "x") {
        event.preventDefault();
        if (selectedLayers().every(api.isEditable) && copySelection())
            deleteSelection("cut layers");
        return;
    }
    if (control && key === "v") {
        event.preventDefault();
        pasteClipboard();
        return;
    }
    if (control && key === "d") {
        event.preventDefault();
        const layers = selectedLayers();
        if (layers.length && layers.every(api.isEditable)) {
            void sendBatch("duplicate", layers.map((one) => ({ op: "duplicate", id: one.id })));
        }
        return;
    }
    if (control && key === "g") {
        event.preventDefault();
        const layers = selectedLayers();
        if (event.shiftKey) {
            const group = layers.length === 1 && layers[0]?.type === "group" ? layers[0] : null;
            if (group)
                void send("ungroup", { op: "ungroup", id: group.id });
        }
        else if (layers.length > 1 && layers.every(api.isEditable)) {
            void send("group", { op: "group", ids: layers.map((one) => one.id) });
        }
        return;
    }
    if (event.key === "F10" && event.shiftKey) {
        event.preventDefault();
        const rect = dom.canvas.getBoundingClientRect();
        openContextMenu(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return;
    }
    if (event.key === "Escape") {
        state.selection = [];
        dom.contextMenu.hidden = true;
        togglePositionPopover(false);
        drawLayers();
        drawOverlay();
        drawInspector();
        return;
    }
    const layer = selectedLayer();
    const layers = selectedLayers();
    if ((event.key === "Enter" || event.key === "F2") && layer?.type === "text" && api.isEditable(layer)) {
        event.preventDefault();
        beginInlineTextEdit(layer);
        return;
    }
    if (layers.length === 0 || layers.some((one) => !api.isEditable(one)))
        return;
    if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelection();
        return;
    }
    // Arrows nudge; with shift, by ten. Whole pixels, because a layout nudged
    // by a fraction is a layout nobody can reproduce by hand.
    const step = event.shiftKey ? 10 : 1;
    const nudges = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
    };
    const nudge = nudges[event.key];
    if (nudge) {
        event.preventDefault();
        void sendBatch("nudge selection", layers.map((one) => ({
            op: "move",
            id: one.id,
            dx: nudge[0],
            dy: nudge[1],
        })));
    }
});
async function loadProjects(select) {
    const query = dom.search.value.trim();
    // Filtered by the engine against its cache: a workspace of two hundred
    // projects should not be sent here in full for this page to look through it.
    const projects = await api.listProjects(query);
    dom.projects.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = projects.length
        ? "Choose a project…"
        : query
            ? "Nothing matches"
            : "No projects yet";
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
        await openProject();
    }
    await drawRecents();
}
/** Blob URLs the recents strip is holding, so they can be given back. */
let recentThumbnails = [];
/**
 * The most recently modified projects, as thumbnails.
 *
 * Answered from the engine's cache, which is the only reason "most recent"
 * can be answered without opening every document to read a timestamp.
 */
async function drawRecents() {
    for (const url of recentThumbnails)
        URL.revokeObjectURL(url);
    recentThumbnails = [];
    dom.recents.replaceChildren();
    const projects = await api.recentProjects(8);
    // One project is not a list of recents, it is the project you have open.
    dom.recents.hidden = projects.length < 2;
    if (dom.recents.hidden)
        return;
    for (const project of projects) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "recent";
        button.title = `${project.name ?? project.id} — ${project.layers} layers`;
        // Fetched rather than pointed at, like every image here: an <img src>
        // cannot carry the access token, and the token must never be in a URL.
        try {
            const url = await api.imageObjectUrl(api.thumbnailUrl(project.id));
            recentThumbnails.push(url);
            const image = document.createElement("img");
            image.src = url;
            image.alt = "";
            button.append(image);
        }
        catch {
            // A project that will not render — a missing font, say — still belongs
            // in the list; it just has no picture.
        }
        const label = document.createElement("span");
        label.textContent = project.name ?? project.id;
        button.append(label);
        button.addEventListener("click", () => {
            dom.projects.value = project.id;
            state.project = project.id;
            state.selection = [];
            void guard("open", openProject);
        });
        dom.recents.append(button);
    }
}
dom.shutdown.addEventListener("click", () => {
    if (!window.confirm("Stop Assemblash? Any unsaved work is already on disk."))
        return;
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
