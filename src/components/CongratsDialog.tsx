import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, ChevronRight } from 'lucide-react';

interface CongratsDialogProps {
  open: boolean;
  score: number;
  totalQuestions: number;
  onContinue: () => void;
}

export function CongratsDialog({ open, score, totalQuestions, onContinue }: CongratsDialogProps) {
  const percentage = (score / totalQuestions) * 100;
  const isPassed = percentage >= 80;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20 p-0 overflow-hidden text-center">
        <div className="bg-primary/10 py-8 relative">
          <Trophy className="w-20 h-20 text-accent mx-auto animate-bounce" />
          <div className="absolute top-4 left-4">
            <Star className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <div className="absolute top-10 right-10">
            <Star className="w-4 h-4 text-accent animate-pulse delay-75" />
          </div>
        </div>
        
        <div className="px-6 py-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-headline text-primary mb-2">
              {isPassed ? "Tabriklaymiz!" : "Deyarli uddaladingiz!"}
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground">
              {isPassed 
                ? "Siz ushbu bosqichni muvaffaqiyatli yakunladingiz!" 
                : "Keyingi bosqichga o'tish uchun kamida 80% natija kerak."}
            </DialogDescription>
          </DialogHeader>

          <div className="my-8">
            <div className="text-5xl font-headline text-accent mb-2">
              {percentage}%
            </div>
            <div className="text-sm text-muted-foreground uppercase tracking-widest">
              Sizning natijangiz
            </div>
            <div className="mt-4 text-muted-foreground">
              {score} ta to'g'ri javob / {totalQuestions} ta savoldan
            </div>
          </div>

          <Button 
            onClick={onContinue}
            className={isPassed ? "btn-primary w-full py-6 text-lg" : "btn-accent w-full py-6 text-lg"}
          >
            {isPassed ? "Mini-O'yinga o'tish" : "Qayta urinish"}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
