import { describe, it, expect } from 'vitest';
import { DUCK_PALETTE, SOAP_PALETTE, SHAMPOO_PALETTE, SPONGE_PALETTE } from './palette';

describe('sprite palettes', () => {
  it('reserve index 0 as transparent and have real colors after', () => {
    for (const p of [DUCK_PALETTE, SOAP_PALETTE, SHAMPOO_PALETTE, SPONGE_PALETTE]) {
      expect(p[0]).toBe('');
      expect(p.length).toBeGreaterThan(1);
      expect(p[1]).toMatch(/^#|rgba/);
    }
  });
});
