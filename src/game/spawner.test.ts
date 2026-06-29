import { describe, it, expect } from 'vitest';
import { currentSpeed, createSpawner, updateSpawner } from './spawner';
import { buildRunConfig } from '../skills/effects';
import { BASE_SPEED, MAX_SPEED } from '../config';

describe('spawner', () => {
  it('speed starts at base and ramps up', () => {
    const cfg = buildRunConfig([]);
    expect(currentSpeed(0, cfg)).toBe(BASE_SPEED);
    expect(currentSpeed(10, cfg)).toBeGreaterThan(BASE_SPEED);
  });

  it('speed is capped at MAX_SPEED', () => {
    const cfg = buildRunConfig([]);
    expect(currentSpeed(100000, cfg)).toBe(MAX_SPEED);
  });

  it('slowRamp makes the ramp gentler', () => {
    const base = currentSpeed(20, buildRunConfig([]));
    const slow = currentSpeed(20, buildRunConfig(['slowRamp']));
    expect(slow).toBeLessThan(base);
  });

  it('emits an obstacle once enough time passes', () => {
    const cfg = buildRunConfig([]);
    const s = createSpawner();
    let sawObstacle = false;
    const rng = () => 0.5;
    for (let i = 0; i < 600; i++) {
      const e = updateSpawner(s, 1 / 60, cfg, rng);
      if (e.obstacle) sawObstacle = true;
    }
    expect(sawObstacle).toBe(true);
  });

  it('higher soapDropRate yields more soap over time', () => {
    const rng = () => 0.5;
    const count = (cfg: ReturnType<typeof buildRunConfig>) => {
      const s = createSpawner();
      let n = 0;
      for (let i = 0; i < 1800; i++) if (updateSpawner(s, 1 / 60, cfg, rng).soap) n++;
      return n;
    };
    expect(count(buildRunConfig(['drop1', 'drop2', 'drop3']))).toBeGreaterThan(count(buildRunConfig([])));
  });
});
