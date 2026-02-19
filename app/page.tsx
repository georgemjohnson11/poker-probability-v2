"use client";

import { useState } from "react";
import { GAMES, type GameMode } from "./lib/games";
import { useGameState } from "./hooks/useGameState";
import GameSelector from "./components/GameSelector";
import UnifiedGame from "./components/UnifiedGame";

export default function Home() {
  const [gameType, setGameType] = useState<GameMode>("poker");
  const [numPlayers, setNumPlayers] = useState(2);
  const [showInfo, setShowInfo] = useState(false);

  const game = GAMES[gameType];
  const { gameState, dealCards, revealNext, togglePlayerReveal } = useGameState(gameType, numPlayers);

  const handleGameChange = (newGame: GameMode) => {
    setGameType(newGame);
    if (!GAMES[newGame].supportsMultiplayer) {
      setNumPlayers(1);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Card Game Odds Trainer</h1>
            <p className="text-sm text-slate-300">
              Learn probability by playing {Object.keys(GAMES).length} different card games
            </p>
            <button
              className="mt-2 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
              onClick={() => setShowInfo(true)}
              type="button"
            >
              View assumptions and rules
            </button>
          </div>

          <GameSelector selectedGame={gameType} onGameChange={handleGameChange} />

          {game.supportsMultiplayer && (
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Number of players:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    className={`rounded px-3 py-1 text-sm font-semibold ${
                      numPlayers === num
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                    onClick={() => setNumPlayers(num)}
                    type="button"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-slate-800/50 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">{game.name}</h3>
            <p className="text-sm text-slate-400">{game.description}</p>
          </div>
        </header>

        <UnifiedGame
          gameType={gameType}
          gameState={gameState}
          onDeal={dealCards}
          onReveal={revealNext}
          onTogglePlayer={togglePlayerReveal}
        />
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">Assumptions & Rules</h2>
              <button
                className="rounded px-2 py-1 text-sm text-slate-300 hover:text-white"
                onClick={() => setShowInfo(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>
                Odds are estimated with Monte Carlo simulation (2,200 iterations) and will vary slightly
                between runs.
              </p>
              <p>
                Probabilities are conditioned only on revealed cards. Hidden opponent and dealer cards are
                treated as unknown.
              </p>
              <p>
                Multiplayer poker odds are computed against all opponents (multiway equity).
              </p>
              <p>
                Three Card Poker dealer qualifies with Q-high or better. Casino Hold'em dealer qualifies with
                pair of 4s or better. Caribbean Stud dealer qualifies with A-K or better.
              </p>
              <p>
                Red Dog assumes consecutive or paired ranks are a loss (no push handling). High Card uses the
                highest single card only.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

