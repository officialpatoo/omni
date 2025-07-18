
'use server';
/**
 * @fileOverview A Genkit flow for editing an image based on a text prompt.
 *
 * - editImage - A function that takes an image and a prompt, and returns a new edited image.
 * - EditImageInput - The input type for the editImage function.
 * - EditImageOutput - The return type for the editImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EditImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The original image to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The text description of the edits to apply to the image.'),
});
export type EditImageInput = z.infer<typeof EditImageInputSchema>;

const EditImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The edited image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EditImageOutput = z.infer<typeof EditImageOutputSchema>;

const editImageFlow = ai.defineFlow(
  {
    name: 'editImageFlow',
    inputSchema: EditImageInputSchema,
    outputSchema: EditImageOutputSchema,
  },
  async (flowInput) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
          { media: { url: flowInput.imageDataUri } },
          { text: flowInput.prompt }
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image editing failed to produce an image.');
    }

    return { imageDataUri: media.url };
  }
);

export async function editImage(
  input: EditImageInput
): Promise<EditImageOutput> {
  return editImageFlow(input);
}
