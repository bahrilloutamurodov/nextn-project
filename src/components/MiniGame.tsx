"use client"

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, RefreshCw } from 'lucide-react';

interface MiniGameProps {
  onComplete: () => void;
}

const ITEMS = ['A+', '100', 'Uz', 'En', '∑', 'H', 'π', 'Ω'];
const CARDS = [...ITEMS, ...ITEMS].sort(() => Math.random() - 0.5);

export function MiniGame({ onComplete }: MiniGameProps) {
  const [cards, setCards] = useState(CARDS);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete(); // Game over, proceed anyway or handle failure
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        setSolved([...solved, first, second]);
        setFlipped([]);
      } else {
        const timeout = setTimeout(() => setFlipped([]), 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [flipped, cards, solved]);

  useEffect(() => {
    if (solved.length === cards.length) {
      setTimeout(onComplete, 500);
    }
  }, [solved, cards.length, onComplete]);

  const handleCardClick = (index: number) => {
    if (flipped.length < 2 && !flipped.includes(index) && !solved.includes(index)) {
      setFlipped([...flipped, index]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-headline text-primary">Memory Match</h2>
        <div className="flex items-center gap-2 text-accent font-headline text-xl">
          <Timer className="w-6 h-6" />
          {timeLeft}s
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((item, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(index)}
            className={`aspect-square cursor-pointer rounded-xl transition-all duration-300 transform perspective-1000 ${
              flipped.includes(index) || solved.includes(index)
                ? 'rotate-y-180'
                : ''
            }`}
          >
            <Card className={`w-full h-full flex items-center justify-center text-3xl font-headline transition-all ${
              flipped.includes(index) || solved.includes(index)
                ? 'bg-primary text-white'
                : 'bg-secondary hover:bg-secondary/80'
            }`}>
              {(flipped.includes(index) || solved.includes(index)) ? item : '?'}
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-muted-foreground">
        Hamma juftliklarni topsangiz, keyingi bosqich ochiladi!
      </div>
    </div>
  );
}
