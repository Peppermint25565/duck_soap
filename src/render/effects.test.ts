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
