
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enhanceInterventionPlan } from '@/app/api/actions/enhance-intervention-plan';
import { EnhanceInterventionPlanInputSchema } from '@/ai/schemas';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const validatedInput = EnhanceInterventionPlanInputSchema.parse(input);

    const result = await enhanceInterventionPlan(validatedInput);

    return NextResponse.json(result);

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Error de validación de entrada.', details: error.errors }, { status: 400 });
    }
    console.error('Error en el endpoint /api/enhance-plan:', error);
    return NextResponse.json({ error: error.message || 'Error desconocido en el servidor.' }, { status: 500 });
  }
}
