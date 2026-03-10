import type { Action } from "../core/types";

export type DispatchAction = (action: Action) => void;

export function bindCanvasInput(canvas: HTMLCanvasElement, dispatch: DispatchAction): () => void {
  const onPointerDown = () => {
    dispatch({ type: "DROP_COIN" });
  };

  canvas.addEventListener("pointerdown", onPointerDown);

  return () => {
    canvas.removeEventListener("pointerdown", onPointerDown);
  };
}
