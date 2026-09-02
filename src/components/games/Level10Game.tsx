"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skull, RefreshCw, Trophy } from 'lucide-react';

export default function Level10Game({ onComplete }: { onComplete: () => void }) {
  const [cubeY, setCubeY] = useState(50);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState<{x: number, gapY: number, moving: boolean, dir: number}[]>([{ x: 100, gapY: 40, moving: false, dir: 1 }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playing, setPlaying] = useState(false);
  const requestRef = useRef<number | undefined>(undefined);

  const jump = () => {
    if (gameOver) {
      setCubeY(50);
      setVelocity(0);
      setObstacles([{ x: 100, gapY: 40, moving: false, dir: 1 }]);
      setScore(0);
      setGameOver(false);
      setPlaying(true);
    } else if (!playing) {
      setPlaying(true);
      setVelocity(-2.2); // Smoother jump
    } else {
      setVelocity(-2.2);
    }
  };

  useEffect(() => {
    if (score >= 10) {
      setPlaying(false);
      setTimeout(onComplete, 1500);
      return;
    }

    if (!playing || gameOver) return;

    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const deltaTime = time - lastTime;
      // Normalizing to ~60fps
      const timeScale = deltaTime / 16.66;
      lastTime = time;

      setCubeY(y => {
        const newY = y + velocity * timeScale;
        if (newY > 95 || newY < 0) setGameOver(true);
        return newY;
      });
      setVelocity(v => v + 0.12 * timeScale); // gravity

      setObstacles(prev => {
        const obs = [...prev];
        for (let i = 0; i < obs.length; i++) {
          obs[i].x -= 0.6 * timeScale; // move left
          
          // dynamic movement
          if (obs[i].moving) {
            obs[i].gapY += obs[i].dir * 0.2 * timeScale;
            if (obs[i].gapY < 10) obs[i].dir = 1;
            if (obs[i].gapY > 60) obs[i].dir = -1;
          }

          // Collision detection
          if (obs[i].x > 15 && obs[i].x < 25) { // Cube is at x=20
            if (cubeY < obs[i].gapY || cubeY > obs[i].gapY + 30) {
              setGameOver(true);
            }
          }
          if (Math.abs(obs[i].x - 20) < 0.3 && !gameOver) {
            setScore(s => s + 1);
          }
        }
        if (obs[0] && obs[0].x < -15) {
          obs.shift();
        }
        if (obs.length === 0 || obs[obs.length - 1].x < 60) {
          // New obstacle
          const isMoving = score >= 3 && Math.random() > 0.5; // Starts moving obstacles after score 3
          obs.push({ 
            x: 100, 
            gapY: Math.random() * 50 + 10,
            moving: isMoving,
            dir: Math.random() > 0.5 ? 1 : -1
          });
        }
        return obs;
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [playing, gameOver, velocity, cubeY, score, onComplete]);

  return (
    <div className="max-w-md mx-auto p-6 w-full flex flex-col items-center select-none">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center animate-pulse">
            <Skull className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-headline text-destructive drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">Final Boss</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Flappy Cube: 10 ta to'siqdan o'ting!</p>
          </div>
        </div>
        <div className="font-headline text-xl text-primary drop-shadow-[0_0_10px_rgba(186,106,255,0.5)]">
          {score}/10
        </div>
      </div>
      
      <div 
        className="w-full h-[450px] bg-[#0A0A10] rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] border border-destructive/20 cursor-[url('/tap.png'),_pointer]"
        onClick={jump}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Background Grid & Particles */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-destructive/10" />

        {!playing && !gameOver && score < 10 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 text-xl font-headline z-30 bg-black/60 backdrop-blur-sm animate-pulse">
            <span className="mb-2">BOSHLASH UCHUN</span>
            <span className="text-sm opacity-70">ekranga bosing</span>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive text-3xl font-headline z-30 bg-black/80 backdrop-blur-md">
            <Skull className="w-16 h-16 mb-4 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
            <span className="mb-4">YUTQAZDINGIZ</span>
            <Button variant="outline" className="border-destructive/50 hover:bg-destructive/20 text-white rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" /> Qayta urinish
            </Button>
          </div>
        )}
        
        {score >= 10 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-primary text-4xl font-headline z-30 bg-black/80 backdrop-blur-md">
            <Trophy className="w-20 h-20 mb-4 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-bounce" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">G'ALABA!</span>
          </div>
        )}
        
        {/* Player Cube */}
        <div 
          className="absolute w-8 h-8 rounded-xl z-20 flex items-center justify-center transition-transform"
          style={{ 
            left: '20%', 
            top: `${cubeY}%`, 
            transform: `rotate(${velocity * 15}deg)`,
            boxShadow: '0 0 20px rgba(186,106,255,0.8), inset 0 0 10px rgba(255,255,255,0.5)',
            background: 'linear-gradient(135deg, #BA6AFF, #3b82f6)'
          }}
        >
          <div className="w-2 h-2 bg-white rounded-full translate-x-1 -translate-y-1 opacity-80" />
        </div>

        {/* Obstacles */}
        {obstacles.map((obs, i) => (
          <React.Fragment key={i}>
            {/* Top Pillar */}
            <div 
              className="absolute top-0 w-12 sm:w-16 bg-gradient-to-b from-destructive/40 to-destructive/80 rounded-b-xl z-10 border-b border-l border-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
              style={{ left: `${obs.x}%`, height: `${obs.gapY}%` }} 
            >
              <div className="absolute bottom-0 w-full h-2 bg-destructive/50" />
            </div>
            
            {/* Bottom Pillar */}
            <div 
              className="absolute bottom-0 w-12 sm:w-16 bg-gradient-to-t from-destructive/40 to-destructive/80 rounded-t-xl z-10 border-t border-l border-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
              style={{ left: `${obs.x}%`, height: `${100 - (obs.gapY + 30)}%` }} 
            >
              <div className="absolute top-0 w-full h-2 bg-destructive/50" />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
