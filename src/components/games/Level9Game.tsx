"use client"
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Grid3X3, Eye } from 'lucide-react';

const GRID_SIZE = 25; // 5x5

export default function Level9Game({ onComplete }: { onComplete: () => void }) {
  const [level, setLevel] = useState(1);
  const [activeBlocks, setActiveBlocks] = useState<number[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'success' | 'wrong'>('memorize');

  const generateLevel = (currentLevel: number) => {
    const blocksCount = Math.min(3 + currentLevel, 10);
    const newBlocks: number[] = [];
    while (newBlocks.length < blocksCount) {
      const r = Math.floor(Math.random() * GRID_SIZE);
      if (!newBlocks.includes(r)) {
        newBlocks.push(r);
      }
    }
    setActiveBlocks(newBlocks);
    setSelectedBlocks([]);
    setPhase('memorize');

    // Hide blocks after time
    setTimeout(() => {
      setPhase('recall');
    }, Math.max(1000, 3000 - currentLevel * 300));
  };

  useEffect(() => {
    generateLevel(level);
  }, [level]);

  const handleBlockClick = (index: number) => {
    if (phase !== 'recall') return;

    if (activeBlocks.includes(index)) {
      const newSelected = [...selectedBlocks, index];
      setSelectedBlocks(newSelected);

      if (newSelected.length === activeBlocks.length) {
        setPhase('success');
        if (level >= 5) {
          setTimeout(onComplete, 1000);
        } else {
          setTimeout(() => setLevel(l => l + 1), 1000);
        }
      }
    } else {
      setPhase('wrong');
      setTimeout(() => {
        setLevel(1);
        generateLevel(1);
      }, 1500);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 w-full flex flex-col items-center transition-transform ${phase === 'wrong' ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Grid3X3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-headline text-white">Xotira Matritsasi</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Yonib o'chgan kataklarni toping</p>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center gap-4 mb-8">
        <Progress value={(level / 5) * 100} className="h-3 flex-1 bg-white/5" />
        <span className="font-headline text-primary">{Math.min(level, 5)}/5</span>
      </div>

      <div className="grid grid-cols-5 gap-2 w-full max-w-[320px] mb-8">
        {Array.from({ length: GRID_SIZE }).map((_, i) => {
          const isActive = phase === 'memorize' && activeBlocks.includes(i);
          const isSelected = selectedBlocks.includes(i);
          const isWrongSelection = phase === 'wrong' && !activeBlocks.includes(i) && activeBlocks.length > 0 /* wait, just style all red if wrong */;
          
          let blockClass = 'bg-[#1A1921] border-white/5';
          if (isActive) blockClass = 'bg-primary shadow-[0_0_15px_rgba(186,106,255,0.6)] border-primary scale-105';
          else if (isSelected) blockClass = 'bg-accent shadow-[0_0_15px_rgba(0,255,255,0.6)] border-accent';
          else if (phase === 'wrong') {
            if (activeBlocks.includes(i)) blockClass = 'bg-primary/50'; // Show what should have been clicked
            else blockClass = 'bg-destructive/20 border-destructive/50';
          }

          return (
            <div
              key={i}
              onClick={() => handleBlockClick(i)}
              className={`aspect-square rounded-xl cursor-pointer border transition-all duration-300 ${blockClass} 
                ${phase === 'recall' && !isSelected ? 'hover:bg-white/10 hover:scale-105 active:scale-95' : ''}
              `}
            />
          );
        })}
      </div>

      <div className="h-12 flex items-center justify-center">
        {phase === 'memorize' && (
          <div className="flex items-center gap-2 text-primary font-headline text-xl animate-pulse">
            <Eye className="w-6 h-6" /> Kataklarni eslab qoling!
          </div>
        )}
        {phase === 'recall' && (
          <div className="text-white font-headline text-xl">
            Yonib o'chgan kataklarni bosing ({activeBlocks.length - selectedBlocks.length} ta qoldi)
          </div>
        )}
        {phase === 'success' && (
          <div className="text-green-400 font-headline text-xl animate-in zoom-in">
            Ajoyib! Keyingi bosqich...
          </div>
        )}
        {phase === 'wrong' && (
          <div className="text-destructive font-headline text-xl animate-in zoom-in">
            Xato! Boshidan boshlaymiz.
          </div>
        )}
      </div>
    </div>
  );
}
