# ADR-0006: Offline-first mobile with additive backend

## Status

Accepted

## Context

The mobile challenge is graded on a self-contained app. The backend integration is
valuable but was built as a bonus on top of a different challenge. The golden rule
of the repo applies: the graded requirements are the gate, and any extra must never
replace or endanger a stated requirement.

## Decision

Build the mobile app **offline-first**, with backend features layered on as
**additive** capabilities:

- **Stack:** Expo SDK 57 + React Native + TypeScript, React Navigation
  native-stack, Redux Toolkit as the source of truth for Tareas, and redux-persist
  (AsyncStorage) so tasks survive restarts.
- **Backend-powered features are additive and self-announcing:** the Marcas screen
  (`GET /api/marcas`), the external Catalogo/Modelos screens, and the Tasks Sync
  action. Each is clearly labeled and **degrades gracefully** when the backend is
  unreachable.
- **Core screens never depend on the backend:** Tareas and Listado work fully
  offline. Listado reads a fixed public mock source, not our API.
- **Distribution:** the published Android APK is built with
  `EXPO_PUBLIC_BACKEND_URL` baked to the Cloud Run URL, so bonus features work
  out of the box while the core app still runs without connectivity.

## Consequences

- The graded gate (a fully functional offline app) is protected by construction: no
  core flow has a backend dependency.
- Backend features add value when connectivity exists and fail quietly when it does
  not, so a backend outage never breaks the app.
- Trade-off: two data models coexist (the local Redux task model and the backend
  task DTO), and Sync must reconcile them. This complexity is contained in the Sync
  feature and kept out of the core task flow.

### Alternatives considered

- **Backend as the single source of truth for Tareas** — simpler data flow, but it
  would make the graded offline requirement depend on connectivity. Rejected.
