# ADR-0005: Deployment on Cloud Run + Supabase

## Status

Accepted

## Context

The backend should be reachable as a live URL so the mobile app and reviewers can
exercise it without local setup. For a demo, cost and operational overhead matter:
the service is idle most of the time and does not need always-on capacity. It does,
however, need a managed PostgreSQL that works with EF Core migrations.

## Decision

Deploy the containerized API to **Google Cloud Run** with **Supabase** (managed
PostgreSQL) as the database.

- **Cloud Run:** region `us-east4`, scale-to-zero (`min 0` / `max 3` instances),
  `512Mi` memory, `--allow-unauthenticated` (public demo).
- **Database connection — Supabase Session pooler.** The connection uses the
  **Session pooler** host `aws-1-us-east-2.pooler.supabase.com:5432` (IPv4). This
  is deliberate:
  - Cloud Run egress is **IPv4-only**, while Supabase's **Direct** connection is
    **IPv6-only** — so Direct is unreachable from Cloud Run.
  - The **Transaction pooler** (port `6543`) is IPv4 but **breaks EF Core
    migrations**, so it is unusable here.
  - The **Session pooler** (port `5432`, IPv4) satisfies both constraints.
- **Secrets:** the connection string lives in **GCP Secret Manager** and is
  injected as the environment variable `ConnectionStrings__Default`.
- **Startup:** migrations and seed run automatically on container start, guarded by
  `Database.IsRelational()`.
- **Swagger** is intentionally enabled in production because this is a demo.
- **Image build:** built with `--provenance=false --platform=linux/amd64` so
  buildx does not emit an attestation manifest list, which Cloud Run rejects.

## Consequences

- Scale-to-zero keeps cost near zero when idle; the trade-off is a brief cold start
  on the first request after idle.
- The Session-pooler choice is non-obvious and easy to regress. It is recorded here
  precisely because Direct (IPv6) and Transaction pooler (migration-breaking) both
  look plausible but fail in this environment.
- Migrations-on-startup means a deploy is self-applying; no separate migration step.

### Alternatives considered

- **GCP Cloud SQL** — more first-class GCP integration, but more setup and cost for
  a demo. Rejected; Supabase's free tier is sufficient.
