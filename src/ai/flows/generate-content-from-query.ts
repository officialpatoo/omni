
'use server';
/**
 * @fileOverview Generates creative content from a user query, streamed chunk by chunk.
 *
 * - generateContentFromQuery - An async generator function that streams content based on the input query.
 * - GenerateContentInput - The input type for the generateContentFromQuery function.
 * - GenerateContentOutput - The type for each chunk of the generated content (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  query: z.string().describe('The query to generate content from.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

// Output schema for each chunk yielded by the stream
const GenerateContentChunkSchema = z.string().describe("A chunk of the generated content.");
export type GenerateContentOutput = z.infer<typeof GenerateContentChunkSchema>; // This is essentially `string`

// Define the prompt at the module's top level
const contentStreamPrompt = ai.definePrompt({
  name: 'contentStreamPrompt', // Unique name
  input: {schema: GenerateContentInputSchema},
  output: {schema: z.string()}, // Prompt's output is raw string
  prompt: `You are a creative content generator. Generate content based on the following query:\n\nQuery: {{{query}}}`,
});

// This is the main exported function that page.tsx calls
export async function* generateContentFromQuery(
  input: GenerateContentInput
): AsyncGenerator<string, void, undefined> {
  console.log('[generateContentFromQuery] Flow started with input:', input);
  let hasYieldedAnything = false;

  try {
    const {stream, response} = ai.generateStream({ // Correct Genkit 1.x usage
      prompt: contentStreamPrompt, // Use the top-level defined prompt
      input: input,
    });

    for await (const chunk of stream) { // Correct iteration
      if (typeof chunk.output === 'string') {
        // console.log('[generateContentFromQuery] Yielding chunk:', chunk.output); // Can be noisy
        yield chunk.output;
        hasYieldedAnything = true;
      } else if (chunk.output !== null && chunk.output !== undefined) {
        console.warn(
          '[generateContentFromQuery] Unexpected non-string chunk output:',
          chunk.output
        );
      }
    }
    await response; // Wait for the full response to complete
    console.log('[generateContentFromQuery] Stream finished.');

  } catch (error) {
    console.error('[generateContentFromQuery] Error during streaming:', error);
    // Fall through to the final check to yield an empty string if needed
  }

  if (!hasYieldedAnything) {
    console.warn(
      '[generateContentFromQuery] No content yielded from stream. Attempting to yield final empty string to satisfy schema.'
    );
    console.log('[generateContentFromQuery] DIAGNOSTIC: About to yield empty string.');
    yield ""; // Ensure at least one yield
    console.log('[generateContentFromQuery] DIAGNOSTIC: Successfully yielded empty string.');
  } else {
    console.log('[generateContentFromQuery] DIAGNOSTIC: Content was yielded, not yielding final empty string.');
  }
}
