'use server';
/**
 * @fileOverview A flow for improving a user's prompt based on an AI response.
 *
 * - improvePrompt - A function that suggests a better prompt.
 * - ImprovePromptInput - The input type for the improvePrompt function.
 * - ImprovePromptOutput - The return type for the improvePrompt function.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';

const ImprovePromptInputSchema = z.object({
  originalPrompt: z.string().describe("The user's original prompt."),
  aiResponse: z.string().describe("The AI's response to the original prompt."),
});
export type ImprovePromptInput = z.infer<typeof ImprovePromptInputSchema>;

const ImprovePromptOutputSchema = z.object({
  improvedPrompt: z
    .string()
    .describe('A suggested, improved prompt for the user.'),
});
export type ImprovePromptOutput = z.infer<typeof ImprovePromptOutputSchema>;

export async function improvePrompt(
  input: ImprovePromptInput,
): Promise<ImprovePromptOutput> {
  const ai = getAi();
  const improvePromptFlow = ai.defineFlow(
    {
      name: 'improvePromptFlow',
      inputSchema: ImprovePromptInputSchema,
      outputSchema: ImprovePromptOutputSchema,
    },
    async (flowInput) => {
      const prompt = ai.definePrompt({
        name: 'improvePromptTemplate',
        input: { schema: ImprovePromptInputSchema },
        output: { schema: ImprovePromptOutputSchema },
        prompt: `You are a prompt engineering expert. Your goal is to help users improve their prompts to get better responses from an AI.

Analyze the user's original prompt and the AI's response. Then, suggest a revised prompt that is clearer, more specific, and provides more context. The improved prompt should be designed to elicit a more detailed and accurate answer from the AI.

Explain briefly why the new prompt is better.

Original Prompt:
"""
{{{originalPrompt}}}
"""

AI's Response:
"""
{{{aiResponse}}}
"""

Improved Prompt Suggestion:`,
      });
      const { output } = await prompt(flowInput);
      return output!;
    },
  );
  return improvePromptFlow(input);
}
