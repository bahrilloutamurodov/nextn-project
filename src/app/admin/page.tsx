"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLevels, getUserProfile, unlockAllLevels, lockAllLevels, resetProgress } from '@/lib/store';
import { Level, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Lock, 
  Unlock, 
  RotateCcw, 
  BarChart3, 
  ArrowLeft,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setLevels(getLevels());
    setProfile(getUserProfile());
  }, []);

  const handleUnlockAll = () => {
    const updated = unlockAllLevels();
    setLevels(updated);
    toast({
      title: "Muvaffaqiyatli",
      description: "Barcha bosqichlar ochildi!",
    });
  };

  const handleLockAll = () => {
    const updated = lockAllLevels();
    setLevels(updated);
    toast({
      title: "Muvaffaqiyatli",
      description: "Progress qayta tiklandi (barcha bosqichlar yopildi).",
    });
  };

  const handleFullReset = () => {
    if (confirm("Haqiqatan ham barcha ma'lumotlarni o'chirib tashlamoqchimisiz?")) {
      resetProgress();
      router.push('/');
      toast({
        variant: "destructive",
        title: "Tizim tozalandi",
        description: "Barcha foydalanuvchi ma'lumotlari o'chirildi.",
      });
    }
  };

  const completedCount = levels.filter(l => l.completed).length;
  const averageScore = levels.reduce((acc, curr) => acc + curr.highScore, 0) / (completedCount || 1);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="text-primary w-6 h-6" />
              <h1 className="text-3xl font-headline text-white">Admin Panel</h1>
            </div>
            <p className="text-muted-foreground text-sm">Tizimni boshqarish va statistika</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardDescription>Foydalanuvchi</CardDescription>
              <CardTitle className="text-xl">{profile?.name || "Noma'lum"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-primary border-primary/20">
                {profile?.grade || "5-sinf"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardDescription>Bosqichlar Progressi</CardDescription>
              <CardTitle className="text-2xl">{completedCount} / {levels.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Yakunlangan bosqichlar</div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardDescription>O'rtacha Ball</CardDescription>
              <CardTitle className="text-2xl">{averageScore.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart3 className="w-4 h-4 text-accent" />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardDescription>Jami Ochkolar</CardDescription>
              <CardTitle className="text-2xl text-accent">{profile?.totalScore || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">Foydalanuvchi yutug'i</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Settings className="w-5 h-5" />
                Boshqaruv Amallari
              </CardTitle>
              <CardDescription>O'yin holatini o'zgartirish uchun tezkor tugmalar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 btn-primary" onClick={handleUnlockAll}>
                  <Unlock className="w-4 h-4 mr-2" />
                  Hamma Bosqichni Ochish
                </Button>
                <Button variant="outline" className="flex-1 border-white/10" onClick={handleLockAll}>
                  <Lock className="w-4 h-4 mr-2" />
                  Bosqichlarni Yopish
                </Button>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleFullReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Tizimni To'liq Tozalash
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <CardTitle>Bosqichlar Holati</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left"># ID</th>
                      <th className="p-3 text-left">Nomi</th>
                      <th className="p-3 text-center">Holat</th>
                      <th className="p-3 text-right">Ball</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {levels.map((level) => (
                      <tr key={level.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3 font-mono">{level.id}</td>
                        <td className="p-3">{level.title}</td>
                        <td className="p-3 text-center">
                          {level.completed ? (
                            <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-none">Yopilgan</Badge>
                          ) : level.unlocked ? (
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none">Ochiq</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-white/10">Qulf</Badge>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-accent">{level.highScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
