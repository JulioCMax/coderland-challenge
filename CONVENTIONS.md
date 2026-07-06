# Conventions

Shared rules for the Coderland monorepo. This is the quick reference; the reasoning
behind the bigger decisions lives in the [ADRs](docs/adr/README.md).

## 1. Repository layout

```
backend/     .NET 10 API (4-layer Clean-lite) + PostgreSQL, Docker Compose, xUnit tests
mobile/      Expo + React Native + TypeScript app, Jest + React Native Testing Library
docs/        Design spec and per-plan implementation notes
docs/adr/    Architecture Decision Records (see docs/adr/README.md)
```

## 2. Naming across boundaries

The same concept carries different names at each layer by design. Domain fields are
Spanish; the database is PascalCase; JSON on the wire is camelCase.

| Concept | Backend (class / table / column)                                                | REST endpoint | JSON field                                    | Mobile type                                              |
| ------- | ------------------------------------------------------------------------------- | ------------- | --------------------------------------------- | -------------------------------------------------------- |
| Marca   | `MarcaAuto` / `MarcasAutos` / `Id`, `Nombre`, `PaisOrigen`, `FechaCreacion`      | `/api/marcas` | `id`, `nombre`, `paisOrigen`, `fechaCreacion` | `Marca { id, nombre, paisOrigen, fechaCreacion }`        |
| Task    | `TaskItem` / `Tasks` / `Id`, `Descripcion`, `FechaCreacion`                      | `/api/tasks`  | `id`, `descripcion`, `fechaCreacion`          | `Task { id: string, description }` (local Redux model)   |

Rules:

- **Product prefix vs. mandated names.** The solution, projects, and namespaces are
  `Coderland.*`. Independently, the challenge PDF **mandates** the table
  `MarcasAutos` and the controller class `MarcasAutosController`; the endpoint is
  `/api/marcas`. Honor those exact names.
- **PascalCase tables + columns.** Adopted so the schema stays consistent with the
  mandated `MarcasAutos` table name.
- **Spanish domain fields.** `Nombre`, `PaisOrigen`, `Descripcion`, `Marca` — an
  established project convention.
- **camelCase JSON.** `nombre`, `paisOrigen`, `fechaCreacion` on the wire.
- The mobile `Task` is a separate local model (English `description`, string `id`)
  that Sync reconciles against the backend task DTO; the two are intentionally not
  identical.

See [ADR-0002](docs/adr/0002-naming-across-boundaries.md) for the full rationale.

## 3. Language policy

- **Spanish** only for: product UI copy (screen names, labels, buttons) and the
  mandated Spanish domain names (`Nombre`, `PaisOrigen`, `Descripcion`, `Marca`).
- **English** for everything else: identifiers, types, comments, documentation, and
  commit messages.

## 4. API conventions

- **Style:** REST over JSON; JSON fields are camelCase.
- **Errors:** RFC 7807 ProblemDetails (`AddProblemDetails()` + a global exception
  handler). Validation failures return `ValidationProblemDetails`.
- **Health:** `/health` (all checks), `/health/live` (liveness), `/health/ready`
  (readiness, includes PostgreSQL connectivity).
- **Typical status codes:** `201 Created` on create (with the created resource),
  `400 Bad Request` on validation failure (e.g. empty task description),
  `502 Bad Gateway` when an upstream dependency (vPIC) is unreachable.
- **Docs:** Swagger UI at `/swagger` (enabled in all environments for the demo).
- The external catalog (`/api/marcas/externas`, `/api/marcas/{marca}/modelos`) is a
  read-through proxy — see [ADR-0004](docs/adr/0004-external-vpic-catalog-read-through.md).

## 5. Testing

**Backend** — xUnit + Moq + coverlet. Integration tests boot the real pipeline via
`WebApplicationFactory` and swap PostgreSQL for the EF Core **in-memory** provider,
so `dotnet test` needs **no database**.

- Command: `cd backend && dotnet test`

**Mobile** — jest-expo + React Native Testing Library v14. Non-obvious rules that
this toolchain requires (keep test output **pristine** — zero console warnings):

- `render`, `fireEvent`, and `unmount()` are **async** — always `await` them.
- After `fireEvent`, assert the re-render with `await screen.findBy*` (the re-render
  is not synchronous); assert Redux logic via `store.getState()`.
- Any test that renders a `FlatList` must `await flushListTimers()` or
  `VirtualizedList` leaks an `act()` warning.
- `jest.moduleNameMapper` maps **immer** and **react-redux** to their CJS builds.
- `jest.testTimeout` is `30000` (cold caches blow the default 5s on first transform).

- Commands: `cd mobile && npm test` and `npm run typecheck`

## 6. Commits & Git

- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, ...).
- Do **not** add AI attribution or `Co-Authored-By` trailers.

## 7. Continuous Integration

GitHub Actions runs build + tests for **both tiers** (backend `dotnet test`, mobile
`npm test` / `npm run typecheck`) on every push and pull request to `main`. The
workflow lives at `.github/workflows/ci.yml`.
