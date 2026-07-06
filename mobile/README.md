# Coderland Mobile — Tareas y gestión de catálogos

Expo + React Native + TypeScript app. Runs on Android; unit tests run in Node.

## Requirements
- Node 18+ and npm
- Expo (via `npx`) and, to run on a device/emulator, the Expo Go app or an Android emulator

## Run
```bash
npm install
npm run android   # or: npm start, then press "a"
```

## Test
```bash
npm test
npm run test:coverage
```

## Screens
- **Home** — title "Tareas y gestión de catálogos" + navigation buttons.
- **Tareas** — task list backed by Redux; "Agregar nuevo task" opens a modal; blank descriptions are rejected; tasks persist across navigation.
- **Listado** — fetches `https://6172cfe5110a740017222e2b.mockapi.io/elements` on mount with a loading layout; shows each element's name (avatar contact-list style).
