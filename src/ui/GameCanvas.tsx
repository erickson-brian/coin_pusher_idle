import { useEffect, useRef } from "react";
import { drawGame } from "../game/render/draw";
import { bindCanvasInput } from "../game/input/input";
import type { Action, GameState } from "../game/core/types";

interface GameCanvasProps {
  state: GameState;
  dispatch: (action: Action) => void;
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const parent = canvas.parentElement;
  if (!parent) {
    return;
  }
  const rect = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

export function GameCanvas({ state, dispatch }: GameCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const cleanupInput = bindCanvasInput(canvas, dispatch);
    const onResize = () => resizeCanvas(canvas);
    onResize();

    window.addEventListener("resize", onResize);
    return () => {
      cleanupInput();
      window.removeEventListener("resize", onResize);
    };
  }, [dispatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    drawGame({
      ctx,
      state,
      width: canvas.clientWidth,
      height: canvas.clientHeight
    });
  }, [state]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Coin pusher board" />;
}
