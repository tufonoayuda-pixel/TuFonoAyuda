'use server';

/**
 * @fileOverview An AI flow to analyze scientific reference documents.
 *
 * - analyzeReferenceDocument - Extracts key information from a scientific document.
 */
import { ai, MODELS } from '@/ai/genkit';
import {
  AnalyzeReferenceDocumentInputSchema,
  AnalyzeReferenceDocumentOutputSchema,
} from '@/ai/schemas';
import type { AnalyzeReferenceDocumentInput, AnalyzeReferenceDocumentOutput } from '@/lib/types';


export async function analyzeReferenceDocument(
  input: AnalyzeReferenceDocumentInput
): Promise<AnalyzeReferenceDocumentOutput> {
    const prompt = `You are an expert speech-language pathology research assistant. Analyze the following document and extract the requested information. Focus on the text content.

    Extract the following fields:
    - title: The full title of the article or book chapter.
    - authors: The names of all authors, separated by commas.
    - year: The year it was published.
    - source: The name of the scientific journal, conference, or book publisher.
    - evidenceLevel: If mentioned, the level of evidence (e.g., "1a", "IIb", "Systematic Review"). If not mentioned, leave this field empty.
    - therapeuticAreas: An array of strings with the key speech-language therapy areas addressed (e.g., "Articulation", "Child Language", "Dysphagia", "Voice", "Fluency").
    - summary: A brief and concise summary of the study or article, highlighting the main findings.

    IMPORTANT: The response must be a single, valid JSON object, without additional text or formatting markers.

    DOCUMENT CONTENT: {{media url=${input.documentDataUri}}}`;
    
    try {
        const result = await ai.generate({
            model: MODELS.GEMINI_1_5_PRO,
            prompt: prompt,
            output: {
                schema: AnalyzeReferenceDocumentOutputSchema,
            },
            config: {
                temperature: 0.2,
                maxOutputTokens: 1500
            }
        });
        if (!result.output) {
            throw new Error('The AI failed to process the document. Please try again.');
        }
        return result.output;
    } catch(error: any) {
        console.error("Error analyzing reference document:", error);
        throw new Error('Failed to analyze reference document');
    }
}
