# Architecture decision records

| ADR | Title | One-line summary |
| --- | --- | --- |
| [0001](0001-stack.md) | Stack | Spring Boot/Modulith + React/TypeScript on PostgreSQL, with the prototype's no-Docker, portable/embedded-Postgres local setup in place of the full product's Docker/Redis/Temporal stack. |
| [0002](0002-hybrid-jsonb-storage.md) | Hybrid JSONB storage for records | `records.values` JSONB for current state plus an append-only `attribute_values` history table, both written by one `RecordWriteService` transaction. |
| [0003](0003-api-codegen.md) | API contract code generation | Pinned `openapi-generator` (Spring interfaces) and `openapi-typescript` (TS types), with the TypeScript generator isolated in its own TypeScript 5.x install, plus the `npm run verify` drift check that catches stale generated code. |
