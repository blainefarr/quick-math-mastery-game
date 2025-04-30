
import { useState, useEffect } from 'react';
import { GameSettings, Operation, ProblemRange } from '@/types';

const defaultSettings: GameSettings = {
  operation: 'addition',
  range: { min1: 1, max1: 10, min2: 1, max2: 10 },
  timerSeconds: 60,
  allowNegatives: false,
  focusNumber: null,
  learnerMode: false
};

export const useGameSettings = () => {
  const [settings, setSettings] = useState<GameSettings>(() => {
    // Try to load learner mode from localStorage
    const savedLearnerMode = localStorage.getItem('learnerModeEnabled');
    if (savedLearnerMode !== null) {
      return {
        ...defaultSettings,
        learnerMode: JSON.parse(savedLearnerMode)
      };
    }
    return defaultSettings;
  });

  // Save learner mode setting to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('learnerModeEnabled', JSON.stringify(settings.learnerMode));
  }, [settings.learnerMode]);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      // Create a deep copy of the previous settings to avoid partial updates
      const updatedSettings = { 
        ...prev,
        // Deep copy the range object if it exists in the update
        range: newSettings.range ? 
          { ...prev.range, ...newSettings.range } : 
          { ...prev.range }
      };
      
      // Apply all other updates
      Object.keys(newSettings).forEach(key => {
        const typedKey = key as keyof Partial<GameSettings>;
        if (typedKey !== 'range') {
          // Fix: Use type assertion to avoid TypeScript error
          (updatedSettings as Record<string, any>)[typedKey] = newSettings[typedKey];
        }
      });
      
      return updatedSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return { settings, updateSettings, resetSettings };
};
