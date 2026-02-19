export type Suit = "♠" | "♥" | "♦" | "♣";

export type Card = {
  rank: number;
  suit: Suit;
};

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANK_LABEL: Record<number, string> = {
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
};

export const cardLabel = (card: Card) => `${RANK_LABEL[card.rank]}${card.suit}`;

export const buildDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 2; rank <= 14; rank += 1) {
      deck.push({ rank, suit });
    }
  }
  return deck;
};

export const shuffle = (cards: Card[]): Card[] => {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const sameCard = (a: Card, b: Card) => a.rank === b.rank && a.suit === b.suit;

const removeCards = (deck: Card[], blocked: Card[]): Card[] =>
  deck.filter((card) => !blocked.some((blockedCard) => sameCard(blockedCard, card)));

const drawCards = (deck: Card[], count: number): Card[] => {
  const drawn: Card[] = [];
  for (let i = 0; i < count; i += 1) {
    drawn.push(deck.pop() as Card);
  }
  return drawn;
};

const getStraightHigh = (ranks: number[]): number => {
  const unique = [...new Set(ranks)].sort((a, b) => b - a);
  if (unique.includes(14)) {
    unique.push(1);
  }
  for (let i = 0; i <= unique.length - 5; i += 1) {
    const window = unique.slice(i, i + 5);
    if (window[0] - window[4] === 4) {
      return window[0] === 1 ? 5 : window[0];
    }
  }
  return 0;
};

type HandValue = [number, ...number[]];

const compareHandValue = (a: HandValue, b: HandValue): number => {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) {
      return 1;
    }
    if (av < bv) {
      return -1;
    }
  }
  return 0;
};

const evaluateFive = (cards: Card[]): HandValue => {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const flush = cards.every((c) => c.suit === cards[0].suit);
  const straightHigh = getStraightHigh(ranks);

  const counts = new Map<number, number>();
  for (const rank of ranks) {
    counts.set(rank, (counts.get(rank) ?? 0) + 1);
  }

  const entries = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return b[0] - a[0];
  });

  if (flush && straightHigh > 0) {
    return [8, straightHigh];
  }

  if (entries[0][1] === 4) {
    const four = entries[0][0];
    const kicker = entries[1][0];
    return [7, four, kicker];
  }

  if (entries[0][1] === 3 && entries[1][1] === 2) {
    return [6, entries[0][0], entries[1][0]];
  }

  if (flush) {
    return [5, ...ranks];
  }

  if (straightHigh > 0) {
    return [4, straightHigh];
  }

  if (entries[0][1] === 3) {
    const trips = entries[0][0];
    const kickers = entries.slice(1).map(([rank]) => rank).sort((a, b) => b - a);
    return [3, trips, ...kickers];
  }

  if (entries[0][1] === 2 && entries[1][1] === 2) {
    const highPair = Math.max(entries[0][0], entries[1][0]);
    const lowPair = Math.min(entries[0][0], entries[1][0]);
    const kicker = entries.find(([, count]) => count === 1)?.[0] ?? 0;
    return [2, highPair, lowPair, kicker];
  }

  if (entries[0][1] === 2) {
    const pair = entries[0][0];
    const kickers = entries.slice(1).map(([rank]) => rank).sort((a, b) => b - a);
    return [1, pair, ...kickers];
  }

  return [0, ...ranks];
};

const combinationsOfFive = (cards: Card[]): Card[][] => {
  const combos: Card[][] = [];
  for (let a = 0; a < cards.length - 4; a += 1) {
    for (let b = a + 1; b < cards.length - 3; b += 1) {
      for (let c = b + 1; c < cards.length - 2; c += 1) {
        for (let d = c + 1; d < cards.length - 1; d += 1) {
          for (let e = d + 1; e < cards.length; e += 1) {
            combos.push([cards[a], cards[b], cards[c], cards[d], cards[e]]);
          }
        }
      }
    }
  }
  return combos;
};

const evaluateSeven = (cards: Card[]): HandValue => {
  const combos = combinationsOfFive(cards);
  let best = evaluateFive(combos[0]);
  for (let i = 1; i < combos.length; i += 1) {
    const current = evaluateFive(combos[i]);
    if (compareHandValue(current, best) > 0) {
      best = current;
    }
  }
  return best;
};

export type Odds = {
  hero: number;
  villain: number;
  tie: number;
};

