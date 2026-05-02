
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Users, Target, Trophy, Download, ArrowLeft, ShieldCheck, 
  BarChart as ChartIcon, Search, LogOut, Loader2, Calendar, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ReTooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { toast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');

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
    const level10Count = users.filter(u => u.currentLevel >= 10).length;

    return { totalStudents, avgScore, level10Count };
  }, [users, results]);

  // Chart data: Subject performance
  const subjectStats = useMemo(() => {
    const subjects = ['Matematika', 'Ona tili', 'Ingliz tili', 'Tarix'];
    const dataMap: Record<string, { total: number, count: number }> = {};
    
    subjects.forEach(s => dataMap[s] = { total: 0, count: 0 });

    if (results) {
      results.forEach(r => {
        const sub = r.subject;
        if (dataMap[sub]) {
          dataMap[sub].total += r.score || 0;
          dataMap[sub].count += 1;
        }
      });
    }

    return subjects.map(name => ({
      name,
      avg: dataMap[name].count > 0 ? Math.round(dataMap[name].total / dataMap[name].count) : 0
    }));
  }, [results]);

  // Available grades for filter
  const availableGrades = useMemo(() => {
    if (!users) return [];
    const grades = Array.from(new Set(users.map(u => u.grade))).filter(Boolean);
    return grades.sort();
  }, [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAdminAuthenticated(true);
      toast({ title: "Xush kelibsiz", description: "Admin paneliga kirdingiz." });
    } else {
      toast({ variant: "destructive", title: "Xato", description: "Parol noto'g'ri!" });
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'all' || u.grade === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [users, searchTerm, selectedGrade]);

  const exportToCSV = () => {
    if (!filteredUsers.length) {
      toast({ variant: "destructive", title: "Eksport qilish uchun ma'lumot yo'q" });
      return;
    }
    const headers = ["Ism", "Sinf", "Joriy Daraja", "Jami Ball", "Oxirgi faollik"];
    const rows = filteredUsers.map(u => [
      `"${u.name}"`, 
      `"${u.grade}"`, 
      u.currentLevel || 1, 
      u.totalScore || 0, 
      u.lastActive ? new Date(u.lastActive).toLocaleString() : 'Noma\'lum'
    ]);
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `oqituvchi_hisoboti_${new Date().toLocaleDateString()}.csv`);
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
              <Button variant="ghost" onClick={() => router.push('/dashboard')} className="w-full text-muted-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" /> Orqaga qaytish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Button variant="outline" onClick={exportToCSV} className="border-white/10 hover:bg-white/5 h-11">
              <Download className="w-4 h-4 mr-2" /> Eksport (CSV)
            </Button>
            <Button variant="destructive" onClick={() => setIsAdminAuthenticated(false)} size="icon" className="h-11 w-11">
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
          {/* Student Table Section */}
          <Card className="lg:col-span-2 bg-[#1A1921] border-white/5 overflow-hidden flex flex-col">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>O'quvchilar Natijalari</CardTitle>
                  <CardDescription>Sinflar bo'yicha saralangan ro'yxat</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Ism..." 
                      className="pl-9 bg-[#24232C] border-none w-full sm:w-48 h-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="bg-[#24232C] border-none w-full sm:w-32 h-10">
                      <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Sinf" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1921] border-white/10 text-white">
                      <SelectItem value="all">Barcha sinflar</SelectItem>
                      {availableGrades.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-muted-foreground text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 font-medium">O'quvchi</th>
                      <th className="px-6 py-4 font-medium text-center">Sinf</th>
                      <th className="px-6 py-4 font-medium text-center">Joriy Daraja</th>
                      <th className="px-6 py-4 font-medium text-right">Jami Ball</th>
                      <th className="px-6 py-4 font-medium text-right">Oxirgi Kirish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-primary transition-colors">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="border-white/10 text-muted-foreground">{user.grade}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-xs font-bold ${
                            (user.currentLevel || 1) >= 8 ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'
                          }`}>
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
                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">
                          Hech qanday ma'lumot topilmadi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Chart Section */}
          <Card className="bg-[#1A1921] border-white/5 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartIcon className="w-5 h-5 text-primary" />
                Fanlararo Tahlil
              </CardTitle>
              <CardDescription>O'rtacha o'zlashtirish (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectStats} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#24232C" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#888', fontSize: 11 }} 
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#888', fontSize: 11 }} 
                    />
                    <ReTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#1A1921', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="avg" radius={[6, 6, 0, 0]} barSize={40}>
                      {subjectStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.avg < 50 ? '#ef4444' : entry.avg < 80 ? '#FBA130' : '#BA6AFF'} />
                      ))}
                      <LabelList dataKey="avg" position="top" fill="#fff" fontSize={10} formatter={(v: number) => `${v}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase">Eng yuqori</p>
                  <p className="text-sm font-headline text-primary">
                    {subjectStats.reduce((prev, current) => (prev.avg > current.avg) ? prev : current).name}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Eng past</p>
                  <p className="text-sm font-headline text-red-500">
                    {subjectStats.reduce((prev, current) => (prev.avg < current.avg && prev.avg > 0) ? prev : current).name || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
