"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, RotateCcw } from 'lucide-react';

type Player = 'X' | 'O' | null;

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(board: Player[]) {
  for (let i = 0; i < WIN_LINES.length; i++) {
    const [a, b, c] = WIN_LINES[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: WIN_LINES[i] };
    }
  }
  return null;
}

// Simple heuristic AI that tries to win or block, otherwise random
function getBestMove(board: Player[]): number {
  const emptyIndices = board.map((v, i) => v === null ? i : null).filter(v => v !== null) as number[];
  
  // 1. Try to win
  for (let i of emptyIndices) {
    const b = [...board]; b[i] = 'O';
    if (checkWinner(b)?.winner === 'O') return i;
  }
  // 2. Block X from winning
  for (let i of emptyIndices) {
    const b = [...board]; b[i] = 'X';
    if (checkWinner(b)?.winner === 'X') return i;
  }
  // 3. Take center if available (70% chance to be smart)
  if (emptyIndices.includes(4) && Math.random() > 0.3) return 4;
  
  // 4. Random move
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

export default function Level4Game({ onComplete }: { onComplete: () => void }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winState, setWinState] = useState<{winner: Player, line: number[]} | null>(null);

  useEffect(() => {
    if (!isXNext && !winState) {
      const timer = setTimeout(() => {
        const move = getBestMove(board);
        if (move !== undefined) {
          const newBoard = [...board];
          newBoard[move] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
          const w = checkWinner(newBoard);
          if (w) setWinState(w);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, winState]);

  const isDraw = !winState && board.every(s => s !== null);

  useEffect(() => {
    if (winState?.winner === 'X') {
      setTimeout(onComplete, 1500);
    } else if (winState?.winner === 'O' || isDraw) {
      setTimeout(() => {
        setBoard(Array(9).fill(null));
        setWinState(null);
        setIsXNext(true);
      }, 1500);
    }
  }, [winState, isDraw, onComplete]);

  const handleClick = (i: number) => {
    if (board[i] || winState || !isXNext) return;
    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
    const w = checkWinner(newBoard);
    if (w) setWinState(w);
  };

  return (
    <div className="max-w-md mx-auto p-6 w-full flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-headline text-white">Tic-Tac-Toe</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">AIni yengib keyingi bosqichga o'ting!</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-[300px] mb-8 relative">
        {board.map((square, i) => {
          const isWinningSquare = winState?.line.includes(i);
          return (
            <div 
              key={i} 
              onClick={() => handleClick(i)}
              className={`aspect-square flex items-center justify-center rounded-2xl cursor-pointer text-5xl font-headline transition-all duration-300
                ${square 
                  ? square === 'X' 
                    ? 'text-primary bg-primary/10 shadow-[inset_0_0_20px_rgba(186,106,255,0.1)]' 
                    : 'text-destructive bg-destructive/10 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]'
                  : 'bg-white/5 hover:bg-white/10'
                }
                ${isWinningSquare ? 'ring-2 ring-white scale-105 z-10' : ''}
                ${!isXNext && !square ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className={`transition-transform duration-300 ${square ? 'scale-100' : 'scale-0'}`}>
                {square}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-12 flex items-center justify-center">
        {winState?.winner === 'X' ? (
          <div className="flex items-center gap-2 text-green-400 font-headline text-xl animate-in fade-in slide-in-from-bottom-2">
            <Trophy className="w-6 h-6" /> Siz Yutdingiz!
          </div>
        ) : winState?.winner === 'O' ? (
          <div className="text-destructive font-headline text-xl animate-in fade-in zoom-in">
            Kompyuter Yutdi! Qayta urinib ko'ring.
          </div>
        ) : isDraw ? (
          <div className="flex items-center gap-2 text-yellow-400 font-headline text-xl animate-in fade-in zoom-in">
            <RotateCcw className="w-5 h-5" /> Durang! Qayta boshlanmoqda...
          </div>
        ) : (
          <div className="text-muted-foreground text-sm sm:text-base animate-pulse">
            {isXNext ? "Sizning navbatingiz (X)" : "Kompyuter o'ylamoqda..."}
          </div>
        )}
      </div>
    </div>
  );
}
