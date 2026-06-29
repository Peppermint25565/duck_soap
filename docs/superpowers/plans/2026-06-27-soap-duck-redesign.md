# Soap Duck Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the existing runner into "Soap Duck" — a bubble-bath theme with a rubber-duck hero, animated bubble background, particle effects, and restyled menu/skill-tree/HUD — without changing any game logic.

**Architecture:** Pure presentation-layer change. A new color palette + a multi-color pixel-sprite engine drive new sprites (duck, shampoo bottles, flying sponge, soap bar). New `background.ts` (gradient + rising bubbles + foam) and `effects.ts` (particle bursts) layers compose into a rewritten `scene.ts`. HUD/menu/skill-tree are restyled. `main.ts` owns the bubble-field and particle state and triggers bursts on pickup/death. No file under `game/`, `skills/`, `save/`, or `engine/` is modified.

**Tech Stack:** TypeScript (strict), Vite, Vitest, HTML5 Canvas 2D.

## Global Constraints

- TypeScript strict mode; `tsc --noEmit` must stay clean at every commit.
- Touch ONLY presentation: `src/render/*`, `src/ui/*`, `src/main.ts`, new `src/render/palette.ts`, and `index.html` title. Do NOT modify `game/`, `skills/`, `save/`, `engine/`, or `config.ts` logic constants.
- All 56 existing logic tests must remain green after every task.
- Canvas size stays 800×300 (`CANVAS_W`/`CANVAS_H` unchanged).
- Sprite palettes are `string[]` with index 0 = `''` (transparent); `drawPixels` skips index 0.
- Game title text is **"SOAP DUCK"**. Internal package name `soap-dino` is unchanged.
- No new runtime dependencies.

---

### Task 1: Palette + multi-color sprite engine + new sprites

**Files:**
- Create: `src/render/palette.ts`
- Create: `src/render/palette.test.ts`
- Modify: `src/render/sprites.ts` (extend `P`, change `drawPixels` to accept a palette, add `roundRectPath`, append new sprites + charmaps)
- Modify: `src/render/sprites.test.ts` (add assertions for new sprites)

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - palette.ts: theme colors `SKY_TOP, SKY_BOTTOM, FOAM, FOAM_SHADE, INK, PANEL, BUBBLE_FILL, BUBBLE_RIM` and sprite palettes `DUCK_PALETTE, SOAP_PALETTE, SHAMPOO_PALETTE, SPONGE_PALETTE` (`string[]`, index 0 = `''`).
  - sprites.ts: `P(rows, map?)`, `drawPixels(ctx, grid, x, y, scale, paint: string | string[])` (string = paint every non-zero cell; array = `paint[cellIndex]`, skip falsy), `roundRectPath(ctx, x, y, w, h, r)`, new grids `DUCK_RUN_1, DUCK_RUN_2, DUCK_JUMP, DUCK_SLIDE_1, DUCK_SLIDE_2, SOAP_BAR, SHAMPOO_SMALL, SHAMPOO_LARGE, SPONGE_1, SPONGE_2`. Existing sprites (`DINO_*, CACTUS_*, PTERO_*, SOAP, CLOUD`) remain for now so `scene.ts` keeps compiling.

- [ ] **Step 1: Write the palette test**

Create `src/render/palette.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { DUCK_PALETTE, SOAP_PALETTE, SHAMPOO_PALETTE, SPONGE_PALETTE } from './palette';

describe('sprite palettes', () => {
  it('reserve index 0 as transparent and have real colors after', () => {
    for (const p of [DUCK_PALETTE, SOAP_PALETTE, SHAMPOO_PALETTE, SPONGE_PALETTE]) {
      expect(p[0]).toBe('');
      expect(p.length).toBeGreaterThan(1);
      expect(p[1]).toMatch(/^#|rgba/);
    }
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/render/palette.test.ts`
Expected: FAIL — cannot find module `./palette`.

- [ ] **Step 3: Create `src/render/palette.ts`**

```ts
// Bubble-bath theme colors.
export const SKY_TOP = '#bfe9ff';
export const SKY_BOTTOM = '#4ec5d6';
export const FOAM = '#ffffff';
export const FOAM_SHADE = '#9fdfe9';
export const INK = '#0d3b47';
export const PANEL = 'rgba(255,255,255,0.78)';
export const BUBBLE_FILL = 'rgba(255,255,255,0.35)';
export const BUBBLE_RIM = 'rgba(255,255,255,0.75)';

// Sprite palettes. Index 0 is transparent; drawPixels skips it.
export const DUCK_PALETTE = ['', '#ffd23f', '#ff8c2b', '#2b2b2b', '#e6b800'];
export const SOAP_PALETTE = ['', '#ff9ed8', '#bff5e6', '#ffffff'];
export const SHAMPOO_PALETTE = ['', '#5a8dee', '#3a6fd0', '#bcd4ff'];
export const SPONGE_PALETTE = ['', '#f4e07a', '#d8b94a'];
```

