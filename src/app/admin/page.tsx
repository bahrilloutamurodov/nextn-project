
"use client"

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Target, Trophy, Download, ArrowLeft, ShieldCheck, 
  BarChart, Search, LogOut, Loader2, Calendar
} from 'lucide-react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ReTooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Firebase Data
  const usersQuery = useMemo(() => db ? query(collection(db, 'users'), orderBy('lastActive', 'desc')) : null, [db]);
  const resultsQuery = useMemo(() => db ? query(collection(db, 'results'), orderBy('timestamp', 'desc')) : null, [db]);

  const { data: users, loading: loadingUsers } = useCollection(usersQuery);
  const { data: results, loading: loadingResults } = useCollection(resultsQuery);

  // Stats calculation
  const stats = useMemo(() => {
    if (!users || !results) return { totalStudents: 0, avgScore: 0, level10Count: 0 };
    
    const totalStudents = users.length;
    const avgScore = results.length > 0 
      ? (results.reduce((acc, r) => acc + (r.score || 0), 0) / results.length).toFixed(1) 
      : 0;
    const level10Count = users.filter(u => u.currentLevel >= 10 || u.completedLevels?.length >= 10).length;

    return { totalStudents, avgScore, level10Count };
  }, [users, results]);

  // Chart data: Subject difficulty (Lower score = harder)
  const subjectStats = useMemo(() => {
    if (!results) return [];
    const subjects: Record<string, { total: number, count: number }> = {};
    
    results.forEach(r => {
      const sub = r.subject || 'Boshqa';
      if (!subjects[sub]) subjects[sub] = { total: 0, count: 0 };
      subjects[sub].total += r.score || 0;
      subjects[sub].count += 1;
    });

    return Object.entries(subjects).map(([name, data]) => ({
      name,
      avg: Math.round(data.total / data.count)
    })).sort((a, b) => a.avg - b.avg);
  }, [results]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Haqiqiy sharoitda bu xavfsizroq bo'lishi kerak
      setIsAdminAuthenticated(true);
      toast({ title: "Xush kelibsiz", description: "Admin paneliga kirdingiz." });
    } else {
      toast({ variant: "destructive", title: "Xato", description: "Parol noto'g'ri!" });
    }
  };

  const exportToCSV = () => {
    if (!users) return;
    const headers = ["Ism", "Sinf", "Daraja", "Jami Ball", "Oxirgi faollik"];
    const rows = users.map(u => [
      u.name, 
      u.grade, 
      u.currentLevel || 1, 
      u.totalScore || 0, 
      u.lastActive ? new Date(u.lastActive).toLocaleString() : 'Noma\'lum'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `oqituvchilar_hisoboti_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0E13] flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-[#1A1921] border-white/5 shadow-2xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-primary w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-headline text-white">Admin Kirish</CardTitle>
            <CardDescription>Boshqaruv paneliga kirish uchun parolni kiriting</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Admin paroli" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#24232C] border-white/5 text-white"
              />
              <Button type="submit" className="w-full btn-primary h-12">Kirish</Button>
              <Button variant="ghost" onClick={() => router.push('/')} className="w-full text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Orqaga qaytish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = users?.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#0F0E13] text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-headline text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">O'quvchilar natijalari va monitoring</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV} className="border-white/10 hover:bg-white/5">
              <Download className="w-4 h-4 mr-2" /> Eksport (CSV)
            </Button>
            <Button variant="destructive" onClick={() => setIsAdminAuthenticated(false)} size="icon">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-[#1A1921] border-white/5 glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Jami O'quvchilar</p>
                  <h2 className="text-4xl font-headline mt-2">{loadingUsers ? <Loader2 className="animate-spin" /> : stats.totalStudents}</h2>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1921] border-white/5 glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">O'rtacha Ball</p>
                  <h2 className="text-4xl font-headline mt-2 text-accent">{loadingResults ? <Loader2 className="animate-spin" /> : stats.avgScore}%</h2>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Target className="text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1921] border-white/5 glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Top O'quvchilar</p>
                  <h2 className="text-4xl font-headline mt-2 text-primary">{stats.level10Count}</h2>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Trophy className="text-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">10-darajaga yetganlar soni</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Table */}
          <Card className="lg:col-span-2 bg-[#1A1921] border-white/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
              <div>
                <CardTitle>O'quvchilar Ro'yxati</CardTitle>
                <CardDescription>Haqiqiy vaqtdagi progress</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Ism bo'yicha qidirish..." 
                  className="pl-9 bg-[#24232C] border-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-muted-foreground text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 font-medium">O'quvchi</th>
                      <th className="px-6 py-4 font-medium text-center">Sinf</th>
                      <th className="px-6 py-4 font-medium text-center">Daraja</th>
                      <th className="px-6 py-4 font-medium text-right">Ball</th>
                      <th className="px-6 py-4 font-medium text-right">Oxirgi Kirish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-primary transition-colors">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="border-white/10 text-muted-foreground">{user.grade}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xs font-bold">
                            {user.currentLevel || 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-headline text-accent">
                          {user.totalScore || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                          <div className="flex items-center justify-end gap-1">
                            <Calendar className="w-3 h-3" />
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Noma\'lum'}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">O'quvchilar topilmadi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <Card className="bg-[#1A1921] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Fanlararo Tahlil
              </CardTitle>
              <CardDescription>O'rtacha o'zlashtirish (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={subjectStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#24232C" horizontal={false} />
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={100} 
                      tick={{ fill: '#888', fontSize: 12 }} 
                    />
                    <ReTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#1A1921', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="avg" radius={[0, 4, 4, 0]} barSize={20}>
                      {subjectStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.avg < 70 ? '#ef4444' : '#BA6AFF'} />
                      ))}
                    </Bar>
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Eng qiyin fan:</span>
                  <span className="text-red-400 font-bold">{subjectStats[0]?.name || '-'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Eng oson fan:</span>
                  <span className="text-green-400 font-bold">{subjectStats[subjectStats.length - 1]?.name || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
