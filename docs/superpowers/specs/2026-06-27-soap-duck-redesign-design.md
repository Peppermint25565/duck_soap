# Soap Duck — Visual Redesign Spec

**Date:** 2026-06-27
**Status:** Approved
**Supersedes (visuals only):** the texture/visual sections of `2026-06-27-soap-dino-design.md`

## Summary

A complete visual redesign of the existing runner, themed around the soap
mechanic: a **bubble-bath aesthetic**. The hero becomes a **yellow rubber
duck**, the background is an animated gradient with rising bubbles and a
scrolling foam line, obstacles become bathroom hazards, and the menu / skill
tree / HUD are restyled in the soap palette. The game is retitled
**"SOAP DUCK"** (internal package name `soap-dino` is unchanged).

**Hard boundary:** This redesign touches ONLY the presentation layer
(`render/`, `ui/`, palette constants). Game logic — physics, spawner,
collision, skill tree, economy, save — is NOT modified. All 56 existing logic
tests must remain green.

## Goals

- Cohesive bubble-bath look across gameplay, menus, and HUD.
- Keep the pixel-art runner charm while introducing color, depth, and motion.
- Zero behavioral change: same controls, same gameplay, same balance.

## Non-Goals (YAGNI)

- No sound.
- No new gameplay mechanics, skills, or balance changes.
- No change to canvas size (stays 800×300) or to any game-logic module.
- No vector/WebGL rewrite — stays Canvas 2D with pixel sprites + simple shapes.

## Palette & Theme

Centralized named palette consumed by all render/ui modules.

- Sky→water gradient: top `#bfe9ff` → bottom `#4ec5d6`.
- Foam / highlights: `#ffffff`, soft shadow `#9fdfe9`.
- Duck body `#ffd23f`, duck beak `#ff8c2b`, duck eye `#2b2b2b`.
- Soap (collectible): bar `#ff9ed8` (pink) with mint highlight `#bff5e6` and a
  white sparkle.
- Obstacles (bathroom hazards): shampoo bottle body `#5a8dee` / cap `#3a6fd0`;
  flying sponge `#f4e07a` with `#d8b94a` holes.
- Bubbles: translucent white `rgba(255,255,255,0.35)` with a brighter rim.
- UI ink (text): `#0d3b47` (deep teal) on light panels; white on dark panels.
- UI panel: translucent white `rgba(255,255,255,0.75)` with rounded corners.

## Components & Architecture

Logic modules untouched. New/changed presentation units, each with one job:

### `src/render/palette.ts` (new)
Exports the named colors above plus typed sprite palettes
(`DUCK_PALETTE`, `SOAP_PALETTE`, `SHAMPOO_PALETTE`, `SPONGE_PALETTE`) as
`string[]` where index 0 is transparent. No imports from game/canvas.

### `src/render/sprites.ts` (rewritten)
- `PixelGrid = number[][]` now holds **palette indices** (0 = transparent).
- Helper `P(rows, charmap)` maps characters → indices (e.g. `{ '.':0, 'Y':1,
  'O':2, 'K':3 }`), so a grid can be multi-color and still authored as text.
- `drawPixels(ctx, grid, x, y, scale, palette: string[])` — draws each cell
  with `palette[index]`, skipping index 0.
- `gridSize(grid)` unchanged (cols×rows).
- New sprites: `DUCK_RUN_1/2`, `DUCK_JUMP`, `DUCK_DUCK_1/2` (slide),
  `SOAP` (pink bar + sparkle), `SHAMPOO_SMALL`, `SHAMPOO_LARGE`,
  `SPONGE_1/2` (flap). (Bubbles are NOT sprites — they are drawn as canvas
  arcs in background.ts.)
- All grids remain rectangular (test-enforced).

### `src/render/background.ts` (new)
- `createBubbleField(seed?)` → state of N bubbles `{x, y, r, speed, drift}`.
- `updateBubbles(state, dt)` — bubbles rise (`y -= speed*dt`), drift
  sinusoidally, wrap to the bottom when off the top. Deterministic given a
  seeded RNG. **Unit-tested** (wrap + upward motion).
- `drawBackground(ctx, bubbleState, distance, t)` — vertical gradient, bubble
  layer (arcs with rim highlight), and a scrolling sinusoidal **foam line** at
  `GROUND_Y` that scrolls with `distance`.

### `src/render/effects.ts` (new)
- Lightweight particle system: `spawnBurst(list, x, y, kind)` where kind is
  `'pop'` (soap collected → small bubbles) or `'splash'` (death → droplets).
- `updateEffects(list, dt)` advances/fades particles, culls dead ones.
  **Unit-tested** (particles fade and are culled).
- `drawEffects(ctx, list)` draws them.

### `src/render/scene.ts` (rewritten)
Composes: `drawBackground` → obstacles (themed) → soap (sparkly) → duck
(animated frame by player state, slight squash on jump optional) → effects.
Reads only `GameState` + the new render modules. Frame selection mirrors the
old logic (jump frame airborne, duck/slide frames when ducking, 2-frame run).

### `src/render/hud.ts` (restyled)
Translucent rounded panel; soap count with a small soap icon; score
right-aligned; ability pips drawn as little bubbles labeled Z/X/C, dimmed on
cooldown. Same data sources (`g.score`, `g.runSoap`, `g.cfg.abilities`,
`g.cooldowns`).

### `src/ui/menu.ts` (restyled)
Bubble-bath background (reuses `drawBackground` with a static/idle bubble
field), big bubble-style title **"SOAP DUCK"**, high score + total soap,
prompts ("SPACE to play", "T for skill tree"). A decorative duck sprite.

### `src/ui/skillTree.ts` (restyled, layout preserved)
Same `layoutTree()` / `nodeAtPoint()` geometry (already fits the canvas — keep
it), but nodes drawn as **rounded bubble cards**: owned = filled teal, buyable
= white card with colored rim + glow, locked = greyed. Branch headers themed.
Hover = brighter rim/glow. The layout-fits-canvas test stays.

## Data Flow

`main.ts` is unchanged except: it must own a bubble-field state and a
particle list, call `updateBubbles`/`updateEffects` each step, pass them to
the renderers, and trigger `spawnBurst` on soap-count increase (pop) and on
death (splash). These are presentation hooks in the existing step/render
functions — no logic module changes. (If main.ts needs to detect a soap
pickup, it compares `game.runSoap` between frames; no Game.ts change.)

## Testing

- **Unchanged:** all 56 logic tests stay green (no logic files touched).
- **Updated:** `sprites.test.ts` — grids still rectangular and non-empty in the
  new multi-color format; `gridSize` correct.
- **New:** `background.test.ts` — bubbles rise and wrap deterministically;
  `effects.test.ts` — particles fade and get culled.
- **Preserved:** `skillTree.test.ts` layout + within-canvas tests.
- Visual fidelity (gradient, duck, bubbles, restyled UI) verified in the
  browser via the running Vite dev server.

## Rollout / Order (informs the plan)

1. Palette + sprite engine (multi-color) + new sprites.
2. Background (bubbles + gradient + foam).
3. Effects (particles).
4. Scene composition.
5. HUD restyle.
6. Menu + skill tree restyle + title.
7. Wire bubble/particle state + pickup/death hooks in main.ts.
8. Browser verification.
