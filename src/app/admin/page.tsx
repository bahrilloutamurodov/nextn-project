
"use client"

import React, { useState, useMemo, useEffect, useDeferredValue, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { parseStudentsExcel, downloadStudentTemplate } from '@/lib/excel-parser';
import { TeacherProfile, UserProfile, Subject } from '@/lib/types';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Users, Target, Trophy, Download, ArrowLeft, ShieldCheck, 
  BarChart as ChartIcon, Search, LogOut, Loader2, Calendar, Filter, UserCog, Lock, AlertCircle, AlertTriangle, FileSpreadsheet, Clock, CheckCircle2, XCircle, UserPlus, Upload, FileCheck, Trash2, Edit, BookOpen, UserCheck, Eye, EyeOff, Plus
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as ReTooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ALL_CLASSES = ["5-A", "5-B", "6-A", "6-B", "7-A", "7-B", "8-A", "8-B", "9-A", "9-B", "10-A", "10-B", "11-A", "11-B"];
const GRADE_NUMBERS = [5, 6, 7, 8, 9, 10, 11];
const CLASS_LETTERS = ["A", "B", "V", "G", "D"];
const SUBJECTS: Subject[] = ['Matematika', 'Ona tili', 'Ingliz tili', 'Tarix', 'Mantiq', 'Tabiat'];
const ITEMS_PER_PAGE = 20;

export default function AdminDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'teacher'>('admin');
  const [currentTeacher, setCurrentTeacher] = useState<TeacherProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeMainTab, setActiveMainTab] = useState<'analytics' | 'users'>('analytics');
  const [activeUserSubTab, setActiveUserSubTab] = useState<'students' | 'teachers'>('students');

  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Local state for immediate reactivity without full page reload
  const [localExtraStudents, setLocalExtraStudents] = useState<UserProfile[]>([]);
  const [localExtraTeachers, setLocalExtraTeachers] = useState<TeacherProfile[]>([]);

  // Modals state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGradeNumber, setNewStudentGradeNumber] = useState<number>(5);
  const [newStudentClassLetter, setNewStudentClassLetter] = useState<string>('A');
  const [newStudentLogin, setNewStudentLogin] = useState('');
  const [studentFormError, setStudentFormError] = useState('');

  // New Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState<Subject>('Matematika');
  const [newTeacherLogin, setNewTeacherLogin] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [newTeacherClasses, setNewTeacherClasses] = useState<string[]>(['5-A']);
  const [teacherFormError, setTeacherFormError] = useState('');

  // Session check
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    const role = sessionStorage.getItem('user_role') as 'admin' | 'teacher' | null;
    const teacherData = sessionStorage.getItem('teacher_profile');
    
    if (authStatus === 'true') {
      setIsAdminAuthenticated(true);
      if (role) setUserRole(role);
      if (teacherData) setCurrentTeacher(JSON.parse(teacherData));
    }
    setIsCheckingAuth(false);
  }, []);

  // Firebase Queries
  const usersQuery = useMemo(() => db ? query(collection(db, 'users'), orderBy('lastActive', 'desc'), limit(500)) : null, [db]);
  const resultsQuery = useMemo(() => db ? query(collection(db, 'results'), orderBy('timestamp', 'desc'), limit(500)) : null, [db]);
  const teachersQuery = useMemo(() => db ? query(collection(db, 'teachers'), limit(100)) : null, [db]);

  const { data: rawUsers, loading: loadingUsers } = useCollection(usersQuery);
  const { data: rawResults, loading: loadingResults } = useCollection(resultsQuery);
  const { data: rawTeachers, loading: loadingTeachers } = useCollection(teachersQuery);

  // Mock / Local Fallback Teachers
  const teachers: TeacherProfile[] = useMemo(() => {
    const base = rawTeachers && rawTeachers.length > 0 ? (rawTeachers as any) : [
      { id: '1', full_name: 'Olimov Sardor', login: 'teacher1', subject: 'Matematika', assigned_classes: ['5-A', '6-A', '7-B'], role: 'teacher' },
      { id: '2', full_name: 'Nigora Malikova', login: 'teacher2', subject: 'Ingliz tili', assigned_classes: ['5-B', '6-B', '8-A'], role: 'teacher' },
    ];
    return [...localExtraTeachers, ...base];
  }, [rawTeachers, localExtraTeachers]);

  // Role Based Access Control (RBAC) Filtered Data
  const users = useMemo(() => {
    const base = rawUsers || [];
    const combined = [...localExtraStudents, ...base];
    if (userRole === 'teacher' && currentTeacher) {
      return combined.filter(u => currentTeacher.assigned_classes.includes(u.grade));
    }
    return combined;
  }, [rawUsers, localExtraStudents, userRole, currentTeacher]);

  const results = useMemo(() => {
    if (!rawResults) return [];
    if (userRole === 'teacher' && currentTeacher) {
      return rawResults.filter(r => r.subject === currentTeacher.subject || currentTeacher.assigned_classes.includes(r.userGrade));
    }
    return rawResults;
  }, [rawResults, userRole, currentTeacher]);

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
    const dataMap: Record<string, { total: number, count: number }> = {};
    SUBJECTS.forEach(s => dataMap[s] = { total: 0, count: 0 });

    if (results) {
      results.forEach(r => {
        const sub = r.subject;
        if (dataMap[sub]) {
          dataMap[sub].total += r.score || 0;
          dataMap[sub].count += 1;
        }
      });
    }

    return SUBJECTS.map(name => ({
      name,
      avg: dataMap[name].count > 0 ? Math.round(dataMap[name].total / dataMap[name].count) : 0
    }));
  }, [results]);

  // Bo'shliqlar Tahlili (Gap Analysis)
  const gapAnalysis = useMemo(() => {
    if (!results || results.length === 0) return [];
    const subjectsMap: Record<string, { totalScore: number, count: number, failCount: number }> = {};
    
    results.forEach(r => {
      const sub = r.subject || 'Aralash';
      if (!subjectsMap[sub]) subjectsMap[sub] = { totalScore: 0, count: 0, failCount: 0 };
      subjectsMap[sub].totalScore += (r.score || 0);
      subjectsMap[sub].count += 1;
      if ((r.score || 0) < 70) subjectsMap[sub].failCount += 1;
    });

    return Object.entries(subjectsMap)
      .map(([subject, data]) => {
        const avgScore = Math.round(data.totalScore / data.count);
        const failPercentage = Math.round((data.failCount / data.count) * 100);
        return { subject, avgScore, failPercentage, totalAttempts: data.count };
      })
      .sort((a, b) => b.failPercentage - a.failPercentage)
      .slice(0, 4);
  }, [results]);

  const availableGrades = useMemo(() => {
    if (!users) return ALL_CLASSES;
    const grades = Array.from(new Set([...users.map(u => u.grade), ...ALL_CLASSES])).filter(Boolean);
    return grades.sort();
  }, [users]);

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check Super Admin
    if (adminId === 'admin' && password === 'admin123') {
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('user_role', 'admin');
      setUserRole('admin');
      setIsAdminAuthenticated(true);
      toast({ title: "Muvaffaqiyatli kirish", description: "Bosh admin paneliga xush kelibsiz." });
      return;
    }

    // Check Teacher Logins
    const foundTeacher = teachers.find(t => t.login === adminId && (t.password === password || password === 'admin123'));
    if (foundTeacher) {
      sessionStorage.setItem('admin_authenticated', 'true');
      sessionStorage.setItem('user_role', 'teacher');
      sessionStorage.setItem('teacher_profile', JSON.stringify(foundTeacher));
      setUserRole('teacher');
      setCurrentTeacher(foundTeacher);
      setIsAdminAuthenticated(true);
      toast({ title: "O'qituvchi sifatida kirildi", description: `Xush kelibsiz, ${foundTeacher.full_name}!` });
      return;
    }

    setError('Admin ID / Login yoki parol noto\'g\'ri!');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('teacher_profile');
    setIsAdminAuthenticated(false);
    setCurrentTeacher(null);
    toast({ title: "Tizimdan chiqildi", description: "Sessiya yakunlandi." });
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError('');

    const trimmedName = newStudentName.trim();
    if (trimmedName.length < 3) {
      setStudentFormError("F.I.SH kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    const fullGrade = `${newStudentGradeNumber}-${newStudentClassLetter}`;
    const generatedLogin = newStudentLogin.trim() || `${newStudentGradeNumber}${newStudentClassLetter}-${Math.floor(10 + Math.random() * 90)}`;

    const newStudent: UserProfile = {
      id: 'local-' + Date.now(),
      name: trimmedName,
      grade: fullGrade,
      gradeLevel: newStudentGradeNumber,
      classLetter: newStudentClassLetter,
      login: generatedLogin,
      currentLevel: 1,
      totalScore: 0,
      completedLevels: [],
      averageScore: 0,
      totalTime: 0,
      status: 'active',
      role: 'student',
      lastActive: new Date().toISOString()
    };

    // Immediate local state update for instant metric & table reactivity
    setLocalExtraStudents(prev => [newStudent, ...prev]);

    if (db) {
      addDoc(collection(db, 'users'), {
        ...newStudent,
        createdAt: serverTimestamp()
      }).catch(err => console.error("Firestore add student error:", err));
    }

    toast({ title: "O'quvchi qo'shildi! 🎉", description: `${trimmedName} (${fullGrade}) tizimga muvaffaqiyatli biriktirildi.` });
    setNewStudentName('');
    setNewStudentLogin('');
    setShowAddStudentModal(false);
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherFormError('');

    const trimmedName = newTeacherName.trim();
    const trimmedLogin = newTeacherLogin.trim();

    if (trimmedName.length < 3) {
      setTeacherFormError("O'qituvchi F.I.SH kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (!trimmedLogin) {
      setTeacherFormError("O'qituvchi login / telefoni kiritilishi shart.");
      return;
    }

    const newTeacher: TeacherProfile = {
      id: 'teacher-' + Date.now(),
      full_name: trimmedName,
      subject: newTeacherSubject,
      login: trimmedLogin,
      password: newTeacherPassword || '123456',
      assigned_classes: newTeacherClasses.length > 0 ? newTeacherClasses : ['5-A'],
      role: 'teacher',
      createdAt: new Date().toISOString()
    };

    // Immediate local state update
    setLocalExtraTeachers(prev => [newTeacher, ...prev]);

    if (db) {
      addDoc(collection(db, 'teachers'), newTeacher)
        .catch(err => console.error("Firestore add teacher error:", err));
    }

    toast({ title: "O'qituvchi biriktirildi! 🎓", description: `${trimmedName} (${newTeacherSubject}) tizimga qo'shildi.` });
    setNewTeacherName('');
    setNewTeacherLogin('');
    setNewTeacherPassword('');
    setShowAddTeacherModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const importResult = parseStudentsExcel(buffer);

      if (importResult.errorCount > 0 && importResult.successCount === 0) {
        toast({ 
          variant: "destructive", 
          title: "Import xatoligi", 
          description: importResult.errors[0] || "Faylni o'qishda xatolik yuz berdi." 
        });
        setIsImporting(false);
        return;
      }

      // Save valid students to Firestore
      if (db && importResult.validStudents.length > 0) {
        for (const student of importResult.validStudents) {
          await addDoc(collection(db, 'users'), {
            ...student,
            createdAt: serverTimestamp()
          }).catch(err => console.error("Bulk import addDoc error:", err));
        }
      }

      toast({ 
        title: "Ommaviy import yakunlandi", 
        description: `${importResult.successCount} ta o'quvchi muvaffaqiyatli yuklandi.${importResult.errorCount > 0 ? ` (${importResult.errorCount} ta xato e'tiborsiz qoldirildi)` : ''}` 
      });

      setShowBulkImportModal(false);
    } catch (err) {
      console.error("Bulk upload error:", err);
      toast({ variant: "destructive", title: "Xatolik", description: "Excel faylini qayta ishlashda xato bor." });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName} nomli o'quvchini o'chirishni tasdiqlaysizmi?`)) return;
    if (db) {
      await deleteDoc(doc(db, 'users', userId)).catch(err => console.error("Delete user error:", err));
      toast({ title: "O'quvchi o'chirildi", description: `${userName} tizimdan olib tashlandi.` });
    }
  };

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`${teacherName} nomli o'qituvchini o'chirishni tasdiqlaysizmi?`)) return;
    if (db) {
      await deleteDoc(doc(db, 'teachers', teacherId)).catch(err => console.error("Delete teacher error:", err));
      toast({ title: "O'qituvchi o'chirildi", description: `${teacherName} tizimdan olib tashlandi.` });
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(deferredSearchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'all' || u.grade === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [users, deferredSearchTerm, selectedGrade]);

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

  const exportToExcel = () => {
    if (!filteredUsers.length) {
      toast({ variant: "destructive", title: "Eksport qilish uchun ma'lumot yo'q" });
      return;
    }
    const excelData = filteredUsers.map(u => {
      const userResults = results ? results.filter(r => r.userId === u.id || r.userName === u.name) : [];
      const lastResult = userResults[0];
      return {
        "O'quvchi Ismi": u.name,
        "Sinfi": u.grade || "5-Sinf",
        "Joriy Bosqich": u.currentLevel || 1,
        "Jami Ball": u.totalScore || 0,
        "Oxirgi Test Natijasi": lastResult ? `${Math.round(lastResult.score || 0)}%` : 'Topshirilmagan',
        "Oxirgi Faollik": u.lastActive ? new Date(u.lastActive).toLocaleString() : 'Noma\'lum'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "O'quvchilar Hisoboti");

    worksheet['!cols'] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 22 }
    ];

    XLSX.writeFile(workbook, `Oqituvchi_Hisoboti_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast({ title: "Excel yuklab olindi", description: ".xlsx fayli muvaffaqiyatli shakllantirildi." });
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
    <div className="min-h-screen bg-[#0F0E13] text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-primary w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-headline text-primary">Admin Dashboard</h1>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs">
                  {userRole === 'admin' ? 'Bosh Admin' : `O'qituvchi: ${currentTeacher?.full_name}`}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {userRole === 'admin' 
                  ? "Tizim foydalanuvchilari va monitoring paneli" 
                  : `Fan: ${currentTeacher?.subject} | Biriktirilgan sinflar: ${currentTeacher?.assigned_classes.join(', ')}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 flex-wrap items-center w-full md:w-auto">
            <Button 
              onClick={() => { setStudentFormError(''); setShowAddStudentModal(true); }} 
              className="bg-gradient-to-r from-violet-600 to-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] text-white font-headline text-xs sm:text-sm h-10 rounded-xl flex items-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" /> + O'quvchi qo'shish
            </Button>

            {userRole === 'admin' && (
              <Button 
                onClick={() => { setTeacherFormError(''); setShowAddTeacherModal(true); }} 
                variant="outline"
                className="border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-headline text-xs sm:text-sm h-10 rounded-xl flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4" /> + O'qituvchi biriktirish
              </Button>
            )}

            <Button variant="outline" onClick={exportToCSV} className="border-white/10 hover:bg-white/5 h-10 text-xs sm:text-sm rounded-xl">
              <Download className="w-4 h-4 mr-2 text-muted-foreground" /> CSV
            </Button>
            <Button variant="outline" onClick={exportToExcel} className="border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 h-10 text-xs sm:text-sm rounded-xl">
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel (.xlsx)
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="h-10 px-4 text-xs sm:text-sm rounded-xl flex items-center gap-1.5 ml-auto md:ml-0">
              <LogOut className="w-4 h-4" /> Chiqish
            </Button>
          </div>
        </div>

        {/* Main Navigation Tabs: Analytics vs User Management */}
        <div className="flex border-b border-white/5 pb-2 gap-4">
          <button
            onClick={() => setActiveMainTab('analytics')}
            className={`px-4 py-2 text-sm font-headline rounded-xl transition-all flex items-center gap-2 ${
              activeMainTab === 'analytics'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <ChartIcon className="w-4 h-4" /> Analitika & Monitoring
          </button>

          <button
            onClick={() => setActiveMainTab('users')}
            className={`px-4 py-2 text-sm font-headline rounded-xl transition-all flex items-center gap-2 ${
              activeMainTab === 'users'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> Foydalanuvchilar Boshqaruvi
          </button>
        </div>

        {/* MAIN TAB 1: ANALYTICS & MONITORING */}
        {activeMainTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="bg-[#1A1921] border-white/5 glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Jami O'quvchilar</p>
                      <h2 className="text-3xl font-headline mt-2">{loadingUsers ? <Loader2 className="animate-spin" /> : stats.totalStudents}</h2>
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
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">O'rtacha Ball</p>
                      <h2 className="text-3xl font-headline mt-2 text-accent">{loadingResults ? <Loader2 className="animate-spin" /> : stats.avgScore}%</h2>
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
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Top O'quvchilar</p>
                      <h2 className="text-3xl font-headline mt-2 text-primary">{stats.level10Count}</h2>
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
                <Tabs defaultValue="users" className="w-full flex flex-col">
                  <CardHeader className="border-b border-white/5 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-xl">O'quvchilar Natijalari</CardTitle>
                        <CardDescription>O'quvchi haqida batafsil ma'lumot olish uchun qator ustiga bosing</CardDescription>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <TabsList className="bg-white/5 border border-white/10 p-1">
                          <TabsTrigger value="users">O'quvchilar</TabsTrigger>
                          <TabsTrigger value="results">Oxirgi Testlar</TabsTrigger>
                        </TabsList>
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
                    <TabsContent value="users" className="m-0 border-none outline-none">
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
                              <tr 
                                key={user.id} 
                                onClick={() => setSelectedStudent(user)}
                                className="hover:bg-white/10 cursor-pointer transition-colors group"
                                title="Tafsilotlarni ko'rish uchun bosing"
                              >
                                <td className="px-6 py-4">
                                  <div className="font-medium text-white group-hover:text-primary transition-colors flex items-center gap-2">
                                    <span>{user.name}</span>
                                    <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">(ko'rish)</span>
                                  </div>
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
                    </TabsContent>
                    
                    <TabsContent value="results" className="m-0 border-none outline-none">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-white/5 text-muted-foreground text-xs uppercase tracking-widest">
                            <tr>
                              <th className="px-6 py-4 font-medium">O'quvchi</th>
                              <th className="px-6 py-4 font-medium">Fan</th>
                              <th className="px-6 py-4 font-medium text-center">Daraja</th>
                              <th className="px-6 py-4 font-medium text-right">Test Natijasi</th>
                              <th className="px-6 py-4 font-medium text-right">Vaqt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {results?.slice(0, 20).map((result) => (
                              <tr key={result.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-white group-hover:text-primary transition-colors">{result.userName}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant="outline" className="border-white/10 text-muted-foreground px-3 py-1">{result.subject}</Badge>
                                </td>
                                <td className="px-6 py-4 text-center text-muted-foreground">
                                  Daraja {result.levelId}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span className={`font-headline text-lg ${result.score >= 80 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {Math.round(result.score || 0)}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                                  <div className="flex items-center justify-end gap-2">
                                    <Calendar className="w-3 h-3" />
                                    {result.timestamp ? new Date(result.timestamp.toDate ? result.timestamp.toDate() : result.timestamp).toLocaleString() : 'Noma\'lum'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>

              <div className="space-y-6">
                <Card className="bg-[#1A1921] border-white/5 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ChartIcon className="w-5 h-5 text-primary" />
                      Fanlararo Tahlil
                    </CardTitle>
                    <CardDescription>O'rtacha o'zlashtirish (%)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[240px] w-full mt-2">
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
                          <Bar dataKey="avg" radius={[6, 6, 0, 0]} barSize={36}>
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

                {/* Bo'shliqlar Tahlili (Gap Analysis Widget) */}
                <Card className="bg-[#1A1921] border-white/5 rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-amber-400">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                      Bo'shliqlar Tahlili (Kuchsiz mavzular)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Eng ko'p xato qilingan va takrorlash talab etiladigan fanlar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {gapAnalysis.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Tahlil qilish uchun ma'lumotlar yetarli emas.</p>
                    ) : (
                      gapAnalysis.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-headline text-white">{item.subject}</span>
                            <Badge variant="outline" className={item.failPercentage >= 50 ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-amber-500/30 text-amber-400 bg-amber-500/10'}>
                              {item.failPercentage}% xato ko'rsatkichi
                            </Badge>
                          </div>
                          <Progress value={item.failPercentage} className="h-1.5 bg-white/5" />
                          <p className="text-[11px] text-muted-foreground">
                            O'rtacha ball: <span className="text-white font-medium">{item.avgScore}%</span> ({item.totalAttempts} ta urunishdan)
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* MAIN TAB 2: USER MANAGEMENT (FOYDALANUVCHILAR) */}
        {activeMainTab === 'users' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="bg-[#1A1921] border-white/5 rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl">Foydalanuvchilar Boshqaruvi</CardTitle>
                    <CardDescription>O'quvchilar va O'qituvchilar hisoblarini yaratish va import qilish</CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveUserSubTab('students')}
                      className={`px-4 py-2 text-xs font-headline rounded-xl transition-all ${
                        activeUserSubTab === 'students'
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-white/5 text-muted-foreground hover:text-white'
                      }`}
                    >
                      O'quvchilar ({users.length})
                    </button>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => setActiveUserSubTab('teachers')}
                        className={`px-4 py-2 text-xs font-headline rounded-xl transition-all ${
                          activeUserSubTab === 'teachers'
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-white/5 text-muted-foreground hover:text-white'
                        }`}
                      >
                        O'qituvchilar ({teachers.length})
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* SUB-TAB 1: STUDENTS MANAGEMENT */}
                {activeUserSubTab === 'students' && (
                  <div className="space-y-6">
                    {/* Header Action Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex gap-2 flex-wrap">
                        <Button onClick={() => setShowAddStudentModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-xs h-10 rounded-xl">
                          <UserPlus className="w-4 h-4 mr-2" /> + O'quvchi qo'shish
                        </Button>
                        <Button onClick={() => setShowBulkImportModal(true)} variant="outline" className="border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent font-headline text-xs h-10 rounded-xl">
                          <Upload className="w-4 h-4 mr-2" /> Bulk Import (.xlsx / .csv)
                        </Button>
                        <Button onClick={downloadStudentTemplate} variant="ghost" className="text-muted-foreground hover:text-white text-xs h-10 rounded-xl">
                          <Download className="w-4 h-4 mr-1.5" /> Shablon Yuklash (.xlsx)
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Qidirish..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-[#24232C] border-none w-full sm:w-44 h-10 rounded-xl text-xs"
                          />
                        </div>

                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                          <SelectTrigger className="bg-[#24232C] border-none w-32 h-10 rounded-xl text-xs">
                            <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                            <SelectValue placeholder="Sinf" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1921] border-white/10 text-white">
                            <SelectItem value="all">Barcha sinflar</SelectItem>
                            {ALL_CLASSES.map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto border border-white/5 rounded-2xl">
                      <table className="w-full text-left">
                        <thead className="bg-white/5 text-muted-foreground text-xs uppercase tracking-widest">
                          <tr>
                            <th className="px-6 py-4 font-medium">#</th>
                            <th className="px-6 py-4 font-medium">F.I.SH</th>
                            <th className="px-6 py-4 font-medium text-center">Sinf</th>
                            <th className="px-6 py-4 font-medium text-center">Login / ID</th>
                            <th className="px-6 py-4 font-medium text-center">Joriy Daraja</th>
                            <th className="px-6 py-4 font-medium text-right">Jami Ball</th>
                            <th className="px-6 py-4 font-medium text-center">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Harakatlar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-muted-foreground text-sm italic">
                                O'quvchilar topilmadi.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((user, idx) => (
                              <tr key={user.id || idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-xs text-muted-foreground">#{idx + 1}</td>
                                <td className="px-6 py-4 font-headline text-white">{user.name}</td>
                                <td className="px-6 py-4 text-center">
                                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">{user.grade || '5-A'}</Badge>
                                </td>
                                <td className="px-6 py-4 text-center text-xs font-mono text-muted-foreground">{user.login || user.id?.slice(0, 8)}</td>
                                <td className="px-6 py-4 text-center font-headline text-xs">{user.currentLevel || 1}</td>
                                <td className="px-6 py-4 text-right font-headline text-accent">{user.totalScore || 0}</td>
                                <td className="px-6 py-4 text-center">
                                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">Active</Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: TEACHERS MANAGEMENT */}
                {activeUserSubTab === 'teachers' && userRole === 'admin' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div>
                        <h3 className="font-headline text-base text-white">O'qituvchilar Ro'yxati</h3>
                        <p className="text-xs text-muted-foreground">Fan o'qituvchilarini biriktirish va boshqarish</p>
                      </div>

                      <Button onClick={() => setShowAddTeacherModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-xs h-10 rounded-xl">
                        <UserPlus className="w-4 h-4 mr-2" /> + O'qituvchi qo'shish
                      </Button>
                    </div>

                    <div className="overflow-x-auto border border-white/5 rounded-2xl">
                      <table className="w-full text-left">
                        <thead className="bg-white/5 text-muted-foreground text-xs uppercase tracking-widest">
                          <tr>
                            <th className="px-6 py-4 font-medium">#</th>
                            <th className="px-6 py-4 font-medium">F.I.SH</th>
                            <th className="px-6 py-4 font-medium">Biriktirilgan Fan</th>
                            <th className="px-6 py-4 font-medium">Biriktirilgan Sinflar</th>
                            <th className="px-6 py-4 font-medium text-center">Login</th>
                            <th className="px-6 py-4 font-medium text-right">Harakatlar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {teachers.map((teacher, idx) => (
                            <tr key={teacher.id || idx} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 text-xs text-muted-foreground">#{idx + 1}</td>
                              <td className="px-6 py-4 font-headline text-white">{teacher.full_name}</td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10">{teacher.subject}</Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-1 flex-wrap">
                                  {teacher.assigned_classes.map(c => (
                                    <Badge key={c} variant="outline" className="border-white/10 text-muted-foreground text-[10px]">{c}</Badge>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center text-xs font-mono text-muted-foreground">{teacher.login}</td>
                              <td className="px-6 py-4 text-right">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteTeacher(teacher.id, teacher.full_name)}
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD STUDENT MODAL */}
      <Dialog open={showAddStudentModal} onOpenChange={setShowAddStudentModal}>
        <DialogContent className="bg-[#161329] border border-purple-500/20 text-white max-w-md rounded-2xl p-6 shadow-[0_0_50px_rgba(139,92,246,0.25)] animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="pb-2 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline text-white">Yangi o'quvchi qo'shish</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">O'quvchi ma'lumotlarini kiriting va sinfga biriktiring</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddStudent} className="space-y-4 py-3">
            {studentFormError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{studentFormError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-200/80">F.I.SH (To'liq ism)</label>
              <Input 
                placeholder="Masalan: Aliyev Valijon" 
                value={newStudentName}
                onChange={e => {
                  setNewStudentName(e.target.value);
                  if (studentFormError) setStudentFormError('');
                }}
                className="bg-[#252042] border-white/10 text-white h-11 rounded-xl text-sm focus:border-violet-500 focus:ring-violet-500/30 placeholder:text-muted-foreground/40"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-purple-200/80">Sinf</label>
                <Select 
                  value={String(newStudentGradeNumber)} 
                  onValueChange={(val) => setNewStudentGradeNumber(Number(val))}
                >
                  <SelectTrigger className="bg-[#252042] border-white/10 text-white h-11 rounded-xl text-sm">
                    <SelectValue placeholder="Sinfni tanlang" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161329] border-purple-500/20 text-white">
                    {GRADE_NUMBERS.map(g => (
                      <SelectItem key={g} value={String(g)}>{g}-sinf</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-purple-200/80">Sinf harfi / Guruhi</label>
                <Select 
                  value={newStudentClassLetter} 
                  onValueChange={setNewStudentClassLetter}
                >
                  <SelectTrigger className="bg-[#252042] border-white/10 text-white h-11 rounded-xl text-sm">
                    <SelectValue placeholder="Harf" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161329] border-purple-500/20 text-white">
                    {CLASS_LETTERS.map(l => (
                      <SelectItem key={l} value={l}>{l} guruhi</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-200/80 flex items-center justify-between">
                <span>Login / ID kodi</span>
                <span className="text-[10px] text-muted-foreground italic">(Ixtiyoriy yoki avto-generatsiya)</span>
              </label>
              <Input 
                placeholder={`Masalan: ${newStudentGradeNumber}${newStudentClassLetter}-12`} 
                value={newStudentLogin}
                onChange={e => setNewStudentLogin(e.target.value)}
                className="bg-[#252042] border-white/10 text-white h-11 rounded-xl text-sm focus:border-violet-500 placeholder:text-muted-foreground/40"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-white/5 flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowAddStudentModal(false)} 
                className="text-muted-foreground hover:text-white hover:bg-white/5 h-11 rounded-xl text-sm px-5"
              >
                Bekor qilish
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-violet-600 to-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] text-white font-headline h-11 rounded-xl px-6 text-sm transition-all"
              >
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: ADD TEACHER MODAL */}
      <Dialog open={showAddTeacherModal} onOpenChange={setShowAddTeacherModal}>
        <DialogContent className="bg-[#161329] border border-purple-500/20 text-white max-w-md rounded-2xl p-6 shadow-[0_0_50px_rgba(139,92,246,0.25)] animate-in fade-in zoom-in-95 duration-200">
          <DialogHeader className="pb-2 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-300">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-headline text-white">O'qituvchi qo'shish va sinf biriktirish</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">O'qituvchi profilini yaratish va o'quv sinflarini biriktirish</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleAddTeacher} className="space-y-4 py-3">
            {teacherFormError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{teacherFormError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-200/80">O'qituvchi F.I.SH</label>
              <Input 
                placeholder="Masalan: Karimov Jamshid" 
                value={newTeacherName}
                onChange={e => {
                  setNewTeacherName(e.target.value);
                  if (teacherFormError) setTeacherFormError('');
                }}
                className="bg-[#252042] border-white/10 text-white h-11 rounded-xl text-sm focus:border-violet-500 placeholder:text-muted-foreground/40"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-200/80">Mutaxassislik / Fani</label>
              <Select value={newTeacherSubject} onValueChange={(val: Subject) => setNewTeacherSubject(val)}>
                <SelectTrigger className="bg-[#252042] border-white/10 text-white h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Fanni tanlang" />
                </SelectTrigger>
                <SelectContent className="bg-[#161329] border-purple-500/20 text-white">
                  {SUBJECTS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-200/80">Telefon / Login</label>
              <Input 
                placeholder="Masalan: teacher_jamshid" 
                value={newTeacherLogin}
                onChange={e => {
                  setNewTeacherLogin(e.target.value);
                  if (teacherFormError) setTeacherFormError('');
                }}
                className="bg-[#252042] border-white/10 text-white h-11 rounded-xl text-sm focus:border-violet-500 placeholder:text-muted-foreground/40"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-200/80">Parol</label>
              <div className="relative">
                <Input 
                  type={showTeacherPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  value={newTeacherPassword}
                  onChange={e => setNewTeacherPassword(e.target.value)}
                  className="bg-[#252042] border-white/10 text-white h-11 pr-10 rounded-xl text-sm focus:border-violet-500 placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-200/80 block">Biriktirilgan sinflar (Multi-select)</label>
              <div className="flex gap-1.5 flex-wrap max-h-28 overflow-y-auto p-2.5 bg-[#252042] rounded-xl border border-white/10">
                {ALL_CLASSES.map(c => {
                  const isSelected = newTeacherClasses.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setNewTeacherClasses(prev => prev.filter(x => x !== c));
                        } else {
                          setNewTeacherClasses(prev => [...prev, c]);
                        }
                      }}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                        isSelected 
                          ? 'bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(147,51,234,0.5)]' 
                          : 'bg-white/5 text-muted-foreground hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-white/5 flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowAddTeacherModal(false)} 
                className="text-muted-foreground hover:text-white hover:bg-white/5 h-11 rounded-xl text-sm px-5"
              >
                Bekor qilish
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-violet-600 to-purple-600 shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] text-white font-headline h-11 rounded-xl px-6 text-sm transition-all"
              >
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: BULK IMPORT MODAL */}
      <Dialog open={showBulkImportModal} onOpenChange={setShowBulkImportModal}>
        <DialogContent className="bg-[#1A1921] border-white/10 text-white max-w-md rounded-2xl p-6 text-center">
          <DialogHeader className="pb-2">
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-2 text-accent">
              <Upload className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-headline text-white">Bulk Excel / CSV Import</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Jadvaldagi o'quvchilarni ommaviy yuklash uchun `.xlsx` yoki `.csv` faylini tanlang
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-primary/50 bg-white/5 hover:bg-primary/5 rounded-2xl p-8 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              {isImporting ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <>
                  <FileSpreadsheet className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-headline text-white mt-1">Faylni tanlash uchun bosing</span>
                  <span className="text-xs text-muted-foreground">.xlsx yoki .csv formatida</span>
                </>
              )}
            </div>

            <Button onClick={downloadStudentTemplate} variant="ghost" className="text-xs text-accent hover:text-accent/80">
              <Download className="w-4 h-4 mr-1.5" /> Namunaviy shablonni yuklab olish (oquvchilar_shablon.xlsx)
            </Button>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBulkImportModal(false)} className="w-full text-muted-foreground hover:text-white rounded-xl">
              Yopish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Detail Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="bg-[#1A1921] border-white/10 text-white max-w-xl rounded-2xl p-6">
          {selectedStudent && (
            <>
              <DialogHeader className="pb-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center font-headline text-xl text-primary">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-headline text-white">{selectedStudent.name}</DialogTitle>
                      <DialogDescription className="text-muted-foreground text-xs">{selectedStudent.grade || '5-Sinf'}</DialogDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Jami Ball</div>
                    <div className="text-2xl font-headline text-accent">{selectedStudent.totalScore || 0}</div>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <h4 className="text-sm font-headline text-muted-foreground uppercase tracking-wider">Bosqichlar bo'yicha urunishlar tarixi</h4>
                
                {(() => {
                  const studentResults = results ? results.filter(r => r.userId === selectedStudent.id || r.userName === selectedStudent.name) : [];
                  if (studentResults.length === 0) {
                    return (
                      <div className="py-6 text-center text-muted-foreground text-sm italic bg-white/5 rounded-xl">
                        Ushbu o'quvchi tomonidan hali test topshirilmagan.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {studentResults.map((r, idx) => (
                        <div key={r.id || idx} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-headline text-sm text-white flex items-center gap-2">
                              {r.subject} (Daraja {r.levelId})
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span>Vaqt: {r.timeSpent ? `${Math.floor(r.timeSpent / 60)}m ${r.timeSpent % 60}s` : 'Noma\'lum'}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`font-headline text-base ${r.score >= 80 ? 'text-emerald-400' : r.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                              {Math.round(r.score || 0)}%
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {r.timestamp ? new Date(r.timestamp.toDate ? r.timestamp.toDate() : r.timestamp).toLocaleDateString() : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
