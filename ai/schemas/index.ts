
import { z } from 'zod';

// Schema for generating a personalized activity
export const GeneratePersonalizedActivityInputSchema = z.object({
  patientProfile: z.string().describe('A summary of the patient, including age, interests, and general difficulties.'),
  specificNeeds: z.string().describe('The specific, single therapeutic goal for the session (e.g., "production of /s/ phoneme in words").'),
  sessionDuration: z.number().describe('The estimated duration of the session in minutes.'),
  sessionType: z.string().describe('The type of session (e.g., Individual, Group).'),
  isPediatric: z.boolean().describe('Whether the session is for a pediatric patient.'),
  additionalDescription: z.string().optional().describe('Any additional context or preferences for the activity.'),
  scientificReferences: z.string().optional().describe('Summaries of scientific articles to base the intervention on.'),
});

export const GeneratePersonalizedActivityOutputSchema = z.object({
  titulo_actividad: z.string().describe("Título creativo y motivador para la actividad."),
  area_intervencion: z.string().describe("Área fonoaudiológica principal que se trabaja."),
  subarea_especifica: z.string().describe("Sub-área o componente específico dentro del área principal."),
  tipo_paciente: z.string().describe("Define si el enfoque es 'Pediátrico' o 'Adulto'."),
  rango_edad: z.string().describe("Rango de edad apropiado para la actividad (ej. '4-6 años')."),
  objetivo_terapeutico: z.string().describe("El objetivo principal de la sesión, redactado de forma clara y medible."),
  subobjetivos: z.array(z.string()).describe("Lista de 2 a 3 objetivos secundarios que apoyan al principal."),
  poblacion_objetivo: z.string().describe("Descripción del perfil de paciente ideal para esta actividad (diagnósticos, características)."),
  duracion_estimada: z.number().describe("Duración total estimada de la actividad en minutos."),
  materiales_necesarios: z.array(z.string()).describe("Lista de materiales concretos y accesibles necesarios."),
  tecnicas_aplicadas: z.array(z.string()).describe("Lista de técnicas o enfoques terapéuticos utilizados."),
  procedimiento: z.object({
    calentamiento: z.array(z.string()).describe("Pasos para la preparación o calentamiento inicial."),
    desarrollo_principal: z.array(z.string()).describe("Pasos detallados del núcleo de la actividad."),
    cierre: z.array(z.string()).describe("Pasos para finalizar y consolidar el aprendizaje."),
    estimulos: z.array(z.string()).describe("Ejemplos de palabras, frases o estímulos a utilizar."),
    instrucciones_ejemplo: z.string().describe("Un ejemplo de cómo el terapeuta daría la instrucción al paciente.")
  }).describe("Estructura detallada de la sesión."),
  adaptaciones_poblacionales: z.array(z.string()).describe("Sugerencias para adaptar la actividad a otras poblaciones o necesidades."),
  indicadores_progreso: z.array(z.string()).describe("Criterios observables para medir el éxito y el progreso."),
  variaciones_dificultad: z.object({
    nivel_inicial: z.string().describe("Cómo simplificar la actividad."),
    nivel_intermedio: z.string().describe("Descripción de la actividad base."),
    nivel_avanzado: z.string().describe("Cómo complejizar la actividad.")
  }).describe("Formas de ajustar la dificultad."),
  criterios_seguridad: z.array(z.string()).describe("Precauciones o consideraciones de seguridad importantes."),
  contraindicaciones: z.array(z.string()).describe("Situaciones o perfiles de pacientes para los que esta actividad no es recomendable."),
  recomendaciones_adicionales: z.array(z.string()).describe("Consejos o recomendaciones extra para el terapeuta."),
  transferencia_funcional: z.string().describe("Cómo aplicar lo aprendido en la vida diaria del paciente."),
  seguimiento_domiciliario: z.string().describe("Sugerencia de actividad o ejercicio para realizar en casa."),
  criterios_alta: z.string().describe("Criterios para considerar que el objetivo de esta actividad ha sido superado."),
  referencias_aplicadas: z.string().describe("Breve explicación de cómo se usaron las referencias científicas (si se proporcionaron)."),
  frecuencia_recomendada: z.string().describe("Frecuencia semanal sugerida para realizar esta actividad.")
});

export type GeneratePersonalizedActivityOutput = z.infer<typeof GeneratePersonalizedActivityOutputSchema>;


