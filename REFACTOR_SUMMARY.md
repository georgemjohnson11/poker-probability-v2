# Card Game Odds Trainer - Modular Refactor

## Summary

Successfully implemented 7 new card games and refactored the codebase into a clean, modular architecture.

## New Games Implemented

1. **War** - Simple highest card wins
2. **High Card** - Each player draws one card, highest wins
3. **Red Dog (Acey Deucey)** - Bet if third card falls between first two
4. **Three Card Poker** - Best 3-card poker hand vs dealer
5. **Casino Hold'em** - Player vs dealer with community cards
6. **Baccarat** - Closest to 9 wins
7. **Caribbean Stud Poker** - 5-card poker vs dealer

## Architecture

### Core Files

**`app/lib/odds.ts`**
- All game logic and probability calculations
- Evaluation functions for different hand types (3-card, 5-card, 7-card)
- Simulation functions for each game
- Total: ~670 lines (added ~380 lines for new games)

**`app/lib/games.ts`** (NEW)
- Game type definitions and configurations
- Centralized game metadata (card counts, multiplayer support, etc.)
- GameState interface for unified state management

### Components

**`app/components/GameSelector.tsx`** (NEW)
- Organized game selection with categories
- Poker Games, Banking Games, Simple Games

**`app/components/PlayingCard.tsx`** (NEW)
- Reusable card component
- Handles both face-up and hidden cards

**`app/components/OddsPanel.tsx`** (NEW)
- Displays win probabilities
- Color-coded (green/red/yellow) based on odds

**`app/components/UnifiedGame.tsx`** (NEW)
- Single component handles ALL games
- Dynamically renders based on game type
- Calculates odds for each game
- ~370 lines

### Hooks

**`app/hooks/useGameState.ts`** (NEW)
- Custom hook for managing game state
- Handles dealing, revealing, and player toggles
- Works for all game types

### Main Page

**`app/page.tsx`**
- Reduced from ~440 lines to ~75 lines
- Clean, simple interface
- Game selector + player count + unified game component

## Benefits of This Architecture

1. **Extensibility** - Adding a new game requires:
   - Add simulation function to `odds.ts`
   - Add game config to `games.ts`
   - Add case to `UnifiedGame.tsx`
   - That's it! No need to modify page.tsx

2. **Maintainability** - Each component has a single responsibility

3. **Reusability** - Components like PlayingCard, OddsPanel can be used anywhere

4. **Type Safety** - Strong TypeScript types throughout

5. **DRY** - No code duplication between games

## Testing Recommendations

Test each game by:
1. Dealing cards
2. Verifying correct number of cards dealt
3. Testing reveal functionality
4. Checking odds calculations
5. Testing multiplayer (where applicable)

## Future Enhancements

- Add hand strength indicators
- Add optimal strategy recommendations
- Add game rules/help modals
- Add statistics tracking
- Add more games (Pai Gow, Let It Ride, Video Poker)
