
import React from 'react';
import { GameContextType } from './game-context-types';

// Create the context with a default value only for non-critical properties
// This avoids TypeScript errors while maintaining runtime safety
const defaultValue: Partial<GameContextType> = {
  scoreHistory: [],
  gameState: 'selection',
  score: 0,
  timeLeft: 60
  // We don't include required function properties to ensure proper error handling
};

// The context can be either a complete GameContextType or a partial one
const GameContext = React.createContext<GameContextType | Partial<GameContextType>>(defaultValue);

export default GameContext;
