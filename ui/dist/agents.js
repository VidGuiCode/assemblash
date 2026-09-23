// "Connect an AI agent": copy-ready configuration for the MCP endpoint.
//
// The editor hosts MCP in its own process, so an agent works on the same open
// projects as the person, with one lock and one writer. What was missing was a
// way to find out how to connect. This dialog shows it, filled with the real
// executable path and the real URL, so nobody looks for a path in a file
// manager.
import * as api from "./api.js";
import { t } from "./i18n.js";
/**
 * A TOML string for a path.
 *
 * A literal string (single quotes) keeps Windows backslashes as they are. A
 * path that itself contains a single quote falls back to a basic string,
 * whose escapes match JSON's for everything a path can hold.
 */
export function tomlString(value) {
    if (!value.includes("'") && !/[\r\n]/.test(value))
        return `'${value}'`;
    return JSON.stringify(value);
}
/** The three configurations, in the order the dialog shows them. */
export function agentConfigBlocks(access) {
    const args = ["mcp", "--workspace", access.workspace];
    const json = JSON.stringify({ mcpServers: { assemblash: { command: access.executable, args } } }, null, 2);
    const codex = [
        "[mcp_servers.assemblash]",
        `command = ${tomlString(access.executable)}`,
        `args = [${args.map(tomlString).join(", ")}]`,
    ].join("\n");
    return [
        {
            id: "json",
            title: t("agents.jsonTitle"),
            hint: t("agents.jsonHint"),
            text: json,
        },
        {
            id: "codex",
            title: t("agents.codexTitle"),
            hint: t("agents.codexHint"),
            text: codex,
        },
        {
            id: "url",
            title: t("agents.urlTitle"),
            hint: t("agents.urlHint"),
            text: access.mcpUrl,
        },
    ];
}
/** Copies text, with a fallback for pages that are not a secure context. */
async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    if (!copied)
        throw new Error(t("agents.copyRefused"));
}
function el(id) {
    const found = document.getElementById(id);
    if (!found)
        throw new Error(`missing element #${id}`);
    return found;
}
/** Where the first-run hint remembers that it was shown. */
const HINT_KEY = "assemblash-agent-hint-v1";
export function mountAgents(host) {
    const dom = {
        dialog: el("agents-dialog"),
        blocks: el("agents-blocks"),
        token: el("agents-token"),
    };
    let lastAccess = null;
    function draw(access) {
        lastAccess = access;
        dom.token.hidden = !access.tokenRequired;
        dom.blocks.replaceChildren();
        for (const block of agentConfigBlocks(access)) {
            const section = document.createElement("section");
            section.className = "agent-block";
            section.dataset["block"] = block.id;
            const heading = document.createElement("div");
            heading.className = "agent-block-heading";
            const title = document.createElement("h3");
            title.textContent = block.title;
            const copy = document.createElement("button");
            copy.type = "button";
            copy.className = "button button-quiet agent-copy";
            const icon = document.createElement("i");
            icon.className = "ph ph-copy";
            icon.setAttribute("aria-hidden", "true");
            const label = document.createElement("span");
            label.textContent = t("agents.copyButton");
            copy.replaceChildren(icon, label);
            copy.addEventListener("click", () => {
                copyText(block.text).then(() => host.say(t("agents.copied", { title: block.title })), (error) => host.say(t("agents.copyError", { error: String(error) }), "error"));
            });
            heading.append(title, copy);
            const hint = document.createElement("p");
            hint.className = "agent-block-hint";
            hint.textContent = block.hint;
            // Text content only: nothing from the server is read as markup.
            const pre = document.createElement("pre");
            const code = document.createElement("code");
            code.textContent = block.text;
            pre.append(code);
            section.append(heading, hint, pre);
            dom.blocks.append(section);
        }
    }
    async function open() {
        try {
            draw(await api.agentAccess());
        }
        catch (error) {
            const message = error instanceof api.ApiError ? error.message : String(error);
            host.say(t("agents.openError", { error: message }), "error");
            return;
        }
        if (!dom.dialog.open)
            dom.dialog.showModal();
    }
    /** Opens the dialog once, on the first run of an empty workspace. */
    function offerOnFirstRun() {
        let shown = false;
        try {
            shown = window.localStorage.getItem(HINT_KEY) !== null;
            window.localStorage.setItem(HINT_KEY, "shown");
        }
        catch {
            // No storage: offer it, and accept that it may be offered again.
        }
        if (!shown)
            void open();
    }
    window.addEventListener("assemblash:localechange", () => {
        if (dom.dialog.open && lastAccess)
            draw(lastAccess);
    });
    return { open, offerOnFirstRun };
}
