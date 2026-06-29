import type { RunConfig } from '../../skills/effects';
import type { AABB } from '../collision';
import { GRAVITY, FASTFALL_V, PLAYER_X, PLAYER_W, PLAYER_H, DUCK_W, DUCK_H, GROUND_Y } from '../../config';

export interface PlayerState {
  y: number; // height above ground; 0 = grounded
  vy: number; // positive = up
  jumpsUsed: number;
  ducking: boolean;
}

export function createPlayer(): PlayerState {
  return { y: 0, vy: 0, jumpsUsed: 0, ducking: false };
}

export function jump(p: PlayerState, cfg: RunConfig): void {
  if (p.jumpsUsed < cfg.maxJumps) {
    p.vy = cfg.jumpVelocity;
    p.jumpsUsed++;
  }
}

export function setDuck(p: PlayerState, ducking: boolean): void {
  p.ducking = ducking;
}

export function fastFall(p: PlayerState, cfg: RunConfig): void {
  if (cfg.canFastFall && (p.y > 0 || p.vy > 0)) {
    p.vy = -FASTFALL_V;
  }
}

export function updatePlayer(p: PlayerState, dt: number): void {
  p.vy -= GRAVITY * dt;
  p.y += p.vy * dt;
  if (p.y <= 0) {
    p.y = 0;
    p.vy = 0;
    p.jumpsUsed = 0;
  }
}

export function playerAABB(p: PlayerState, cfg: RunConfig): AABB {
  const w = p.ducking ? DUCK_W : PLAYER_W;
  const h = p.ducking ? (cfg.canDuckSlide ? DUCK_H - 8 : DUCK_H) : PLAYER_H;
  const s = cfg.hitboxShrink;
  // bottom of player sits at GROUND_Y - p.y (y grows downward on screen)
  const bottom = GROUND_Y - p.y;
  const top = bottom - h;
  return {
    x: PLAYER_X + s,
    y: top + s,
    w: w - s * 2,
    h: h - s * 2,
  };
}
