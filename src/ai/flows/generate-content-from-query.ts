
'use server';
/**
 * @fileOverview Generates creative content from a user query.
 *
 * - generateContentFromQuery - An async function that returns content based on the input query.
 * - GenerateContentInput - The input type for the generateContentFromQuery function.
 * - GenerateContentOutput - The type for the returned content object.
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

// Define the prompt at the module's top level
const contentPrompt = ai.definePrompt({
  name: 'contentGenerationPrompt', // Renamed for clarity, was contentGenerationStreamingPrompt
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
    const {output} = await contentPrompt(input);
    
    if (!output || typeof output.content !== 'string') {
      console.error('[generateContentFromQuery] Invalid or missing content in AI response:', output);
      return { content: "Sorry, I couldn't generate a valid response." };
    }

    console.log('[generateContentFromQuery] AI response received:', output.content);
    return output;

  } catch (error) {
    console.error('[generateContentFromQuery] Error during content generation:', error);
    // In case of an error, return a user-friendly error message.
    return { content: "Sorry, I encountered an error while generating content." };
  }
}
