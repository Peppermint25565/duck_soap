import type { SaveData } from '../save/storage';
import type { RunConfig } from '../skills/effects';

export function soapValue(cfg: RunConfig): number {
  return cfg.soapMultiplier;
}

export function bankRun(save: SaveData, runSoap: number, score: number): SaveData {
  return {
    ...save,
    totalSoap: save.totalSoap + runSoap,
    highScore: Math.max(save.highScore, Math.floor(score)),
  };
}
