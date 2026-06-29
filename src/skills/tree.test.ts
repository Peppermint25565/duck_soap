import { describe, it, expect } from 'vitest';
import { SKILL_TREE, getNode, canPurchase, purchase } from './tree';
import { defaultSave } from '../save/storage';

describe('skill tree', () => {
  it('has unique node ids', () => {
    const ids = SKILL_TREE.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('references only existing prereqs', () => {
    const ids = new Set(SKILL_TREE.map((n) => n.id));
    for (const node of SKILL_TREE) {
      for (const p of node.prereqs) expect(ids.has(p)).toBe(true);
    }
  });

  it('cannot purchase without enough soap', () => {
    const save = { ...defaultSave(), totalSoap: 0 };
    const node = getNode('doubleJump')!;
    expect(node.cost).toBeGreaterThan(0);
    expect(canPurchase('doubleJump', save)).toBe(false);
  });

  it('cannot purchase when prereq missing', () => {
    const save = { ...defaultSave(), totalSoap: 9999 };
    expect(canPurchase('fastFall', save)).toBe(false); // needs doubleJump
  });

  it('purchases and deducts soap immutably', () => {
    const save = { ...defaultSave(), totalSoap: 9999 };
    const after = purchase('doubleJump', save);
    expect(after.unlockedNodes).toContain('doubleJump');
    expect(after.totalSoap).toBe(9999 - getNode('doubleJump')!.cost);
    expect(save.unlockedNodes).toEqual([]); // original untouched
  });

  it('unlocks prereq chain in order', () => {
    let save = { ...defaultSave(), totalSoap: 9999 };
    save = purchase('doubleJump', save);
    expect(canPurchase('fastFall', save)).toBe(true);
    save = purchase('fastFall', save);
    expect(save.unlockedNodes).toEqual(['doubleJump', 'fastFall']);
  });

  it('does not re-purchase an owned node', () => {
    let save = { ...defaultSave(), totalSoap: 9999 };
    save = purchase('higherJump', save);
    const soapAfterFirst = save.totalSoap;
    save = purchase('higherJump', save);
    expect(save.totalSoap).toBe(soapAfterFirst);
  });
});
