
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Clock, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompactHeight } from '@/hooks/use-compact-height';
import CustomNumberPad from '../numberpad/CustomNumberPad';
import { useIsMobile } from '@/hooks/use-mobile';

interface GamePlayAreaProps {
  timeLeft: number;
  scoreLabel: string;
  scoreValue: number | string;
  timeClass?: string;
  questionContent: ReactNode;
  userInput: string;
  isNegative: boolean;
  feedback: 'correct' | 'incorrect' | null;
  inputRef: React.RefObject<HTMLInputElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customNumberPadEnabled?: boolean;
  onNumberPress: (number: string) => void;
  onDelete: () => void;
  onNegativeToggle: () => void;
  showNegativeToggle?: boolean;
  onContainerTouch: () => void;
  onRestartGame: () => void;
  encouragementMessage?: string | null;
  footerContent?: ReactNode;
  readOnlyInput?: boolean;
}

const GamePlayArea: React.FC<GamePlayAreaProps> = ({
  timeLeft,
  scoreLabel,
  scoreValue,
  timeClass = '',
  questionContent,
  userInput,
  isNegative,
  feedback,
  inputRef,
  onInputChange,
  customNumberPadEnabled = false,
  onNumberPress,
  onDelete,
  onNegativeToggle,
  showNegativeToggle = false,
  onContainerTouch,
  onRestartGame,
  encouragementMessage = null,
  footerContent,
  readOnlyInput = false
}) => {
  const isCompactHeight = useCompactHeight();
  const isMobile = useIsMobile();

  return (
    <div 
      className={`flex justify-center items-center min-h-screen p-4 bg-background ${
        isCompactHeight ? 'pt-0 mt-0' : 'pt-4'
      }`}
      onTouchStart={onContainerTouch}
      onClick={onContainerTouch}
    >
      <div className={`w-full max-w-xl ${
        isCompactHeight ? 'mt-0' : 'mt-8'
      }`}>
        <div className={`flex justify-between ${
          isCompactHeight ? 'mb-4' : 'mb-8'
        }`}>
          <Card className={`p-3 flex items-center ${timeLeft < 10 ? 'animate-timer-tick text-destructive' : ''} ${timeClass}`}>
            <Clock className="mr-2" />
            <span className="text-xl font-bold">{timeLeft}</span>
          </Card>
          <Card className="p-3">
            <span className="font-medium">{scoreLabel}: </span>
            <span className="text-xl font-bold">{scoreValue}</span>
          </Card>
        </div>

        <Card 
          className={`${
            isCompactHeight ? 'mb-4 py-6' : 'mb-6 py-10'
          } px-6 shadow-lg animate-bounce-in ${
            feedback === 'correct' ? 'bg-success/10 border-success' : 
            feedback === 'incorrect' ? 'bg-destructive/10 border-destructive' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (inputRef.current && !readOnlyInput) {
              inputRef.current.focus();
            }
          }}
        >
          <CardContent className="flex justify-center items-center">
            {questionContent}
            
            <div className="relative flex items-center">
              <Input
                ref={inputRef}
                type="text"
                inputMode={customNumberPadEnabled ? "none" : "numeric"}
                pattern="[0-9]*"
                value={userInput}
                onChange={onInputChange}
                className={`text-4xl md:text-6xl w-24 md:w-32 h-16 text-center font-bold p-0 border-b-4 focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none ${
                  feedback === 'correct' ? 'text-success' : 
                  feedback === 'incorrect' ? 'text-destructive' : ''
                }`}
                autoComplete="off"
                autoFocus
                readOnly={readOnlyInput || customNumberPadEnabled}
                style={{
                  MozAppearance: 'textfield',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isMobile) {
                    e.currentTarget.focus();
                  }
                }}
              />
              {isNegative && (
                <span className="absolute top-1/2 transform -translate-y-1/2 -left-10 text-4xl md:text-6xl z-20 select-none">-</span>
              )}
              {feedback && (
                <div
                  className={`absolute top-0 right-0 transform translate-x-full -translate-y-1/4 rounded-full p-1 
                    ${feedback === 'correct' ? 'bg-success text-white' : 'bg-destructive text-white'}`}
                >
                  {feedback === 'correct' ? '✓' : '✗'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Encouragement message when provided */}
        {encouragementMessage && (
          <div className="text-center mb-4 animate-fade-in">
            <p className="text-lg font-medium text-primary">
              {encouragementMessage}
            </p>
          </div>
        )}

        {/* Custom Number Pad when enabled */}
        {customNumberPadEnabled && (
          <div className="w-full max-w-md mx-auto md:max-w-xl">
            <CustomNumberPad 
              onNumberPress={onNumberPress}
              onDelete={onDelete}
              onNegativeToggle={onNegativeToggle}
              isNegative={isNegative}
              showNegativeToggle={showNegativeToggle}
              onButtonPress={() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />
          </div>
        )}

        {/* Restart button */}
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={onRestartGame} 
            className="flex items-center gap-2"
          >
            <RotateCw className="h-4 w-4" /> Restart Game
          </Button>
        </div>

        {/* Optional footer content */}
        {footerContent && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlayArea;
