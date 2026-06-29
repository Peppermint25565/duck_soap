import { describe, it, expect } from 'vitest';
import { stepAccumulator } from './loop';

describe('stepAccumulator', () => {
  it('produces whole steps and keeps remainder', () => {
    const r = stepAccumulator(0, 25, 1000 / 60, 5);
    expect(r.steps).toBe(1);
    expect(r.remainder).toBeCloseTo(25 - 1000 / 60);
  });

  it('clamps the spiral of death', () => {
    const r = stepAccumulator(0, 5000, 1000 / 60, 5);
    expect(r.steps).toBe(5);
  });

  it('accumulates across frames', () => {
    const step = 1000 / 60;
    let r = stepAccumulator(0, 10, step, 5);
    expect(r.steps).toBe(0);
    r = stepAccumulator(r.remainder, 10, step, 5);
    expect(r.steps).toBe(1);
  });
});
