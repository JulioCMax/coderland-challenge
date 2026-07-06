# Coderland monorepo — working notes

Two take-home challenges in one repo: a **.NET 10 backend** (`backend/`) and an **Expo/React Native mobile app** (`mobile/`). Design docs live in `docs/`.

## Golden rule

The core requirements of each challenge PDF are **the gate** — implement them exactly. Everything else (backend↔mobile integration, persistence, external catalog) is an **additive bonus** that must never replace or endanger a stated requirement. The mobile app stays fully functional offline; backend-powered features self-announce and degrade gracefully.

## Backend (`backend/`)

- **.NET 10**, EF Core 10 + Npgsql, XUnit + Moq + coverlet. 4-layer Clean-lite: `Api → Application → Domain`, `Infrastructure → Domain`; `Domain` references nobody (enforced by project references).
- **Naming:** solution/projects/namespaces are `Coderland.*`. Independently, the PDF mandates the DB **table `MarcasAutos`** and the **`MarcasAutosController`** class; the endpoint is `/api/marcas`. Tables + columns are **PascalCase** (to honor the mandated table name; an ADR records snake_case as the greenfield choice).
- **Domain field names are Spanish** by established convention: `Nombre`, `PaisOrigen`, `Descripcion`, `Marca`. JSON is camelCase (`nombre`, `paisOrigen`, `fechaCreacion`).
- Persisted tables are `MarcasAutos` (seeded: Toyota/Ford/Volkswagen) and `Tasks` only. **Marcas are read-only**; DB writes are demonstrated via the Tasks resource. External vPIC brands/models are **read-through** (never persisted).
- **Run:** `cd backend && ./run.sh` (Docker: PostgreSQL + API, migrations + seed on startup). **Test:** `dotnet test`. Ports parameterized via `DB_PORT`/`API_PORT` (defaults 5432/8080).
- .NET gotchas: `dotnet new sln` emits `.slnx` (pass `-f sln`); DataAnnotations on record positional params throw in ASP.NET Core 10 (validate in the service layer); pin `Microsoft.EntityFrameworkCore.Relational` to resolve MSB3277; `AddStandardResilienceHandler()` owns the timeout budget (do NOT also set `HttpClient.Timeout`); guard startup `Migrate()` with `IsRelational()`.

## Mobile (`mobile/`)

- **Expo SDK 57** + React Native + TypeScript. React Navigation **native-stack** (screens take `navigation`/`route` props; no `useNavigation` in screen bodies). **Redux Toolkit** (source of truth for Tareas) + **redux-persist** (AsyncStorage). See [mobile/README.md](mobile/README.md).
- **Language:** UI copy is **Spanish** (product identity + mandated screen names); **all identifiers, types, comments are English**.
- **Testing = `jest-expo` + React Native Testing Library v14** (non-obvious, verified against this toolchain):
  - `render`, `fireEvent`, and `unmount()` are **async** — always `await` them. Prefer global `screen` queries; after `fireEvent` assert rendered output with `await screen.findBy*` (the re-render is not synchronous), and assert Redux logic via `store.getState()` (the press handler runs synchronously).
  - Any test that renders a `FlatList` must `await flushListTimers()` (a `test-utils` helper) or `VirtualizedList` leaks an `act()` warning. Test output must be **pristine** (zero console warnings, no "worker process failed to exit").
  - `jest.moduleNameMapper` maps **`immer`** and **`react-redux`** to their CJS builds (jest-expo resolves the `react-native` export condition to untransformed ESM otherwise). `transformIgnorePatterns` is NOT a better fix here.
  - `jest.testTimeout` is `30000` (cold CI caches blow the default 5s on the first heavy transform). `tsconfig` uses `types: ["jest"]` (do not add `@types/node`); api tests spy on **`globalThis.fetch`**, not `global`.
  - The typecheck script is **`npm run typecheck`** (not `tsc`).
- **Commands:** `npm test`, `npm run typecheck`, `npm start` / `npm run android`. `npm audit` → 0 (a `uuid` override clears an advisory from Expo prebuild tooling; do NOT `npm audit fix --force`, it downgrades the SDK).

## Conventions

- **Conventional Commits.** Do NOT add AI attribution / `Co-Authored-By` trailers.
- Generated artifacts (code, comments, docs, UI copy) default to English, except the established Spanish domain names above.
