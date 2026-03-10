import { useGameEngine } from "./hooks/useGameEngine";
import { Controls } from "./ui/Controls";
import { GameCanvas } from "./ui/GameCanvas";
import { Hud } from "./ui/Hud";
import { OfflineSummary } from "./ui/OfflineSummary";
import { UpgradeShop } from "./ui/UpgradeShop";

export default function App(): JSX.Element {
  const { state, offlineResult, dispatch, clearLocalSave } = useGameEngine();

  return (
    <main className="layout">
      <section className="left-column">
        <Hud state={state} />
        <OfflineSummary result={offlineResult} />
        <div className="canvas-wrap">
          <GameCanvas state={state} dispatch={dispatch} />
        </div>
      </section>

      <section className="right-column">
        <Controls state={state} dispatch={dispatch} onClearLocalSave={clearLocalSave} />
        <UpgradeShop state={state} dispatch={dispatch} />
      </section>
    </main>
  );
}
