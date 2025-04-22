
import React from 'react';
import { Plus, Minus, X, Divide } from 'lucide-react';

const MathBackground = () => {
  // Create an array of math symbols
  const symbols = ['+', '-', '×', '÷', '=', '?'];
  const colors = ['#9b87f5', '#7E69AB', '#FEC6A1', '#FEF7CD', '#F2FCE2', '#D3E4FD'];
  
  // Generate random math symbols
  const mathElements = Array.from({ length: 40 }).map((_, i) => {
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <div 
        key={i}
        className="absolute text-primary/10 opacity-30 pointer-events-none select-none"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 3 + 1}rem`,
          transform: `rotate(${Math.random() * 360}deg)`,
          color: randomColor
        }}
      >
        {randomSymbol}
      </div>
    );
  });
  
  // Add math operation icons as well
  const iconElements = [
    <Plus key="plus" size={24} className="text-primary/10" />,
    <Minus key="minus" size={24} className="text-primary/10" />,
    <X key="multiply" size={24} className="text-primary/10" />,
    <Divide key="divide" size={24} className="text-primary/10" />
  ].map((icon, i) => (
    <div 
      key={`icon-${i}`}
      className="absolute opacity-20 pointer-events-none select-none"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 2 + 1})`
      }}
    >
      {icon}
    </div>
  ));

  return (
    <div className="fixed inset-0 overflow-hidden">
      {mathElements}
      {iconElements}
    </div>
  );
};

export default MathBackground;
