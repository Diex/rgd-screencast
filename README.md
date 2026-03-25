# RGD Screencast

A web application for showcasing and playing retro video games directly in the browser. Built with SvelteKit and powered by [EmulatorJS](https://emulatorjs.org/) for in-browser emulation, augmented by self-hosted custom emulators for MSX, ZX Spectrum, ZX81, and PC/DOS. Includes a separate admin panel built with [FireCMS](https://firecms.co/) for managing game content.

## Tech Stack

- **Frontend**: SvelteKit (SPA, adapter-static), Svelte 5 (runes), Tailwind CSS v4, Skeleton v3
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Admin**: FireCMS v3 (React 19, separate Vite app under `admin/`)
- **Emulator**: EmulatorJS via CDN + self-hosted WMSX (MSX), JSSpeccy3 (ZX Spectrum), JS-DOS (PC/DOS), ZX81 emulator
- **Hosting**: Firebase Hosting (two separate sites: main app + admin)

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
# Available at http://localhost:5174/
```

## Building

Build the SvelteKit app only:

```bash
npm run build
```

Build everything (SvelteKit + admin — each to its own output directory, deployed as separate hosting targets):

```bash
npm run build:all
```

## Deploying to Firebase

### First-time setup

1. **Create a Firebase project** at [console.firebase.google.com](https://console.firebase.google.com/).
2. **Enable services** in the Firebase console:
   - **Authentication** — enable the Google sign-in provider.
   - **Cloud Firestore** — create a database (any region).
   - **Storage** — initialize the default bucket.
3. **Create two Hosting sites** in the Firebase console (Hosting → Add site):
   - Main site (e.g. `rgd-screencast`) — for the SvelteKit app
   - Admin site (e.g. `rgd-admin`) — for the FireCMS panel
4. **Add the admin domain to Firebase Auth**: Authentication → Settings → Authorized domains → add your admin site domain (e.g. `rgd-admin.web.app`).
5. **Log in** with the Firebase CLI:
   ```bash
   firebase login
   ```
6. **Associate this repo** with your project and configure hosting targets:
   ```bash
   firebase use --add   # select your project and give it an alias (e.g. "default")
   firebase target:apply hosting main <your-main-site-id>
   firebase target:apply hosting rgd-admin <your-admin-site-id>
   ```
7. **Fill in** both `.env` files with your project credentials (see [Environment Setup](#environment-setup)).

### Deploying

Build and deploy in one step:

```bash
npm run deploy
```

This runs `npm run build:all` followed by `firebase deploy`, which deploys:

| Target                    | Source        | What it does                                          |
| ------------------------- | ------------- | ----------------------------------------------------- |
| **main** (Hosting)        | `build/`      | SvelteKit SPA — all routes fall back to `/200.html`   |
| **rgd-admin** (Hosting)   | `admin/dist/` | FireCMS admin SPA — served at its own domain          |
| **Firestore rules**       | —             | Applies `firestore.rules`                             |
| **Storage rules**         | —             | Applies `storage.rules`                               |

### Source code vs user data

It is important to understand what a deploy touches and what it does **not**:

- **Source code** (this repo) — HTML/JS/CSS assets and security rules. Every `firebase deploy` replaces these.
- **User data** (Firestore documents, Storage files) — game entries, ROMs, screenshots. These live in Firebase and are **never** affected by a deploy.

### Security rules

**Firestore** (`firestore.rules`):
- Games are publicly readable.
- Full writes require the `fireCMSUser: true` custom claim (admin only).
- Any authenticated user can update only the `votes` field (used for star ratings).

**Storage** (`storage.rules`):
- Files under `games/` are publicly readable.
- Writes require the `fireCMSUser: true` custom claim.

To grant admin access to a user, set the `fireCMSUser` custom claim via the Firebase Admin SDK or the Firebase console.

### Backing up user data

Firebase does not back up data automatically. For production use:

- **Firestore**: Use [scheduled exports](https://firebase.google.com/docs/firestore/manage-data/export-import) to a Cloud Storage bucket.
- **Storage**: Files in the default bucket can be copied with `gsutil rsync` or via the console.

## Project Structure

```
src/
  lib/
    firebase.ts            # Firebase initialization
    types/game.ts          # Game interface, Platform type, PLATFORMS mapping (37 cores)
    stores/
      auth.ts              # Auth state (currentUser, signInWithGoogle, logOut)
      games.ts             # Firestore query stores (fetchGames, fetchGameBySlug)
    utils/
      storage.ts           # resolveStorageUrl helper
    components/
      Hero.svelte          # Landing hero section
      GameCard.svelte      # Game card with thumbnail and rating
      GameGrid.svelte      # Grid layout for game cards
      GamePlayer.svelte    # Emulator player (blob URL iframe isolation)
      StarRating.svelte    # Interactive 5-star rating component
  routes/                  # Layout, Home, Games listing, Game detail ([slug])
admin/
  src/
    App.tsx                # FireCMS manual composition with BrowserRouter
    collections/games.ts   # FireCMS collection schema
static/
  emulatorjs/              # EmulatorJS loader and core data files
  wmsx.js                  # MSX emulator (WMSX)
  jsspeccy.js              # ZX Spectrum emulator (JSSpeccy3)
  zx81.html                # ZX81 standalone emulator page
  zx81_emu.js              # ZX81 emulator binary
  colecovision.rom         # ColecoVision BIOS
firebase.json              # Hosting (two targets), Firestore, Storage config
firestore.rules            # Firestore security rules
storage.rules              # Storage security rules
```

## Supported Platforms

**37 platforms** are supported. Most use EmulatorJS cores loaded from CDN. Four platforms use self-hosted custom emulators (marked below).

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

| Platform           | Code       | EmulatorJS Core    |
| ------------------ | ---------- | ------------------ |
| Genesis/Mega Drive | `genesis`  | `genesis_plus_gx`  |
| Master System      | `sms`      | `sms`              |
| Game Gear          | `gamegear` | `gamegear`         |
| Sega 32X           | `sega32x`  | `sega32x`          |
| Sega CD            | `segacd`   | `segacd`           |
| Sega Saturn        | `saturn`   | `saturn`           |

### Sony

| Platform    | Code  | EmulatorJS Core |
| ----------- | ----- | --------------- |
| PlayStation | `psx` | `psx`           |
| PSP         | `psp` | `psp`           |

### Atari

| Platform     | Code        | EmulatorJS Core |
| ------------ | ----------- | --------------- |
| Atari 2600   | `atari2600` | `atari2600`     |
| Atari 5200   | `atari5200` | `atari5200`     |
| Atari 7800   | `atari7800` | `atari7800`     |
| Atari Jaguar | `jaguar`    | `jaguar`        |
| Atari Lynx   | `lynx`      | `lynx`          |

### Commodore

| Platform         | Code    | EmulatorJS Core |
| ---------------- | ------- | --------------- |
| Commodore 64     | `c64`   | `c64`           |
| Commodore 128    | `c128`  | `c128`          |
| Amiga            | `amiga` | `amiga`         |
| Commodore PET    | `pet`   | `pet`           |
| Commodore Plus/4 | `plus4` | `plus4`         |
| Commodore VIC-20 | `vic20` | `vic20`         |

### Other

| Platform     | Code       | EmulatorJS Core |
| ------------ | ---------- | --------------- |
| 3DO          | `3do`      | `3do`           |
| Arcade       | `arcade`   | `arcade`        |
| ColecoVision | `coleco`   | `coleco`        |
| MAME 2003    | `mame2003` | `mame2003`      |

### Custom Emulators

These platforms use self-hosted emulators bundled in `static/` and do not use the EmulatorJS CDN.

| Platform    | Code         | Emulator                                      | ROM formats              |
| ----------- | ------------ | --------------------------------------------- | ------------------------ |
| MSX         | `msx`        | [WMSX](https://webmsx.org/) (`wmsx.js`)        | `.rom`, `.mx1`, `.mx2`   |
| ZX Spectrum | `zxspectrum` | [JSSpeccy3](https://jsspeccy.zxdemo.org.uk/) (`jsspeccy.js`) | `.tap`, `.tzx`, `.z80`, `.sna`, `.szx` |
| PC / DOS    | `dos`        | [JS-DOS v8](https://js-dos.com/) (CDN)         | `.zip` (jDosBox bundles) |
| ZX81        | `zx81`       | Custom (`zx81.html` + `zx81_emu.js`)           | `.tzx`                   |
