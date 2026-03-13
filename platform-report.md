# Platform Game File Preparation Guide

## EmulatorJS platforms (most platforms)

Covers: NES, SNES, N64, Game Boy, GBA, NDS, Virtual Boy, Genesis, Master System,
Game Gear, Sega 32X, Sega CD, Saturn, PlayStation, PSP, Atari 2600/5200/7800,
Jaguar, Lynx, Commodore 64/128/Amiga/PET/Plus4/VIC-20, 3DO, Arcade, ColecoVision,
MAME 2003.

**Accepted file types:** standard ROM dumps for each system (`.nes`, `.sfc`, `.z64`,
`.gb`, `.gba`, `.nds`, `.md`, `.sms`, `.gg`, `.32x`, `.iso`, `.bin`, `.cue`, `.psx`,
`.pbp`, `.a26`, `.j64`, `.lnx`, `.d64`, `.adf`, `.rom`, `.zip`, etc.)

**Upload:** upload the ROM file directly to Firebase Storage. No special preparation needed.

---

## MSX

**Emulator:** WebMSX (self-hosted at `/wmsx.js`)
**Accepted file types:** `.rom`, `.mx1`, `.mx2`, `.zip`

**Upload:** upload the ROM/cartridge file directly. No special preparation needed.

---

## ZX Spectrum

**Emulator:** JSSpeccy3 v3.2 (self-hosted at `/jsspeccy.js`, `/jsspeccy-worker.js`, `/jsspeccy-core.wasm`)
**Accepted file types:** `.tap`, `.tzx`, `.z80`, `.sna`, `.szx`, `.zip`

**Upload:** upload the tape or snapshot file directly. No special preparation needed.

> **Note:** Firebase Storage download URLs contain query parameters (`?alt=media&token=...`)
> that would normally break JSSpeccy3's file-type detection. This is handled transparently
> by a fetch-intercept inside the iframe — no action required from the uploader.

---

## PC / DOS

**Emulator:** js-dos v8 (loaded from CDN: `https://v8.js-dos.com/latest/`)
**Accepted file types:** `.jsdos` (custom bundle format — see below)

### Creating a .jsdos bundle

A `.jsdos` file is a ZIP archive with a specific internal structure:

```
mygame.jsdos  (ZIP file)
├── .jsdos/
│   └── dosbox.conf    ← required
├── game.exe
└── (other game files)
```

#### Step-by-step

1. **Create the folder structure:**

```bash
mkdir -p mygame/.jsdos
cp dosbox.conf mygame/.jsdos/dosbox.conf
cp game.exe mygame/
# copy any other game files into mygame/
```

2. **Write a `dosbox.conf`** — minimum required content:

```ini
[cpu]
core=normal
cputype=8086
cycles=3000

[render]
aspect=true

[autoexec]
mount c .
c:
game.exe
```

Replace `game.exe` with your actual executable name. Adjust `cycles`, `machine`,
and other settings to match the game's requirements.

3. **Create the ZIP from inside the folder** (macOS/Linux):

```bash
cd mygame
zip -r ../mygame.jsdos . -x "*.DS_Store"
cd ..
```

> **macOS warning:** Do NOT use Finder's "Compress" or `zip` from outside the folder —
> both add a `__MACOSX/` metadata directory that breaks the bundle.
> Always `cd` into the folder first, then zip `.`

4. **Verify the bundle contents:**

```bash
unzip -l mygame.jsdos
```

The listing must include `.jsdos/dosbox.conf`. If it's missing, the emulator will
refuse to load with "Broken bundle, .jsdos/dosbox.conf not found".

5. **Upload** `mygame.jsdos` to Firebase Storage and use it as the ROM in the admin.

#### Alternatively: use js-dos Studio

The online tool at [https://dos.zone/studio/](https://dos.zone/studio/) can create
`.jsdos` bundles interactively — upload your files, configure DOSBox settings, and
export the bundle.
