// The one way this interface talks to the engine.
//
// Every mutation goes through `POST /api/projects/{id}/operations` with an
// Operation — the same value the CLI builds and the MCP server sends. The UI
// has no second idea of what a document is, and no code path that edits one
// locally and syncs later (PRD §7.2).
import { goToLogin, withToken } from "./token.js";
/** The layers of a document, with the schema's default applied. */
export function layersOf(document) {
    return document.layers ?? [];
}
/** A document's version, with the schema's default applied. */
export function versionOf(document) {
    return document.version ?? 0;
}
/** The engine's answer when something is refused. */
export class ApiError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.details = details;
    }
}
async function request(path, init) {
    const response = await fetch(path, {
        ...init,
        headers: withToken(init?.headers),
    });
    if (response.status === 401) {
        // The token is missing, wrong, or the server was restarted with a new
        // one. Asking again is the only thing that helps, and continuing would
        // leave every control broken with no explanation.
        goToLogin();
        throw new ApiError("unauthorized", "this server needs an access token", null);
    }
    if (!response.ok) {
        // Every failure comes back in one envelope with a stable code, so this is
        // the only place that has to know what a refusal looks like.
        let code = `http${response.status}`;
        let message = response.statusText;
        let details = null;
        try {
            const body = await response.json();
            if (body?.error) {
                code = body.error.code ?? code;
                message = body.error.message ?? message;
                details = body.error.details ?? null;
            }
        }
        catch {
            // A response that is not the envelope is still a failure; keep the
            // status as the code rather than inventing one.
        }
        throw new ApiError(code, message, details);
    }
    if (response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
export async function listProjects() {
    const body = await request("/api/projects");
    return body.projects;
}
export async function createProject(id, width, height, background, name) {
    return request("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, width, height, background, name }),
    });
}
export async function getDocument(project) {
    return request(`/api/projects/${encodeURIComponent(project)}/document`);
}
export async function getHistory(project) {
    return request(`/api/projects/${encodeURIComponent(project)}/history`);
}
export async function validate(project) {
    return request(`/api/projects/${encodeURIComponent(project)}/validate`);
}
/**
 * Applies one operation.
 *
 * `expectedVersion` is the version the UI last read. Passing it is how two
 * people — or a person and an agent — editing the same project get a
 * structured refusal instead of one silently overwriting the other.
 */
export async function applyOperation(project, operation, expectedVersion, dryRun = false) {
    return request(`/api/projects/${encodeURIComponent(project)}/operations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            operation,
            expectedVersion,
            dryRun,
            actor: { kind: "human", name: "reference UI" },
        }),
    });
}
export async function undo(project) {
    return request(`/api/projects/${encodeURIComponent(project)}/undo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } }),
    });
}
export async function redo(project) {
    return request(`/api/projects/${encodeURIComponent(project)}/redo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ actor: { kind: "human", name: "reference UI" } }),
    });
}
export async function exportDocument(project, name, scale) {
    return request(`/api/projects/${encodeURIComponent(project)}/export`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, scale }),
    });
}
/**
 * Asks the server to stop.
 *
 * Refused unless this server was started for a person — a service manager or a
 * container owns its own lifetime. The button is only offered once this has
 * been shown to work, so nobody is presented with a control that cannot do
 * anything.
 */
export async function shutdown() {
    await request("/api/shutdown", { method: "POST" });
}
export async function serverInfo() {
    return request("/api/version");
}
/**
 * Uploads a file into a project's assets.
 *
 * The client's filename contributes only its extension; the stored name is
 * the content hash, so nothing a person types becomes a path.
 */
export async function uploadAsset(project, file) {
    const response = await fetch(`/api/projects/${encodeURIComponent(project)}/assets?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: withToken({ "content-type": file.type || "application/octet-stream" }),
        body: file,
    });
    if (response.status === 401) {
        goToLogin();
        throw new ApiError("unauthorized", "this server needs an access token", null);
    }
    if (!response.ok) {
        let code = `http${response.status}`;
        let message = response.statusText;
        try {
            const body = await response.json();
            code = body?.error?.code ?? code;
            message = body?.error?.message ?? message;
        }
        catch {
            // Not the envelope; the status still says enough.
        }
        throw new ApiError(code, message, null);
    }
    return (await response.json());
}
/**
 * The blend modes this build renders.
 *
 * Listed here so the inspector cannot offer one the engine would refuse. A
 * document may still carry a mode written by a newer build; that is shown as
 * itself rather than replaced.
 */
