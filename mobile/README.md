# Coderland Mobile — Tareas y gestión de catálogos

Expo + React Native + TypeScript app. Runs on Android; unit tests run in Node.

## Try the app (Android APK)

The app is distributed as a standalone Android **APK**, so you can install and test it **without Expo Go** — no SDK or version matching needed.

**Download:** https://github.com/JulioCMax/coderland-challenge/releases/latest/download/coderland-mobile-v1.0.0.apk
(or browse all builds at the [releases page](https://github.com/JulioCMax/coderland-challenge/releases/latest))

Install on your Android phone:
1. Open the link on the phone and download the `.apk`.
2. When prompted, allow your browser/file manager to **install apps from unknown sources** (Settings › Apps › Special access › Install unknown apps). Android requires this for any app installed outside the Play Store.
3. Open the downloaded file and tap **Install**.

> The APK is Android-only. iOS internal builds require registering each device's UDID, so Android is the supported test path here.

### How the APK is built

Built in the cloud with **EAS Build** using the `preview` profile in [eas.json](eas.json) (`buildType: apk`, internal distribution):

```bash
npm install --global eas-cli
eas login
eas build -p android --profile preview
```

EAS returns a temporary install-page URL when the build finishes. That link expires after the free-plan retention window, so the permanent **Download** link above points to a GitHub Release with the APK attached.

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
- **Marcas** (bonus) — reads the deployed backend `GET /api/marcas`; clearly labeled and degrades gracefully when the backend is unreachable.

## Backend base URL (bonus features)
Set `EXPO_PUBLIC_BACKEND_URL` (defaults to `http://localhost:8080`).
