'use server';
import { NextRequest, NextResponse } from 'next/server';
import { SummarizePatientProgressInputSchema } from '@/ai/schemas';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { SummarizePatientProgressOutputSchema } from '@/ai/schemas';

// Define the flow within the same file as the route handler
async function summarizePatientProgress(input: z.infer<typeof SummarizePatientProgressInputSchema>) {
    const prompt = `Eres un fonoaudiólogo experto en análisis de datos clínicos. Tu tarea es analizar los datos de sesión y los resultados de las actividades de un paciente para generar un resumen de progreso conciso y útil.

    **Datos del Paciente:**
    - Nombre: ${'${input.patientName}'}
    
    **Datos de Sesiones Anteriores (Evolución):**
    ${'${input.sessionData}'}
    
    **Resultados de Actividades Específicas:**
    ${'${input.activityResults}'}
    
    **Instrucciones:**
    1.  **summary:** Escribe un resumen detallado pero fácil de entender sobre el progreso general del paciente. Destaca las áreas de mejora, los puntos de estancamiento y cualquier patrón notable.
    2.  **progress:** Escribe un resumen de **una sola oración** que capture la esencia del progreso actual del paciente. Debe ser claro, directo y adecuado para una vista rápida en un dashboard.
    
    **IMPORTANTE:** La respuesta debe ser un único objeto JSON válido, sin texto adicional ni formato.`;

    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-pro-latest',
        prompt,
        output: {
            schema: SummarizePatientProgressOutputSchema,
        },
    });

    if (!output) {
        throw new Error('La IA no pudo generar el resumen de progreso.');
    }
    return output;
}


export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const validatedInput = SummarizePatientProgressInputSchema.parse(input);

    const result = await summarizePatientProgress(validatedInput);

    return NextResponse.json(result);

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Error de validación de entrada.', details: error.errors }, { status: 400 });
    }
    console.error('Error en el endpoint /api/summarize-progress:', error);
    return NextResponse.json({ error: error.message || 'Error desconocido en el servidor.' }, { status: 500 });
  }
}
