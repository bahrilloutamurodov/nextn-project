"use client"

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getLevels, saveLevels, getUserProfile, saveUserProfile } from '@/lib/store';
import { Level, Question, Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CongratsDialog } from '@/components/CongratsDialog';
import { MiniGame } from '@/components/MiniGame';
import { aiQuizHint } from '@/ai/flows/ai-quiz-hint';
import { Lightbulb, ArrowLeft, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';

export default function QuizPage({ params }: { params: Promise<{ levelId: string }> }) {
  const router = useRouter();
  const { levelId } = use(params);
  
  const [level, setLevel] = useState<Level | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const levels = getLevels();
    const currentLevel = levels.find(l => l.id === parseInt(levelId));
    if (!currentLevel || !currentLevel.unlocked) {
      router.push('/dashboard');
      return;
    }
    setLevel(currentLevel);
  }, [levelId, router]);

  const handleAnswerSelect = (option: string) => {
    const qId = level?.questions[currentQuestionIndex].id;
    if (qId) {
      setAnswers(prev => ({ ...prev, [qId]: option }));
      setAiHint(null);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < (level?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAiHint(null);
    } else {
      calculateResult();
    }
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
    
    // Update current level as completed
    levels[currentLevelIdx].completed = true;
    levels[currentLevelIdx].highScore = Math.max(levels[currentLevelIdx].highScore, (score / 10) * 100);
    
    // Unlock next level
    if (currentLevelIdx < levels.length - 1) {
      levels[currentLevelIdx + 1].unlocked = true;
    }

    saveLevels(levels);

    // Update user profile
    const profile = getUserProfile();
    if (profile) {
      profile.totalScore += score * 10;
      if (!profile.completedLevels.includes(parseInt(levelId))) {
        profile.completedLevels.push(parseInt(levelId));
      }
      saveUserProfile(profile);
    }

    router.push('/dashboard');
  };

  if (!level) return null;

  if (showMiniGame) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <MiniGame onComplete={handleMiniGameComplete} />
      </div>
    );
  }

  const currentQuestion = level.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / level.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-muted-foreground hover:text-white">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Chiqish
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-headline text-primary">{level.title}</h1>
            <p className="text-sm text-muted-foreground">Savol {currentQuestionIndex + 1} / {level.questions.length}</p>
          </div>
          <Badge variant="outline" className="text-accent border-accent/20 px-3 py-1">
            {currentQuestion.subject}
          </Badge>
        </div>

        <Progress value={progress} className="h-2 mb-12 bg-white/5" />

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
    </div>
  );
}
