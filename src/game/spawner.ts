import type { RunConfig } from '../skills/effects';
import { BASE_SPEED, SPEED_RAMP, MAX_SPEED, type ObstacleType } from '../config';

export interface SpawnEvent {
  obstacle?: ObstacleType;
  soap?: boolean;
}

export interface SpawnerState {
  time: number;
  nextObstacleAt: number;
  nextSoapAt: number;
}

export function currentSpeed(time: number, cfg: RunConfig): number {
  return Math.min(MAX_SPEED, BASE_SPEED + time * SPEED_RAMP * cfg.speedRampMultiplier);
}

export function createSpawner(): SpawnerState {
  return { time: 0, nextObstacleAt: 1.2, nextSoapAt: 0.8 };
}

function pickObstacle(rng: () => number): ObstacleType {
  const r = rng();
  if (r < 0.45) return 'cactusSmall';
  if (r < 0.8) return 'cactusLarge';
  return 'pterodactyl';
}

export function updateSpawner(
  s: SpawnerState,
  dt: number,
  cfg: RunConfig,
  rng: () => number = Math.random,
): SpawnEvent {
  s.time += dt;
  const event: SpawnEvent = {};

  if (s.time >= s.nextObstacleAt) {
    event.obstacle = pickObstacle(rng);
    // faster game => shorter gaps; jittered between ~0.7x and ~1.3x base gap.
    const speedFactor = currentSpeed(s.time, cfg) / BASE_SPEED;
    const baseGap = 1.4 / speedFactor;
    s.nextObstacleAt = s.time + baseGap * (0.7 + rng() * 0.6);
  }

  if (s.time >= s.nextSoapAt) {
    event.soap = true;
    const gap = 2.2 / cfg.soapDropRate;
    s.nextSoapAt = s.time + gap * (0.7 + rng() * 0.6);
  }

  return event;
}
