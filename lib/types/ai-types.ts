import { z } from 'zod';
import { GeneratePersonalizedActivityOutputSchema } from '@/ai/schemas';

export type GeneratePersonalizedActivityOutput = z.infer<typeof GeneratePersonalizedActivityOutputSchema>;


export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  diagnoses: string[];
  strengths: string[];
  weaknesses: string[];
  goals?: string[];
}

export interface GeneratePersonalizedActivityInput {
  patientProfile: string;
  specificNeeds: string;
  sessionDuration: number;
  sessionType: string;
  isPediatric: boolean;
  additionalDescription?: string;
  scientificReferences?: string;
}

// ... other AI-related types ...

export interface TopicDetail {
  topic: string;
  description: string;
}

export interface AnalyzeEvaluationReportInput {
  documentDataUri: string;
}

export interface AnalyzeEvaluationReportOutput {
  summary: string;
  diagnoses: string[];
  diagnosticJustification: string;
  strengths: TopicDetail[];
  weaknesses: TopicDetail[];
  suggestions: string;
  referralRequired: boolean;
  referralSuggestion?: string;
}

export interface AnalyzeReferenceDocumentInput {
  documentDataUri: string;
}

export interface AnalyzeReferenceDocumentOutput {
  title: string;
  authors: string;
  year: string;
  source: string;
  evidenceLevel?: string;
  therapeuticAreas: string[];
  summary: string;
}

export interface GenerateOtoscopyReportInput {
  patientName: string;
  findings: {
    od: {
      pabellon: string;
      cae: string;
      mt: string;
    };
    oi: {
      pabellon: string;
      cae: string;
      mt: string;
    };
  };
  observations?: string;
}

export interface GenerateOtoscopyReportOutput {
  narrativeReport: string;
  diagnoses: string[];
  impression: string;
}

export interface Goal {
  goal: string;
  justification: string;
}

export interface EnhanceInterventionPlanInput {
  patientProfile: string;
  interventionPlanUri: string;
  modelDocumentsUri: string[];
}

export interface EnhanceInterventionPlanOutput {
  justification: string;
  suggestedGoals: Goal[];
  suggestedActivities: GeneratePersonalizedActivityOutput[];
}

export interface SummarizePatientProgressInput {
    patientName: string;
    sessionData: string;
    activityResults: string;
}

export interface SummarizePatientProgressOutput {
    summary: string;
    progress: string;
}
