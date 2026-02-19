"use client";

import type { Odds } from "../lib/odds";

interface OddsPanelProps {
  odds: Odds;
  villainLabel?: string;
}

export default function OddsPanel({ odds, villainLabel = "Dealer" }: OddsPanelProps) {
  const playerColor =
    odds.hero > odds.villain
      ? "text-emerald-400"
      : odds.hero < odds.villain
      ? "text-red-400"
      : "text-yellow-400";
  const villainColor =
    odds.villain > odds.hero
      ? "text-emerald-400"
      : odds.villain < odds.hero
      ? "text-red-400"
      : "text-yellow-400";

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-300">Win probability</p>
      <div className="mt-2 grid gap-1 text-sm">
        <p className={playerColor}>Player: {odds.hero.toFixed(1)}%</p>
        <p className={villainColor}>
          {villainLabel}: {odds.villain.toFixed(1)}%
        </p>
        <p className="text-slate-400">Tie / Push: {odds.tie.toFixed(1)}%</p>
      </div>
    </div>
  );
}
