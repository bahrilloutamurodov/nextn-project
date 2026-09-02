export interface ParsedQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswerText: string;
  explanation?: string;
}

export interface QuizParseResult {
  questions: ParsedQuizQuestion[];
  errors: string[];
  totalParsed: number;
}

export function parseQuizText(rawText: string): QuizParseResult {
  const errors: string[] = [];
  const questions: ParsedQuizQuestion[] = [];

  if (!rawText || !rawText.trim()) {
    return { questions: [], errors: ["Matn kiritilmagan."], totalParsed: 0 };
  }

  // Split text by lines and parse blocks
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  
  let currentQuestionText = '';
  let currentOptions: string[] = [];
  let currentCorrectAnswer = '';
  let currentExplanation = '';

  function finalizeQuestion(qIndex: number) {
    if (!currentQuestionText) return;

    if (currentOptions.length < 2) {
      errors.push(`Savol ${qIndex + 1}: Kamida 2 ta variant bo'lishi kerak ("${currentQuestionText.slice(0, 30)}...")`);
      return;
    }

    let correctIdx = 0;
    const ansLower = currentCorrectAnswer.toLowerCase().trim();

    if (ansLower.includes('a') || ansLower === '0' || ansLower === '1') correctIdx = 0;
    else if (ansLower.includes('b') || ansLower === '2') correctIdx = 1;
    else if (ansLower.includes('c') || ansLower === '3') correctIdx = 2;
    else if (ansLower.includes('d') || ansLower === '4') correctIdx = 3;

    questions.push({
      question: currentQuestionText,
      options: [...currentOptions],
      correctIndex: correctIdx,
      correctAnswerText: currentOptions[correctIdx] || currentOptions[0],
      explanation: currentExplanation
    });

    // Reset current buffers
    currentQuestionText = '';
    currentOptions = [];
    currentCorrectAnswer = '';
    currentExplanation = '';
  }

  let questionCounter = 0;

  lines.forEach((line) => {
    // Check if line starts a new question, e.g., "1.", "1)", "Savol 1:"
    const questionMatch = line.match(/^(\d+)[\.\)]\s*(.+)/) || line.match(/^(Savol\s*\d+:?)\s*(.+)/i);
    const optionMatch = line.match(/^([A-Da-d])[\.\)]\s*(.+)/);
    const answerMatch = line.match(/^(Javob|Answer|To'g'ri javob):\s*(.+)/i);
    const explanationMatch = line.match(/^(Izoh|Tushuntirish|Explanation):\s*(.+)/i);

    if (questionMatch) {
      if (currentQuestionText) {
        finalizeQuestion(questionCounter);
        questionCounter++;
      }
      currentQuestionText = questionMatch[2] || line;
    } else if (optionMatch) {
      currentOptions.push(optionMatch[2].trim());
    } else if (answerMatch) {
      currentCorrectAnswer = answerMatch[2].trim();
    } else if (explanationMatch) {
      currentExplanation = explanationMatch[2].trim();
    } else if (!currentOptions.length && currentQuestionText) {
      // Append multi-line question text
      currentQuestionText += ' ' + line;
    }
  });

  if (currentQuestionText) {
    finalizeQuestion(questionCounter);
  }

  return {
    questions,
    errors,
    totalParsed: questions.length
  };
}
