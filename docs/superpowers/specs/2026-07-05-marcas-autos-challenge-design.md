# Design Spec — MarcasAutos Backend Challenge

- **Date:** 2026-07-05
- **Status:** Draft (pending user review)
- **Author:** Backend team

## 1. Context

This is a take-home evaluation for a C#/.NET backend role. The PDF (`Prueba de
conocimiento para backend`) asks for a small backend that demonstrates:

- A `DbContext` connecting to PostgreSQL via Entity Framework Core.
- A migration that creates a `MarcasAutos` table plus a data seed of at least 3
  car brands.
- A `MarcasAutosController` with an endpoint returning all car brands.
- XUnit unit tests (target **70% coverage**) using an in-memory DB context.
- A `docker-compose.yml` with two services (PostgreSQL + REST API) that connect
  correctly.

The **core requirements above are the gate** and must be implemented flawlessly.
Everything else in this spec is a deliberate, value-adding extension layered on
top of a solid core — not architectural ceremony.

## 2. Goals

- Nail every PDF requirement first, cleanly and with real tests.
- Turn the toy GET into a small but complete, deployed mini-application that
  demonstrates senior judgment: appropriate architecture, good tests, working
  Docker, clear docs, and a **live public URL**.
- Show that architecture follows requirements (the Application layer earns its
  place only because CRUD + external import introduce real orchestration logic).

## 3. Non-Goals (YAGNI)

- No CQRS, MediatR, event sourcing, or micro-frontends. They add ceremony
  without value at this scope.
- No AutoMapper (manual DTO mapping is clearer here).
- No multi-tenant, auth/identity, or role management (out of scope for the
  challenge; can be noted as a future extension).
- No multi-cloud or multi-environment matrix. One clean deploy path.

## 4. Stack

- **.NET 10 (LTS)** — chosen for native OpenAPI support, Minimal API / pipeline
  improvements, and current LTS status.
- **EF Core 10** + **Npgsql** (PostgreSQL provider).
- **XUnit** + **Moq** + **coverlet** (coverage) + reportgenerator.
- **Polly** for resilient outbound HTTP (vPIC import).
- **React 18 + Vite + TypeScript** frontend, built and served as static files
  from the API (`wwwroot`).
- **Docker Compose** for local dev; **GCP Cloud Run** + **Supabase (PostgreSQL)**
  for deployment.

## 5. Architecture — 4 layers (Clean-lite / Ports & Adapters)

Dependency rule enforced by project references. `Domain` references nobody.

```
src/
  MarcasAutos.Domain/          Entity MarcaAuto; ports: IMarcaAutoRepository, IVehicleMakesProvider
  MarcasAutos.Application/     MarcaAutoService (CRUD + validation/dedup); ImportMarcasUseCase (vPIC orchestration); DTOs
  MarcasAutos.Infrastructure/  AppDbContext, EF configuration, MarcaAutoRepository, VpicMakesProvider, seed
  MarcasAutos.Api/             MarcasAutosController, Program.cs, DI, OpenAPI, HealthChecks, wwwroot (SPA)
tests/
  MarcasAutos.UnitTests/       Controller, service, and import use-case tests (Moq)
  MarcasAutos.IntegrationTests/WebApplicationFactory + EF InMemory (satisfies the PDF "in-memory DB context")
