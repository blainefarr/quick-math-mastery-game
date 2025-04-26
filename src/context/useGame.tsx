
import { useContext } from 'react';
import GameContext from './GameContext';
import { GameContextType } from './game-context-types';

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  // Check if the context is complete and has all required properties
  if (!('setGameState' in context) || 
      !('settings' in context) || 
      !('updateSettings' in context) || 
      !('incrementScore' in context) || 
      !('resetScore' in context) || 
      !('currentProblem' in context) || 
      !('generateNewProblem' in context) || 
      !('setTimeLeft' in context) || 
      !('userAnswer' in context) || 
      !('setUserAnswer' in context) || 
      !('saveScore' in context) || 
      !('setFocusNumber' in context) || 
      !('getIsHighScore' in context) ||
      !('endGame' in context)) {
    throw new Error('useGame must be used within a GameProvider with all required context properties');
  }
  
  // Type assertion since we've verified the context has all required properties
  return context as GameContextType;
};

export default useGame;
