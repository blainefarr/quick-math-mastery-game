import React from 'react';

interface NumberRangeSectionProps {
  title: string;
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  inputPrefix?: string;
  inputSuffix?: string;
  inputLabelMin?: string;
  inputLabelMax?: string;
}

const NumberRangeSection = ({
  title,
  min,
  max,
  onMinChange,
  onMaxChange,
  inputPrefix,
  inputSuffix,
  inputLabelMin,
  inputLabelMax
}: NumberRangeSectionProps) => {

  const handleMinChange = (value: number) => {
    onMinChange(value);
  };

  const handleMaxChange = (value: number) => {
    onMaxChange(value);
  };

  // Select all value when input is focused
  const selectAllOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="w-full flex flex-col gap-1 mb-4">
      {title && <h3 className="font-bold text-md mb-2">{title}</h3>}
      <div className="flex flex-row gap-4">
        <div className="flex flex-col items-start">
          <label className="font-medium text-xs mb-1">
            {inputLabelMin || "Min"}
          </label>
          <input
            value={min}
            onChange={e => onMinChange(Number(e.target.value))}
            onFocus={selectAllOnFocus}
            className="w-16 px-2 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent text-center font-mono text-lg appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="flex flex-col items-start">
          <label className="font-medium text-xs mb-1">
            {inputLabelMax || "Max"}
          </label>
          <input
            value={max}
            onChange={e => onMaxChange(Number(e.target.value))}
            onFocus={selectAllOnFocus}
            className="w-16 px-2 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent text-center font-mono text-lg appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
      </div>
    </div>
  );
};

export default NumberRangeSection;
