"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Palette, Timer } from 'lucide-react';

const COLORS = [
  { name: 'QIZIL', hex: '#ef4444', class: 'text-red-500' },
  { name: 'KO\'K', hex: '#3b82f6', class: 'text-blue-500' },
  { name: 'YASHIL', hex: '#22c55e', class: 'text-green-500' },
  { name: 'SARIQ', hex: '#eab308', class: 'text-yellow-500' },
  { name: 'SIYOHRANG', hex: '#a855f7', class: 'text-purple-500' },
  { name: 'PUSHTI', hex: '#ec4899', class: 'text-pink-500' }
];

export default function Level3Game({ onComplete }: { onComplete: () => void }) {
  const [score, setScore] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isWrong, setIsWrong] = useState(false);

  const nextRound = () => {
    let newWord, newColor;
    do {
      newWord = Math.floor(Math.random() * COLORS.length);
      newColor = Math.floor(Math.random() * COLORS.length);
    } while (newWord === newColor); // Always different to force Stroop effect
    setWordIndex(newWord);
    setColorIndex(newColor);
  };

  useEffect(() => {
    nextRound();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) { 
      onComplete(); // Same as level 1 and 2, ends game if time runs out
      return; 
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  useEffect(() => {
    if (score >= 10) {
      setTimeout(onComplete, 500);
    }
  }, [score, onComplete]);

  const handleSelect = (index: number) => {
    if (index === colorIndex) {
      setScore(s => s + 1);
      nextRound();
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
      setScore(Math.max(0, score - 1)); // Penalty
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-headline text-white">Rangni Top!</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">So'z ma'nosiga emas, RANGIGA e'tibor bering!</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 sm:gap-2 font-headline text-lg sm:text-xl ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-accent'}`}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      <div className="w-full flex items-center gap-4 mb-8">
        <Progress value={(score / 10) * 100} className="h-3 flex-1 bg-white/5" />
        <span className="font-headline text-primary">{score}/10</span>
      </div>
      
      <div 
        className={`text-5xl sm:text-7xl font-headline tracking-widest mb-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 ${isWrong ? 'animate-[shake_0.5s_ease-in-out] opacity-50 scale-95' : 'scale-100'}`}
        style={{ color: COLORS[colorIndex]?.hex }}
      >
        {COLORS[wordIndex]?.name}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {COLORS.map((color, i) => (
          <Button 
            key={i} 
            onClick={() => handleSelect(i)}
            variant="outline"
            className="h-14 sm:h-16 text-lg sm:text-xl font-headline bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-xl transition-all active:scale-95"
          >
            {color.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
