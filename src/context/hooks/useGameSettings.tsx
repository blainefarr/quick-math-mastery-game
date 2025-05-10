
import { useState, useEffect } from 'react';
import { GameSettings, Operation, ProblemRange } from '@/types';
import { useIsMobileOrTablet } from '@/hooks/use-mobile';

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
  const isMobileOrTablet = useIsMobileOrTablet();
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
        // If no stored setting, default to enabled on mobile or tablet
        const isMobileOrTabletDevice = isMobileOrTablet || 
          (typeof navigator !== 'undefined' && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
        
        console.log('No saved custom number pad setting, defaulting based on device:', isMobileOrTabletDevice ? 'mobile/tablet' : 'desktop');
        storedSettings.useCustomNumberPad = isMobileOrTabletDevice;
        
        // Also save this default to localStorage for future visits
        try {
          localStorage.setItem('customNumberPadEnabled', JSON.stringify(isMobileOrTabletDevice));
        } catch (error) {
          console.error("Error saving custom number pad setting:", error);
        }
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
      // If there was an error, still set default custom keypad on mobile or tablet
      const useCustomPad = isMobileOrTablet || 
        (typeof navigator !== 'undefined' && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
      
      console.log('Error loading settings, defaulting custom pad based on device:', useCustomPad ? 'mobile/tablet' : 'desktop');
      
      // Save this default to localStorage for future visits
      try {
        localStorage.setItem('customNumberPadEnabled', JSON.stringify(useCustomPad));
      } catch (storageError) {
        console.error("Error saving to localStorage:", storageError);
      }
      
      return {
        ...defaultSettings,
        useCustomNumberPad: useCustomPad
      };
    }
  });

  // Re-evaluate mobile/tablet status on component mount or when isMobileOrTablet changes
  useEffect(() => {
    const currentSetting = settings.useCustomNumberPad;
    
    // Only update if no user preference has been set (first visit)
    const hasUserPreference = localStorage.getItem('customNumberPadEnabled') !== null;
    
    if (!hasUserPreference) {
      const shouldUseCustomPad = isMobileOrTablet || 
        (typeof navigator !== 'undefined' && /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
      
      if (currentSetting !== shouldUseCustomPad) {
        console.log('Updating custom number pad setting based on device detection:', shouldUseCustomPad ? 'enabled' : 'disabled');
        setSettings(prev => ({
          ...prev,
          useCustomNumberPad: shouldUseCustomPad
        }));
        
        try {
          localStorage.setItem('customNumberPadEnabled', JSON.stringify(shouldUseCustomPad));
        } catch (error) {
          console.error("Error saving custom number pad setting:", error);
        }
      }
    }
  }, [isMobileOrTablet]);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('learnerModeEnabled', JSON.stringify(settings.learnerMode));
      localStorage.setItem('customNumberPadEnabled', JSON.stringify(settings.useCustomNumberPad));
      localStorage.setItem('typingSpeedAdjustmentEnabled', JSON.stringify(settings.typingSpeedAdjustment));
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
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
      useCustomNumberPad: isMobileOrTablet // Keep custom keypad enabled on mobile or tablet when resetting
    });
  };

  return { settings, updateSettings, resetSettings };
};
