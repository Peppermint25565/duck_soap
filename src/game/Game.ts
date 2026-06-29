import type { RunConfig } from '../skills/effects';
import type { Input } from '../engine/input';
import type { ObstacleType } from '../config';
import { GROUND_Y, CANVAS_W } from '../config';
import {
  createPlayer, jump, setDuck, fastFall, updatePlayer, playerAABB, type PlayerState,
} from './entities/Player';
import { createSpawner, updateSpawner, currentSpeed, type SpawnerState } from './spawner';
import { soapValue } from './economy';
import { intersects, type AABB } from './collision';

export interface Obstacle { type: ObstacleType; x: number; y: number; w: number; h: number; }
export interface SoapItem { x: number; y: number; w: number; h: number; collected: boolean; }

export interface GameState {
  player: PlayerState;
  obstacles: Obstacle[];
  soaps: SoapItem[];
  spawner: SpawnerState;
  cfg: RunConfig;
  time: number;
  distance: number;
  runSoap: number;
  score: number;
  livesLeft: number;
  over: boolean;
  shieldArmed: boolean;
  cooldowns: { shield: number; slowmo: number; clear: number };
  slowmoTimer: number;
}

const ABILITY_COOLDOWN = 8;
const SLOWMO_DURATION = 3;
const SOAP_W = 20;
const SOAP_H = 20;

function obstacleBox(type: ObstacleType, rng: () => number): Obstacle {
  switch (type) {
    case 'cactusSmall': return { type, x: CANVAS_W, y: GROUND_Y - 35, w: 20, h: 35 };
    case 'cactusLarge': return { type, x: CANVAS_W, y: GROUND_Y - 50, w: 30, h: 50 };
    case 'pterodactyl': {
      const high = rng() < 0.5;
      const h = 26;
      const top = high ? GROUND_Y - 95 : GROUND_Y - 55;
      return { type, x: CANVAS_W, y: top, w: 42, h };
    }
  }
}

export function createGame(cfg: RunConfig): GameState {
  return {
    player: createPlayer(),
    obstacles: [],
    soaps: [],
    spawner: createSpawner(),
    cfg,
    time: 0,
    distance: 0,
    runSoap: 0,
    score: 0,
    livesLeft: cfg.extraLives,
    over: false,
    shieldArmed: false,
    cooldowns: { shield: 0, slowmo: 0, clear: 0 },
    slowmoTimer: 0,
  };
}

function tickCooldown(value: number, dt: number): number {
  return value > 0 ? Math.max(0, value - dt) : 0;
}

export function updateGame(g: GameState, input: Input, dt: number, rng: () => number = Math.random): void {
  if (g.over) return;

  // Input -> player
  if (input.jumpPressed) jump(g.player, g.cfg);
  setDuck(g.player, input.duckHeld);
  if (input.downPressed) fastFall(g.player, g.cfg);

  // Abilities
  if (input.ability.z && g.cfg.abilities.shield && g.cooldowns.shield === 0 && !g.shieldArmed) {
    g.shieldArmed = true;
  }
  if (input.ability.x && g.cfg.abilities.slowmo && g.cooldowns.slowmo === 0) {
    g.slowmoTimer = SLOWMO_DURATION;
    g.cooldowns.slowmo = ABILITY_COOLDOWN;
  }
  if (input.ability.c && g.cfg.abilities.clear && g.cooldowns.clear === 0) {
    g.obstacles = [];
    g.cooldowns.clear = ABILITY_COOLDOWN;
  }

  // Slow-mo scales world movement (not player gravity feel too harshly: scale dt for world only)
  g.slowmoTimer = tickCooldown(g.slowmoTimer, dt);
  const worldScale = g.slowmoTimer > 0 ? 0.5 : 1;

  g.cooldowns.shield = tickCooldown(g.cooldowns.shield, dt);
  g.cooldowns.slowmo = tickCooldown(g.cooldowns.slowmo, dt);
  g.cooldowns.clear = tickCooldown(g.cooldowns.clear, dt);

  // Physics
  updatePlayer(g.player, dt);

  // World time/speed
  g.time += dt;
  const speed = currentSpeed(g.time, g.cfg) * worldScale;
  const move = speed * dt;
  g.distance += move;
  g.score += move * 0.1 * g.cfg.scoreMultiplier;

  // Spawning
  const ev = updateSpawner(g.spawner, dt * worldScale, g.cfg, rng);
  if (ev.obstacle) g.obstacles.push(obstacleBox(ev.obstacle, rng));
  if (ev.soap) {
    const y = GROUND_Y - 30 - Math.floor(rng() * 70);
    g.soaps.push({ x: CANVAS_W, y, w: SOAP_W, h: SOAP_H, collected: false });
  }

  // Move entities left; soap magnet drifts soap toward player
  const pbox = playerAABB(g.player, g.cfg);
  for (const o of g.obstacles) o.x -= move;
  for (const s of g.soaps) {
    s.x -= move;
    if (g.cfg.soapMagnet && Math.abs(s.x - pbox.x) < 140) {
      s.x += (pbox.x - s.x) * 0.08;
      s.y += (pbox.y - s.y) * 0.08;
    }
  }
  g.obstacles = g.obstacles.filter((o) => o.x + o.w > -10);
  g.soaps = g.soaps.filter((s) => !s.collected && s.x + s.w > -10);

  // Soap collection
  for (const s of g.soaps) {
    const sbox: AABB = { x: s.x, y: s.y, w: s.w, h: s.h };
    if (!s.collected && intersects(pbox, sbox)) {
      s.collected = true;
      g.runSoap += soapValue(g.cfg);
    }
  }
  g.soaps = g.soaps.filter((s) => !s.collected);

  // Collision with obstacles
  for (const o of g.obstacles) {
    const obox: AABB = { x: o.x, y: o.y, w: o.w, h: o.h };
    if (intersects(pbox, obox)) {
      if (g.shieldArmed) {
        g.shieldArmed = false;
        g.cooldowns.shield = ABILITY_COOLDOWN;
        o.x = -9999; // hit absorbed by shield
      } else if (g.livesLeft > 0) {
        g.livesLeft--;
        o.x = -9999;
      } else {
        g.over = true;
      }
      break;
    }
  }
  g.obstacles = g.obstacles.filter((o) => o.x + o.w > -10);
}
