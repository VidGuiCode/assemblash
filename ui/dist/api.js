// The one way this interface talks to the engine.
//
// Every mutation goes through `POST /api/projects/{id}/operations` with an
// Operation — the same value the CLI builds and the MCP server sends. The UI
// has no second idea of what a document is, and no code path that edits one
// locally and syncs later (PRD §7.2).
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
    const response = await fetch(path, init);
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
