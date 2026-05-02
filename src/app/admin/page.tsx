
"use client"

import React, { useState, useMemo, useEffect } from 'react';
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
  BarChart as ChartIcon, Search, LogOut, Loader2, Calendar, Filter, UserCog, Lock, AlertCircle
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
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Xavfsizlik skripti: sessiyani tekshirish
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAdminAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

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
    const level10Count = users.filter(u => (u.currentLevel || 1) >= 10).length;

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

  const availableGrades = useMemo(() => {
    if (!users) return [];
    const grades = Array.from(new Set(users.map(u => u.grade))).filter(Boolean);
    return grades.sort();
  }, [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (adminId === 'admin' && password === 'admin123') {
      sessionStorage.setItem('admin_authenticated', 'true');
      setIsAdminAuthenticated(true);
      toast({ title: "Muvaffaqiyatli kirish", description: "O'qituvchi boshqaruv paneliga xush kelibsiz." });
    } else {
      setError('Admin ID yoki parol noto\'g\'ri!');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAdminAuthenticated(false);
    toast({ title: "Tizimdan chiqildi", description: "Admin sessiyasi yakunlandi." });
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'all' || u.grade === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [users, searchTerm, selectedGrade]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0F0E13] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F0E13] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />

        <Card className="w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <CardHeader className="text-center pt-10 pb-6">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-6 border border-primary/30 shadow-[0_0_20px_rgba(186,106,255,0.2)]">
              <ShieldCheck className="text-primary w-10 h-10" />
            </div>
            <CardTitle className="text-3xl font-headline text-white tracking-tight">O'qituvchi Kirishi</CardTitle>
            <CardDescription className="text-muted-foreground/70 mt-2">Tizimni boshqarish uchun ma'lumotlarni kiriting</CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Admin ID</label>
                  <div className="relative group">
                    <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input 
                      placeholder="Admin login" 
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      className="bg-white/5 border-white/10 text-white pl-12 h-14 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Parol</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white pl-12 h-14 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" className="w-full btn-primary h-14 text-lg rounded-2xl">
                  Tizimga kirish
                </Button>
                
                <Button 
                  variant="ghost" 
                  type="button"
                  onClick={() => router.push('/')} 
                  className="w-full mt-4 text-muted-foreground hover:text-white hover:bg-white/5 h-12 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Bosh sahibaga qaytish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0E13] text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-headline text-primary">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">O'quvchilar natijalari va monitoring</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV} className="border-white/10 hover:bg-white/5 h-11 rounded-xl">
              <Download className="w-4 h-4 mr-2" /> Eksport (CSV)
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="h-11 px-6 rounded-xl flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Chiqish
            </Button>
          </div>
        </div>

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
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-[#1A1921] border-white/5 overflow-hidden flex flex-col rounded-2xl">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">O'quvchilar Natijalari</CardTitle>
                  <CardDescription>Sinflar bo'yicha saralangan ro'yxat</CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Ism bo'yicha qidirish..." 
                      className="pl-9 bg-[#24232C] border-none w-full sm:w-48 h-10 rounded-xl"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                  
                  <Select value={selectedGrade} onValueChange={(val) => {
                    setSelectedGrade(val);
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="bg-[#24232C] border-none w-full sm:w-32 h-10 rounded-xl">
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
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-primary transition-colors">{user.name}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="border-white/10 text-muted-foreground px-3 py-1">{user.grade}</Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto text-xs font-bold ${
                            (user.currentLevel || 1) >= 8 ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'
                          }`}>
                            {user.currentLevel || 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-headline text-accent text-lg">
                          {user.totalScore || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                          <div className="flex items-center justify-end gap-2">
                            <Calendar className="w-3 h-3" />
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Noma\'lum'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-white/5 gap-4">
                  <div className="text-sm text-muted-foreground">
                    Jami: {filteredUsers.length} ta o'quvchi
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                      disabled={currentPage === 1}
                      className="border-white/10 hover:bg-white/5 text-white"
                    >
                      Oldingi
                    </Button>
                    <div className="text-sm text-muted-foreground px-4">
                      {currentPage} / {totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                      disabled={currentPage >= totalPages}
                      className="border-white/10 hover:bg-white/5 text-white"
                    >
                      Keyingi
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#1A1921] border-white/5 h-fit rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
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
                      contentStyle={{ backgroundColor: '#1A1921', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
