import { getPrestigeGain } from "../game/economy/formulas";
import type { Action, GameState } from "../game/core/types";

interface ControlsProps {
  state: GameState;
  dispatch: (action: Action) => void;
}

export function Controls({ state, dispatch }: ControlsProps): JSX.Element {
  const prestigeGain = getPrestigeGain(state);
  const boostReady = state.boostCooldown <= 0 && state.boostTimer <= 0;

  return (
    <section className="panel controls">
      <h2>Actions</h2>
      <div className="action-grid">
        <button type="button" onClick={() => dispatch({ type: "DROP_COIN" })} disabled={state.coins < state.manualDropCost}>
          Drop Coin ({state.manualDropCost})
        </button>
        <button type="button" onClick={() => dispatch({ type: "ACTIVATE_BOOST" })} disabled={!boostReady}>
          {boostReady ? "Activate Boost" : `Cooldown ${state.boostCooldown.toFixed(1)}s`}
        </button>
        <button type="button" onClick={() => dispatch({ type: "TOGGLE_MUTE" })}>
          {state.audio.muted ? "Unmute SFX" : "Mute SFX"}
        </button>
        <button type="button" onClick={() => dispatch({ type: "PRESTIGE" })} disabled={prestigeGain <= 0}>
          {prestigeGain > 0 ? `Prestige (+${prestigeGain.toFixed(2)}x)` : "Prestige Locked"}
        </button>
      </div>
    </section>
  );
}
