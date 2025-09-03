
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateOtoscopyReport } from '@/app/api/actions/generate-otoscopy-report';
import { GenerateOtoscopyReportInputSchema } from '@/ai/schemas';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const validatedInput = GenerateOtoscopyReportInputSchema.parse(input);

    const result = await generateOtoscopyReport(validatedInput);

    return NextResponse.json(result);

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Error de validación de entrada.', details: error.errors }, { status: 400 });
    }
    console.error('Error en el endpoint /api/generate-otoscopy-report:', error);
    return NextResponse.json({ error: error.message || 'Error desconocido en el servidor.' }, { status: 500 });
  }
}
