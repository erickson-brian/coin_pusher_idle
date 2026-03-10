import type { OfflineResult } from "../game/core/types";

interface OfflineSummaryProps {
  result?: OfflineResult;
}

export function OfflineSummary({ result }: OfflineSummaryProps): JSX.Element | null {
  if (!result || result.simulatedMs <= 1000) {
    return null;
  }

  const mins = result.simulatedMs / 60000;
  return (
    <aside className="offline-summary" role="status">
      <strong>Welcome back</strong>
      <span>
        Simulated {mins.toFixed(1)} min offline: +{result.earnedCoins.toFixed(1)} coins, +{result.earnedTokens.toFixed(1)}
        tokens
      </span>
    </aside>
  );
}
