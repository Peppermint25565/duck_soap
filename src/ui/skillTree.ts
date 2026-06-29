import type { SaveData } from '../save/storage';
import { SKILL_TREE, canPurchase, type SkillBranch } from '../skills/tree';
import { INK, FOAM, BUBBLE_RIM, SOAP_PALETTE } from '../render/palette';
import { createBubbleField, drawBackground } from '../render/background';
import { roundRectPath } from '../render/sprites';

const BRANCHES: SkillBranch[] = ['movement', 'economy', 'active', 'passive'];
const COL_W = 195;
const NODE_W = 178;
const NODE_H = 25;
const TOP = 60;
const ROW_GAP = 29;
const LEFT = 10;

const treeField = createBubbleField(18, () => Math.random());

export interface TreeNodeBox {
  id: string; col: number; row: number; x: number; y: number; w: number; h: number;
}

export function layoutTree(): TreeNodeBox[] {
  const boxes: TreeNodeBox[] = [];
  BRANCHES.forEach((branch, col) => {
    const nodes = SKILL_TREE.filter((n) => n.branch === branch);
    nodes.forEach((n, row) => {
      boxes.push({
        id: n.id, col, row,
        x: LEFT + col * COL_W,
        y: TOP + row * ROW_GAP,
        w: NODE_W, h: NODE_H,
      });
    });
  });
  return boxes;
}

export function nodeAtPoint(x: number, y: number): string | undefined {
  for (const b of layoutTree()) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
  }
  return undefined;
}

export function drawSkillTree(ctx: CanvasRenderingContext2D, save: SaveData, hoveredId?: string): void {
  drawBackground(ctx, treeField, 0);

  ctx.fillStyle = INK;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SKILL TREE`, LEFT, 20);
  ctx.fillStyle = SOAP_PALETTE[1];
  roundRectPath(ctx, LEFT + 110, 10, 12, 11, 3);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = '12px monospace';
  ctx.fillText(`x ${save.totalSoap}`, LEFT + 128, 20);
  ctx.font = '10px monospace';
  ctx.fillText('Click a node to buy • SPACE to play again', LEFT, 40);

  BRANCHES.forEach((branch, col) => {
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = INK;
    ctx.fillText(branch.toUpperCase(), LEFT + col * COL_W, TOP - 8);
  });

  for (const box of layoutTree()) {
    const node = SKILL_TREE.find((n) => n.id === box.id)!;
    const owned = save.unlockedNodes.includes(node.id);
    const affordable = canPurchase(node.id, save);
    const hovered = box.id === hoveredId;

    ctx.save();
    if (hovered && affordable) {
      ctx.shadowColor = BUBBLE_RIM;
      ctx.shadowBlur = 10;
    }
    roundRectPath(ctx, box.x, box.y, box.w, box.h, 7);
    ctx.fillStyle = owned ? INK : FOAM;
    ctx.fill();
    ctx.restore();

    roundRectPath(ctx, box.x, box.y, box.w, box.h, 7);
    ctx.lineWidth = hovered ? 3 : 1.5;
    ctx.strokeStyle = owned ? INK : affordable ? SOAP_PALETTE[1] : '#9bb7bf';
    ctx.stroke();

    ctx.fillStyle = owned ? FOAM : affordable ? INK : '#8aa2a9';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(node.name, box.x + 8, box.y + 11);
    ctx.font = '10px monospace';
    ctx.fillText(owned ? 'OWNED' : `${node.cost} soap`, box.x + 8, box.y + 22);
  }
}
