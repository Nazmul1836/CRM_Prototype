Technical design
This tab turns the product requirements into build decisions for Claude Code. Stack: Spring Boot modular monolith, React and TypeScript, PostgreSQL. Requirement IDs (OBJ-1, WF-9 and so on) refer to the main tab.
Architecture overview
The system is one Spring Boot codebase deployed as two process types (API servers and background workers), backed by PostgreSQL, Redis, object storage and Temporal. Modules talk through Java interfaces and domain events, never through each other's tables, so any module can be split into a service later.
Stack decisions
Layer
Decision
Reason
Language and runtime
Java (current LTS), Spring Boot (current major)
Team expertise; strong typing helps review AI-written code
Module boundaries
Spring Modulith, one Maven multi-module repo
Enforced boundaries inside one deployable; boundary tests in CI
Database
PostgreSQL with JSONB, pg_trgm and pgvector
Dynamic schema, fuzzy search and embeddings in one store
Migrations
Flyway
Versioned, reviewable SQL migrations
Data access
Spring Data JDBC plus jOOQ for dynamic queries
The filter engine needs generated SQL; JPA hides too much
Cache, locks, rate limits
Redis
Shared state across API servers
Durable execution
Temporal (self-hosted or cloud) with the Java SDK
Workflows, sequences, sync backfills and agent runs that survive restarts and can be replayed
Search
PostgreSQL first; OpenSearch when needed
One fewer system in phases 1 to 3
Files
S3-compatible object storage, signed URLs
Standard and cloud-portable
Realtime
WebSocket endpoint with Redis pub/sub fan-out
Live updates across API servers
Auth
Spring Security, OAuth 2.0 login (Google, Microsoft), email magic link; Keycloak added for SAML and SCIM
Simple first, enterprise later
Frontend
React, TypeScript, Vite, TanStack Query, Table and Virtual, dnd-kit, a rich-text editor (Tiptap)
Fast data grids, kanban and collaborative notes
Collaborative editing
Yjs documents for notes, synced over the WebSocket
Conflict-free real-time co-editing
API contract
OpenAPI 3 written first; TypeScript client generated from it
Frontend and backend stay in sync
Packaging
Docker images; Kubernetes or a managed container service
Cloud-portable; target cloud is an open decision
Backend modules
Module
Owns
Phase
platform
Workspaces, users, members, teams, sessions, API tokens
1
schema
Objects, attributes, select options, statuses
1
records
Records, current values, value history, upsert, merge
1
lists
Lists, entries, views
1
query
Filter language, SQL generation, search
1
access
Permission rules, resolution, caching
1
collab
Notes, tasks, comments, files, notifications
1
importexport
Import jobs, mapping, export
1
audit
Audit events, actor tracking
1
interactions
Mail and calendar accounts, sync, meetings, communication intelligence
2
enrichment
Provider adapters, enrichment jobs
2
messaging
Outbound email, templates, unsubscribe list
2
integration
Public API surface, OAuth apps, webhooks, outbox
2
automation
Workflows, blocks, runs, sequences
3
reporting
Reports, dashboards, metrics
3
billing
Plans, limits, seats, credits, payments
3
intelligence
Model gateway, retrieval, assistant, agents, call intelligence
4
mcp
MCP server tools
4
apps
App SDK runtime, app store
5
API servers and workers run the same code with different entry points; both reach PostgreSQL, Redis, object storage and Temporal, and call external services through adapters.
Storage design and schema
User-defined objects are stored in fixed tables: a records table holds each record's current values as JSONB for fast reads and filters, and an attribute_values table holds every value ever set, with validity timestamps. One write service updates both in a single transaction.
Conventions for every table
• First column workspace_id uuid not null; every query is scoped by it, and PostgreSQL row-level security enforces it as a second line of defence.
• Primary keys are UUIDv7 (time-ordered) unless noted.
• created_at, updated_at as timestamptz; created_by as a JSONB actor {type: member|api_token|workflow|agent|system, id}.
• Large, append-only tables (attribute_values, audit_events, email_messages, webhook_deliveries) are partitioned.
Schema (metadata)
Table
Key columns
Notes
workspaces
id, slug (unique), name, region, settings
The tenant
users
id, email (unique), name, avatar_url
Global across workspaces
user_identities
user_id, provider, subject
Google, Microsoft, email link, SAML
workspace_members
workspace_id, user_id, role (admin, member), status (active, invited, suspended)

teams, team_members
id, name; team_id, member_id

objects
id, api_slug, singular_name, plural_name, icon, kind (record, activity), is_system, is_enabled
Activities are objects with kind = activity; unique (workspace_id, api_slug)
attributes
id, parent_type (object, list), parent_id, api_slug, title, type, is_system, is_required, is_unique, is_multivalued, is_archived, default_value, config, sort_order
config holds type settings: currency code, allowed objects, relationship inverse, formula expression
select_options
id, attribute_id, title, color, sort_order, is_archived

