import { useState, useCallback } from "react";
import { buildDeck, shuffle, type Card } from "../lib/odds";
import { GAMES, type GameMode, type GameState } from "../lib/games";

export function useGameState(gameType: GameMode, numPlayers: number) {
  const [gameState, setGameState] = useState<GameState>({
    playerCards: [],
    dealerCards: [],
    communityCards: [],
    revealedCommunityCount: 0,
    revealedPlayers: [],
    showDealerCards: false,
  });

  const dealCards = useCallback(() => {
    const deck = shuffle(buildDeck());
    const game = GAMES[gameType];
    
    const playerCards: Card[][] = [];
    for (let i = 0; i < numPlayers; i++) {
      const hand: Card[] = [];
      for (let j = 0; j < game.playerCardCount; j++) {
        hand.push(deck.pop() as Card);
      }
      playerCards.push(hand);
    }

    const dealerCards: Card[] = [];
    for (let i = 0; i < game.dealerCardCount; i++) {
      dealerCards.push(deck.pop() as Card);
    }

    const communityCards: Card[] = [];
    if (game.hasCommunityCards && game.communityCardCount) {
      for (let i = 0; i < game.communityCardCount; i++) {
        communityCards.push(deck.pop() as Card);
      }
    }

    setGameState({
      playerCards,
      dealerCards,
      communityCards: game.hasCommunityCards ? communityCards : undefined,
      revealedCommunityCount: 0,
      revealedPlayers: new Array(numPlayers).fill(false),
      showDealerCards: false,
    });
  }, [gameType, numPlayers]);

  const revealNext = useCallback(() => {
    setGameState((prev) => {
      const game = GAMES[gameType];
      
      // If has community cards, reveal them first
      if (
        game.hasCommunityCards &&
        prev.communityCards &&
        (prev.revealedCommunityCount ?? 0) < prev.communityCards.length
      ) {
        return {
          ...prev,
          revealedCommunityCount: (prev.revealedCommunityCount ?? 0) + 1,
        };
      }

      // Then reveal all players
      const allRevealed = prev.revealedPlayers?.every((r) => r);
      if (!allRevealed) {
        return {
          ...prev,
          revealedPlayers: new Array(prev.playerCards.length).fill(true),
        };
      }

      // Finally reveal dealer
      return {
        ...prev,
        showDealerCards: true,
      };
    });
  }, [gameType]);

  const togglePlayerReveal = useCallback((index: number) => {
    setGameState((prev) => ({
      ...prev,
      revealedPlayers: prev.revealedPlayers?.map((r, i) => (i === index ? !r : r)) ?? [],
    }));
  }, []);

  const revealDealer = useCallback(() => {
    setGameState((prev) => ({ ...prev, showDealerCards: true }));
  }, []);

  return {
    gameState,
    dealCards,
    revealNext,
    togglePlayerReveal,
    revealDealer,
  };
}
