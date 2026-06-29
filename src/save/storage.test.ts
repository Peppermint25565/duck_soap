import { describe, it, expect } from 'vitest';
import { loadSave, writeSave, defaultSave, SAVE_KEY, type StorageLike } from './storage';

function fakeStore(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return { data, getItem: (k) => data[k] ?? null, setItem: (k, v) => { data[k] = v; } };
}

describe('storage', () => {
  it('returns defaults when empty', () => {
    const s = loadSave(fakeStore());
    expect(s).toEqual(defaultSave());
  });

  it('round-trips written data', () => {
    const store = fakeStore();
    writeSave({ totalSoap: 12, unlockedNodes: ['doubleJump'], highScore: 99 }, store);
    expect(loadSave(store)).toEqual({ totalSoap: 12, unlockedNodes: ['doubleJump'], highScore: 99 });
  });

  it('fills missing fields from corrupt/old saves', () => {
    const store = fakeStore({ [SAVE_KEY]: JSON.stringify({ totalSoap: 5 }) });
    const s = loadSave(store);
    expect(s.totalSoap).toBe(5);
    expect(s.unlockedNodes).toEqual([]);
    expect(s.highScore).toBe(0);
  });

  it('survives invalid JSON', () => {
    const store = fakeStore({ [SAVE_KEY]: 'not json' });
    expect(loadSave(store)).toEqual(defaultSave());
  });
});
