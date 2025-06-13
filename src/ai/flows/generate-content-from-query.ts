// src/ai/flows/generate-content-from-query.ts
'use server';
/**
 * @fileOverview Generates creative content from a user query.
 *
 * - generateContentFromQuery - A function that generates content based on the input query.
 * - GenerateContentInput - The input type for the generateContentFromQuery function.
 * - GenerateContentOutput - The return type for the generateContentFromQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  query: z.string().describe('The query to generate content from.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  content: z.string().describe('The generated content.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContentFromQuery(input: GenerateContentInput): Promise<GenerateContentOutput> {
  return generateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {schema: GenerateContentInputSchema},
  output: {schema: GenerateContentOutputSchema},
  prompt: `You are a creative content generator. Generate content based on the following query:\n\nQuery: {{{query}}}`,
});

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
