import { beforeEach, describe, expect, it, vi } from "vitest";
import { initState } from "../game/core/state";
import { loadGame, migrateSave, saveGame } from "./storage";

function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    }
  };
}

describe("storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMockStorage());
    localStorage.clear();
  });

  it("falls back to init state on invalid payload", () => {
    const state = migrateSave({ bad: true });
    expect(state.coins).toBe(25);
  });

  it("saves and loads state", () => {
    const state = initState();
    state.coins = 123;
    saveGame(state);
    const loaded = loadGame();
    expect(loaded.state.coins).toBeGreaterThan(0);
  });
});
