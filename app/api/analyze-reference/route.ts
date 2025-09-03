
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeReferenceDocument } from '@/app/api/actions/analyze-reference-document';
import { AnalyzeReferenceDocumentInputSchema } from '@/ai/schemas';

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const validatedInput = AnalyzeReferenceDocumentInputSchema.parse(input);

    const result = await analyzeReferenceDocument(validatedInput);

    return NextResponse.json(result);

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Error de validación de entrada.', details: error.errors }, { status: 400 });
    }
    console.error('Error en el endpoint /api/analyze-reference:', error);
    return NextResponse.json({ error: error.message || 'Error desconocido en el servidor.' }, { status: 500 });
  }
}
