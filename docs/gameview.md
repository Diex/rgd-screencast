# Implementation Plan: Retro Console-Themed Game Detail Page

## Design Decisions (Answering the Key Questions)

**Console frame approach: SVG + CSS hybrid, not external images.**
The reference screenshots use detailed photographic console frames, but sourcing those images raises copyright concerns and asset-management overhead. The recommended approach is to build **SVG-based console bezels** for each platform, styled with CSS. SVGs are resolution-independent, theme-able via CSS custom properties, lightweight, and avoidable of any licensing issues. Each platform gets an SVG component with characteristic details (NES has the gray/red boxy frame, Genesis gets the "16-BIT" branding and rounded form, Game Boy gets the portrait-oriented green shell, etc.). If the user later wants to swap in photographic PNG/WebP frames, the architecture supports that by simply replacing the SVG content in each platform's frame component.

**Platform selector: functional navigation, not decorative.**
The right sidebar should list all supported platforms and link to `/games?platform=nes` (filtered games list). The current platform is highlighted. This provides real navigation value, not just decoration.

**Mobile strategy: collapse the frame, stack vertically.**
On screens below `lg` (1024px), the console frame bezel is hidden or reduced to a thin styled border. The emulator fills the width. The platform sidebar becomes a horizontal scroll strip above or below the player. Game info stays below. On very small screens (below `sm`), the experience is a clean full-width player with minimal chrome.

**Component extraction: yes, create dedicated components.**
The page file should orchestrate layout. Frame rendering, platform selection, and theming should be separate components for maintainability and reuse.

---

## 1. Component Architecture

```
src/lib/components/
  GamePlayer.svelte          (MODIFY - accept sizing props, remove rounded-lg)
  retro/
    RetroLayout.svelte        (NEW - full-page immersive layout wrapper)
    ConsoleFrame.svelte       (NEW - dispatches to platform-specific frame)
    frames/
      NesFrame.svelte          (NEW - NES/Famicom TV bezel SVG)
      SnesFrame.svelte         (NEW - SNES bezel SVG)
      GenesisFrame.svelte      (NEW - Genesis/Mega Drive bezel SVG)
      GbaFrame.svelte          (NEW - Game Boy Advance bezel SVG)
      GbFrame.svelte           (NEW - Game Boy bezel SVG)
      N64Frame.svelte          (NEW - N64 bezel SVG)
    PlatformSidebar.svelte     (NEW - vertical platform list)
    GameInfoPanel.svelte       (NEW - collapsible game info below player)
```

**RetroLayout.svelte** -- The top-level wrapper placed in the `[slug]/+page.svelte`. It takes the full viewport, applies the platform-specific background glow, and uses CSS Grid to arrange: center (frame + emulator), right sidebar (platforms), bottom-left (optional gamepad decoration). It also overrides the parent layout's padding/container constraints for this page via a fullscreen mode.

**ConsoleFrame.svelte** -- Receives `platform` and a `children` snippet. It dynamically imports the correct frame SVG component and positions the emulator container inside the "screen area" of the frame using absolute positioning within a relative container.

**Each Frame component (NesFrame, SnesFrame, etc.)** -- Contains an inline SVG that draws the console bezel. Exposes a named slot/snippet area where the emulator content is rendered. The SVG uses `currentColor` and CSS custom properties so it can be themed. Key visual elements per platform:

| Platform | Frame Style | Colors | Details |
|----------|------------|--------|---------|
| NES | Boxy CRT TV | Gray, dark red | "NINTENDO" text, controller port shapes |
| SNES | Rounded CRT | Light gray, purple accents | "SUPER NINTENDO" text, colored ABXY buttons |
| Genesis | Sleek monitor | Black, blue gradient | "16-BIT" text, "SEGA" branding |
| GBA | Handheld | Purple/indigo | D-pad, ABXY buttons, shoulder bumps |
| GB | Handheld (portrait) | Gray-green | Dot-matrix label, contrast dial |
| N64 | Futuristic TV | Dark gray, green/blue | "N64" logo, tri-prong shape reference |

