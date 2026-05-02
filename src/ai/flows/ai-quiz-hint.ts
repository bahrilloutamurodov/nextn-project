'use server';
/**
 * @fileOverview This file implements a Genkit flow for providing subtle AI-generated hints
 * for quiz questions, tailored to a 5th-grade student's incorrect answer without
 * directly revealing the solution.
 *
 * - aiQuizHint - An async function that provides a subtle hint for a quiz question.
 * - AiQuizHintInput - The input type for the aiQuizHint function.
 * - AiQuizHintOutput - The return type for the aiQuizHint function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiQuizHintInputSchema = z.object({
  question: z.string().describe('The full quiz question.'),
  studentAnswer: z.string().describe('The student\u0027s incorrect answer to the question.'),
  subject: z
    .enum(['Ona tili', 'Matematika', 'Ingliz tili', 'Tarix'])
    .describe('The subject of the quiz question.'),
  gradeLevel: z.number().int().min(1).max(12).describe('The grade level of the student.'),
  previousHints: z.array(z.string()).optional().describe('An array of hints previously given for this question, to avoid repetition.'),
});
export type AiQuizHintInput = z.infer<typeof AiQuizHintInputSchema>;

const AiQuizHintOutputSchema = z.object({
  hint: z.string().describe('A subtle hint to guide the student towards the correct answer.'),
});
export type AiQuizHintOutput = z.infer<typeof AiQuizHintOutputSchema>;

export async function aiQuizHint(input: AiQuizHintInput): Promise<AiQuizHintOutput> {
  return aiQuizHintFlow(input);
}

const aiQuizHintPrompt = ai.definePrompt({
  name: 'aiQuizHintPrompt',
  input: { schema: AiQuizHintInputSchema },
  output: { schema: AiQuizHintOutputSchema },
  prompt: `You are a helpful and patient tutor for a 5th-grade student. Your goal is to provide subtle hints for quiz questions to help the student understand the concept and arrive at the correct answer on their own, without directly giving away the solution.\n\nThe student is currently working on a \"{{{subject}}}\" question for a {{gradeLevel}}-grade level.\n\nHere is the question the student is struggling with:\nQuestion: \"{{{question}}}\"\n\nThe student's incorrect answer was: \"{{{studentAnswer}}}\"\n\nPrevious hints given for this question (if any):\n{{#if previousHints}}\n{{#each previousHints}}- {{{this}}}\n{{/each}}\n{{else}}\nNone yet.\n{{/if}}\n\nBased on the question, the student's incorrect answer, and any previous hints, provide a new, subtle, and encouraging hint. Focus on guiding the student's thinking process or pointing them towards a relevant concept they might have overlooked. Do NOT give the direct answer. Keep the hint concise and appropriate for a 5th-grade student.`,
});

const aiQuizHintFlow = ai.defineFlow(
  {
    name: 'aiQuizHintFlow',
    inputSchema: AiQuizHintInputSchema,
    outputSchema: AiQuizHintOutputSchema,
  },
  async (input) => {
    const { output } = await aiQuizHintPrompt(input);
    return output!;
  },
);
