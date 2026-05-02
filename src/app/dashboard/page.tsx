"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, getLevels } from '@/lib/store';
import { Level } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle2, Star, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function LevelMapPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const p = getUserProfile();
    if (!p) {
      router.push('/');
      return;
    }
    setProfile(p);
    setLevels(getLevels());
  }, [router]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-12">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px]" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-xl text-white">{profile.name}</h1>
            <p className="text-xs text-muted-foreground">{profile.grade}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Jami Ball</span>
            <span className="text-xl font-headline text-accent">{profile.totalScore}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => {
            localStorage.clear();
            router.push('/');
          }}>
            <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-headline text-primary mb-4">EduQuest Xaritasi</h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Star className="w-4 h-4 text-accent" />
            <span>Bosqichlarni yakunlang va yangi marralarni zabt eting!</span>
          </div>
        </div>

        {/* Level Map Grid/Path */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {levels.map((level, idx) => {
            const isUnlocked = level.unlocked;
            const isCompleted = level.completed;

            return (
              <Link 
                key={level.id} 
                href={isUnlocked ? `/quiz/${level.id}` : '#'}
                className={`group relative ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`p-6 rounded-3xl border-2 transition-all duration-300 h-full flex flex-col items-center justify-between text-center min-h-[220px] ${
                  isUnlocked 
                    ? 'bg-card border-primary/20 hover:border-primary hover:scale-105 hover:shadow-[0_0_25px_rgba(186,106,255,0.15)]' 
                    : 'bg-card/40 border-white/5 opacity-60'
                }`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    isUnlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isUnlocked ? (
                      isCompleted ? <CheckCircle2 className="w-8 h-8" /> : <span className="text-2xl font-headline">{level.id}</span>
                    ) : (
                      <Lock className="w-8 h-8" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-headline text-xl mb-1">{level.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{level.description}</p>
                  </div>

                  <div className="w-full mt-6">
                    {isCompleted ? (
                      <div className="text-accent font-headline">Natija: {level.highScore}%</div>
                    ) : (
                      <div className={`text-xs uppercase tracking-widest ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isUnlocked ? 'Boshlash' : 'Qulflangan'}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