**PlatformSidebar.svelte** -- Vertical list of platform labels/icons. Each links to `/games?platform={platform}`. Current platform is highlighted with a glow effect matching the platform color. On mobile, rendered horizontally.

**GameInfoPanel.svelte** -- A collapsible/expandable section below the player area containing title, description, tags, year, and screenshots gallery. Uses a disclosure pattern (click to expand) so it does not compete with the immersive frame experience on load.

---

## 2. Console Frame Overlay (CSS Approach)

The core technique is layered positioning:

```
.console-frame-wrapper  (relative, sized to maintain aspect ratio)
  ├── .frame-svg         (absolute, inset-0, z-10, pointer-events-none)
  │     └── <svg>        (the bezel graphic with a transparent "screen" hole)
  └── .emulator-slot     (absolute, positioned to fit inside the screen hole)
        └── #emulator-container
```

The SVG frame is rendered as an overlay with `pointer-events: none` so clicks pass through to the emulator underneath. The emulator container is positioned using percentage-based `top/left/width/height` values that correspond to where the "screen" is within the SVG design.

Each frame component exports its screen positioning as CSS custom properties:

```css
--screen-top: 12%;
--screen-left: 15%;
--screen-width: 70%;
--screen-height: 65%;
```

The `ConsoleFrame.svelte` uses these to position the emulator slot:

```css
.emulator-slot {
  position: absolute;
  top: var(--screen-top);
  left: var(--screen-left);
  width: var(--screen-width);
  height: var(--screen-height);
}
```

This keeps all frame-specific measurements colocated with the frame SVG itself.

---

## 3. Platform-Specific Theming Strategy

Add a new file `src/lib/config/platformTheme.ts`:

```typescript
import type { Platform } from '$lib/types/game';

export interface PlatformTheme {
  glowColor: string;       // CSS color for radial gradient glow
  accentColor: string;      // Highlight/border color
  bgGradient: string;       // Full CSS background value
  sidebarHighlight: string; // Active platform indicator color
}

export const PLATFORM_THEMES: Record<Platform, PlatformTheme> = {
  nes:     { glowColor: '#c62828', accentColor: '#ef5350', bgGradient: 'radial-gradient(ellipse at center, #2a0a0a 0%, #0a0a0a 70%)', sidebarHighlight: '#ef5350' },
  snes:    { glowColor: '#6a1b9a', accentColor: '#ab47bc', bgGradient: 'radial-gradient(ellipse at center, #1a0a2a 0%, #0a0a0a 70%)', sidebarHighlight: '#ab47bc' },
  genesis: { glowColor: '#1565c0', accentColor: '#42a5f5', bgGradient: 'radial-gradient(ellipse at center, #0a0a2a 0%, #0a0a0a 70%)', sidebarHighlight: '#42a5f5' },
  gba:     { glowColor: '#4527a0', accentColor: '#7c4dff', bgGradient: 'radial-gradient(ellipse at center, #0f0a2a 0%, #0a0a0a 70%)', sidebarHighlight: '#7c4dff' },
  gb:      { glowColor: '#2e7d32', accentColor: '#66bb6a', bgGradient: 'radial-gradient(ellipse at center, #0a1a0a 0%, #0a0a0a 70%)', sidebarHighlight: '#66bb6a' },
  n64:     { glowColor: '#00838f', accentColor: '#26c6da', bgGradient: 'radial-gradient(ellipse at center, #0a1a1a 0%, #0a0a0a 70%)', sidebarHighlight: '#26c6da' },
};
```

The `RetroLayout` component applies the theme via inline CSS custom properties on the outermost div:

```svelte
<div
  class="retro-layout"
  style="
    --glow-color: {theme.glowColor};
    --accent-color: {theme.accentColor};
    background: {theme.bgGradient};
  "
>
```

All child components reference `var(--glow-color)` and `var(--accent-color)` for consistent theming without prop drilling.

---

## 4. Layout Structure

The game detail page uses CSS Grid for the immersive layout:

