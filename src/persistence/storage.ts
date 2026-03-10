import { SAVE_VERSION, initState } from "../game/core/state";
import { applyOfflineProgress } from "../game/core/simulation";
import type { GameState, OfflineResult } from "../game/core/types";

const STORAGE_KEY = "coin-pusher-idle-save";

interface SavePayload {
  saveVersion: number;
  state: GameState;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function migrateSave(raw: unknown): GameState {
  if (!isObject(raw)) {
    return initState();
  }

  const candidate = raw as Partial<GameState>;
  if (candidate.saveVersion !== SAVE_VERSION) {
    return initState();
  }

  try {
    const base = initState();
    return {
      ...base,
      ...candidate,
      upgrades: { ...base.upgrades, ...(candidate.upgrades ?? {}) },
      stats: { ...base.stats, ...(candidate.stats ?? {}) },
      audio: { ...base.audio, ...(candidate.audio ?? {}) },
      coinsOnBoard: [],
      rewardPops: [],
      particles: []
    };
  } catch {
    return initState();
  }
}

export function saveGame(state: GameState): void {
  const payload: SavePayload = {
    saveVersion: SAVE_VERSION,
    state: {
      ...state,
      lastSavedAtMs: Date.now(),
      coinsOnBoard: [],
      rewardPops: [],
      particles: []
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadGame(): { state: GameState; offline?: OfflineResult } {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { state: initState() };
  }

  try {
    const payload = JSON.parse(raw) as SavePayload;
    const state = migrateSave(payload.state);
    const elapsedMs = Date.now() - state.lastSavedAtMs;
    if (elapsedMs <= 0) {
      return { state };
    }

    const offline = applyOfflineProgress(state, elapsedMs);
    state.lastSavedAtMs = Date.now();
    return { state, offline };
  } catch {
    return { state: initState() };
  }
}

export function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY);
}
