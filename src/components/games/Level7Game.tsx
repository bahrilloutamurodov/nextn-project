"use client"
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Apple, Brain, Target } from 'lucide-react';

export default function Level7Game({ onComplete }: { onComplete: () => void }) {
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState({ q: '2 + 2', a: 4 });
  const [apples, setApples] = useState<{ id: number, x: number, y: number, value: number }[]>([]);
  const [isWrong, setIsWrong] = useState(false);

  const generateQuestion = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, q, ans;
    
    if (op === '+') {
      a = Math.floor(Math.random() * 20);
      b = Math.floor(Math.random() * 20);
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * a); // ensure positive
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 10);
      b = Math.floor(Math.random() * 5);
      ans = a * b;
    }
    
    setQuestion({ q: `${a} ${op} ${b}`, a: ans });
  };

  useEffect(() => {
    generateQuestion();
  }, []);

  useEffect(() => {
    if (score >= 10) {
      setTimeout(onComplete, 500);
      return;
    }
  }, [score, onComplete]);

  useEffect(() => {
    if (score >= 10) return;
    const spawnRate = Math.max(800, 2000 - score * 100);
    const spawner = setInterval(() => {
      setApples(prev => [
        ...prev,
        { 
          id: Date.now(), 
          x: Math.random() * 80 + 10, 
          y: -10, 
          // 30% chance for correct answer, otherwise random number close to correct answer
          value: Math.random() > 0.7 ? question.a : question.a + Math.floor(Math.random() * 10) - 5 + (Math.random() > 0.5 ? 1 : 0)
        }
      ]);
    }, spawnRate);
    return () => clearInterval(spawner);
  }, [question, score]);

  useEffect(() => {
    if (score >= 10) return;
    const fallSpeed = Math.max(20, 50 - score * 2);
    const mover = setInterval(() => {
      setApples(prev => prev.map(ap => ({ ...ap, y: ap.y + 1 })).filter(ap => ap.y < 110));
    }, fallSpeed);
    return () => clearInterval(mover);
  }, [score]);

  const catchApple = (val: number, id: number) => {
    if (val === question.a) {
      setScore(s => s + 1);
      setApples([]); // Clear apples on correct answer
      generateQuestion();
    } else {
      setApples(prev => prev.filter(ap => ap.id !== id)); // Remove wrong apple
      setScore(s => Math.max(0, s - 1)); // Penalty
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 400);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-6 w-full flex flex-col items-center transition-transform ${isWrong ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-headline text-white">To'g'ri Javobni Tut!</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Matematik ifodaning javobini ushlang</p>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center gap-4 mb-6">
        <Progress value={(score / 10) * 100} className="h-3 flex-1 bg-white/5" />
        <span className="font-headline text-primary">{score}/10</span>
      </div>

      <div className="text-5xl sm:text-7xl font-headline mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent drop-shadow-lg">
        {question.q} = ?
      </div>
      
      <div className="w-full h-[400px] bg-[#1A1921] border-2 border-white/5 rounded-3xl relative overflow-hidden shadow-inner">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {apples.map(ap => (
          <div
            key={ap.id}
            onClick={() => catchApple(ap.value, ap.id)}
            className="absolute w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform group"
            style={{ left: `${ap.x}%`, top: `${ap.y}%` }}
          >
            <div className="absolute inset-0 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] z-0" />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-3 bg-green-600 rounded-full z-10 origin-bottom -rotate-12" />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-green-500 rounded-full z-10 origin-bottom-left rotate-12 rounded-bl-none" />
            <span className="relative z-20 text-white font-headline text-lg sm:text-xl drop-shadow-md">
              {ap.value}
            </span>
          </div>
        ))}
        
        {/* Catcher line indication */}
        <div className="absolute bottom-0 w-full h-1 bg-destructive/50" />
      </div>
    </div>
  );
}
