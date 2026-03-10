import type { UpgradeId } from "../core/types";

export interface UpgradeDefinition {
  id: UpgradeId;
  label: string;
  description: string;
  baseCostCoins: number;
  growth: number;
  maxLevel: number;
}

export interface EconomyConfig {
  board: {
    width: number;
    height: number;
    gravity: number;
    friction: number;
    edgePayoutChance: number;
  };
  boost: {
    durationSec: number;
    cooldownSec: number;
    multiplier: number;
  };
  prestige: {
    unlockTokens: number;
    baseScale: number;
  };
  offline: {
    baseCapHours: number;
    baseMultiplier: number;
  };
  upgrades: Record<UpgradeId, UpgradeDefinition>;
}

export const economyConfig: EconomyConfig = {
  board: {
    width: 920,
    height: 560,
    gravity: 240,
    friction: 0.985,
    edgePayoutChance: 0.1
  },
  boost: {
    durationSec: 14,
    cooldownSec: 60,
    multiplier: 2
  },
  prestige: {
    unlockTokens: 25,
    baseScale: 0.12
  },
  offline: {
    baseCapHours: 8,
    baseMultiplier: 1
  },
  upgrades: {
    dropValue: {
      id: "dropValue",
      label: "Drop Value",
      description: "Increase coin reward from each successful push.",
      baseCostCoins: 15,
      growth: 1.17,
      maxLevel: 120
    },
    autoDropRate: {
      id: "autoDropRate",
      label: "Auto Drop",
      description: "Automatically drops coins over time.",
      baseCostCoins: 40,
      growth: 1.2,
      maxLevel: 80
    },
    pusherForce: {
      id: "pusherForce",
      label: "Pusher Force",
      description: "Moves coins faster toward payout edges.",
      baseCostCoins: 60,
      growth: 1.21,
      maxLevel: 100
    },
    tokenChance: {
      id: "tokenChance",
      label: "Token Chance",
      description: "Improves chance to gain rare tokens.",
      baseCostCoins: 90,
      growth: 1.24,
      maxLevel: 80
    },
    offlinePower: {
      id: "offlinePower",
      label: "Offline Power",
      description: "Increase offline cap and offline earnings multiplier.",
      baseCostCoins: 120,
      growth: 1.28,
      maxLevel: 60
    }
  }
};
