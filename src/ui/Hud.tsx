import type { GameState } from "../game/core/types";

interface HudProps {
  state: GameState;
}

export function Hud({ state }: HudProps): JSX.Element {
  return (
    <section className="panel hud">
      <div>
        <h1>Coin Pusher Idle</h1>
        <p>Drop coins on the board or tap the board directly.</p>
      </div>
      <div className="stat-grid">
        <div>
          <span>Coins</span>
          <strong>{state.coins.toFixed(1)}</strong>
        </div>
        <div>
          <span>Tokens</span>
          <strong>{state.tokens.toFixed(1)}</strong>
        </div>
        <div>
          <span>Prestige Bonus</span>
          <strong>x{state.prestigeBonus.toFixed(2)}</strong>
        </div>
        <div>
          <span>Boost</span>
          <strong>{state.boostTimer > 0 ? `${state.boostTimer.toFixed(1)}s` : "Ready/Cooldown"}</strong>
        </div>
      </div>
    </section>
  );
}
