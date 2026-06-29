import { describe, it, expect } from 'vitest';
import { createBubbleField, updateBubbles, type BubbleField } from './background';
import { CANVAS_H } from '../config';

describe('bubble field', () => {
  it('bubbles rise over time', () => {
    const f: BubbleField = { bubbles: [{ x: 100, y: 200, r: 6, speed: 30, phase: 0, drift: 0 }] };
    updateBubbles(f, 0.1);
    expect(f.bubbles[0].y).toBeLessThan(200);
  });
  it('wraps a bubble to the bottom once it rises off the top', () => {
    const f: BubbleField = { bubbles: [{ x: 100, y: 5, r: 6, speed: 30, phase: 0, drift: 0 }] };
    updateBubbles(f, 1);
    expect(f.bubbles[0].y).toBeGreaterThan(CANVAS_H);
  });
  it('createBubbleField makes the requested count', () => {
    expect(createBubbleField(5, () => 0.5).bubbles.length).toBe(5);
  });
});
