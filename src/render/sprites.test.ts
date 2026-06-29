import { describe, it, expect } from 'vitest';
import {
  gridSize, type PixelGrid,
  DUCK_RUN_1, DUCK_JUMP, DUCK_SLIDE_1, SOAP_BAR,
  SHAMPOO_SMALL, SHAMPOO_LARGE, SPONGE_1, SPONGE_2,
} from './sprites';

function rectangular(g: PixelGrid): boolean {
  return g.length > 0 && g.every((row) => row.length === g[0].length);
}

describe('sprites', () => {
  it('all grids are rectangular', () => {
    for (const g of [DUCK_RUN_1, DUCK_JUMP, SOAP_BAR, SHAMPOO_LARGE, SPONGE_1]) {
      expect(rectangular(g)).toBe(true);
    }
  });

  it('grids contain filled pixels', () => {
    const filled = DUCK_RUN_1.flat().reduce((a, b) => a + b, 0);
    expect(filled).toBeGreaterThan(0);
  });

  it('gridSize reports columns x rows', () => {
    const { w, h } = gridSize(SOAP_BAR);
    expect(h).toBe(SOAP_BAR.length);
    expect(w).toBe(SOAP_BAR[0].length);
  });
});

describe('soap-duck sprites', () => {
  const all = { DUCK_RUN_1, DUCK_JUMP, DUCK_SLIDE_1, SOAP_BAR, SHAMPOO_SMALL, SHAMPOO_LARGE, SPONGE_1, SPONGE_2 };
  it('are rectangular', () => {
    for (const [, g] of Object.entries(all)) {
      expect(g.length).toBeGreaterThan(0);
      expect(g.every((r) => r.length === g[0].length)).toBe(true);
    }
  });
  it('contain colored (non-zero) pixels with valid palette indices', () => {
    for (const [, g] of Object.entries(all)) {
      const filled = g.flat().filter((v) => v > 0);
      expect(filled.length).toBeGreaterThan(0);
    }
  });
});
