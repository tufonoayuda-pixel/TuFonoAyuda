
'use server';

/**
 * @fileOverview AI flow to generate a personalized speech therapy activity.
 *
 * - generatePersonalizedActivity - Creates a detailed, clinically relevant therapy plan.
 */
import { ai, MODELS } from '@/ai/genkit';
import {
  GeneratePersonalizedActivityInputSchema,
  GeneratePersonalizedActivityOutputSchema,
} from '@/ai/schemas';
import type { GeneratePersonalizedActivityInput, GeneratePersonalizedActivityOutput } from '@/lib/types';


export async function generatePersonalizedActivity(
  input: GeneratePersonalizedActivityInput
): Promise<GeneratePersonalizedActivityOutput> {
  // We don't use a defined flow for this, as we want to build the prompt dynamically.
  const prompt = `Eres FonoAI, un asistente experto en fonoaudiología clínica. Tu tarea es generar una actividad terapéutica detallada, creativa y clínicamente relevante en ESPAÑOL, basada en la información proporcionada.

### Datos del Paciente:
- **Perfil General:** ${input.patientProfile}
- **Necesidad Específica (Objetivo Principal):** ${input.specificNeeds}
- **Duración de la Sesión:** ${input.sessionDuration} minutos
- **Tipo de Sesión:** ${input.sessionType}
- **Población:** ${input.isPediatric ? 'Pediátrico (usar lenguaje lúdico y motivador)' : 'Adulto (usar lenguaje formal y técnico)'}
- **Contexto Adicional:** ${input.additionalDescription}
- **Referencias Científicas a Considerar:** ${input.scientificReferences || 'No se proporcionaron.'}

### Instrucciones Clave:
1.  **Formato JSON Estricto:** Tu respuesta DEBE ser únicamente un objeto JSON válido que se ajuste al esquema definido. No incluyas texto introductorio, explicaciones, ni markdown.
2.  **Validez Clínica:** Asegúrate de que la actividad, los objetivos y las técnicas sean coherentes y apropiados para el perfil del paciente y el objetivo.
3.  **Creatividad y Personalización:** Utiliza los intereses del paciente (mencionados en el perfil) para que la actividad sea motivadora.

Comienza a generar el plan de actividad ahora.`;

    try {
        const result = await ai.generate({
          model: MODELS.GEMINI_1_5_PRO,
          prompt: prompt,
          output: {
            schema: GeneratePersonalizedActivityOutputSchema,
          },
          config: {
            temperature: 0.7,
            maxOutputTokens: 2500,
          },
        });
        if (!result.output) {
            throw new Error('La IA no pudo procesar la solicitud. No se generó output.');
        }
        return result.output;
    } catch (error: any) {
        console.error('Error generating personalized activity:', error);
        throw new Error('Failed to generate personalized activity');
    }
}
