
import React from 'react';
import CustomNumberPad from '@/components/numberpad/CustomNumberPad';

interface NumberPadContainerProps {
  enabled: boolean;
  onNumberPress: (number: string) => void;
  onDelete: () => void;
  onNegativeToggle: () => void;
  isNegative: boolean;
  showNegativeToggle: boolean;
  onButtonPress?: () => void;
}

const NumberPadContainer: React.FC<NumberPadContainerProps> = ({
  enabled,
  onNumberPress,
  onDelete,
  onNegativeToggle,
  isNegative,
  showNegativeToggle,
  onButtonPress
}) => {
  if (!enabled) return null;

  return (
    <div className="w-full max-w-md mx-auto md:max-w-xl">
      <CustomNumberPad 
        onNumberPress={onNumberPress}
        onDelete={onDelete}
        onNegativeToggle={onNegativeToggle}
        isNegative={isNegative}
        showNegativeToggle={showNegativeToggle}
        onButtonPress={onButtonPress}
      />
    </div>
  );
};

export default NumberPadContainer;
