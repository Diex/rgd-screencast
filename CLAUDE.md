# RGD Screencast - Retro Game Showcase

## Project Overview
SvelteKit SPA for showcasing and playing retro video games in the browser using EmulatorJS. Includes a separate FireCMS React admin app under `admin/`.

## Tech Stack
- **Frontend**: SvelteKit (SPA, adapter-static, fallback 200.html), Svelte 5 (runes), Tailwind CSS v4, Skeleton v3 (crimson theme)
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Admin**: FireCMS v3 community edition (React 19, separate Vite app under `admin/`)
- **Emulator**: EmulatorJS via CDN (`https://cdn.emulatorjs.org/stable/data/`)
- **Hosting**: Firebase Hosting (single `build/` directory)

## Key Commands
```bash
npm run dev          # SvelteKit dev server (localhost:5173)
npm run build        # Build SvelteKit only
npm run build:all    # Build SvelteKit + admin, copy admin/dist to build/admin
npm run deploy       # build:all + firebase deploy

cd admin && npm run dev    # FireCMS dev server (localhost:5174/admin/)
cd admin && npm run build  # Build admin app
```

## Architecture Notes
- **SvelteKit**: SSR disabled (`ssr: false`), no prerendering. All routing is client-side.
- **Svelte 5 runes**: Components use `$props()`, `$state()`, `$derived()`, `$effect()`. No `export let`, no `onMount`.
- **Skeleton v3**: Uses compound components (e.g., `AppBar.Toolbar`, `AppBar.Lead`, `AppBar.Trail`). No AppShell component.
- **Tailwind v4**: CSS-first config via `@import` directives in `src/app.css`. No `tailwind.config.ts`.
- **Firebase env vars**: SvelteKit uses `$env/dynamic/public` with `PUBLIC_FIREBASE_*` prefix. Admin uses Vite's `import.meta.env` with `VITE_FIREBASE_*` prefix.
- **FireCMS**: Community edition (MIT), uses manual composition pattern (`FireCMS`, `Scaffold`, `AppBar`, `Drawer`, `NavigationRoutes`). NOT the `FirebaseCMSApp` shortcut. Requires Tailwind v4 + `@firecms/ui/index.css` import.
- **Firestore rules**: Writes restricted to `fireCMSUser` custom claim (admin only). Reads are public.
- **Storage rules**: Files live under `games/` prefix (e.g., `games/roms/`, `games/screenshots/`). Rules must match this path.
- **Firebase Auth**: Initialized in `src/lib/firebase.ts`, auth store in `src/lib/stores/auth.ts`. Uses `signInWithRedirect` (not popup — popup triggers COOP `window.closed` errors).
- **EmulatorJS**: `GamePlayer.svelte` runs EmulatorJS inside a **blob URL iframe** for full isolation. This is critical:
  - `emulator.min.js` uses top-level `const` declarations that survive script removal — navigating between games causes `SyntaxError: Identifier already declared` if run in the parent window.
  - `data:` URLs block `localStorage` access — EmulatorJS needs it for save states/language. Blob URLs inherit the page origin and allow storage.
  - Blob URLs are revoked on cleanup to prevent memory leaks.

## File Structure
- `src/lib/firebase.ts` - Firebase init (dynamic env vars)
- `src/lib/types/game.ts` - Game interface, Platform type, PLATFORM_TO_CORE mapping
- `src/lib/stores/auth.ts` - Auth state (currentUser, authLoading, signInWithGoogle, logOut)
- `src/lib/stores/games.ts` - Firestore queries (writable/derived stores)
- `src/lib/components/` - Hero, GameCard, GameGrid, GamePlayer
- `src/routes/` - Layout, Home, Games listing, Game detail ([slug])
- `admin/src/App.tsx` - FireCMS manual composition with BrowserRouter
- `admin/src/collections/games.ts` - FireCMS collection schema
- `scripts/seed.ts` - Firebase Admin SDK seed script (5 sample games)

## Platform-to-Core Mapping
`nes`→`nes`, `snes`→`snes`, `genesis`→`segaMD`, `gba`→`gba`, `gb`→`gb`, `n64`→`n64`
