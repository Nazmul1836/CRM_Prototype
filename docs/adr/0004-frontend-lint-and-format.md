# 0004: Frontend lint and format

## Status

Accepted (WP0.5).

## Context

WP0.5 adds formatting and lint checks to `npm run verify`, matching the technical design's
"Build, format and lint" pipeline step, which names ESLint and Prettier for the frontend.
WP0.1 had already set up `oxlint` for `npm run lint` instead.

## Decision

- **Replaced `oxlint` with ESLint** (flat config, `typescript-eslint` recommended rules,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`) rather than running both — a
  second linter covering the same ground would just be redundant for a prototype.
- **Added Prettier** for formatting (`npm run format`, `npm run format:check`), which `oxlint`
  never did. Prettier itself runs fine against this project's TypeScript 7.x — it only tokenizes
  files, it doesn't type-check them, so the problem below doesn't apply to it.
- **`typescript-eslint` outright refuses to run under TypeScript 7** ("typescript-eslint does
  not support TS 7.0", a deliberate error from the library itself, not a peer-range warning —
  TS 7 is a very recent, differently-shaped compiler API). Its own error message points at
  running side-by-side with TypeScript 6.0 as the fix.
- Rather than isolate the tooling into its own sub-project (as ADR-0003 did for
  `openapi-typescript`), **ESLint, `typescript-eslint` and their plugins are installed at the
  repo root**, pinned to `typescript: 6.0.3`, with no isolation folder needed: nothing else at
  the repo root depends on `typescript`, so there's no conflicting version to isolate from.
  `frontend/eslint.config.js` still lives inside `frontend/` (ESLint's flat config requires the
  config file to be an ancestor of everything it lints), and its `import` statements resolve
  these packages by Node's normal upward search into the repo root's `node_modules` — no
  symlinks, overrides or wrapper scripts required. `frontend/package.json`'s `lint` script is
  plain `eslint .`; `npm run lint` already puts ancestor `node_modules/.bin` directories on
  `PATH`.
- Both exclude the generated `frontend/src/api/schema.d.ts` (and `dist/`).

## Consequences

- `npm run verify` in `frontend/` now runs, in order: `format:check`, `lint`, `typecheck`,
  `test`, `build`. A formatting mistake or a real lint violation fails it before the slower
  steps run.
- The repo root's `package.json` carries frontend lint tooling as devDependencies even though
  the root itself has no `.ts` files — this is deliberate, not clutter: it's the only
  TypeScript-6-compatible location Node's resolution can reach from `frontend/eslint.config.js`
  without adding yet another isolated sub-project.
- If `typescript-eslint` adds real TypeScript 7 support later, these pinned versions (and this
  whole workaround) can be dropped in favor of just using the frontend's own TypeScript.
