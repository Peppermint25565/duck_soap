import { describe, it, expect } from 'vitest';
import { CANVAS_W, CANVAS_H, GROUND_Y, GRAVITY, BASE_SPEED, MAX_SPEED } from './config';

describe('config', () => {
  it('exposes sane constants', () => {
    expect(CANVAS_W).toBe(800);
    expect(CANVAS_H).toBe(300);
    expect(GROUND_Y).toBeLessThan(CANVAS_H);
    expect(GRAVITY).toBeGreaterThan(0);
    expect(MAX_SPEED).toBeGreaterThan(BASE_SPEED);
  });
});
