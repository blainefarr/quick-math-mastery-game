
import { useState } from 'react';
import { GameSettings, Operation, ProblemRange } from '@/types';

const defaultSettings: GameSettings = {
  operation: 'addition',
  range: { min1: 1, max1: 10, min2: 1, max2: 10 },
  timerSeconds: 60,
  allowNegatives: false,
  focusNumber: null
};

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return { settings, updateSettings, resetSettings };
};
