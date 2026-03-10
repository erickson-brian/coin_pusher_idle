import { economyConfig } from "../economy/config";
import {
  canBuyUpgrade,
  getAutoDropsPerSecond,
  getBoostMultiplier,
  getDropReward,
  getOfflineMultiplier,
  getPusherForceMultiplier,
  getPrestigeGain,
  getTokenChance,
  getUpgradeCost
} from "../economy/formulas";
import type { Action, CoinEntity, GameState, OfflineResult } from "./types";
import { initState } from "./state";

const FX_LIFETIME = 0.75;

function randomFromCoin(coin: CoinEntity): number {
  const seed = Math.sin(coin.id * 12.9898 + coin.x * 78.233) * 43758.5453;
  return seed - Math.floor(seed);
}

function spawnRewardFx(state: GameState, x: number, y: number, text: string, color: string): void {
  state.rewardPops.push({
    id: state.nextFxId++,
    x,
    y,
    text,
    life: FX_LIFETIME,
    color
  });

  for (let i = 0; i < 6; i += 1) {
    const theta = (Math.PI * 2 * i) / 6;
    const speed = 24 + i * 4;
    state.particles.push({
      id: state.nextFxId++,
      x,
      y,
      vx: Math.cos(theta) * speed,
      vy: Math.sin(theta) * speed,
      life: 0.5 + i * 0.05,
      color
    });
  }
}

function addCoinToBoard(state: GameState): boolean {
  if (state.coins < state.manualDropCost) {
    return false;
  }

  state.coins -= state.manualDropCost;
  state.stats.drops += 1;

  const coin: CoinEntity = {
    id: state.nextCoinId++,
    x: economyConfig.board.width * (0.35 + (state.nextCoinId % 28) / 100),
    y: 64,
    vx: 0,
    vy: 0,
    radius: 8,
    life: 40
  };
  state.coinsOnBoard.push(coin);
  return true;
}

function resolveCoinFall(state: GameState, coin: CoinEntity): void {
  const reward = getDropReward(state);
  state.coins += reward;
  state.stats.lifetimeCoinsEarned += reward;
  spawnRewardFx(state, coin.x, economyConfig.board.height - 12, `+${reward.toFixed(1)}c`, "#ffd166");

  const tokenRoll = randomFromCoin(coin);
  if (tokenRoll < getTokenChance(state)) {
    state.tokens += 1;
    state.stats.lifetimeTokensEarned += 1;
    spawnRewardFx(state, coin.x + 8, economyConfig.board.height - 24, "+1t", "#7bdff2");
  }
}

function runAutomation(state: GameState, dt: number): void {
  const rate = getAutoDropsPerSecond(state);
  if (rate <= 0) {
    return;
  }

  state.autoDropAccumulator += dt * rate * getBoostMultiplier(state);
  while (state.autoDropAccumulator >= 1) {
    state.autoDropAccumulator -= 1;
    const ok = addCoinToBoard(state);
    if (!ok) {
      break;
    }
  }
}

function stepBoard(state: GameState, dt: number): void {
  state.pusherPhase = (state.pusherPhase + dt * 1.5) % (Math.PI * 2);
  const pusherWave = Math.sin(state.pusherPhase) * 16;
  const pusherForce = 18 * getPusherForceMultiplier(state) * getBoostMultiplier(state);

  const survivors: CoinEntity[] = [];

  for (const coin of state.coinsOnBoard) {
    coin.vx += ((pusherWave > 0 ? 1 : -1) * pusherForce * dt) / 4;
    coin.vy += economyConfig.board.gravity * dt;

    coin.vx *= economyConfig.board.friction;
    coin.vy *= economyConfig.board.friction;

    coin.x += coin.vx * dt;
    coin.y += coin.vy * dt;

    coin.life -= dt;

    if (coin.x <= 20 || coin.x >= economyConfig.board.width - 20 || coin.y >= economyConfig.board.height - 4) {
      resolveCoinFall(state, coin);
      continue;
    }

    if (coin.y < economyConfig.board.height - 12 && coin.life > 0) {
      survivors.push(coin);
    }
  }

  state.coinsOnBoard = survivors;
}

