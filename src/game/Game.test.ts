import { describe, it, expect } from 'vitest';
import { createGame, updateGame, type GameState } from './Game';
import { buildRunConfig } from '../skills/effects';
import type { Input } from '../engine/input';

const noInput = (): Input => ({
  jumpPressed: false, duckHeld: false, downPressed: false,
  ability: { z: false, x: false, c: false }, restart: false,
});

function advance(g: GameState, frames: number, input: Input, rng = () => 0.5) {
  for (let i = 0; i < frames; i++) updateGame(g, input, 1 / 60, rng);
}

describe('Game (PLAYING)', () => {
  it('accumulates score and distance over time', () => {
    const g = createGame(buildRunConfig([]));
    advance(g, 120, noInput());
    expect(g.distance).toBeGreaterThan(0);
    expect(g.score).toBeGreaterThan(0);
  });

  it('jump input lifts the player', () => {
    const g = createGame(buildRunConfig([]));
    const input = noInput();
    input.jumpPressed = true;
    updateGame(g, input, 1 / 60, () => 0.5);
    expect(g.player.vy).toBeGreaterThan(0);
  });

  it('ends the run on collision without extra lives', () => {
    const g = createGame(buildRunConfig([]));
    // Force an obstacle onto the player position.
    g.obstacles.push({ type: 'cactusLarge', x: 60, y: 200, w: 30, h: 50 });
    updateGame(g, noInput(), 1 / 60, () => 0.5);
    expect(g.over).toBe(true);
  });

  it('extra life absorbs the first hit', () => {
    const g = createGame(buildRunConfig(['extraLife']));
    expect(g.livesLeft).toBe(1);
    g.obstacles.push({ type: 'cactusLarge', x: 60, y: 200, w: 30, h: 50 });
    updateGame(g, noInput(), 1 / 60, () => 0.5);
    expect(g.over).toBe(false);
    expect(g.livesLeft).toBe(0);
  });

  it('collects soap that overlaps the player', () => {
    const g = createGame(buildRunConfig(['soapX2']));
    g.soaps.push({ x: 60, y: 210, w: 20, h: 20, collected: false });
    updateGame(g, noInput(), 1 / 60, () => 0.5);
    expect(g.runSoap).toBe(2);
  });

  it('screen-clear ability removes obstacles', () => {
    const g = createGame(buildRunConfig(['abilityShield', 'abilityClear']));
    g.obstacles.push({ type: 'cactusSmall', x: 400, y: 220, w: 20, h: 30 });
    const input = noInput();
    input.ability.c = true;
    updateGame(g, input, 1 / 60, () => 0.5);
    expect(g.obstacles.length).toBe(0);
  });

  it('armed shield (Z) absorbs a hit without ending the run', () => {
    const g = createGame(buildRunConfig(['abilityShield']));
    const arm = noInput();
    arm.ability.z = true;
    updateGame(g, arm, 1 / 60, () => 0.5); // arm the shield (no obstacle yet)
    expect(g.shieldArmed).toBe(true);
    g.obstacles.push({ type: 'cactusLarge', x: 60, y: 200, w: 30, h: 50 });
    updateGame(g, noInput(), 1 / 60, () => 0.5); // take the hit
    expect(g.over).toBe(false);
    expect(g.shieldArmed).toBe(false);
  });
});