```
+---------------------------------------------------+
|  [Back] [Game Title]              (header bar)     |
+---------------------------------------------------+
|                          |                         |
|                          |   [NES]                 |
|    +--Console Frame--+   |   [SNES] <-- active     |
|    |                 |   |   [Genesis]             |
|    |   [Emulator]    |   |   [GBA]                 |
|    |                 |   |   [GB]                  |
|    +------------ ----+   |   [N64]                 |
|                          |                         |
|  [Gamepad overlay]       |                         |
+---------------------------------------------------+
|  [v] Game Info (collapsible)                       |
|    Title, description, tags, screenshots           |
+---------------------------------------------------+
```

CSS Grid definition on the `RetroLayout`:

```css
.retro-layout {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

The layout must escape the parent `<main class="container mx-auto px-4 py-8">` constraints. Two approaches:

**Option A (recommended):** Add a `+layout.svelte` at `src/routes/games/[slug]/+layout.svelte` that strips the container constraints for this route. The page renders full-bleed.

**Option B:** Use negative margins and `width: 100vw` to break out of the container. This is hacky but avoids adding a layout file.

Option A is cleaner. The new layout file would be:

```svelte
<!-- src/routes/games/[slug]/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="retro-page -mx-4 -my-8">
  {@render children()}
</div>
```

---

## 5. Responsive Strategy

**Breakpoints (Tailwind defaults):**

| Breakpoint | Layout |
|------------|--------|
| `xl` (1280px+) | Full experience: console frame, sidebar, gamepad overlay |
| `lg` (1024px+) | Console frame, sidebar collapses to icons only |
| `md` (768px+) | Simplified frame (thin bezel only), horizontal platform strip above player |
| `sm` and below | No frame, full-width emulator, horizontal platform strip, stacked info |

Implementation approach:

- `ConsoleFrame.svelte` uses a media query or Tailwind responsive class to toggle between the full SVG frame (desktop) and a simple CSS border with platform-colored glow (mobile). The frame components are wrapped in a `hidden lg:block` and a simplified border version uses `block lg:hidden`.

- `PlatformSidebar.svelte` renders vertically on `lg+` and horizontally on `md-`. Uses `flex-col lg:flex-row` pattern.

- The emulator's `aspect-video` constraint is kept on all sizes. On mobile, it fills the available width. On desktop, it is constrained by the frame dimensions.

- `GameInfoPanel.svelte` is always visible below the player area. On desktop it starts collapsed (since the focus is the immersive frame). On mobile it starts expanded (since there is less visual immersion to preserve).

---

## 6. Modifications to GamePlayer.svelte

The existing `GamePlayer.svelte` needs minor changes:

1. Remove `rounded-lg` class (the frame provides the visual boundary).
2. Remove `max-w-4xl` constraint (sizing is now controlled by the parent `ConsoleFrame`).
3. Accept an optional `class` prop for external styling.
4. The `id="emulator-container"` stays as-is since EmulatorJS needs it.

The modified container div becomes:

```svelte
<div id="emulator-container" class="aspect-video w-full h-full {className}"></div>
```

---

## 7. Full File List

| File | Action | Description |
|------|--------|-------------|
| `src/lib/config/platformTheme.ts` | CREATE | Platform theme definitions (colors, gradients) |
| `src/lib/components/retro/RetroLayout.svelte` | CREATE | Full-page immersive grid layout with background glow |
| `src/lib/components/retro/ConsoleFrame.svelte` | CREATE | Frame dispatcher -- selects correct frame by platform, positions emulator inside |
| `src/lib/components/retro/frames/NesFrame.svelte` | CREATE | NES CRT TV bezel SVG |
| `src/lib/components/retro/frames/SnesFrame.svelte` | CREATE | SNES CRT bezel SVG |
| `src/lib/components/retro/frames/GenesisFrame.svelte` | CREATE | Genesis monitor bezel SVG |
| `src/lib/components/retro/frames/GbaFrame.svelte` | CREATE | GBA handheld bezel SVG |
| `src/lib/components/retro/frames/GbFrame.svelte` | CREATE | Game Boy handheld bezel SVG |
| `src/lib/components/retro/frames/N64Frame.svelte` | CREATE | N64 bezel SVG |
| `src/lib/components/retro/PlatformSidebar.svelte` | CREATE | Platform navigation sidebar/strip |
| `src/lib/components/retro/GameInfoPanel.svelte` | CREATE | Collapsible game info section |
| `src/lib/components/GamePlayer.svelte` | MODIFY | Remove hardcoded sizing/rounding, accept class prop |
| `src/routes/games/[slug]/+page.svelte` | MODIFY | Replace current layout with RetroLayout composition |
| `src/routes/games/[slug]/+layout.svelte` | CREATE | Nested layout to remove container constraints |
| `src/app.css` | MODIFY | Add retro-specific CSS custom properties and animations (scanline effect, CRT glow keyframes) |

---

## 8. Assets Needed

No external image assets are required for the initial implementation. Everything is built with SVG + CSS.

**Optional enhancements that would require assets:**

- Gamepad overlay images (decorative) -- could be SVG as well, or PNGs placed in `static/assets/gamepads/`. These are purely decorative and should be deferred to a follow-up.
- Platform logo icons for the sidebar -- could use text labels initially, then swap in small SVG icons later. Some open-source retro console icon sets exist (e.g., "Console Logos" on GitHub).
- Scanline overlay texture -- achievable with pure CSS (`repeating-linear-gradient`), no image needed.

---

## 9. Implementation Sequence

1. Create `src/lib/config/platformTheme.ts` (no dependencies)
2. Create `src/lib/components/retro/frames/NesFrame.svelte` (start with one frame to prove the pattern)
3. Create `src/lib/components/retro/ConsoleFrame.svelte` (uses the frame)
4. Create `src/lib/components/retro/RetroLayout.svelte` (uses ConsoleFrame + theme)
5. Modify `GamePlayer.svelte` (remove sizing constraints)
6. Create `src/routes/games/[slug]/+layout.svelte` (nested layout)
7. Modify `src/routes/games/[slug]/+page.svelte` (integrate RetroLayout)
8. Verify NES frame works end-to-end with EmulatorJS
9. Create remaining 5 frame components (SNES, Genesis, GBA, GB, N64)
10. Create `PlatformSidebar.svelte`
11. Create `GameInfoPanel.svelte`
12. Add CSS animations (scanline, glow pulse) to `src/app.css`
13. Test responsive behavior at all breakpoints
14. Optional: add gamepad overlays

---

## 10. Potential Challenges

**EmulatorJS z-index conflicts.** EmulatorJS creates its own DOM elements, overlays, and full-screen handlers. The SVG frame overlay must use `pointer-events: none` and careful z-index management to avoid intercepting emulator interactions. The EmulatorJS "start game" button and settings menu must remain clickable. Testing this interaction is critical in step 8.

**EmulatorJS full-screen mode.** When a user enters full-screen via EmulatorJS, the console frame should not be visible. EmulatorJS handles full-screen on the `#emulator-container` element. Since the frame is a sibling/parent overlay, it will naturally be excluded from the full-screen view. This should work out of the box, but needs verification.

**SVG frame complexity.** Creating detailed, attractive SVG bezels requires design effort. The initial implementation should start simple (rounded rectangles with branding text and a few decorative elements) and can be refined iteratively. The architecture supports swapping in more detailed SVGs later.

**Layout escape from parent container.** The root layout wraps content in `<main class="container mx-auto px-4 py-8">`. The nested layout at `src/routes/games/[slug]/+layout.svelte` needs to counteract this. Using negative margins (`-mx-4 -my-8`) and `w-screen` is one approach; alternatively the root layout could be restructured to not apply container constraints globally, but that would affect all pages.

---

## Critical Files for Implementation

- `src/routes/games/[slug]/+page.svelte` - Primary page to redesign with the retro layout composition
- `src/lib/components/GamePlayer.svelte` - Must be modified to remove sizing constraints and work inside the console frame
- `src/lib/types/game.ts` - Platform type definition and mappings that drive the per-platform theming
- `src/routes/+layout.svelte` - Root layout whose container constraints must be escaped for the immersive view
- `src/app.css` - Global styles where CRT effects (scanlines, glow animations) will be added
