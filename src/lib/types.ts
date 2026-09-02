export type Subject = 'Ona tili' | 'Matematika' | 'Algebra' | 'Geometriya' | 'Fizika' | 'Kimyo' | 'Biologiya' | 'Ingliz tili' | 'Tarix' | 'Mantiq' | 'Tabiat' | 'Aralash';

export type UserRole = 'admin' | 'teacher' | 'student';

export type GradeTier = 'junior' | 'middle' | 'senior'; // 5-7, 8-9, 10-11

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  subject: Subject;
  explanation?: string;
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

export interface SubjectStage {
  id: string;
  gradeTier: GradeTier;
  grade: number;
  subject: Subject;
  stageNumber: number;
  title: string;
  description: string;
  timeLimitSeconds?: number;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}

export interface UserProfile {
  id?: string;
  name: string;
  login?: string;
  studentId?: string;
  grade: string; // e.g. "8-A", "10-B"
  gradeLevel?: number; // 5..11
  gradeTier?: GradeTier; // 'junior' | 'middle' | 'senior'
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

