---
name: assemblash
description: Create, inspect, edit, validate, render, or export Assemblash visual-document projects through its CLI, HTTP API, or MCP server. Use for work on an Assemblash document or integration; not for unrelated repository maintenance.
---

# Assemblash

Assemblash is a local-first, structured visual-document engine. Treat a
document as an editable layer tree, not as a flattened image or a graphical
interface to click through. The CLI, HTTP API, MCP server, and reference editor
are clients of the same validated operation layer.

## Start with the current state

When working in the Assemblash repository, read `README.md` for released
behavior. Read `PRD.md`, `AGENTS.md`, and `CONTRIBUTING.md` before changing the
engine or its public surfaces. The committed schemas are the precise contracts:

- `schema/document.schema.json`
- `schema/operation.schema.json`

Inspect the target project, layer tree, document version, validation result,
and rendered preview before proposing an edit. Use explicit layer IDs.
Selection belongs to the client session and is not document state.

## Make changes safely

Prefer MCP, the HTTP API, or the CLI over editing `document.json` directly.
Those interfaces validate mutations, enforce locks and protection, journal
history, and support undo. A normal edit follows this sequence:

1. Read the document, layers, version, and preview.
2. Identify the exact layer IDs and intended operation.
3. Dry-run the mutation when the interface supports it, using the current
   expected document version.
4. Apply the validated operation and retain its transaction ID when available.
5. Validate and render a fresh preview. Export only after checking the result.

Do not bypass a refusal by editing files or attempting to clear protected
content. If another actor changed the document, refresh the state instead of
reusing a stale expected version.

## Preserve the engine's guarantees

- Keep filesystem work inside the configured project or workspace boundary.
- Respect `locked`, `protected`, and `readOnly` layers, including group
  containment.
- Keep compositions deterministic. Use known local assets and the configured
  font store; report a missing font or asset instead of substituting one.
- Treat templates, presets, and slots as journalled operations. A slot must not
  target protected or read-only chrome.
- Do not add behavior that exists only in the reference editor or duplicates
  the core operation logic.
- Do not imply that AI provider adapters ship with the core. They do not.

## Contract and release discipline

The document schema and operation API are stable throughout 1.x. A breaking
change requires a major release and a migration. Additive changes still need
schema and type generation, validation, compatibility tests, and documentation.

Do not report a feature as working until you have run the relevant validation
or test. Keep public examples neutral: never commit credentials, private brand
kits, customer assets, or downstream workflow data.

## Useful entry points

- `assemblash new`, `add-text`, `add-image`, `add-svg`, and `export` for a
  straightforward local workflow.
- `assemblash serve` for the local HTTP API and reference editor. It binds to
  loopback by default; a non-loopback bind requires an access token.
- `assemblash mcp` for agent access over stdio. Inspect, preview, and validate
  before using mutating tools.
- `assemblash variants` for deterministic template variants.

For exact arguments, payloads, and supported properties, use
`assemblash --help` and the committed schemas instead of guessing.
