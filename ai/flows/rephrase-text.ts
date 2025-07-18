'use server';
/**
 * @fileOverview A flow for rephrasing text into different styles.
 *
 * - rephraseText - A function that takes text and a style, and returns the rephrased version.
 * - RephraseTextInput - The input type for the rephraseText function.
 * - RephraseTextOutput - The return type for the rephraseText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RephraseTextInputSchema = z.object({
  text: z.string().describe('The text to rephrase.'),
  style: z
    .enum(['simpler', 'more formal'])
    .describe('The style to rephrase the text into.'),
});
export type RephraseTextInput = z.infer<typeof RephraseTextInputSchema>;

const RephraseTextOutputSchema = z.object({
  rephrasedText: z.string().describe('The rephrased text.'),
});
export type RephraseTextOutput = z.infer<typeof RephraseTextOutputSchema>;


const prompt = ai.definePrompt({
  name: 'rephraseTextPrompt',
  input: { schema: RephraseTextInputSchema },
  output: { schema: RephraseTextOutputSchema },
  prompt: `You are an expert editor. Rephrase the following text to be {{style}}. Do not add any commentary, just provide the rephrased text.

Original text:
"""
{{{text}}}
"""

Rephrased text:`,
});

const rephraseTextFlow = ai.defineFlow(
  {
    name: 'rephraseTextFlow',
    inputSchema: RephraseTextInputSchema,
    outputSchema: RephraseTextOutputSchema,
  },
  async (flowInput) => {
    const { output } = await prompt(flowInput);
    return output!;
  },
);

export async function rephraseText(
  input: RephraseTextInput,
): Promise<RephraseTextOutput> {
  return rephraseTextFlow(input);
}
