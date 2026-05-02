
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, saveUserProfile } from '@/lib/store';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, GraduationCap, Lock } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const db = useFirestore();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('5-Sinf');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profileData = {
      name,
      grade,
      currentLevel: 1,
      totalScore: 0,
      completedLevels: [],
      averageScore: 0,
      totalTime: 0,
      lastActive: new Date().toISOString()
    };

    // Save to LocalStorage
    saveUserProfile(profileData);

    // Save to Firestore (Anonymous user simulation using name+timestamp as ID if not authenticated)
    if (db) {
      const tempId = name.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();
      localStorage.setItem('firebase_user_id', tempId);
      
      setDoc(doc(db, 'users', tempId), {
        ...profileData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      }, { merge: true });
    }

    router.push('/dashboard');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0E13] text-primary">
      <div className="animate-pulse font-headline text-2xl">Yuklanmoqda...</div>
    </div>
  );

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0F0E13] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-[440px] bg-[#1A1921] border-white/5 shadow-2xl relative z-10 p-4">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="w-16 h-16 bg-[#2D2A38] rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary mb-2">5-sinflar test o'yini</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Sarguzashtingizni boshlash uchun ismingizni kiriting
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-8">
          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[13px] font-medium text-muted-foreground block">To'liq ismingiz</label>
              <Input
                placeholder="Masalan: Ali Valiev"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#24232C] border-white/5 h-12 text-white placeholder:text-muted-foreground/50 focus:border-primary/50 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[13px] font-medium text-muted-foreground block">Sinfingiz</label>
              <div className="flex gap-3">
                {['5-Sinf', '6-Sinf'].map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant="ghost"
                    onClick={() => setGrade(g)}
                    className={`flex-1 h-12 font-headline rounded-xl transition-all ${
                      grade === g 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'bg-[#24232C] text-muted-foreground hover:bg-[#2D2C36] hover:text-white border border-transparent'
                    }`}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
              O'yinni Boshlash
              <Rocket className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Login Shortcut - Subtle and positioned in bottom right */}
      <button
        onClick={() => router.push('/admin')}
        className="absolute bottom-6 right-6 flex items-center gap-2 text-[11px] font-medium text-muted-foreground/30 hover:text-muted-foreground/80 transition-all duration-300 group"
      >
        <Lock className="w-3 h-3 opacity-50 group-hover:opacity-100" />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">O'qituvchi uchun</span>
        Admin
      </button>
    </main>
  );
}
