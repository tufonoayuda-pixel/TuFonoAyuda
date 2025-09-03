
import { NextResponse } from 'next/server';
import { ai, MODELS } from '@/ai/genkit';

export async function GET() {
  try {
    const test = await ai.generate({
      model: MODELS.GEMINI_PRO,
      prompt: 'Responde con OK si estás funcionando',
      config: { maxOutputTokens: 10 }
    });

    const outputText = test.output;

    if (outputText && outputText.trim().toLowerCase().includes('ok')) {
        return NextResponse.json({ 
            status: 'healthy', 
            message: 'Conexión con Gemini OK',
            response: outputText,
        });
    } else {
         throw new Error(`Respuesta inesperada de la API: ${outputText}`);
    }
    
  } catch (error: any) {
    console.error('AI Health Check fallido:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        suggestion: 'Verifica que la API de "Generative Language" esté habilitada y que la cuenta de servicio tenga los permisos correctos (ej. "Vertex AI User") en Google Cloud Console.'
      },
      { status: 500 }
    );
  }
}
