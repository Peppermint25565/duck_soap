export function stepAccumulator(
  acc: number,
  frameMs: number,
  stepMs: number,
  maxSteps: number,
): { steps: number; remainder: number } {
  let a = acc + frameMs;
  let steps = 0;
  while (a >= stepMs && steps < maxSteps) {
    a -= stepMs;
    steps++;
  }
  if (steps >= maxSteps) a = 0; // drop backlog to avoid spiral of death
  return { steps, remainder: a };
}

const STEP_MS = 1000 / 60;
const MAX_STEPS = 5;

export function startLoop(
  onStep: (dt: number) => void,
  onRender: (alpha: number) => void,
): () => void {
  let acc = 0;
  let last = performance.now();
  let running = true;
  let raf = 0;

  const frame = (now: number) => {
    if (!running) return;
    const { steps, remainder } = stepAccumulator(acc, now - last, STEP_MS, MAX_STEPS);
    last = now;
    acc = remainder;
    for (let i = 0; i < steps; i++) onStep(1 / 60);
    onRender(acc / STEP_MS);
    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);
  return () => {
    running = false;
    cancelAnimationFrame(raf);
  };
}
