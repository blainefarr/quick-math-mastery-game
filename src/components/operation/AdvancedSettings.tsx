
import React from 'react';
import { Settings, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import FocusNumberSection from './FocusNumberSection';
import NegativeNumbersToggle from './NegativeNumbersToggle';
import LearnerModeToggle from './LearnerModeToggle';
import CustomNumberPadToggle from './CustomNumberPadToggle';
import TypingSpeedToggle from './TypingSpeedToggle';

interface AdvancedSettingsProps {
  useFocusNumber: boolean;
  focusNumberValue: number;
  negativeNumbersEnabled: boolean;
  learnerModeEnabled: boolean;
  customNumberPadEnabled: boolean;
  typingSpeedEnabled: boolean;
  onFocusNumberToggle: (checked: boolean) => void;
  onFocusNumberChange: (value: string) => void;
  onNegativeToggle: (checked: boolean) => void;
  onLearnerModeToggle: (checked: boolean) => void;
  onCustomNumberPadToggle: (checked: boolean) => void;
  onTypingSpeedToggle: (checked: boolean) => void;
}

const AdvancedSettings = ({
  useFocusNumber,
  focusNumberValue,
  negativeNumbersEnabled,
  learnerModeEnabled,
  customNumberPadEnabled,
  typingSpeedEnabled,
  onFocusNumberToggle,
  onFocusNumberChange,
  onNegativeToggle,
  onLearnerModeToggle,
  onCustomNumberPadToggle,
  onTypingSpeedToggle
}: AdvancedSettingsProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Load saved state from localStorage or determine if it should be open based on active settings
    const savedState = localStorage.getItem('advancedSettingsOpen');
    const hasActiveAdvancedSettings = useFocusNumber || negativeNumbersEnabled || learnerModeEnabled || customNumberPadEnabled || typingSpeedEnabled;
    
    if (savedState) {
      setIsOpen(JSON.parse(savedState));
    } else if (hasActiveAdvancedSettings) {
      // If any advanced setting is enabled, automatically open the dropdown
      setIsOpen(true);
      localStorage.setItem('advancedSettingsOpen', JSON.stringify(true));
    }
  }, [useFocusNumber, negativeNumbersEnabled, learnerModeEnabled, customNumberPadEnabled, typingSpeedEnabled]);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    localStorage.setItem('advancedSettingsOpen', JSON.stringify(open));
  };

  return <div className="space-y-2">
    <Collapsible open={isOpen} onOpenChange={handleToggle} className="w-full">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border h-[40px] px-3 py-1 text-left hover:bg-muted/50">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Advanced Settings</span>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="rounded-lg border bg-muted/5 p-4 space-y-4 mt-2">
          <FocusNumberSection 
            enabled={useFocusNumber} 
            value={focusNumberValue} 
            onToggle={onFocusNumberToggle} 
            onChange={onFocusNumberChange} 
          />
          <NegativeNumbersToggle 
            enabled={negativeNumbersEnabled} 
            onToggle={onNegativeToggle} 
          />
          <LearnerModeToggle
            enabled={learnerModeEnabled}
            onToggle={onLearnerModeToggle}
          />
          <CustomNumberPadToggle
            enabled={customNumberPadEnabled}
            onToggle={onCustomNumberPadToggle}
          />
          <TypingSpeedToggle
            enabled={typingSpeedEnabled}
            onToggle={onTypingSpeedToggle}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>;
};

export default AdvancedSettings;
