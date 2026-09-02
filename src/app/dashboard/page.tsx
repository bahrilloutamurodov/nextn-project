"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, getLevels } from '@/lib/store';
import { Level } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Lock, CheckCircle2, Star, User, LogOut, ShieldCheck, Trophy, Sparkles, Medal } from 'lucide-react';
import Link from 'next/link';

export default function LevelMapPage() {
  const router = useRouter();
  const db = useFirestore();
  const [levels, setLevels] = useState<Level[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardUsers, setLeaderboardUsers] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  useEffect(() => {
    const p = getUserProfile();
    if (!p) {
      router.push('/');
      return;
    }
    setProfile(p);
    setLevels(getLevels());
  }, [router]);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      if (db) {
        const q = query(collection(db, 'users'), orderBy('totalScore', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        const usersList: any[] = [];
        snapshot.forEach(doc => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        if (usersList.length > 0) {
          setLeaderboardUsers(usersList);
          setLoadingLeaderboard(false);
          return;
        }
      }
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
    }
    
    // Fallback to local profile
    if (profile) {
      setLeaderboardUsers([
        { id: '1', name: profile.name, grade: profile.grade, totalScore: profile.totalScore },
        { id: '2', name: 'Zuhra Aliyeva', grade: '5-Sinf', totalScore: 320 },
        { id: '3', name: 'Jasur Karimov', grade: '5-Sinf', totalScore: 280 },
        { id: '4', name: 'Malika Sobirova', grade: '6-Sinf', totalScore: 240 },
        { id: '5', name: 'Bekzod Rahimov', grade: '5-Sinf', totalScore: 210 },
      ].sort((a, b) => b.totalScore - a.totalScore));
    }
    setLoadingLeaderboard(false);
  };

  const handleOpenLeaderboard = () => {
    setShowLeaderboard(true);
    fetchLeaderboard();
  };

  const getStarCount = (score: number) => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  const renderStars = (starCount: number) => {
    return (
      <div className="flex items-center justify-center gap-1 my-1">
        {[1, 2, 3].map((starIndex) => (
          <Star
            key={starIndex}
            className={`w-4 h-4 ${
              starIndex <= starCount
                ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]'
                : 'text-white/20'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!profile) return null;

  const headerTitle = `${(profile.grade || '5-Sinf').replace('-Sinf', '')}-sinflar test o'yini`;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-12">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent/10 rounded-full blur-[100px]" />

      {/* Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="font-headline text-lg sm:text-xl text-white">{profile.name}</h1>
            <p className="text-xs text-muted-foreground">{profile.grade}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            onClick={handleOpenLeaderboard} 
            variant="outline" 
            className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 font-headline text-xs sm:text-sm h-9 px-3 sm:px-4 rounded-xl flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">Top O'quvchilar</span>
          </Button>

          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Jami Ball</span>
            <span className="text-lg font-headline text-accent">{profile.totalScore}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} title="Admin Panel">
              <ShieldCheck className="w-5 h-5 text-muted-foreground hover:text-primary" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => {
              localStorage.clear();
              router.push('/');
            }} title="Chiqish">
              <LogOut className="w-5 h-5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-headline text-primary mb-3">{headerTitle}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Bosqichlarni yakunlang va yangi marralarni zabt eting!</span>
          </div>
        </div>

        {/* Level Map Grid/Path */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {levels.map((level, idx) => {
            const isUnlocked = level.unlocked;
            const isCompleted = level.completed;
            const starCount = isCompleted ? getStarCount(level.highScore || 0) : 0;

            return (
              <Link 
                key={level.id} 
                href={isUnlocked ? `/quiz/${level.id}` : '#'}
                className={`group relative ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
              >
                <div className={`p-6 rounded-3xl border-2 transition-all duration-300 h-full flex flex-col items-center justify-between text-center min-h-[240px] ${
                  isUnlocked 
                    ? 'bg-card border-primary/20 hover:border-primary hover:scale-105 hover:shadow-[0_0_25px_rgba(186,106,255,0.15)]' 
                    : 'bg-card/40 border-white/5 opacity-65'
                }`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                    isUnlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isUnlocked ? (
                      isCompleted ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <span className="text-2xl font-headline">{level.id}</span>
                    ) : (
                      <Lock className="w-8 h-8 text-muted-foreground/70" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-headline text-xl mb-1">{level.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{level.description}</p>
                  </div>

                  {/* Stars and percentage */}
                  <div className="w-full mt-4 flex flex-col items-center">
                    {isCompleted ? (
                      <>
                        {renderStars(starCount)}
                        <Badge variant="outline" className="mt-1 border-accent/30 bg-accent/10 text-accent font-headline text-xs px-2.5 py-0.5">
                          {level.highScore}%
                        </Badge>
                      </>
                    ) : isUnlocked ? (
                      <div className="text-xs uppercase tracking-widest text-primary font-medium mt-2">
                        Boshlash
                      </div>
                    ) : (
                      <div className="mt-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                        <span>Ochilish uchun: {level.id - 1}-bosqichdan ≥ 70%</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      {/* Leaderboard Modal */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="bg-[#1A1921] border-white/10 text-white max-w-md rounded-2xl p-6">
          <DialogHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <DialogTitle className="text-2xl font-headline text-accent">Top O'quvchilar</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Eng yuqori ball to'plagan eng kuchli 10 nafar o'quvchi
            </DialogDescription>
          </DialogHeader>

          {loadingLeaderboard ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse font-headline">
              Natijalar yuklanmoqda...
            </div>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {leaderboardUsers.map((user, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                const medalColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-amber-600' : 'text-muted-foreground';

                return (
                  <div 
                    key={user.id || index}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isTop3 
                        ? 'bg-white/5 border-primary/20' 
                        : 'bg-[#24232C]/50 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-headline text-sm ${isTop3 ? 'bg-white/10' : 'bg-black/20'}`}>
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>
                      <div>
                        <div className="font-headline text-sm text-white flex items-center gap-1.5">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{user.grade || '5-Sinf'}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-headline text-accent text-sm">{user.totalScore || 0} ball</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
