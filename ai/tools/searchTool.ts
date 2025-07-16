/**
 * @fileOverview A Genkit tool for performing web searches using the Tavily API.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'zod';
import axios from 'axios';

// Define the schema for the tool's input
const SearchToolInputSchema = z.object({
  query: z.string().describe('The search query to look up on the web.'),
});

// Define the schema for the search result objects from Tavily
const TavilySearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  score: z.number(),
  raw_content: z.string().optional().nullable(),
});

// Define the schema for the entire Tavily API response
const TavilyResponseSchema = z.object({
  answer: z.string().optional(),
  query: z.string(),
  response_time: z.number(),
  results: z.array(TavilySearchResultSchema),
});

export function getSearchTool() {
  const ai = getAi();
  return ai.defineTool(
    {
      name: 'searchTool',
      description:
        'Provides up-to-date information from a web search using the Tavily API. Use this for queries about current events, facts, or any topic requiring real-time data like weather or news.',
      inputSchema: SearchToolInputSchema,
      outputSchema: z
        .string()
        .describe('A summary of the top search results, including source URLs.'),
    },
    async (input) => {
      console.log(`[Search Tool] Received query: ${input.query}`);
      const apiKey = process.env.TAVILY_API_KEY;

      if (!apiKey) {
        console.error('[Search Tool] TAVILY_API_KEY is not set.');
        return 'Search tool is not configured. The TAVILY_API_KEY is missing.';
      }

      try {
        const response = await axios.post(
          'https://api.tavily.com/search',
          {
            api_key: apiKey,
            query: input.query,
            search_depth: 'advanced',
            include_answer: true,
            max_results: 5,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const tavilyData = TavilyResponseSchema.parse(response.data);

        let formattedResult = '';

        if (tavilyData.answer) {
          formattedResult += `**Answer:** ${tavilyData.answer}\n\n`;
        }

        if (tavilyData.results && tavilyData.results.length > 0) {
          formattedResult += '**Sources:**\n';
          tavilyData.results.forEach((result) => {
            formattedResult += `- **${result.title}**: ${result.content.substring(0, 200)}... ([Source](${result.url}))\n`;
          });
        } else {
          formattedResult = 'No results found for your query.';
        }
        
        console.log(`[Search Tool] Returning formatted results for query: "${input.query}"`);
        return formattedResult;

      } catch (error) {
        console.error('[Search Tool] Error fetching search results:', error);
        if (axios.isAxiosError(error) && error.response) {
            return `Error from search API: ${error.response.status} ${error.response.data?.message || 'Unknown error'}`;
        }
        return `An unexpected error occurred while searching for: "${input.query}"`;
      }
    }
  );
}
