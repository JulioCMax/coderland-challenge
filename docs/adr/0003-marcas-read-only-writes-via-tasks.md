# ADR-0003: Marcas read-only; writes demonstrated via Tasks

## Status

Accepted

## Context

The backend challenge asks the API to **read** car brands. It does not ask for
brand management (create/update/delete) or a models table. At the same time, a
credible backend should demonstrate database **write** capability, not only reads.
The question is where to put that write demonstration without inventing scope the
brief never requested.

## Decision

- **Marcas are read-only by design.** The `MarcasAutos` table is seeded (Toyota,
  Ford, Volkswagen) and exposed through a single read endpoint, `GET /api/marcas`.
  There is no brand CRUD and no `Modelo` table.
- **Writes are demonstrated through a separate Tasks resource**, which maps to the
  mobile app's task list:
  - `GET /api/tasks` — list all tasks.
  - `POST /api/tasks` — create one task (rejects an empty/blank description).
  - `POST /api/tasks/sync` — bulk-reconcile task descriptions (union by
    description, case-insensitive), reporting imported vs. skipped counts.

## Consequences

- The graded requirement (read brands) is met exactly, with no speculative CRUD.
- Write capability, validation, and a non-trivial reconciliation flow are shown
  where they deliver real product value: the mobile task list and its Sync bonus.
- Two resources with different mutability profiles keep responsibilities clear;
  brand data cannot be mutated by accident.
- Trade-off: a reviewer expecting symmetric CRUD on brands will not find it. That
  is intentional — full Marcas CRUD would be over-engineering for this brief.

### Alternatives considered

- **Full Marcas CRUD (+ Modelo table)** — more surface area, but unrequested and
  over-engineered for the exercise. Rejected.
- **No write endpoints at all** — would leave database write capability
  undemonstrated. Rejected.
