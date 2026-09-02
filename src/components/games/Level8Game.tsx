"use client"
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Ear, Play, RotateCcw } from 'lucide-react';

const COLORS = [
  { bg: 'bg-red-500', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.8)]' },
  { bg: 'bg-blue-500', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.8)]' },
  { bg: 'bg-green-500', glow: 'shadow-[0_0_30px_rgba(34,197,94,0.8)]' },
  { bg: 'bg-yellow-400', glow: 'shadow-[0_0_30px_rgba(250,204,21,0.8)]' },
  { bg: 'bg-purple-500', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.8)]' },
  { bg: 'bg-pink-500', glow: 'shadow-[0_0_30px_rgba(236,72,153,0.8)]' }
];

export default function Level8Game({ onComplete }: { onComplete: () => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);

  const addNewColor = () => {
    setSequence(prev => [...prev, Math.floor(Math.random() * COLORS.length)]);
  };

  useEffect(() => {
    addNewColor();
  }, []);

  useEffect(() => {
    if (sequence.length > 6) { // 6 bosqich
      setTimeout(onComplete, 500);
      return;
    }
    if (!playing && sequence.length > 0 && !isWrong) {
      let i = 0;
      // Tezlashadi (sequence qancha uzun bo'lsa shuncha tezlashadi)
      const speed = Math.max(300, 800 - sequence.length * 50);
      
      const interval = setInterval(() => {
        setActiveColor(sequence[i]);
        // Play sound here if we had audio
        setTimeout(() => setActiveColor(null), speed / 2);
        i++;
        if (i >= sequence.length) {
          clearInterval(interval);
          setPlaying(true);
        }
      }, speed);
      
      return () => clearInterval(interval);
    }
  }, [sequence, playing, isWrong, onComplete]);

  const handleColorClick = (index: number) => {
    if (!playing) return;
    
    setActiveColor(index);
    setTimeout(() => setActiveColor(null), 200);

    if (index === sequence[playerIndex]) {
      if (playerIndex === sequence.length - 1) {
        setPlaying(false);
        setPlayerIndex(0);
        setTimeout(addNewColor, 800);
      } else {
        setPlayerIndex(p => p + 1);
      }
    } else {
      setIsWrong(true);
      setPlaying(false);
      setTimeout(() => {
        setSequence([]);
        setPlayerIndex(0);
        setIsWrong(false);
        setTimeout(addNewColor, 500);
      }, 1000);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 w-full flex flex-col items-center transition-transform ${isWrong ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Ear className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-headline text-white">Simon Says</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Ketma-ketlikni eslab qoling</p>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center gap-4 mb-10">
        <Progress value={(sequence.length / 7) * 100} className="h-3 flex-1 bg-white/5" />
        <span className="font-headline text-primary">{Math.max(0, sequence.length - 1)}/6</span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[300px] mb-8">
        {COLORS.map((color, i) => {
          const isActive = activeColor === i;
          return (
            <div
              key={i}
              onClick={() => handleColorClick(i)}
              className={`aspect-square rounded-2xl cursor-pointer transition-all duration-200 
                ${color.bg} 
                ${isActive ? `brightness-150 scale-105 ${color.glow} z-10` : 'brightness-75 opacity-70 scale-100'}
                ${!playing ? 'cursor-not-allowed' : 'hover:brightness-110'}
                ${isWrong ? 'grayscale opacity-50' : ''}
              `}
            />
          );
        })}
      </div>

      <div className="h-12 flex items-center justify-center">
        {isWrong ? (
          <div className="flex items-center gap-2 text-destructive font-headline text-xl animate-in fade-in zoom-in">
            <RotateCcw className="w-5 h-5" /> Xato! Qayta boshlanmoqda...
          </div>
        ) : playing ? (
          <div className="text-accent font-headline text-xl animate-pulse">
            Sizning navbatingiz!
          </div>
        ) : (
          <div className="flex items-center gap-2 text-primary font-headline text-xl">
            <Play className="w-5 h-5 animate-pulse" /> Kompyuterni kuzating...
          </div>
        )}
      </div>
    </div>
  );
}
