"use client";

import { useMemo } from "react";
import { GAMES, type GameMode, type GameState } from "../lib/games";
import PlayingCard from "../components/PlayingCard";
import OddsPanel from "../components/OddsPanel";
import {
  simulatePokerMultiOdds,
  simulateBlackjackOdds,
  simulateWarOdds,
  simulateHighCardOdds,
  simulateRedDogOdds,
  simulateThreeCardPokerOdds,
  simulateCasinoHoldemOdds,
  simulateBaccaratOdds,
  simulateCaribbeanStudOdds,
  type Card,
  type Odds,
} from "../lib/odds";

interface UnifiedGameProps {
  gameType: GameMode;
  gameState: GameState;
  onDeal: () => void;
  onReveal: () => void;
  onTogglePlayer: (index: number) => void;
}

export default function UnifiedGame({
  gameType,
  gameState,
  onDeal,
  onReveal,
  onTogglePlayer,
}: UnifiedGameProps) {
  const game = GAMES[gameType];

  const getBlockedCards = (excludeIndex: number) =>
    gameState.playerCards.flatMap((hand, index) =>
      index === excludeIndex || !gameState.revealedPlayers?.[index] ? [] : hand
    );

  const getRevealedOpponents = () =>
    gameState.playerCards
      .slice(1)
      .filter((_, index) => gameState.revealedPlayers?.[index + 1]);

  const getKnownOpponents = (excludeIndex: number) =>
    gameState.playerCards
      .map((hand, index) => ({ hand, index }))
      .filter(({ index }) => index !== excludeIndex && gameState.revealedPlayers?.[index])
      .map(({ hand }) => hand);

  // Calculate odds based on game type
  const primaryOdds = useMemo((): Odds | null => {
    const firstPlayer = gameState.playerCards[0];
    if (!firstPlayer || firstPlayer.length === 0) return null;

    switch (gameType) {
      case "poker":
        if (firstPlayer.length !== 2 || !gameState.communityCards || gameState.communityCards.length !== 5)
          return null;
        return simulatePokerMultiOdds({
          hero: firstPlayer,
          knownBoard: gameState.communityCards.slice(0, gameState.revealedCommunityCount ?? 0),
          knownVillains: getKnownOpponents(0),
          opponentCount: Math.max(gameState.playerCards.length - 1, 1),
          blockedCards: getBlockedCards(0),
          iterations: 2200,
        });

      case "blackjack":
        if (firstPlayer.length !== 2 || gameState.dealerCards.length !== 2) return null;
        return simulateBlackjackOdds({
          player: firstPlayer,
          dealerUp: gameState.dealerCards[0],
          dealerHole: gameState.showDealerCards ? gameState.dealerCards[1] : undefined,
          blockedCards: getBlockedCards(0),
          iterations: 2200,
        });

      case "war":
        if (firstPlayer.length !== 1) return null;
        return simulateWarOdds({
          playerCard: firstPlayer[0],
          dealerCard: gameState.showDealerCards ? gameState.dealerCards[0] : undefined,
          blockedCards: getBlockedCards(0),
          iterations: 2200,
        });

      case "highcard":
        if (firstPlayer.length !== 1) return null;
        return simulateHighCardOdds({
          playerCards: firstPlayer,
          opponentCards: getRevealedOpponents(),
          numOpponents: Math.max(gameState.playerCards.length - 1, 1),
          blockedCards: getBlockedCards(0),
          iterations: 2200,
        });

      case "reddog":
        if (firstPlayer.length < 2) return null;
        return simulateRedDogOdds({
          card1: firstPlayer[0],
          card2: firstPlayer[1],
          card3: firstPlayer[2],
        });

      case "threecardpoker":
        if (firstPlayer.length !== 3) return null;
        return simulateThreeCardPokerOdds({
          player: firstPlayer,
          dealer: gameState.showDealerCards ? gameState.dealerCards : undefined,
          blockedCards: getBlockedCards(0),
          iterations: 2200,
        });

      case "casinoholdem":
        if (firstPlayer.length !== 2 || !gameState.communityCards || gameState.communityCards.length !== 5)
          return null;
        return simulateCasinoHoldemOdds({
          player: firstPlayer,
          dealer: gameState.showDealerCards ? gameState.dealerCards : undefined,
          knownBoard: gameState.communityCards.slice(0, gameState.revealedCommunityCount ?? 0),
          blockedCards: getBlockedCards(0),
          iterations: 2200,
        });

      case "baccarat":
        if (firstPlayer.length !== 2 || gameState.dealerCards.length !== 2) return null;
        return simulateBaccaratOdds({
          playerCards: firstPlayer,
          bankerCards: gameState.dealerCards,
          blockedCards: getBlockedCards(0),
          iterations: 2200,
        });

      case "caribbeanstud":
        if (firstPlayer.length !== 5) return null;
        return simulateCaribbeanStudOdds({
          player: firstPlayer,
          dealer: gameState.showDealerCards ? gameState.dealerCards : undefined,
          dealerUp: gameState.dealerCards[0],
          blockedCards: getBlockedCards(0),
          iterations: 2200,
        });

      default:
        return null;
    }
  }, [gameType, gameState]);

  // Calculate individual player odds
  const playerOdds = useMemo((): (Odds | null)[] => {
    return gameState.playerCards.map((playerHand, index) => {
      if (!playerHand || playerHand.length === 0) return null;

      switch (gameType) {
        case "poker":
          if (playerHand.length !== 2 || !gameState.communityCards || gameState.communityCards.length !== 5)
            return null;
          return simulatePokerMultiOdds({
            hero: playerHand,
            knownBoard: gameState.communityCards.slice(0, gameState.revealedCommunityCount ?? 0),
            knownVillains: getKnownOpponents(index),
            opponentCount: Math.max(gameState.playerCards.length - 1, 1),
            blockedCards: getBlockedCards(index),
            iterations: 2200,
          });

        case "blackjack":
          if (playerHand.length !== 2 || gameState.dealerCards.length !== 2) return null;
          return simulateBlackjackOdds({
            player: playerHand,
            dealerUp: gameState.dealerCards[0],
            dealerHole: gameState.showDealerCards ? gameState.dealerCards[1] : undefined,
            blockedCards: getBlockedCards(index),
            iterations: 2200,
          });

        case "war":
          if (playerHand.length !== 1) return null;
          return simulateWarOdds({
            playerCard: playerHand[0],
            dealerCard: gameState.showDealerCards ? gameState.dealerCards[0] : undefined,
            blockedCards: getBlockedCards(index),
            iterations: 2200,
          });

        case "threecardpoker":
          if (playerHand.length !== 3) return null;
          return simulateThreeCardPokerOdds({
            player: playerHand,
            dealer: gameState.showDealerCards ? gameState.dealerCards : undefined,
            blockedCards: getBlockedCards(index),
            iterations: 2200,
          });

        case "caribbeanstud":
          if (playerHand.length !== 5) return null;
          return simulateCaribbeanStudOdds({
            player: playerHand,
            dealer: gameState.showDealerCards ? gameState.dealerCards : undefined,
            blockedCards: getBlockedCards(index),
            iterations: 2200,
          });

        default:
          return null;
      }
    });
  }, [gameType, gameState]);

  const canReveal =
    gameState.playerCards.length > 0 &&
    (!gameState.revealedPlayers?.every((r) => r) || !gameState.showDealerCards);

  return (
    <section className="space-y-5 rounded-xl border border-slate-700 bg-slate-900/40 p-5">
      {/* Deal and Reveal Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
          onClick={onDeal}
          type="button"
        >
          Deal {game.name}
        </button>
        <button
          className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReveal}
          type="button"
          disabled={!canReveal}
        >
          Reveal Next
        </button>
      </div>

      {/* Odds Panel */}
      {primaryOdds && <OddsPanel odds={primaryOdds} villainLabel={game.dealerCardCount > 0 ? "Dealer" : "Opponent"} />}

      {/* Player Hands */}
      <div className="space-y-3">
        <p className="text-sm text-slate-300">
          {gameState.playerCards.length === 1 ? "Your hand" : "Player hands"}
        </p>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {gameState.playerCards.map((hand, index) => {
            const odds = playerOdds[index];
            const isRevealed = gameState.revealedPlayers?.[index];
            return (
              <div key={`player-${index}`} className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400">
                    {gameState.playerCards.length === 1 ? "You" : `Player ${index + 1}`}
                  </p>
                  {odds && (
                    <span
                      className={`text-xs font-semibold ${
                        odds.hero > odds.villain
                          ? "text-emerald-400"
                          : odds.hero < odds.villain
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      Win: {odds.hero.toFixed(1)}%
                    </span>
                  )}
                  {index > 0 && (
                    <button
                      className="text-xs px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50 ml-auto"
                      onClick={() => onTogglePlayer(index)}
                      disabled={hand.length === 0}
                      type="button"
                    >
                      {isRevealed ? "Hide" : "Reveal"}
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {hand.map((card, cardIndex) => (
                    <PlayingCard
                      key={`player-${index}-${cardIndex}`}
                      card={index === 0 || isRevealed ? card : undefined}
                      hidden={index > 0 && !isRevealed}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Cards */}
      {game.hasCommunityCards && gameState.communityCards && (
        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            Community Cards ({gameState.revealedCommunityCount}/{gameState.communityCards.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {gameState.communityCards.map((card, index) => (
              <PlayingCard
                key={`community-${index}`}
                card={card}
                hidden={index >= (gameState.revealedCommunityCount ?? 0)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dealer Hand */}
      {game.dealerCardCount > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-slate-300">Dealer hand</p>
          <div className="flex gap-2">
            {gameState.dealerCards.map((card, index) => (
              <PlayingCard
                key={`dealer-${index}`}
                card={card}
                hidden={index > 0 && !gameState.showDealerCards}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
