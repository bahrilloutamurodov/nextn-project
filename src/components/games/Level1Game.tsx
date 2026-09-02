"use client"
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Timer, BrainCircuit, Rocket, Trophy, Target, Star, Zap, Flame, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const ICONS = [BrainCircuit, Rocket, Trophy, Target, Star, Zap, Flame, Crown];
const CARDS = [...ICONS, ...ICONS].map((Icon, idx) => ({ id: idx, Icon })).sort(() => Math.random() - 0.5);

export default function Level1Game({ onComplete }: { onComplete: () => void }) {
  const [cards, setCards] = useState(CARDS);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) { 
      // Failed? For now we just call onComplete if they fail? 
      // Actually if they fail, they shouldn't pass. But the original code called onComplete even if they failed.
      // Wait, in QuizPage `handleMiniGameComplete` gives them the score. 
      // Let's make it so they have to win.
      // But the original code: `if (timeLeft <= 0) { onComplete(); return; }`
      // I'll keep the original behavior for now, but maybe show a fail state if we had one. 
      onComplete(); 
      return; 
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].Icon === cards[second].Icon) {
        setSolved([...solved, first, second]);
        setFlipped([]);
      } else {
        const timeout = setTimeout(() => setFlipped([]), 800);
        return () => clearTimeout(timeout);
      }
    }
  }, [flipped, cards, solved]);

  useEffect(() => {
    if (solved.length === cards.length && cards.length > 0) { 
      setTimeout(onComplete, 1000); 
    }
  }, [solved, cards.length, onComplete]);

  const handleCardClick = (index: number) => {
    if (flipped.length < 2 && !flipped.includes(index) && !solved.includes(index)) {
      setFlipped([...flipped, index]);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-headline text-primary">Xotira O'yini</h2>
          <p className="text-muted-foreground text-sm">Bir xil belgilarni toping</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`flex items-center gap-2 font-headline text-xl ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-accent'}`}>
            <Timer className="w-5 h-5" />
            {timeLeft}s
          </div>
        </div>
      </div>
      
      <Progress value={(timeLeft / 60) * 100} className="h-2 mb-8 bg-white/5" />

      <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full perspective-1000">
        {cards.map((item, index) => {
          const isFlipped = flipped.includes(index) || solved.includes(index);
          const Icon = item.Icon;
          return (
            <div 
              key={index} 
              onClick={() => handleCardClick(index)} 
              className="relative aspect-square cursor-pointer group"
              style={{ perspective: '1000px' }}
            >
              <div 
                className="w-full h-full transition-all duration-500 rounded-xl"
                style={{ 
                  transformStyle: 'preserve-3d', 
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)' 
                }}
              >
                {/* Front (Hidden) */}
                <Card className="absolute inset-0 backface-hidden w-full h-full flex items-center justify-center bg-secondary/50 border-white/5 group-hover:bg-secondary transition-colors">
                  <div className="w-1/3 h-1/3 rounded-full bg-white/10" />
                </Card>
                
                {/* Back (Revealed) */}
                <Card 
                  className={`absolute inset-0 w-full h-full flex items-center justify-center ${solved.includes(index) ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(186,106,255,0.3)]' : 'bg-white/10 border-white/20 text-white'}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <Icon className="w-8 h-8 sm:w-10 sm:h-10 animate-in zoom-in duration-300" />
                </Card>
              </div>
            </div>
          );
        })}
      </div>
      {solved.length === cards.length && (
        <div className="mt-8 text-xl font-headline text-primary animate-in fade-in slide-in-from-bottom-4">
          Ajoyib natija! ✨
        </div>
      )}
    </div>
  );
}
