import type { GameState, UpgradeId } from "./types";

export const SAVE_VERSION = 1;

function makeUpgrades(): Record<UpgradeId, number> {
  return {
    dropValue: 0,
    autoDropRate: 0,
    pusherForce: 0,
    tokenChance: 0,
    offlinePower: 0
  };
}

export function initState(nowMs = Date.now()): GameState {
  return {
    saveVersion: SAVE_VERSION,
    nowMs,
    lastSavedAtMs: nowMs,
    coins: 25,
    tokens: 0,
    prestigeLevel: 0,
    prestigeBonus: 1,
    pusherPhase: 0,
    boostTimer: 0,
    boostCooldown: 0,
    autoDropAccumulator: 0,
    manualDropCost: 1,
    nextCoinId: 1,
    nextFxId: 1,
    upgrades: makeUpgrades(),
    coinsOnBoard: [],
    rewardPops: [],
    particles: [],
    stats: {
      lifetimeCoinsEarned: 0,
      lifetimeTokensEarned: 0,
      drops: 0,
      prestiges: 0
    },
    audio: {
      muted: false
    }
  };
}
