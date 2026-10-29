CRM Prototype: rules for every Claude Code session
Read this first
The product documents are in docs/prd/:
product-requirements.md (what to build, requirement IDs such as OBJ-1, VW-5)
technical-design.md (how the full product is designed)
prototype-wbs.md (the work packages and stories, WP0.1 onwards)
The Prototype scope section in product-requirements.md overrides technical-design.md wherever they differ. Never build anything it lists as "left for later".
Every session works on exactly one WBS story. Read that story, its PRD requirement IDs and the technical design sections it names before changing anything.
Who you are working with
The product owner is an SQA engineer, not a developer. Explain plans and results in plain language, without jargon.
Give exact commands to run, one per line, and say what the expected output looks like.
For every story, end with a numbered "How to test this story" checklist that maps one-to-one to the story's acceptance criteria.
Ask before installing any tool, downloading anything, or touching files outside this project folder.
Machine and environment
Windows 11, 64-bit. Java 21 (Oracle JDK), Node.js 22, Git. No Docker, no WSL, and no admin rights should be assumed.
Project folder: C:\Projects\CRM_ProtoType (outside OneDrive).
PostgreSQL runs from the portable zip inside .local/postgres/ (git-ignored), started and stopped by the npm scripts.
Ports (all localhost only): backend 8080, frontend 5173 (Vite's default), database 55432.
Integration tests use embedded PostgreSQL, not Testcontainers.
Use the Maven wrapper (mvnw.cmd); do not require a global Maven install.
Stack
Backend: Spring Boot on Java 21, Spring Modulith, Maven multi-module (backend/app, backend/shared, backend/modules/*), Flyway, Spring Data JDBC plus jOOQ for dynamic queries.
Frontend: React, TypeScript (strict), Vite, TanStack Query, Table and Virtual, dnd-kit, Tiptap, Radix UI, Tailwind on our own design tokens.
API: OpenAPI-first in api/openapi.yaml; server interfaces and the TypeScript client are generated.
Generated code lives in backend/app/src/generated/java (Spring interfaces) and frontend/src/api/schema.d.ts (TypeScript types); both are rebuilt by npm run api and must never be hand-edited. frontend/src/api/client.ts is the opposite: it is hand-written on purpose and is not regenerated.
The TypeScript generator (openapi-typescript) needs an older TypeScript (5.x) than this project uses (7.x), so it is installed on its own in scripts/api-codegen-tools/ instead of alongside the frontend's real TypeScript, to avoid a version conflict.
Commands (root npm scripts, all must work on Windows)
Command	Does
npm run dev	Starts PostgreSQL, the backend and the frontend
npm run verify	Runs every check: format, lint, unit and integration tests, architecture checks, frontend typecheck, tests and build
npm run api	Regenerates code from api/openapi.yaml
npm run seed	Loads the demo workspace
npm run e2e	Runs Playwright end-to-end tests
npm run db:init	One-time setup of the portable local database
npm run db:start	Starts the local database on its own
npm run db:stop	Stops the local database on its own
npm run db:reset	Wipes and recreates the local database

A script whose story is not built yet should print "not implemented yet" and exit successfully.

Engineering rules
Propose a short plan first: what you will create or change, which files, and how the owner will test it. Wait for the word "approved" before changing code.
Write a failing test for each acceptance criterion first, then the code.
API changes start in api/openapi.yaml; run npm run api; never hand-edit generated code.
Only the records, lists and query modules touch their own tables; everything else calls RecordWriteService and QueryService.
Every endpoint and query goes through AccessService, even though the prototype grants full access. Every state change writes an audit event and an outbox event.
Every table has workspace_id, even though the prototype has one workspace.
Add new Flyway migrations only; never edit a migration that has already run.
Frontend values render through the attribute-type registry and use design tokens only.
No new dependency, service or pattern without a short ADR in docs/adr/.
Run npm run verify before finishing and report the result honestly, including any failures.
Prototype simplifications (do not over-build)
One workspace; admin and member roles only.
No Redis, no Temporal, no WebSocket: use Spring scheduled and async tasks; the outbox is consumed in-process.
Email and meetings come from seeded sample data, not Gmail or Microsoft sync.
One LLM vendor through the model gateway interface; the API key comes from an environment variable, never from the repository.
Git and safety
Commit at the end of each approved story with the message <story ID>: <story title>, for example WP0.1: Monorepo skeleton.
Never push to GitHub without asking.
Never commit secrets. Keep .env, .local/ and build output in .gitignore.
Never delete or rewrite files outside the current story's scope.