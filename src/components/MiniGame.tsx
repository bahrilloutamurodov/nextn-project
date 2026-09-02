"use client"
import React from 'react';
import Level1Game from './games/Level1Game';
import Level2Game from './games/Level2Game';
import Level3Game from './games/Level3Game';
import Level4Game from './games/Level4Game';
import Level5Game from './games/Level5Game';
import Level6Game from './games/Level6Game';
import Level7Game from './games/Level7Game';
import Level8Game from './games/Level8Game';
import Level9Game from './games/Level9Game';
import Level10Game from './games/Level10Game';

interface MiniGameProps {
  onComplete: () => void;
  levelId: number;
}

export function MiniGame({ onComplete, levelId }: MiniGameProps) {
  switch (levelId) {
    case 1: return <Level1Game onComplete={onComplete} />;
    case 2: return <Level2Game onComplete={onComplete} />;
    case 3: return <Level3Game onComplete={onComplete} />;
    case 4: return <Level4Game onComplete={onComplete} />;
    case 5: return <Level5Game onComplete={onComplete} />;
    case 6: return <Level6Game onComplete={onComplete} />;
    case 7: return <Level7Game onComplete={onComplete} />;
    case 8: return <Level8Game onComplete={onComplete} />;
    case 9: return <Level9Game onComplete={onComplete} />;
    case 10: return <Level10Game onComplete={onComplete} />;
    default: return <Level1Game onComplete={onComplete} />;
  }
}
