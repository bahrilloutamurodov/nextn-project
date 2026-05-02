import { Level, Question, Subject } from './types';

const subjects: Subject[] = ['Ona tili', 'Matematika', 'Ingliz tili', 'Tarix'];

const generateQuestions = (levelId: number): Question[] => {
  const qs: Question[] = [];
  for (let i = 1; i <= 10; i++) {
    const subject = subjects[i % 4];
    let qText = '';
    let options: string[] = [];
    let correct = '';

    if (subject === 'Matematika') {
      const a = levelId * 5 + i;
      const b = levelId * 3 + 2;
      qText = `${a} + ${b} nechaga teng?`;
      const ans = a + b;
      options = [ans.toString(), (ans + 2).toString(), (ans - 1).toString(), (ans * 2).toString()].sort();
      correct = ans.toString();
    } else if (subject === 'Ona tili') {
      qText = `Quyidagi so'zlardan qaysi biri sifat? (Daraja ${levelId}, Savol ${i})`;
      options = ['Chiroyli', 'Yugurmoq', 'Kitob', 'U'];
      correct = 'Chiroyli';
    } else if (subject === 'Ingliz tili') {
      qText = `How do you say "Olma" in English?`;
      options = ['Apple', 'Banana', 'Cherry', 'Date'];
      correct = 'Apple';
    } else {
      qText = `O'zbekiston mustaqilligi qachon e'lon qilingan?`;
      options = ['1991-yil 1-sentabr', '1990-yil 31-avgust', '1992-yil 8-dekabr', '1991-yil 21-mart'];
      correct = '1991-yil 1-sentabr';
    }

    qs.push({
      id: `l${levelId}-q${i}`,
      text: qText,
      options,
      correctAnswer: correct,
      subject
    });
  }
  return qs;
};

export const INITIAL_LEVELS: Level[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `${i + 1}-Bosqich`,
  description: `${i + 1}-darajadagi bilimingizni sinab ko'ring`,
  questions: generateQuestions(i + 1),
  unlocked: i === 0,
  completed: false,
  highScore: 0
}));
