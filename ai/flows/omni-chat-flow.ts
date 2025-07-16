
'use server';
/**
 * @fileOverview OMNI conversational flow.
 *
 * - invokeOmniChat - Handles chat interactions, potentially using tools.
 * - OmniChatInput - Input type for the flow.
 * - OmniChatOutput - Output type for the flow.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';
import { getSearchTool } from '@/ai/tools/searchTool'; // Import the search tool

const OmniChatInputSchema = z.object({
  prompt: z.string().describe("The user's message or question."),
  model: z
    .string()
    .optional()
    .describe(
      'The AI model to use (e.g., gemini-2.0-flash, gemini-2.5-flash). Defaults to the one configured in genkit.ts.',
    ),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An optional image provided by the user, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
    ),
  useRealtimeSearch: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to enable real-time search capabilities for the query.'),
});
export type OmniChatInput = z.infer<typeof OmniChatInputSchema>;

const OmniChatOutputSchema = z.object({
  responseText: z.string().describe("The AI's textual response."),
  suggestions: z
    .array(z.string())
    .optional()
    .describe('A few brief, relevant follow-up questions or suggestions for the user. These should be concise and directly related to the conversation topic.'),
});
export type OmniChatOutput = z.infer<typeof OmniChatOutputSchema>;

export async function invokeOmniChat(
  input: OmniChatInput,
): Promise<OmniChatOutput> {
  const ai = getAi();
  const searchTool = getSearchTool();

  const omniChatFlow = ai.defineFlow(
    {
      name: 'omniChatFlow',
      inputSchema: OmniChatInputSchema,
      outputSchema: OmniChatOutputSchema,
    },
    async (flowInput) => {
      console.log('OMNI Genkit Flow (omniChatFlow) received input:', flowInput);

      const promptMessage: ({
        role: string;
        text: string;
      } | { media: { url: string } })[] = [];
      let systemPromptText = 'You are OMNI, a helpful assistant. After your main response, provide a few brief, relevant follow-up questions or actions as suggestions for the user. These should be concise and directly related to the conversation topic.';

      if (flowInput.useRealtimeSearch) {
        systemPromptText +=
          " If the user's query seems to require current information, browsing the web, or finding specific facts you don't know (such as current weather, climate data, or forecasts), use the 'searchTool' to get up-to-date information.";
        systemPromptText +=
          ' Incorporate the search results into your answer. Clearly indicate when you are using the search tool.';
        systemPromptText +=
          " When providing weather or climate information obtained from the searchTool, try to present it in a structured, matrix-like format if possible, for example, using a Markdown table for key details like Temperature, Humidity, Wind, Conditions, and a brief forecast if available. If a table isn't suitable, use clear bullet points for each piece of information.";
      }
      
       if (flowInput.imageDataUri) {
         systemPromptText += "\nThe user has provided an image. Your primary task is to analyze the image in conjunction with the text prompt. Do not use tools unless the user explicitly asks for external information related to the image."
      }

      promptMessage.push({
        role: 'system',
        text: systemPromptText,
      });

      if (flowInput.imageDataUri) {
        promptMessage.push({ media: { url: flowInput.imageDataUri } });
      }

      promptMessage.push({ text: flowInput.prompt });

      const validModels = ['gemini-2.0-flash', 'gemini-2.5-flash'];
      const modelToUse =
        flowInput.model && validModels.includes(flowInput.model.replace('googleai/', ''))
          ? `googleai/${flowInput.model.replace('googleai/', '')}`
          : 'googleai/gemini-2.0-flash';


      console.log(`Using model: ${modelToUse}`);
      console.log(`Search tool enabled: ${flowInput.useRealtimeSearch}`);

      const llmResponse = await ai.generate({
        model: modelToUse as any,
        prompt: promptMessage,
        tools: flowInput.useRealtimeSearch ? [searchTool] : [],
        output: {
            schema: OmniChatOutputSchema
        },
        config: {
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_LOW_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        },
      });

      const output = llmResponse.output || { responseText: llmResponse.text, suggestions: [] };

      return {
        responseText: output.responseText,
        suggestions: output.suggestions,
      };
    },
  );
  
  return omniChatFlow(input);
}