export const BLEND_MODES = [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
];
/** The effect types this build renders. */
export const EFFECT_TYPES = [
    "brightness",
    "contrast",
    "saturation",
    "blur",
    "grain",
];
/** The one number worth editing for an effect, and what it is called. */
export function effectParameter(effect) {
    const named = (name) => {
        const value = effect[name];
        return typeof value === "number" ? { name, value } : null;
    };
    switch (effect.type) {
        case "brightness":
        case "contrast":
        case "saturation":
        case "grain":
            return named("amount");
        case "blur":
            return named("radius");
        default:
            // An effect this build does not know is shown but not edited: changing
            // a number in something we cannot draw would be guessing.
            return null;
    }
}
/**
 * A new effect of the given type, at its neutral value.
 *
 * Neutral rather than "a nice default": adding an effect should change
 * nothing until a number is typed, so the picture never moves under someone
 * who was only exploring the menu. Grain's seed is fixed rather than random
 * for the same reason the engine takes one at all — the same document must
 * produce the same noise.
 */
export function newEffect(type) {
    switch (type) {
        case "blur":
            return { type: "blur", radius: 0 };
        case "grain":
            return { type: "grain", amount: 0, seed: 1, scale: 1 };
        default:
            return { type, amount: 1 };
    }
}
export async function getSlots(project) {
    return request(`/api/projects/${encodeURIComponent(project)}/slots`);
}
/**
 * Renders a template once per set of values.
 *
 * The same endpoint the CLI's `assemblash variants` reaches through the same
 * function, so a batch made here and a batch made there produce the same
 * bytes — and therefore the same hashes — for the same values. The template
 * is not modified: each variant is filled on a copy.
 */
export async function renderVariants(project, variants, scale = 1) {
    return request(`/api/projects/${encodeURIComponent(project)}/variants`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ variants, scale }),
    });
}
/**
 * Where a PNG the engine exported can be read back.
 *
 * A file name, never a path: the server validates the stem with the same rule
 * that produced it, so this cannot address anything the engine did not write.
 */
export function exportUrl(project, name) {
    return `/api/projects/${encodeURIComponent(project)}/exports/${encodeURIComponent(name)}.png`;
}
export async function fonts() {
    const body = await request("/api/fonts");
    return body.families;
}
/**
 * The engine's vector render, for downloading.
 *
 * Not what the canvas shows: a browser would re-render this with its own
 * fonts rather than the pinned files in the font store, and the preview would
 * then differ from the export precisely where determinism matters. The canvas
 * shows the rasterized render; this is here because an SVG is a useful thing
 * to be able to take away.
 */
export function svgUrl(project, version) {
    return `/api/projects/${encodeURIComponent(project)}/preview.svg?v=${version}`;
}
/**
 * Fetches an image as a blob URL, carrying the token.
 *
 * An `<img src>` cannot send a header, and putting the token in the query
 * string is exactly what "never in a URL" rules out — it would land in
 * history, in referrers, and in any proxy log on the way. So the bytes are
 * fetched properly and handed to the element as a blob.
 */
export async function imageObjectUrl(url) {
    const response = await fetch(url, { headers: withToken() });
    if (response.status === 401) {
        goToLogin();
        throw new ApiError("unauthorized", "this server needs an access token", null);
    }
    if (!response.ok) {
        throw new ApiError(`http${response.status}`, response.statusText, null);
    }
    return URL.createObjectURL(await response.blob());
}
/**
 * Where the rendered PNG lives.
 *
 * This is what the canvas shows, and it is byte-for-byte what `export` writes
 * at the same scale — the preview and the export cannot disagree because they
 * are the same render (PRD §16.3, R3).
 */
export function pngUrl(project, version, scale = 1) {
    return `/api/projects/${encodeURIComponent(project)}/preview.png?scale=${scale}&v=${version}`;
}
/** Every layer, flattened, with the group each one sits in. */
export function flatten(layers, parent = null, depth = 0, out = []) {
    for (const layer of layers) {
        out.push({ layer, parent, depth });
        if (layer.type === "group") {
            flatten(layer.children ?? [], layer.id, depth + 1, out);
        }
    }
    return out;
}
/** Whether the engine will refuse to change this layer. */
export function isEditable(layer) {
    return !layer.protected && !layer.readOnly && !layer.locked;
}
/** Why it is not editable, for saying so rather than just greying it out. */
export function whyNotEditable(layer) {
    if (layer.protected)
        return "protected — no tool can change this layer";
    if (layer.readOnly)
        return "read-only — inspectable but never mutable";
    if (layer.locked)
        return "locked — unlock it to make changes";
    return null;
}