- [ ] **Step 4: Run palette test, verify pass**

Run: `npx vitest run src/render/palette.test.ts`
Expected: PASS.

- [ ] **Step 5: Upgrade the sprite engine in `src/render/sprites.ts`**

Replace the `P` definition (top of file) — currently:
```ts
const P = (rows: string[]): PixelGrid =>
  rows.map((r) => r.split('').map((c) => (c === '#' ? 1 : 0)));
```
with (backward compatible — default map keeps `'#'` → 1 so existing sprites still work):
```ts
const DEFAULT_MAP: Record<string, number> = { '#': 1 };

export const P = (rows: string[], map: Record<string, number> = DEFAULT_MAP): PixelGrid =>
  rows.map((r) => r.split('').map((c) => map[c] ?? 0));
```

Replace the `drawPixels` function — currently it takes `color: string`. Replace it with:
```ts
export function drawPixels(
  ctx: CanvasRenderingContext2D,
  grid: PixelGrid,
  x: number,
  y: number,
  scale: number,
  paint: string | string[],
): void {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const v = grid[row][col];
      if (!v) continue;
      const color = typeof paint === 'string' ? paint : paint[v];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}
```

- [ ] **Step 6: Append the rounded-rect helper + new sprites to `src/render/sprites.ts`**

Add at the end of the file:
```ts
export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

const DUCK_MAP = { '.': 0, 'B': 1, 'K': 2, 'E': 3, 'W': 4 };
const SOAP_MAP = { '.': 0, 'S': 1, 'H': 2, '*': 3 };
const SHAMPOO_MAP = { '.': 0, 'B': 1, 'C': 2, 'L': 3 };
const SPONGE_MAP = { '.': 0, 'S': 1, 'O': 2 };

export const DUCK_RUN_1 = P([
  '....BBBB....',
  '...BBBBBB...',
  '...BBEBBBKK.',
  '...BBBBBBKK.',
  '...BBBBBB...',
  '..BBBBBBBB..',
  '.BBBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  '.BBBBBBBBBB.',
  '..BB....BB..',
  '..BB....BB..',
], DUCK_MAP);

export const DUCK_RUN_2 = P([
  '....BBBB....',
  '...BBBBBB...',
  '...BBEBBBKK.',
  '...BBBBBBKK.',
  '...BBBBBB...',
  '..BBBBBBBB..',
  '.BBBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  '.BBBBBBBBBB.',
  '..BB...BB...',
  '...BB..BB...',
], DUCK_MAP);

export const DUCK_JUMP = P([
  '....BBBB....',
  '...BBBBBB...',
  '...BBEBBBKK.',
  '...BBBBBBKK.',
  '...BBBBBB...',
  '..BBBBBBBB..',
  '.BBBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  '.BBBBBBBBBB.',
  '...BB..BB...',
  '....BBBB....',
], DUCK_MAP);

export const DUCK_SLIDE_1 = P([
  '....BBBBB......',
  '...BBBBBBB...KK',
  '..BBBEBBBBB.KK.',
  '.BBBBBBBBBBBB..',
  'BBBBBBBBBBBBBB.',
  '.BBBBBBBBBBBB..',
  '..BB......BB...',
], DUCK_MAP);

export const DUCK_SLIDE_2 = P([
  '....BBBBB......',
  '...BBBBBBB...KK',
  '..BBBEBBBBB.KK.',
  '.BBBBBBBBBBBB..',
  'BBBBBBBBBBBBBB.',
  '.BBBBBBBBBBBB..',
  '...BB....BB....',
], DUCK_MAP);

export const SOAP_BAR = P([
  '..*....',
  '.SSSSS.',
  'SSHHHSS',
  'SSHHHSS',
  '.SSSSS.',
  '...*...',
], SOAP_MAP);

export const SHAMPOO_SMALL = P([
  '..CC..',
  '..CC..',
  '.BBBB.',
  'BBBBBB',
  'BLLLLB',
  'BLLLLB',
  'BBBBBB',
  'BBBBBB',
], SHAMPOO_MAP);

export const SHAMPOO_LARGE = P([
  '..CCC..',
  '..CCC..',
  '...C...',
  '.BBBBB.',
  'BBBBBBB',
  'BLLLLLB',
  'BLLLLLB',
  'BBBBBBB',
  'BBBBBBB',
  'BBBBBBB',
  'BBBBBBB',
], SHAMPOO_MAP);

export const SPONGE_1 = P([
  '.SSSSSS.',
  'SSOSSOSS',
  'SSSSSSSS',
  'SOSSSSOS',
  'SSSSSSSS',
  '.SSSSSS.',
], SPONGE_MAP);

export const SPONGE_2 = P([
  'SSSSSSSS',
  'SSOSSOSS',
  '.SSSSSS.',
  '.SOSSOS.',
  'SSSSSSSS',
  'SSSSSSSS',
], SPONGE_MAP);
```

