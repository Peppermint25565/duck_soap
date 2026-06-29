import { describe, it, expect } from 'vitest';
import { layoutTree, nodeAtPoint } from './skillTree';
import { SKILL_TREE } from '../skills/tree';
import { CANVAS_H } from '../config';

describe('skill tree layout', () => {
  it('lays out every node exactly once', () => {
    const layout = layoutTree();
    expect(layout.length).toBe(SKILL_TREE.length);
    expect(new Set(layout.map((n) => n.id)).size).toBe(SKILL_TREE.length);
  });

  it('hit-tests the center of a node box', () => {
    const layout = layoutTree();
    const n = layout[0];
    expect(nodeAtPoint(n.x + n.w / 2, n.y + n.h / 2)).toBe(n.id);
  });

  it('returns undefined for empty space', () => {
    expect(nodeAtPoint(-50, -50)).toBeUndefined();
  });

  it('keeps every node within the canvas height', () => {
    for (const b of layoutTree()) {
      expect(b.y + b.h).toBeLessThanOrEqual(CANVAS_H);
    }
  });
});
