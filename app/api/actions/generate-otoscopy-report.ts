'use server';

/**
 * @fileOverview Flow to generate an otoscopy report based on findings.
 *
 * - generateOtoscopyReport - Generates a narrative report from structured findings.
 */
import { ai, MODELS } from '@/ai/genkit';
import {
  GenerateOtoscopyReportInputSchema,
  GenerateOtoscopyReportOutputSchema,
} from '@/ai/schemas';
import type { GenerateOtoscopyReportInput, GenerateOtoscopyReportOutput } from '@/lib/types';


export async function generateOtoscopyReport(
  input: GenerateOtoscopyReportInput
): Promise<GenerateOtoscopyReportOutput> {
  const prompt = `You are a clinical audiologist specializing in otoscopy reports. Based on the following structured findings, generate a professional, clear, and concise narrative report in Spanish. The report should be well-written in paragraphs. Also, provide a diagnostic impression and a list of identified diagnoses.

  **Patient Name:**
  ${input.patientName}

  **Findings:**
  - **Oído Derecho (OD):**
    - Pabellón Auricular: ${input.findings.od.pabellon}
    - Conducto Auditivo Externo (CAE): ${input.findings.od.cae}
    - Membrana Timpánica (MT): ${input.findings.od.mt}
  - **Oído Izquierdo (OI):**
    - Pabellón Auricular: ${input.findings.oi.pabellon}
    - Conducto Auditivo Externo (CAE): ${input.findings.oi.cae}
    - Membrana Timpánica (MT): ${input.findings.oi.mt}
  
  **Additional Observations:**
  ${input.observations || 'N/A'}

  **Instructions:**
  1.  **narrativeReport:** Write a narrative report combining the findings for both ears into a coherent text. Start with the right ear, then the left. Describe the findings professionally.
  2.  **diagnoses:** List all potential diagnoses based on the findings (e.g., "Otitis Media Aguda (OMA) OD", "Tapón de cerumen OI").
  3.  **impression:** Provide a final, concise diagnostic impression that summarizes the overall state.

  **IMPORTANT:** Your response must be a single, valid JSON object, without any extra text or formatting.
  `;
    
    try {
        const result = await ai.generate({
            model: MODELS.GEMINI_1_5_PRO,
            prompt: prompt,
            output: {
                schema: GenerateOtoscopyReportOutputSchema,
            },
            config: {
                temperature: 0.4,
                maxOutputTokens: 1200
            }
        });
        if (!result.output) {
            throw new Error('The AI failed to generate the report. Please try again.');
        }
        return result.output;
    } catch(error: any) {
        console.error("Error generating otoscopy report:", error);
        throw new Error('Failed to generate otoscopy report');
    }
}
