import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useGame from '@/context/useGame';

const NumberRangeSection = () => {
  const { settings, updateSettings } = useGame();
  const [min1, setMin1] = useState(settings.range.min1.toString());
  const [max1, setMax1] = useState(settings.range.max1.toString());
  const [min2, setMin2] = useState(settings.range.min2.toString());
  const [max2, setMax2] = useState(settings.range.max2.toString());

  const validateNumber = (value: string): boolean => {
    return /^-?\d+$/.test(value);
  };

  const handleMin1Change = (value: string) => {
    if (value === '' || validateNumber(value)) {
      setMin1(value);
    }
  };

  const handleMax1Change = (value: string) => {
    if (value === '' || validateNumber(value)) {
      setMax1(value);
    }
  };

  const handleMin2Change = (value: string) => {
    if (value === '' || validateNumber(value)) {
      setMin2(value);
    }
  };

  const handleMax2Change = (value: string) => {
    if (value === '' || validateNumber(value)) {
      setMax2(value);
    }
  };

  useEffect(() => {
    const newMin1 = min1 === '' ? 0 : parseInt(min1);
    const newMax1 = max1 === '' ? 10 : parseInt(max1);
    const newMin2 = min2 === '' ? 0 : parseInt(min2);
    const newMax2 = max2 === '' ? 10 : parseInt(max2);

    updateSettings({
      range: {
        min1: newMin1,
        max1: newMax1,
        min2: newMin2,
        max2: newMax2,
      },
    });
  }, [min1, max1, min2, max2, updateSettings]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label>Timer</Label>
        <Select
          value={settings.timerSeconds.toString()}
          onValueChange={(value) => updateSettings({ timerSeconds: parseInt(value) })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 seconds</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="60">1 minute</SelectItem>
            <SelectItem value="120">2 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="min1">First Number Range</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              id="min1"
              placeholder="Min"
              value={min1}
              onChange={(e) => handleMin1Change(e.target.value)}
            />
            <Input
              type="number"
              id="max1"
              placeholder="Max"
              value={max1}
              onChange={(e) => handleMax1Change(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="min2">Second Number Range</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              id="min2"
              placeholder="Min"
              value={min2}
              onChange={(e) => handleMin2Change(e.target.value)}
            />
            <Input
              type="number"
              id="max2"
              placeholder="Max"
              value={max2}
              onChange={(e) => handleMax2Change(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberRangeSection;
