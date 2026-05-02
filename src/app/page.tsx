"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, saveUserProfile } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, GraduationCap, ChevronRight } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
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

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveUserProfile({
      name,
      grade,
      currentLevel: 1,
      totalScore: 0,
      completedLevels: [],
      averageScore: 0,
      totalTime: 0
    });

    router.push('/dashboard');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Yuklanmoqda...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <Card className="w-full max-w-lg glass-card border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-headline text-primary">EduQuest Ascent</CardTitle>
          <CardDescription className="text-lg">
            Sarguzashtingizni boshlash uchun ismingizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">To'liq ismingiz</label>
              <Input
                placeholder="Masalan: Ali Valiev"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-white/10 h-12 text-lg focus:ring-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground ml-1">Sinfingiz</label>
              <div className="flex gap-2">
                {['5-Sinf', '6-Sinf'].map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant={grade === g ? "default" : "outline"}
                    onClick={() => setGrade(g)}
                    className={`flex-1 h-12 font-headline ${grade === g ? 'btn-primary' : 'border-white/10 text-muted-foreground'}`}
                  >
                    {g}
                  </Button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full h-14 btn-primary text-xl">
              Sarguzashtni Boshlash
              <Rocket className="ml-2 w-5 h-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
