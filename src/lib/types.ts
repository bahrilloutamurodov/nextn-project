export type Subject = 'Ona tili' | 'Matematika' | 'Ingliz tili' | 'Tarix' | 'Mantiq' | 'Tabiat';

export type UserRole = 'admin' | 'teacher' | 'student';

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
  id?: string;
  name: string;
  login?: string;
  studentId?: string;
  grade: string; // e.g. "5-A" or "5-Sinf"
  gradeLevel?: number; // e.g. 5
  classLetter?: string; // e.g. "A"
  currentLevel: number;
  totalScore: number;
  completedLevels: number[];
  averageScore: number;
  totalTime: number;
  status?: 'active' | 'inactive';
  role?: UserRole;
  lastActive?: string;
}

export interface TeacherProfile {
  id: string;
  full_name: string;
  login: string;
  password?: string;
  subject: string;
  assigned_classes: string[];
  role: 'teacher';
  createdAt?: string;
}