frontend/                      React + Vite + TS (build output copied to Api/wwwroot)
```

Dependencies: `Api -> Application -> Domain`, `Infrastructure -> Domain`.
The Application layer is justified because the import use-case orchestrates real
logic (fetch external makes -> map -> dedup against the repository -> persist),
which belongs neither in the controller (HTTP concern) nor in the repository
(persistence concern).

## 6. Data Model — table `MarcasAutos`

Entity `MarcaAuto`:

| Field          | Type      | Notes                                  |
|----------------|-----------|----------------------------------------|
| `Id`           | int       | Primary key, identity                  |
| `Nombre`       | string    | Required, **unique** (case-insensitive)|
| `PaisOrigen`   | string?   | Nullable                               |
| `FechaCreacion`| DateTime  | Set on creation (UTC)                  |

- Seed via EF Core `HasData` in the initial migration with 3 brands
  (Toyota, Ford, Volkswagen) — satisfies the PDF seed requirement idiomatically.
- Unique index on `Nombre`.

## 7. API Surface

Base path `/api`. JSON in/out. Explicit request/response DTOs, manual mapping.

| Method | Route                 | Purpose                                             |
|--------|-----------------------|-----------------------------------------------------|
| GET    | `/api/marcas`         | List all brands (**the PDF-required endpoint**)     |
| GET    | `/api/marcas/{id}`    | Get one brand (404 if missing)                      |
| POST   | `/api/marcas`         | Create (validates required + unique `Nombre`)       |
| PUT    | `/api/marcas/{id}`    | Update                                              |
| DELETE | `/api/marcas/{id}`    | Hard delete (404 if missing)                        |
| POST   | `/api/marcas/import`  | Import from NHTSA vPIC, dedup vs. existing          |
| GET    | `/health`             | Health check incl. PostgreSQL connectivity          |
| GET    | `/swagger` (OpenAPI)  | API documentation (enabled in prod for the demo)    |

- Validation via DataAnnotations + model-state checks (no extra dependency).
- Consistent error responses (ProblemDetails).

## 8. External Integration — NHTSA vPIC

- Port `IVehicleMakesProvider` (Domain) implemented by `VpicMakesProvider`
  (Infrastructure) using a typed `HttpClient` + Polly retry/backoff.
- Endpoint used: vPIC `GetMakesForVehicleType/car?format=json` (free, no API key,
  HTTPS, stable US government source).
- `ImportMarcasUseCase` (Application) orchestrates: fetch makes -> map -> dedup
  against existing names -> persist new -> return `{ imported, skipped }`.
- **Isolation:** if vPIC is unavailable, the import fails gracefully; the CRUD
  endpoints remain fully functional.

## 9. Testing Strategy (target 70%+ coverage)

- **Unit (XUnit + Moq):**
  - Controller: mock `MarcaAutoService`; assert 200 + expected payload for GET,
    validation/404 paths for the rest.
  - Service: mock `IMarcaAutoRepository`; test dedup, not-found, create/update.
  - Import use-case: mock `IVehicleMakesProvider` + repository; test dedup logic
    and the imported/skipped summary.
- **Integration:** `WebApplicationFactory` + **EF Core InMemory** provider —
  satisfies the PDF's explicit "in-memory DB context" requirement and exercises
  the full request pipeline.
- Coverage collected with **coverlet**, reported with reportgenerator; **>= 70%**.

## 10. Docker & Deployment

- **`docker-compose.yml`:**
  - `db`: `postgres:16-alpine`, named volume, healthcheck.
  - `api`: built from `Dockerfile`, `depends_on: { db: condition: service_healthy }`,
    connection string via environment.
- **`Dockerfile` (multi-stage):**
  1. `node` stage builds the React SPA.
  2. `dotnet sdk` stage builds/publishes the API and copies the SPA into
     `wwwroot`.
  3. `aspnet` runtime stage runs the single image (API + SPA).
- Migrations + seed applied on startup (`Database.Migrate()`) so the container
  comes up ready.
- **Deploy:** build image -> Google Artifact Registry -> **Cloud Run**;
  Supabase PostgreSQL connection string stored as a Cloud Run secret. Health
  probe at `/health`. SPA fallback routing via `MapFallbackToFile`.

## 11. Documentation

- **`README.md`:** overview, architecture diagram, local run
  (`docker-compose up`), tests + coverage instructions, Swagger link, deploy
  steps, and the **live URL**.
- **`docs/adr/`:** Architecture Decision Records — (1) 4-layer Clean-lite,
  (2) Cloud Run + Supabase, (3) NHTSA vPIC external source, (4) .NET 10.
- **OpenAPI/Swagger** for endpoint-level documentation.
- **CI:** GitHub Actions workflow — build + test + coverage gate.

## 12. Delivery Order (core first, always)

1. **PDF core (the gate):** DbContext -> PostgreSQL, migration + seed,
   `GET /api/marcas`, XUnit tests at 70%, `docker-compose`.
2. Full CRUD + validation + OpenAPI + health check.
3. vPIC import.
4. React e2e frontend.
5. Deploy + docs + CI.

## 13. Risks & Notes

- EF Core InMemory does not enforce relational constraints (e.g., unique index).
  For constraint-sensitive tests, SQLite in-memory is a more faithful option; the
  PDF asks specifically for an in-memory DB context, which InMemory satisfies.
- Applying migrations on startup is convenient for the demo; a dedicated
  migration step is preferable for production-grade pipelines (noted as a
  trade-off).
- Enabling Swagger in production is a deliberate demo choice, not a general
  recommendation.
- The git remote (`origin`) is configured but nothing is pushed yet; pushing is
  an explicit, separate step.
