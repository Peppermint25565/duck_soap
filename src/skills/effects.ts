import { BASE_JUMP_V } from '../config';

export interface RunConfig {
  maxJumps: number;
  jumpVelocity: number;
  canFastFall: boolean;
  canDuckSlide: boolean;
  speedRampMultiplier: number;
  extraLives: number;
  soapMagnet: boolean;
  soapMultiplier: number;
  abilities: { shield: boolean; slowmo: boolean; clear: boolean };
  scoreMultiplier: number;
  soapDropRate: number;
  hitboxShrink: number;
}

export function buildRunConfig(unlockedNodes: string[]): RunConfig {
  const has = (id: string) => unlockedNodes.includes(id);
  const cfg: RunConfig = {
    maxJumps: 1,
    jumpVelocity: BASE_JUMP_V,
    canFastFall: false,
    canDuckSlide: false,
    speedRampMultiplier: 1,
    extraLives: 0,
    soapMagnet: false,
    soapMultiplier: 1,
    abilities: { shield: false, slowmo: false, clear: false },
    scoreMultiplier: 1,
    soapDropRate: 1,
    hitboxShrink: 0,
  };

  if (has('doubleJump')) cfg.maxJumps = 2;
  if (has('higherJump')) cfg.jumpVelocity = BASE_JUMP_V * 1.18;
  if (has('fastFall')) cfg.canFastFall = true;
  if (has('duckSlide')) cfg.canDuckSlide = true;
  if (has('slowRamp')) cfg.speedRampMultiplier = 0.6;
  if (has('extraLife')) cfg.extraLives = 1;
  if (has('soapMagnet')) cfg.soapMagnet = true;
  if (has('soapX2')) cfg.soapMultiplier = 2;
  if (has('abilityShield')) cfg.abilities.shield = true;
  if (has('abilitySlowmo')) cfg.abilities.slowmo = true;
  if (has('abilityClear')) cfg.abilities.clear = true;

  for (const id of ['score1', 'score2', 'score3']) if (has(id)) cfg.scoreMultiplier += 0.25;
  for (const id of ['drop1', 'drop2', 'drop3']) if (has(id)) cfg.soapDropRate += 0.5;
  for (const id of ['hitbox1', 'hitbox2']) if (has(id)) cfg.hitboxShrink += 4;

  return cfg;
}
