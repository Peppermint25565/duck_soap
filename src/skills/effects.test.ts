import { describe, it, expect } from 'vitest';
import { buildRunConfig } from './effects';
import { BASE_JUMP_V } from '../config';

describe('buildRunConfig', () => {
  it('returns base config with no unlocks', () => {
    const c = buildRunConfig([]);
    expect(c.maxJumps).toBe(1);
    expect(c.jumpVelocity).toBe(BASE_JUMP_V);
    expect(c.soapMultiplier).toBe(1);
    expect(c.scoreMultiplier).toBe(1);
    expect(c.hitboxShrink).toBe(0);
  });

  it('applies double jump and higher jump', () => {
    const c = buildRunConfig(['doubleJump', 'higherJump']);
    expect(c.maxJumps).toBe(2);
    expect(c.jumpVelocity).toBeCloseTo(BASE_JUMP_V * 1.18);
  });

  it('stacks passive tiers', () => {
    const c = buildRunConfig(['score1', 'score2', 'score3', 'drop1', 'drop2', 'hitbox1', 'hitbox2']);
    expect(c.scoreMultiplier).toBeCloseTo(1.75);
    expect(c.soapDropRate).toBeCloseTo(2);
    expect(c.hitboxShrink).toBe(8);
  });

  it('sets ability flags and economy bonuses', () => {
    const c = buildRunConfig(['abilityShield', 'abilityClear', 'soapX2', 'extraLife', 'soapMagnet', 'slowRamp']);
    expect(c.abilities).toEqual({ shield: true, slowmo: false, clear: true });
    expect(c.soapMultiplier).toBe(2);
    expect(c.extraLives).toBe(1);
    expect(c.soapMagnet).toBe(true);
    expect(c.speedRampMultiplier).toBeCloseTo(0.6);
  });

  it('ignores unknown node ids', () => {
    const c = buildRunConfig(['nope']);
    expect(c.maxJumps).toBe(1);
  });
});
