import { economyConfig } from "../game/economy/config";
import { canBuyUpgrade, getUpgradeCost, UPGRADE_IDS } from "../game/economy/formulas";
import type { Action, GameState, UpgradeId } from "../game/core/types";

interface UpgradeShopProps {
  state: GameState;
  dispatch: (action: Action) => void;
}

function upgradeLabel(upgradeId: UpgradeId): string {
  return economyConfig.upgrades[upgradeId].label;
}

export function UpgradeShop({ state, dispatch }: UpgradeShopProps): JSX.Element {
  return (
    <section className="panel upgrades">
      <h2>Upgrades</h2>
      <ul>
        {UPGRADE_IDS.map((upgradeId) => {
          const level = state.upgrades[upgradeId];
          const cost = getUpgradeCost(upgradeId, level);
          const enabled = canBuyUpgrade(state, upgradeId);
          const desc = economyConfig.upgrades[upgradeId].description;

          return (
            <li key={upgradeId}>
              <div>
                <strong>{upgradeLabel(upgradeId)}</strong>
                <span>{desc}</span>
                <em>Lvl {level}</em>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "BUY_UPGRADE", upgradeId })}
                disabled={!enabled}
              >
                Buy ({cost})
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
