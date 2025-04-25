
import React from 'react';
import { GameContextType } from './game-context-types';

// Create the context with a more complete default value
const defaultValue: Partial<GameContextType> = {
  scoreHistory: [],
  gameState: 'selection',
  score: 0,
  timeLeft: 60
};

const GameContext = React.createContext<GameContextType | Partial<GameContextType>>(defaultValue);

export default GameContext;
