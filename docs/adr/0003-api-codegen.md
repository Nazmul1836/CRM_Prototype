# 0003: API contract code generation

Numbered 0003: the WBS earmarks ADR-001 (stack) and ADR-002 (hybrid JSONB storage) for the
upcoming WP0.4 story, so this one starts at 0003 even though it lands first.

## Status

Accepted (WP0.3).

## Context

`api/openapi.yaml` is the source of truth for the API. Both the Spring server interfaces and
the TypeScript client must be generated from it, never hand-written, and `npm run verify` must
fail if either generated side has drifted from the spec (the spec changed, or the generated
files were hand-edited, without running `npm run api`).

## Decision

- **Backend**: `@openapitools/openapi-generator-cli`, generator `spring`, `interfaceOnly=true`
  (interface + model only, no generated controller), `documentationProvider=none` and
  `openApiNullable=false` to avoid extra runtime dependencies beyond
  `spring-boot-starter-validation`. Output lands in `backend/app/src/generated/java`, added as
  an extra Maven source root via `build-helper-maven-plugin`. `HealthController` implements the
  generated `HealthApi` interface.
- **Frontend**: `openapi-typescript` generates types only (`frontend/src/api/schema.d.ts`, zero
  runtime code). A small, hand-written, *not regenerated* `frontend/src/api/client.ts` wires
  those types into `openapi-fetch`, a tiny typed fetch wrapper — that pairing is "the
  TypeScript client."
- **Determinism**: both tools can embed a generation timestamp by default, which would make
  every regeneration look "stale" even with no spec change. Generation uses
  `hideGenerationTimestamp=true` (backend) and openapi-typescript's default (no timestamp) so
  output is byte-identical across runs for the same spec — required for the drift check below
  to mean anything.
- **Pinned versions**, so regeneration gives identical output on every machine:
  - `openapitools.json` pins the actual generator engine to **7.26.0** (independent from the
    npm wrapper's own version).
  - Root `package.json` pins `@openapitools/openapi-generator-cli` to the exact version
    `2.42.0` (no `^`/`~` range).
  - `openapi-typescript` is pinned to `7.13.0`.
- **Isolated tool install for the frontend generator**: this project pins `typescript` to the
  `7.x` line, but `openapi-typescript` only works against TypeScript `5.x` (it crashes at
  runtime against `7.x`, not just a peer-range warning — TS 7 is a very recent, different
  compiler API shape). Rather than force a version mismatch into the frontend's own
  `node_modules`, `openapi-typescript` is installed in its own tiny project,
  `scripts/api-codegen-tools/` (its own `package.json`, pinned to `typescript: 5.9.3`), used only
  by the codegen scripts. The frontend's real `typescript: ~7.0.2` is untouched.
- **Drift check** (`npm run verify` → `verify:api-fresh` → `scripts/check-api-fresh.js`):
  regenerates both sides into a scratch temp directory and compares them against the committed
  files (normalizing CRLF/LF as a second line of defense on top of `.gitattributes`). Fails with
  a list of stale files and tells the developer to run `npm run api`.
- **`.gitattributes`** forces LF on `api/openapi.yaml` and everything under
  `backend/app/src/generated/` and `frontend/src/api/schema.d.ts`, so a Windows checkout can
  never make the drift check fail on line endings alone.

## Consequences

- New dependencies: `@openapitools/openapi-generator-cli` (root), `openapi-typescript` and
  `typescript@5.9.3` (`scripts/api-codegen-tools/`, isolated), `openapi-fetch` (frontend
  runtime), `spring-boot-starter-validation` and `org.codehaus.mojo:build-helper-maven-plugin`
  (backend).
- Generated code is committed to git (not purely build output) specifically so the drift check
  has something to diff against and so it's reviewable in pull requests.
- **For WP0.5 (CI pipeline)**: when format and lint checks (Spotless/Checkstyle, ESLint/Prettier
  or whichever tools that story picks) are added, they must exclude
  `backend/app/src/generated/**` and `frontend/src/api/schema.d.ts`. These files are
  regenerated verbatim by `npm run api` from a fixed tool version, not hand-written, so
  reformatting them only produces noise and fights the next regeneration.
