import { describe, expect, it } from "vitest";
import { initState } from "../core/state";
import {
  getOfflineCapMs,
  getPrestigeGain,
  getTokenChance,
  getUpgradeCost,
  canBuyUpgrade
} from "./formulas";

describe("economy formulas", () => {
  it("scales upgrade costs exponentially", () => {
    const l0 = getUpgradeCost("dropValue", 0);
    const l5 = getUpgradeCost("dropValue", 5);
    expect(l5).toBeGreaterThan(l0);
  });

  it("increases token chance with upgrades", () => {
    const state = initState();
    const base = getTokenChance(state);
    state.upgrades.tokenChance = 10;
    expect(getTokenChance(state)).toBeGreaterThan(base);
  });

  it("increases offline cap via offlinePower", () => {
    const state = initState();
    const base = getOfflineCapMs(state);
    state.upgrades.offlinePower = 5;
    expect(getOfflineCapMs(state)).toBeGreaterThan(base);
  });

  it("locks prestige until token requirement", () => {
    const state = initState();
    state.stats.lifetimeCoinsEarned = 200000;
    state.tokens = 0;
    expect(getPrestigeGain(state)).toBe(0);
  });

  it("can buy upgrade only if coins are sufficient", () => {
    const state = initState();
    state.coins = 1000;
    expect(canBuyUpgrade(state, "dropValue")).toBe(true);
    state.coins = 0;
    expect(canBuyUpgrade(state, "dropValue")).toBe(false);
  });
});
