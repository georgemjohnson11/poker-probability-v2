"use client";

import { GAMES, type GameMode } from "../lib/games";

interface GameSelectorProps {
  selectedGame: GameMode;
  onGameChange: (game: GameMode) => void;
}

export default function GameSelector({ selectedGame, onGameChange }: GameSelectorProps) {
  const gameCategories = {
    "Poker Games": ["poker", "threecardpoker", "casinoholdem", "caribbeanstud"] as GameMode[],
    "Banking Games": ["blackjack", "baccarat", "reddog"] as GameMode[],
    "Simple Games": ["war", "highcard"] as GameMode[],
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-200">Select Game</h2>
      {Object.entries(gameCategories).map(([category, games]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm text-slate-400">{category}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {games.map((gameId) => {
              const game = GAMES[gameId];
              return (
                <button
                  key={gameId}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    selectedGame === gameId
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                  onClick={() => onGameChange(gameId)}
                  type="button"
                >
                  {game.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
