
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
  range1?: {
    min: number;
    max: number;
  };
  range2?: {
    min: number;
    max: number;
  };
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
        <div className="flex flex-wrap md:flex-nowrap gap-8 px-4 max-w-[700px] mx-auto">
          <div className="flex-1 min-w-[240px]">
            <h4 className="text-base font-medium mb-2">Number Range 1</h4>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium block mb-2">Min</label>
                <input
                  value={focusNumberEnabled ? focusNumber : range1.min}
                  onChange={e => setRange1Min(e.target.value)}
                  onFocus={selectAllOnFocus}
                  disabled={focusNumberEnabled}
                  className={`w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${focusNumberEnabled ? 'bg-muted text-muted-foreground' : ''}`}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-medium block mb-2">Max</label>
                <input
                  value={focusNumberEnabled ? focusNumber : range1.max}
                  onChange={e => setRange1Max(e.target.value)}
                  onFocus={selectAllOnFocus}
                  disabled={focusNumberEnabled}
                  className={`w-24 px-3 py-1 rounded-md border shadow-sm focus:ring-2 focus:ring-accent focus:border-accent font-mono text-lg text-left appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${focusNumberEnabled ? 'bg-muted text-muted-foreground' : ''}`}
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>
            {focusNumberEnabled && (
              <p className="text-xs text-muted-foreground mt-2">
                (locked to focus number)
              </p>
            )}
          </div>

          <div className="flex-1 min-w-[240px]">
            <h4 className="text-base font-medium mb-2">Number Range 2</h4>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium block mb-2">Min</label>
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
              <div className="flex flex-col">
                <label className="text-xs font-medium block mb-2">Max</label>
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
    <div className="w-full">
      {title && <h3 className="font-bold text-md mb-2 px-4">{title}</h3>}
      {renderRangeInputs()}
    </div>
  );
};

export default NumberRangeSection;
