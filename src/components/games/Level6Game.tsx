"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { Rabbit, Bomb, Hammer, Timer } from 'lucide-react';

type Entity = 'mole' | 'bomb' | null;

export default function Level6Game({ onComplete }: { onComplete: () => void }) {
  const [holes, setHoles] = useState<Entity[]>(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isHit, setIsHit] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (score >= 15) {
      setTimeout(onComplete, 500);
      return;
    }
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [score, timeLeft, onComplete]);

  useEffect(() => {
    if (score >= 15 || timeLeft <= 0) return;

    // Spawner
    const spawnSpeed = Math.max(400, 1000 - score * 30); // gets faster
    const spawner = setInterval(() => {
      setHoles(prev => {
        const newHoles = [...prev];
        const emptyIndices = newHoles.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
        
        if (emptyIndices.length > 0) {
          const spawnCount = score > 10 ? 2 : 1;
          for (let i = 0; i < spawnCount; i++) {
            if (emptyIndices.length > 0) {
              const idx = emptyIndices.splice(Math.floor(Math.random() * emptyIndices.length), 1)[0];
              const type: Entity = Math.random() > 0.75 ? 'bomb' : 'mole'; // 25% chance bomb
              newHoles[idx] = type;
            }
          }
        }
        return newHoles;
      });
    }, spawnSpeed);

    // Despawner
    const despawner = setInterval(() => {
      setHoles(prev => {
        const newHoles = [...prev];
        // clear some randomly
        const filled = newHoles.map((v, i) => v !== null ? i : null).filter(v => v !== null) as number[];
        if (filled.length > 0 && Math.random() > 0.5) {
          const idx = filled[Math.floor(Math.random() * filled.length)];
          newHoles[idx] = null;
        }
        return newHoles;
      });
    }, spawnSpeed * 0.8);

    return () => {
      clearInterval(spawner);
      clearInterval(despawner);
    };
  }, [score, timeLeft]);

  const whack = (index: number, type: Entity) => {
    if (type === 'mole') {
      setScore(s => s + 1);
      setHoles(prev => { const n = [...prev]; n[index] = null; return n; });
      setIsHit(index);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsHit(null), 200);
    } else if (type === 'bomb') {
      setScore(s => Math.max(0, s - 3)); // Bomb penalty
      setHoles(prev => { const n = [...prev]; n[index] = null; return n; });
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 400);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 w-full flex flex-col items-center transition-transform ${isWrong ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Hammer className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-headline text-white">Ayyor Quyoncha</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Quyonlarni uring, bombalarga tegmang!</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 sm:gap-2 font-headline text-lg sm:text-xl ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-accent'}`}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>

      <div className="w-full flex items-center gap-4 mb-10">
        <Progress value={(score / 15) * 100} className="h-3 flex-1 bg-white/5" />
        <span className="font-headline text-primary">{score}/15</span>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[300px] cursor-[url('/hammer.png'),_pointer]">
        {holes.map((entity, i) => (
          <div 
            key={i} 
            className={`aspect-square bg-[#1A1921] border border-white/5 rounded-full relative overflow-hidden flex items-end justify-center 
              ${entity ? 'cursor-pointer' : ''} ${isHit === i ? 'bg-primary/20' : ''}
            `} 
            onClick={() => whack(i, entity)}
          >
            {/* Dirt Hole */}
            <div className="absolute bottom-0 w-full h-1/3 bg-black/40 rounded-[100%] scale-110 z-10" />
            
            {/* Entity */}
            <div className={`w-3/4 h-3/4 rounded-t-full transition-all duration-200 z-0 flex items-center justify-center
              ${entity ? 'translate-y-0' : 'translate-y-full opacity-0'}
              ${entity === 'bomb' ? 'bg-destructive shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_15px_rgba(186,106,255,0.3)]'}
            `}>
              {entity === 'bomb' ? (
                <Bomb className="w-8 h-8 text-white animate-pulse" />
              ) : (
                <Rabbit className="w-10 h-10 text-white mb-2" />
              )}
            </div>

            {/* Hit Effect */}
            {isHit === i && (
              <div className="absolute inset-0 bg-white/30 z-20 animate-in fade-in zoom-in-50 duration-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
