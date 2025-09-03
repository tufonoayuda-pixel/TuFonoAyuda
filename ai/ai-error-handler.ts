import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';

export async function GET() {
  try {
    // Test básico de conexión
    const test = await ai.generate({
      model: 'googleai/gemini-pro',
      prompt: 'Responde con OK si estás funcionando',
      config: { maxOutputTokens: 10 }
    });

    return NextResponse.json({ 
      status: 'healthy', 
      message: 'Conexión con Gemini OK',
      response: test.output,
    });
    
  } catch (error: any) {
    console.error('AI Health Check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        suggestion: 'Verifica la API Key en tu archivo .env y en Google Cloud Console.'
      },
      { status: 500 }
    );
  }
}