- [ ] **Step 7: Extend `src/render/sprites.test.ts`**

The existing tests reference the old sprites and still pass (old sprites remain). Add a new `describe` block asserting the new sprites are rectangular and non-empty. Append to the file:
```ts
import {
  DUCK_RUN_1, DUCK_JUMP, DUCK_SLIDE_1, SOAP_BAR,
  SHAMPOO_SMALL, SHAMPOO_LARGE, SPONGE_1, SPONGE_2,
} from './sprites';

describe('soap-duck sprites', () => {
  const all = { DUCK_RUN_1, DUCK_JUMP, DUCK_SLIDE_1, SOAP_BAR, SHAMPOO_SMALL, SHAMPOO_LARGE, SPONGE_1, SPONGE_2 };
  it('are rectangular', () => {
    for (const [, g] of Object.entries(all)) {
      expect(g.length).toBeGreaterThan(0);
      expect(g.every((r) => r.length === g[0].length)).toBe(true);
    }
  });
  it('contain colored (non-zero) pixels with valid palette indices', () => {
    for (const [, g] of Object.entries(all)) {
      const filled = g.flat().filter((v) => v > 0);
      expect(filled.length).toBeGreaterThan(0);
    }
  });
});
```
(If the existing test file already imports some of these names, merge rather than duplicate imports.)

- [ ] **Step 8: Run the full suite + tsc**

Run: `npm test && npx tsc --noEmit`
Expected: all tests pass (56 prior + new), tsc clean. The old `scene.ts` still compiles because `drawPixels` accepts a `string`.

- [ ] **Step 9: Commit**

```bash
git add src/render/palette.ts src/render/palette.test.ts src/render/sprites.ts src/render/sprites.test.ts
git commit -m "feat: add bubble-bath palette and multi-color duck/shampoo/sponge sprites"
```

---

### Task 2: Ambient layers — animated bubble background + particle effects

**Files:**
- Create: `src/render/background.ts`, `src/render/background.test.ts`
- Create: `src/render/effects.ts`, `src/render/effects.test.ts`

**Interfaces:**
- Consumes: `CANVAS_W, CANVAS_H, GROUND_Y` from config; theme colors from palette.
- Produces:
  - background.ts: `interface Bubble { x; y; r; speed; phase; drift: number }`, `interface BubbleField { bubbles: Bubble[] }`, `createBubbleField(count?, rng?)`, `updateBubbles(field, dt)` (bubbles rise; wrap to bottom when fully above the top), `drawBackground(ctx, field, distance)` (gradient + bubbles + scrolling foam).
  - effects.ts: `interface Particle {...}`, `type EffectList = Particle[]`, `spawnBurst(list, x, y, kind: 'pop' | 'splash', rng?)`, `updateEffects(list, dt)` (advance + cull dead), `drawEffects(ctx, list)`.

- [ ] **Step 1: Write `src/render/background.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { createBubbleField, updateBubbles, type BubbleField } from './background';
import { CANVAS_H } from '../config';

describe('bubble field', () => {
  it('bubbles rise over time', () => {
    const f: BubbleField = { bubbles: [{ x: 100, y: 200, r: 6, speed: 30, phase: 0, drift: 0 }] };
    updateBubbles(f, 0.1);
    expect(f.bubbles[0].y).toBeLessThan(200);
  });
  it('wraps a bubble to the bottom once it rises off the top', () => {
    const f: BubbleField = { bubbles: [{ x: 100, y: 5, r: 6, speed: 30, phase: 0, drift: 0 }] };
    updateBubbles(f, 1);
    expect(f.bubbles[0].y).toBeGreaterThan(CANVAS_H);
  });
  it('createBubbleField makes the requested count', () => {
    expect(createBubbleField(5, () => 0.5).bubbles.length).toBe(5);
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npx vitest run src/render/background.test.ts`
Expected: FAIL — cannot find module `./background`.

- [ ] **Step 3: Create `src/render/background.ts`**

