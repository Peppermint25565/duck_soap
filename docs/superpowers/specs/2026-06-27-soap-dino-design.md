# Soap Dino — Design Spec

**Date:** 2026-06-27
**Status:** Approved

## Summary

A Chrome-dino-style endless runner that reuses the original's monochrome
pixel-art texture, extended with two systems:

1. **Soap** — a collectible that acts as the progression currency.
2. **Skill tree** — permanent meta-progression purchased with soap.

The defining loop: run, collect soap, die, spend banked soap in the skill
tree, run again stronger.

## Tech Stack

- **TypeScript + Vite** (browser, HTML5 Canvas 2D, hot-reload dev server).
- **Vitest** for unit tests.
- No game framework — sprites and physics are hand-built to control the exact
  Chrome-dino look.

## Game Flow / State Machine

```
MENU ──play──► PLAYING ──death──► GAME_OVER ──auto──► SKILL_TREE ──play again──► PLAYING
  ▲                                                        │
  └────────────────────── back to menu ───────────────────┘
```

- **MENU**: title, high score, total soap, buttons (Play, Skill Tree).
- **PLAYING**: the runner. Player dodges obstacles, collects soap.
- **GAME_OVER**: brief death screen; run soap banks into total soap.
- **SKILL_TREE**: entered automatically after death (and from the menu). Spend
  total soap to unlock nodes. "Play Again" returns to PLAYING; unlocked skills
  apply to the next run.

## Architecture

Logic modules never import the canvas; render modules read game state and draw.
Fixed-timestep accumulator loop (deterministic physics, smooth render).

```
src/
  main.ts            bootstrap, canvas, state machine
  config.ts          tunable constants (gravity, speeds, costs)
  engine/loop.ts     fixed-timestep loop
  engine/input.ts    keyboard (jump/duck/ability keys)
  game/Game.ts       PLAYING state: update + collisions
  game/entities/     Player, Obstacle, Soap, Cloud
  game/spawner.ts    difficulty curve, obstacle/soap spawning
  skills/tree.ts     node definitions (id, cost, prereqs, effect)
  skills/effects.ts  applies unlocked nodes -> run config
  save/storage.ts    localStorage load/save
  render/sprites.ts  pixel-art sprite data + draw helpers
  render/hud.ts      score, soap count, ability cooldowns
  ui/menu.ts         menu screen
  ui/skillTree.ts    skill tree screen
```

## Texture / Visual Style

Recreate the Chrome dino's monochrome aesthetic: `#535353` sprites on a white
background, defined as pixel arrays in `sprites.ts`.

- **Dino**: 2-frame run cycle, jump frame, 2-frame duck cycle.
- **Obstacles**: small cactus, large cactus, flapping pterodactyl (spawns at
  high/low heights).
- **Background**: parallax clouds, dotted/dashed scrolling ground line.
- **Soap**: a new sprite in the same pixel style — a bar with small bubbles.

## Soap & Progression Economy

Permanent meta-progression.

- Soap collectibles float along the track during a run.
- Collecting adds to **run soap** (shown in HUD).
- On death, run soap banks into **total soap**.
- Persisted in `localStorage` under key `soap_dino_save`:
  ```json
  { "totalSoap": 0, "unlockedNodes": [], "highScore": 0 }
  ```
- The skill-tree screen spends `totalSoap` to unlock nodes; unlocks persist
  forever. `effects.ts` reads `unlockedNodes` and builds the run config applied
  at the start of each PLAYING session.

## Skill Tree (4 branches)

Each node: `id`, `cost` (soap), `prereqs` (node ids), `effect`. A node is
purchasable only when prereqs are unlocked and `totalSoap >= cost`.

- **Movement**: Double Jump → Fast-Fall Dive; Higher Jump; Duck-Slide.
- **Survival / Economy**: Slower Speed Ramp; Extra Life (one revive); Soap
  Magnet; Soap ×2 multiplier.
- **Active power-ups** (key-triggered, cooldown-based): Shield; Slow-Mo Dash;
  Screen-Clear Bubble.
- **Passive tiers** (stacking): Score Multiplier I–III; Soap Drop Rate I–III;
  Smaller Hitbox I–II.

## Controls

- **Space / ↑**: jump (double jump if unlocked).
- **↓**: duck (slide if unlocked).
- **↓ while airborne**: fast-fall dive (if unlocked).
- **Z / X / C**: active power-ups (Shield / Slow-Mo Dash / Screen-Clear) when
  unlocked and off cooldown.

## Testing

Vitest over pure-logic modules (render/loop kept thin):

- AABB collision detection.
- Soap banking math (run soap → total soap, with multiplier).
- Skill-effect application (`unlockedNodes` → run config).
- Save/load round-trip + migration of missing/old fields.
- Spawner difficulty curve (speed/spawn-rate increases over time).

## Out of Scope (YAGNI)

- Multiplayer / leaderboards / backend.
- Sound (optional stretch goal, not required).
- Mobile touch controls (keyboard only for the hackathon demo).
- Sprite asset files — all sprites are code-defined pixel arrays.
