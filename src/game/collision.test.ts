import { describe, it, expect } from 'vitest';
import { intersects, type AABB } from './collision';

const box = (x: number, y: number, w: number, h: number): AABB => ({ x, y, w, h });

describe('intersects', () => {
  it('detects overlap', () => {
    expect(intersects(box(0, 0, 10, 10), box(5, 5, 10, 10))).toBe(true);
  });
  it('returns false when separated on x', () => {
    expect(intersects(box(0, 0, 10, 10), box(20, 0, 10, 10))).toBe(false);
  });
  it('returns false when separated on y', () => {
    expect(intersects(box(0, 0, 10, 10), box(0, 20, 10, 10))).toBe(false);
  });
  it('treats edge touch as non-overlap', () => {
    expect(intersects(box(0, 0, 10, 10), box(10, 0, 10, 10))).toBe(false);
  });
});