```ts
import { CANVAS_W, CANVAS_H, GROUND_Y } from '../config';
import { SKY_TOP, SKY_BOTTOM, FOAM, FOAM_SHADE, BUBBLE_FILL, BUBBLE_RIM } from './palette';

export interface Bubble {
  x: number; y: number; r: number; speed: number; phase: number; drift: number;
}
export interface BubbleField {
  bubbles: Bubble[];
}

export function createBubbleField(count = 26, rng: () => number = Math.random): BubbleField {
  const bubbles: Bubble[] = [];
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: rng() * CANVAS_W,
      y: rng() * CANVAS_H,
      r: 3 + rng() * 9,
      speed: 12 + rng() * 26,
      phase: rng() * Math.PI * 2,
      drift: 6 + rng() * 10,
    });
  }
  return { bubbles };
}

export function updateBubbles(field: BubbleField, dt: number): void {
  for (const b of field.bubbles) {
    b.y -= b.speed * dt;
    b.phase += dt;
    if (b.y + b.r < 0) b.y = CANVAS_H + b.r;
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, field: BubbleField, distance: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, SKY_TOP);
  grad.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  for (const b of field.bubbles) {
    const x = b.x + Math.sin(b.phase) * b.drift;
    ctx.beginPath();
    ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = BUBBLE_FILL;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = BUBBLE_RIM;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - b.r * 0.3, b.y - b.r * 0.3, Math.max(1, b.r * 0.18), 0, Math.PI * 2);
    ctx.fillStyle = BUBBLE_RIM;
    ctx.fill();
  }

  // Foam band + scrolling wavy line at the ground.
  ctx.fillStyle = FOAM_SHADE;
  ctx.fillRect(0, GROUND_Y + 4, CANVAS_W, CANVAS_H - (GROUND_Y + 4));
  ctx.strokeStyle = FOAM;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= CANVAS_W; x += 8) {
    const y = GROUND_Y + Math.sin((x + distance) * 0.05) * 3;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
```

- [ ] **Step 4: Run background test, verify pass**

Run: `npx vitest run src/render/background.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/render/effects.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { spawnBurst, updateEffects, type EffectList } from './effects';

describe('particle effects', () => {
  it('spawns particles for a burst', () => {
    const list: EffectList = [];
    spawnBurst(list, 100, 100, 'pop', () => 0.5);
    expect(list.length).toBeGreaterThan(0);
  });
  it('culls particles after their life ends', () => {
    const list: EffectList = [];
    spawnBurst(list, 100, 100, 'splash', () => 0.5);
    for (let i = 0; i < 200; i++) updateEffects(list, 1 / 60);
    expect(list.length).toBe(0);
  });
});
```

- [ ] **Step 6: Run it, verify it fails**

Run: `npx vitest run src/render/effects.test.ts`
Expected: FAIL — cannot find module `./effects`.

- [ ] **Step 7: Create `src/render/effects.ts`**

```ts
export interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; r: number; rises: boolean; color: string;
}
export type EffectList = Particle[];

const FALL = 380;

export function spawnBurst(
  list: EffectList, x: number, y: number, kind: 'pop' | 'splash', rng: () => number = Math.random,
): void {
  const n = kind === 'pop' ? 9 : 16;
  const rises = kind === 'pop';
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const sp = (rises ? 20 : 60) + rng() * (rises ? 40 : 120);
    const life = 0.5 + rng() * 0.5;
    list.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: rises ? -Math.abs(Math.sin(a) * sp) : Math.sin(a) * sp - 60,
      life, max: life,
      r: rises ? 2 + rng() * 4 : 1 + rng() * 3,
      rises,
      color: rises ? 'rgba(255,255,255,0.85)' : '#6fd0e6',
    });
  }
}

export function updateEffects(list: EffectList, dt: number): void {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += (p.rises ? -30 : FALL) * dt;
    p.life -= dt;
    if (p.life <= 0) list.splice(i, 1);
  }
}

export function drawEffects(ctx: CanvasRenderingContext2D, list: EffectList): void {
  for (const p of list) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
```

- [ ] **Step 8: Run effects test + full suite + tsc**

Run: `npx vitest run src/render/effects.test.ts && npm test && npx tsc --noEmit`
Expected: effects 2 tests pass; full suite green; tsc clean.

- [ ] **Step 9: Commit**

```bash
git add src/render/background.ts src/render/background.test.ts src/render/effects.ts src/render/effects.test.ts
git commit -m "feat: add animated bubble background and particle effect layers"
```

---

### Task 3: In-game scene rewrite + main wiring (background, duck, effects, pickup/death bursts)

**Files:**
- Modify: `src/render/scene.ts` (full rewrite)
- Modify: `src/render/sprites.ts` (remove now-unused old sprites `DINO_RUN_1/2, DINO_JUMP, DINO_DUCK_1/2, CACTUS_SMALL, CACTUS_LARGE, PTERO_1/2, SOAP, CLOUD`)
- Modify: `src/render/sprites.test.ts` (remove references to the removed old sprites)
- Modify: `src/main.ts` (own bubble field + effects list; update them each step; new `drawScene` call; pop on soap pickup; splash on death; gameover text in INK)

