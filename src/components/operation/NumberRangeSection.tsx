
import React from 'react';

interface NumberRangeSectionProps {
  title?: string;
  min?: number;
  max?: number;
  onMinChange?: (value: number) => void;
  onMaxChange?: (value: number) => void;
  inputPrefix?: string;
  inputSuffix?: string;
  inputLabelMin?: string;
  inputLabelMax?: string;
  focusNumberEnabled?: boolean;
  focusNumber?: number;
  negativeNumbersEnabled?: boolean;
  range1?: { min: number; max: number };
  range2?: { min: number; max: number };
  setRange1Min?: (value: any) => void;
  setRange1Max?: (value: any) => void;
  setRange2Min?: (value: any) => void;
  setRange2Max?: (value: any) => void;
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
  inputLabelMax,
  focusNumberEnabled,
  focusNumber,
  negativeNumbersEnabled,
  range1,
  range2,
  setRange1Min,
  setRange1Max,
  setRange2Min,
  setRange2Max
}: NumberRangeSectionProps) => {

  const selectAllOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const renderRangeInputs = () => {
    if (range1 && range2 && setRange1Min && setRange1Max && setRange2Min && setRange2Max) {
      return (
        <div className="flex flex-wrap 2xs:flex-nowrap items-start gap-4 2xs:gap-8">
          <div className="w-full">
            <h4 className="text-base font-medium mb-2">First Number Range</h4>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium block mb-1">Min</label>
                <input
                  value={range1.min}
                  onChange={e => setRange1Min(e.target.value)}
                  onFocus={selectAllOnFocus}
                  className="w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium block mb-1">Max</label>
                <input
                  value={range1.max}
                  onChange={e => setRange1Max(e.target.value)}
                  onFocus={selectAllOnFocus}
                  className="w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>
          </div>
          <div className="w-full">
            <h4 className="text-base font-medium mb-2">Second Number Range</h4>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium block mb-1">Min</label>
                <input
                  value={range2.min}
                  onChange={e => setRange2Min(e.target.value)}
                  onFocus={selectAllOnFocus}
                  className="w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="flex flex-col items-start">
                <label className="text-xs font-medium block mb-1">Max</label>
                <input
                  value={range2.max}
                  onChange={e => setRange2Max(e.target.value)}
                  onFocus={selectAllOnFocus}
                  className="w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-1 mb-4 px-4">
      {title && <h3 className="font-bold text-md mb-2">{title}</h3>}
      {renderRangeInputs()}
    </div>
  );
};

export default NumberRangeSection;
