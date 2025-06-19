
'use server';
/**
 * @fileOverview Generates creative content from a user query.
 *
 * - generateContentFromQuery - An async function that returns content based on the input query.
 * - GenerateContentInput - The input type for the generateContentFromQuery function.
 * - GenerateContentOutput - The type for the generated content.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  query: z.string().describe('The query to generate content from.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  content: z.string().describe("The generated content."),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

// Define the prompt at the module's top level
const contentGenerationPrompt = ai.definePrompt({
  name: 'contentGenerationPrompt',
  input: {schema: GenerateContentInputSchema},
  output: {schema: GenerateContentOutputSchema}, 
  prompt: `You are a creative content generator. Generate content based on the following query:\n\nQuery: {{{query}}}`,
});

// This is the main exported function that page.tsx calls
export async function generateContentFromQuery(
  input: GenerateContentInput
): Promise<GenerateContentOutput> {
  console.log('[generateContentFromQuery] Flow started with input:', input);

  try {
    const {output} = await contentGenerationPrompt(input); // Correct Genkit 1.x usage for non-streaming

    if (!output || typeof output.content !== 'string') {
      console.warn(
        '[generateContentFromQuery] AI did not return valid content. Returning empty content.'
      );
      return { content: "" };
    }
    
    console.log('[generateContentFromQuery] Flow finished with output:', output);
    return output;

  } catch (error) {
    console.error('[generateContentFromQuery] Error during content generation:', error);
    // In case of an error, return a structured error message or re-throw
    // For now, returning empty content to satisfy schema if error handling is basic.
    // A more robust solution might involve specific error types or messages.
    return { content: "Sorry, I encountered an error while generating content." };
  }
}