**Interfaces:**
- Consumes: Task 1 sprites/palettes, Task 2 `createBubbleField/updateBubbles/drawBackground/BubbleField`, `spawnBurst/updateEffects/drawEffects/EffectList`.
- Produces: `drawScene(ctx, g, t, bg: BubbleField, fx: EffectList)`.

- [ ] **Step 1: Rewrite `src/render/scene.ts`**

Replace the entire file with:
```ts
import type { GameState } from '../game/Game';
import type { ObstacleType } from '../config';
import { GROUND_Y, PLAYER_X } from '../config';
import {
  DUCK_RUN_1, DUCK_RUN_2, DUCK_JUMP, DUCK_SLIDE_1, DUCK_SLIDE_2,
  SOAP_BAR, SHAMPOO_SMALL, SHAMPOO_LARGE, SPONGE_1, SPONGE_2,
  drawPixels, gridSize, type PixelGrid,
} from './sprites';
import { DUCK_PALETTE, SOAP_PALETTE, SHAMPOO_PALETTE, SPONGE_PALETTE } from './palette';
import { drawBackground, type BubbleField } from './background';
import { drawEffects, type EffectList } from './effects';

const SCALE = 4;

function obstacleSprite(type: ObstacleType, t: number): { grid: PixelGrid; palette: string[] } {
  if (type === 'cactusSmall') return { grid: SHAMPOO_SMALL, palette: SHAMPOO_PALETTE };
  if (type === 'cactusLarge') return { grid: SHAMPOO_LARGE, palette: SHAMPOO_PALETTE };
  return { grid: Math.floor(t * 8) % 2 === 0 ? SPONGE_1 : SPONGE_2, palette: SPONGE_PALETTE };
}

export function drawScene(
  ctx: CanvasRenderingContext2D, g: GameState, t: number, bg: BubbleField, fx: EffectList,
): void {
  drawBackground(ctx, bg, g.distance);

  for (const o of g.obstacles) {
    const { grid, palette } = obstacleSprite(o.type, t);
    const os = gridSize(grid);
    drawPixels(ctx, grid, o.x, o.y, o.h / os.h, palette);
  }

  for (const s of g.soaps) {
    const ss = gridSize(SOAP_BAR);
    drawPixels(ctx, SOAP_BAR, s.x, s.y, s.h / ss.h, SOAP_PALETTE);
  }

  let grid: PixelGrid;
  if (g.player.y > 0) grid = DUCK_JUMP;
  else if (g.player.ducking) grid = Math.floor(t * 10) % 2 === 0 ? DUCK_SLIDE_1 : DUCK_SLIDE_2;
  else grid = Math.floor(t * 10) % 2 === 0 ? DUCK_RUN_1 : DUCK_RUN_2;
  const ps = gridSize(grid);
  const py = GROUND_Y - g.player.y - ps.h * SCALE;
  drawPixels(ctx, grid, PLAYER_X, py, SCALE, DUCK_PALETTE);

  drawEffects(ctx, fx);
}
```

- [ ] **Step 2: Remove the old sprites from `src/render/sprites.ts`**

Delete the exported consts `DINO_RUN_1`, `DINO_RUN_2`, `DINO_JUMP`, `DINO_DUCK_1`, `DINO_DUCK_2`, `CACTUS_SMALL`, `CACTUS_LARGE`, `PTERO_1`, `PTERO_2`, `SOAP`, and `CLOUD` (the original monochrome blocks). Keep `PixelGrid`, `P`, `DEFAULT_MAP`, `drawPixels`, `gridSize`, `roundRectPath`, the charmaps, and all `DUCK_*/SOAP_BAR/SHAMPOO_*/SPONGE_*` sprites.

- [ ] **Step 3: Remove old-sprite references from `src/render/sprites.test.ts`**

Delete any test/import referencing the removed names (`DINO_RUN_1`, `DINO_JUMP`, `SOAP`, `CACTUS_LARGE`, `PTERO_1`, etc.). Keep the `soap-duck sprites` describe block from Task 1 and the generic helpers. The file must import only names that still exist.

- [ ] **Step 4: Rewire `src/main.ts`**

Apply these edits to `src/main.ts`:

(a) Update imports — replace the `drawScene` import line and the `COLOR` config import:
```ts
import { drawScene } from './render/scene';
import { createBubbleField, updateBubbles } from './render/background';
import { spawnBurst, updateEffects, type EffectList } from './render/effects';
```
and change `import { CANVAS_W, CANVAS_H, COLOR } from './config';` to:
```ts
import { CANVAS_W, CANVAS_H, GROUND_Y, PLAYER_X } from './config';
import { INK } from './render/palette';
```

