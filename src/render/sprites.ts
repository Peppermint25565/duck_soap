export type PixelGrid = number[][];

const DEFAULT_MAP: Record<string, number> = { '#': 1 };

export const P = (rows: string[], map: Record<string, number> = DEFAULT_MAP): PixelGrid =>
  rows.map((r) => r.split('').map((c) => map[c] ?? 0));

export function gridSize(grid: PixelGrid): { w: number; h: number } {
  return { w: grid[0]?.length ?? 0, h: grid.length };
}

export function drawPixels(
  ctx: CanvasRenderingContext2D,
  grid: PixelGrid,
  x: number,
  y: number,
  scale: number,
  paint: string | string[],
): void {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const v = grid[row][col];
      if (!v) continue;
      const color = typeof paint === 'string' ? paint : paint[v];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

const DUCK_MAP = { '.': 0, 'B': 1, 'K': 2, 'E': 3, 'W': 4 };
const SOAP_MAP = { '.': 0, 'S': 1, 'H': 2, '*': 3 };
const SHAMPOO_MAP = { '.': 0, 'B': 1, 'C': 2, 'L': 3 };
const SPONGE_MAP = { '.': 0, 'S': 1, 'O': 2 };

export const DUCK_RUN_1 = P([
  '....BBBB....',
  '...BBBBBB...',
  '...BBEBBBKK.',
  '...BBBBBBKK.',
  '...BBBBBB...',
  '..BBBBBBBB..',
  '.BBBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  '.BBBBBBBBBB.',
  '..BB....BB..',
  '..BB....BB..',
], DUCK_MAP);

export const DUCK_RUN_2 = P([
  '....BBBB....',
  '...BBBBBB...',
  '...BBEBBBKK.',
  '...BBBBBBKK.',
  '...BBBBBB...',
  '..BBBBBBBB..',
  '.BBBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  '.BBBBBBBBBB.',
  '..BB...BB...',
  '...BB..BB...',
], DUCK_MAP);

export const DUCK_JUMP = P([
  '....BBBB....',
  '...BBBBBB...',
  '...BBEBBBKK.',
  '...BBBBBBKK.',
  '...BBBBBB...',
  '..BBBBBBBB..',
  '.BBBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  '.BBBBBBBBBB.',
  '...BB..BB...',
  '....BBBB....',
], DUCK_MAP);

export const DUCK_SLIDE_1 = P([
  '....BBBBB......',
  '...BBBBBBB...KK',
  '..BBBEBBBBB.KK.',
  '.BBBBBBBBBBBB..',
  'BBBBBBBBBBBBBB.',
  '.BBBBBBBBBBBB..',
  '..BB......BB...',
], DUCK_MAP);

export const DUCK_SLIDE_2 = P([
  '....BBBBB......',
  '...BBBBBBB...KK',
  '..BBBEBBBBB.KK.',
  '.BBBBBBBBBBBB..',
  'BBBBBBBBBBBBBB.',
  '.BBBBBBBBBBBB..',
  '...BB....BB....',
], DUCK_MAP);

export const SOAP_BAR = P([
  '..*....',
  '.SSSSS.',
  'SSHHHSS',
  'SSHHHSS',
  '.SSSSS.',
  '...*...',
], SOAP_MAP);

export const SHAMPOO_SMALL = P([
  '..CC..',
  '..CC..',
  '.BBBB.',
  'BBBBBB',
  'BLLLLB',
  'BLLLLB',
  'BBBBBB',
  'BBBBBB',
], SHAMPOO_MAP);

export const SHAMPOO_LARGE = P([
  '..CCC..',
  '..CCC..',
  '...C...',
  '.BBBBB.',
  'BBBBBBB',
  'BLLLLLB',
  'BLLLLLB',
  'BBBBBBB',
  'BBBBBBB',
  'BBBBBBB',
  'BBBBBBB',
], SHAMPOO_MAP);

export const SPONGE_1 = P([
  '.SSSSSS.',
  'SSOSSOSS',
  'SSSSSSSS',
  'SOSSSSOS',
  'SSSSSSSS',
  '.SSSSSS.',
], SPONGE_MAP);

export const SPONGE_2 = P([
  'SSSSSSSS',
  'SSOSSOSS',
  '.SSSSSS.',
  '.SOSSOS.',
  'SSSSSSSS',
  'SSSSSSSS',
], SPONGE_MAP);
