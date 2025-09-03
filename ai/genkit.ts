/**
 * @fileoverview This file initializes the Genkit AI platform with the Google AI plugin.
 *
 * It exports a configured `ai` object and a `MODELS` enum for easy access
 * to specific generative models throughout the application.
 *
 * By centralizing the Genkit initialization, we ensure that the same AI configuration
 * is used across all server-side components of the application.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

/**
 * Enum for easy access to the model identifiers.
 */
export enum MODELS {
  GEMINI_PRO = 'googleai/gemini-pro',
  GEMINI_1_5_PRO = 'googleai/gemini-1.5-pro-latest',
  // You can add other models here as needed, for example:
  // TEXT_EMBEDDING = 'googleai/text-embedding-004',
}
