import test from "node:test";
import assert from "node:assert/strict";

import { agentConfigBlocks, tomlString } from "./dist/agents.js";

const windows = {
  mcpUrl: "http://127.0.0.1:8787/mcp",
  executable: String.raw`C:\Users\Person One\Downloads\assemblash.exe`,
  workspace: String.raw`C:\Users\Person One\Assemblash`,
  tokenRequired: false,
};

test("the stdio configuration names the full executable path and the workspace", () => {
  const json = agentConfigBlocks(windows).find((block) => block.id === "json");
  assert.deepEqual(JSON.parse(json.text), {
    mcpServers: {
      assemblash: { command: windows.executable, args: ["mcp", "--workspace", windows.workspace] },
    },
  });
});

test("the Codex configuration is TOML that keeps Windows backslashes", () => {
  const codex = agentConfigBlocks(windows).find((block) => block.id === "codex");
  assert.equal(
    codex.text,
    [
      "[mcp_servers.assemblash]",
      String.raw`command = 'C:\Users\Person One\Downloads\assemblash.exe'`,
      String.raw`args = ['mcp', '--workspace', 'C:\Users\Person One\Assemblash']`,
    ].join("\n"),
  );
});

test("a path with a single quote falls back to an escaped TOML basic string", () => {
  assert.equal(tomlString("/Users/o'neil/assemblash"), '"/Users/o\'neil/assemblash"');
  assert.equal(tomlString(String.raw`C:\it's`), String.raw`"C:\\it's"`);
});

test("the URL block is the endpoint the server reported", () => {
  const url = agentConfigBlocks(windows).find((block) => block.id === "url");
  assert.equal(url.text, "http://127.0.0.1:8787/mcp");
});
