export interface SaveData {
  totalSoap: number;
  unlockedNodes: string[];
  highScore: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const SAVE_KEY = 'soap_dino_save';

export function defaultSave(): SaveData {
  return { totalSoap: 0, unlockedNodes: [], highScore: 0 };
}

function getStore(store?: StorageLike): StorageLike | null {
  if (store) return store;
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage as StorageLike;
  }
  return null;
}

export function loadSave(store?: StorageLike): SaveData {
  const s = getStore(store);
  if (!s) return defaultSave();
  const raw = s.getItem(SAVE_KEY);
  if (!raw) return defaultSave();
  try {
    const parsed = JSON.parse(raw);
    const def = defaultSave();
    return {
      totalSoap: typeof parsed.totalSoap === 'number' ? parsed.totalSoap : def.totalSoap,
      unlockedNodes: Array.isArray(parsed.unlockedNodes) ? parsed.unlockedNodes : def.unlockedNodes,
      highScore: typeof parsed.highScore === 'number' ? parsed.highScore : def.highScore,
    };
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData, store?: StorageLike): void {
  const s = getStore(store);
  if (!s) return;
  s.setItem(SAVE_KEY, JSON.stringify(data));
}
