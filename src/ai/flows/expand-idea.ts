'use server';
/**
 * @fileOverview A flow for expanding on a given idea or text.
 *
 * - expandIdea - A function that takes text and provides a more detailed expansion.
 * - ExpandIdeaInput - The input type for the expandIdea function.
 * - ExpandIdeaOutput - The return type for the expandIdea function.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';

const ExpandIdeaInputSchema = z.object({
  text: z.string().describe('The text or idea to expand upon.'),
});
export type ExpandIdeaInput = z.infer<typeof ExpandIdeaInputSchema>;

const ExpandIdeaOutputSchema = z.object({
  expandedText: z.string().describe('The expanded and more detailed text.'),
});
export type ExpandIdeaOutput = z.infer<typeof ExpandIdeaOutputSchema>;

export async function expandIdea(
  input: ExpandIdeaInput,
): Promise<ExpandIdeaOutput> {
  const ai = getAi();

  const expandIdeaFlow = ai.defineFlow(
    {
      name: 'expandIdeaFlow',
      inputSchema: ExpandIdeaInputSchema,
      outputSchema: ExpandIdeaOutputSchema,
    },
    async (flowInput) => {
      const prompt = ai.definePrompt({
        name: 'expandIdeaPrompt',
        input: { schema: ExpandIdeaInputSchema },
        output: { schema: ExpandIdeaOutputSchema },
        prompt: `You are a helpful assistant that elaborates on ideas. Expand on the following text, providing more detail, depth, and examples where appropriate.

Original text:
"""
{{{text}}}
"""

Expanded version:`,
      });
      const { output } = await prompt(flowInput);
      return output!;
    },
  );

  return expandIdeaFlow(input);
}