(b) Add module state near the other `let`/`const` declarations (after `const input = createInput(window);`):
```ts
const bubbles = createBubbleField();
const effects: EffectList = [];
let prevRunSoap = 0;
```

(c) In `startRun()`, reset the pickup tracker — add `prevRunSoap = 0;` after `elapsed = 0;`:
```ts
function startRun() {
  game = createGame(buildRunConfig(save.unlockedNodes));
  screen = 'playing';
  elapsed = 0;
  prevRunSoap = 0;
  input.clearEdges();
}
```

(d) Rewrite `step(dt)` to animate ambient layers every frame and fire bursts:
```ts
function step(dt: number) {
  elapsed += dt;
  updateBubbles(bubbles, dt);
  updateEffects(effects, dt);

  if (screen === 'playing' && game) {
    updateGame(game, input.state, dt);
    input.clearEdges();

    if (game.runSoap > prevRunSoap) {
      const duckY = GROUND_Y - game.player.y - 24;
      spawnBurst(effects, PLAYER_X + 24, duckY, 'pop');
      prevRunSoap = game.runSoap;
    }

    if (game.over) {
      spawnBurst(effects, PLAYER_X + 24, GROUND_Y - 24, 'splash');
      save = bankRun(save, game.runSoap, game.score);
      writeSave(save);
      screen = 'gameover';
      gameoverTimer = 1.2;
    }
  } else if (screen === 'gameover') {
    input.clearEdges();
    gameoverTimer -= dt;
    if (gameoverTimer <= 0) screen = 'tree';
  } else {
    input.clearEdges();
  }
}
```

(e) Update `render()` — pass the new args to both `drawScene` calls and recolor the gameover overlay. Replace the `playing` and `gameover` branches:
```ts
  } else if (screen === 'playing' && game) {
    drawScene(ctx, game, elapsed, bubbles, effects);
    drawHud(ctx, game);
  } else if (screen === 'gameover' && game) {
    drawScene(ctx, game, elapsed, bubbles, effects);
    drawHud(ctx, game);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = '28px monospace';
    ctx.fillText('GAME OVER', CANVAS_W / 2, 120);
    ctx.font = '13px monospace';
    ctx.fillText(`+${game.runSoap} soap banked`, CANVAS_W / 2, 150);
    ctx.textAlign = 'left';
```
(`CANVAS_H` is still used by the mousemove handler, so keep its import.)

- [ ] **Step 5: Type-check, build, full suite**

Run: `npx tsc --noEmit && npm run build && npm test`
Expected: tsc clean (no unused-import errors — verify `COLOR` is fully removed and every imported name is used); build succeeds; 56+ tests still green.

- [ ] **Step 6: Commit**

```bash
git add src/render/scene.ts src/render/sprites.ts src/render/sprites.test.ts src/main.ts
git commit -m "feat: re-skin gameplay with bubble background, rubber duck, and pickup/death bursts"
```

---

### Task 4: HUD restyle

**Files:**
- Modify: `src/render/hud.ts` (full rewrite)

**Interfaces:**
- Consumes: `GameState`; `INK, PANEL, BUBBLE_FILL, BUBBLE_RIM, SOAP_PALETTE` from palette; `roundRectPath` from sprites.
- Produces: `drawHud(ctx, g)` (signature unchanged).

- [ ] **Step 1: Rewrite `src/render/hud.ts`**

