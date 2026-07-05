# Design Spec — Coderland Challenge (Monorepo: Backend + Mobile)

- **Date:** 2026-07-05
- **Status:** Draft (pending user review)
- **Author:** Backend/Mobile team

## 1. Context

Two take-home challenges delivered as ONE cohesive monorepo:

- **Backend challenge** (C#/.NET): DbContext -> PostgreSQL via EF Core, a
  `MarcasAutos` table + seed, a `MarcasAutosController` GET endpoint, XUnit tests
  at **70% coverage**, and a `docker-compose.yml` (PostgreSQL + API).
- **Mobile challenge** (React Native + TypeScript): a home screen with 2 buttons;
  a **Tasks** section backed by **Redux**; a **Listado** section that fetches a
  **specific remote mockapi source**; unit tests for screens + redux; runs on
  **Android**.

The **core requirements of BOTH PDFs are the gate** and must be implemented
exactly and flawlessly. Everything else is a deliberate, value-adding extension
layered on top — never a substitution for a stated requirement.

The two challenges are unified into a small product identity —
**"Tareas y gestión de catálogos"** — where the mobile app can *additively*
integrate with the deployed backend without altering any required behavior.

## 2. Goals

- Nail every requirement of both PDFs first, cleanly, with real tests.
- Present a cohesive system (backend + mobile that talk to each other) rather
  than two isolated tasks.
- Make senior judgment visible via a right-sized conventions document and ADRs
  (decisions with alternatives + rationale).

## 3. Non-Goals (YAGNI) — what we deliberately dropped or bounded

- **No React web SPA.** The mobile app is the e2e client; a separate web front
  no longer earns its place (Swagger still documents the API).
- **No CQRS / MediatR / event sourcing / AutoMapper.** Ceremony without value at
  this scope.
- **No marcas CRUD, no import-to-DB, no `Modelo` table.** External brands/models
  are **read-through** (live from vPIC, never persisted). Marcas are read-only;
  DB writes are shown via the Tasks resource.
- **External vPIC reads are OPTIONAL and isolated** — separate endpoints, nothing
  depends on them, models fetched on-demand per brand.
- **Mobile <-> backend integration is additive and opt-in.** The mobile app is
  fully functional offline; backend-powered features self-announce and degrade
  gracefully.
- No auth/identity, multi-tenant, or conflict-resolution/CRDT sync logic.

## 4. Repository Structure (monorepo)

```
/
  backend/
    src/
      MarcasAutos.Domain/          Entities (MarcaAuto, TaskItem) + ports
      MarcasAutos.Application/     Services / use-cases + DTOs
      MarcasAutos.Infrastructure/  AppDbContext, EF config, repositories, VpicMakesProvider, seed
      MarcasAutos.Api/             Controllers, Program.cs, DI, OpenAPI, HealthChecks
    tests/
      MarcasAutos.UnitTests/
      MarcasAutos.IntegrationTests/
    docker-compose.yml
    Dockerfile
  mobile/
    src/                           React Native + TS + Redux Toolkit (screens, store, api, components)
    __tests__/                     Jest + React Native Testing Library
  docs/
    adr/                           Architecture Decision Records
    architecture.md                System overview (both tiers, how they connect)
  CONVENTIONS.md                   Naming, patterns, testing, commits, API conventions
  README.md                        Root: what this is, both challenges, how to run each
```

## 5. Conventions & Documentation Plan

Two distinct artifacts (do not conflate them):

1. **`CONVENTIONS.md`** — the standards actually enforced by the code:
   - **Naming across boundaries** (the killer table):
     `DB (PaisOrigen) -> C# (PaisOrigen) -> JSON (paisOrigen) -> TS (paisOrigen)`
     The DB uses PascalCase to stay consistent with the PDF-mandated `MarcasAutos`
     table name; an ADR records that snake_case is the PostgreSQL industry standard
     (unquoted identifiers fold to lowercase, so `MarcasAutos` forces quoted
     identifiers) and would be the greenfield choice.
   - Backend: PascalCase types/methods/properties, `I`-prefixed interfaces,
     `Async` suffix; DTOs explicit; ProblemDetails for errors.
   - Mobile/TS: camelCase vars, PascalCase components/types; Redux Toolkit slices.
   - Testing: `Method_Scenario_Expected` naming, AAA, coverage target.
   - Git: Conventional Commits.
   - API: REST resource naming, status codes, error shape.
   - **Rule:** the doc stays short and opinionated, and the code complies 100%.
     A convention the code violates is worse than no convention.
2. **`docs/adr/`** — Architecture Decision Records: each significant decision with
   the alternatives considered and *why* we chose one over the others
   (4-layer Clean-lite; Cloud Run + Supabase; NHTSA vPIC; .NET 10; React Native;
   Redux Toolkit; additive integration approach).

## 6. Backend Challenge Design

### 6.1 Stack
.NET 10 (LTS), EF Core 10 + Npgsql, XUnit + Moq + coverlet, Polly (resilient
outbound HTTP), Docker Compose. Deploy: GCP Cloud Run + Supabase (PostgreSQL).

### 6.2 Architecture — 4 layers (Clean-lite / Ports & Adapters)
`Api -> Application -> Domain`, `Infrastructure -> Domain`. `Domain` references
nobody; the dependency rule is enforced by project references. The Application
layer is justified by real orchestration (external catalog read-through with
resilience + mapping; tasks sync). Leaner than a CRUD-heavy design, but it still
carries its own responsibility.

### 6.3 Data model
- **`MarcaAuto`** (table `MarcasAutos`): `Id` (int, PK identity), `Nombre`
  (required, unique), `PaisOrigen` (nullable), `FechaCreacion` (UTC). Seed via
  `HasData` with 3 brands (Toyota, Ford, Volkswagen). Unique index on `Nombre`.
- **`TaskItem`** (table `Tasks`, for the mobile sync bonus): `Id` (int, PK),
  `Descripcion` (required), `FechaCreacion` (UTC).
- **Naming:** tables + columns in **PascalCase** to comply with the mandated
  `MarcasAutos` name; an ADR documents the snake_case Postgres industry standard
  and why we deviate here (explicit requirement).
- **No `Modelo` entity.** External brands/models are read-through only (never
  persisted). Persisted tables are `MarcasAutos` and `Tasks` only.

### 6.4 API surface
| Method | Route                                  | Purpose                                          |
|--------|----------------------------------------|--------------------------------------------------|
| GET    | `/api/marcas`                          | List brands from the DB seed (**PDF-required**)  |
| GET    | `/api/marcas/externas`                 | Live brands from NHTSA vPIC (read-through)        |
| GET    | `/api/marcas/externas/{marca}/modelos` | Live models for one brand, on-demand              |
| GET    | `/api/tasks`                           | List tasks (pull for mobile sync)                 |
| POST   | `/api/tasks`                           | Create a task                                     |
| POST   | `/api/tasks/sync`                      | Bulk upsert from mobile (union by description)     |
| GET    | `/health`                              | Health check incl. PostgreSQL connectivity        |
| GET    | `/swagger`                             | OpenAPI docs (enabled in prod for the demo)       |

- DTOs explicit + manual mapping. Validation via DataAnnotations + model state.
- External brand/model reads are **read-through** (live, never persisted),
  isolated behind `IVehicleMakesProvider` + Polly, and documented in Swagger as an
  optional demonstration of consuming a free public API. Models are fetched
  **on-demand per brand** to avoid an eager fan-out.
- DB writes are demonstrated via the **Tasks** resource (mobile sync); marcas are
  read-only.

### 6.5 Docker & deploy
- `docker-compose.yml`: `db` (postgres:16-alpine, volume, healthcheck) + `api`
  (Dockerfile, `depends_on: db healthy`).
- `Dockerfile`: multi-stage `dotnet sdk` build -> `aspnet` runtime (no node/SPA
  stage anymore).
- Migrations + seed on startup (`Database.Migrate()`).
- Deploy: image -> Artifact Registry -> Cloud Run; Supabase connection string as
  a secret; health probe at `/health`.

## 7. Mobile Challenge Design (React Native + TypeScript + Redux Toolkit)

### 7.1 Screens
- **Home** — title **"Tareas y gestión de catálogos"** + navigation buttons:
  `Tareas`, `Listado`, and `Marcas` (bonus).
- **Tareas (required)** — list read from Redux; "agregar nuevo task" button opens
  a **modal** with a form; **empty description is rejected**; new tasks are added
  to Redux; tasks persist across navigation (Redux). **Offline-first: this screen
  never depends on the backend.**
- **Listado (required)** — fetches the **mandated source**
  `https://6172cfe5110a740017222e2b.mockapi.io/elements` **on mount**, shows a
  **loading layout** while loading, renders at least the name (optional avatar,
  contact-list style). The mandated source is used exactly as specified.
- **Marcas (bonus)** — consumes the deployed **backend** `/api/marcas`. Clearly
  labeled "catálogo servido por el backend"; **degrades gracefully** if the
  backend is unreachable (friendly empty/error state, no crash). Backend base URL
  is configurable.

### 7.2 Tasks persistence & sync (bonus)
- **Redux remains the source of truth** for the required Tasks flow (requirement
  stays pristine and offline).
- Optional **redux-persist (AsyncStorage)** so tasks survive an app restart —
  strengthens the offline story without any backend dependency.
- Optional **"Sincronizar"** button that pushes local Redux tasks to the backend
  (`POST /api/tasks/sync`) and can pull them back. **Opt-in, clearly labeled,
  graceful when offline.** Simple union-by-description merge (no conflict
  resolution — deliberate simplification).

### 7.3 Testing (required)
- Jest + React Native Testing Library: redux slices (add task, reject empty) and
  screen interactions (open modal, submit, loading state, list render).
- TypeScript throughout.

## 8. Integration Contract (how the two tiers connect, safely)

- The mobile app is **fully functional standalone** (Tasks + Listado meet their
  PDFs with zero backend).
- Backend-powered features (**Marcas**, **Sync**) are **additive, opt-in, self-
  announcing, and degrade gracefully**.
- Backend base URL is configurable in the mobile app (env/config).
- The deployed backend gives the system a natural self-hosted data source and a
  resilient story if the external mockapi ever expires.

## 9. Delivery Order (strict tiers — we can stop at any tier with a complete deliverable)

1. **Backend core (gate):** DbContext -> PostgreSQL, migration + seed,
   `GET /api/marcas`, XUnit at 70%, `docker-compose`.
2. **Backend polish:** OpenAPI + health check + Tasks resource
   (`GET/POST /api/tasks`, `POST /api/tasks/sync`).
3. **External catalog (bonus):** `GET /api/marcas/externas` +
   `.../{marca}/modelos` (read-through vPIC, on-demand, no persistence).
4. **Mobile core (gate):** Home + Tareas (Redux, modal, empty-validation,
   navigation persistence) + Listado (mockapi, loading, fetch-on-mount) + tests.
5. **Integration bonus:** Marcas screen (reads backend), self-announcing + graceful.
6. **Persistence bonus:** redux-persist and/or tasks Sync (backend `/api/tasks`).
7. **Cross-cutting:** deploy + `README.md` + `CONVENTIONS.md` + ADRs + CI.

> Discipline: bonuses never delay or endanger the two cores. Each tier ships a
> complete, coherent deliverable.

## 10. Risks & Notes

- The mandated mockapi (`mockapi.io/elements`) may expire; the backend provides a
  natural self-hosted alternative if needed (integration stays additive).
- External vPIC dependency is optional and isolated so a demo never breaks.
- EF Core InMemory does not enforce relational constraints; SQLite in-memory is a
  more faithful option for constraint tests. The PDF asks for an in-memory DB
  context, which InMemory satisfies.
- Migrations on startup are convenient for the demo; a dedicated migration step
  is preferable for production pipelines (noted trade-off).
- Enabling Swagger in production is a deliberate demo choice.
- Sync uses a simple union-by-description merge; no conflict resolution.
- `origin` remote is configured but nothing is pushed yet; pushing is a separate,
  explicit step.

## 11. Resolved Decisions

- **Mobile tooling:** **Expo**. Easiest to run/test on Android (emulator or the
  Expo Go app), Jest-friendly. Unit tests run in Node — **no device/emulator
  required**. Optional installable APK via EAS Build for the evaluator. Mobile is
  **not** cloud-deployed (the challenge runs it locally on Android); only the
  backend gets a live URL.
- **DB naming:** tables + columns **PascalCase**, complying with the mandated
  `MarcasAutos` name. An ADR records that snake_case is the PostgreSQL industry
  standard and the greenfield choice, and that we deviate only for the explicit
  requirement.
- **Redux:** **Redux Toolkit** (the modern, standard way to use Redux).
- **redux-persist:** **included** (offline-across-restart, no backend dependency).
