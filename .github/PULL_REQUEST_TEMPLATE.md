# Summary

<!-- What changes, and why. Link the issue: Closes #123 -->

**Related PRD requirement:** <!-- e.g. FR-7, NFR-3, or "docs only" -->

## Type of change

- [ ] Documentation
- [ ] Core document model / operations
- [ ] Renderer or export
- [ ] Local API
- [ ] MCP server
- [ ] Reference UI
- [ ] Adapter
- [ ] Build / repository tooling

## Scope check

- [ ] This belongs in the generic engine, not in a downstream adapter — or it is
      an adapter change.
- [ ] It does not expand the project toward the non-goals in PRD §4.

## Impact

- [ ] **Document schema changed** — version bumped and migration path described below.
- [ ] **Public API surface changed** — documented below.
- [ ] **MCP tool behavior changed** — tool schemas updated.
- [ ] **New dependency added** — name and license listed below.
- [ ] None of the above.

<!-- Describe any checked item here. -->

## Project invariants

- [ ] The UI/CLI/API/MCP paths still call one shared operation layer (no duplicated document logic).
- [ ] Mutations remain validated and reversible.
- [ ] `locked` / `protected` / `readOnly` layers are still respected.
- [ ] Filesystem access stays inside the configured project root.
- [ ] The core still works offline, with no AI provider and no cloud account.
- [ ] Output is still deterministic, or the non-determinism is recorded with its parameters.

## Testing

<!-- What you ran, and on which OS. Tests must pass without a paid or cloud provider. -->

- [ ] Tests added or updated for this change.
- [ ] Verified on Linux
- [ ] Verified on Windows
- [ ] End-to-end smoke test run (create → layers → save → reload → preview → MCP mutation → undo → PNG export)

## Content check

- [ ] No credentials, brand kits, customer assets, or private downstream logic in this PR.
- [ ] No capability is documented as working unless it is implemented and verified.