```ts
import type { GameState } from '../game/Game';
import { CANVAS_W } from '../config';
import { INK, PANEL, BUBBLE_RIM, SOAP_PALETTE } from './palette';
import { roundRectPath } from './sprites';

export function drawHud(ctx: CanvasRenderingContext2D, g: GameState): void {
  // Translucent rounded panel across the top.
  roundRectPath(ctx, 8, 8, CANVAS_W - 16, 30, 8);
  ctx.fillStyle = PANEL;
  ctx.fill();

  ctx.fillStyle = INK;
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE ${Math.floor(g.score).toString().padStart(5, '0')}`, CANVAS_W - 18, 28);

  // Soap counter with a little soap icon.
  ctx.textAlign = 'left';
  ctx.fillStyle = SOAP_PALETTE[1];
  roundRectPath(ctx, 18, 16, 14, 12, 3);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillText(`x ${g.runSoap}`, 38, 28);

  // Ability bubbles (Z/X/C), dimmed while on cooldown.
  const abilities: Array<[string, boolean, number]> = [
    ['Z', g.cfg.abilities.shield, g.cooldowns.shield],
    ['X', g.cfg.abilities.slowmo, g.cooldowns.slowmo],
    ['C', g.cfg.abilities.clear, g.cooldowns.clear],
  ];
  let x = 120;
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px monospace';
  for (const [key, enabled, cd] of abilities) {
    if (!enabled) continue;
    ctx.globalAlpha = cd > 0 ? 0.35 : 1;
    ctx.beginPath();
    ctx.arc(x, 23, 9, 0, Math.PI * 2);
    ctx.fillStyle = BUBBLE_RIM;
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.fillText(key, x, 27);
    x += 26;
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}
```

- [ ] **Step 2: Type-check + full suite**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean (no unused imports), tests green.

- [ ] **Step 3: Commit**

```bash
git add src/render/hud.ts
git commit -m "feat: restyle HUD as a translucent bubble panel"
```

---

### Task 5: Menu + skill-tree restyle + title

**Files:**
- Modify: `src/ui/menu.ts` (full rewrite)
- Modify: `src/ui/skillTree.ts` (rewrite `drawSkillTree`; keep `layoutTree`/`nodeAtPoint`/constants exactly as-is)
- Modify: `index.html` (`<title>` text)

**Interfaces:**
- Consumes: palette, `createBubbleField/drawBackground`, sprites (`DUCK_RUN_1`, `DUCK_PALETTE`, `drawPixels`, `roundRectPath`), `SKILL_TREE/canPurchase`.
- Produces: `drawMenu(ctx, save)` and `drawSkillTree(ctx, save, hoveredId?)` — signatures unchanged, so `main.ts` is untouched.

- [ ] **Step 1: Rewrite `src/ui/menu.ts`**

```ts
import type { SaveData } from '../save/storage';
import { CANVAS_W } from '../config';
import { INK } from '../render/palette';
import { createBubbleField, drawBackground } from '../render/background';
import { DUCK_RUN_1, DUCK_PALETTE, drawPixels, gridSize } from '../render/sprites';

const field = createBubbleField(22, () => Math.random());

