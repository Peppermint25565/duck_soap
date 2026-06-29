import type { SaveData } from '../save/storage';

export type SkillBranch = 'movement' | 'economy' | 'active' | 'passive';

export interface SkillNode {
  id: string;
  name: string;
  branch: SkillBranch;
  cost: number;
  prereqs: string[];
  description: string;
}

export const SKILL_TREE: SkillNode[] = [
  // Movement
  { id: 'doubleJump', name: 'Double Jump', branch: 'movement', cost: 30, prereqs: [], description: 'Jump a second time in mid-air.' },
  { id: 'fastFall', name: 'Fast-Fall Dive', branch: 'movement', cost: 40, prereqs: ['doubleJump'], description: 'Press down in the air to dive fast.' },
  { id: 'higherJump', name: 'Higher Jump', branch: 'movement', cost: 35, prereqs: [], description: 'Jump higher.' },
  { id: 'duckSlide', name: 'Duck-Slide', branch: 'movement', cost: 25, prereqs: [], description: 'A faster, lower duck.' },
  // Economy / survival
  { id: 'slowRamp', name: 'Slower Speed Ramp', branch: 'economy', cost: 50, prereqs: [], description: 'The game speeds up more gently.' },
  { id: 'extraLife', name: 'Extra Life', branch: 'economy', cost: 80, prereqs: [], description: 'Revive once per run.' },
  { id: 'soapMagnet', name: 'Soap Magnet', branch: 'economy', cost: 45, prereqs: [], description: 'Nearby soap drifts toward you.' },
  { id: 'soapX2', name: 'Soap x2', branch: 'economy', cost: 70, prereqs: [], description: 'Each soap is worth double.' },
  // Active power-ups
  { id: 'abilityShield', name: 'Shield (Z)', branch: 'active', cost: 60, prereqs: [], description: 'Absorb one hit. Cooldown.' },
  { id: 'abilitySlowmo', name: 'Slow-Mo Dash (X)', branch: 'active', cost: 60, prereqs: [], description: 'Briefly slow time. Cooldown.' },
  { id: 'abilityClear', name: 'Screen-Clear Bubble (C)', branch: 'active', cost: 90, prereqs: ['abilityShield'], description: 'Wipe on-screen obstacles. Cooldown.' },
  // Passive tiers
  { id: 'score1', name: 'Score Mult I', branch: 'passive', cost: 20, prereqs: [], description: '+25% score.' },
  { id: 'score2', name: 'Score Mult II', branch: 'passive', cost: 40, prereqs: ['score1'], description: '+25% score.' },
  { id: 'score3', name: 'Score Mult III', branch: 'passive', cost: 80, prereqs: ['score2'], description: '+25% score.' },
  { id: 'drop1', name: 'Soap Drop I', branch: 'passive', cost: 20, prereqs: [], description: 'More soap spawns.' },
  { id: 'drop2', name: 'Soap Drop II', branch: 'passive', cost: 40, prereqs: ['drop1'], description: 'More soap spawns.' },
  { id: 'drop3', name: 'Soap Drop III', branch: 'passive', cost: 80, prereqs: ['drop2'], description: 'More soap spawns.' },
  { id: 'hitbox1', name: 'Smaller Hitbox I', branch: 'passive', cost: 35, prereqs: [], description: 'Shrink your hitbox.' },
  { id: 'hitbox2', name: 'Smaller Hitbox II', branch: 'passive', cost: 70, prereqs: ['hitbox1'], description: 'Shrink your hitbox more.' },
];

export function getNode(id: string): SkillNode | undefined {
  return SKILL_TREE.find((n) => n.id === id);
}

export function canPurchase(id: string, save: SaveData): boolean {
  const node = getNode(id);
  if (!node) return false;
  if (save.unlockedNodes.includes(id)) return false;
  if (!node.prereqs.every((p) => save.unlockedNodes.includes(p))) return false;
  return save.totalSoap >= node.cost;
}

export function purchase(id: string, save: SaveData): SaveData {
  if (!canPurchase(id, save)) return save;
  const node = getNode(id)!;
  return {
    ...save,
    totalSoap: save.totalSoap - node.cost,
    unlockedNodes: [...save.unlockedNodes, id],
  };
}
