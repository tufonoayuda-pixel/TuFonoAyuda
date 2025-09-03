'use client';
import type { Patient, ProgressEntry, Activity, Session, SavedSession, Reference, EvaluationTool, Document, AdvisoryRequest, BaremoEntry, AgeBaremo, StandardizedTest, Consent } from './types/patient-types';
import type { GenerateActivityInput, GeneratePersonalizedActivityOutput, AnalyzeEvaluationReportOutput, EnhanceInterventionPlanOutput } from './types/ai-types';

// Re-export all types from the specific files
export type { 
    Patient, 
    ProgressEntry, 
    Activity, 
    Session, 
    SavedSession, 
    Reference, 
    EvaluationTool, 
    Document, 
    AdvisoryRequest, 
    BaremoEntry, 
    AgeBaremo, 
    StandardizedTest,
    Consent,
    GenerateActivityInput,
    GeneratePersonalizedActivityOutput,
    AnalyzeEvaluationReportOutput,
    EnhanceInterventionPlanOutput
};


// You can also define other general-purpose types here if needed.
export interface UserAccount {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    lastLogin: string;
    plan: 'Estudiante' | 'Profesional' | 'Experto' | 'Admin';
    status: 'Activo' | 'Inactivo' | 'Suspendido';
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
