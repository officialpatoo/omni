/**
 * @fileOverview A Genkit tool for performing web searches.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the tool's input
const SearchToolInputSchema = z.object({
  query: z.string().describe('The search query to look up on the web.'),
});

// Export a function that returns the tool, to allow for lazy initialization of the AI instance.
export function getSearchTool() {
  const ai = getAi();
  return ai.defineTool(
    {
      name: 'searchTool',
      description:
        'Provides up-to-date information from a web search. Use this for queries about current events, facts, or any topic requiring real-time data like weather or news.',
      inputSchema: SearchToolInputSchema,
      outputSchema: z.string().describe('A summary of the search results.'),
    },
    async (input) => {
      console.log(`[Search Tool] Received query: ${input.query}`);

      // In a real application, you would integrate with a search API like Google Search, Bing, etc.
      // For this prototype, we'll return a mocked response.
      const mockResults: { [key: string]: string } = {
        'latest technology trends':
          'Latest technology trends include advancements in Generative AI, the expansion of the Internet of Things (IoT), and breakthroughs in quantum computing. AI is becoming more integrated into daily applications, from content creation to complex problem-solving.',
        'weather in san francisco':
          'The weather in San Francisco is currently 65°F (18°C) and foggy. A high of 68°F is expected. Wind is coming from the west at 15 mph.',
        'who won the last world cup':
          'Argentina won the 2022 FIFA World Cup, defeating France in the final.',
      };

      const queryKey = input.query.toLowerCase();
      const result =
        mockResults[queryKey] ||
        `Mock Search Result: For the query "${input.query}", a real search API would return current articles and data. For instance, it might show top news headlines, recent scientific papers, or market data depending on the query's nature.`;

      console.log(`[Search Tool] Returning mock result: ${result}`);
      return result;
    }
  );
}
