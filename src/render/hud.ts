import type { GameState } from '../game/Game';
import { CANVAS_W } from '../config';
import { INK, PANEL, BUBBLE_RIM, SOAP_PALETTE } from './palette';
import { roundRectPath } from './sprites';

export function drawHud(ctx: CanvasRenderingContext2D, g: GameState): void {
  // Translucent rounded panel across the top.
  roundRectPath(ctx, 8, 8, CANVAS_W - 16, 30, 8);
  ctx.fillStyle = PANEL;
  ctx.fill();

  ctx.fillStyle = INK;
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE ${Math.floor(g.score).toString().padStart(5, '0')}`, CANVAS_W - 18, 28);

  // Soap counter with a little soap icon.
  ctx.textAlign = 'left';
  ctx.fillStyle = SOAP_PALETTE[1];
  roundRectPath(ctx, 18, 16, 14, 12, 3);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillText(`x ${g.runSoap}`, 38, 28);

  // Ability bubbles (Z/X/C), dimmed while on cooldown.
  const abilities: Array<[string, boolean, number]> = [
    ['Z', g.cfg.abilities.shield, g.cooldowns.shield],
    ['X', g.cfg.abilities.slowmo, g.cooldowns.slowmo],
    ['C', g.cfg.abilities.clear, g.cooldowns.clear],
  ];
  let x = 120;
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px monospace';
  for (const [key, enabled, cd] of abilities) {
    if (!enabled) continue;
    ctx.globalAlpha = cd > 0 ? 0.35 : 1;
    ctx.beginPath();
    ctx.arc(x, 23, 9, 0, Math.PI * 2);
    ctx.fillStyle = BUBBLE_RIM;
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.fillText(key, x, 27);
    x += 26;
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}
