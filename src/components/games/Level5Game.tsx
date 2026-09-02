"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Hash, Timer } from 'lucide-react';

const TOTAL_NUMBERS = 16;

export default function Level5Game({ onComplete }: { onComplete: () => void }) {
  const [numbers, setNumbers] = useState<{val: number, id: number}[]>([]);
  const [currentExpected, setCurrentExpected] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isWrong, setIsWrong] = useState(false);

  const shuffleNumbers = () => {
    const nums = Array.from({length: TOTAL_NUMBERS}, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5)
      .map((val, id) => ({val, id: id + Date.now()}));
    setNumbers(nums);
  };

  useEffect(() => {
    shuffleNumbers();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) { 
      onComplete(); 
      return; 
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const handleClick = (val: number) => {
    if (val === currentExpected) {
      if (val === TOTAL_NUMBERS) {
        setTimeout(onComplete, 500);
      } else {
        setCurrentExpected(c => c + 1);
        // Har 4 ta bosilganda doska aralashadi
        if (val % 4 === 0) {
          shuffleNumbers();
        }
      }
    } else if (val > currentExpected) {
      // wrong click penalty
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 400);
      setTimeLeft(t => Math.max(0, t - 3)); // 3 sekund jarima
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Hash className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-headline text-white">Tezkor Raqamlar</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">1 dan 16 gacha tartibda bosing</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 sm:gap-2 font-headline text-lg sm:text-xl ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-accent'}`}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      <div className="w-full flex items-center gap-4 mb-8">
        <Progress value={(currentExpected / TOTAL_NUMBERS) * 100} className="h-3 flex-1 bg-white/5" />
        <span className="font-headline text-primary">{currentExpected - 1}/{TOTAL_NUMBERS}</span>
      </div>
      
      <div className="text-xl mb-6 text-accent/80 font-medium">Kutilayotgan raqam: <span className="text-3xl text-accent font-headline ml-2">{currentExpected}</span></div>
      
      <div className={`grid grid-cols-4 gap-3 w-full transition-transform duration-300 ${isWrong ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
        {numbers.map((num) => {
          const isClicked = num.val < currentExpected;
          const isNext = num.val === currentExpected;
          return (
            <Button 
              key={num.id} 
              onClick={() => handleClick(num.val)}
              disabled={isClicked}
              variant="outline"
              className={`h-16 sm:h-20 text-2xl sm:text-3xl font-headline transition-all duration-300
                ${isClicked 
                  ? 'opacity-0 scale-50' 
                  : 'opacity-100 hover:scale-105 active:scale-95 bg-[#1A1921] border-white/10 hover:border-white/30 text-white'
                }
                ${isNext && timeLeft < 20 ? 'shadow-[0_0_15px_rgba(186,106,255,0.4)] border-primary' : ''}
              `}
            >
              {num.val}
            </Button>
          )
        })}
      </div>
    </div>
  );
}
