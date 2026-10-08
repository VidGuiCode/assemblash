import { t } from "./i18n.js";
import type { AgentAccess } from "./api.js";

/** One copy-ready agent configuration block. */
export interface AgentConfigBlock {
  id: "url" | "json" | "codex";
  title: string;
  hint: string;
  text: string;
}

/**
 * Encode one TOML string.
 *
 * A literal string keeps Windows backslashes. A path with a single quote uses
 * a basic string with JSON-compatible escapes.
 */
export function tomlString(value: string): string {
  if (!value.includes("'") && !/[\r\n]/.test(value)) return `'${value}'`;
  return JSON.stringify(value);
}

/** Return the three configurations in the order shown in the dialog. */
export function agentConfigBlocks(access: AgentAccess): AgentConfigBlock[] {
  const args = ["mcp", "--workspace", access.workspace];
  const json = JSON.stringify(
    { mcpServers: { assemblash: { command: access.executable, args } } },
    null,
    2,
  );
  const codex = [
    "[mcp_servers.assemblash]",
    `command = ${tomlString(access.executable)}`,
    `args = [${args.map(tomlString).join(", ")}]`,
  ].join("\n");
  return [
    { id: "json", title: t("agents.jsonTitle"), hint: t("agents.jsonHint"), text: json },
    { id: "codex", title: t("agents.codexTitle"), hint: t("agents.codexHint"), text: codex },
    { id: "url", title: t("agents.urlTitle"), hint: t("agents.urlHint"), text: access.mcpUrl },
  ];
}
