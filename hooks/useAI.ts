'use client';

import { useState } from 'react';
import type { GeneratePersonalizedActivityInput, GeneratePersonalizedActivityOutput } from '@/lib/types';


export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateActivity = async (inputData: GeneratePersonalizedActivityInput): Promise<GeneratePersonalizedActivityOutput | null> => {
    setLoading(true);
    setError(null);
    
    try {
        const response = await fetch('/api/generate-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inputData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Ocurrió un error en el servidor de IA.');
        }

        return result;

    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido al generar la actividad';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateActivity, loading, error };
}
