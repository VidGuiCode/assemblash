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
import { mountTemplates } from "./templates.js";
const state = {
    project: null,
    document: null,
    presets: [],
    selection: [],
    drag: null,
    busy: false,
};
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
    canvas: el("canvas"),
    canvasImage: el("canvas-image"),
    overlay: el("overlay"),
    layers: el("layers"),
    inspector: el("inspector"),
    history: el("history"),
    status: el("status"),
    version: el("version"),
    addText: el("add-text"),
    addImage: el("add-image"),
    imageFile: el("image-file"),
    deleteLayer: el("delete-layer"),
    groupLayers: el("group-layers"),
    undo: el("undo"),
    redo: el("redo"),
    exportButton: el("export"),
    download: el("download"),
    downloadSvg: el("download-svg"),
    shutdown: el("shutdown"),
};
function say(message, kind = "info") {
    dom.status.textContent = message;
    dom.status.dataset["kind"] = kind;
}
/** Runs something that talks to the engine, reporting whatever it refuses. */
async function guard(what, run) {
    if (state.busy)
        return;
    state.busy = true;
    try {
        await run();
    }
    catch (error) {
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
function selectedLayer() {
    if (!state.document || state.selection.length !== 1)
        return null;
    const wanted = state.selection[0];
    return (api.flatten(api.layersOf(state.document)).find(({ layer }) => layer.id === wanted)?.layer ?? null);
}
// --- rendering ---------------------------------------------------------------
async function refresh() {
    if (!state.project)
        return;
    const doc = await api.getDocument(state.project);
    state.document = doc;
    state.selection = state.selection.filter((id) => api.flatten(api.layersOf(doc)).some(({ layer }) => layer.id === id));
    dom.version.textContent = String(api.versionOf(doc));
    // A render the engine produced, shown as an image. Nothing from the
    // document is ever interpreted as markup by this page. Fetched rather than
    // pointed at, because an <img src> cannot carry the access token and the
    // token must never go in a URL.
    const previous = dom.canvasImage.src;
    dom.canvasImage.src = await api.imageObjectUrl(api.pngUrl(state.project, api.versionOf(doc)));
    if (previous.startsWith("blob:"))
        URL.revokeObjectURL(previous);
    dom.canvasImage.alt = `Preview of ${doc.name ?? state.project}`;
    dom.canvas.style.aspectRatio = `${doc.canvas.width} / ${doc.canvas.height}`;
    dom.downloadSvg.href = api.svgUrl(state.project, api.versionOf(doc));
    dom.downloadSvg.hidden = false;
    // Read with the document, because defining or deleting one is an ordinary
    // operation and every operation refreshes.
    state.presets = await api.getPresets(state.project);
    drawLayers();
    drawOverlay();
    drawInspector();
    await drawHistory();
}
function drawLayers() {
    dom.layers.replaceChildren();
    if (!state.document)
        return;
    // Top of the list is top of the stack: array order is z-order, so the list
    // reads the way the picture stacks.
    for (const { layer, depth } of api.flatten(api.layersOf(state.document)).reverse()) {
        const item = document.createElement("li");
        item.className = "layer";
        item.style.paddingLeft = `${8 + depth * 14}px`;
        item.dataset["id"] = layer.id;
        if (state.selection.includes(layer.id))
            item.classList.add("selected");
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
        });
        dom.layers.append(item);
    }
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
    for (const { layer, parent } of flat) {
        if (!state.selection.includes(layer.id))
            continue;
        // A layer inside a group is positioned relative to it, so the handle has
        // to be drawn at the sum of its ancestors' offsets. A rotated ancestor is
        // skipped rather than drawn in the wrong place: this build composes
        // translations, and a handle a few degrees out is worse than none.
        const offset = ancestorOffset(flat, parent);
        if (!offset)
            continue;
        const box = document.createElement("div");
        box.className = "handle-box";
        box.style.left = `${((layer.transform.x + offset.x) / width) * 100}%`;
        box.style.top = `${((layer.transform.y + offset.y) / height) * 100}%`;
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
        }
        else {
            box.classList.add("guarded");
            box.title = api.whyNotEditable(layer) ?? "";
        }
        dom.overlay.append(box);
    }
}
function drawInspector() {
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
    const field = (label, value, apply, type = "text") => {
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
            if (input.value === value)
                return;
            const operation = apply(input.value);
            if (operation)
                void send(`change ${label}`, operation);
        });
        wrapper.append(input);
        dom.inspector.append(wrapper);
    };
    const t = layer.transform;
    field("x", String(t.x), (next) => moveTo(layer, Number(next), t.y), "number");
    field("y", String(t.y), (next) => moveTo(layer, t.x, Number(next)), "number");
    field("width", String(t.width), (next) => resizeTo(layer, Number(next), t.height), "number");
    field("height", String(t.height), (next) => resizeTo(layer, t.width, Number(next)), "number");
    field("rotation", String(t.rotation ?? 0), (next) => ({ op: "rotate", id: layer.id, degrees: Number(next) }), "number");
    field("opacity", String(layer.opacity ?? 1), (next) => ({ op: "update", id: layer.id, opacity: Number(next) }), "number");
    field("name", layer.name ?? "", (next) => next === (layer.name ?? "")
        ? null
        : { op: "rename", id: layer.id, name: next || undefined });
    if (layer.type === "text") {
        field("text", layer.text, (next) => ({ op: "update", id: layer.id, text: next }));
        field("font size", String(layer.fontSize), (next) => ({ op: "update", id: layer.id, fontSize: Number(next) }), "number");
        field("colour", layer.color ?? "#000000", (next) => ({ op: "update", id: layer.id, color: next }), "color");
    }
    // How it composites. The list comes from the schema's own enumeration, so
    // the picker cannot offer a mode the engine would refuse.
    const blend = document.createElement("label");
    blend.className = "field";
    blend.append(document.createTextNode("blend"));
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
    dom.inspector.append(blend);
    drawEffects(layer, why !== null);
    drawPresets(layer, why !== null);
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
    dom.inspector.append(visible);
}
/**
 * The effect stack, as rows with one number each.
 *
 * Effects are never baked: what is edited here is the list of numbers in the
 * document, and the pixels are derived from it every render. So removing an
 * effect is as complete as never having added it, and undo restores the whole
 * stack like any other property.
 */
