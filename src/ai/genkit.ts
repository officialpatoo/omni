import { Genkit, genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

let aiInstance: Genkit | undefined;

export function getAi(): Genkit {
  if (aiInstance) {
    return aiInstance;
  }

  const geminiApiKey =
    process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_PLACEHOLDER';

  const plugins = [];
  if (geminiApiKey !== 'YOUR_GEMINI_API_KEY_PLACEHOLDER') {
    plugins.push(googleAI({ apiKey: geminiApiKey }));
  } else if (process.env.NODE_ENV !== 'test') {
    console.warn(
      '\n**************************************************************************************\n' +
        'WARNING: GEMINI_API_KEY is not set in your environment variables (.env file).\n' +
        "Genkit's Google AI plugin is disabled. AI features will not work.\n" +
        'Please provide a valid GEMINI_API_KEY in your .env file.\n' +
        '**************************************************************************************\n'
    );
  }

  aiInstance = genkit({
    plugins,
    model: 'googleai/gemini-2.0-flash',
  });

  return aiInstance;
}
