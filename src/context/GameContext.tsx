
import React from 'react';
import { GameContextType } from './game-context-types';

const GameContext = React.createContext<GameContextType | undefined>(undefined);

export default GameContext;
