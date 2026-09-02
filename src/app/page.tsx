
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, saveUserProfile } from '@/lib/store';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, GraduationCap, Lock, Zap, BookOpen, Award, Check } from 'lucide-react';
import { GradeTier } from '@/lib/types';
import { getGradeTier, getTierTitle, getTierSubTitle } from '@/lib/curriculum';

export default function WelcomePage() {
  const router = useRouter();
  const db = useFirestore();

  const [name, setName] = useState('');
  const [selectedTier, setSelectedTier] = useState<GradeTier>('junior');
  const [selectedGradeNum, setSelectedGradeNum] = useState<number>(5);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [nameError, setNameError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);

  // When tier changes, default grade number to tier start
  const handleTierSelect = (tier: GradeTier) => {
    setSelectedTier(tier);
    if (tier === 'junior') setSelectedGradeNum(5);
    else if (tier === 'middle') setSelectedGradeNum(8);
    else if (tier === 'senior') setSelectedGradeNum(10);
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Iltimos, ismingizni kiriting!");
      return;
    }
    setNameError('');

    const formattedGrade = `${selectedGradeNum}-${selectedSection}`;
    const calculatedTier = getGradeTier(selectedGradeNum);

    const profileData = {
      name: trimmedName,
      grade: formattedGrade,
      gradeLevel: selectedGradeNum,
      gradeTier: calculatedTier,
      classLetter: selectedSection,
      currentLevel: 1,
      totalScore: 0,
      completedLevels: [],
      averageScore: 0,
      totalTime: 0,
      lastActive: new Date().toISOString()
    };

    // Save to LocalStorage
    saveUserProfile(profileData as any);

    // Save to Firestore
    if (db) {
      const tempId = trimmedName.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now();
      localStorage.setItem('firebase_user_id', tempId);
      
      setDoc(doc(db, 'users', tempId), {
        ...profileData,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      }, { merge: true }).catch(err => console.error("Firestore user save error:", err));
    }

    router.push('/dashboard');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0E13] text-primary">
      <div className="animate-pulse font-headline text-2xl">Yuklanmoqda...</div>
    </div>
  );

  const tierGradesMap: Record<GradeTier, number[]> = {
    junior: [5, 6, 7],
    middle: [8, 9],
    senior: [10, 11]
  };

  const formattedGradeDisplay = `${selectedGradeNum}-${selectedSection}`;
  const headerTitle = getTierTitle(selectedTier);
  const headerSubtitle = getTierSubTitle(selectedTier);

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0F0E13] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-[500px] bg-[#1A1921] border-white/5 shadow-2xl relative z-10 p-4 sm:p-6 rounded-3xl">
        <CardHeader className="text-center pb-2 pt-6">
          <div className="w-16 h-16 bg-[#2D2A38] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-[0_0_20px_rgba(186,106,255,0.2)]">
            {selectedTier === 'junior' && <GraduationCap className="w-8 h-8 text-primary" />}
            {selectedTier === 'middle' && <Zap className="w-8 h-8 text-accent" />}
            {selectedTier === 'senior' && <Award className="w-8 h-8 text-emerald-400" />}
          </div>

          <CardTitle key={selectedTier} className="text-2xl sm:text-3xl font-headline text-primary mb-2 transition-all duration-300 animate-in fade-in zoom-in-95">
            {headerTitle}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs sm:text-sm">
            {headerSubtitle}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleStart} className="space-y-6">
            {/* Student Name */}
            <div className="space-y-2">
              <label className="text-xs font-headline text-muted-foreground uppercase tracking-wider block">To'liq ismingiz</label>
              <Input
                placeholder="Masalan: Ali Valiev"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                className={`bg-[#24232C] h-12 text-white placeholder:text-muted-foreground/40 rounded-xl transition-colors ${
                  nameError ? 'border-destructive focus-visible:ring-destructive' : 'border-white/5 focus:border-primary/50'
                }`}
              />
              {nameError && (
                <p className="text-xs text-destructive flex items-center gap-1 font-medium animate-in fade-in">
                  ⚠️ {nameError}
                </p>
              )}
            </div>
            
            {/* Tier Category Selector (3 Segmented Tiers) */}
            <div className="space-y-2">
              <label className="text-xs font-headline text-muted-foreground uppercase tracking-wider block">Ta'lim Basqichi (Liga)</label>
              <div className="grid grid-cols-3 gap-2 bg-[#24232C] p-1.5 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => handleTierSelect('junior')}
                  className={`py-2.5 px-2 text-xs font-headline rounded-xl transition-all flex flex-col items-center gap-1 ${
                    selectedTier === 'junior' 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <span>5–7-sinflar</span>
                  <span className="text-[10px] opacity-75 font-sans">Kichik Maktab</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTierSelect('middle')}
                  className={`py-2.5 px-2 text-xs font-headline rounded-xl transition-all flex flex-col items-center gap-1 ${
                    selectedTier === 'middle' 
                      ? 'bg-accent text-accent-foreground shadow-md' 
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <span>8–9-sinflar</span>
                  <span className="text-[10px] opacity-75 font-sans">O'rta Maktab</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTierSelect('senior')}
                  className={`py-2.5 px-2 text-xs font-headline rounded-xl transition-all flex flex-col items-center gap-1 ${
                    selectedTier === 'senior' 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <span>10–11-sinflar</span>
                  <span className="text-[10px] opacity-75 font-sans">DTM Exam</span>
                </button>
              </div>
            </div>

            {/* Sinf raqami & Sinf harfi Selector */}
            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              {/* Grade Number Pills */}
              <div className="space-y-2">
                <label className="text-[11px] font-headline text-muted-foreground uppercase tracking-wider block">Sinf Raqami</label>
                <div className="flex gap-2 flex-wrap">
                  {tierGradesMap[selectedTier].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGradeNum(g)}
                      className={`h-10 w-10 font-headline text-sm rounded-xl transition-all flex items-center justify-center ${
                        selectedGradeNum === g 
                          ? 'bg-primary text-primary-foreground font-bold shadow-md scale-105' 
                          : 'bg-[#24232C] text-muted-foreground hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Letter Pills */}
              <div className="space-y-2">
                <label className="text-[11px] font-headline text-muted-foreground uppercase tracking-wider block">Guruhi / Harfi</label>
                <div className="flex gap-1.5 flex-wrap">
                  {['A', 'B', 'V', 'G', 'D'].map((letter) => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setSelectedSection(letter)}
                      className={`h-10 w-9 font-headline text-xs rounded-xl transition-all flex items-center justify-center ${
                        selectedSection === letter 
                          ? 'bg-accent text-accent-foreground font-bold shadow-md scale-105' 
                          : 'bg-[#24232C] text-muted-foreground hover:text-white'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Tanlangan sinf: <span className="font-headline text-white text-sm bg-white/5 px-3 py-1 rounded-lg border border-white/10 ml-1">{formattedGradeDisplay}</span>
            </div>

            <Button type="submit" className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
              {selectedTier === 'senior' ? 'DTM Simulyatsiyasini Boshlash' : 'O\'yinni Boshlash'}
              <Rocket className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Login Shortcut */}
      <button
        onClick={() => router.push('/admin')}
        className="absolute bottom-6 right-6 flex items-center gap-2 text-[11px] font-medium text-muted-foreground/40 hover:text-muted-foreground transition-all duration-300 group"
      >
        <Lock className="w-3 h-3 opacity-50 group-hover:opacity-100" />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">O'qituvchi boshqaruvi</span>
        Admin
      </button>
    </main>
  );
}
