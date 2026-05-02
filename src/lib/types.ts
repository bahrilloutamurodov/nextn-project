export type Subject = 'Ona tili' | 'Matematika' | 'Ingliz tili' | 'Tarix';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  subject: Subject;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  unlocked: boolean;
  completed: boolean;
  highScore: number;
}

export interface UserProfile {
  name: string;
  grade: string;
  currentLevel: number;
  totalScore: number;
  completedLevels: number[];
  averageScore: number;
  totalTime: number;
}
