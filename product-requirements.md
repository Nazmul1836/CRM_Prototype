CRM Platform PRD (Attio Reference)
Oct 29, 2026 · @Fintech
Overview
We will build an AI-native, fully configurable CRM that matches Attio's feature set: a flexible object and record data model that fills itself from email and calendar, with workflows, AI agents, call intelligence, sequences and reporting running on the same data.
Problem. Revenue teams outgrow spreadsheets, and legacy CRMs force a fixed schema and manual data entry. Attio's pitch is a CRM that models any business (deals, investors, partners, product users) and keeps itself current through syncing, enrichment and agents.
Product goals
• Configurable model: Admins create objects, attributes and relationships without engineering help.
• Self-populating: Connecting a mailbox and calendar creates people and company records and logs every interaction.
• One context for people and agents: Workflows and AI agents read and write the same records, under the same permissions, as users.
• Real-time insight: Reports, funnels and forecasts run on live data.
• Open platform: REST API, webhooks, an app SDK and an MCP server let customers and partners extend the product.
How Attio is used here. This PRD is built from Attio's public website, pricing page, help centre and developer docs as of 29 Oct 2026. The logged-in app was not walked through, so screen-level detail is described from docs and marked as such. Our product uses its own name, branding, copy and visual design; only the feature set and workflows are taken as reference.
Build decisions (stack, schema, engines, conventions) are in Technical design.
Scope and non-goals
The product covers all 27 modules in the feature inventory, delivered as a multi-tenant cloud service across five phases. The non-goals below are our proposal; each can be revisited, but none should be built without a product decision.
In scope
• Configurable CRM data model, views, record pages, collaboration and permissions
• Mail, calendar and meeting capture that fills the CRM automatically
• Workflows, sequences, AI assistant and custom agents running on CRM data
• Reports, dashboards and forecasts
• Public API, webhooks, app SDK, MCP server and SQL access
• Web app first; mobile, desktop and browser extension in phase 5
Non-goals
Not building
Instead
Marketing automation (campaigns, landing pages, form builder)
Integrate Mailchimp, Typeform and similar tools
Support ticketing or a help desk
Integrate support tools and show their data on records
Quotes, CPQ, invoicing or e-signature
Track quotes and contracts as files and attributes
A built-in phone dialer
Log calls from telephony apps as activities
Our own prospect database
License enrichment data from a provider
On-premise or self-hosted deployment
Cloud only; revisit if a customer requires it
Offline mode
Online web and mobile clients
Copying Attio's brand, copy or visual design
Our own name, design system and content
Success metrics
Success means teams get a working CRM from their inbox with no manual entry, then keep using and automating it. Targets for each metric are set by the product owner before launch; the product must log every event needed to measure them from phase 1.
Area
Metric
Definition
Activation
Mailbox connected
Share of new workspaces that connect a mail account in the first session
Activation
First pipeline
Share of new workspaces that create a list with a status attribute and at least 5 entries
Activation
Team invited
Share of workspaces with 2+ active members after sign-up
Engagement
Weekly active seats
Share of paid seats active in a given week
Engagement
Records worked
Record edits, notes and stage moves per active seat per week
Data quality
Auto-built records
Share of People and Company records created by sync rather than by hand
Data quality
Enrichment coverage
Share of company records with enriched description, location and headcount
Data quality
Duplicate rate
Share of records later merged
Automation
Workflow adoption
Share of workspaces with at least one active workflow
Automation
Run success rate
Share of workflow runs that complete without error
AI
Assistant usage
Weekly active users of the AI assistant per workspace
AI
Suggestion acceptance
Share of AI-proposed record changes accepted as-is or after edit
Business
Free to paid conversion
Share of workspaces that move to a paid plan
Business
Net revenue retention
Revenue from a cohort after expansion, contraction and churn
Reliability
Sync lag
Time from an email arriving in the provider to it showing on the record
Target users and roles
The product serves revenue teams at startups and scale-ups, plus investors running deal flow. Every user is either an admin or a member, and access to each object, list, dashboard, workflow and sequence is set separately.
Personas
Persona
Main jobs in the product
Founder or first sales hire
Connect inbox, get contacts and companies auto-built, run a first pipeline
Account executive or SDR
Work pipeline boards, run sequences, prep and recap calls, log notes and tasks
Sales manager or RevOps admin
Design the data model, build workflows, set permissions, run reports and forecasts
Customer success manager
Track account health, renewals and expansion signals
Investor or deal team (VC)
Track deal flow, portfolio companies and relationships
Developer or integrator
Sync product, billing and warehouse data through API, webhooks, SDK and MCP
AI agent (non-human actor)
Run research, scoring, routing and follow-ups under an assigned user's permissions
Workspace roles
• Admin: Manages workspace settings, members, teams, billing, apps and integrations, and can see and edit all lists.
• Member: Uses the CRM within the access granted to them.
Access levels (applied per object, list, dashboard, workflow and sequence)
Level
What it allows
Full access
View and edit data, manage settings, attributes and permissions
Read and write
View and edit records or entries; add and edit list attributes
Read only
View data only
No access
Hidden from the user
Access rules
• Access is set at three levels: workspace default, team and individual member.
• A member-specific setting overrides team settings. Across several teams, the most permissive team level applies.
• Workflows inherit the workspace default and can be granted extra access. Each workflow runs with the permissions of its assigned user.
• AI features answer only from data the asking user is allowed to see.
Feature inventory
Attio's public material shows 27 modules. We propose 10 as Foundation, 9 as Core and 8 as Advanced; the priority column is our recommendation, not Attio's, and can be changed per row.
Module
What it does (Attio reference)
Priority
Objects and records
Standard People, Companies, Deals, Users, Workspaces; admin-created custom objects
Foundation
Attributes
15+ typed fields, system and enriched labels, relationship and formula attributes
Foundation
Lists and entries
Process-specific groupings of one object, with list-only attributes
Foundation
Views
Table and kanban, filters, sorts, saved views, time-in-stage, bulk moves
Foundation
Record page and activity timeline
Details, lists, emails, calls, notes, tasks and full history per record
Foundation
Search and navigation
Fuzzy search on names, domains, emails, phones, social handles; sidebar; command menu
Foundation
Import and export
CSV and Excel import, migration from Salesforce, HubSpot, Pipedrive, Zoho; CSV export
Foundation
Email and calendar sync
Google and Microsoft accounts; auto-creates and links people and companies
Foundation
Notes, tasks and comments
Real-time notes with templates, tasks with assignees and deadlines, threaded comments
Foundation
Members, teams and permissions
Admin and member roles, teams, four access levels per resource
Foundation
Communication intelligence
Connection strength, strongest connection, first, last and next interaction
Core
Enrichment
Company and person data (logo, category, location, headcount, funding, ARR) from public sources
Core
Email sending and templates
Send from the CRM with record variables, templates and bulk send
Core
Files on records
Upload and connected files and folders on any record
Core
Workflows
Triggers, branches, loops, delays, integration and code blocks, run history
Core
Sequences
Signal-based enrolment, multi-step email, auto sender, reply and meeting tracking
Core
Reports and dashboards
Insight, funnel, historical and time-comparison reports, targets, shared dashboards
Core
REST API, webhooks, OAuth
Full CRUD on the data model, event webhooks, OAuth apps
Core
Billing, plans and credits
Seat plans, seat and workspace credits for AI and workflows
Core
Call intelligence
Records Zoom, Meet and Teams calls; transcripts in 100+ languages, summaries, insights
Advanced
AI assistant (Ask Attio)
Natural-language Q&A and actions over CRM data, with approve or reject
Advanced
Custom agents and web agent
Prompt-defined agents with chosen model, tools and structured outputs
Advanced
SQL access
Read-only SQL over workspace data (Enterprise)
Advanced
App SDK and app store
Custom record widgets, tabs, actions, pages and workflow blocks
Advanced
MCP server
Hosted MCP for Claude, ChatGPT, Cursor and other AI clients
Advanced
SSO and SCIM
SAML sign-in and user and team provisioning (Enterprise)
Advanced
Mobile apps and browser extension
iOS, Android, macOS desktop, Chrome and Gmail extension
Advanced
Data model
The whole product rests on a metadata-driven model: admins define objects and attributes at runtime, records hold values, and lists layer process-specific data on top without changing the record. Every attribute value is versioned, which powers history, audit and historical reports.
Objects define record types and attributes define their fields; lists, collaboration items, interactions and activities all point at records rather than copying them.
Core entities
Entity
Definition
Key rules
Workspace
The tenant: all data, members and billing
A user can belong to several workspaces; each has its own data and plan
Object
A record type, like a table
People and Companies on by default; Deals, Users, Workspaces optional; custom objects added by admins; system objects can be renamed
Record
One instance of an object, like a row
Has a record_id; can be matched by a unique attribute (email on People, domain on Companies) for upsert; two records of one object can be merged
Attribute
A typed field on an object, list or activity
System, custom or enriched; only admins change object attributes
List
A process (pipeline, recruiting, onboarding) built on one object
Has its own attributes and views; system attributes Parent record, Added at, Added by
List entry
A record's membership in a list
The same record can have several entries in one list, each with its own values
Activity
An event type, such as phone call or site visit
Holds activity records with their own attributes, linked to records
Interaction
Synced emails, calendar events, meetings, call recordings
Linked to records automatically from participants; visibility follows sharing settings
Note, task, comment, file
Collaboration items attached to records or entries
Notes have rich text and templates; tasks have assignees, deadline, linked records; comments are threaded and resolvable
Actor
Who made a change
A member, API token, workflow, agent or system process
View
A saved table or kanban layout over an object or list
Own filters, sorts, columns and card rows
Attribute types
Type
Use
Text
Free text, also used for URLs
Number
Quantities and percentages
Currency
Amount plus currency code
Checkbox
Yes or no
Date
Calendar date without time zone
Timestamp
Date and time, stored in UTC
Rating
1 to 5 stars
Select / multi-select
One or several colour-coded options
Status
Ordered stages that drive kanban columns, with time-in-stage tracking
User (actor reference)
A workspace member as owner or assignee
Record reference
One-way link to records of chosen objects, single or multiple values
Relationship
Two-way link kept in sync on both records; object level only
Personal name
First and last name
Email address, phone number, domain
Validated contact identifiers
Location
Street, city, region, postcode, country
Interaction
Read-only first, last and next email or calendar interaction
Formula
Value computed from other attributes
AI attribute
Value filled by an AI or web research agent
Attribute properties: required, unique, default value, multiple values, description, archived.
Value history: each value is stored with active-from and active-until timestamps. Users can view an attribute's history, reports can rewind to any date, and migrations can write historic values. Enriched and communication-intelligence values do not keep history.
Archive vs delete: objects' attributes and options are archived, not deleted, so history and reports stay intact. Records and entries can be deleted.
Core user workflows
Nine journeys cover how people use the product end to end. Steps come from Attio's help centre and product pages; exact screens were not seen in the logged-in app.
W1. Workspace onboarding
1. User signs up with Google or Microsoft and names the workspace.
2. User connects email and calendar and picks a sharing level: metadata only, subject and metadata, or full content.
3. The system backfills mail and calendar history, creates People and Company records, links people to companies and enriches both.
4. User enables optional objects (Deals, Users, Workspaces) and starts lists from templates.
5. Admin invites members, assigns admins and creates teams.
6. User imports existing data from CSV, Excel or another CRM, maps columns to attributes and resolves duplicates.
W2. Build the data model
1. Admin creates a custom object (singular and plural name, slug, icon).
2. Admin adds attributes, picks a type and sets required, unique and default values.
3. Admin adds relationship attributes to link objects, choosing one-to-one, one-to-many or many-to-many.
4. Admin sets object access for the workspace, teams and individuals.
5. Users create saved table and kanban views with their own filters, sorts and columns.
W3. Run a pipeline
1. User creates a list on an object (for example Deals) from a template or from scratch.
2. User adds a Status attribute with stages and opens the kanban view.
3. Records join the list by search, bulk add, workflow or API.
4. User picks which attributes show on cards and sets a target time per stage.
5. User drags cards between stages, one at a time or in bulk; cards past the target time are flagged.
6. User filters by owner, stage or value and opens reports on conversion and time in stage.
W4. Work a relationship
1. User opens a record page: details, list memberships, activity timeline, emails, meetings, notes, tasks and files.
2. User checks connection strength, the teammate with the strongest connection and the last interaction.
3. User writes an email from the record using variables or a template and sends it, or bulk-sends to up to 50 recipients.
4. User shares single emails, or all emails with a person or company, with chosen teammates.
5. User adds a note, a task or a comment with @mentions.
W5. Record and act on a meeting
1. The call recorder joins a scheduled Zoom, Google Meet or Microsoft Teams meeting.
2. After the call, the system produces a transcript, a summary in a chosen template (for example SPICED) and insights such as buying signals and blockers.
3. The recording links to the meeting's people, companies and deals.
4. AI proposes record updates and follow-up tasks; the user accepts, edits or rejects each one.
5. User shares clips or the summary with teammates.
W6. Automate with a workflow
1. User starts a workflow from scratch, from a template, or by describing it in a sentence for AI to assemble.
2. User picks a trigger: record created or changed, schedule, webhook or manual run.
3. User adds blocks: conditions, branches, loops, delays, record actions, AI agents, integration steps, custom code.
4. User tests block by block, assigns the user it runs as, and publishes.
5. User monitors run history and agent logs, and pauses, cancels or re-runs single runs.
W7. Run an outreach sequence
1. User builds a sequence of email steps with delays and personalisation variables, with AI help on copy.
2. User sets sender rules, for example the record owner sends.
3. Contacts enrol manually, in bulk or from a signal such as account created or form filled.
4. Replies, booked meetings and unsubscribes exit contacts from the sequence.
5. User tracks each contact's step and the sequence's performance, and pauses or removes recipients.
W8. Report and forecast
1. User creates a report: picks the type, the object or list, the measure, group-by, segment and filters.
2. User adds targets and period comparisons, or rewinds to a past date.
3. User places reports on a dashboard and sets who can see or edit it.
4. Viewers click any number to see the records behind it.
W9. Ask the AI assistant
1. User asks a question in plain language, in the app, mobile or Slack.
2. The assistant searches records, emails, notes and calls, and runs reports or SQL as needed, within the user's permissions.
3. It answers with links to the source records.
4. For changes, it shows each proposed update as a card the user accepts, edits or rejects.
5. Users save good prompts to a shared prompt library.
Information architecture and screens
The app has 28 screens built on one shell: a left sidebar, a page area and an optional right panel. Layouts below are functional specs; the visual design is ours to create and must not copy Attio's.
Design principles
• Data-dense and fast: spreadsheet-like tables, inline editing, no page reloads.
• Keyboard-first: command menu, shortcuts for common actions, full keyboard navigation.
• One component kit: every screen uses the same table, field, filter, card and panel components.
• Clear provenance: enriched, AI-filled and synced values look different from typed ones.
• Safe AI: every AI change shows as a reviewable card before it is saved.
App shell
• Left sidebar: workspace switcher, search and command menu, Home, Notifications, Tasks, then Records (one entry per object), Lists, Dashboards, Workflows, Sequences, Calls, and Settings at the bottom. Users can reorder and favourite items.
• Page header: page title, view switcher, filter and sort bar, Share (access), view settings, and the assistant toggle.
• Right panel: opens a record preview from any table row, or the AI assistant; it never replaces the page.
Screen inventory
ID
Screen
Key elements
Phase
SC-01
Sign in and sign up
Google, Microsoft and email-link sign-in; workspace picker
Phase 1
SC-02
Onboarding
Workspace name, enable objects, pick list templates, invite members; mail connect step added in phase 2
Phase 1
SC-03
Home
Tasks due, recent records, favourites; meetings and assistant prompt added later
Phase 1
SC-04
Object table
View switcher, filters, sorts, columns, inline edit, bulk actions, import and export
Phase 1
SC-05
List page
Table and kanban views of entries, add entry, list settings
Phase 1
SC-06
Kanban board
Stage columns, configurable cards, time-in-stage flags, bulk move
Phase 1
SC-07
Record page
Header with actions, details sidebar, list memberships, tabs for activity, emails, calls, notes, tasks, files, comments
Phase 1
SC-08
Record preview
Side panel with key fields and recent activity, opened from any row
Phase 1
SC-09
Note editor
Rich text, mentions, templates, linked records
Phase 1
SC-10
Tasks
My tasks and team tasks, grouped by due date, filters by assignee and record
Phase 1
SC-11
Notifications
Mentions, assignments, due tasks, access requests; mark read
Phase 1
SC-12
Command menu and search
Fuzzy search across records, lists, views and actions
Phase 1
SC-13
Import wizard
Upload, map columns, choose match attribute, preview, run, report
Phase 1
SC-14
Workspace settings
General, members, teams, objects, lists, permissions
Phase 1
SC-15
Object and attribute editor
Object details, attribute list, create and edit attribute dialogs, options editor
Phase 1
SC-16
Account settings
Profile, connected mail and calendar accounts, sharing level, blocklist, notification preferences
Phase 2
SC-17
Email composer
To, CC, BCC, template picker, variables, send and bulk send
Phase 2
SC-18
Developer settings
API tokens and scopes, OAuth apps, webhooks and delivery logs
Phase 2
SC-19
Workflows
Workflow list and folders, builder canvas, block config panel, test mode, run history
Phase 3
SC-20
Sequences
Sequence list, step editor, enrolment list, performance
Phase 3
SC-21
Reports and dashboards
Report builder, dashboard grid, drill-down list, dashboard access
Phase 3
SC-22
Billing and usage
Plan, seats, invoices, credit balance and usage by feature, top-ups
Phase 3
SC-23
AI assistant
Chat panel, source links, change-approval cards, prompt library
Phase 4
SC-24
Agents
Agent builder (instructions, model, tools, outputs) and agent run log
Phase 4
SC-25
Calls
Call list, player with transcript, summary, insights and clips; recording settings
Phase 4
SC-26
App store
Browse, install and configure apps; app pages, widgets and tabs
Phase 5
SC-27
SQL console
Query editor, results grid, saved queries
Phase 5
SC-28
Security admin
SSO, SCIM, audit log, export limits, data residency
Phase 5
States every screen must handle
State
Behaviour
Loading
Skeleton of the final layout, no layout shift
Empty
Explains what goes here and offers the primary action
Error
Plain message, retry action, error ID for support
No access
Says the item exists and offers Request access
Plan limit
Names the limit reached and links to upgrade
Key screen detail: object table (SC-04)
• Virtualised rows and columns so large objects scroll smoothly.
• Column header menu: sort, filter, hide, move, relabel, edit attribute (admins).
• Cell editors match the attribute type: text, number, currency, date picker, select chips, user picker, record picker, location form.
• Row checkbox selection enables bulk edit, add to list, export, delete.
• The view auto-saves for its owner; shared views need Read and write access to change.
Key screen detail: record page (SC-07)
• Header: avatar or logo, name, key status chips, and actions (email, add to list, add task, more).
• Details sidebar: all attributes the user can see, grouped and editable inline; enriched values marked.
• Lists section: each list entry with its list attributes.
• Main area tabs: Activity (default), Emails, Calls, Notes, Tasks, Files, Comments; counts on each tab.
• Right side: communication intelligence (connection strength, last interaction) from phase 2.
Functional requirements
Requirements are grouped by module in the same order as the feature inventory. Each has a testable acceptance criterion; plan limits are enforced wherever a requirement mentions them.
Objects and records
ID
Requirement
Acceptance criteria
OBJ-1
Standard objects
New workspace has People and Companies; admin can enable Deals, Users and Workspaces, each with its system attributes
OBJ-2
Custom objects
Admin creates an object with singular and plural name, slug and icon; it appears in the sidebar and API on save; slug is unique; plan object limit blocks extra objects with an upgrade message
OBJ-3
Rename system objects
New name shows across the UI; API slug is unchanged
OBJ-4
Record create, edit, delete
Works from table, record page and API; a unique-attribute conflict blocks creation and names the existing record
OBJ-5
Upsert by matching attribute
Writing a person with an existing email updates that person instead of creating a duplicate
OBJ-6
Merge records
Primary record's values win where both have one; list entries, notes, tasks, emails and files move to the result; merge is logged
OBJ-7
Record limits by plan
Creating past the plan's record limit is blocked with a clear message
Attributes
ID
Requirement
Acceptance criteria
ATT-1
All attribute types
Every type in the data model can be created on objects and lists; inputs are validated (email format, phone format, currency code)
ATT-2
Constraints and defaults
Required, unique, default value and multiple values can be set; violations show inline errors
ATT-3
Two-way relationships
Linking a person to a company shows the person on the company page at once; removing either side removes both
ATT-4
Formula attributes
Value recalculates when a source attribute changes; field is read-only
ATT-5
Value history
Each attribute shows past values with who changed them and when
ATT-6
Archive and restore
Archived attributes leave views and forms but keep history; admin can restore them
ATT-7
Options management
Select and status options can be added, coloured, reordered and archived
ATT-8
Admin-only schema changes
Only admins or Full-access members can add or change object attributes; any editor can fill values
Lists and views
ID
Requirement
Acceptance criteria
LST-1
Create list
From a template or from scratch, on exactly one parent object
LST-2
List attributes
Lists have their own attributes plus Parent record, Added at and Added by; list values show in the record's Lists section
LST-3
Multiple entries per record
One record can be added twice to the same list with different values
VW-1
Table view
Add, reorder, resize and relabel columns; edit cells inline; show attributes of related records through a path (for example Person > Location > City)
VW-2
Kanban view
Columns come from a status attribute; stages can be added, hidden and deleted; card rows are configurable; cards drag between columns
VW-3
Bulk stage moves
Shift-select several cards and move them in one drag
VW-4
Time in stage
A target time per stage flags cards that exceed it
VW-5
Filters and sorts
Nested AND/OR filters with operators per type, including "current user"; multi-level sorts
VW-6
Saved views
Each object and list can hold several named views, each with its own filters, sorts and columns
Record page and activity
ID
Requirement
Acceptance criteria
REC-1
Record page layout
Shows details, list memberships and tabs for activity, emails, meetings and calls, notes, tasks, files and comments
REC-2
Activity timeline
Lists attribute changes, list moves, emails, meetings, notes and tasks in time order, with filters to cut noise
Search and navigation
ID
Requirement
Acceptance criteria
SRC-1
Global search
Fuzzy matches names, domains, emails, phone numbers, social handles and record labels across all objects the user can see
SRC-2
Command menu
A keyboard-invoked menu opens any record, list, view or action; common actions have shortcuts
SRC-3
Sidebar
Lists objects, lists, favourites and dashboards the user can access, in a user-reorderable order
Import and export
ID
Requirement
Acceptance criteria
IMP-1
CSV and Excel import
User maps columns to attributes, can create attributes during mapping, and picks a matching attribute to update existing records
IMP-2
Import into a list
Rows become list entries with list attribute values
IMP-3
Import report
Shows created, updated and skipped rows with the reason for each skip
IMP-4
CRM migration
Documented path from Salesforce, HubSpot, Pipedrive and Zoho exports, keeping relationships between objects
EXP-1
Export
Any view exports to CSV within the user's access; on Enterprise, admins can limit who exports
Email and calendar sync
ID
Requirement
Acceptance criteria
SYN-1
Connect accounts
OAuth connection for Google and Microsoft; accounts per user follow the plan (1, 2 or 3+)
SYN-2
Backfill and live sync
Past mail and calendar history imports on connect; new mail and events appear without manual refresh
SYN-3
Auto-create records
Participants create or update People and Companies, linked by email domain; admin can turn off automatic company creation
SYN-4
Sharing levels
Each account picks metadata only, subject and metadata, or full; on Pro and up, full access can be shared with named users
SYN-5
Share selected mail
User shares one email, or all email with a person or company, with chosen teammates
SYN-6
Privacy blocklist
Emails and domains on the blocklist are never synced or shown
SYN-7
Link to any object
Emails and meetings link to People, Companies, Deals and custom-object records
Notes, tasks and comments
ID
Requirement
Acceptance criteria
COL-1
Notes
Rich-text notes on records with real-time co-editing, mentions, templates and links to meetings
COL-2
Tasks
Title, deadline, assignees, linked records and done state; a "my tasks" view; completed tasks can be hidden
COL-3
Comments
Threaded, resolvable comments on records and list entries; @mentions notify the person; list comments are visible only to members with list access
COL-4
Notifications
Mentions, assignments and due tasks reach an in-app inbox and email
Members, teams and permissions
ID
Requirement
Acceptance criteria
PRM-1
Roles
Admins manage settings, members, teams, billing and apps; members cannot open workspace settings
PRM-2
Teams
Admins create teams and manage membership; team count follows the plan
PRM-3
Resource access
Full, Read and write, Read only and No access can be set on objects, lists, dashboards, workflows and sequences, for the workspace, a team or a member
PRM-4
Conflict rules
A member-specific level wins; otherwise the most permissive team level applies
PRM-5
Request access
A member without access can request it; the request reaches admins and Full-access members
PRM-6
Enforced everywhere
The same rules apply in the UI, search, API, exports, workflows and AI answers
Communication intelligence and enrichment
ID
Requirement
Acceptance criteria
CI-1
Interaction attributes
People and Companies show first, last and next interaction, split by email and calendar, updated as mail and events sync
CI-2
Connection strength
Each record shows relationship strength and the teammate with the strongest connection
ENR-1
Company enrichment
Name, description, logo, category, social links, location, employee count, ARR and funding fill in on creation
ENR-2
People enrichment
Name, description, photo, social links and location fill in on creation
ENR-3
Enriched marking
Enriched values are visibly marked in tables and record pages
Email sending
ID
Requirement
Acceptance criteria
SND-1
Send from the CRM
Compose from a record through the user's connected mailbox, with record variables
SND-2
Templates
Personal and shared email templates with variables
SND-3
Bulk send and caps
Bulk send up to 10 (Free) or 50 (paid) recipients; monthly caps of 200 (Free) and 1,000 (Plus); branding footer removable on paid plans
SND-4
Protected recipients
On Enterprise, admins mark contacts that cannot be emailed from the CRM
Files
ID
Requirement
Acceptance criteria
FIL-1
Files on records
Upload files up to 50 MB and create folders on any record; link external files and folders
FIL-2
Storage quota
Workspace storage follows the plan (50 GB on Free and Plus, unlimited on Pro and up)
Workflows
ID
Requirement
Acceptance criteria
WF-1
Visual builder
A canvas with one trigger and connected blocks; each block shows its config and outcome fields
WF-2
Triggers
Record created or updated, attribute changed, list entry added or moved, schedule, incoming webhook, manual run, and triggers supplied by apps
WF-3
Logic blocks
If/else, branches, loops, delays and fallbacks
WF-4
Action blocks
Create or update records, add to list, create tasks, send email, enrol in sequence, HTTP request, run custom JavaScript, integration blocks
WF-5
AI blocks
Custom agent and web agent blocks return structured fields that later blocks use
WF-6
Build from a sentence
A described goal produces a draft workflow that the user reviews before publishing
WF-7
Test mode
Each block can be run against a sample record and its output inspected
WF-8
Run-as user
Every workflow names a user and acts only within that user's permissions
WF-9
Run history and logs
Each run shows inputs, outputs, agent reasoning steps, tool calls and credits used
WF-10
Control runs
Pause or resume a workflow; cancel, resume or replay a single run
WF-11
Credit metering
AI and workflow steps draw from workspace credits; runs stop with a clear status when credits run out
WF-12
Templates and folders
Start from templates; organise workflows into folders
Sequences
ID
Requirement
Acceptance criteria
SEQ-1
Steps
Ordered automated email steps with delays in days or business days
SEQ-2
Personalisation
Record variables and AI-assisted copy in each step
SEQ-3
Sender rules
One sequence can send from different team members, for example the record owner
SEQ-4
Enrolment
Manual, bulk, or from a workflow signal such as account created, form filled or event RSVP
SEQ-5
Exit rules
A reply, a booked meeting or an unsubscribe exits the contact; unsubscribed addresses can never be enrolled
SEQ-6
Smart sending
Sends inside a set window in the recipient's local time
SEQ-7
Tracking
Per-contact step and status, and per-sequence enrolment, reply, meeting and exit counts; pause, revive or remove recipients in one click
Reports and dashboards
ID
Requirement
Acceptance criteria
RPT-1
Report types
Insight (bar, line, pie, single number, map), funnel, time in stage and historical reports
RPT-2
Builder
Choose source object or list, measure (count, sum, average), group by, segment by, filters and date range
RPT-3
Targets and comparisons
A target line on charts; compare against a past period; rewind to any date using value history
RPT-4
Drill-down
Clicking a number lists the records behind it
RPT-5
Computed metrics
Weighted pipeline, win rate, sales cycle length and stage conversion
RPT-6
Dashboards
Arrange reports on a dashboard; share with access levels per workspace, team or member
RPT-7
Report limits
Report count follows the plan (3, 15, 100 or 100+)
Call intelligence
ID
Requirement
Acceptance criteria
CAL-1
Recorder
A bot joins Zoom, Google Meet and Microsoft Teams meetings from the synced calendar, per the user's recording settings
CAL-2
Transcripts
Speaker-labelled transcripts in 100+ languages; a focus mode on chosen speakers
CAL-3
Summary templates
Built-in templates (SPICED, product demo, customer onboarding) and custom templates with sections
CAL-4
Insights and clips
Detects buying signals, blockers and requests; users share clips and summaries
CAL-5
Linking and suggestions
Recordings link to participants' records; AI proposes record updates and tasks for approval
CAL-6
Search
Keyword and semantic search across recordings; playback on web and mobile
AI assistant
ID
Requirement
Acceptance criteria
AI-1
Assistant panel
Available on every page and on mobile and Slack; uses the current record as context
AI-2
Grounded answers
Searches records, emails, notes, calls and connected apps (semantic search), and cites the records used
AI-3
Tools
Can run reports and read-only SQL, draft emails, create tasks, update records and draft workflows
AI-4
Human approval
Every proposed change appears as a card the user accepts, edits or rejects
AI-5
Permissions
Answers only include data the asking user can see
AI-6
Models and context
Admin picks the default model from several vendors; workspace-level custom instructions shape answers
AI-7
Prompt library
Built-in prompts (daily brief, meeting prep, deal brief, recap call, QBR prep) and team-shared prompts
AI-8
Input
Typed or dictated questions in any language; suggested follow-up questions
Custom agents
ID
Requirement
Acceptance criteria
AGT-1
Define an agent
Plain-language instructions, a chosen model, allowed context and tools, and typed output fields
AGT-2
Where agents run
As workflow blocks, as AI attributes on records, or on demand
AGT-3
Web research agent
Researches a record on the web and fills attributes with the source noted
AGT-4
Run as a named user
Agents act with exactly that user's permissions
AGT-5
Agent log
Shows what the agent read, which tools it called, what it decided and what it cost
AGT-6
Agent library
Ready-made agents for scoring, routing, meeting briefs, follow-ups, churn risk and expansion
Billing and credits
ID
Requirement
Acceptance criteria
BIL-1
Plans
Free, Plus, Pro and Enterprise with monthly or annual billing; limits from the plans section enforced
BIL-2
Trial
New workspaces can trial the Pro plan; on expiry the workspace drops to the chosen plan
BIL-3
Credits
Seat credits per user for the assistant; workspace credits for all AI and workflows; top-up packs
BIL-4
Payment
Card payment for all plans; invoice, PO and bank transfer on Pro and Enterprise
Clients
ID
Requirement
Acceptance criteria
CLI-1
Web app
Full product in current desktop browsers
CLI-2
Mobile apps
iOS and Android: records, activity feed, call playback, tasks and the assistant
CLI-3
Desktop app
macOS app with the web feature set
CLI-4
Browser extension
Chrome and Gmail extension showing the matching record beside an email and adding people to lists
Integrations, API and webhooks
The platform exposes five surfaces: a REST API, webhooks, an app SDK, an MCP server and read-only SQL. Our build should treat the REST API as the product's own backbone so every UI action is also available to integrators.
REST API
ID
Requirement
Acceptance criteria
API-1
JSON over HTTPS
Versioned endpoints with a published OpenAPI spec for the core API, standard objects and webhooks
API-2
Authentication
Workspace access tokens with scopes, and OAuth 2.0 (authorise, token, introspect, revoke) for third-party apps
API-3
Resource coverage
Objects, attributes, select options and statuses, records, lists, entries, activities and activity records, notes, tasks, threads and comments, meetings, call recordings, emails (metadata only), files, webhooks, workspace members, identify
API-4
Record semantics
Create (fails on unique conflict), upsert by matching attribute, update that either overwrites or appends multi-select values, merge, delete
API-5
Filter, sort, paginate
Structured filters and sorts on list endpoints, and paginated results
API-6
Linked records
A request can reference a related record by ID, match it by attribute, or create it inline
API-7
Value history
Read historic values; write a full value history for migrations
API-8
Search endpoint
Fuzzy search across objects using the in-app matching strategy
API-9
Rate limits
Reads at 100 requests per second and writes at 25 per second per workspace, with standard 429 responses
Webhooks
Each webhook holds one or more event subscriptions and is managed in the UI and API. Events to support:
Resource
Events
Records
created, updated, merged, deleted
List entries
created, updated, deleted
Lists
created, updated, deleted
Object and list attributes
created, updated
Notes
created, title updated, content updated, deleted
Tasks
created, updated, deleted
Comments
created, resolved, unresolved, deleted
Activities and activity records
created, updated, deleted
Call recordings
created (after transcript and summary finish or fail)
Workspace members
created
App SDK and app store
ID
Requirement
Acceptance criteria
SDK-1
UI extensions
Apps add record actions, bulk record actions, object actions, record widgets, record tabs, full pages and actions on call transcript, summary and insight text
SDK-2
Component kit
Forms, tables, charts (bar, line, pie, metric, funnel), dialogs, toasts and navigation helpers rendered in the host's own style
SDK-3
Server functions
Apps run server-side TypeScript with secrets, a key-value store, inbound webhook handlers and outbound HTTP
SDK-4
Connections
Apps authenticate users or the workspace to third-party services
SDK-5
Data access
Apps query workspace data through GraphQL and call the REST API with an app token
SDK-6
Workflow blocks
Apps ship custom triggers and steps, including deferred steps that finish later
SDK-7
Settings
Apps define workspace-level settings pages
SDK-8
Distribution
Private invite links and a public app store, gated by listing and code review
MCP server
ID
Requirement
Acceptance criteria
MCP-1
Hosted server
One remote MCP endpoint with OAuth sign-in as the user; works with Claude, ChatGPT, Cursor and other MCP clients
MCP-2
Tool set
Tools for objects, records (search, list, get, create, upsert, update, merge), lists and entries, activities, notes, tasks, comments, meetings, call recordings, emails, members and teams, basic reports and SQL
MCP-3
Safety
Read tools auto-approve; write tools ask the user to confirm; all calls are logged
MCP-4
Rate tiers
Separate limits for read, write, merge, search, semantic search, reporting and SQL tools
SQL access
ID
Requirement
Acceptance criteria
SQL-1
Read-only SQL
Query records and lists with SQL in-app and over the API (Enterprise)
SQL-2
Data connectors
External BI tools connect over the PostgreSQL wire protocol
SCIM
ID
Requirement
Acceptance criteria
SCM-1
SCIM 2.0
Create, read, update, patch and delete users and groups; groups map to teams; verified domains join directly, others get invites
Pre-built integrations
Attio lists these among its apps; we should pick a first set based on our target customers.
Category
Apps seen on Attio
Email and calendar
Gmail, Outlook, Google Calendar, Microsoft calendar
Meetings and notes
Zoom, Google Meet, Microsoft Teams, Granola
Messaging and AI
Slack, ChatGPT, Claude, Raycast, Notion custom agents
Sales engagement and enrichment
Outreach, Mixmax, lemlist, Apollo, Clay
Marketing and forms
Mailchimp, Typeform, Segment
Billing and product data
Stripe, data warehouses through reverse ETL
Support and product
Plain, Pylon, Fin, Productboard, Linear
Telephony
JustCall
Automation
Zapier, Resend, ClickUp
Non-functional requirements
The numeric targets below are our proposals, sized against Attio's public scale figures; Attio does not publish its own internal targets.
Reference scale (Attio, public homepage): 2.6B API requests a month, 15M emails synced a day, 30M MCP tool calls a month and 76k active customer agents, across 30,000+ customers.
Area
Requirement
Proposed target
Performance: views
Filter and sort large objects without reloading
p95 under 500 ms on 1M records
Performance: search
Global search returns as the user types
p95 under 300 ms
Performance: collaboration
Edits, notes and stage moves appear for other viewers live
Under 1 s
Availability
Core app, API and sync stay up; public status page
99.9% monthly
Sync reliability
Mail and calendar sync is resumable, idempotent and retried; backfill progress shown
No lost or duplicated messages
Webhook delivery
Signed payloads, retries with backoff, delivery log
At-least-once delivery
Rate limiting
Per-workspace limits on API and MCP with clear 429 responses
Reads 100/s, writes 25/s
Multi-tenancy
Strict tenant isolation at data, cache, search index and AI retrieval layers
No cross-workspace reads
Encryption
In transit and at rest
TLS 1.2+, AES-256
Authentication
Google and Microsoft sign-in, SAML SSO, SCIM, enforced MFA option
SSO and SCIM on Enterprise
Authorisation
One permission engine used by UI, API, search, exports, workflows, agents and MCP
Zero bypass paths in security tests
Audit
Actor and time on every value change; admin action log; workflow, agent and MCP logs
Audit log on Enterprise
Privacy
Email sharing defaults to the user's choice; blocklists; call-recording consent notice; data subject access, export and deletion
GDPR-ready with DPA and sub-processor list
AI data use
Customer data is not used to train models; model vendor is configurable
Stated in terms and enforced by vendor contracts
Data residency
Region choice for Enterprise workspaces
EU and US regions
Backup and recovery
Point-in-time backups and tested restores
RPO 1 h, RTO 4 h
Portability
Full export of records, lists, notes and files
CSV and API
Accessibility
Keyboard-first navigation and screen-reader support
WCAG 2.2 AA
Localisation
Per-user time zone, date format and currency; AI and transcripts multilingual
English UI first
Observability
Tracing, metrics and alerting on sync, workflows, AI and API
Alerts on error-rate and latency breaches
Plans and packaging reference
Attio sells four seat-based plans, with credits shared across AI and workflows; this is reference for our own packaging, not a recommendation to copy prices. Figures are from the pricing page.
Limit
Free
Plus
Pro
Enterprise
Price per seat a month (monthly / annual billing)
$0
$44 / $35
$99 / $79
Custom, annual
Seats
Up to 3
Up to 10
Unlimited
Unlimited
Objects
Up to 3
Up to 5
Up to 12
Unlimited
Records
50,000
250,000
1,000,000
Custom
Seat credits (per user a month)
100
500
1,000
2,500
Workspace credits (a month)
250
1,500
10,000
Custom
File storage
50 GB
50 GB
Unlimited
Unlimited
Mail and calendar accounts per user
1
1
2
3+
Emails sent a month
200
1,000
Unlimited
Unlimited
Bulk send at once
10
50
50
50
Reports
Up to 3
Up to 15
Up to 100
100+
Teams
—
—
Up to 10
Unlimited
Access permissions
None
Basic
Advanced
Advanced
Headline features by plan
• Plus: private lists, fuller email sending and sharing.
• Pro: call intelligence, sequences, permission controls by team and individual, advanced reporting, invoice billing.
• Enterprise: unlimited objects and teams, SSO, SCIM, export limits, protected recipients, SQL access.
Credit top-ups (workspace credits a month, monthly / annual price)
Pack
Price
+5,000
$85 / $70
+10,000
$150 / $120
+25,000
$330 / $260
+50,000
$595 / $475
Other terms: annual billing saves 20% on Plus and Pro; a 14-day Pro trial; startups can get up to 80% off. Attio's llms.txt file quotes lower Plus and Pro prices than the pricing page; we treat the pricing page as current.
Phased build sequence
We propose five phases in dependency order, each closed by a gate that must be met before the next phase starts. Phases carry no dates; scheduling is set separately.
The data model and permission engine come first because every later module (sync, workflows, AI, API) reads and writes through them.
Prototype scope
The first build is a working prototype on Spring Boot, PostgreSQL and React that a small pilot team can use with real data. It covers the phase 1 core plus sample-data versions of email, meetings and the AI assistant, and keeps the full design's data model so the code grows into the product instead of being rewritten.
Goal: prove the dynamic data model, the main views and the record page with real users, and show how sync and AI will feel.
Users: one workspace, a pilot team of a few people.
Requirements in and out
Area
In the prototype
Left for later
Objects and records
OBJ-1, OBJ-2, OBJ-3, OBJ-4, OBJ-5
OBJ-6 merge, OBJ-7 plan limits
Attributes
ATT-1 (all types except formula, AI and interaction), ATT-2, ATT-3, ATT-5, ATT-6, ATT-7, ATT-8
ATT-4 formula
Lists and views
LST-1, LST-2, LST-3, VW-1 to VW-6
none
Record page
REC-1, REC-2
none
Search
SRC-1, SRC-2, SRC-3
none
Import and export
IMP-1, IMP-2, IMP-3, EXP-1
IMP-4 CRM migration
Collaboration
COL-1 (single editor), COL-2, COL-3, COL-4 (in-app only)
Real-time co-editing, email notifications, files
Members
PRM-1 (admin and member roles)
PRM-2 to PRM-6 teams and access levels
Email and calendar
Sample emails and meetings shown on records; CI-1, CI-2 computed from them
SYN-1 to SYN-7 real sync, enrichment, sending
AI
AI-1 (web), AI-2 (records, notes, sample emails), AI-3 (search, query, propose update, create task), AI-4, AI-5
Prompt library, model choice, custom agents
Everything else
none
Workflows, sequences, reports, call intelligence, billing, public API, webhooks, SDK, MCP, SQL, SSO, mobile
Simplifications against the technical design
Topic
Full design
Prototype
Tenancy
Many workspaces, row-level security
One workspace; workspace_id kept on every table so nothing changes later
Permissions
Full access engine
Admin and member roles; AccessService still called everywhere, granting full access for now
Background work
Temporal
Spring scheduled and async tasks
Events
Outbox relayed to Redis Streams
Outbox table written; consumed in-process
Cache and realtime
Redis, WebSocket
No Redis; pages refresh on change; no live co-editing
Search
PostgreSQL then OpenSearch
PostgreSQL trigram and full-text
Notes
Tiptap with Yjs
Tiptap, one editor at a time
Sign-in
Google, Microsoft, magic link, SSO
Google sign-in, plus a local dev login
Email and meetings
Provider sync
Seeded sample data in the real tables
AI
Model gateway, several vendors, credits
One LLM vendor through the same gateway interface, no credits
API
Public API, tokens, webhooks
OpenAPI-first API used only by the web app
Hosting
Kubernetes per region
Docker Compose on one server
Local development
Docker Compose, Testcontainers, make commands
Portable PostgreSQL in the project folder; embedded PostgreSQL for tests; no Docker on the laptop; root npm scripts (npm run dev, verify, api, seed, e2e) instead of make, so commands work on Windows
Exit criteria
[ ] An admin creates a custom object with typed attributes and a relationship to Companies
[ ] A user imports companies and people from CSV and fixes the import report's skipped rows
[ ] The team runs a deal pipeline on a kanban board with time-in-stage flags
[ ] A user works a record page: notes, tasks, comments, activity and value history
[ ] Search finds records by name, email and domain
[ ] The assistant answers pipeline questions with links to records, and the user accepts one proposed update
[ ] Pilot users' feedback is collected and fed back into this PRD
Assumptions and open questions
Most of the PRD rests on Attio's own docs, but some behaviour cannot be confirmed from outside the logged-in app. These items should be settled before the matching phase starts.
Not verifiable from public material
• Screen-level detail: layouts, navigation, empty states and onboarding screens were not seen. A walkthrough of a free workspace, signed in by our team, would close this.
• Enrichment sources: Attio cites hundreds of public sources but names no provider.
• Connection strength: the scoring method is not published.
• Credit costs: how many credits each AI or workflow action uses was not checked.
• Plan placement: the pricing page's per-feature ticks did not render as text, so the plan for protected recipients, export limits and some reporting features is inferred.
• Browser extension: CLI-4 is inferred from the extension's listing, not tested.
• Webhooks: payload signing and retry behaviour in the NFR table are our proposals.
• Security posture: Attio's trust centre did not render, and third-party claims about its certifications conflict, so no certification is assumed.
Decisions needed from us
[ ] Product name and brand
[ ] Which launch market and customer segment come first
[ ] Target cloud provider for hosting
[ ] Hosting region and data residency options
[ ] Payment provider for subscriptions
[ ] Build or buy the meeting recorder bot and transcription
[ ] Which enrichment data provider to license
[ ] Which LLM vendors to support at launch
[ ] Whether to copy the seat-plus-credits pricing model
[ ] Whether mobile apps are in the first release
[ ] Start Google OAuth verification and the Gmail security assessment early, since public launch of mail sync depends on it
Sources
All pages opened on 29 Oct 2026.
• Attio homepage
• Attio pricing
• Attio llms.txt
• Data model
• Workflows
• Custom agents
• Call intelligence
• Sequences
• Reporting
• Ask Attio
• Changelog 2026
• Attio 101
• Understanding attributes
• Understanding lists
• Attio glossary
• Introduction to email sync
• Manage access to lists
• Manage access to objects
• Manage members, admins and teams
• Developer docs: objects and lists
• Developer docs index
• REST API overview
• Attio MCP