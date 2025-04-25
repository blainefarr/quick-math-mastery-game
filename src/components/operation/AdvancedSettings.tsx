
import React from 'react';
import { Settings, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import FocusNumberSection from './FocusNumberSection';
import NegativeNumbersToggle from './NegativeNumbersToggle';

interface AdvancedSettingsProps {
  useFocusNumber: boolean;
  focusNumberValue: number;
  negativeNumbersEnabled: boolean;
  onFocusNumberToggle: (checked: boolean) => void;
  onFocusNumberChange: (value: string) => void;
  onNegativeToggle: (checked: boolean) => void;
}

const AdvancedSettings = ({
  useFocusNumber,
  focusNumberValue,
  negativeNumbersEnabled,
  onFocusNumberToggle,
  onFocusNumberChange,
  onNegativeToggle
}: AdvancedSettingsProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Load saved state from localStorage
    const savedState = localStorage.getItem('advancedSettingsOpen');
    if (savedState) {
      setIsOpen(JSON.parse(savedState));
    }
  }, []);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    localStorage.setItem('advancedSettingsOpen', JSON.stringify(open));
  };

  return (
    <div className="space-y-2 px-4">
      <Collapsible 
        open={isOpen} 
        onOpenChange={handleToggle}
        className="w-full"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border h-[38px] px-3 py-1 text-left hover:bg-muted/50">
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
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AdvancedSettings;
