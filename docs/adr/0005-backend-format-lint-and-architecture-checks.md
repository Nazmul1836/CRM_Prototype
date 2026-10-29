# 0005: Backend format, lint and architecture checks

## Status

Accepted (WP0.5).

## Context

WP0.5 adds Spotless and Checkstyle to `npm run verify` for the backend, plus a Spring Modulith
verification test and an ArchUnit test enforcing that no module reaches into another module's
`internal` package.

## Decision

- **Spotless**, with `googleJavaFormat`, configured once in the parent `backend/pom.xml` so
  every module is formatted the same way; `mvn spotless:apply` fixes violations. Excludes
  `**/generated/**`.
- **Checkstyle**, with a small custom rule set (`backend/checkstyle.xml`): unused/redundant
  imports, empty blocks, `equals`/`hashCode` pairing, missing braces, one top-level class per
  file. Deliberately not a full style guide (no javadoc or naming-convention checks) — Spotless
  already handles formatting, and a prototype doesn't need the ceremony of, say, Google's full
  checks. Also excludes `**/generated/**`.
- **Spring Modulith 1.2.13** — not the latest 2.x line, which targets a newer Spring Boot than
  this project's 3.3.5 and fails at runtime (`NoSuchMethodError` against an API that only exists
  in Boot 4). 1.2.x is the line actually built against Boot 3.3.
- **`app` now depends on every module JAR** (`platform`, `schema`, `records`, ... `intelligence`).
  It didn't before WP0.5 — nothing needed it, since the modules are still just
  `api`/`internal`/`web` package skeletons with no real classes. This is wiring, not new
  business logic: `app` is the final deployable that assembles every module per the repository
  layout, and both architecture checks need the modules on its test classpath to see them at
  all.
- **Two checks, not one**: `ApplicationModules.of("com.crmprototype").verify()` uses Spring
  Modulith's own module-boundary conventions; a hand-written ArchUnit rule separately asserts,
  in plain terms, "no class outside module X may depend on `X.internal..`" — the literal rule
  this story asked for, independent of how Modulith itself defines a module's public surface.
  Verified against a deliberate scratch violation during this story (added, confirmed both
  checks failed with a clear message, then removed) — not left as a vacuous check that just
  happens to pass because no module has real code yet.

## Consequences

- Every backend module is formatted and checked the same way; a developer fixes a formatting
  issue with `mvn spotless:apply` rather than by hand.
- The architecture tests currently pass trivially (no module has real code to violate the rule
  yet) but will start enforcing themselves the moment a later WBS story adds real classes to two
  modules and one reaches into the other's `internal` package.
- If a later story changes a module's internal/api package layout, revisit whether Spring
  Modulith's own "named interface" convention (exposing an `api` subpackage explicitly) should
  replace the hand-written ArchUnit rule; not needed yet since no module exposes real types.
