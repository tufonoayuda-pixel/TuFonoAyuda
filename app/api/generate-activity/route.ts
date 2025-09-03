'use server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePersonalizedActivity } from '@/app/api/actions/generate-personalized-activity';
import { GeneratePersonalizedActivityInputSchema } from '@/ai/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validación de entrada
    const validatedInput = GeneratePersonalizedActivityInputSchema.parse(body);
    
    console.log('📥 Request recibido en API route:', validatedInput);
    
    // Llamar a la Server Action
    const result = await generatePersonalizedActivity(validatedInput);
    
    console.log('✅ Actividad generada exitosamente');
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('💥 Error en API route:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Error de validación de entrada.', details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
