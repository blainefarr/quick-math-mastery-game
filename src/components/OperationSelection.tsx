
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, X, Divide } from 'lucide-react';

const OperationSelection = () => {
  const { settings, updateSettings, setGameState, setTimeLeft } = useGame();
  const [startAnimation, setStartAnimation] = useState(false);
  
  // Start the game with current settings
  const handleStart = () => {
    // Play animation first
    setStartAnimation(true);
    
    // Play a start sound
    const audio = new Audio();
    audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAElqAEhISEhISEhISEhIWVlZWVlZWVlZWVlpcXFxcXFxcXFxcXF5eXl5eXl5eXl5eYKCgoKCgoKCgoKCioqKioqKioqKioqSk5OTk5OTk5OTk5ubm5ubm5ubm5ubs7Ozs7Ozs7Ozs7O7u7u7u7u7u7u7u8PDw8PDw8PDw8PD29/jUMQAAANAABLBxn8iBnqqqqqqqqqqqqoICAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQu7u7u7u7u7v/jMMQjYdZG81QwZu8u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/jUMQKYdZG8AQcZu8u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v/jMMQKX+JKAF/GG5EJImEsSJJ4riUTxXFo0VxRMSiSKRXI3EWRI9ISPRJIZEiYCuQIiRIiIiRIiIiIiREiRIiJESRIiJEiRIiJEiBIiREiIiIiJEiQiIiIQiJEREIQhCGP/jYMQHX9KNACSMGZEQhCEQhCEIQhEREREREREREIREREP8REQREREL8QiIiIRERDwQhD/CIiIiEIQhCEIQh/+IkREiQ/whCIiIQhD/D/iIiIRCEPwhhCEIRD//ER4iIQj/43DEBXOpRlJYGHACIQhCEQ/hCEP//8Q/w/4YQiIP8P+P+EIP//4f8P+H/D/D/D/D/D/h/h/w/w/4f8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P/jUMQGZO1HsGPSMgP8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P/jMMQDX/JSIAYYsoP8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P/jYMQBW2syMgAYQMoP8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P/jkMQAVWtKLzDiAEgP8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8P8REREREREREREQAAAAAAJBQAYOAGAAiTMSBITAg';
    audio.volume = 0.3;
    audio.play();
    
    // Wait for animation then start game
    setTimeout(() => {
      setTimeLeft(settings.timerSeconds);
      setGameState('playing');
    }, 800);
  };
  
  // Update range values for the selected operation
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      updateSettings({
        range: {
          ...settings.range,
          [name]: numValue
        }
      });
    }
  };

  return (
    <div className={`flex justify-center items-center min-h-screen p-4 animate-fade-in ${startAnimation ? 'animate-slide-in' : ''}`}>
      <Card className={`w-full max-w-md shadow-xl ${startAnimation ? 'animate-slide-in opacity-0' : ''}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Minute Math</CardTitle>
          <CardDescription>Select operation and number ranges</CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="addition" onValueChange={(value) => updateSettings({ operation: value as any })}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="addition" className="flex items-center gap-1">
              <Plus size={16} /> Add
            </TabsTrigger>
            <TabsTrigger value="subtraction" className="flex items-center gap-1">
              <Minus size={16} /> Sub
            </TabsTrigger>
            <TabsTrigger value="multiplication" className="flex items-center gap-1">
              <X size={16} /> Mult
            </TabsTrigger>
            <TabsTrigger value="division" className="flex items-center gap-1">
              <Divide size={16} /> Div
            </TabsTrigger>
          </TabsList>
          
          {/* Addition Settings */}
          <TabsContent value="addition">
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="add-first-number">First Number Range:</Label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="min1" className="text-xs">Min</Label>
                    <Input 
                      id="min1" 
                      name="min1" 
                      type="number" 
                      value={settings.range.min1} 
                      onChange={handleRangeChange}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="max1" className="text-xs">Max</Label>
                    <Input 
                      id="max1" 
                      name="max1" 
                      type="number" 
                      value={settings.range.max1} 
                      onChange={handleRangeChange}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="add-second-number">Second Number Range:</Label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="min2" className="text-xs">Min</Label>
                    <Input 
                      id="min2" 
                      name="min2" 
                      type="number" 
                      value={settings.range.min2} 
                      onChange={handleRangeChange}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="max2" className="text-xs">Max</Label>
                    <Input 
                      id="max2" 
                      name="max2" 
                      type="number" 
                      value={settings.range.max2} 
                      onChange={handleRangeChange}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          {/* Subtraction Settings */}
          <TabsContent value="subtraction">
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="sub-first-number">First Number Range:</Label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="min1" className="text-xs">Min</Label>
                    <Input 
                      id="min1" 
                      name="min1" 
                      type="number" 
                      value={settings.range.min1} 
                      onChange={handleRangeChange}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="max1" className="text-xs">Max</Label>
                    <Input 
                      id="max1" 
                      name="max1" 
                      type="number" 
                      value={settings.range.max1} 
                      onChange={handleRangeChange}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="sub-second-number">Second Number Range:</Label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="min2" className="text-xs">Min</Label>
                    <Input 
                      id="min2" 
                      name="min2" 
                      type="number" 
                      value={settings.range.min2} 
                      onChange={handleRangeChange}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="max2" className="text-xs">Max</Label>
                    <Input 
                      id="max2" 
                      name="max2" 
                      type="number" 
                      value={settings.range.max2} 
                      onChange={handleRangeChange}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          {/* Multiplication Settings */}
          <TabsContent value="multiplication">
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="mult-first-number">First Number Range:</Label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="min1" className="text-xs">Min</Label>
                    <Input 
                      id="min1" 
                      name="min1" 
                      type="number" 
                      value={settings.range.min1} 
                      onChange={handleRangeChange}
                      min={0}
                      max={12}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="max1" className="text-xs">Max</Label>
                    <Input 
                      id="max1" 
                      name="max1" 
                      type="number" 
                      value={settings.range.max1} 
                      onChange={handleRangeChange}
                      min={0}
                      max={12}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="mult-second-number">Second Number Range:</Label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="min2" className="text-xs">Min</Label>
                    <Input 
                      id="min2" 
                      name="min2" 
                      type="number" 
                      value={settings.range.min2} 
                      onChange={handleRangeChange}
                      min={0}
                      max={12}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="max2" className="text-xs">Max</Label>
                    <Input 
                      id="max2" 
                      name="max2" 
                      type="number" 
                      value={settings.range.max2} 
                      onChange={handleRangeChange}
                      min={0}
                      max={12}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </TabsContent>
          
          {/* Division Settings */}
          <TabsContent value="division">
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="div-first-number">Dividend Range (result of division):</Label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="min1" className="text-xs">Min</Label>
                    <Input 
                      id="min1" 
                      name="min1" 
                      type="number" 
                      value={settings.range.min1} 
                      onChange={handleRangeChange}
                      min={1}
                      max={12}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="max1" className="text-xs">Max</Label>
                    <Input 
                      id="max1" 
                      name="max1" 
                      type="number" 
                      value={settings.range.max1} 
                      onChange={handleRangeChange}
                      min={1}
                      max={12}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="div-second-number">Divisor Range (number divided by):</Label>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label htmlFor="min2" className="text-xs">Min</Label>
                    <Input 
                      id="min2" 
                      name="min2" 
                      type="number" 
                      value={settings.range.min2} 
                      onChange={handleRangeChange}
                      min={1}
                      max={12}
                    />
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="max2" className="text-xs">Max</Label>
                    <Input 
                      id="max2" 
                      name="max2" 
                      type="number" 
                      value={settings.range.max2} 
                      onChange={handleRangeChange}
                      min={1}
                      max={12}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Only whole number results will be generated
              </p>
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter>
          <Button 
            onClick={handleStart} 
            className="w-full mt-4 bg-gradient-to-r from-primary to-secondary animate-bounce-in"
          >
            Start Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OperationSelection;
