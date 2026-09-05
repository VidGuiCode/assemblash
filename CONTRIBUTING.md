# Contributing to Assemblash

Thanks for your interest. Assemblash is a local-first, headless visual document
engine for humans and AI agents. This document explains what the project wants
from contributions and how to propose one.

Please also read the [Code of Conduct](CODE_OF_CONDUCT.md).

## Project status

**Released at 1.4.0.** The engine is implemented and released for six targets;
see [README.md](README.md) for what exists and [PRD.md](PRD.md) for what it is
meant to be.

`1.0.0` makes the document schema (`schemaVersion` 1) and the operation API
stable. A change that breaks either is a MAJOR release and ships a migration —
so a pull request that changes the shape of an existing operation, or of a
document field, needs to say so and argue for it rather than slipping it in.
Additive fields with defaults are the ordinary way to extend both.

## The one question to ask first

> Does this belong in the generic engine, or in a downstream adapter?

Assemblash is deliberately small (PRD §4, "Non-goals"). Product-specific
behavior, brand rules, templates, and private workflows belong in adapters or
downstream applications, not in the core.

## What contributions should prioritize

- small, composable features;
- stable document semantics;
- tests for every document operation;
- reproducible exports;
- explicit security boundaries;
- provider-neutral integrations;
- documentation and examples.

## Ground rules that come from the PRD

These are not style preferences — they are product requirements:

- **One operation layer** (PRD §7.2). The UI, CLI, API, and MCP server must call
  the same validated operations. Do not add a second implementation of document
  logic in an adapter or in the MCP server.
- **Determinism is a feature** (PRD §7.5). If an operation can be deterministic,
  it must be. Provider-dependent operations must record provider, parameters,
  and seed.
- **AI stays optional** (PRD FR-15). The core must never require an AI provider,
  a cloud account, or network access.
- **Protected content is respected** (PRD §10.2). `locked`, `protected`, and
  `readOnly` layers must not be mutated by normal operations or AI adapters.
- **No private content in this repository** (PRD §7.6, R5). Never commit brand
  kits, customer assets, credentials, or downstream business logic. Use neutral
  fixtures and example assets.
- **Every mutation is reversible** (PRD FR-8), including MCP-triggered writes.

## Proposing a change

1. **Open an issue first** for anything beyond a typo or a docs fix — especially
   for schema changes, new layer types, new MCP tools, or new dependencies.
2. **Discuss scope.** Say explicitly whether the change belongs in the core or
   in an adapter, and which PRD requirement it serves.
3. **Keep pull requests small and single-purpose.** A PR that changes the
   document schema and adds a renderer feature and adds an MCP tool is three
   PRs.

## Changes that need extra scrutiny

Expect a slower review, and please open an issue before writing code:

- **Document schema changes.** These affect persistence, migration, every
  renderer, and every downstream consumer. Include the schema version bump and
  the migration path.
- **New dependencies.** Record the license before proposing it (PRD R8). A
  dependency is not accepted because its demo looks good — license terms,
  serialization behavior, export reliability, testability, and agent access
  matter more (PRD §14).
- **New MCP tools.** Read-only before mutating. Mutating tools need dry-run,
  expected-version checks, protected-layer checks, and an undo transaction ID
  (PRD FR-13).
- **Anything touching the filesystem boundary.** MCP tools must stay inside the
  configured project root (PRD §10.1).

## Testing expectations

Tests must run without a live cloud provider or paid API (PRD NFR-5).

Coverage is expected for: document validation, layer and group operations,
transforms, ordering, protected-layer behavior, serialization and migration,
operation history, rendering, export, and MCP tool schemas (PRD §17).

The end-to-end smoke test must create a document, add text and image layers,
save it, reload it, request a preview, apply one MCP mutation, undo it, and
export a PNG. **No release may be described as working until that smoke test has
run successfully on both Windows and Linux.**

## Documentation expectations

Every public operation, document field, MCP tool, and extension point needs
documentation and an example (PRD NFR-7).

Do not document a capability as supported until it is implemented and verified.
The README's claims are held to the same rule.

## Versioning

Releases follow [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).
The document `schemaVersion` is an independent integer: a schema change always
increments it and must ship with a migration path, regardless of the release
version. If your change touches the document schema, say so in the PR and
include the migration. See PRD §16.1 for the full policy.

## Commit and PR conventions

- Write commit messages in the imperative mood: "add group transform
  validation", not "added" or "adds".
- Reference the issue and the relevant PRD requirement where one applies
  (for example, `FR-7`, `NFR-3`).
- Note explicitly in the PR description if the change alters the document
  schema, the public API surface, or MCP tool behavior.

## Licensing of contributions

Assemblash is licensed under the [Apache License 2.0](LICENSE). By submitting a
contribution, you agree that it is licensed under the same terms (Apache-2.0
§5). Do not submit code you do not have the right to license this way.

## Security issues

Do not open a public issue for a vulnerability. Follow [SECURITY.md](SECURITY.md).
