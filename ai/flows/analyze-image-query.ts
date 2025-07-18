
'use server';

/**
 * @fileOverview Image analysis flow that takes an image and a question as input, and returns an answer based on the image content.
 *
 * - analyzeImageQuery - A function that handles the image analysis process.
 * - AnalyzeImageQueryInput - The input type for the analyzeImageQuery function.
 * - AnalyzeImageQueryOutput - The return type for the analyzeImageQuery function.
 */

import { ai } from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageQueryInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  query: z.string().describe('The question about the image.'),
});
export type AnalyzeImageQueryInput = z.infer<typeof AnalyzeImageQueryInputSchema>;

const AnalyzeImageQueryOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the image.'),
});
export type AnalyzeImageQueryOutput = z.infer<typeof AnalyzeImageQueryOutputSchema>;


const prompt = ai.definePrompt({
  name: 'analyzeImageQueryPrompt',
  input: {schema: AnalyzeImageQueryInputSchema},
  output: {schema: AnalyzeImageQueryOutputSchema},
  prompt: `You are an AI that analyzes images and answers questions about them.\n\nHere is the image:\n{{media url=photoDataUri}}\n\nHere is the question:\n{{{query}}}\n\nAnswer the question based on the image content.`,
});

const analyzeImageQueryFlow = ai.defineFlow(
  {
    name: 'analyzeImageQueryFlow',
    inputSchema: AnalyzeImageQueryInputSchema,
    outputSchema: AnalyzeImageQueryOutputSchema,
  },
  async (flowInput) => {
    const {output} = await prompt(flowInput);
    return output!;
  }
);

export async function analyzeImageQuery(input: AnalyzeImageQueryInput): Promise<AnalyzeImageQueryOutput> {
  return analyzeImageQueryFlow(input);
}
