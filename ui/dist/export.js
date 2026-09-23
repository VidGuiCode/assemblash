// Resolution-aware export for the reference interface.
//
// Exporting happens in the Rust renderer, not in a browser canvas. That keeps
// preview and export on the same deterministic path and makes 8K independent
// of browser texture-size limits. The UI only chooses an output size and
// reports what the engine produced.
import * as api from "./api.js";
import { t, formatNumber } from "./i18n.js";
/**
 * The two things the engine can hand over.
 *
 * PNG goes through `export`, which writes a file into the project and is what
 * every other surface produces. SVG is the same render one stage earlier, read
 * straight from `preview.svg`: there is no rasterizing left to choose a size
 * for, which is why picking it puts the resolution row out of use rather than
 * quietly ignoring it.
 */
export const FORMATS = [
    { id: "png", label: "PNG", detail: t("export.pngDetail"), icon: "ph-image" },
    { id: "svg", label: "SVG", detail: t("export.svgDetail"), icon: "ph-file-svg" },
];
/** Where a chosen format's bytes are read from, and what they are called. */
export function downloadTargetFor(format, project, document, name) {
    if (format === "svg") {
        return {
            url: api.svgUrl(project, api.versionOf(document)),
            filename: `${name}.svg`,
        };
    }
    return { url: api.exportUrl(project, name), filename: `${name}.png` };
}
export const RESOLUTIONS = [
    {
        id: "original",
        label: t("export.original"),
        detail: t("export.documentSize"),
        longEdge: null,
        icon: "ph-frame-corners",
    },
    { id: "2k", label: "2K", detail: t("export.longEdge2k"), longEdge: 2048, icon: "ph-image" },
    { id: "4k", label: "4K", detail: t("export.longEdge4k"), longEdge: 3840, icon: "ph-image-square" },
    { id: "8k", label: t("export.resolution8k"), detail: t("export.longEdge8k"), longEdge: 7680, icon: "ph-sparkle" },
];
/** Exact output dimensions for a document and a selected resolution. */
export function dimensionsFor(document, resolution) {
    const width = document.canvas.width;
    const height = document.canvas.height;
    const scale = resolution.longEdge === null ? 1 : resolution.longEdge / Math.max(width, height);
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
        scale,
    };
}
function el(id) {
    const found = window.document.getElementById(id);
    if (!found)
        throw new Error(`missing element #${id}`);
    return found;
}
function safeName(value) {
    const cleaned = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);
    return cleaned || "assemblash-export";
}
function humanBytes(bytes) {
    if (bytes < 1024)
        return t("export.bytes", { count: formatNumber(bytes) });
    if (bytes < 1024 * 1024)
        return `${formatNumber(Math.round(bytes / 102.4) / 10)} KB`;
    return `${formatNumber(Math.round(bytes / (1024 * 1024) * 10) / 10)} MB`;
}
export function mountExport(host) {
    const dom = {
        dialog: el("export-dialog"),
        form: el("export-form"),
        formats: el("export-formats"),
        options: el("export-options"),
        resolutionRow: el("export-resolution-row"),
        name: el("export-name"),
        summary: el("export-summary"),
        confirm: el("export-confirm"),
        download: el("export-download"),
    };
    let selected = "8k";
    let format = "png";
    let heldDownload = null;
    function selectedResolution() {
        return RESOLUTIONS.find(({ id }) => id === selected) ?? RESOLUTIONS[0];
    }
    function releaseDownload() {
        if (heldDownload)
            URL.revokeObjectURL(heldDownload);
        heldDownload = null;
        dom.download.hidden = true;
        dom.download.removeAttribute("href");
    }
    function drawSummary() {
        const document = host.document();
        if (!document) {
            dom.summary.textContent = t("export.noProject");
            return;
        }
        const output = format === "svg"
            ? { width: document.canvas.width, height: document.canvas.height }
            : dimensionsFor(document, selectedResolution());
        dom.summary.replaceChildren();
        const icon = window.document.createElement("i");
        icon.className = "ph ph-cpu";
        icon.setAttribute("aria-hidden", "true");
        const copy = window.document.createElement("span");
        const dimensions = window.document.createElement("strong");
        dimensions.textContent = `${formatNumber(output.width)} × ${formatNumber(output.height)}`;
        copy.append(dimensions, window.document.createTextNode(format === "svg"
            ? t("export.svgSummary")
            : t("export.pngSummary")));
        dom.summary.append(icon, copy);
    }
    function drawFormats() {
        dom.formats.replaceChildren();
        for (const one of FORMATS) {
            const button = window.document.createElement("button");
            button.type = "button";
            button.className = "export-option";
            button.dataset["format"] = one.id;
            button.setAttribute("role", "radio");
            button.setAttribute("aria-checked", String(one.id === format));
            if (one.id === format)
                button.classList.add("selected");
            const icon = window.document.createElement("i");
            icon.className = `ph ${one.icon}`;
            icon.setAttribute("aria-hidden", "true");
            const label = window.document.createElement("b");
            label.textContent = one.label;
            const detail = window.document.createElement("span");
            detail.textContent = t(one.id === "png" ? "export.pngDetail" : "export.svgDetail");
            button.append(icon, label, detail);
            button.addEventListener("click", () => {
                if (format === one.id)
                    return;
                format = one.id;
                releaseDownload();
                drawFormats();
                drawOptions();
                drawSummary();
                drawConfirm();
            });
            dom.formats.append(button);
        }
    }
    function drawConfirm() {
        const icon = window.document.createElement("i");
        icon.className = "ph ph-export";
        icon.setAttribute("aria-hidden", "true");
        dom.confirm.replaceChildren(icon, window.document.createTextNode(` ${t("export.confirm", { format: format.toUpperCase() })}`));
    }
    function drawOptions() {
        // A scale means nothing to a vector, so the row is put out of use rather
        // than left looking as though it still decides something.
        const vector = format === "svg";
        dom.resolutionRow.classList.toggle("disabled", vector);
        dom.options.setAttribute("aria-disabled", String(vector));
        dom.options.replaceChildren();
        for (const resolution of RESOLUTIONS) {
            const output = host.document() ? dimensionsFor(host.document(), resolution) : null;
            const button = window.document.createElement("button");
            button.type = "button";
            button.className = "export-option";
            button.disabled = vector;
            button.setAttribute("role", "radio");
            button.setAttribute("aria-checked", String(resolution.id === selected && !vector));
            if (resolution.id === selected && !vector)
                button.classList.add("selected");
            const icon = window.document.createElement("i");
            icon.className = `ph ${resolution.icon}`;
            icon.setAttribute("aria-hidden", "true");
            const label = window.document.createElement("b");
            label.textContent = resolution.id === "original" ? t("export.original") : resolution.id === "8k" ? t("export.resolution8k") : resolution.label;
            const detail = window.document.createElement("span");
            detail.textContent = output
                ? `${formatNumber(output.width)} × ${formatNumber(output.height)}`
                : t(resolution.id === "original" ? "export.documentSize" : `export.longEdge${resolution.id}`);
            button.append(icon, label, detail);
            button.addEventListener("click", () => {
                selected = resolution.id;
                releaseDownload();
                drawOptions();
                drawSummary();
            });
            dom.options.append(button);
        }
    }
    function open() {
        const document = host.document();
        const project = host.project();
        if (!document || !project) {
            host.say(t("export.projectRequired"), "error");
            return;
        }
        releaseDownload();
        dom.name.value = safeName(document.name ?? project);
        drawFormats();
        drawOptions();
        drawSummary();
        drawConfirm();
        dom.dialog.showModal();
    }
    dom.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const submitter = event.submitter;
        if (submitter?.value === "cancel") {
            dom.dialog.close("cancel");
            return;
        }
        if (!dom.form.reportValidity())
            return;
        const project = host.project();
        const document = host.document();
        if (!project || !document)
            return;
        const chosen = format;
        const output = chosen === "svg"
            ? { width: document.canvas.width, height: document.canvas.height, scale: 1 }
            : dimensionsFor(document, selectedResolution());
        const name = safeName(dom.name.value);
        dom.name.value = name;
        const target = downloadTargetFor(chosen, project, document, name);
        void host.guard(t("export.openButton"), async () => {
            releaseDownload();
            dom.confirm.disabled = true;
            const icon = window.document.createElement("i");
            icon.className = "ph ph-circle-notch";
            icon.setAttribute("aria-hidden", "true");
            dom.confirm.replaceChildren(icon, window.document.createTextNode(` ${t("export.rendering")}`));
            dom.summary.textContent = t("export.renderingSize", { width: formatNumber(output.width), height: formatNumber(output.height) });
            try {
                // PNG is written into the project first, because that is what every
                // other surface's export does and the file is meant to stay there.
                // SVG is read straight off the render route: nothing is written, so
                // there is nothing to leave behind.
                const result = chosen === "svg"
                    ? { width: output.width, height: output.height, bytes: 0 }
                    : await api.exportDocument(project, name, output.scale);
                const blob = await api.fetchBlob(target.url);
                heldDownload = URL.createObjectURL(blob);
                dom.download.href = heldDownload;
                dom.download.download = target.filename;
                dom.download.hidden = false;
                const bytes = chosen === "svg" ? blob.size : result.bytes;
                const dimensions = window.document.createElement("strong");
                dimensions.textContent = `${formatNumber(result.width)} × ${formatNumber(result.height)}`;
                dom.summary.replaceChildren(dimensions, window.document.createTextNode(` ${t("export.ready", { format: chosen.toUpperCase(), size: humanBytes(bytes) })}`));
                host.say(t("export.exported", { width: formatNumber(result.width), height: formatNumber(result.height), format: chosen.toUpperCase() }));
            }
            finally {
                dom.confirm.disabled = false;
                drawConfirm();
            }
        });
    });
    dom.dialog.addEventListener("close", () => {
        if (dom.dialog.returnValue === "cancel")
            releaseDownload();
    });
    window.addEventListener("assemblash:localechange", () => {
        if (!dom.dialog.open)
            return;
        drawFormats();
        drawOptions();
        if (!dom.confirm.disabled) {
            drawSummary();
            drawConfirm();
        }
    });
    return { open };
}
