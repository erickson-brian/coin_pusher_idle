import { economyConfig } from "../economy/config";
import type { GameState } from "../core/types";

interface DrawParams {
  ctx: CanvasRenderingContext2D;
  state: GameState;
  width: number;
  height: number;
}

function worldToScreen(x: number, y: number, width: number, height: number): { sx: number; sy: number; scale: number } {
  const scale = Math.min(width / economyConfig.board.width, height / economyConfig.board.height);
  const offsetX = (width - economyConfig.board.width * scale) / 2;
  const offsetY = (height - economyConfig.board.height * scale) / 2;
  return {
    sx: offsetX + x * scale,
    sy: offsetY + y * scale,
    scale
  };
}

export function drawGame({ ctx, state, width, height }: DrawParams): void {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0e1d2f");
  gradient.addColorStop(1, "#152d46");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const wave = Math.sin(state.pusherPhase) * 18;

  const boardTop = worldToScreen(0, 80, width, height);
  const boardBottom = worldToScreen(economyConfig.board.width, economyConfig.board.height - 16, width, height);

  ctx.fillStyle = "rgba(248, 249, 250, 0.06)";
  ctx.fillRect(
    boardTop.sx,
    boardTop.sy,
    boardBottom.sx - boardTop.sx,
    boardBottom.sy - boardTop.sy
  );

  const pusher = worldToScreen(120 + wave, 320, width, height);
  const pusherScale = pusher.scale;
  ctx.fillStyle = state.boostTimer > 0 ? "#ff6b6b" : "#f4a261";
  ctx.fillRect(pusher.sx, pusher.sy, 680 * pusherScale, 20 * pusherScale);

  for (const coin of state.coinsOnBoard) {
    const p = worldToScreen(coin.x, coin.y, width, height);
    const r = coin.radius * p.scale;

    ctx.beginPath();
    ctx.fillStyle = "#ffd166";
    ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.5;
    ctx.arc(p.sx, p.sy, r * 0.66, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const pop of state.rewardPops) {
    const p = worldToScreen(pop.x, pop.y, width, height);
    const alpha = Math.max(0, pop.life / 0.75);
    ctx.fillStyle = `${pop.color}${Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.font = `600 ${Math.round(14 * p.scale)}px ui-sans-serif, system-ui`;
    ctx.fillText(pop.text, p.sx, p.sy);
  }

  for (const particle of state.particles) {
    const p = worldToScreen(particle.x, particle.y, width, height);
    const alpha = Math.max(0, Math.min(1, particle.life));
    ctx.fillStyle = `${particle.color}${Math.round(alpha * 255)
      .toString(16)
      .padStart(2, "0")}`;
    ctx.fillRect(p.sx, p.sy, 2.5 * p.scale, 2.5 * p.scale);
  }

  if (state.boostTimer > 0) {
    ctx.strokeStyle = "rgba(255, 107, 107, 0.9)";
    ctx.lineWidth = 4;
    const pct = state.boostTimer / 14;
    ctx.beginPath();
    ctx.arc(width - 42, 42, 22, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();
  }
}
