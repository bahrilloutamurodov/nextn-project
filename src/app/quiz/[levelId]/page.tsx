
"use client"

import React, { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getLevels, saveLevels, getUserProfile, saveUserProfile } from '@/lib/store';
import { Level } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CongratsDialog } from '@/components/CongratsDialog';
import { MiniGame } from '@/components/MiniGame';
import { aiQuizHint } from '@/ai/flows/ai-quiz-hint';
import { Lightbulb, ArrowLeft, ArrowRight, HelpCircle, Loader2, Clock, Heart, RotateCcw, Flame, Flag, CheckCircle2, Award, Zap, BookOpen } from 'lucide-react';
import { getCurriculumForGrade } from '@/lib/curriculum';

export default function QuizPage({ params }: { params: Promise<{ levelId: string }> }) {
  const router = useRouter();
  const db = useFirestore();
  const { levelId } = use(params);
  
  const [level, setLevel] = useState<Level | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [score, setScore] = useState(0);

  // User Profile & Tier
  const [profile, setProfile] = useState<any>(null);

  // Tier 1 & Tier 2 Mechanics: Lives, Timer, Combo Multiplier
  const [timeSpent, setTimeSpent] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalMultiplierPoints, setTotalMultiplierPoints] = useState(0);

  useEffect(() => {
    const p = getUserProfile();
    setProfile(p);

    const levels = getLevels();
    const currentLevel = levels.find(l => l.id === parseInt(levelId));
    if (!currentLevel || !currentLevel.unlocked) {
      router.push('/dashboard');
      return;
    }
    setLevel(currentLevel);
  }, [levelId, router]);

  // Stage timer interval
  useEffect(() => {
    if (!level || isFinished || showMiniGame || isGameOver) return;

    const timerId = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [level, isFinished, showMiniGame, isGameOver]);

  const tier = profile?.gradeTier || (profile?.gradeLevel >= 10 ? 'senior' : profile?.gradeLevel >= 8 ? 'middle' : 'junior');

  const comboMultiplier = useMemo(() => {
    if (comboCount >= 5) return 5;
    if (comboCount >= 3) return 3;
    if (comboCount >= 2) return 2;
    return 1;
  }, [comboCount]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option: string) => {
    const qId = level?.questions[currentQuestionIndex].id;
    if (qId) {
      setAnswers(prev => ({ ...prev, [qId]: option }));
      setAiHint(null);
    }
  };

  const toggleFlagQuestion = (qId: string) => {
    setFlaggedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleNext = () => {
    if (!level) return;
    const currentQ = level.questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQ.id];

    // Tier 1 (junior) Hearts Life Deduction
    if (tier === 'junior' && selectedAnswer && selectedAnswer !== currentQ.correctAnswer) {
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setIsGameOver(true);
        return;
      }
    }

    // Tier 2 (middle) Combo Calculation
    if (tier === 'middle') {
      if (selectedAnswer === currentQ.correctAnswer) {
        const nextCombo = comboCount + 1;
        setComboCount(nextCombo);
        setMaxCombo(prev => Math.max(prev, nextCombo));
        setTotalMultiplierPoints(prev => prev + 10 * comboMultiplier);
      } else {
        setComboCount(0);
      }
    }

    if (currentQuestionIndex < level.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAiHint(null);
    } else {
      calculateResult();
    }
  };

  const handleRestartQuiz = () => {
    setLives(3);
    setComboCount(0);
    setMaxCombo(0);
    setTotalMultiplierPoints(0);
    setIsGameOver(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions({});
    setTimeSpent(0);
    setAiHint(null);
  };

  const calculateResult = () => {
    if (!level) return;
    let correctCount = 0;
    level.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setIsFinished(true);

    if (db) {
      const userId = localStorage.getItem('firebase_user_id');
      if (userId && profile) {
        const calculatedScorePercent = (correctCount / (level.questions.length || 1)) * 100;
        
        addDoc(collection(db, 'results'), {
          userId,
          userName: profile.name,
          levelId: parseInt(levelId),
          score: calculatedScorePercent,
          subject: level.questions[0]?.subject || 'Aralash',
          timeSpent: timeSpent,
          tier: tier,
          timestamp: serverTimestamp()
        }).catch(err => console.error("Error saving result:", err));

        const userRef = doc(db, 'users', userId);
        const addedScore = correctCount * 10 + (tier === 'middle' ? totalMultiplierPoints : 0);
        
        profile.totalScore = (profile.totalScore || 0) + addedScore;
        profile.lastActive = new Date().toISOString();
        saveUserProfile(profile);

        setDoc(userRef, {
          totalScore: profile.totalScore,
          lastActive: serverTimestamp()
        }, { merge: true }).catch(err => console.error("Error updating user score:", err));
      }
    }
  };

  const handleGetHint = async () => {
    if (!level) return;
    const question = level.questions[currentQuestionIndex];
    const studentAnswer = answers[question.id] || "Hech narsa tanlanmagan";
    
    setIsAiLoading(true);
    try {
      const result = await aiQuizHint({
        question: question.text,
        studentAnswer: studentAnswer,
        subject: (question.subject as any) || 'Matematika',
        gradeLevel: profile?.gradeLevel || 5,
        previousHints: aiHint ? [aiHint] : []
      });
      setAiHint(result.hint);
    } catch (error) {
      console.error("AI Hint Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleContinueAfterCongrats = () => {
    const percentage = (score / (level?.questions.length || 1)) * 100;
    if (percentage >= 80 && tier === 'junior') {
      setShowMiniGame(true);
      setIsFinished(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleMiniGameComplete = () => {
    const levels = getLevels();
    const currentLevelIdx = levels.findIndex(l => l.id === parseInt(levelId));
    const calculatedScorePercent = (score / (level?.questions.length || 1)) * 100;
    
    levels[currentLevelIdx].completed = true;
    levels[currentLevelIdx].highScore = Math.max(levels[currentLevelIdx].highScore, calculatedScorePercent);
    
    if (currentLevelIdx < levels.length - 1) {
      levels[currentLevelIdx + 1].unlocked = true;
    }

    saveLevels(levels);

    if (profile) {
      if (!profile.completedLevels.includes(parseInt(levelId))) {
        profile.completedLevels.push(parseInt(levelId));
      }
      profile.currentLevel = Math.max(profile.currentLevel, parseInt(levelId) + 1);
      saveUserProfile(profile);

      if (db) {
        const userId = localStorage.getItem('firebase_user_id');
        if (userId) {
          const userRef = doc(db, 'users', userId);
          setDoc(userRef, {
            currentLevel: profile.currentLevel,
            lastActive: serverTimestamp()
          }, { merge: true }).catch(err => console.error("Error updating user:", err));
        }
      }
    }

    router.push('/dashboard');
  };

  if (!level) return null;

  if (showMiniGame) {
    return (
      <div className="min-h-screen bg-[#0F0E13] flex flex-col items-center justify-center p-6">
        <MiniGame onComplete={handleMiniGameComplete} levelId={parseInt(levelId)} />
      </div>
    );
  }

  const currentQuestion = level.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / level.questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0F0E13] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Bar adapted per Tier */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/5">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-muted-foreground hover:text-white rounded-xl">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Dashboardga Qaytish
          </Button>
          
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <h1 className="text-xl sm:text-2xl font-headline text-white">{level.title}</h1>
              <Badge className={
                tier === 'senior' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                tier === 'middle' ? 'bg-accent/20 text-accent border-accent/30' :
                'bg-primary/20 text-primary border-primary/30'
              }>
                {tier === 'senior' ? 'DTM Simulator' : tier === 'middle' ? 'Speedrun Combo' : 'Adventure'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Savol {currentQuestionIndex + 1} / {level.questions.length}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Stage Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white">
              <Clock className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>{formatTime(timeSpent)}</span>
            </div>

            {/* Tier 1: 3 Lives Hearts */}
            {tier === 'junior' && (
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((heartIndex) => (
                  <Heart
                    key={heartIndex}
                    className={`w-4 h-4 transition-all duration-300 ${
                      heartIndex <= lives
                        ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                        : 'text-white/20 scale-90'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Tier 2: Speedrun Combo Badge */}
            {tier === 'middle' && comboMultiplier > 1 && (
              <div className="flex items-center gap-1 px-3 py-1 bg-accent/20 border border-accent/40 rounded-xl text-accent font-headline text-xs animate-bounce">
                <Flame className="w-4 h-4 text-accent fill-accent" />
                <span>{comboMultiplier}x COMBO!</span>
              </div>
            )}

            {/* Tier 3: DTM Flag Toggle */}
            {tier === 'senior' && (
              <button
                type="button"
                onClick={() => toggleFlagQuestion(currentQuestion.id)}
                className={`p-2 rounded-xl border transition-all ${
                  flaggedQuestions[currentQuestion.id] 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white'
                }`}
                title="Savolni belgilash (Flag)"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tier 3: DTM Exam Question Navigator Palette Grid */}
        {tier === 'senior' && (
          <div className="mb-6 bg-[#161521] p-3 rounded-2xl border border-white/5">
            <div className="text-[11px] font-headline text-muted-foreground uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>DTM Savollar Palitrasi Navigatori</span>
              <span className="text-[10px] text-emerald-400 italic">Javob berilgan: {Object.keys(answers).length} / {level.questions.length}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {level.questions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = !!answers[q.id];
                const isFlagged = !!flaggedQuestions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-9 h-9 font-headline text-xs rounded-xl border transition-all flex items-center justify-center relative ${
                      isCurrent 
                        ? 'border-emerald-400 bg-emerald-500/20 text-white font-bold ring-2 ring-emerald-500/30'
                        : isAnswered
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && <div className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Progress value={progress} className="h-2 mb-8 bg-white/5" />

        {/* Main Question & Answer Options */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-[#1A1921] border-white/10 shadow-2xl overflow-hidden rounded-3xl p-2 sm:p-4">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs">
                  {currentQuestion.subject}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-headline leading-tight text-white mb-8">
                {currentQuestion.text}
              </h2>

              <div className="grid gap-3 sm:gap-4">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full p-5 text-left rounded-2xl border-2 transition-all duration-200 group flex items-center justify-between ${
                        isSelected
                          ? tier === 'senior' 
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                            : tier === 'middle'
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-primary bg-primary/10 text-primary'
                          : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10 text-muted-foreground hover:text-white'
                      }`}
                    >
                      <span className="text-base font-medium">{option}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? tier === 'senior' ? 'border-emerald-500 bg-emerald-500' : tier === 'middle' ? 'border-accent bg-accent' : 'border-primary bg-primary' 
                          : 'border-white/20'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleGetHint} 
              disabled={isAiLoading}
              className="w-full sm:w-auto border-accent/20 text-accent hover:bg-accent/10 py-6 px-6 rounded-2xl"
            >
              {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lightbulb className="w-5 h-5 mr-2" />}
              AI Yordam
            </Button>

            <Button 
              onClick={handleNext} 
              disabled={!answers[currentQuestion.id]}
              className={`w-full sm:w-auto font-headline py-6 px-10 text-lg rounded-2xl transition-all shadow-lg ${
                tier === 'senior' ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20' :
                tier === 'middle' ? 'bg-accent hover:bg-accent/90 text-white shadow-accent/20' :
                'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
              }`}
            >
              {currentQuestionIndex < level.questions.length - 1 ? 'Keyingi Savol' : 'Natijani Ko\'rish'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {aiHint && (
            <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl animate-in zoom-in-95 duration-300">
              <div className="flex gap-3">
                <HelpCircle className="w-6 h-6 text-accent shrink-0" />
                <p className="text-accent italic">"{aiHint}"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CongratsDialog 
        open={isFinished} 
        score={score} 
        totalQuestions={level.questions.length} 
        onContinue={handleContinueAfterCongrats}
      />

      {/* Game Over Dialog */}
      <Dialog open={isGameOver} onOpenChange={() => {}}>
        <DialogContent className="bg-[#1A1921] border-destructive/30 text-white max-w-md rounded-2xl p-6 text-center">
          <DialogHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-destructive animate-bounce" />
            </div>
            <DialogTitle className="text-2xl font-headline text-destructive mb-1">
              Barcha jonlar tugadi! 💔
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Xavotir olmang! Qayta urinib ko'rish orqali o'z bilimingizni yanada oshirishingiz mumkin.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={handleRestartQuiz} className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline py-5 rounded-xl">
              <RotateCcw className="w-4 h-4 mr-2" /> Qayta Boshlash
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-muted-foreground hover:text-white py-5 rounded-xl">
              Dashboardga Qaytish
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

