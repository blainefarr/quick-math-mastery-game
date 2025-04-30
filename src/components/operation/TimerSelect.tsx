
import React from 'react';
import { Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimerSelectProps {
  value: number;
  onChange: (value: number) => void;
}

const TimerSelect = ({
  value,
  onChange
}: TimerSelectProps) => {
  const timerOptions = [
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' }
  ];

  // This function prevents operation reset by stopping event propagation
  const handleValueChange = (newValue: string) => {
    // Convert the string value to a number and pass it to the onChange handler
    onChange(parseInt(newValue));
  };

  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium">Game Timer</h3>
      <div className="flex items-center">
        <Select 
          value={value.toString()} 
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-full bg-white">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select time" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {timerOptions.map(option => (
              <SelectItem 
                key={option.value} 
                value={option.value.toString()}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TimerSelect;
