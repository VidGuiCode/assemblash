# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

The document schema version is tracked separately from the release version; a
schema change is always noted explicitly.

## [Unreleased]

### Added

- Product definition: `README.md` and `PRD.md`.
- Apache-2.0 license, contribution guidelines, code of conduct, and security policy.
- Repository hygiene: `.gitignore`, `.gitattributes`, `.editorconfig`, issue and
  pull request templates.

### Decided

- License: Apache-2.0 (PRD decision 16.11).
- Versioning: SemVer releases with an independent integer document
  `schemaVersion` (PRD decision 16.13).
- Implementation stack: Rust single-binary engine; SVG-first rendering via
  `resvg`/`tiny-skia`; embedded-then-HTTP API; MCP over stdio
  (PRD decisions 16.1, 16.2, 16.5, 16.6 — full rationale in PRD §16.1).

### Notes

- No implementation yet. Nothing here is usable software.
- Implementation begins with the Phase 0 vertical slice (PRD §13).
