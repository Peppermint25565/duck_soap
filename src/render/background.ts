import { CANVAS_W, CANVAS_H, GROUND_Y } from '../config';
import { SKY_TOP, SKY_BOTTOM, FOAM, FOAM_SHADE, BUBBLE_FILL, BUBBLE_RIM } from './palette';

export interface Bubble {
  x: number; y: number; r: number; speed: number; phase: number; drift: number;
}
export interface BubbleField {
  bubbles: Bubble[];
}

export function createBubbleField(count = 26, rng: () => number = Math.random): BubbleField {
  const bubbles: Bubble[] = [];
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: rng() * CANVAS_W,
      y: rng() * CANVAS_H,
      r: 3 + rng() * 9,
      speed: 12 + rng() * 26,
      phase: rng() * Math.PI * 2,
      drift: 6 + rng() * 10,
    });
  }
  return { bubbles };
}

export function updateBubbles(field: BubbleField, dt: number): void {
  for (const b of field.bubbles) {
    b.y -= b.speed * dt;
    b.phase += dt;
    if (b.y + b.r < 0) b.y = CANVAS_H + b.r;
  }
}

export function drawBackground(ctx: CanvasRenderingContext2D, field: BubbleField, distance: number): void {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, SKY_TOP);
  grad.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  for (const b of field.bubbles) {
    const x = b.x + Math.sin(b.phase) * b.drift;
    ctx.beginPath();
    ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = BUBBLE_FILL;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = BUBBLE_RIM;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - b.r * 0.3, b.y - b.r * 0.3, Math.max(1, b.r * 0.18), 0, Math.PI * 2);
    ctx.fillStyle = BUBBLE_RIM;
    ctx.fill();
  }

  // Foam band + scrolling wavy line at the ground.
  ctx.fillStyle = FOAM_SHADE;
  ctx.fillRect(0, GROUND_Y + 4, CANVAS_W, CANVAS_H - (GROUND_Y + 4));
  ctx.strokeStyle = FOAM;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= CANVAS_W; x += 8) {
    const y = GROUND_Y + Math.sin((x + distance) * 0.05) * 3;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
