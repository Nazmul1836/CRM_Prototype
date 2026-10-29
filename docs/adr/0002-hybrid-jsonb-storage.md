# 0002: Hybrid JSONB storage for records

## Status

Accepted (WP0.4; the schema itself lands in a later storage story).

## Context

Objects, attributes and their values are user-defined at runtime (custom objects with typed
attributes), so they can't live in a fixed, hand-written relational schema the way `workspaces`
or `workspace_members` do. The technical design (`docs/prd/technical-design.md` > Storage design
and schema) needs two things at once for every record: fast reads and filters over whatever
attributes a workspace has defined, and a full history of every value ever set, with validity
timestamps (for value history, time-in-stage, and point-in-time views).

## Decision

A hybrid of two tables, updated together:

- **`records`**: one row per record, with a `values` column — **JSONB, keyed by attribute
  ID** — holding only the *current* value of every attribute. A GIN index on `values` and a
  trigram index on `display_name` make current-state reads and filters fast without needing to
  know the attribute set in advance.
- **`attribute_values`**: one row per value ever set, keyed by `(entity_type, entity_id,
  attribute_id)`, with `active_from`/`active_until` timestamps. The current value for a given
  attribute has `active_until` null. This is the append-only history: value-over-time views,
  "time in stage," and audit-style "what was this before" all read from here instead of from
  `records.values`.
- **One write service** (`RecordWriteService`, per CLAUDE.md's engineering rule "only the
  records, lists and query modules touch their own tables") updates both tables **in a single
  transaction**: it writes the new row into `attribute_values`, closes out the previous value's
  `active_until`, and updates the matching key in `records.values`. No other code path writes to
  either table directly — that's what keeps the two from drifting apart.

## Consequences

- Every write to a record's attribute goes through `RecordWriteService`; a module that needs to
  change a record's values calls it rather than writing SQL against `records` or
  `attribute_values` itself.
- Reads split by need: `QueryService` (and the filter/search engine) reads `records.values` for
  current-state queries; anything asking "what was this attribute's value at time X" or
  "show me the history" reads `attribute_values` instead.
- `attribute_values` is append-only and grows without bound, so the technical design partitions
  it (along with the other append-only tables); that partitioning is implemented when the table
  itself is built, not as part of this ADR.
- Because both tables are updated in one transaction, a reader never sees `records.values`
  reflect a change that hasn't also landed in `attribute_values`, or vice versa.
