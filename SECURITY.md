# Security Policy

## Project status

Assemblash is **released at 1.3.0**. It is a local-first engine: by default it
binds `127.0.0.1` and requires no account, no network, and no cloud service.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.2.x | Yes |
| 1.1.x | Yes |
| 1.0.x | Yes |
| < 1.0 | No — upgrade to the latest release |

## What the built-in authentication is, and is not

Binding anything other than loopback **refuses to start without an access
token**. The token is compared in constant time, is never logged, and is never
put in a URL. That is the whole of it: there are no users, no roles, and no
revocation beyond rotating the single token, which logs everyone out.

**The token authenticates; it does not encrypt.** Anything reachable beyond a
trusted network belongs behind a reverse proxy that terminates TLS, and OIDC or
SSO belongs there too — see [DEPLOYMENT.md](DEPLOYMENT.md). Assemblash is not an
identity provider and does not try to be one.

## Reporting a vulnerability

**Do not open a public issue for a security problem.**

Report privately through GitHub's private vulnerability reporting:
**Security → Report a vulnerability** on this repository.

<!-- TODO(release): if you prefer email reports, add a contact address here and
     enable "Private vulnerability reporting" in the repository settings. -->

Please include:

- what the issue is and what an attacker can achieve;
- affected component (core, API, MCP server, reference UI, adapter);
- steps to reproduce, or a minimal document/request that triggers it;
- your environment (OS, runtime version, configuration);
- any suggested fix.

Expect an acknowledgement within a few days. Because this is a small project,
please allow reasonable time for a fix before public disclosure, and coordinate
the disclosure timing with the maintainers.

## Scope — what matters most in this project

Assemblash exposes a document engine to AI agents, so the sharpest risks are in
the agent boundary rather than in classic web surfaces. The following are
in scope and treated as security issues, not bugs:

- **Filesystem escape.** Any path in a document, asset import, export target, or
  MCP tool argument that reaches outside the configured project root
  (PRD §10.1) — including symlinks, absolute paths, UNC paths, and `..`
  traversal.
- **Protected-layer bypass.** Any way to mutate a `locked`, `protected`, or
  `readOnly` layer through normal API, MCP, or adapter operations (PRD §10.2).
- **Version-check bypass.** Applying a mutation against a stale document version
  without rejection (PRD §10.3).
- **Dry-run that mutates.** Any operation that commits changes while reported as
  a preview (PRD §10.4).
- **Data exfiltration through adapters.** An optional AI or downstream adapter
  sending local project data to a remote provider without explicit
  configuration (PRD FR-15).
- **Malicious document or asset handling.** Crafted SVG, image, font, or
  `document.json` input causing code execution, script execution in a renderer
  or the reference UI, server-side request forgery, or resource exhaustion.
- **Secret leakage in errors, logs, exports, or export metadata**
  (PRD NFR-4).
- **Undo corruption.** History or transaction handling that leaves a document
  unrecoverable after a rejected or reversed operation.

## Out of scope

- Vulnerabilities caused solely by exposing plain HTTP to an untrusted network
  against the deployment guidance. Assemblash provides a shared access token,
  not transport encryption or per-user identity; internet-facing deployments
  need TLS and, where required, an identity-aware reverse proxy.
- Missing hardening in features that are documented as not yet implemented.
- Reports generated solely by an automated scanner with no demonstrated impact.
- Attacks requiring an already-compromised host or a malicious local user with
  filesystem access equal to the server's.

## Deployment guidance for users

- Run Assemblash locally or on a trusted host. Do not expose it directly to the
  internet without its access token and TLS in front of it; add an identity-aware
  proxy when you need users, roles, OIDC, or SSO.
- Configure the project root explicitly and give the process access to nothing
  beyond it.
- Treat documents and assets from other people as untrusted input.
- Keep provider credentials used by downstream adapters out of the repository
  and out of documents. No AI provider adapter ships in the core.
