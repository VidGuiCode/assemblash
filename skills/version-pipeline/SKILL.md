---
name: version-pipeline
description: Release an Assemblash version. One branch for each version, one pull request to main, one tag after a green merge. Use when you start a version, prepare its release documentation, merge it, or publish it. Do not use it for document work or product usage.
---

# Assemblash version pipeline

This skill is for work on the repository. For document work, use the
`assemblash` skill.

## Invariants

1. `main` holds released code only. `main` is green.
2. No commit reaches `main` without a pull request.
3. One version is in work at one time.
4. The version number and the release documentation change in one commit, on
   the version branch.
5. A failed check gets one re-run. A second failure is a defect.

## Branch names

Use one form for work that ships:

```text
release/X.Y.Z-<description>
```

- Put the version that will ship the work in the name. A capability ships in a
  MINOR version: `release/1.14.0-page-sets`. A defect fix ships in a PATCH
  version: `release/1.13.1-arm-lock-race`.
- Use lowercase letters, digits, and hyphens.
- Keep one `release/` branch for each version. That branch gets the tag.
- Delete the branch after its tag exists.
- Never start a branch with a tool or agent name.
- Use `chore/<description>` for repository work that ships with no version.
- Use `spike/<description>` for an experiment. Never merge a spike branch.
## Stage 0 — orient and rule

- Read the rung in `.ai/roadmap/v1.x-plan.md`.
- List the open decisions that the rung names.
- Ask the maintainer for a ruling. Do not decide for the maintainer.
- Write `.ai/roadmap/vX.Y.Z-plan.md` before the first code commit.

Stop until every named decision has a ruling.

## Stage 1 — open the branch

```sh
git fetch origin
git status --short --branch
git switch -c release/X.Y.Z-<description> origin/main
```

Requirements:

- local `main` equals `origin/main`;
- the tracked tree is clean;
- no `* (conflicted copy *)` file exists.

## Stage 2 — build

- One plan step for each commit group.
- Each commit builds, and the tests for that step pass.
- Write the test with the capability. Do not add the test later.

## Stage 3 — self-review

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo deny check
cargo test --workspace
```

Then read the full diff once, cold. Check these points:

- Regenerate every schema artifact after a schema change.
- Add each new UI string to `locale-en.ts`, `locale-fr.ts`, and `locale-de.ts`.
- Keep the README claim true only for a capability that you ran.

## Stage 4 — version and release documentation

Do this in one commit on the version branch:

- Bump the version in `Cargo.toml` (workspace and its five dependency pins).
- Bump `Cargo.lock`, `ui/package.json`, `ui/package-lock.json`, and
  `packaging/homebrew/assemblash.rb`.
- Update the version asserts in `.github/workflows/ci.yml` and in
  `scripts/resize_browser.mjs`.
- Move the `[Unreleased]` changelog items into a new version section. Name the
  oldest build that opens a document with each new capability.
- Update every current-release claim: `README.md`, `AGENTS.md`, `CLAUDE.md`,
  `CONTRIBUTING.md`, `PRD.md`, `SECURITY.md`,
  `skills/assemblash/SKILL.md`, and `.github/ISSUE_TEMPLATE/bug_report.yml`.

Then search the tree for the previous version string. Change every current
claim. Leave historical entries alone.

## Stage 5 — pull request

- Title: `Release X.Y.Z — <theme>`.
- Body: the rung, the exit test you ran, the evidence, and the decision ids.
- One pull request holds the whole version: code, tests, documentation, and the
  bump. Do not open a second "release documentation" pull request.
- Confirm that the required checks are configured in branch protection.

## Stage 6 — CI acceptance

- The full matrix must pass: Windows, Linux, and macOS on x86_64 and aarch64.
- One re-run of a failed job is permitted. Record the reason in the pull
  request.
- A second failure of the same job is a defect. Find the cause. Do not re-run
  it a third time.

## Stage 7 — merge

- Use a merge commit. Do not squash a release branch.
- Confirm that `main` is green on the merge commit before you continue.

## Stage 8 — tag

```sh
git tag -a vX.Y.Z -m "X.Y.Z"
git push origin vX.Y.Z
```

The tag starts the Release workflow. All 14 jobs must pass.

## Stage 9 — publish

- Create the draft release from the changelog section.
- Verify the assets: six archives, the Debian packages, and `SHA256SUMS`.
- Download one archive. Run `--version` and the smoke checks.
- Publish the draft as the latest release.
- Confirm that an anonymous download works.

## Stage 10 — close the version

- Update the Homebrew formula. It needs the new hashes, which exist only after
  publication. Use one short pull request.
- Write the release handoff in `.ai/handoffs/`.
- Start the next rung only after the maintainer rules its decisions.

## Forbidden

- Do not push a commit directly to `main`.
- Do not tag a commit that is not on `main`, or that is not green.
- Do not re-run a failed job twice without a fix.
- Do not describe a release as working until the smoke checks ran.
- Do not resolve an open decision as a side effect of the release.
- Do not cite `.ai/` content in a commit, pull request, or release note.
