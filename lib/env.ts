'use server';
import { z } from 'zod';

const envSchema = z.object({
  // No hay variables de entorno del lado del servidor requeridas por ahora.
});

// Valida y exporta las variables de entorno.
// Si alguna variable requerida falta o es inválida, `parse` lanzará un error.
export const env = envSchema.parse(process.env);
