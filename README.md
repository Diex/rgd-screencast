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

The project uses two separate `.env` files because the SvelteKit app and the FireCMS admin app are independent Vite builds with different env-variable prefixes. Both files point to the **same** Firebase project.

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

The values are the same in both files; only the prefix differs.

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

### First-time setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com/).
2. **Enable services** in the Firebase console:
   - **Authentication** — enable the Google sign-in provider.
   - **Cloud Firestore** — create a database (any region).
   - **Storage** — initialize the default bucket.
3. **Log in** with the Firebase CLI:
   ```bash
   firebase login
   ```
4. **Associate this repo** with your project:
   ```bash
   firebase use --add   # select your project and give it an alias (e.g. "default")
   ```
5. **Fill in** both `.env` files with your project credentials (see [Environment Setup](#environment-setup)).

### Deploying

Build and deploy in one step:

```bash
npm run deploy
```

This runs `npm run build:all` followed by `firebase deploy`, which deploys:

| Target               | What it does                                           |
| -------------------- | ------------------------------------------------------ |
| **Hosting**          | Uploads the `build/` directory (SvelteKit + admin SPA) |
| **Firestore rules**  | Applies `firestore.rules`                              |
| **Storage rules**    | Applies `storage.rules`                                |

### Source code vs user data

It is important to understand what a deploy touches and what it does **not**:

- **Source code** (this repo) — HTML/JS/CSS assets in `build/`, plus security rules. Every `firebase deploy` replaces these.
- **User data** (Firestore documents, Storage files) — game entries, ROMs, screenshots. These live in Firebase and are **never** affected by a deploy. You can redeploy as often as you like without losing data.

### Security rules

**Firestore** (`firestore.rules`): Games are publicly readable. Any authenticated user can write (suitable for development). For production, restrict writes to users with a `fireCMSUser` custom claim.

**Storage** (`storage.rules`): The `roms/` and `screenshots/` paths are publicly readable. Writes require authentication. Same production recommendation as above.

### Backing up user data

Firebase does not back up data automatically. For production use:

- **Firestore**: Use [scheduled exports](https://firebase.google.com/docs/firestore/manage-data/export-import) to a Cloud Storage bucket.
- **Storage**: Files in the default bucket can be copied with `gsutil rsync` or via the console.

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

All 29 platforms supported by EmulatorJS are available. The platform code maps directly to the EmulatorJS core name.

### Nintendo

| Platform     | Code   | EmulatorJS Core |
| ------------ | ------ | --------------- |
| NES          | `nes`  | `nes`           |
| SNES         | `snes` | `snes`          |
| Nintendo 64  | `n64`  | `n64`           |
| Game Boy     | `gb`   | `gb`            |
| GBA          | `gba`  | `gba`           |
| Nintendo DS  | `nds`  | `nds`           |
| Virtual Boy  | `vb`   | `vb`            |

### Sega

| Platform           | Code       | EmulatorJS Core |
| ------------------ | ---------- | --------------- |
| Genesis/Mega Drive | `genesis`  | `genesis`       |
| Master System      | `sms`      | `sms`           |
| Game Gear          | `gamegear` | `gamegear`      |
| Sega 32X           | `sega32x`  | `sega32x`       |
| Sega CD            | `segacd`   | `segacd`        |
| Sega Saturn        | `saturn`   | `saturn`        |

### Sony

| Platform    | Code  | EmulatorJS Core |
| ----------- | ----- | --------------- |
| PlayStation | `psx` | `psx`           |
| PSP         | `psp` | `psp`           |

### Atari

| Platform    | Code        | EmulatorJS Core |
| ----------- | ----------- | --------------- |
| Atari 2600  | `atari2600` | `atari2600`     |
| Atari 5200  | `atari5200` | `atari5200`     |
| Atari 7800  | `atari7800` | `atari7800`     |
| Atari Jaguar| `jaguar`    | `jaguar`        |
| Atari Lynx  | `lynx`      | `lynx`          |

### Commodore

| Platform        | Code    | EmulatorJS Core |
| --------------- | ------- | --------------- |
| Commodore 64    | `c64`   | `c64`           |
| Commodore 128   | `c128`  | `c128`          |
| Amiga           | `amiga` | `amiga`         |
| Commodore PET   | `pet`   | `pet`           |
| Commodore Plus/4| `plus4` | `plus4`         |
| Commodore VIC-20| `vic20` | `vic20`         |

### Other

| Platform     | Code       | EmulatorJS Core |
| ------------ | ---------- | --------------- |
| 3DO          | `3do`      | `3do`           |
| Arcade       | `arcade`   | `arcade`        |
| ColecoVision | `coleco`   | `coleco`        |
| MAME 2003    | `mame2003` | `mame2003`      |
