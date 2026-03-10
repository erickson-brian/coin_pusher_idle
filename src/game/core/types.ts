export type UpgradeId =
  | "dropValue"
  | "autoDropRate"
  | "pusherForce"
  | "tokenChance"
  | "offlinePower";

export interface CoinEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
}

export interface RewardPop {
  id: number;
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export interface AudioState {
  muted: boolean;
}

export interface Stats {
  lifetimeCoinsEarned: number;
  lifetimeTokensEarned: number;
  drops: number;
  prestiges: number;
}

export interface GameState {
  saveVersion: number;
  nowMs: number;
  lastSavedAtMs: number;
  coins: number;
  tokens: number;
  prestigeLevel: number;
  prestigeBonus: number;
  pusherPhase: number;
  boostTimer: number;
  boostCooldown: number;
  autoDropAccumulator: number;
  manualDropCost: number;
  nextCoinId: number;
  nextFxId: number;
  upgrades: Record<UpgradeId, number>;
  coinsOnBoard: CoinEntity[];
  rewardPops: RewardPop[];
  particles: Particle[];
  stats: Stats;
  audio: AudioState;
}

export interface OfflineResult {
  elapsedMs: number;
  simulatedMs: number;
  earnedCoins: number;
  earnedTokens: number;
}

export type Action =
  | { type: "DROP_COIN" }
  | { type: "ACTIVATE_BOOST" }
  | { type: "BUY_UPGRADE"; upgradeId: UpgradeId }
  | { type: "PRESTIGE" }
  | { type: "TOGGLE_MUTE" };
