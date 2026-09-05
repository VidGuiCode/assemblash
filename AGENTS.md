# Agent instructions

For AI coding agents working in this repository. Human contributors: see
[CONTRIBUTING.md](CONTRIBUTING.md).

This file follows the `AGENTS.md` convention and is read by most agent tools.
If your tool reads a different filename, point that file here rather than
copying these rules.

## Read first

[PRD.md](PRD.md) is the source of truth for what this project is and what it
refuses to become — scope, requirements, safety model, and the phase plan.
[CONTRIBUTING.md](CONTRIBUTING.md) covers how changes are proposed and reviewed.

Both apply to you. This file only adds what is specific to agents and stated
nowhere else.

The project is **released at 1.4.0** and implemented: a Rust workspace of five
crates, a reference interface in `ui/`, and released binaries for six targets.
`1.0.0` established the document schema and operation API stability promise, so
a change that breaks either is a MAJOR release and needs a migration — say so
rather than making one quietly.

## Where working notes go

Handoffs, roadmaps, goals, decision drafts, and research notes belong in
**`.ai/`**, which is gitignored and local to each working copy — it is never
part of this repository, so you will not find it on GitHub. In a working copy
that has one, `.ai/README.md` documents the layout.

- **Do not create plans, notes, or session summaries at the repository root.**
- Read `.ai/handoffs/` (most recent first) and `.ai/goals/` when starting.
- Write a handoff at the end of a substantial session using
  `.ai/handoffs/TEMPLATE.md`.
- Never cite or quote `.ai/` content in commit messages, issues, pull requests,
  or any committed file — it does not exist for anyone else.

If `.ai/` is absent in your checkout, create it (a `README.md` describing the
subfolders, plus `handoffs/`, `goals/`, `decisions/`, `roadmap/`, `skills/`,
`research/`, `notes/`, `scratch/`); it is intentionally untracked.

## Rules

- **Do not claim unimplemented features work.** Do not add capabilities to the
  README until they exist and you have run them. This applies to your own
  summaries: report what you actually executed, and say plainly what you
  skipped.
- **Do not resolve an open decision as a side effect.** [PRD §16](PRD.md) lists
  which decisions are still open (resolved ones are marked there, with the
  rationale in §16.1 — the stack is Rust). Draft options for open ones in
  `.ai/decisions/` and let the maintainer choose.
- **Do not run `git init`, create remotes, commit, or push unless asked.**
- **Check changes against the PRD invariants** before proposing them —
  one operation layer, determinism, reversibility, protected layers, the
  filesystem boundary, and offline operation. If a change breaks one, say so
  instead of working around it.
- **Cross-platform.** Development targets Windows and Linux (NFR-2). No
  hardcoded path separators or shell assumptions.

## Environment note

This working copy lives inside a Nextcloud-synced folder. If you see
`* (conflicted copy *)` files, flag them; never commit them.