export const simulatePokerOdds = (args: {
  hero: Card[];
  knownBoard: Card[];
  knownVillain?: Card[];
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const { hero, knownBoard, knownVillain, blockedCards, iterations = 2500 } = args;
  let heroWins = 0;
  let villainWins = 0;
  let ties = 0;

  const knownCards = [...hero, ...knownBoard, ...(knownVillain ?? []), ...(blockedCards ?? [])];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    const villain = knownVillain ? [...knownVillain] : drawCards(deck, 2);
    const board = [...knownBoard, ...drawCards(deck, 5 - knownBoard.length)];

    const heroValue = evaluateSeven([...hero, ...board]);
    const villainValue = evaluateSeven([...villain, ...board]);
    const result = compareHandValue(heroValue, villainValue);

    if (result > 0) {
      heroWins += 1;
    } else if (result < 0) {
      villainWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (heroWins / iterations) * 100,
    villain: (villainWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};

export const simulatePokerMultiOdds = (args: {
  hero: Card[];
  knownBoard: Card[];
  knownVillains?: Card[][];
  opponentCount?: number;
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const {
    hero,
    knownBoard,
    knownVillains = [],
    opponentCount = Math.max(knownVillains.length, 1),
    blockedCards,
    iterations = 2500,
  } = args;
  let heroWins = 0;
  let villainWins = 0;
  let ties = 0;

  const knownCards = [
    ...hero,
    ...knownBoard,
    ...knownVillains.flat(),
    ...(blockedCards ?? []),
  ];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    const villains: Card[][] = knownVillains.map((hand) => [...hand]);
    while (villains.length < opponentCount) {
      villains.push(drawCards(deck, 2));
    }

    const board = [...knownBoard, ...drawCards(deck, 5 - knownBoard.length)];
    const heroValue = evaluateSeven([...hero, ...board]);
    let bestVillain = evaluateSeven([...villains[0], ...board]);

    for (let v = 1; v < villains.length; v += 1) {
      const villainValue = evaluateSeven([...villains[v], ...board]);
      if (compareHandValue(villainValue, bestVillain) > 0) {
        bestVillain = villainValue;
      }
    }

    const result = compareHandValue(heroValue, bestVillain);
    if (result > 0) {
      heroWins += 1;
    } else if (result < 0) {
      villainWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (heroWins / iterations) * 100,
    villain: (villainWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};

const blackjackValue = (cards: Card[]): number => {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.rank >= 11 && card.rank <= 13) {
      total += 10;
    } else if (card.rank === 14) {
      total += 11;
      aces += 1;
    } else {
      total += card.rank;
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
};

export const simulateBlackjackOdds = (args: {
  player: Card[];
  dealerUp: Card;
  dealerHole?: Card;
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const { player, dealerUp, dealerHole, blockedCards, iterations = 2500 } = args;
  const playerScore = blackjackValue(player);

  let playerWins = 0;
  let dealerWins = 0;
  let ties = 0;

  const knownCards = [...player, dealerUp, ...(dealerHole ? [dealerHole] : []), ...(blockedCards ?? [])];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    const hole = dealerHole ?? drawCards(deck, 1)[0];
    const dealerCards = [dealerUp, hole];

    while (blackjackValue(dealerCards) < 17) {
      dealerCards.push(drawCards(deck, 1)[0]);
    }

    const dealerScore = blackjackValue(dealerCards);

    if (playerScore > 21) {
      dealerWins += 1;
      continue;
    }

    if (dealerScore > 21 || playerScore > dealerScore) {
      playerWins += 1;
    } else if (playerScore < dealerScore) {
      dealerWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (playerWins / iterations) * 100,
    villain: (dealerWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};

// ==================== THREE CARD POKER ====================

const getStraightHighThree = (ranks: number[]): number => {
  const unique = [...new Set(ranks)].sort((a, b) => b - a);
  if (unique.length !== 3) {
    return 0;
  }
  if (unique[0] === 14 && unique[1] === 3 && unique[2] === 2) {
    return 3;
  }
  return unique[0] - unique[2] === 2 ? unique[0] : 0;
};

const evaluateThree = (cards: Card[]): HandValue => {
  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const flush = cards.every((c) => c.suit === cards[0].suit);
  const straightHigh = getStraightHighThree(ranks);

  const counts = new Map<number, number>();
  for (const rank of ranks) {
    counts.set(rank, (counts.get(rank) ?? 0) + 1);
  }

  const entries = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  // Straight flush
  if (flush && straightHigh > 0) {
    return [8, straightHigh];
  }

  // Three of a kind
  if (entries[0][1] === 3) {
    return [7, entries[0][0]];
  }

  // Straight
  if (straightHigh > 0) {
    return [4, straightHigh];
  }

  // Flush
  if (flush) {
    return [5, ...ranks];
  }

  // Pair
  if (entries[0][1] === 2) {
    const pair = entries[0][0];
    const kicker = entries[1][0];
    return [1, pair, kicker];
  }

  // High card
  return [0, ...ranks];
};

export const simulateThreeCardPokerOdds = (args: {
  player: Card[];
  dealer?: Card[];
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const { player, dealer, blockedCards, iterations = 2500 } = args;
  let playerWins = 0;
  let dealerWins = 0;
  let ties = 0;

  const knownCards = [...player, ...(dealer ?? []), ...(blockedCards ?? [])];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    const dealerHand = dealer ? [...dealer] : drawCards(deck, 3);

    const playerValue = evaluateThree(player);
    const dealerValue = evaluateThree(dealerHand);
    const result = compareHandValue(playerValue, dealerValue);

    // Dealer needs Q-high or better to qualify
    const dealerQualifies = dealerValue[0] > 0 || dealerValue[1] >= 12;

    if (!dealerQualifies) {
      playerWins += 1;
    } else if (result > 0) {
      playerWins += 1;
    } else if (result < 0) {
      dealerWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (playerWins / iterations) * 100,
    villain: (dealerWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};

// ==================== WAR ====================

export const simulateWarOdds = (args: {
  playerCard: Card;
  dealerCard?: Card;
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const { playerCard, dealerCard, blockedCards, iterations = 2500 } = args;
  let playerWins = 0;
  let dealerWins = 0;
  let ties = 0;

  const knownCards = [playerCard, ...(dealerCard ? [dealerCard] : []), ...(blockedCards ?? [])];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    const opponentCard = dealerCard ?? drawCards(deck, 1)[0];

    if (playerCard.rank > opponentCard.rank) {
      playerWins += 1;
    } else if (playerCard.rank < opponentCard.rank) {
      dealerWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (playerWins / iterations) * 100,
    villain: (dealerWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};

// ==================== HIGH CARD ====================

export const simulateHighCardOdds = (args: {
  playerCards: Card[];
  opponentCards?: Card[][];
  numOpponents?: number;
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const { playerCards, opponentCards, numOpponents = 1, blockedCards, iterations = 2500 } = args;
  let playerWins = 0;
  let opponentWins = 0;
  let ties = 0;

  const knownCards = [...playerCards, ...(opponentCards?.flat() ?? []), ...(blockedCards ?? [])];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    
    const opponents = opponentCards ? opponentCards.map((hand) => [...hand]) : [];
    while (opponents.length < numOpponents) {
      opponents.push(drawCards(deck, 1));
    }

    const playerHigh = Math.max(...playerCards.map(c => c.rank));
    const opponentHighs = opponents.map(opp => Math.max(...opp.map(c => c.rank)));
    const maxOpponentHigh = Math.max(...opponentHighs);

    if (playerHigh > maxOpponentHigh) {
      playerWins += 1;
    } else if (playerHigh < maxOpponentHigh) {
      opponentWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (playerWins / iterations) * 100,
    villain: (opponentWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};

// ==================== RED DOG (ACEY DEUCEY) ====================

export const simulateRedDogOdds = (args: {
  card1: Card;
  card2: Card;
  card3?: Card;
}): Odds => {
  const { card1, card2, card3 } = args;
  const [low, high] = [card1.rank, card2.rank].sort((a, b) => a - b);
  
  // If cards are consecutive or same, player loses
  if (high - low <= 1) {
    return { hero: 0, villain: 100, tie: 0 };
  }

  const spreadCount = high - low - 1;
  const knownCards = [card1, card2, ...(card3 ? [card3] : [])];
  
  if (card3) {
    // Card is already revealed
    const isWin = card3.rank > low && card3.rank < high;
    return {
      hero: isWin ? 100 : 0,
      villain: isWin ? 0 : 100,
      tie: 0,
    };
  }

  // Calculate odds
  const deck = removeCards(buildDeck(), knownCards);
  const winningCards = deck.filter(c => c.rank > low && c.rank < high).length;
  const totalCards = deck.length;

  return {
    hero: (winningCards / totalCards) * 100,
    villain: ((totalCards - winningCards) / totalCards) * 100,
    tie: 0,
  };
};

// ==================== CASINO HOLD'EM ====================

export const simulateCasinoHoldemOdds = (args: {
  player: Card[];
  dealer?: Card[];
  board?: Card[];
  knownBoard?: Card[];
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const { player, dealer, board, knownBoard = [], blockedCards, iterations = 2500 } = args;
  let playerWins = 0;
  let dealerWins = 0;
  let ties = 0;

  const knownCards = [...player, ...(dealer ?? []), ...knownBoard, ...(board ?? []), ...(blockedCards ?? [])];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    const dealerHand = dealer ? [...dealer] : drawCards(deck, 2);
    const fullBoard = board ?? [...knownBoard, ...drawCards(deck, 5 - knownBoard.length)];

    const playerValue = evaluateSeven([...player, ...fullBoard]);
    const dealerValue = evaluateSeven([...dealerHand, ...fullBoard]);
    const result = compareHandValue(playerValue, dealerValue);

    // Dealer needs pair of 4s or better to qualify
    const dealerQualifies = dealerValue[0] > 0 && (dealerValue[0] > 1 || dealerValue[1] >= 4);

    if (!dealerQualifies) {
      playerWins += 1;
    } else if (result > 0) {
      playerWins += 1;
    } else if (result < 0) {
      dealerWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (playerWins / iterations) * 100,
    villain: (dealerWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};

// ==================== BACCARAT ====================

const baccaratValue = (cards: Card[]): number => {
  let total = 0;
  for (const card of cards) {
    if (card.rank >= 10) {
      total += 0;
    } else {
      total += card.rank === 14 ? 1 : card.rank;
    }
  }
  return total % 10;
};

export const simulateBaccaratOdds = (args: {
  playerCards: Card[];
  bankerCards: Card[];
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const { playerCards, bankerCards, blockedCards, iterations = 2500 } = args;
  let playerWins = 0;
  let bankerWins = 0;
  let ties = 0;

  const knownCards = [...playerCards, ...bankerCards, ...(blockedCards ?? [])];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    const player = [...playerCards];
    const banker = [...bankerCards];

    let playerScore = baccaratValue(player);
    let bankerScore = baccaratValue(banker);

    // Natural win
    if (playerScore >= 8 || bankerScore >= 8) {
      if (playerScore > bankerScore) playerWins += 1;
      else if (bankerScore > playerScore) bankerWins += 1;
      else ties += 1;
      continue;
    }

    // Player draws third card if 0-5
    let playerThird: Card | undefined;
    if (playerScore <= 5) {
      playerThird = drawCards(deck, 1)[0];
      player.push(playerThird);
      playerScore = baccaratValue(player);
    }

    // Banker drawing rules
    if (!playerThird && bankerScore <= 5) {
      banker.push(drawCards(deck, 1)[0]);
      bankerScore = baccaratValue(banker);
    } else if (playerThird) {
      const thirdValue = playerThird.rank === 14 ? 1 : playerThird.rank >= 10 ? 0 : playerThird.rank;
      const shouldDraw =
        (bankerScore <= 2) ||
        (bankerScore === 3 && thirdValue !== 8) ||
        (bankerScore === 4 && thirdValue >= 2 && thirdValue <= 7) ||
        (bankerScore === 5 && thirdValue >= 4 && thirdValue <= 7) ||
        (bankerScore === 6 && thirdValue >= 6 && thirdValue <= 7);
      
      if (shouldDraw) {
        banker.push(drawCards(deck, 1)[0]);
        bankerScore = baccaratValue(banker);
      }
    }

    if (playerScore > bankerScore) {
      playerWins += 1;
    } else if (bankerScore > playerScore) {
      bankerWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (playerWins / iterations) * 100,
    villain: (bankerWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};

// ==================== CARIBBEAN STUD POKER ====================

export const simulateCaribbeanStudOdds = (args: {
  player: Card[];
  dealer?: Card[];
  dealerUp?: Card;
  blockedCards?: Card[];
  iterations?: number;
}): Odds => {
  const { player, dealer, dealerUp, blockedCards, iterations = 2500 } = args;
  let playerWins = 0;
  let dealerWins = 0;
  let ties = 0;

  const knownCards = [...player, ...(dealer ?? []), ...(dealerUp ? [dealerUp] : []), ...(blockedCards ?? [])];

  for (let i = 0; i < iterations; i += 1) {
    const deck = shuffle(removeCards(buildDeck(), knownCards));
    const dealerHand = dealer ? [...dealer] : drawCards(deck, 5);

    const playerValue = evaluateFive(player);
    const dealerValue = evaluateFive(dealerHand);
    const result = compareHandValue(playerValue, dealerValue);

    // Dealer needs AK or better to qualify
    const dealerQualifies = dealerValue[0] > 0 || 
      (dealerValue[1] === 14 && dealerValue[2] >= 13);

    if (!dealerQualifies) {
      playerWins += 1;
    } else if (result > 0) {
      playerWins += 1;
    } else if (result < 0) {
      dealerWins += 1;
    } else {
      ties += 1;
    }
  }

  return {
    hero: (playerWins / iterations) * 100,
    villain: (dealerWins / iterations) * 100,
    tie: (ties / iterations) * 100,
  };
};
