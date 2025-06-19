
'use server';
/**
 * @fileOverview Generates creative content from a user query, streaming the output.
 *
 * - generateContentFromQuery - An async generator function that yields content chunks based on the input query.
 * - GenerateContentInput - The input type for the generateContentFromQuery function.
 * - GenerateContentOutput - The type for each yielded content chunk (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  query: z.string().describe('The query to generate content from.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

// The output of each chunk in the stream will be a string.
export type GenerateContentOutput = string;

// Define the prompt at the module's top level
// The prompt's output schema should be z.string() for raw text streaming.
const contentPrompt = ai.definePrompt({
  name: 'contentGenerationStreamingPrompt',
  input: {schema: GenerateContentInputSchema},
  output: {schema: z.string()}, // Expect raw string output from the model
  prompt: `You are a creative content generator. Generate content based on the following query:\n\nQuery: {{{query}}}`,
});

// This is the main exported function that page.tsx calls
export async function* generateContentFromQuery(
  input: GenerateContentInput
): AsyncGenerator<GenerateContentOutput, void, undefined> {
  console.log('[generateContentFromQuery Stream] Flow started with input:', input);
  let hasYieldedAnything = false;

  try {
    const {stream, response} = ai.generateStream({ // Genkit 1.x syntax for streaming
      prompt: contentPrompt,
      input: input,
    });

    for await (const chunk of stream) {
      if (chunk.output && typeof chunk.output === 'string') {
        console.log('[generateContentFromQuery Stream] Yielding chunk:', chunk.output);
        yield chunk.output;
        hasYieldedAnything = true;
      } else {
        // This case should ideally not happen if prompt output schema is z.string()
        console.warn('[generateContentFromQuery Stream] Unexpected non-string chunk output:', chunk.output);
      }
    }
    await response; // Wait for the full response to complete if needed for final cleanup/logging

    // Ensure at least one empty string is yielded if the stream was empty,
    // to satisfy consumers expecting at least one value.
    if (!hasYieldedAnything) {
      console.log('[generateContentFromQuery Stream] No content yielded from AI. Yielding empty string.');
      yield "";
    }
    console.log('[generateContentFromQuery Stream] Flow finished.');

  } catch (error) {
    console.error('[generateContentFromQuery Stream] Error during content generation:', error);
    // In case of an error, yield a user-friendly error message string.
    yield "Sorry, I encountered an error while generating content.";
  }
}
