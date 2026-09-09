// Managing the font store from the page (DEF-15, decision D22 b).
//
// Until this panel existed the interface could report that a document needed
// a font and then send the person to a terminal to install one — a browser
// telling you to go and use the command line for the one thing it had just
// stopped you doing. The engine already imports, removes, and installs fonts
// over HTTP; this is the surface for it, and nothing here knows what a font
// file is: the extension list is the server's, the refusals are the server's
// words, and the only thing the page decides is what to ask before removing
// something a project may be drawing with.
//
// Its own module for the same reason `templates.ts` is: `app.ts` is already
// the largest file in the interface and this is a self-contained concern.
import * as api from "./api.js";
function el(id) {
    const found = window.document.getElementById(id);
    if (!found)
        throw new Error(`missing element #${id}`);
    return found;
}
/** "a", "a and b", "a, b and c" — a list a sentence can contain. */
function sentenceList(names) {
    if (names.length <= 1)
        return names[0] ?? "";
    return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
/** Bytes as the megabytes a person would say, never rounded down to nothing. */
function megabytes(bytes) {
    const mb = bytes / (1024 * 1024);
    if (mb >= 10)
        return `${Math.round(mb)} MB`;
    return `${Math.max(0.1, Math.round(mb * 10) / 10)} MB`;
}
export function mountFonts(host) {
    const dom = {
        list: el("font-list"),
        empty: el("font-empty"),
        install: el("install-default"),
        installLabel: el("install-default-label"),
        installDetail: el("install-default-detail"),
        importButton: el("import-font"),
        file: el("font-file"),
        feedback: el("font-feedback"),
    };
    /** Families the store had when it was last read. */
    let families = [];
    /** The catalogue, read once: it is a compiled-in manifest, not a download. */
    let catalogue = null;
    /** Adds one line to the live region, which is per-file rather than shared. */
    function note(line) {
        const item = window.document.createElement("p");
        item.textContent = line;
        dom.feedback.append(item);
    }
    /** Re-renders the canvas when the store changed under an open project. */
    async function redrawProject() {
        // The server has already dropped its font cache; asking for the document
        // again is what re-requests the render with the store as it now is.
        if (host.project())
            await host.refresh();
    }
    function drawList(faces) {
        dom.list.replaceChildren();
        for (const family of families) {
            const mine = faces.filter((face) => face.family === family);
            const item = window.document.createElement("li");
            item.className = "font-family";
            item.dataset["family"] = family;
            const text = window.document.createElement("div");
            text.className = "font-family-text";
            const name = window.document.createElement("strong");
            name.textContent = family;
            const faceCount = window.document.createElement("span");
            faceCount.className = "font-faces";
            // Weight and style are what distinguishes two files of one family, and
            // they are what a document names; the stored file names would tell a
            // person reading this list nothing.
            const described = mine.map((face) => `${face.style} ${face.weight}`).join(", ");
            faceCount.textContent = mine.length === 1
                ? `1 face · ${described}`
                : `${mine.length} faces · ${described}`;
            text.append(name, faceCount);
            const remove = window.document.createElement("button");
            remove.type = "button";
            remove.className = "small danger-action";
            remove.dataset["removeFamily"] = family;
            remove.textContent = "Remove";
            remove.setAttribute("aria-label", `Remove ${family}`);
            item.append(text, remove);
            dom.list.append(item);
        }
    }
    /**
     * Says what the install button would fetch, before it fetches anything.
     *
     * The catalogue is the server's own compiled-in manifest — reading it
     * touches no network. The download happens on the click and nowhere else,
     * which is the whole reason the button can say what it will do first.
     */
    async function describeDefaultPack() {
        try {
            if (!catalogue)
                catalogue = await api.fontCatalogue();
            const pack = catalogue.packs["default"] ?? [];
            const bytes = catalogue.families
                .filter((entry) => pack.includes(entry.family))
                .reduce((total, entry) => total + entry.bytes, 0);
            dom.installDetail.textContent = pack.length
                ? `${sentenceList(pack)} — about ${megabytes(bytes)}, downloaded from the internet once, when you click.`
                : "This build has no default pack in its manifest.";
            dom.install.disabled = pack.length === 0;
        }
        catch (error) {
            // The button still works; only its description is missing, and saying
            // so is better than a label that quietly claims nothing.
            dom.installDetail.textContent = error instanceof api.ApiError
                ? `The pack could not be described: ${error.message} (${error.code})`
                : "The pack could not be described.";
        }
    }
    async function reload() {
        const store = await api.fontFaces();
        families = [...store.families];
        host.familiesChanged(families);
        drawList(store.faces);
        const empty = families.length === 0;
        dom.empty.hidden = !empty;
        dom.list.hidden = empty;
        if (empty)
            await describeDefaultPack();
    }
    dom.install.addEventListener("click", () => {
        void host.guard("install fonts", async () => {
            const label = dom.installLabel.textContent ?? "Install the default font pack";
            dom.install.disabled = true;
            dom.installLabel.textContent = "Installing the default font pack…";
            host.say("downloading the default font pack — this is the only time Assemblash uses the network");
            try {
                const result = await api.installFontPack("default");
                await reload();
                await redrawProject();
                host.say(`installed ${sentenceList(result.families)}`);
            }
            finally {
                // Left enabled after a refusal: a failed install leaves the store
                // exactly as it was, so trying again is an ordinary thing to do.
                dom.install.disabled = false;
                dom.installLabel.textContent = label;
            }
        });
    });
    dom.importButton.addEventListener("click", () => dom.file.click());
    dom.file.addEventListener("change", () => {
        const chosen = [...(dom.file.files ?? [])];
        // Cleared first: choosing the same file twice must still fire `change`.
        dom.file.value = "";
        if (!chosen.length)
            return;
        void host.guard("import font", async () => {
            dom.feedback.replaceChildren();
            let added = 0;
            for (const file of chosen) {
                try {
                    const result = await api.importFont(file);
                    added += 1;
                    const imported = [...new Set(result.imported.map((record) => record.family))];
                    note(imported.length ? `${file.name} → ${sentenceList(imported)}` : `${file.name} imported`);
                }
                catch (error) {
                    // One refused file does not end the batch, and it is reported in
                    // the engine's own words rather than as "something went wrong".
                    note(error instanceof api.ApiError
                        ? `${file.name}: ${error.message} (${error.code})`
                        : `${file.name}: ${String(error)}`);
                }
            }
            await reload();
            if (added)
                await redrawProject();
            const refused = chosen.length - added;
            if (added) {
                host.say(`imported ${added} font file${added === 1 ? "" : "s"}${refused ? `, ${refused} refused` : ""}`);
            }
            else {
                host.say(`no fonts imported — ${refused} file${refused === 1 ? "" : "s"} refused`, "error");
            }
        });
    });
    dom.list.addEventListener("click", (event) => {
        const button = event.target.closest("[data-remove-family]");
        const family = button?.dataset["removeFamily"];
        if (!family)
            return;
        // Removing a font is not removing a picture: a document that names this
        // family stops rendering until somebody puts the file back, and that has
        // to be said before it happens rather than discovered afterwards.
        const confirmed = window.confirm(`Remove ${family} from the font store?\n\n` +
            `Projects that use ${family} will fail to render with a missing-font error ` +
            `until it is imported again.`);
        if (!confirmed)
            return;
        void host.guard(`remove ${family}`, async () => {
            dom.feedback.replaceChildren();
            const result = await api.removeFontFamily(family);
            note(`${family} removed (${result.removed} file${result.removed === 1 ? "" : "s"})`);
            await reload();
            await redrawProject();
            host.say(`${family} removed from the font store`);
        });
    });
    return {
        reload,
        focusInstall() {
            if (!dom.empty.hidden)
                dom.install.focus();
        },
        hasFamilies() {
            return families.length > 0;
        },
    };
}
