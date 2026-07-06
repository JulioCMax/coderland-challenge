# ADR-0004: External vPIC catalog as a read-through proxy

## Status

Accepted

## Context

Beyond the seeded local brands, the app can surface a broader, live vehicle
catalog from the public NHTSA vPIC service. The design question is whether to
import/cache that external data into our database or to serve it on demand. The
external data is not ours: it is owned and updated by NHTSA.

## Decision

Expose the external catalog as a **read-through proxy**, never persisted:

- `GET /api/marcas/externas` — live brands from vPIC.
- `GET /api/marcas/{marca}/modelos` — live models for one brand, fetched on demand.

Implementation details:

- A typed `HttpClient` (`VpicMakesProvider`) is registered with
  `AddStandardResilienceHandler()`, which applies retry, timeout, and
  circuit-breaker policies. **The resilience handler owns the timeout budget — do
  NOT also set `HttpClient.Timeout`**, or the two timeouts fight each other.
- The base URL and related settings are bound from `VpicOptions` via the Options
  pattern (default in the class, overridable through config/env).
- Every call hits vPIC fresh; nothing is cached or written to the local database,
  so this list is independent from `GET /api/marcas`.
- If vPIC cannot be reached after the resilience policies are exhausted, the
  controller returns **502 Bad Gateway** (ProblemDetails) instead of letting the
  exception propagate.

## Consequences

- No stale local copy of third-party data and no ambiguity about who owns it.
- Freshness is automatic: consumers always see what vPIC currently reports.
- Clean separation: local seeded brands and the external catalog are distinct
  endpoints with distinct semantics.
- Trade-off: availability and latency now depend on an external service. This is
  contained by the standard resilience handler and the explicit 502 fallback, and
  the feature is additive (the app degrades gracefully without it).

### Alternatives considered

- **Import/cache vPIC into the database** — would create a stale copy, blur data
  ownership, and add sync complexity for data we do not own. Rejected.