export function drawMenu(ctx: CanvasRenderingContext2D, save: SaveData): void {
  drawBackground(ctx, field, 0);

  // Decorative duck above the title.
  const ds = gridSize(DUCK_RUN_1);
  drawPixels(ctx, DUCK_RUN_1, CANVAS_W / 2 - ds.w * 3, 26, 6, DUCK_PALETTE);

  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = 'bold 38px monospace';
  ctx.fillText('SOAP DUCK', CANVAS_W / 2, 150);
  ctx.font = '14px monospace';
  ctx.fillText(`High Score: ${save.highScore}    Soap: ${save.totalSoap}`, CANVAS_W / 2, 184);
  ctx.fillText('Press SPACE to play', CANVAS_W / 2, 216);
  ctx.fillText('Press T for the skill tree', CANVAS_W / 2, 238);
  ctx.textAlign = 'left';
}
```

- [ ] **Step 2: Rewrite `drawSkillTree` in `src/ui/skillTree.ts`**

Keep the imports list but add the new ones, and keep `BRANCHES`, `COL_W`, `NODE_W`, `NODE_H`, `TOP`, `ROW_GAP`, `LEFT`, `TreeNodeBox`, `layoutTree`, and `nodeAtPoint` EXACTLY as they are. Replace only the `drawSkillTree` function and adjust the top imports.

Change the top imports (lines 1-3) to:
```ts
import type { SaveData } from '../save/storage';
import { SKILL_TREE, canPurchase, type SkillBranch } from '../skills/tree';
import { CANVAS_W } from '../config';
import { INK, FOAM, BUBBLE_RIM, SOAP_PALETTE } from '../render/palette';
import { createBubbleField, drawBackground } from '../render/background';
import { roundRectPath } from '../render/sprites';
```
Add a module-level field after the constants block:
```ts
const treeField = createBubbleField(18, () => Math.random());
```
Replace `drawSkillTree` with:
```ts
export function drawSkillTree(ctx: CanvasRenderingContext2D, save: SaveData, hoveredId?: string): void {
  drawBackground(ctx, treeField, 0);

  ctx.fillStyle = INK;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SKILL TREE`, LEFT, 20);
  ctx.fillStyle = SOAP_PALETTE[1];
  roundRectPath(ctx, LEFT + 110, 10, 12, 11, 3);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = '12px monospace';
  ctx.fillText(`x ${save.totalSoap}`, LEFT + 128, 20);
  ctx.font = '10px monospace';
  ctx.fillText('Click a node to buy • SPACE to play again', LEFT, 40);

  BRANCHES.forEach((branch, col) => {
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = INK;
    ctx.fillText(branch.toUpperCase(), LEFT + col * COL_W, TOP - 8);
  });

  for (const box of layoutTree()) {
    const node = SKILL_TREE.find((n) => n.id === box.id)!;
    const owned = save.unlockedNodes.includes(node.id);
    const affordable = canPurchase(node.id, save);
    const hovered = box.id === hoveredId;

    ctx.save();
    if (hovered && affordable) {
      ctx.shadowColor = BUBBLE_RIM;
      ctx.shadowBlur = 10;
    }
    roundRectPath(ctx, box.x, box.y, box.w, box.h, 7);
    ctx.fillStyle = owned ? INK : FOAM;
    ctx.fill();
    ctx.restore();

    roundRectPath(ctx, box.x, box.y, box.w, box.h, 7);
    ctx.lineWidth = hovered ? 3 : 1.5;
    ctx.strokeStyle = owned ? INK : affordable ? SOAP_PALETTE[1] : '#9bb7bf';
    ctx.stroke();

    ctx.fillStyle = owned ? FOAM : affordable ? INK : '#8aa2a9';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(node.name, box.x + 8, box.y + 11);
    ctx.font = '10px monospace';
    ctx.fillText(owned ? 'OWNED' : `${node.cost} soap`, box.x + 8, box.y + 22);
  }
}
```

- [ ] **Step 3: Update the page title in `index.html`**

Change `<title>Soap Dino</title>` to `<title>Soap Duck</title>`.

- [ ] **Step 4: Type-check + full suite**

Run: `npx tsc --noEmit && npm test`
Expected: tsc clean; the existing `skillTree.test.ts` (layout + within-canvas) still passes because `layoutTree`/`nodeAtPoint`/constants are unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/ui/menu.ts src/ui/skillTree.ts index.html
git commit -m "feat: restyle menu and skill tree, retitle to Soap Duck"
```

---

### Task 6: Browser verification + polish pass

**Files:**
- Modify (only if a visual defect is found): any `src/render/*` or `src/ui/*` file.

**Interfaces:** none new.

- [ ] **Step 1: Build to confirm production bundle is healthy**

Run: `npm run build`
Expected: tsc + vite build succeed.

- [ ] **Step 2: Run the dev server**

Run: `npm run dev` and open the printed URL.

- [ ] **Step 3: Verify the redesign visually**

Confirm:
- Menu shows the gradient + bubbles, the decorative duck, and the "SOAP DUCK" title.
- Pressing SPACE starts a run; the **rubber duck** runs (leg animation), jumps, and slides when ducking — and does NOT launch on the starting SPACE.
- Background gradient + rising bubbles + wavy foam line are visible and animate.
- Obstacles render as **shampoo bottles** (two sizes) and a **flying sponge**; the **soap bar** collectible is pink with a sparkle.
- Collecting soap emits a white bubble **pop**; dying emits a **splash**; the SOAP counter and ability bubbles in the HUD panel update.
- On death: GAME OVER overlay, then the restyled skill tree appears. All 19 nodes are visible and clickable; hover glows; owned/affordable/locked styles read clearly; buying persists across reload.

- [ ] **Step 4: Fix any visual defect found**

If a sprite reads wrong or an element is misplaced, adjust the relevant `render/`/`ui/` file, keep `npm test` + `npx tsc --noEmit` green, and commit with a `fix:` message. If everything looks right, no commit is needed.

- [ ] **Step 5: Final full suite**

Run: `npm test && npx tsc --noEmit`
Expected: all green, tsc clean.

---

## Self-Review Notes

- **Spec coverage:** palette + theme (Task 1) ✓; multi-color sprite engine + duck/shampoo/sponge/soap sprites (Task 1) ✓; animated background + foam (Task 2) ✓; particle effects (Task 2) ✓; scene composition + pickup/death hooks (Task 3) ✓; HUD restyle (Task 4) ✓; menu + skill-tree restyle + "SOAP DUCK" title (Task 5) ✓; logic untouched / 56 tests stay green (all tasks only touch render/ui/main) ✓; browser verification (Task 6) ✓.
- **Logic frozen:** no task edits `game/`, `skills/`, `save/`, `engine/`, or config logic constants. `drawScene` signature change is absorbed in Task 3's main.ts edit.
- **tsc-green ordering:** `drawPixels` accepts `string | string[]` from Task 1, so the old `scene.ts` keeps compiling until Task 3 rewrites it and removes the old sprites in the same task.
- **Type consistency:** `BubbleField`, `EffectList`, palette `string[]` (index 0 `''`), `PixelGrid`, `drawScene(ctx,g,t,bg,fx)`, `roundRectPath` names are used identically across producer/consumer tasks.
