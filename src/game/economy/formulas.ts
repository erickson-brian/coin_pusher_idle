import { economyConfig } from "./config";
import type { GameState, UpgradeId } from "../core/types";

export const UPGRADE_IDS: UpgradeId[] = [
  "dropValue",
  "autoDropRate",
  "pusherForce",
  "tokenChance",
  "offlinePower"
];

export function getUpgradeCost(upgradeId: UpgradeId, level: number): number {
  const def = economyConfig.upgrades[upgradeId];
  const unclamped = def.baseCostCoins * Math.pow(def.growth, level);
  return Math.floor(unclamped);
}

export function getDropReward(state: GameState): number {
  const level = state.upgrades.dropValue;
  const base = 1.8 + level * 0.5;
  const boosted = base * getBoostMultiplier(state);
  return boosted * state.prestigeBonus;
}

export function getAutoDropsPerSecond(state: GameState): number {
  const level = state.upgrades.autoDropRate;
  return level === 0 ? 0 : 0.12 + level * 0.08;
}

export function getPusherForceMultiplier(state: GameState): number {
  return 1 + state.upgrades.pusherForce * 0.03;
}

export function getTokenChance(state: GameState): number {
  const base = economyConfig.board.edgePayoutChance;
  const bonus = state.upgrades.tokenChance * 0.003;
  return Math.min(0.75, base + bonus);
}

export function getBoostMultiplier(state: GameState): number {
  return state.boostTimer > 0 ? economyConfig.boost.multiplier : 1;
}

export function getOfflineCapMs(state: GameState): number {
  const hours = economyConfig.offline.baseCapHours + state.upgrades.offlinePower * 0.2;
  return hours * 60 * 60 * 1000;
}

export function getOfflineMultiplier(state: GameState): number {
  return economyConfig.offline.baseMultiplier + state.upgrades.offlinePower * 0.05;
}

export function getPrestigeGain(state: GameState): number {
  if (state.tokens < economyConfig.prestige.unlockTokens) {
    return 0;
  }
  const earned = state.stats.lifetimeCoinsEarned;
  const value = Math.sqrt(earned / 3000) * economyConfig.prestige.baseScale;
  return Math.max(0, Math.floor(value * 100) / 100);
}

export function canBuyUpgrade(state: GameState, upgradeId: UpgradeId): boolean {
  const level = state.upgrades[upgradeId];
  const maxLevel = economyConfig.upgrades[upgradeId].maxLevel;
  if (level >= maxLevel) {
    return false;
  }
  return state.coins >= getUpgradeCost(upgradeId, level);
}
