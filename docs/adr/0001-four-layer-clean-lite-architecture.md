# ADR-0001: Four-layer Clean-lite architecture

## Status

Accepted

## Context

The backend is a take-home challenge, but one of its goals is to demonstrate
architecture, not just deliver endpoints. A single-project API would be smaller,
yet it would hide the dependency discipline the exercise is meant to show. We
want boundaries that are explicit, enforced by the compiler, and testable without
a live database.

## Decision

Structure the solution as four projects under `backend/src`, following a
Clean-lite (ports and adapters) layering on .NET 10 with EF Core 10 + Npgsql:

| Project                    | References                             | Responsibility                                        |
| -------------------------- | -------------------------------------- | ----------------------------------------------------- |
| `Coderland.Domain`         | nobody                                 | Entities, repository and provider interfaces (ports)  |
| `Coderland.Application`    | `Domain`                               | Services, DTOs, use-case orchestration                |
| `Coderland.Infrastructure` | `Domain`                               | EF Core `DbContext`, repositories, external adapters  |
| `Coderland.Api`            | `Application`, `Infrastructure`        | Controllers, DI composition root, HTTP concerns       |

The dependency rule is enforced by project references: `Domain` references no
other project, so nothing domain-level can depend on a framework or an adapter.
Ports (repository and provider interfaces) live in `Domain`/`Application`; their
implementations live in `Infrastructure` and are wired in `Program.cs`.

## Consequences

- High testability: integration tests boot the real pipeline and swap the
  PostgreSQL `DbContext` for the EF Core in-memory provider, so `dotnet test`
  needs no database.
- Clear boundaries: a change to persistence cannot leak into the domain, and the
  compiler rejects violations of the dependency direction.
- Trade-off: four projects add more ceremony than a tiny app strictly needs. This
  cost was accepted deliberately to demonstrate the architecture rather than to
  minimize file count.

### Alternatives considered

- **Single-project API** — least code, but no enforced boundaries and a weaker
  demonstration of design intent. Rejected.