function stepFx(state: GameState, dt: number): void {
  for (const pop of state.rewardPops) {
    pop.life -= dt;
    pop.y -= 20 * dt;
  }
  state.rewardPops = state.rewardPops.filter((pop) => pop.life > 0);

  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.96;
    particle.vy *= 0.96;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);
}

function clampState(state: GameState): void {
  if (!Number.isFinite(state.coins) || state.coins < 0) {
    state.coins = 0;
  }
  if (!Number.isFinite(state.tokens) || state.tokens < 0) {
    state.tokens = 0;
  }
}

export function applyAction(state: GameState, action: Action): { accepted: boolean; event?: string } {
  switch (action.type) {
    case "DROP_COIN": {
      const accepted = addCoinToBoard(state);
      return { accepted, event: accepted ? "drop" : undefined };
    }
    case "ACTIVATE_BOOST": {
      if (state.boostCooldown > 0 || state.boostTimer > 0) {
        return { accepted: false };
      }
      state.boostTimer = economyConfig.boost.durationSec;
      state.boostCooldown = economyConfig.boost.cooldownSec + state.boostTimer;
      return { accepted: true, event: "boost" };
    }
    case "BUY_UPGRADE": {
      if (!canBuyUpgrade(state, action.upgradeId)) {
        return { accepted: false };
      }
      const level = state.upgrades[action.upgradeId];
      const cost = getUpgradeCost(action.upgradeId, level);
      state.coins -= cost;
      state.upgrades[action.upgradeId] += 1;
      return { accepted: true, event: "buy" };
    }
    case "PRESTIGE": {
      const gain = getPrestigeGain(state);
      if (gain <= 0) {
        return { accepted: false };
      }
      const old = state;
      const reset = initState(state.nowMs);
      reset.audio.muted = old.audio.muted;
      reset.prestigeLevel = old.prestigeLevel + 1;
      reset.prestigeBonus = old.prestigeBonus + gain;
      reset.stats.prestiges = old.stats.prestiges + 1;
      reset.stats.lifetimeCoinsEarned = old.stats.lifetimeCoinsEarned;
      reset.stats.lifetimeTokensEarned = old.stats.lifetimeTokensEarned;

      Object.assign(state, reset);
      return { accepted: true, event: "prestige" };
    }
    case "TOGGLE_MUTE": {
      state.audio.muted = !state.audio.muted;
      return { accepted: true };
    }
    default:
      return { accepted: false };
  }
}

export function step(state: GameState, dt: number): void {
  state.nowMs += dt * 1000;

  if (state.boostTimer > 0) {
    state.boostTimer = Math.max(0, state.boostTimer - dt);
  }
  if (state.boostCooldown > 0) {
    state.boostCooldown = Math.max(0, state.boostCooldown - dt);
  }

  runAutomation(state, dt);
  stepBoard(state, dt);
  stepFx(state, dt);
  clampState(state);
}

export function applyOfflineProgress(state: GameState, elapsedMs: number): OfflineResult {
  const baseCapMs = (economyConfig.offline.baseCapHours + state.upgrades.offlinePower * 0.2) * 60 * 60 * 1000;
  const simulatedMs = Math.max(0, Math.min(elapsedMs, baseCapMs));
  const seconds = simulatedMs / 1000;

  const automationRate = getAutoDropsPerSecond(state);
  const estDrops = automationRate * seconds;
  const avgReward = getDropReward(state);
  const multiplier = getOfflineMultiplier(state);

  const earnedCoins = estDrops * avgReward * multiplier;
  const earnedTokens = estDrops * getTokenChance(state) * 0.2;

  state.coins += earnedCoins;
  state.tokens += earnedTokens;
  state.stats.lifetimeCoinsEarned += earnedCoins;
  state.stats.lifetimeTokensEarned += earnedTokens;

  clampState(state);

  return {
    elapsedMs,
    simulatedMs,
    earnedCoins,
    earnedTokens
  };
}
