
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimerSelectProps {
  value: number;
  onChange: (value: number) => void;
}

const TimerSelect = ({ value, onChange }: TimerSelectProps) => {
  const timerOptions = [
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' },
  ];

  return (
    <div className="flex items-center justify-between gap-4 p-2 rounded-lg bg-muted/50">
      <span className="text-sm font-medium">Time Limit</span>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent>
          {timerOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimerSelect;
