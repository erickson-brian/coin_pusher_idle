import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfxEngine } from "../audio/sfx";
import { initState } from "../game/core/state";
import { applyAction, step } from "../game/core/simulation";
import type { Action, GameState, OfflineResult } from "../game/core/types";
import { clearSave, loadGame, saveGame } from "../persistence/storage";

const FIXED_DT = 1 / 30;
const MAX_FRAME_TIME = 0.25;
const SAVE_INTERVAL_MS = 5000;

export interface EngineState {
  state: GameState;
  offlineResult?: OfflineResult;
  dispatch: (action: Action) => void;
  clearLocalSave: () => void;
}

export function useGameEngine(): EngineState {
  const loaded = useMemo(() => loadGame(), []);
  const [state, setState] = useState<GameState>(loaded.state);
  const [offlineResult] = useState<OfflineResult | undefined>(loaded.offline);

  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);
  const saveTimerRef = useRef(0);

  const dispatch = useCallback((action: Action) => {
    setState((prev) => {
      const next: GameState = {
        ...prev,
        upgrades: { ...prev.upgrades },
        stats: { ...prev.stats },
        audio: { ...prev.audio },
        coinsOnBoard: [...prev.coinsOnBoard],
        rewardPops: [...prev.rewardPops],
        particles: [...prev.particles]
      };

      const result = applyAction(next, action);
      if (result.accepted && result.event) {
        sfxEngine.play(result.event as "drop" | "boost" | "buy" | "prestige", next.audio.muted);
      }

      return next;
    });
  }, []);

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = timestamp;
      }

      const frameTime = Math.min(MAX_FRAME_TIME, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;
      accumulatorRef.current += frameTime;

      setState((prev) => {
        const next: GameState = {
          ...prev,
          upgrades: { ...prev.upgrades },
          stats: { ...prev.stats },
          audio: { ...prev.audio },
          coinsOnBoard: prev.coinsOnBoard.map((coin) => ({ ...coin })),
          rewardPops: prev.rewardPops.map((pop) => ({ ...pop })),
          particles: prev.particles.map((particle) => ({ ...particle }))
        };

        while (accumulatorRef.current >= FIXED_DT) {
          step(next, FIXED_DT);
          accumulatorRef.current -= FIXED_DT;
          saveTimerRef.current += FIXED_DT * 1000;
        }

        if (saveTimerRef.current >= SAVE_INTERVAL_MS) {
          saveGame(next);
          saveTimerRef.current = 0;
        }

        return next;
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveGame(state);
      }
    };

    const onUnload = () => saveGame(state);

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [state]);

  const clearLocalSave = useCallback(() => {
    clearSave();
    setState(initState());
  }, []);

  return { state, offlineResult, dispatch, clearLocalSave };
}
