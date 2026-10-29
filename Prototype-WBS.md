Prototype WBS
The working prototype is broken into 13 work packages and their stories, in dependency order; each story is sized for one Claude Code session. Scope and simplifications are in the Prototype scope section of the main tab; no story carries a time estimate.
How to use this WBS
Work through the stories in ID order, one Claude Code session per story, starting a story only when everything in its Depends on column is done. A story is done when its acceptance criteria pass and the definition of done in the technical design is met.
Session prompt template
Work item: WP3.2 Value history
Read first: CLAUDE.md; PRD requirement ATT-5;
  Technical design > Storage design and schema (attribute_values, Record write path);
  PRD > Prototype scope (simplifications).
Task: <story description>
Acceptance criteria:
  - <criterion 1>
  - <criterion 2>
Propose a short plan first. After I approve it, write failing tests for each
criterion, implement, run `npm run verify`, and report what changed and the test results.
Rules for every prototype story
• Follow the Prototype scope simplifications; do not build anything listed as left for later.
• Keep workspace_id on every table and call AccessService on every endpoint, even though the prototype grants full access.
• Each story ends with a pull request listing its story ID, PRD requirement IDs and tests.
Dependency map
The arrows show the main package-level dependencies; story-level dependencies in the tables below are the ones to follow, and a few cross between packages (for example WP6.7 needs WP7.2).
WP0 Project setup
Creates the repository, local stack, API pipeline and CI that every later story relies on.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP0.1
Monorepo skeleton
Create the layout from the technical design: Maven parent with app, shared and the prototype modules (platform, schema, records, lists, query, access, collab, importexport, audit, interactions, intelligence); a Vite React TypeScript app; a root package.json whose npm scripts (dev, verify, api, seed, e2e) run both sides on Windows. AC: npm run dev starts backend and frontend; /health returns 200; the frontend shows a placeholder page
none
Repository layout
WP0.2
Local database stack
Portable PostgreSQL (the zip download, no installer or admin rights) set up inside the project folder with the pg_trgm extension, started and stopped by npm run dev; vector search is added later, in WP11.2; Flyway baseline; an embedded-PostgreSQL base class for integration tests instead of Testcontainers. AC: migrations run on start; a sample integration test runs with no Docker installed
WP0.1
Testing, environments
WP0.3
API contract pipeline
api/openapi.yaml skeleton; generation of Spring interfaces and the TypeScript client; npm run api. AC: a spec change regenerates both sides; CI fails if generated code is stale
WP0.1
API conventions
WP0.4
CLAUDE.md and ADRs
Seed CLAUDE.md with the ten rules and the prototype rules; ADR-001 stack, ADR-002 hybrid JSONB storage. AC: both ADRs merged; CLAUDE.md lists the developer commands
WP0.1
Claude Code conventions
WP0.5
CI pipeline
GitHub Actions running npm run verify: format, lint, unit and integration tests, Modulith and ArchUnit checks; frontend lint, typecheck, tests and build. AC: every pull request shows all checks; a failing test blocks merge
WP0.2, WP0.3
Testing, environments
WP0.6
Shared kernel
UUIDv7 IDs, the Actor type, an RFC 9457 error handler, outbox and audit writers. AC: errors return problem+json; outbox and audit rows roll back with their transaction
WP0.2
Storage conventions, API conventions
WP1 Sign-in and workspace
Gets real users into one workspace with admin and member roles.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP1.1
Google sign-in
Spring Security OAuth login with Google using only the openid, email and profile scopes; server-side session cookie. AC: a user signs in and lands in the app; the session survives refresh; sign-out ends it
WP0.6
SC-01
WP1.2
Dev login
Local login for development and tests, active only in the dev profile. AC: unavailable when the prod profile is active
WP1.1
Testing, environments
WP1.3
Workspace bootstrap
The first sign-in creates the single workspace and makes that user admin; later sign-ins need an invite. AC: first user is admin; an uninvited user sees a no-access page
WP1.1
PRM-1
WP1.4
Member invites
Admin creates an invite link (no email sent), changes a member's role and removes members. AC: an invitee joins as member; members cannot open workspace settings
WP1.3
PRM-1, SC-14
WP1.5
AccessService stub
AccessService interface and method-level checks, granting full access to members and admin-only access to settings. AC: an ArchUnit test fails if any controller method lacks an access check
WP1.3
PRM-6
WP2 Schema engine
Lets admins define objects and typed attributes at runtime; everything else builds on it.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP2.1
Schema tables
Migrations for objects, attributes, select_options and statuses. AC: migrations apply cleanly; slugs are unique per workspace and per parent
WP0.6
Schema (metadata)
WP2.2
Standard objects
Seed People, Companies and Deals with system attributes (names, emails, domains, job title, location, company link, deal stage, value, owner, close date) at workspace bootstrap. AC: all three exist with system attributes marked; system attributes cannot be deleted
WP2.1, WP1.3
OBJ-1
WP2.3
Custom objects
API to create, rename and delete custom objects and rename system objects; admin only. AC: a custom object appears in the sidebar data on save; renaming a system object keeps its slug; only custom objects can be deleted, after confirmation
WP2.1, WP1.5
OBJ-2, OBJ-3, ATT-8
WP2.4
Attribute management
API to create, edit, archive and restore attributes of every prototype type, with required, unique, default and multi-value settings and type config validation. AC: each type can be created; invalid config is rejected; archived attributes keep their data
WP2.1
ATT-1, ATT-2, ATT-6, ATT-8
WP2.5
Options and statuses
API for select options and statuses: add, colour, reorder, archive; target time per status. AC: order and colour persist; archived options stay on existing values
WP2.4
ATT-7, VW-4
WP2.6
Relationship attributes
Creating a relationship creates both sides with a cardinality. AC: a People-to-Companies relationship shows on both objects; deleting one side removes both
WP2.4
ATT-3
WP2.7
Schema settings screens
Object list, attribute list, create and edit dialogs, options and status editor. AC: an admin can do everything in WP2.3 to WP2.6 from the UI; members see the screens read-only or not at all
WP2.6, WP5.3
SC-15
WP3 Records engine
Implements the single write path: validated values, version history, uniqueness and links, all in one transaction.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP3.1
Records tables
Migrations for records, attribute_values, unique_values and record_links with the indexes in the schema. AC: migrations apply; the GIN and trigram indexes exist
WP2.1
Schema (data)
WP3.2
Value validation
Validators and JSONB encoders for every prototype attribute type, following the value-encoding table. AC: invalid emails, phone numbers, currency codes and dates return field-level errors; valid values round-trip unchanged
WP2.4, WP3.1
ATT-1, ATT-2, Value encoding
WP3.3
Record write service
RecordWriteService create and update following the seven-step write path. AC: one transaction per write; audit and outbox rows written; JSONB values always match current history rows (property test)
WP3.2, WP0.6
Record write path
WP3.4
Value history
Close the previous value and insert the new one on every change; read history per attribute. AC: history lists every past value with actor and time
WP3.3
ATT-5
WP3.5
Uniqueness and upsert
Claim unique_values for unique attributes; upsert by a matching attribute. AC: creating a duplicate email fails and names the existing record; upserting the same email updates instead of creating
WP3.3
OBJ-4, OBJ-5
WP3.6
References and relationships
Write record_links for references; keep both sides of a relationship in sync. AC: linking a person to a company shows on both records at once; unlinking removes both sides
WP3.3, WP2.6
ATT-3
WP3.7
Record API
Create, get, patch (append multi-value), put (replace multi-value), upsert and delete endpoints per the API conventions. AC: contract tests pass against the OpenAPI spec; delete removes the record's list entries
WP3.5, WP3.6
OBJ-4, OBJ-5, API conventions
WP4 Query engine
One engine turns the JSON filter language into SQL for views, search, import matching and the assistant.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP4.1
Filter language
Parse and validate the JSON filter tree against the schema, with the operators per type, $current_member and relative dates. AC: an unknown attribute or an operator that does not fit the type returns a field error
WP3.1, WP2.5
VW-5, Query engine
WP4.2
SQL compiler
Compile filters and multi-level sorts to SQL with jOOQ, always adding the workspace and access predicates. AC: every operator has a test against seeded data; malicious input cannot change the SQL
WP4.1, WP1.5
VW-5
WP4.3
Path filters
One-level dotted paths through record references and relationships. AC: filtering People by company.employee_count returns the right people
WP4.2, WP3.6
VW-1, VW-5
WP4.4
Cursor pagination
Keyset pagination with opaque cursors; counts exact up to a cap, then estimated. AC: paging stays stable while records are inserted
WP4.2
API conventions
WP4.5
Records query endpoint
POST /v1/objects/{object}/records/query with filter, sorts, limit and cursor. AC: contract tests pass; results match the filter semantics tests
WP4.4, WP3.7
VW-5, API conventions
WP4.6
Performance baseline
Seed 100,000 records; add expression indexes for the seeded filter and sort attributes; a load test in perf/. AC: filter plus sort returns in under 500 ms at p95 on that seed
WP4.5
NFR performance
WP5 App shell and design system
Builds our own look, the shared components and the attribute-type registry before any feature screen.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP5.1
Design tokens
Our own colour, type, spacing, radius and elevation tokens; light and dark themes; Tailwind configured on the tokens. AC: a token page in Storybook; switching theme changes every component
WP0.1
Design system
WP5.2
Core components
Button, inputs, select, menu, dialog, toast, side panel, skeleton, and the empty, error, no-access and plan-limit states, built on Radix. AC: each has Storybook stories for its states; automated accessibility checks pass
WP5.1
Design system, screen states
WP5.3
App shell
Sidebar (Home, Tasks, Notifications, Records, Lists, Settings), page header, right panel container and routes. AC: the sidebar lists objects and lists from the API; every route loads a page
WP5.2, WP1.1, WP5.5
SC-03, App shell
WP5.4
Attribute-type registry
For every prototype type: display renderer, inline editor, filter control, formatter and zod validator. AC: a Storybook story per type; frontend and backend agree on a shared set of valid and invalid test values
WP5.2, WP3.2
Attribute-type registry
WP5.5
API data layer
Generated client wired to TanStack Query; errors shown as toasts; an optimistic-update helper. AC: a failed edit rolls back and shows a toast
WP0.3, WP5.2
Data and realtime
WP6 Object table view
The spreadsheet-like screen where most work happens (SC-04).
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP6.1
Views API
views table and endpoints; personal and shared views per object and list. AC: views save columns, filter, sorts and kanban settings; personal views are visible only to their owner
WP2.1, WP1.5
VW-6
WP6.2
Data grid
Virtualised rows and columns from the view config, loading pages by cursor while scrolling. AC: scrolling 100,000 records stays smooth; column order follows the view
WP6.1, WP4.5, WP5.4
VW-1, SC-04
WP6.3
Inline edit and create
Type-specific cell editors from the registry with optimistic saves; a new-record row and dialog. AC: edits save without reload; a validation error shows on the cell and reverts the value
WP6.2, WP3.7
OBJ-4, VW-1
WP6.4
Column management
Add, reorder, resize, relabel and hide columns; related-record path columns; admins create or edit attributes from the header. AC: Person > Company > City can be shown as a column; a new attribute created from the header appears at once
WP6.2, WP4.3, WP2.4
VW-1, ATT-1
WP6.5
Filter and sort bar
Nested AND/OR filter builder and multi-level sorts using registry filter controls. AC: every operator in the filter language can be built in the UI; the filter persists in the view
WP6.2
VW-5
WP6.6
Saved views
View switcher; create, rename, duplicate and delete views; auto-save for the owner. AC: switching views restores their columns, filters and sorts
WP6.5
VW-6
WP6.7
Bulk actions
Row selection with bulk edit of one attribute, delete and add to list. AC: bulk edit of 1,000 rows completes and appears in each record's history
WP6.3, WP7.2
SC-04
WP7 Lists and kanban
Process lists with their own attributes, and the pipeline board (SC-05, SC-06).
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP7.1
Lists and entries backend
lists and list_entries tables, list attributes through the schema engine, system attributes Parent record, Added at and Added by; entry writes through the write service; entries API and query endpoint. AC: list attribute values have history; a record can have several entries in one list
WP3.7, WP4.5
LST-1, LST-2, LST-3
WP7.2
Create list and templates
Create a list on one object from scratch or from three templates: sales pipeline (Deals), recruiting (People), customer success (Companies). AC: a template creates its status attribute, list attributes and views
WP7.1, WP5.3
LST-1, SC-05
WP7.3
List table view
The grid showing entry attributes beside parent-record attributes; add entries by searching records. AC: the same person can be added twice with different values
WP7.1, WP6.2
LST-2, LST-3
WP7.4
Kanban board
Columns from a status attribute; configurable card rows; drag cards between columns with optimistic saves; add, hide and delete stages; toggle the no-status column. AC: a dragged card's new stage is saved and appears in its history
WP7.3, WP2.5
VW-2, SC-06
WP7.5
Bulk card moves
Shift-select several cards and move them in one drag. AC: all selected cards move and each gets a history entry
WP7.4
VW-3
WP7.6
Time in stage
Time in the current stage computed from value history; a target per stage flags cards past it. AC: a card past its target shows the flag; the value matches the history timestamps
WP7.4, WP3.4
VW-4
WP8 Record page and collaboration
The record page (SC-07) and everything people attach to a record: notes, tasks, comments and notifications.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP8.1
Record page layout
Header with actions, editable details sidebar, list memberships with their entry values, and tabs with counts. AC: every attribute the user can see is shown and editable inline; list entry values edit in place
WP6.3, WP7.1
REC-1, SC-07
WP8.2
Record preview panel
A side panel opened from any table row or card, with key fields and recent activity. AC: opens without leaving the table; edits sync back to the row
WP8.1
SC-08
WP8.3
Activity timeline
Timeline built from audit events: attribute changes, list moves, notes, tasks and comments, with type filters. AC: each change appears with actor and time; filters hide the chosen types
WP8.1, WP0.6
REC-2
WP8.4
Value history view
A per-attribute history popover on the record page. AC: shows every past value with actor and time
WP8.1, WP3.4
ATT-5
WP8.5
Notes
notes and note_templates tables, Tiptap editor with mentions, a full-page note view and note templates. AC: a note saves as Markdown and plain text; a mention links to the record or member
WP8.1
COL-1, SC-09
WP8.6
Tasks
Tasks with assignees, deadline, linked records and done state; create from a record; the Tasks page grouped by due date. AC: a task created on a record appears on that record and in the assignee's Tasks page
WP8.1
COL-2, SC-10
WP8.7
Comments
Threaded, resolvable comments with mentions on records and list entries. AC: replies nest under their thread; resolved threads collapse
WP8.1
COL-3
WP8.8
Notifications
In-app inbox for mentions, assignments and due tasks; mark as read. AC: mentioning a member creates a notification that links to the source
WP8.5, WP8.6, WP8.7
COL-4, SC-11
WP8.9
Home page
Home shows the user's tasks due, recently viewed records and favourites. AC: each item opens its record or task; the page loads with the shared loading and empty states
WP8.6, WP9.3
SC-03
WP9 Search, import and export
Finding anything fast, and getting data in and out.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP9.1
Search backend
search_doc and trigram indexes, ranking by exact identifier, prefix, similarity and recency; POST /v1/search. AC: a search by name, email or domain returns the record first
WP4.2
SRC-1, Search
WP9.2
Command menu
Keyboard-opened menu searching records, lists, views and actions; shortcuts for common actions. AC: any record opens in three keystrokes or fewer after typing its name
WP9.1, WP5.3
SRC-2, SC-12
WP9.3
Sidebar favourites
Favourite and reorder sidebar items per user. AC: order and favourites persist across sessions
WP5.3
SRC-3
WP9.4
Import backend
Upload CSV or Excel; map columns to attributes; choose a matching attribute; run as a background job through the write service; row-level results and an error file. AC: matched rows update and others are created; skipped rows list the reason
WP3.5
IMP-1, IMP-3
WP9.5
Import wizard
Upload, map (with create-attribute inline), choose match, preview, run and report screens. AC: a user imports 10,000 companies and downloads the skipped-rows file
WP9.4, WP5.2
IMP-1, IMP-3, SC-13
WP9.6
Import into a list
Target a list so rows become entries with list attribute values. AC: imported entries appear in the list with their values
WP9.4, WP7.1
IMP-2
WP9.7
CSV export
Export the current view with its filters and columns. AC: the file matches what the view shows
WP6.6
EXP-1
WP9.8
Onboarding flow
First-run steps for the admin: name the workspace, enable Deals, start lists from templates, import a CSV, invite members. AC: a new admin reaches a populated pipeline by following the steps; each step can be skipped
WP7.2, WP9.5, WP1.4
SC-02
WP10 Sample email and meetings
Shows how mail and calendar capture will feel, using generated data in the real tables instead of provider sync.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP10.1
Interaction tables
Migrations for email_messages, email_participants, calendar_events, meetings and interaction_links, as in the schema. AC: migrations apply; a message links to several records
WP3.1
Schema (interactions)
WP10.2
Sample data generator
npm run seed:interactions generates emails and meetings between members and outside contacts, then runs ingestion steps 4 to 6: upsert People by email, Companies by domain, and link. AC: people and companies are created from participants; free-mail and own-domain addresses create no company
WP10.1, WP3.5
SYN-3 (simulated), Ingestion pipeline
WP10.3
Emails and meetings on records
Emails tab and meetings on the record page, newest first, also shown in the activity timeline. AC: a company record shows every email and meeting with its people
WP10.2, WP8.3
REC-1, REC-2
WP10.4
Communication intelligence
A scheduled job fills comint_stats: first, last and next interaction and a strength band; shown on record pages and usable as table columns and filters. AC: values match the seeded interactions; filtering by strength works
WP10.2, WP4.3
CI-1, CI-2
WP11 AI assistant
A grounded assistant that answers questions about the workspace and proposes changes the user approves.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP11.1
Model gateway
Gateway interface with one LLM vendor adapter: streaming, timeouts, retries; the key read from secret config. AC: a second vendor could be added without changing callers; no key in the repository
WP0.6
AI architecture
WP11.2
Embedding pipeline
An in-process outbox consumer embeds notes, sample emails and record summaries into embeddings. Use a prebuilt pgvector for Windows if one installs without admin rights; otherwise store vectors as arrays and rank them in Java, which is enough for prototype data volumes. AC: a new note is searchable by meaning shortly after it is saved
WP11.1, WP8.5, WP10.2
AI-2
WP11.3
Tool registry
Typed tools: search records, query records, get record, search notes and emails (hybrid), propose update, propose task; all calls go through AccessService. AC: each tool has tests; tools cannot write directly
WP11.1, WP4.5, WP9.1
AI-3, AI-5
WP11.4
Assistant panel
Right-panel chat using the current page as context; streamed answers with links to the records, notes and emails used. AC: asking "which deals are in negotiation" lists them with links
WP11.3, WP5.3
AI-1, AI-2, SC-23
WP11.5
Approval cards
ai_change_proposals; each proposed change shows as a card to accept, edit or reject; accepted changes apply through the write service as the user. AC: an accepted update appears in the record's history with the user as actor
WP11.4, WP3.3
AI-4
WP11.6
Assistant evaluation
A set of 20 questions with expected answers over the demo seed, and a script that scores the assistant. AC: the script runs in CI and reports a pass rate
WP11.5, WP12.1
AI quality
WP12 Pilot readiness
Puts the prototype in front of the pilot team and checks it against the exit criteria.
ID
Story
Description and acceptance criteria
Depends on
PRD refs
WP12.1
Demo seed workspace
npm run seed builds a full demo: objects, a custom object, records, lists with stages, notes, tasks and interactions. AC: a fresh install shows a populated workspace
WP7.6, WP8.8, WP10.4
Prototype scope
WP12.2
End-to-end journeys
Playwright tests for each prototype exit criterion. AC: all journeys pass in CI against the local stack
WP12.1, WP9.7, WP9.8, WP8.9, WP11.5
Exit criteria
WP12.3
Pilot deployment
Docker Compose on one server with HTTPS, the prod profile, production Google OAuth credentials and daily PostgreSQL backups. AC: pilot users sign in at the URL; a restore from backup succeeds
WP12.2
Simplifications
WP12.4
Logs and error tracking
Structured logs and an error tracker for backend and frontend. AC: a forced error appears in the tracker with its request ID
WP12.3
Observability
WP12.5
Feedback capture
An in-app feedback button that saves the message with the page and record context; an admin list of feedback. AC: feedback entries show who sent them and from where
WP12.3
Exit criteria
WP12.6
Exit review
Walk through the exit criteria with the pilot team and fold the feedback into the PRD. AC: every exit criterion is marked met or has a follow-up story
WP12.5
Exit criteria