function drawEffects(layer, guarded) {
    const effects = (layer.effects ?? []);
    const heading = document.createElement("h2");
    heading.textContent = "Effects";
    dom.inspector.append(heading);
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
        dom.inspector.append(row);
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
    dom.inspector.append(add);
}
/**
 * The document's named styles: apply one, or save this layer's as a new one.
 *
 * Applying is one operation the engine resolves — the page never assembles the
 * properties itself. That is what makes a preset applied here identical to the
 * same preset applied from the command line or by an agent.
 */
function drawPresets(layer, guarded) {
    const heading = document.createElement("h2");
    heading.textContent = "Presets";
    dom.inspector.append(heading);
    if (state.presets.length === 0) {
        const hint = document.createElement("p");
        hint.className = "hint";
        hint.textContent = "No presets in this document yet.";
        dom.inspector.append(hint);
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
        dom.inspector.append(row);
    }
    const save = document.createElement("div");
    save.className = "buttons";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Save style as preset";
    button.addEventListener("click", () => {
        const name = window.prompt("Preset name:");
        if (!name)
            return;
        void send(`define ${name}`, {
            op: "definePreset",
            preset: { name, properties: api.styleOf(layer) },
        });
    });
    save.append(button);
    dom.inspector.append(save);
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
function beginDrag(event, layer, mode) {
    event.preventDefault();
    const rect = dom.canvas.getBoundingClientRect();
    if (rect.width === 0 || !state.document)
        return;
    state.drag = {
        id: layer.id,
        mode,
        startX: event.clientX,
        startY: event.clientY,
        origin: { ...layer.transform },
    };
    event.target.setPointerCapture?.(event.pointerId);
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
    const dx = (event.clientX - drag.startX) * scale;
    const dy = (event.clientY - drag.startY) * scale;
    const box = dom.overlay.querySelector(`[data-id="${drag.id}"]`);
    if (!box)
        return;
    const { width, height } = state.document.canvas;
    if (drag.mode === "move") {
        box.style.left = `${((drag.origin.x + dx) / width) * 100}%`;
        box.style.top = `${((drag.origin.y + dy) / height) * 100}%`;
    }
    else {
        box.style.width = `${(Math.max(1, drag.origin.width + dx) / width) * 100}%`;
        box.style.height = `${(Math.max(1, drag.origin.height + dy) / height) * 100}%`;
    }
});
window.addEventListener("pointerup", (event) => {
    const drag = state.drag;
    state.drag = null;
    if (!drag)
        return;
    const scale = dragScale();
    const dx = Math.round((event.clientX - drag.startX) * scale);
    const dy = Math.round((event.clientY - drag.startY) * scale);
    if (dx === 0 && dy === 0) {
        drawOverlay();
        return;
    }
    if (drag.mode === "move") {
        void send("move", { op: "move", id: drag.id, dx, dy });
    }
    else {
        void send("resize", {
            op: "resize",
            id: drag.id,
            width: Math.max(1, drag.origin.width + dx),
            height: Math.max(1, drag.origin.height + dy),
        });
    }
});
// --- wiring ------------------------------------------------------------------
dom.projects.addEventListener("change", () => {
    state.project = dom.projects.value || null;
    state.selection = [];
    void guard("open", openProject);
});
/** Reads a newly opened project, and asks the template panel what it offers. */
async function openProject() {
    await refresh();
    // After the document, because the panel's image fields are built from the
    // assets the document lists.
    await templates.projectChanged();
}
dom.reload.addEventListener("click", () => void guard("reload", refresh));
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
    const id = window.prompt("Project name (letters, digits, spaces, hyphens):");
    if (!id)
        return;
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
        if (!state.project || !state.document)
            return;
        const result = await api.applyOperation(state.project, {
            op: "create",
            position: { at: "root" },
            transform: { x: 40, y: 40, width: 400, height: 80 },
            type: "text",
            text: "New text",
            fontFamily: family,
            fontSize: 48,
            color: "#101820",
        }, api.versionOf(state.document));
        if (result.created?.length)
            state.selection = result.created;
        say(`added a text layer (version ${result.version})`);
        await refresh();
    });
});
dom.deleteLayer.addEventListener("click", () => {
    const layer = selectedLayer();
    if (!layer)
        return;
    void send("delete", { op: "delete", id: layer.id });
});
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
dom.exportButton.addEventListener("click", () => {
    void guard("export", async () => {
        if (!state.project || !state.document)
            return;
        const result = await api.exportDocument(state.project, "ui-export", 1);
        say(`exported ${result.path} — ${result.width}x${result.height}, ${result.bytes} bytes`);
        dom.download.href = api.pngUrl(state.project, api.versionOf(state.document));
        dom.download.hidden = false;
    });
});
dom.addImage.addEventListener("click", () => dom.imageFile.click());
dom.imageFile.addEventListener("change", () => {
    const file = dom.imageFile.files?.[0];
    // Cleared straight away so choosing the same file twice fires again.
    dom.imageFile.value = "";
    if (!file)
        return;
    void guard("add image", async () => {
        if (!state.project || !state.document)
            return;
        // Two steps, because importing a file and adding a layer are different
        // things: the import copies bytes into the project and is not undoable,
        // and the layer that draws them is an ordinary operation that is.
        const uploaded = await api.uploadAsset(state.project, file);
        const result = await api.applyOperation(state.project, {
            op: "create",
            position: { at: "root" },
            transform: { x: 40, y: 40, width: 300, height: 200 },
            type: "image",
            asset: uploaded.asset.id,
            fit: "contain",
        }, uploaded.version);
        if (result.created?.length)
            state.selection = result.created;
        say(`added ${file.name} (version ${result.version})`);
        await refresh();
    });
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
    if (control && event.key.toLowerCase() === "z") {
        event.preventDefault();
        (event.shiftKey ? dom.redo : dom.undo).click();
        return;
    }
    const layer = selectedLayer();
    if (!layer || !api.isEditable(layer))
        return;
    if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        void send("delete", { op: "delete", id: layer.id });
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
        void send("nudge", {
            op: "move",
            id: layer.id,
            dx: nudge[0],
            dy: nudge[1],
        });
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
