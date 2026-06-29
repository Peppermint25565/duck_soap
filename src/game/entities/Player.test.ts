import { describe, it, expect } from 'vitest';
import { createPlayer, jump, setDuck, fastFall, updatePlayer, playerAABB } from './Player';
import { buildRunConfig } from '../../skills/effects';
import { GROUND_Y, PLAYER_H } from '../../config';

describe('Player physics', () => {
  it('jumps off the ground', () => {
    const p = createPlayer();
    jump(p, buildRunConfig([]));
    expect(p.vy).toBeGreaterThan(0);
    expect(p.jumpsUsed).toBe(1);
  });

  it('blocks a second jump without double jump', () => {
    const p = createPlayer();
    const cfg = buildRunConfig([]);
    jump(p, cfg);
    const vyAfterFirst = p.vy;
    jump(p, cfg);
    expect(p.jumpsUsed).toBe(1);
    expect(p.vy).toBe(vyAfterFirst);
  });

  it('allows a second jump with double jump', () => {
    const p = createPlayer();
    const cfg = buildRunConfig(['doubleJump']);
    jump(p, cfg);
    jump(p, cfg);
    expect(p.jumpsUsed).toBe(2);
  });

  it('falls back to the ground and resets jumps', () => {
    const p = createPlayer();
    const cfg = buildRunConfig([]);
    jump(p, cfg);
    for (let i = 0; i < 200; i++) updatePlayer(p, 1 / 60);
    expect(p.y).toBe(0);
    expect(p.vy).toBe(0);
    expect(p.jumpsUsed).toBe(0);
  });

  it('fast-fall only works airborne when unlocked', () => {
    const cfg = buildRunConfig(['fastFall']);
    const grounded = createPlayer();
    fastFall(grounded, cfg);
    expect(grounded.vy).toBe(0); // grounded: ignored
    const air = createPlayer();
    jump(air, cfg);
    fastFall(air, cfg);
    expect(air.vy).toBeLessThan(0);
  });

  it('produces a shorter hitbox while ducking', () => {
    const p = createPlayer();
    const cfg = buildRunConfig([]);
    const standing = playerAABB(p, cfg);
    setDuck(p, true);
    const ducking = playerAABB(p, cfg);
    expect(ducking.h).toBeLessThan(standing.h);
  });

  it('shrinks hitbox by hitboxShrink on each side', () => {
    const p = createPlayer();
    const base = playerAABB(p, buildRunConfig([]));
    const shrunk = playerAABB(p, buildRunConfig(['hitbox1']));
    expect(shrunk.w).toBe(base.w - 8);
    expect(shrunk.h).toBe(base.h - 8);
  });

  it('places a grounded standing player feet on the ground line', () => {
    const p = createPlayer();
    const box = playerAABB(p, buildRunConfig([]));
    // box.y is shrunk by 0 here; bottom should sit at GROUND_Y
    expect(box.y + box.h).toBeCloseTo(GROUND_Y);
    expect(box.h).toBeCloseTo(PLAYER_H);
  });

  it('duck-slide makes the ducking hitbox shorter than a normal duck', () => {
    const p = createPlayer();
    setDuck(p, true);
    const normal = playerAABB(p, buildRunConfig([]));
    const slide = playerAABB(p, buildRunConfig(['duckSlide']));
    expect(slide.h).toBeLessThan(normal.h);
  });
});