statuses
id, attribute_id, title, color, sort_order, target_time, is_archived
Drives kanban columns and time in stage
Schema (data)
Table
Key columns
Notes
records
id, object_id, values (JSONB keyed by attribute ID), display_name, search_doc (tsvector), merged_into_id
GIN index on values; trigram index on display_name
attribute_values
id (bigint), entity_type (record, entry), entity_id, attribute_id, value (JSONB), active_from, active_until, created_by
Current value has active_until null; index (entity_id, attribute_id) where current
unique_values
attribute_id, normalized_value, entity_id
Primary key (attribute_id, normalized_value); enforces unique attributes and powers upsert matching
record_links
attribute_id, source_id, target_id
Edges for record references and relationships; indexed both ways for joins and reverse lookups
lists
id, api_slug, name, parent_object_id, icon

list_entries
id, list_id, record_id, values (JSONB)
Indexes on list_id and record_id; many entries per record allowed
views
id, parent_type, parent_id, name, type (table, kanban), owner_member_id (null = shared), config
config: columns, filter, sorts, status attribute, card rows, hidden stages
Schema (collaboration)
Table
Key columns
Notes
notes
id, record_id, title, ydoc (bytes), content_md, content_text, meeting_id
Yjs state for editing; Markdown and plain text kept for API, search and AI
note_templates
id, name, content_md, owner_member_id

tasks
id, content, deadline_at, is_completed, completed_at

task_assignees, task_links
task_id, member_id; task_id, record_id

comment_threads
id, record_id or entry_id, resolved_at, resolved_by
One of the two parents is set
comments
id, thread_id, author, content, created_at

files
id, record_id, parent_folder_id, kind (file, folder, connected), name, storage_key, size_bytes, mime_type, provider, external_id
50 MB upload cap
notifications
id, member_id, type, payload, read_at

Schema (interactions, phase 2)
Table
Key columns
Notes
connected_accounts
id, member_id, provider, email, scopes, token_ref, sharing_level, sync_state
Tokens encrypted with a KMS key; only token_ref in the row
email_messages
id, account_id, provider_message_id, thread_key, from, to, cc, subject, sent_at, snippet, body_ref
Unique (account_id, provider_message_id); bodies encrypted in object storage
email_participants
message_id, email_normalized, person_record_id
Links mail to People
email_shares
scope (message, person, company, account), scope_id, principal_type, principal_id
Grants beyond the account's sharing level
calendar_events, meetings
id, account_id, start_at, end_at, attendees, conference_url; id, calendar_event_id, title
One meeting per real-world event across accounts
interaction_links
interaction_type, interaction_id, record_id
Emails and meetings linked to any record
call_recordings
id, meeting_id, status, media_key, language, transcript, summary, insights

blocklist_entries
member_id (null = workspace), kind (email, domain), value

comint_stats
record_id, member_id, first_at, last_at, next_at, email_count, meeting_count, strength
Recomputed by a job; powers interaction attributes
Schema (automation, AI, reporting, billing, platform)
Table
Key columns
Notes
workflows, workflow_versions
id, name, folder_id, status, run_as_member_id; workflow_id, version, trigger, graph
Published versions are immutable
workflow_runs, workflow_run_steps
id, workflow_id, version, temporal_id, status, credits_used; run_id, block_id, status, input, output, error
Feeds run history and agent logs
sequences, sequence_enrolments
id, steps, sender_rule, settings; id, sequence_id, person_record_id, status, current_step, temporal_id

unsubscribes
email_normalized
Blocks enrolment and sending
agents, agent_runs
id, instructions, model, tools, output_schema, run_as_member_id; id, agent_id, trace, credits_used

ai_conversations, ai_messages, ai_change_proposals
id, member_id; id, role, content, sources; id, target, patch, status (pending, accepted, rejected)
Approval cards
embeddings
source_type, source_id, chunk_no, embedding (vector), text
HNSW index per workspace partition
reports, dashboards
id, type, config; id, name, layout

access_grants
resource_type, resource_id, principal_type (workspace, team, member, workflow), principal_id, level
See permission engine
access_requests
resource_type, resource_id, member_id, status

subscriptions
plan, billing_cycle, seats, status, provider_customer_id
Plan limits live in code config
credit_ledger
member_id (null = workspace), kind (grant, usage, top_up, expiry), amount, feature, ref_id
Balance = sum of ledger; never updated in place
api_tokens, oauth_clients, oauth_grants
token_hash, scopes, last_used_at; client and grant data
Tokens stored hashed
webhooks, webhook_deliveries
url, secret_ref, subscriptions, status; event_id, attempt, status_code, next_retry_at

outbox_events
id, type, payload, created_at, published_at
Written in the same transaction as the change
import_jobs
id, status, mapping, stats, error_file_key

