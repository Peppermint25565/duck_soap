import type { GameState } from '../game/Game';
import type { ObstacleType } from '../config';
import { GROUND_Y, PLAYER_X } from '../config';
import {
  DUCK_RUN_1, DUCK_RUN_2, DUCK_JUMP, DUCK_SLIDE_1, DUCK_SLIDE_2,
  SOAP_BAR, SHAMPOO_SMALL, SHAMPOO_LARGE, SPONGE_1, SPONGE_2,
  drawPixels, gridSize, type PixelGrid,
} from './sprites';
import { DUCK_PALETTE, SOAP_PALETTE, SHAMPOO_PALETTE, SPONGE_PALETTE } from './palette';
import { drawBackground, type BubbleField } from './background';
import { drawEffects, type EffectList } from './effects';

const SCALE = 4;

function obstacleSprite(type: ObstacleType, t: number): { grid: PixelGrid; palette: string[] } {
  if (type === 'cactusSmall') return { grid: SHAMPOO_SMALL, palette: SHAMPOO_PALETTE };
  if (type === 'cactusLarge') return { grid: SHAMPOO_LARGE, palette: SHAMPOO_PALETTE };
  return { grid: Math.floor(t * 8) % 2 === 0 ? SPONGE_1 : SPONGE_2, palette: SPONGE_PALETTE };
}

export function drawScene(
  ctx: CanvasRenderingContext2D, g: GameState, t: number, bg: BubbleField, fx: EffectList,
): void {
  drawBackground(ctx, bg, g.distance);

  for (const o of g.obstacles) {
    const { grid, palette } = obstacleSprite(o.type, t);
    const os = gridSize(grid);
    drawPixels(ctx, grid, o.x, o.y, o.h / os.h, palette);
  }

  for (const s of g.soaps) {
    const ss = gridSize(SOAP_BAR);
    drawPixels(ctx, SOAP_BAR, s.x, s.y, s.h / ss.h, SOAP_PALETTE);
  }

  let grid: PixelGrid;
  if (g.player.y > 0) grid = DUCK_JUMP;
  else if (g.player.ducking) grid = Math.floor(t * 10) % 2 === 0 ? DUCK_SLIDE_1 : DUCK_SLIDE_2;
  else grid = Math.floor(t * 10) % 2 === 0 ? DUCK_RUN_1 : DUCK_RUN_2;
  const ps = gridSize(grid);
  const py = GROUND_Y - g.player.y - ps.h * SCALE;
  drawPixels(ctx, grid, PLAYER_X, py, SCALE, DUCK_PALETTE);

  drawEffects(ctx, fx);
}
