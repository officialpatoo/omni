'use server';
/**
 * @fileOverview A flow for translating text to a specified language.
 *
 * - translateText - A function that takes text and a language, and returns the translated version.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  language: z.string().describe('The target language to translate the text into.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;


const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `You are a skilled translator. Translate the following text into {{language}}. Provide only the translated text.

Original text:
"""
{{{text}}}
"""

Translated text:`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (flowInput) => {
    const { output } = await prompt(flowInput);
    return output!;
  },
);

export async function translateText(
  input: TranslateTextInput,
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}
