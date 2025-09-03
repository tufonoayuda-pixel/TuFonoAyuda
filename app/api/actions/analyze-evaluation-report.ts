
'use server';

/**
 * @fileOverview Flujo de IA para analizar informes de evaluación fonoaudiológica.
 *
 * - analyzeEvaluationReport - Extrae fortalezas, debilidades y recomendaciones de un informe.
 */
import { ai, MODELS } from '@/ai/genkit';
import {
  AnalyzeEvaluationReportInputSchema,
  AnalyzeEvaluationReportOutputSchema,
} from '@/ai/schemas';
import type { AnalyzeEvaluationReportInput, AnalyzeEvaluationReportOutput } from '@/lib/types';


export async function analyzeEvaluationReport(
  input: AnalyzeEvaluationReportInput
): Promise<AnalyzeEvaluationReportOutput> {
  const prompt = `You are a senior clinical speech-language pathologist from Chile specializing in differential diagnosis. Your task is to perform a comprehensive and critical analysis of a speech-language evaluation report. Your goal is to deliver a result so complete, attractive, and useful that a professional would pay for this analysis.

**Detailed Instructions:**

1.  **Holistic and Critical Analysis:** Carefully read the entire report. Do not just extract information; you must synthesize, interpret, and enrich the findings. If the report has weaknesses or underexplored areas, mention them in your justification or suggestions.
2.  **Diagnostic Synthesis (summary):** Write a concise but complete clinical summary (in a coherent, well-written paragraph) that integrates the most relevant findings. It must be clear and easy for another professional to understand.
3.  **Diagnoses (diagnoses):** List ALL speech-language diagnoses mentioned or that can be clearly inferred from the data. Be precise with Chilean clinical terminology.
4.  **Diagnostic Justification (diagnosticJustification):** Explain the clinical reasoning behind the diagnoses. Do not just quote the report; justify why the findings (e.g., test results, observations) support those conclusions. If information is lacking for a definitive diagnosis, state it.
5.  **Strengths (strengths):** Identify the preserved or within-normal-limits skills. For each, describe the specific finding and briefly comment on its positive implication for therapy (e.g., "Good comprehensive level can be used as a pillar for...").
6.  **Weaknesses (weaknesses):** Identify the areas of deficit. For each, describe the specific finding and its functional impact on the patient's daily life. Be critical: if an evaluation seems incomplete, mention it.
7.  **Suggestions and Action Plan (suggestions):** Based on the complete profile, develop a plan of suggestions that is a true value-add. Go beyond what the report says. Propose an initial intervention plan, therapeutic goals (at least 2-3 in SMART format if possible), and the recommended frequency.
8.  **Referral (referralRequired & referralSuggestion):** Determine if a referral to another professional (ENT, neurologist, psychologist, etc.) is needed. If so, specify to whom and CLEARLY justify why that referral is necessary based on the report's findings.

**Important Output Format:**
Your response MUST be a single, valid JSON object, with no introductory text, additional explanations, or formatting markers like \`\`\`json. The JSON structure must follow the defined schema.

**Document to Analyze:**
Here is the content of the report. You will extract and process the text content to complete your analysis.

Document: {{media url=documentDataUri}}`;

    try {
        const result = await ai.generate({
          model: MODELS.GEMINI_1_5_PRO,
          prompt: prompt,
          input: { documentDataUri: input.documentDataUri },
          output: {
            schema: AnalyzeEvaluationReportOutputSchema,
          },
          config: {
            temperature: 0.3,
            maxOutputTokens: 3000
          }
        });
        if (!result.output) {
            throw new Error('La IA no pudo procesar el informe. No se generó output.');
        }
        return result.output;
    } catch (error: any) {
        console.error('Error analyzing report:', error);
        throw new Error('Failed to analyze evaluation report');
    }
}
