import type { SaveData } from '../save/storage';
import { CANVAS_W } from '../config';
import { INK, DUCK_PALETTE } from '../render/palette';
import { createBubbleField, drawBackground } from '../render/background';
import { DUCK_RUN_1, drawPixels, gridSize } from '../render/sprites';

const field = createBubbleField(22, () => Math.random());

export function drawMenu(ctx: CanvasRenderingContext2D, save: SaveData): void {
  drawBackground(ctx, field, 0);

  // Decorative duck above the title.
  const ds = gridSize(DUCK_RUN_1);
  drawPixels(ctx, DUCK_RUN_1, CANVAS_W / 2 - ds.w * 3, 26, 6, DUCK_PALETTE);

  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.font = 'bold 38px monospace';
  ctx.fillText('SOAP DUCK', CANVAS_W / 2, 150);
  ctx.font = '14px monospace';
  ctx.fillText(`High Score: ${save.highScore}    Soap: ${save.totalSoap}`, CANVAS_W / 2, 184);
  ctx.fillText('Press SPACE to play', CANVAS_W / 2, 216);
  ctx.fillText('Press T for the skill tree', CANVAS_W / 2, 238);
  ctx.textAlign = 'left';
}
