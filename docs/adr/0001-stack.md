# 0001: Stack

## Status

Accepted (WP0.4; the stack itself was already in use from WP0.1 onwards).

## Context

The technical design (`docs/prd/technical-design.md` > Architecture overview) picks a Spring
Boot modular monolith plus React/TypeScript for the full product, backed by PostgreSQL, Redis,
object storage and Temporal, deployed as Docker images on Kubernetes. The Prototype scope
section of `docs/prd/product-requirements.md` overrides that wherever it differs, and explicitly
drops Docker, Testcontainers and `make` in favor of a laptop-only setup with root npm scripts
(see its "Local development" row).

## Decision

For the prototype, the full-product stack decision is kept where the Prototype scope section
doesn't override it, and dropped where it does:

- **Backend**: Java 21, Spring Boot, **Spring Modulith** for module boundaries, one Maven
  multi-module repo (`backend/app`, `backend/shared`, `backend/modules/*`). Matches the
  technical design as-is.
- **Data access**: Flyway for migrations; Spring Data JDBC plus jOOQ for dynamic queries, as the
  technical design specifies (jOOQ wiring itself lands in a later storage story, not WP0.1-0.4).
- **Frontend**: React, TypeScript (strict), Vite, TanStack Query/Table/Virtual, dnd-kit, Tiptap,
  Radix UI, Tailwind on our own tokens. Matches the technical design.
- **API contract**: OpenAPI 3 written first (`api/openapi.yaml`); Spring server interfaces and
  the TypeScript client generated from it (see ADR-0003). Matches the technical design.
- **Database**: PostgreSQL with `pg_trgm`. The technical design also calls for `pgvector`;
  the Prototype scope section defers vector search to WP11.2, so it is not part of the stack
  yet.
- **Local development — prototype-only, not in the technical design**: no Docker, no
  Testcontainers, no `make`. A portable PostgreSQL (zip, no installer, no admin rights) runs
  from `.local/postgres/` for day-to-day development, started and stopped by `npm run dev`.
  Integration tests use an embedded PostgreSQL instead of Testcontainers, so they run with no
  Docker installed. Root npm scripts (`dev`, `verify`, `api`, `seed`, `e2e`) replace `make` so
  every command works on Windows without WSL.
- **Dropped for the prototype** (per the Prototype scope section — not missing, deliberately
  left for later): Redis, Temporal, OpenSearch, S3-compatible object storage, the WebSocket
  realtime layer, Keycloak/SAML/SCIM, and the Docker/Kubernetes packaging. Scheduled state
  changes use Spring's own `@Scheduled`/`@Async` instead of Temporal; the outbox is consumed
  in-process instead of via Redis Streams.

## Consequences

- A developer (or Claude Code) needs only Java 21, Node.js 22 and Git on a Windows laptop —
  no Docker Desktop, no admin rights, no separate services to run.
- Code written against the prototype's simplifications (in-process outbox, no Redis-backed
  cache/locks, no Temporal workflows) will need rework when those pieces are added back for the
  full product; this is accepted as the cost of a fast, dependency-light prototype.
- Everything this ADR keeps from the technical design (Spring Modulith boundaries, Flyway,
  OpenAPI-first, the frontend stack) should carry forward unchanged into the full product.