audit_events
actor, action, resource_type, resource_id, before, after, ip, at
Partitioned monthly
Value encoding
Attribute type
JSONB value
Text
"string"
Number
12.5
Currency
{"amount": "1234.50", "currency": "USD"} (amount as decimal string)
Checkbox
true
Date
"2026-10-29"
Timestamp
"2026-10-29T10:00:00Z"
Rating
4
Select, status
option or status ID; an array when multi-valued
User
{"type": "member", "id": "…"}
Record reference, relationship
{"object_id": "…", "record_id": "…"}, or an array; mirrored in record_links
Personal name
{"first": "…", "last": "…", "full": "…"}
Email address
{"address": "…", "domain": "…"}
Phone number
{"e164": "+8801…", "country": "BD"}
Domain
{"domain": "…", "root": "…"}
Location
{"line1", "line2", "city", "region", "postcode", "country_code", "lat", "lng"}
Formula, AI attribute
the computed result in the target type, plus "computed": true
Interaction
not stored in values; read from comint_stats
Record write path
Every create, update, upsert, merge and delete goes through one RecordWriteService, in one transaction:
1. Check the actor's access to the object or list.
2. Validate each value against its attribute type and constraints.
3. Claim or check unique_values for unique attributes (upsert uses this to find the match).
4. Close the current attribute_values row (active_until = now) and insert the new one.
5. Update the JSONB values on records or list_entries, and record_links for references; write the inverse side for relationships.
6. Recompute same-record formula attributes.
7. Insert an audit event and an outbox event (record.updated with changed attribute IDs).
Query and search engine
Views, the API, reports, workflows and the AI all query through one engine: a JSON filter tree is validated against the schema, combined with the caller's permission filter, and compiled to SQL with jOOQ. No module writes its own SQL against records.
Filter language
{
  "$and": [
    { "attribute": "stage", "op": "in", "value": ["<status-id>", "<status-id>"] },
    { "attribute": "owner", "op": "eq", "value": "$current_member" },
    { "$or": [
      { "attribute": "company.employee_count", "op": "gte", "value": 50 },
      { "attribute": "value", "op": "gt", "value": { "amount": "10000", "currency": "USD" } }
    ]}
  ]
}
• Attributes are referenced by API slug; a dotted path follows a record reference or relationship (for example company.employee_count).
• $current_member and relative dates ($today, $days_ago(30)) resolve at query time, so saved views work for every user.
• An optional as_of timestamp evaluates the filter against attribute_values history instead of current values.
Operators by type
Type
Operators
Text, personal name
eq, neq, contains, not_contains, starts_with, is_empty, is_not_empty
Number, currency, rating
eq, neq, gt, gte, lt, lte, between, is_empty
Date, timestamp
on, before, after, between, relative ranges, is_empty
Checkbox
is_true, is_false
Select, status, user
in, not_in, is_empty; status also supports time_in_stage_gt
Multi-select
contains_any, contains_all, contains_none
Record reference, relationship
in, not_in, is_empty, plus any filter on the target via a path
Email, phone, domain
eq, contains, domain_eq
Location
country_in, city_eq, region_eq
Compiling to SQL
• Current-value filters read records.values -> '<attribute_id>' with a cast per type; currency comparisons match only values in the filter's currency.
• Paths join through record_links to the target records row.
• Every compiled query adds workspace_id = :ws and the permission predicate from the access engine.
• Sorts use the same expressions; nulls sort last.
Indexing strategy
• A GIN index on values serves equality and containment filters.
• An index advisor job watches saved views and API usage; when an attribute is filtered or sorted on an object above a size threshold, it creates an expression B-tree index concurrently, and drops unused ones.
• record_links has indexes on (attribute_id, source_id) and (attribute_id, target_id).
Pagination and counts
• Keyset (cursor) pagination on (sort value, id), returned as an opaque cursor.
• Counts are exact up to a cap, then shown as an estimate.
Search
• search_doc (tsvector) is built from name, emails, domains, phone numbers and social handles; display_name has a trigram index.
• Ranking: exact identifier match (via unique_values), then prefix match, then trigram similarity, then recent activity.
• Results are filtered by the caller's access before they are returned.
• When search load outgrows PostgreSQL, the same documents stream to OpenSearch from the outbox with no API change.
Aggregations
Reports use the same compiler with GROUP BY on attribute expressions and SUM, AVG or COUNT measures. Historical and time-comparison reports query attribute_values for the value valid at each point in time.
Permission engine
One AccessService answers "what level does this principal have on this resource" for every caller, and the query engine turns its answer into a SQL predicate. Access is set per object, list, dashboard, workflow and sequence; there are no per-record permissions in scope.
Levels and actions
Level
Read data
Write data
Manage settings, attributes, access
Full access
Yes
Yes
Yes
Read and write
Yes
Yes (records and entries; list attributes on lists)
No
Read only
Yes
No
No
No access
No
No
No
Principals: member, team, workspace (the default), workflow, agent, API token.
Resolution for a member
1. Admins get Full access on every resource.
2. If a member-specific grant exists, it applies.
3. Otherwise the highest level among the member's teams applies.
4. Otherwise the workspace default applies.
Resolution for automation and integrations
• Workflows and agents: the higher of the workspace default and any workflow-specific grant, capped at the run-as member's own level.
• Workspace API tokens: their own grants plus scopes; no admin rights unless scoped.
• OAuth and MCP: the signed-in user's level, narrowed by the granted scopes.
Related rules
• List entries need list access; list attribute values on a record page show only to members with list access.
• Record comments follow object access; list comments follow list access.
• Email visibility: the account owner sees everything. Others see full content, subject and metadata, or metadata only according to the account's sharing level, widened by email_shares. Blocklisted addresses are never stored.
Caching
• The resolved map for each principal is cached in Redis and in a short-lived local cache.
• Any change to grants, teams, membership or roles bumps a workspace permission version, which invalidates all cached maps for that workspace.
Enforcement points
Surface
How access is applied
REST and internal API
Method-level checks before any service call
Query engine
Allowed object and list IDs added to every SQL query
Search
Results filtered before ranking is returned
Exports
Same query path as views
Webhooks
Payloads limited to what the webhook's token can read
Workflows and agents
Run as the named member, with the cap above
AI retrieval
Vector and keyword results filtered by allowed resources and email visibility
Realtime updates
Events pushed only to sockets whose member can read the resource
Verification
• A generated permission-matrix test (principal × resource × action) runs in CI.
• An ArchUnit rule fails the build if any class outside records, lists and query reads their tables directly.
Email and calendar sync
Each connected account runs a durable backfill once, then incremental syncs triggered by provider push notifications, with polling as a safety net. Every message and event flows through the same ingestion pipeline, which creates and links records.
Backfill and incremental sync share the fetch step and the ingestion pipeline; blocklisted mail never reaches storage, and every linked interaction fans out to four downstream consumers.
Provider APIs
Provider
Mail
Calendar
Change signal
Google
Gmail API, history ID cursor
Calendar API, sync token
Gmail watch through Pub/Sub; calendar push channels
Microsoft
Graph messages with delta queries
Graph events with delta queries
Graph change-notification subscriptions
Backfill
• A BackfillWorkflow per account pages history newest first, within a configurable window, and checkpoints its cursor so restarts resume.
• Progress (messages done, estimate) shows in account settings.
Incremental sync
• A push notification starts a debounced IncrementalSyncWorkflow per account that reads changes since the stored cursor.
• A scheduled poll catches missed notifications; push subscriptions are renewed before they expire.
Ingestion pipeline (per message or event)
1. Drop it if any participant is on a workspace or member blocklist.
2. Store metadata; store the body encrypted in object storage.
3. Deduplicate: messages by RFC Message-ID across teammates' accounts, events by iCalUID, so one email or meeting appears once with several account links.
4. Upsert People by email through unique_values.
5. Upsert Companies by domain, skipping free-mail domains and the workspace's own domains, unless the admin turned automatic company creation off.
6. Link the person to the company; link the interaction to all participant records and their open deals.
7. Emit interaction.created; enrichment and communication-intelligence jobs subscribe to it.
Communication intelligence
• A job updates comint_stats per record and member: first, last and next interaction, counts and strength.
• Proposed strength score: weighted by recency, frequency and two-way exchange, decaying over time, shown in four bands (very strong, strong, good, weak).
Sending
Outbound mail goes through the provider's own send API so it appears in the user's Sent folder and threads correctly; replies are matched by thread and Message-ID.
Failure handling
• Per-user rate limiting with exponential backoff on provider 429 and 5xx responses.
• Revoked or expired tokens mark the account "needs reconnect" and notify its owner.
• Poison messages go to a dead-letter table with the error, without blocking the account.
Workflow, sequence and agent execution
A workflow is a versioned graph that one generic Temporal workflow interprets; every block runs as a Temporal activity. This gives durable runs, timers, retries, pause, cancel and replay without a home-built engine.
Definition format
{
  "trigger": { "type": "record.updated", "object": "deals", "attributes": ["stage"] },
  "blocks": [
    { "id": "b1", "type": "agent.run", "config": { "agent_id": "…", "input": "{{trigger.record}}" } },
    { "id": "b2", "type": "logic.if", "config": { "filter": { "attribute": "{{b1.score}}", "op": "gte", "value": 80 } } },
    { "id": "b3", "type": "sequence.enrol", "config": { "sequence_id": "…" } }
  ],
  "edges": [
    { "from": "trigger", "to": "b1" },
    { "from": "b1", "to": "b2" },
    { "from": "b2", "outcome": "true", "to": "b3" }
  ]
}
• Publishing stores an immutable version; running workflows keep the version they started on.
• {{…}} expressions reference the trigger and earlier block outcomes, typed by each block's outcome schema.
Triggers
Trigger
Mechanism
Record or entry events
A trigger router consumes outbox events and starts runs for matching live workflows
Schedule
Temporal schedules
Incoming webhook
A unique URL with a secret starts a run with the payload
Manual
Button on a record or list, or the API
App-provided
SDK trigger blocks register and deregister through lifecycle handlers (phase 5)
Block contract
Every block, built-in or from an app, implements one interface: a config schema, an outcome schema, and execute(context, config) → outcome. Deferred blocks start work and finish when a callback signal arrives.
Execution rules
• Run-as: activities receive the run-as member's capped access (see permission engine).
• Idempotency: each activity gets a key of run, block and loop iteration; record writes and sends honour it.
• Loop prevention: writes carry the actor workflow:<id>; a workflow ignores events it caused, and a causation chain stops at a fixed depth.
• Limits: loops have a maximum iteration count; each run has a maximum step count.
• Credits: AI and integration blocks reserve credits before running and settle the actual cost after; with no credits the run pauses with status "out of credits".
• History: an activity interceptor writes each step's input, output, error and cost to workflow_run_steps.
• Controls: pause, resume and cancel are Temporal signals; resume-from-failure resets the run to the failed step; re-run starts a new run with the original trigger payload.
Code and HTTP blocks
• Custom JavaScript runs in a GraalJS sandbox with no host access and limits on time, memory and output size.
• HTTP requests go through an egress proxy that blocks private and metadata IP ranges.
Sequences
• Each enrolment is a SequenceEnrolmentWorkflow: step, wait (calendar or business days), send-window check in the recipient's time zone, send through the chosen sender's mailbox.
• Reply, meeting-booked and unsubscribe events from the sync pipeline arrive as signals and exit the enrolment.
• Per-sender daily caps and plan email limits are checked before every send.
Agents
An agent block calls the intelligence module's agent loop: bounded tool-calling steps, a final answer validated against the agent's output schema, one retry on a schema mismatch, and the full trace saved to agent_runs.
Worker task queues
Separate Temporal task queues for workflows, sequences, sync, AI and imports, so each scales and fails independently.
AI architecture
All AI features share four parts: a model gateway, a permission-aware retrieval index, one tool registry, and an approval layer for writes. The assistant, custom agents, AI attributes, call intelligence and the MCP server are different front ends on these parts.
Components
Component
Responsibility
Model gateway
One interface over several LLM vendors: model registry, streaming, retries, fallback model, timeouts, token counting, credit rates per model
Embedding pipeline
Consumes outbox events (note saved, email ingested, transcript ready, record updated), chunks text, embeds it and writes embeddings with source and access metadata
Hybrid retrieval
Vector search plus keyword search, merged by reciprocal rank fusion; the permission predicate is applied in SQL before ranking
Tool registry
Typed tools over existing services: search, query records, get record, run report, read-only SQL, search emails, notes and calls, propose update, propose task, draft email, web search and fetch
Assistant loop
Workspace custom context, user context and current page; a bounded tool-calling loop; streamed answers with citations to records, emails and calls
Approval layer
The assistant never writes directly; it creates ai_change_proposals, and acceptance applies them through RecordWriteService as the user
Credit meter
Converts tokens and tool calls into credits and writes credit_ledger entries; checks balance before each call
Where writes are allowed without approval
• Workflow agent blocks and AI attributes write directly, because an admin configured them; the values are marked as AI-filled.
• MCP write tools ask for confirmation in the AI client, as the MCP spec's safety annotations allow.
Web research agent
Uses a web search API and a fetcher behind the egress proxy, and stores the source URL with every value it fills.
Call intelligence pipeline
1. A meeting-bot service joins Zoom, Google Meet or Teams from the synced calendar (build or buy is an open decision; buying is recommended).
2. Media is stored encrypted in object storage.
3. A speech-to-text provider with speaker labels and 100+ languages produces the transcript.
4. The summary template prompt produces the summary; an extraction prompt produces insights and proposed record updates and tasks.
5. The call_recording.created event fires when processing finishes or fails.
Safety
• Email bodies, transcripts and web pages go into prompts as delimited data, never as instructions.
• Side-effecting tools in the assistant always produce proposals, so injected text cannot change data on its own.
• Agent outputs are validated against their schema before use.
• Vendor contracts must exclude training on customer data; prompts and traces are kept only as long as run logs.
Quality
A fixed evaluation set of workspace questions and agent tasks runs in CI against each prompt or model change, and a drop below the agreed score blocks release.
API conventions, events and webhooks
The web app uses the same public REST API that customers get, plus a small /internal namespace for UI-only aggregates. The OpenAPI spec is written first and both the Spring server interfaces and the TypeScript client are generated from it.
Conventions
Topic
Rule
Base path
/v1; breaking changes only in a new major version; deprecations announced with Deprecation and Sunset headers
Addressing
Objects, lists and attributes by ID or API slug; records and entries by ID
Auth
Authorization: Bearer <token> for workspace tokens and OAuth access tokens
Scopes
record:read, record:write, list:read, list:write, schema:write, note:*, task:*, comment:*, file:*, email:metadata, call:read, member:read, webhook:manage
Writes
POST creates and fails on unique conflict; PUT …?match=<attribute> upserts; PATCH updates given fields and appends to multi-value attributes; PUT on a record replaces given multi-value attributes
Queries
POST …/query with the filter language body, sorts, limit and cursor
Pagination
Cursor based: limit (max 500) and cursor in; next_cursor out
Idempotency
Idempotency-Key header on every POST, remembered for 24 hours
Errors
RFC 9457 application/problem+json with type, title, status, detail, a machine code and per-field errors
Rate limits
RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset headers; 429 with Retry-After
Time and money
Timestamps in ISO 8601 UTC; money as decimal strings with an ISO 4217 code
Core endpoints (phases 1 and 2)
Area
Endpoints
Objects
GET /v1/objects, POST /v1/objects, GET / PATCH / DELETE /v1/objects/{object}
Attributes
GET / POST /v1/{objects or lists}/{id}/attributes, PATCH …/attributes/{attribute}, plus /options and /statuses under an attribute
Records
POST /v1/objects/{object}/records, PUT …/records?match=, POST …/records/query, GET / PATCH / PUT / DELETE …/records/{id}, POST …/records/merge, GET …/records/{id}/attributes/{attribute}/values?history=true, GET …/records/{id}/entries
Search
POST /v1/search
Lists and entries
GET / POST /v1/lists, PATCH /v1/lists/{list}, POST /v1/lists/{list}/entries, PUT …/entries?parent=, POST …/entries/query, GET / PATCH / DELETE …/entries/{id}
Views
GET /v1/{objects or lists}/{id}/views, POST, PATCH, DELETE
Notes, tasks, comments
/v1/notes, /v1/tasks, /v1/threads, /v1/comments with standard CRUD
Files
GET /v1/files?record=, POST /v1/files (multipart), GET /v1/files/{id}/download (redirect to a signed URL)
Interactions
GET /v1/emails (metadata only), /v1/meetings, /v1/call-recordings
Workspace
GET /v1/members, /v1/teams, GET /v1/me (token identity and scopes)
Integration
/v1/webhooks, /v1/imports, /v1/exports
Domain events
• Every state change writes an event to outbox_events in the same transaction.
• A relay publishes outbox rows to Redis Streams (moving to Kafka only if volume requires it).
• Consumers: webhook dispatcher, workflow trigger router, search and embedding indexers, realtime fan-out, communication-intelligence jobs and the audit exporter.
{
  "id": "evt_…",
  "type": "record.updated",
  "workspace_id": "…",
  "occurred_at": "2026-10-29T10:00:00Z",
  "actor": { "type": "member", "id": "…" },
  "resource": { "type": "record", "object_id": "…", "id": "…" },
  "data": { "changed_attributes": ["…"] },
  "causation_id": "…",
  "correlation_id": "…"
}
Webhooks
• Payloads are signed with HMAC-SHA256 over the timestamp and body, sent in a signature header with the timestamp.
• Delivery is at least once; consumers deduplicate by event id; order is not guaranteed.
• Failed deliveries retry with exponential backoff for up to 24 hours; a webhook that keeps failing is disabled and its creator is emailed.
• Every attempt is logged and visible in developer settings.
Frontend architecture and design system
The web app is a React single-page app served from a CDN, talking only to the generated API client and one WebSocket. An attribute-type registry on the frontend mirrors the backend's types, so every table cell, editor, filter control and record field for a type comes from one place.
Libraries
Need
Choice
Build and language
Vite, TypeScript in strict mode
Routing
React Router with workspace-scoped routes
Server state
TanStack Query on the generated OpenAPI client
Local UI state
Zustand
Data grid
TanStack Table with TanStack Virtual for rows and columns
Drag and drop
dnd-kit (kanban, column reordering, sidebar)
Rich text and co-editing
Tiptap with Yjs over the app WebSocket
Forms and validation
react-hook-form with zod schemas generated from OpenAPI
Accessible primitives
Radix UI
Styling
Tailwind CSS on our own design tokens
Command menu
cmdk
Charts
A charting library chosen in phase 3
Internationalisation
react-i18next scaffolding, English first
Routes
Route
Screen
/:ws
Home (SC-03)
/:ws/objects/:object/views/:view
Object table (SC-04)
/:ws/lists/:list/views/:view
List table or kanban (SC-05, SC-06)
/:ws/records/:object/:id/:tab?
Record page (SC-07)
/:ws/notes/:id
Note editor (SC-09)
/:ws/tasks
Tasks (SC-10)
/:ws/settings/*
Workspace and account settings (SC-14 to SC-18, SC-22, SC-28)
/:ws/workflows/:id?, /:ws/sequences/:id?, /:ws/dashboards/:id?, /:ws/calls/:id?
Later-phase screens
Data and realtime
• Inline edits and stage moves are optimistic, with rollback and a toast on failure.
• WebSocket events patch or invalidate the matching query cache entries, so other users' changes appear live.
• Large tables fetch pages by cursor as the user scrolls.
Attribute-type registry
For each attribute type: a display renderer, an inline editor, a filter control with its operators, a value formatter, and a zod validator. Adding a type means adding one registry entry on each side.
Design system
• Our own tokens for colour, type scale, spacing, radius and elevation, with light and dark themes.
• Core components: app shell, sidebar, page header, data grid, kanban board, record header, field list, filter bar, side panel, dialog, menu, toast, empty state, skeleton.
• Every component lives in Storybook with its states (loading, empty, error, no access, plan limit).
• Visual regression tests run Playwright screenshots of Storybook in CI.
Quality targets
• WCAG 2.2 AA; every action reachable by keyboard; a documented shortcut map.
• Route-level code splitting; a JavaScript budget per route enforced in CI.
• Frontend errors reported to the error tracker with the request ID.
Mobile (phase 5)
React Native apps reuse the generated TypeScript client, the attribute-type registry logic and the design tokens.
Security, tenancy and compliance
All workspaces share one database schema, isolated by workspace_id in application code and again by PostgreSQL row-level security. Sensitive content (tokens, email bodies, recordings) is encrypted with per-workspace keys, so deleting a workspace's key makes its content unreadable.
Tenant isolation
• A transaction hook sets app.workspace_id on every database connection; RLS policies on every tenant table compare against it.
• The application's database role cannot bypass RLS; migrations run under a separate role.
• Redis keys, object-storage paths, search documents and embeddings are all prefixed or filtered by workspace.
• workspace_id is the shard key, so a large tenant can later move to its own database.
Authentication
Method
Implementation
Web sessions
Server-side sessions in Redis; HttpOnly, Secure, SameSite cookies; CSRF tokens on state-changing requests
Sign-in
Google and Microsoft OAuth; email magic link with optional TOTP or passkey second factor
Workspace API tokens
Random secrets shown once, stored as hashes, with a visible prefix for identification
Third-party apps and MCP
OAuth 2.1 with PKCE on Spring Authorization Server
Enterprise SSO and SCIM
Keycloak brokering SAML and OIDC; SCIM 2.0 endpoints mapped to members and teams (phase 5)
Encryption and secrets
• TLS on every connection; encrypted storage for database, backups and object storage.
• Envelope encryption with a cloud KMS for provider OAuth tokens, webhook secrets, email bodies and recordings, using a data key per workspace.
• Application secrets live in a secret manager, never in the repository.
Application security
• Strict Content Security Policy; output encoding by default in React.
• Uploaded files are type-checked and malware-scanned; downloads use short-lived signed URLs.
• All outbound HTTP from workflows, agents and webhooks goes through the egress proxy.
• Dependency scanning, static analysis and secret scanning run on every pull request; an external penetration test runs before general availability.
Audit
Logins, admin actions, permission and role changes, token creation, exports and data deletions write audit_events. Enterprise workspaces can view and export the audit log.
Privacy and compliance work
• Data subject requests: find, export, delete or anonymise everything about an email address across records, emails, notes and calls.
• Retention settings: per workspace for email bodies and call recordings.
• Recording consent: the bot joins under a visible name and announces recording; members can opt out of auto-recording.
• Google verification: Gmail's restricted scopes require Google OAuth app verification and an annual third-party security assessment before public launch.
• Microsoft verification: publisher verification for the Microsoft Entra app.
• Contracts: a DPA template and a public sub-processor list.
• Data residency: separate regional deployments (EU, US); a workspace's region is fixed at creation.
• Backups: point-in-time recovery, cross-region copies and a quarterly restore test.
Testing, environments and delivery
Every change must pass the same automated gates whether a person or Claude Code wrote it. Real dependencies run in containers in CI, so tests exercise PostgreSQL, Redis and Temporal rather than mocks.
Test layers
Layer
Tools
What it covers
Unit
JUnit 5, AssertJ; Vitest
Validators, filter compiler, permission resolution, block handlers, UI logic
Integration
Spring Boot tests with Testcontainers (PostgreSQL, Redis, Temporal test server, MinIO)
Each module through its public interface, including SQL and RLS
Architecture
Spring Modulith verification, ArchUnit
Module boundaries; no direct table access across modules
Permissions
Generated matrix tests
Every principal, resource and action combination
API contract
Response validation against OpenAPI; OpenAPI diff in CI
No undocumented fields; breaking changes blocked
Provider fakes
WireMock stubs for Gmail, Calendar and Graph
Sync backfill, deltas, token expiry, rate limits
End to end
Playwright
Core journeys W1 to W9 as each phase delivers them
Performance
k6 or Gatling against a seeded 1M-record workspace
NFR latency targets, run nightly
Visual
Playwright screenshots of Storybook
Component regressions
AI
Evaluation set
Assistant and agent quality
Definition of done (every story)
• Tests at the right layers, all green in CI
• OpenAPI spec updated and the client regenerated
• Flyway migration that is backward compatible with the running version
• Access checks on every new endpoint and query
• Audit and outbox events for every state change
• Storybook entry with all states for any new component
• Acceptance criteria from the PRD requirement verified
Environments
Environment
Purpose
Local
Docker Compose with PostgreSQL, Redis, Temporal, MinIO and provider fakes; seed script for demo data
Preview
An ephemeral environment per pull request
Staging
Production-like, with synthetic data and real provider sandbox accounts
Production
One deployment per region
Pipeline
1. Build, format and lint (Spotless and Checkstyle; ESLint and Prettier).
2. Unit, integration, architecture and permission tests.
3. OpenAPI diff and frontend bundle budget.
4. Dependency, static and secret scans.
5. Build container images and deploy the preview.
6. On merge: deploy to staging, run end-to-end tests, then roll out to production behind feature flags.
Migrations follow expand, migrate, contract, so old and new versions can run side by side during a rollout.
Observability
• OpenTelemetry traces and Micrometer metrics on every request, job and activity.
• Structured JSON logs carrying workspace_id, request_id and correlation_id.
• Dashboards and alerts for API latency, error rate, sync lag, workflow success rate, webhook failures and credit usage.
• The Temporal UI for inspecting individual runs; a public status page.
Repository layout and Claude Code conventions
One monorepo holds the API spec, backend, frontend, tests and infrastructure, with a CLAUDE.md at the root that every Claude Code session reads first. Each work item from the WBS is built in its own session and branch.
Repository layout
crm/
  CLAUDE.md                  rules every session follows
  api/openapi.yaml           source of truth for the REST API
  backend/
    pom.xml                  parent build
    app/                     Spring Boot application and wiring
    shared/                  ids, actor, errors, events, test fixtures
    modules/
      platform/ schema/ records/ lists/ query/ access/ collab/
      importexport/ audit/ interactions/ enrichment/ messaging/
      integration/ automation/ reporting/ billing/ intelligence/ mcp/ apps/
        src/main/java/.../<module>/api/        public interfaces and DTOs
        src/main/java/.../<module>/internal/   implementation, package-private
        src/main/java/.../<module>/web/        controllers
        src/main/resources/db/migration/<module>/
  frontend/
    src/app/                 shell, routes, providers
    src/features/<module>/   screens and hooks per module
    src/components/          design system
    src/attribute-types/     type registry
    src/api/                 generated client (never edited by hand)
    .storybook/
  e2e/                       Playwright journeys
  perf/                      load tests and seed data
  infra/                     docker-compose, Helm charts, Terraform
  docs/adr/                  architecture decision records
CLAUDE.md rules (seed)
1. Every task names its PRD requirement IDs and WBS item; read those sections of the PRD and technical design before coding.
2. Propose a short plan and wait for approval before changing code.
3. API changes start in api/openapi.yaml; regenerate the server interfaces and the TypeScript client; never hand-edit generated code.
4. Only the records, lists and query modules touch their tables; everything else calls RecordWriteService and QueryService.
5. Every endpoint and query goes through AccessService; every state change writes an audit event and an outbox event.
6. Add new Flyway migrations only; never edit an applied migration; keep them backward compatible.
7. Write a failing test for each acceptance criterion first, then the code.
8. Run make verify (backend and frontend tests, lint, architecture checks) and report the result before finishing.
9. Frontend values render through the attribute-type registry and use design tokens only.
10. No new dependency, service or pattern without an ADR in docs/adr/.
Developer commands
Command
Does
make dev
Starts the local stack and both apps with hot reload
make seed
Loads a demo workspace with sample objects, lists and records
make verify
Runs every CI gate locally
make e2e
Runs Playwright journeys against the local stack
make api
Regenerates code from the OpenAPI spec
Working rhythm with Claude Code
1. Pick one WBS item; give Claude Code its requirement IDs and the relevant technical design sections.
2. Review its plan, then let it implement with tests.
3. Review the diff and the make verify output; ask for fixes in the same session.
4. Open a pull request listing requirement IDs, tests added and any ADR; merge only on a green pipeline.