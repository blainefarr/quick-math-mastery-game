
import { useContext } from 'react';
import GameContext from './GameContext';
import { GameContextType } from './game-context-types';

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default useGame;
