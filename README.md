# RGD Screencast

A web application for showcasing and playing retro video games directly in the browser. Built with SvelteKit and powered by [EmulatorJS](https://emulatorjs.org/) for in-browser emulation. Includes a separate admin panel built with [FireCMS](https://firecms.co/) for managing game content.

## Tech Stack

- **Frontend**: SvelteKit (SPA, adapter-static), Svelte 5 (runes), Tailwind CSS v4, Skeleton v3
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Admin**: FireCMS v3 (React 19, separate Vite app under `admin/`)
- **Emulator**: EmulatorJS via CDN
- **Hosting**: Firebase Hosting

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
- A Firebase project with Auth, Firestore, and Storage enabled

## Environment Setup

Copy the example env files and fill in your Firebase project credentials:

```bash
cp .env.example .env
cp admin/.env.example admin/.env
```

**Root `.env`** (SvelteKit — uses `PUBLIC_` prefix):

```
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
```

**`admin/.env`** (FireCMS — uses `VITE_` prefix):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Local Development

Install dependencies for both the main app and admin:

```bash
npm install
cd admin && npm install
```

Run the SvelteKit dev server:

```bash
npm run dev
# Available at http://localhost:5173
```

Run the FireCMS admin dev server (in a separate terminal):

```bash
cd admin && npm run dev
# Available at http://localhost:5174/admin/
```

## Building

Build the SvelteKit app only:

```bash
npm run build
```

Build everything (SvelteKit + admin, copies `admin/dist` into `build/admin`):

```bash
npm run build:all
```

## Seeding Data

The seed script populates Firestore with sample game entries. It requires a Firebase service account key.

```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}' npx tsx scripts/seed.ts
```

Set `GOOGLE_APPLICATION_CREDENTIALS_JSON` to the full JSON contents of your service account key file.

## Deploying to Firebase

Build everything and deploy in one step:

```bash
npm run deploy
```

This runs `npm run build:all` followed by `firebase deploy`, which deploys hosting, Firestore rules, and Storage rules.

## Project Structure

```
src/
  lib/
    firebase.ts          # Firebase initialization
    types/game.ts        # Game interface, Platform type, core mapping
    stores/games.ts      # Firestore query stores
    components/          # Hero, GameCard, GameGrid, GamePlayer
  routes/                # Layout, Home, Games listing, Game detail ([slug])
admin/
  src/
    App.tsx              # FireCMS manual composition with BrowserRouter
    collections/games.ts # FireCMS collection schema
scripts/
  seed.ts                # Firestore seed script
firebase.json            # Hosting, Firestore, Storage config
firestore.rules          # Firestore security rules
storage.rules            # Storage security rules
```

## Supported Platforms

| Platform         | Code      | EmulatorJS Core |
| ---------------- | --------- | --------------- |
| NES              | `nes`     | `nes`           |
| SNES             | `snes`    | `snes`          |
| Sega Genesis     | `genesis` | `segaMD`        |
| Game Boy         | `gb`      | `gb`            |
| Game Boy Advance | `gba`     | `gba`           |
| Nintendo 64      | `n64`     | `n64`           |
