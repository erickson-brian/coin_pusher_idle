import { describe, expect, it } from "vitest";
import { initState } from "./state";
import { applyAction, applyOfflineProgress } from "./simulation";

describe("simulation actions", () => {
  it("supports drop, buy, boost, prestige loop", () => {
    const state = initState();
    state.coins = 10000;

    const drop = applyAction(state, { type: "DROP_COIN" });
    expect(drop.accepted).toBe(true);

    const buy = applyAction(state, { type: "BUY_UPGRADE", upgradeId: "dropValue" });
    expect(buy.accepted).toBe(true);

    const boost = applyAction(state, { type: "ACTIVATE_BOOST" });
    expect(boost.accepted).toBe(true);

    state.tokens = 50;
    state.stats.lifetimeCoinsEarned = 500000;
    const prestige = applyAction(state, { type: "PRESTIGE" });
    expect(prestige.accepted).toBe(true);
    expect(state.prestigeLevel).toBe(1);
    expect(state.prestigeBonus).toBeGreaterThan(1);
  });

  it("applies capped offline progress", () => {
    const state = initState();
    state.upgrades.autoDropRate = 20;

    const result = applyOfflineProgress(state, 1000 * 60 * 60 * 24);
    expect(result.simulatedMs).toBeLessThan(1000 * 60 * 60 * 24);
    expect(state.coins).toBeGreaterThan(0);
  });
});
