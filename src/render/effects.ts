export interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; r: number; rises: boolean; color: string;
}
export type EffectList = Particle[];

const FALL = 380;

export function spawnBurst(
  list: EffectList, x: number, y: number, kind: 'pop' | 'splash', rng: () => number = Math.random,
): void {
  const n = kind === 'pop' ? 9 : 16;
  const rises = kind === 'pop';
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2;
    const sp = (rises ? 20 : 60) + rng() * (rises ? 40 : 120);
    const life = 0.5 + rng() * 0.5;
    list.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: rises ? -Math.abs(Math.sin(a) * sp) : Math.sin(a) * sp - 60,
      life, max: life,
      r: rises ? 2 + rng() * 4 : 1 + rng() * 3,
      rises,
      color: rises ? 'rgba(255,255,255,0.85)' : '#6fd0e6',
    });
  }
}

export function updateEffects(list: EffectList, dt: number): void {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += (p.rises ? -30 : FALL) * dt;
    p.life -= dt;
    if (p.life <= 0) list.splice(i, 1);
  }
}

export function drawEffects(ctx: CanvasRenderingContext2D, list: EffectList): void {
  for (const p of list) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
