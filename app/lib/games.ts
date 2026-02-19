import type { Card } from "./odds";

export type GameMode = 
  | "poker" 
  | "blackjack" 
  | "war" 
  | "highcard" 
  | "reddog" 
  | "threecardpoker" 
  | "casinoholdem" 
  | "baccarat" 
  | "caribbeanstud";

export interface GameConfig {
  id: GameMode;
  name: string;
  description: string;
  supportsMultiplayer: boolean;
  playerCardCount: number;
  dealerCardCount: number;
  hasCommunityCards: boolean;
  communityCardCount?: number;
}

export const GAMES: Record<GameMode, GameConfig> = {
  poker: {
    id: "poker",
    name: "Texas Hold'em",
    description: "2 cards + 5 community cards",
    supportsMultiplayer: true,
    playerCardCount: 2,
    dealerCardCount: 0,
    hasCommunityCards: true,
    communityCardCount: 5,
  },
  blackjack: {
    id: "blackjack",
    name: "Blackjack",
    description: "Get as close to 21 as possible",
    supportsMultiplayer: true,
    playerCardCount: 2,
    dealerCardCount: 2,
    hasCommunityCards: false,
  },
  war: {
    id: "war",
    name: "War",
    description: "Highest card wins",
    supportsMultiplayer: true,
    playerCardCount: 1,
    dealerCardCount: 1,
    hasCommunityCards: false,
  },
  highcard: {
    id: "highcard",
    name: "High Card",
    description: "Draw one card, highest wins",
    supportsMultiplayer: true,
    playerCardCount: 1,
    dealerCardCount: 0,
    hasCommunityCards: false,
  },
  reddog: {
    id: "reddog",
    name: "Red Dog (Acey Deucey)",
    description: "Bet if 3rd card falls between first two",
    supportsMultiplayer: false,
    playerCardCount: 3,
    dealerCardCount: 0,
    hasCommunityCards: false,
  },
  threecardpoker: {
    id: "threecardpoker",
    name: "Three Card Poker",
    description: "Best 3-card poker hand wins",
    supportsMultiplayer: true,
    playerCardCount: 3,
    dealerCardCount: 3,
    hasCommunityCards: false,
  },
  casinoholdem: {
    id: "casinoholdem",
    name: "Casino Hold'em",
    description: "Player vs dealer with community cards",
    supportsMultiplayer: false,
    playerCardCount: 2,
    dealerCardCount: 2,
    hasCommunityCards: true,
    communityCardCount: 5,
  },
  baccarat: {
    id: "baccarat",
    name: "Baccarat",
    description: "Closest to 9 wins",
    supportsMultiplayer: false,
    playerCardCount: 2,
    dealerCardCount: 2,
    hasCommunityCards: false,
  },
  caribbeanstud: {
    id: "caribbeanstud",
    name: "Caribbean Stud Poker",
    description: "5-card poker vs dealer",
    supportsMultiplayer: true,
    playerCardCount: 5,
    dealerCardCount: 5,
    hasCommunityCards: false,
  },
};

export interface GameState {
  playerCards: Card[][];
  dealerCards: Card[];
  communityCards?: Card[];
  revealedCommunityCount?: number;
  revealedPlayers?: boolean[];
  showDealerCards?: boolean;
}
