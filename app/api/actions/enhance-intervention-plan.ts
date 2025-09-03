'use server';

/**
 * @fileOverview AI flow to analyze and enhance a speech-language intervention plan.
 *
 * - enhanceInterventionPlan - Enhances a plan based on intervention models, patient profile, and diagnosis.
 */
import { ai, MODELS } from '@/ai/genkit';
import {
  EnhanceInterventionPlanInputSchema,
  EnhanceInterventionPlanOutputSchema,
} from '@/ai/schemas';
import type { EnhanceInterventionPlanInput, EnhanceInterventionPlanOutput } from '@/lib/types';


export async function enhanceInterventionPlan(
  input: EnhanceInterventionPlanInput
): Promise<EnhanceInterventionPlanOutput> {

  const documentPrompts = input.modelDocumentsUri.map((uri, index) => 
    `- Document ${index + 1}: {{media url=${uri}}}`
  ).join('\n');

  const prompt = `You are an expert speech-language pathologist and an elite therapy planner. Your task is to analyze a patient's profile, their current intervention plan, and a series of theoretical reference documents to create an improved, comprehensive, and evidence-based intervention plan.

      **Context:**
      - Patient Profile: ${JSON.stringify(input.patientProfile)}
      - Current Intervention Plan (text content): {{media url=${input.interventionPlanUri}}}
      - Theoretical Reference Documents (text content): 
      ${documentPrompts}

      **Detailed Instructions:**

      1.  **Comprehensive Analysis:** Perform an exhaustive analysis of all provided information. Consider the diagnosis, age, patient interests, the current plan, and, fundamentally, the theoretical models from the reference documents.
      2.  **New Plan Justification:** In the 'justification' field, write a clear, professional paragraph explaining the rationale for the improvements. Base your decisions on the theoretical models from the provided documents. For example: "Based on the articulatory cueing therapy model from Document 1 and the play-based approach from Document 2, a plan is proposed that integrates..."
      3.  **Goal Reformulation:** In 'suggestedGoals', create a list of therapeutic goals. These must be:
          -   **Specific and Measurable (SMART):** Write clear, concise, and quantifiable goals.
          -   **Justified:** For each goal, add a 'justification' that explains its clinical relevance and how it connects to the theoretical models.
      4.  **Activity Generation:** For each proposed goal, design a complete and detailed therapeutic activity. Each activity must be a JSON object following the 'GeneratePersonalizedActivityOutputSchema' and must be directly related to the goal it aims to achieve. Ensure the activities are creative, personalized (using the patient's interests), and consistent with the theoretical approaches from the documents.

      Your final response must be a single, valid JSON object that conforms to EnhanceInterventionPlanOutputSchema, with no introductory text or explanations outside the JSON format.`;

    try {
      const result = await ai.generate({
        model: MODELS.GEMINI_1_5_PRO,
        prompt: prompt,
        output: {
          schema: EnhanceInterventionPlanOutputSchema,
        },
        config: {
            temperature: 0.5,
            maxOutputTokens: 4000
        }
      });
      if (!result.output) {
        throw new Error('The AI failed to enhance the plan. Please try again.');
      }
      return result.output;
    } catch(error: any) {
        console.error("Error enhancing intervention plan:", error);
        throw new Error('Failed to enhance intervention plan');
    }
}
