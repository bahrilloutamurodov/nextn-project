
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
import { Lightbulb, ArrowLeft, ArrowRight, HelpCircle, Loader2, Clock, Heart, RotateCcw } from 'lucide-react';

export default function QuizPage({ params }: { params: Promise<{ levelId: string }> }) {
  const router = useRouter();
  const db = useFirestore();
  const { levelId } = use(params);
  
  const [level, setLevel] = useState<Level | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [score, setScore] = useState(0);

  // Timer & Lives mechanics
  const [timeSpent, setTimeSpent] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
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

  const handleNext = () => {
    if (!level) return;
    const currentQ = level.questions[currentQuestionIndex];
    const selectedAnswer = answers[currentQ.id];

    // Check answer correctness for Lives mode
    if (selectedAnswer && selectedAnswer !== currentQ.correctAnswer) {
      const nextLives = lives - 1;
      setLives(nextLives);
      if (nextLives <= 0) {
        setIsGameOver(true);
        return;
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
    setIsGameOver(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
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

    // Barcha test natijalarini shu zahoti Firestore'ga yozamiz
    if (db) {
      const userId = localStorage.getItem('firebase_user_id');
      const profile = getUserProfile();
      if (userId && profile) {
        const calculatedScorePercent = (correctCount / (level.questions.length || 1)) * 100;
        
        // Natijani results kolleksiyasiga yozamiz
        addDoc(collection(db, 'results'), {
          userId,
          userName: profile.name,
          levelId: parseInt(levelId),
          score: calculatedScorePercent,
          subject: level.questions[0]?.subject || 'Aralash',
          timeSpent: timeSpent,
          timestamp: serverTimestamp()
        }).catch(err => console.error("Error saving result:", err));

        // Userning profiliga ham jami ballni va faollikni qo'shamiz
        const userRef = doc(db, 'users', userId);
        const addedScore = correctCount * 10;
        
        // Mahaliy localStorage ni ham yangilaymiz
        profile.totalScore += addedScore;
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
        subject: question.subject,
        gradeLevel: 5,
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
    if (percentage >= 80) {
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
    
    // Update current level as completed
    levels[currentLevelIdx].completed = true;
    levels[currentLevelIdx].highScore = Math.max(levels[currentLevelIdx].highScore, calculatedScorePercent);
    
    // Unlock next level
    if (currentLevelIdx < levels.length - 1) {
      levels[currentLevelIdx + 1].unlocked = true;
    }

    saveLevels(levels);

    // Update user profile for levels
    const profile = getUserProfile();
    if (profile) {
      if (!profile.completedLevels.includes(parseInt(levelId))) {
        profile.completedLevels.push(parseInt(levelId));
      }
      profile.currentLevel = Math.max(profile.currentLevel, parseInt(levelId) + 1);
      saveUserProfile(profile);

      // Save to Firestore
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
    <div className="min-h-screen bg-[#0F0E13] p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-muted-foreground hover:text-white">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Chiqish
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-headline text-primary">{level.title}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Savol {currentQuestionIndex + 1} / {level.questions.length}</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Stage Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-white">
              <Clock className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>{formatTime(timeSpent)}</span>
            </div>

            {/* 3 Lives Hearts */}
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
          </div>
        </div>

        <Progress value={progress} className="h-2 mb-10 bg-white/5" />

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="glass-card border-white/5 overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-2xl sm:text-3xl font-headline leading-tight text-white mb-10">
                {currentQuestion.text}
              </h2>

              <div className="grid gap-4">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-200 group flex items-center justify-between ${
                      answers[currentQuestion.id] === option
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10 text-muted-foreground hover:text-white'
                    }`}
                  >
                    <span className="text-lg font-medium">{option}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                       answers[currentQuestion.id] === option ? 'border-primary bg-primary' : 'border-white/20'
                    }`}>
                      {answers[currentQuestion.id] === option && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-auto">
               <Button 
                variant="outline" 
                onClick={handleGetHint} 
                disabled={isAiLoading}
                className="w-full sm:w-auto border-accent/20 text-accent hover:bg-accent/10 py-6 px-8 rounded-2xl"
              >
                {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lightbulb className="w-5 h-5 mr-2" />}
                AI Yordam
              </Button>
            </div>

            <Button 
              onClick={handleNext} 
              disabled={!answers[currentQuestion.id]}
              className="w-full sm:w-auto btn-primary py-6 px-12 text-lg rounded-2xl"
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
