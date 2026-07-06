# Coderland — Tareas y gestión de catálogos

Two take-home challenges delivered as one cohesive monorepo:

- **Backend** — a C# / **.NET 10** REST API over **PostgreSQL** (EF Core), containerized with Docker Compose.
- **Mobile** — a React Native + **TypeScript** app built with **Expo**, tested on Android.

The mobile app is fully functional on its own; it can *additively* talk to the deployed backend without changing any required behavior.

## Repository layout

```
backend/    .NET 10 API (4-layer Clean-lite) + PostgreSQL, Docker Compose, XUnit tests
mobile/     Expo + React Native + TypeScript app, Jest + React Native Testing Library
docs/       Design spec and implementation plans
```

Each side has its own README with the details:
- Backend: run it with the script below; API docs live at `/swagger`.
- Mobile: see [mobile/README.md](mobile/README.md).

## Run the backend (Docker)

Requires Docker Desktop running.

```bash
cd backend
./run.sh                     # build + start (PostgreSQL + API), waits until healthy
```

One command brings up both containers, applies migrations + seed, and prints the endpoints. If port `5432` or `8080` is already taken on your machine, override them:

```bash
./run.sh --db-port 55433 --api-port 8080
./run.sh down                # stop and remove the stack
./run.sh logs                # follow the API logs
```

Defaults: `DB_PORT=5432`, `API_PORT=8080`, `POSTGRES_PASSWORD=postgres` (all overridable via flags or env vars).

**Endpoints** (default `http://localhost:8080`):

| Method | Route | Purpose |
|--------|-------|---------|
| GET  | `/api/marcas` | Car brands from the seeded database |
| GET  | `/api/marcas/externas` · `/{marca}/modelos` | Live brands/models from NHTSA vPIC (read-through) |
| GET  | `/api/tasks` · POST `/api/tasks` · POST `/api/tasks/sync` | Tasks resource (used by the mobile Sync bonus) |
| GET  | `/health` · `/health/live` · `/health/ready` | Health checks (incl. PostgreSQL connectivity) |
| GET  | `/swagger` | OpenAPI documentation |

Run the backend tests:

```bash
cd backend
dotnet test
```

## Run the mobile app (Android)

Requires Node 18+ and the **Expo Go** app on an Android device (or an Android emulator).

```bash
cd mobile
npm install
npm start                    # Metro + QR code; scan it with Expo Go
# or, with an emulator/device on adb:
npm run android
```

**Screens**
- **Home** — title *"Tareas y gestión de catálogos"* + navigation buttons.
- **Tareas** — task list backed by **Redux** (survives restart via redux-persist); add via a modal; empty descriptions are rejected; tasks persist across navigation.
- **Listado** — fetches a fixed remote source on mount with a loading layout (contact-list style).
- **Marcas** *(bonus)* — reads the backend `GET /api/marcas`; degrades gracefully if the backend is unreachable.

The **Marcas** and **Sincronizar** features talk to the backend at `EXPO_PUBLIC_BACKEND_URL` (default `http://localhost:8080`). From a physical phone, set it to this PC's LAN IP (not `localhost`). **Tareas and Listado never depend on the backend.**

Run the mobile tests + typecheck:

```bash
cd mobile
npm test
npm run typecheck
```

## Design

Architecture and decisions are documented under [docs/](docs/) — the master design spec and the per-plan implementation notes.
