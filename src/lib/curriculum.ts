import { SubjectStage, GradeTier, Subject } from './types';

export function getGradeTier(grade: number): GradeTier {
  if (grade >= 10) return 'senior';
  if (grade >= 8) return 'middle';
  return 'junior';
}

export function getTierTitle(tier: GradeTier): string {
  switch (tier) {
    case 'junior': return "Sarguzashtli bilimlar o'yini";
    case 'middle': return "Intellektual ligasi & Tezkor sinov";
    case 'senior': return "Akademik test & Kasbiy yo'nalish (DTM)";
  }
}

export function getTierSubTitle(tier: GradeTier): string {
  switch (tier) {
    case 'junior': return "5–7-sinflar uchun gamifikatsiyalangan interaktiv o'yin";
    case 'middle': return "8–9-sinflar uchun STEM fanlari va Speedrun mantiqiy ligasi";
    case 'senior': return "10–11-sinflar va abituriyentlar uchun DTM blok-test simulyatori";
  }
}

export const CENTRAL_CURRICULUM: SubjectStage[] = [
  // ----------------------------------------------------
  // TIER 1: JUNIOR (Grades 5 - 7)
  // ----------------------------------------------------
  {
    id: 'stage-5-1',
    gradeTier: 'junior',
    grade: 5,
    subject: 'Matematika',
    stageNumber: 1,
    title: 'Natural sonlar va ularning yozilishi',
    description: 'Xonali birliklar, natural sonlar va ularni taqqoslash',
    timeLimitSeconds: 60,
    questions: [
      { id: 'q5-1-1', question: '7439 sonidagi 4 raqami qaysi xonada turibdi?', options: ['Birliklar', 'O\'nliklar', 'Yuzliklar', 'Mingliklar'], correctIndex: 2, explanation: '7439 sonida 9 - birlik, 3 - o\'nlik, 4 - yuzlik, 7 - minglik.' },
      { id: 'q5-1-2', question: 'Eng kichik besh xonali natural son qaysi?', options: ['10000', '10001', '99999', '11111'], correctIndex: 0, explanation: 'Eng kichik besh xonali son 10000 hisoblanadi.' },
      { id: 'q5-1-3', question: '345 va 354 sonlarini taqqoslang:', options: ['345 > 354', '345 < 354', '345 = 354', 'Taqqoslab bo\'lmaydi'], correctIndex: 1, explanation: 'Yuzliklar teng, o\'nliklarda 4 < 5, demak 345 < 354.' }
    ]
  },
  {
    id: 'stage-6-1',
    gradeTier: 'junior',
    grade: 6,
    subject: 'Matematika',
    stageNumber: 1,
    title: 'Kasrlar va ularning xossalari',
    description: 'Oddiy va o\'nli kasrlar ustida amallar',
    timeLimitSeconds: 60,
    questions: [
      { id: 'q6-1-1', question: '3/4 va 2/3 kasrlari uchun umumiy maxraj qaysi?', options: ['6', '8', '12', '24'], correctIndex: 2, explanation: '4 va 3 ning eng kichik umumiy karralisi (EKUK) 12 dir.' },
      { id: 'q6-1-2', question: '0.25 kasrni oddiy kasr ko\'rinishida yozing:', options: ['1/2', '1/4', '2/5', '3/4'], correctIndex: 1, explanation: '0.25 = 25/100 = 1/4.' }
    ]
  },
  {
    id: 'stage-7-1',
    gradeTier: 'junior',
    grade: 7,
    subject: 'Ona tili',
    stageNumber: 1,
    title: 'Fonetika va Imlo qoidalari',
    description: 'Unli va undosh tovushlar tasnifi',
    timeLimitSeconds: 60,
    questions: [
      { id: 'q7-1-1', question: 'O\'zbek tilida nechta unli tovush bor?', options: ['5 ta', '6 ta', '10 ta', '24 ta'], correctIndex: 1, explanation: 'O\'zbek tilida 6 ta unli tovush bor: a, o, i, u, o\', e.' }
    ]
  },

  // ----------------------------------------------------
  // TIER 2: MIDDLE (Grades 8 - 9) SPEEDRUN & STEM
  // ----------------------------------------------------
  {
    id: 'stage-8-1',
    gradeTier: 'middle',
    grade: 8,
    subject: 'Algebra',
    stageNumber: 1,
    title: 'Qisqa ko\'paytirish formulalari',
    description: 'Kvadratlar ayirmasi va yig\'indining kvadrati',
    timeLimitSeconds: 35,
    questions: [
      { id: 'q8-1-1', question: '(a + b)² ifodaning yoyilmasini toping:', options: ['a² + b²', 'a² - 2ab + b²', 'a² + 2ab + b²', 'a² + ab + b²'], correctIndex: 2, explanation: '(a+b)² = a² + 2ab + b².' },
      { id: 'q8-1-2', question: 'x² - 16 ifodani ko\'paytuvchilarga ajrating:', options: ['(x - 4)(x + 4)', '(x - 16)(x + 16)', '(x - 4)²', '(x + 4)²'], correctIndex: 0, explanation: 'Kvadratlar ayirmasi: a² - b² = (a-b)(a+b).' }
    ]
  },
  {
    id: 'stage-8-2',
    gradeTier: 'middle',
    grade: 8,
    subject: 'Fizika',
    stageNumber: 1,
    title: 'Mexanik harakat va Tezlik formulasi',
    description: 'Vaqt, yo\'l va tezlik bog\'liqligi (v = s / t)',
    timeLimitSeconds: 30,
    questions: [
      { id: 'q8-2-1', question: 'Jism 2 soatda 120 km yo\'l bossa, uning tezligi qancha?', options: ['50 km/soat', '60 km/soat', '120 km/soat', '240 km/soat'], correctIndex: 1, explanation: 'v = s / t = 120 km / 2 soat = 60 km/soat.' },
      { id: 'q8-2-2', question: 'Xalqaro birliklar tizimida (SI) tezlik birligi nima?', options: ['km/h', 'm/s', 'cm/s', 'm/min'], correctIndex: 1, explanation: 'SI tizimida tezlik m/s larda o\'lchanadi.' }
    ]
  },
  {
    id: 'stage-9-1',
    gradeTier: 'middle',
    grade: 9,
    subject: 'Kimyo',
    stageNumber: 1,
    title: 'Mendeleyev davriy qonuni va atom tuzilishi',
    description: 'Proton, neytron va elektronlar sonini aniqlash',
    timeLimitSeconds: 30,
    questions: [
      { id: 'q9-1-1', question: 'Suvning kimyoviy formulasi qaysi?', options: ['CO2', 'H2O', 'NaCl', 'O2'], correctIndex: 1, explanation: 'Suv formulasi H2O.' },
      { id: 'q9-1-2', question: 'Atom yadrosidagi neytronlar zaryadi qanday?', options: ['Musbat (+)', 'Manfiy (-)', 'Zaryadsiz (0)', 'O\'zgaruvchan'], correctIndex: 2, explanation: 'Neytron neytral (zaryadsiz) zarrachadir.' }
    ]
  },

  // ----------------------------------------------------
  // TIER 3: SENIOR (Grades 10 - 11) DTM BLOCK EXAM SIMULATOR
  // ----------------------------------------------------
  {
    id: 'stage-10-dtm-1',
    gradeTier: 'senior',
    grade: 10,
    subject: 'Algebra',
    stageNumber: 1,
    title: 'DTM 1-Blok: Ko\'rsatkichli va Logarifmik tenglamalar',
    description: 'Abituriyentlar uchun DTM standartidagi akademik test',
    timeLimitSeconds: 90,
    questions: [
      { id: 'q10-1-1', question: 'log₂ (x - 3) = 3 tenglamaning ildizini toping:', options: ['x = 9', 'x = 11', 'x = 8', 'x = 5'], correctIndex: 1, explanation: 'log₂(x-3) = 3 => x - 3 = 2³ = 8 => x = 11.' },
      { id: 'q10-1-2', question: '2^(x+1) = 16 tenglamaning yechimi qaysi?', options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'], correctIndex: 1, explanation: '2^(x+1) = 2⁴ => x + 1 = 4 => x = 3.' },
      { id: 'q10-1-3', question: 'Triogonometriyaning asosiy ayniyati qaysi?', options: ['sin²x + cos²x = 1', 'sin x + cos x = 1', 'tg x * ctg x = 0', 'sin²x - cos²x = 1'], correctIndex: 0, explanation: 'sin²x + cos²x = 1 asosiy trigonometrik ayniyatdir.' }
    ]
  },
  {
    id: 'stage-11-dtm-1',
    gradeTier: 'senior',
    grade: 11,
    subject: 'Fizika',
    stageNumber: 1,
    title: 'DTM Asosiy Blok: Elektrodinamika va Kvant Fizikasi',
    description: 'Oliy ta\'lim muassasalariga kirish sinovlari simulyatori',
    timeLimitSeconds: 120,
    questions: [
      { id: 'q11-1-1', question: 'Om qonunining zanjir qismi uchun formulasi qaysi?', options: ['I = U / R', 'I = U * R', 'U = I / R', 'R = I * U'], correctIndex: 0, explanation: 'Om qonuni: Tok kuchi (I) kuchlanish (U) ga to\'g\'ri, qarshilik (R) ga teskari mutanosib.' },
      { id: 'q11-1-2', question: 'Fotonsiz yorug\'lik energiyasi formulasi (Eynshteyn formulasi):', options: ['E = h * ν', 'E = m * v', 'F = m * a', 'P = U * I'], correctIndex: 0, explanation: 'Foton energiyasi E = h*ν, bu yerda h - Plank doimiysi.' }
    ]
  }
];

export function getCurriculumForGrade(grade: number): SubjectStage[] {
  const tier = getGradeTier(grade);
  const gradeStages = CENTRAL_CURRICULUM.filter(s => s.grade === grade);
  
  if (gradeStages.length > 0) return gradeStages;

  // Fallback stages for specified grade tier
  return CENTRAL_CURRICULUM.filter(s => s.gradeTier === tier);
}

export function getSubjectsForGrade(grade: number): Subject[] {
  const tier = getGradeTier(grade);
  if (tier === 'senior') return ['Algebra', 'Geometriya', 'Fizika', 'Kimyo', 'Ona tili', 'Ingliz tili', 'Tarix'];
  if (tier === 'middle') return ['Algebra', 'Geometriya', 'Fizika', 'Kimyo', 'Biologiya', 'Ona tili', 'Ingliz tili'];
  return ['Matematika', 'Ona tili', 'Ingliz tili', 'Tabiat', 'Tarix'];
}
