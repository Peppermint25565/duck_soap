import { startLoop } from './engine/loop';
import { createInput } from './engine/input';
import { loadSave, writeSave } from './save/storage';
import { buildRunConfig } from './skills/effects';
import { createGame, updateGame, type GameState } from './game/Game';
import { drawScene } from './render/scene';
import { drawHud } from './render/hud';
import { drawMenu } from './ui/menu';
import { drawSkillTree, nodeAtPoint } from './ui/skillTree';
import { purchase } from './skills/tree';
import { bankRun } from './game/economy';
import { CANVAS_W, CANVAS_H, GROUND_Y, PLAYER_X } from './config';
import { INK } from './render/palette';
import { createBubbleField, updateBubbles } from './render/background';
import { spawnBurst, updateEffects, type EffectList } from './render/effects';

type Screen = 'menu' | 'playing' | 'gameover' | 'tree';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let save = loadSave();
let screen: Screen = 'menu';
let game: GameState | null = null;
let gameoverTimer = 0;
let elapsed = 0;
let hoveredNode: string | undefined;

const input = createInput(window);

const bubbles = createBubbleField();
const effects: EffectList = [];
let prevRunSoap = 0;

function startRun() {
  game = createGame(buildRunConfig(save.unlockedNodes));
  screen = 'playing';
  elapsed = 0;
  prevRunSoap = 0;
  input.clearEdges();
}

// Extra keys not covered by edge input
window.addEventListener('keydown', (e) => {
  if (screen === 'menu' && e.code === 'Space') startRun();
  else if (screen === 'menu' && e.code === 'KeyT') screen = 'tree';
  else if (screen === 'tree' && e.code === 'Space') startRun();
  else if (screen === 'tree' && e.code === 'Escape') screen = 'menu';
});

canvas.addEventListener('mousemove', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (CANVAS_W / r.width);
  const y = (e.clientY - r.top) * (CANVAS_H / r.height);
  hoveredNode = screen === 'tree' ? nodeAtPoint(x, y) : undefined;
});

canvas.addEventListener('click', (e) => {
  if (screen !== 'tree') return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (CANVAS_W / r.width);
  const y = (e.clientY - r.top) * (CANVAS_H / r.height);
  const id = nodeAtPoint(x, y);
  if (id) {
    save = purchase(id, save);
    writeSave(save);
  }
});

function step(dt: number) {
  elapsed += dt;
  updateBubbles(bubbles, dt);
  updateEffects(effects, dt);

  if (screen === 'playing' && game) {
    updateGame(game, input.state, dt);
    input.clearEdges();

    if (game.runSoap > prevRunSoap) {
      const duckY = GROUND_Y - game.player.y - 24;
      spawnBurst(effects, PLAYER_X + 24, duckY, 'pop');
      prevRunSoap = game.runSoap;
    }

    if (game.over) {
      spawnBurst(effects, PLAYER_X + 24, GROUND_Y - 24, 'splash');
      save = bankRun(save, game.runSoap, game.score);
      writeSave(save);
      screen = 'gameover';
      gameoverTimer = 1.2;
    }
  } else if (screen === 'gameover') {
    input.clearEdges();
    gameoverTimer -= dt;
    if (gameoverTimer <= 0) screen = 'tree';
  } else {
    input.clearEdges();
  }
}

function render() {
  if (screen === 'menu') {
    drawMenu(ctx, save);
  } else if (screen === 'playing' && game) {
    drawScene(ctx, game, elapsed, bubbles, effects);
    drawHud(ctx, game);
  } else if (screen === 'gameover' && game) {
    drawScene(ctx, game, elapsed, bubbles, effects);
    drawHud(ctx, game);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = '28px monospace';
    ctx.fillText('GAME OVER', CANVAS_W / 2, 120);
    ctx.font = '13px monospace';
    ctx.fillText(`+${game.runSoap} soap banked`, CANVAS_W / 2, 150);
    ctx.textAlign = 'left';
  } else if (screen === 'tree') {
    drawSkillTree(ctx, save, hoveredNode);
  }
}

startLoop(step, render);
