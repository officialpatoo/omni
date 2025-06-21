import {genkit, GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: any;

export function getAi() {
  if (aiInstance) {
    return aiInstance;
  }

  try {
    const googleApiKey =
      process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!googleApiKey) {
      console.error(
        '\nERROR: Google API key not found. Please set GOOGLE_API_KEY in your .env file.\n'
      );
      // Initialize Genkit without any plugins, which will result in errors
      // when trying to use AI features, but the server should start.
      aiInstance = genkit();
    } else {
      // Initialize Genkit with the Google AI plugin
      aiInstance = genkit({
        plugins: [googleAI()],
        model: 'googleai/gemini-2.0-flash',
      });
    }
  } catch (e) {
    const error = e as GenkitError;
    console.error(
      `\nERROR: Failed to initialize Google AI plugin. Genkit will be initialized without it. Details: ${error.message}\n`
    );
    // Fallback to a plain Genkit instance if the plugin fails
    aiInstance = genkit();
  }
  
  return aiInstance;
}
