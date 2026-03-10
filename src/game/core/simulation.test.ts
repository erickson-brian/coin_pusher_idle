import { describe, expect, it } from "vitest";
import { initState } from "./state";
import { applyAction, applyOfflineProgress, step } from "./simulation";

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

  it("does not lose coins in the bottom dead-zone", () => {
    const state = initState();
    state.coins = 10;
    state.coinsOnBoard.push({
      id: 1,
      x: 200,
      y: 550,
      vx: 0,
      vy: 0,
      radius: 8,
      life: 10
    });

    const before = state.coins;
    // Zero dt isolates resolution logic and reproduces the former soft-lock bug.
    step(state, 0);

    expect(state.coins).toBeGreaterThan(before);
    expect(state.coinsOnBoard).toHaveLength(0);
  });

  it("stacks coins on the pusher bar surface", () => {
    const state = initState();
    state.coinsOnBoard.push(
      {
        id: 1,
        x: 460,
        y: 330,
        vx: 0,
        vy: 0,
        radius: 8,
        life: 10
      },
      {
        id: 2,
        x: 462,
        y: 330,
        vx: 0,
        vy: 0,
        radius: 8,
        life: 10
      }
    );

    step(state, 0);

    expect(state.coinsOnBoard).toHaveLength(2);
    const sorted = [...state.coinsOnBoard].sort((a, b) => b.y - a.y);
    expect(sorted[0].y - sorted[1].y).toBeCloseTo(16, 3);
  });
});
