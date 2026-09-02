"use client"
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Timer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const WORDS = ['MAKTAB', 'BILIM', 'TALABA', 'DASTUR', 'ZAKOVAT', 'ALGORITM', 'TARMOQ'];

export default function Level2Game({ onComplete }: { onComplete: () => void }) {
  const [targetWord, setTargetWord] = useState('');
  const [letters, setLetters] = useState<{char: string, id: number}[]>([]);
  const [selected, setSelected] = useState<{char: string, id: number}[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isWrong, setIsWrong] = useState(false);

  useEffect(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(word);
    setLetters(word.split('').sort(() => Math.random() - 0.5).map((c, i) => ({char: c, id: i})));
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) { onComplete(); return; }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  useEffect(() => {
    if (targetWord && selected.length === targetWord.length) {
      if (selected.map(s => s.char).join('') === targetWord) {
        setTimeout(onComplete, 1000);
      } else {
        setIsWrong(true);
        setTimeout(() => {
          setSelected([]);
          setIsWrong(false);
        }, 800);
      }
    }
  }, [selected, targetWord, onComplete]);

  const handleSelect = (item: {char: string, id: number}) => {
    if (!selected.find(s => s.id === item.id)) {
      setSelected([...selected, item]);
    }
  };

  const handleClear = () => {
    setSelected([]);
    setIsWrong(false);
  };

  if (!targetWord) return null;

  return (
    <div className="max-w-md mx-auto p-6 w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-headline text-primary">So'zni Top!</h2>
          <p className="text-muted-foreground text-sm">Harflardan to'g'ri so'z tuzing</p>
        </div>
        <div className={`flex items-center gap-2 font-headline text-xl ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-accent'}`}>
          <Timer className="w-5 h-5" />
          {timeLeft}s
        </div>
      </div>
      
      <Progress value={(timeLeft / 45) * 100} className="h-2 mb-10 bg-white/5" />

      {/* Word Input Slots */}
      <div className={`flex gap-2 sm:gap-3 mb-12 ${isWrong ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        {Array.from({ length: targetWord.length }).map((_, i) => {
          const char = selected[i]?.char;
          return (
            <div 
              key={i} 
              className={`w-10 h-12 sm:w-14 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-headline rounded-xl border-2 transition-all duration-300
                ${char 
                  ? isWrong 
                    ? 'border-destructive bg-destructive/20 text-destructive' 
                    : selected.length === targetWord.length 
                      ? 'border-green-500 bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : 'border-primary bg-primary/10 text-white'
                  : 'border-white/10 bg-white/5 text-transparent'
                }`}
            >
              {char || ''}
            </div>
          );
        })}
      </div>

      {/* Scrambled Letters */}
      <div className="flex gap-3 flex-wrap justify-center w-full max-w-[300px]">
        {letters.map((item) => {
          const isSelected = selected.find(s => s.id === item.id);
          return (
            <Button 
              key={item.id} 
              onClick={() => handleSelect(item)} 
              disabled={!!isSelected}
              variant="outline"
              className={`w-14 h-14 sm:w-16 sm:h-16 text-2xl font-headline rounded-xl transition-all duration-300 ${
                isSelected 
                  ? 'opacity-0 scale-50' 
                  : 'opacity-100 hover:scale-110 hover:border-primary hover:text-primary hover:bg-primary/10 bg-[#1A1921] border-white/10'
              }`}
            >
              {item.char}
            </Button>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center w-full">
        <Button 
          variant="ghost" 
          onClick={handleClear}
          className="text-muted-foreground hover:text-white rounded-xl"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Tozalash
        </Button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-1deg); }
          75% { transform: translateX(5px) rotate(1deg); }
        }
      `}} />
    </div>
  );
}
