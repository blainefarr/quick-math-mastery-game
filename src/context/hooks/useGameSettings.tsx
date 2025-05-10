
import { useState, useEffect } from 'react';
import { GameSettings, Operation, ProblemRange } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

const defaultSettings: GameSettings = {
  operation: 'addition',
  range: { min1: 1, max1: 10, min2: 1, max2: 10 },
  timerSeconds: 60,
  allowNegatives: false,
  focusNumber: null,
  learnerMode: false,
  useCustomNumberPad: false,
  typingSpeedAdjustment: false
};

export const useGameSettings = () => {
  const isMobile = useIsMobile();
  const [settings, setSettings] = useState<GameSettings>(() => {
    // Try to load settings from localStorage
    try {
      const savedLearnerMode = localStorage.getItem('learnerModeEnabled');
      const savedCustomNumberPad = localStorage.getItem('customNumberPadEnabled');
      const savedTypingSpeedAdjustment = localStorage.getItem('typingSpeedAdjustmentEnabled');
      
      const storedSettings: Partial<GameSettings> = {};
      
      if (savedLearnerMode !== null) {
        storedSettings.learnerMode = JSON.parse(savedLearnerMode);
      }
      
      // For custom number pad, check if we have a stored setting
      if (savedCustomNumberPad !== null) {
        storedSettings.useCustomNumberPad = JSON.parse(savedCustomNumberPad);
      } else {
        // If no stored setting, default to enabled on mobile
        storedSettings.useCustomNumberPad = isMobile;
      }
      
      if (savedTypingSpeedAdjustment !== null) {
        storedSettings.typingSpeedAdjustment = JSON.parse(savedTypingSpeedAdjustment);
      }
      
      return {
        ...defaultSettings,
        ...storedSettings
      };
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
      // If there was an error, still set default custom keypad on mobile
      return {
        ...defaultSettings,
        useCustomNumberPad: isMobile
      };
    }
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('learnerModeEnabled', JSON.stringify(settings.learnerMode));
    localStorage.setItem('customNumberPadEnabled', JSON.stringify(settings.useCustomNumberPad));
    localStorage.setItem('typingSpeedAdjustmentEnabled', JSON.stringify(settings.typingSpeedAdjustment));
  }, [settings.learnerMode, settings.useCustomNumberPad, settings.typingSpeedAdjustment]);

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
    setSettings({
      ...defaultSettings,
      useCustomNumberPad: isMobile // Keep custom keypad enabled on mobile when resetting
    });
  };

  return { settings, updateSettings, resetSettings };
};