// Schema for analyzing evaluation reports
export const TopicDetailSchema = z.object({
    topic: z.string().describe('El área o tópico evaluado (ej. "Nivel Fonológico", "Nivel Morfosintáctico", "Aspectos Pragmáticos").'),
    description: z.string().describe('La descripción detallada de los hallazgos para este tópico específico.'),
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const AnalyzeEvaluationReportInputSchema = z.object({
    documentDataUri: z
      .string()
      .refine((uri) => uri.startsWith('data:application/pdf;base64,'), {
        message: "El documento debe ser un PDF en formato data URI válido"
      })
      .refine((uri) => {
        try {
          const base64Data = uri.split(',')[1];
          const fileSize = atob(base64Data).length;
          return fileSize <= MAX_FILE_SIZE;
        } catch {
          return false;
        }
      }, {
        message: `El archivo no puede exceder ${'${MAX_FILE_SIZE / 1024 / 1024}'}MB`
      })
      .describe(
        "El informe de evaluación del paciente como un data URI, que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:application/pdf;base64,<encoded_data>'."
      ),
  });

export const AnalyzeEvaluationReportOutputSchema = z.object({
  summary: z.string().describe('Un resumen clínico general y conciso de los hallazgos del informe de evaluación.'),
  diagnoses: z.array(z.string()).describe('Una lista con todos los diagnósticos fonoaudiológicos identificados en el informe.'),
  diagnosticJustification: z.string().describe('La justificación detallada del diagnóstico, basada en los resultados y observaciones del informe.'),
  strengths: z
    .array(TopicDetailSchema)
    .describe('Un listado de las fortalezas o habilidades que se encuentran dentro de la normalidad, agrupadas por tópico.'),
  weaknesses: z
    .array(TopicDetailSchema)
    .describe('Un listado de las debilidades o áreas descendidas identificadas en la evaluación, agrupadas por tópico.'),
  suggestions: z
    .string()
    .describe('Sugerencias y recomendaciones terapéuticas integrales. Incluye las del informe y añade otras basadas en buenas prácticas para un abordaje completo.'),
  referralRequired: z
    .boolean()
    .describe('Indica si se sugiere una derivación a otro profesional.'),
  referralSuggestion: z
    .string()
    .optional()
    .describe('Si se requiere derivación, especifica a qué profesional o área se sugiere derivar y explica detalladamente el motivo de la derivación.'),
});


// Schema for analyzing scientific reference documents
export const AnalyzeReferenceDocumentInputSchema = z.object({
    documentDataUri: z
      .string()
      .describe(
        "The scientific document as a data URI, which must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
      ),
  });
export const AnalyzeReferenceDocumentOutputSchema = z.object({
  title: z.string().describe('El título completo del artículo o libro.'),
  authors: z.string().describe('Los autores del documento, separados por comas.'),
  year: z.string().describe('El año de publicación.'),
  source: z.string().describe('La revista, editorial o fuente de publicación.'),
  evidenceLevel: z.string().optional().describe('El nivel de evidencia científica si se menciona (ej. 1a, Ib, IIa, etc.).'),
  therapeuticAreas: z.array(z.string()).describe('Las áreas terapéuticas relevantes que aborda el documento.'),
  summary: z.string().describe('Un resumen conciso del contenido del documento, destacando los hallazgos principales.'),
});

// Schema for generating otoscopy reports
export const GenerateOtoscopyReportInputSchema = z.object({
    patientName: z.string().describe('The name of the patient.'),
    findings: z.object({
      od: z.object({
        pabellon: z.string(),
        cae: z.string(),
        mt: z.string(),
      }),
      oi: z.object({
        pabellon: z.string(),
        cae: z.string(),
        mt: z.string(),
      }),
    }),
    observations: z.string().optional().describe('Any additional observations from the professional.'),
  });
  
  export const GenerateOtoscopyReportOutputSchema = z.object({
    narrativeReport: z.string().describe('A detailed narrative report of the otoscopy findings, written in paragraphs.'),
    diagnoses: z.array(z.string()).describe('A list of all diagnoses identified (e.g., ["Otitis Media", "Cerumen Impaction"]).'),
    impression: z.string().describe('A concise diagnostic impression based on the findings.'),
  });

// Schema for enhancing an intervention plan
export const EnhanceInterventionPlanInputSchema = z.object({
    patientProfile: z
      .string()
      .describe('Detailed patient profile, including age, diagnosis, and interests.'),
    interventionPlanUri: z
      .string()
      .describe(
        "The patient's current intervention plan as a data URI (PDF)."
      ),
    modelDocumentsUri: z
      .array(z.string())
      .describe(
        "An array of model documents (articles, clinical guides, etc.) as data URIs (PDF) that will serve as the theoretical basis."
      ),
  });

export const GoalSchema = z.object({
    goal: z.string().describe('El objetivo terapéutico específico, redactado en formato SMART si es posible.'),
    justification: z.string().describe('La justificación de por qué este objetivo es relevante y cómo se basa en los modelos teóricos proporcionados y el perfil del paciente.'),
});

export const EnhanceInterventionPlanOutputSchema = z.object({
  justification: z.string().describe('Una justificación general y experta de los cambios y mejoras propuestos para el plan de intervención, fundamentada en los modelos teóricos y el perfil del paciente.'),
  suggestedGoals: z.array(GoalSchema).describe('Una lista de objetivos terapéuticos sugeridos o mejorados, redactados de forma clara y medible.'),
  suggestedActivities: z.array(GeneratePersonalizedActivityOutputSchema).describe('Una lista de planes de actividades detallados para abordar los objetivos. Cada actividad debe ser un objeto completo que siga el esquema de GeneratePersonalizedActivityOutputSchema.'),
});


// Schema for summarizing patient progress
export const SummarizePatientProgressInputSchema = z.object({
    patientName: z.string().describe('The name of the patient.'),
    sessionData: z.string().describe('The session data for the patient.'),
    activityResults: z.string().describe('The activity results for the patient.'),
  });

export const SummarizePatientProgressOutputSchema = z.object({
    summary: z.string().describe('Un resumen del progreso del paciente.'),
    progress: z.string().describe('Un resumen de una oración sobre el progreso.'),
  });
