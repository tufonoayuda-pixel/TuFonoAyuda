
'use client';
import type { Patient, ProgressEntry, Activity, Session, SavedSession, Reference, EvaluationTool, Document, AdvisoryRequest, BaremoEntry, AgeBaremo, StandardizedTest, Consent } from './patient-types';
import type { GeneratePersonalizedActivityInput, GeneratePersonalizedActivityOutput, AnalyzeEvaluationReportOutput, EnhanceInterventionPlanOutput, SummarizePatientProgressInput, SummarizePatientProgressOutput } from './ai-types';


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
    GeneratePersonalizedActivityInput,
    GeneratePersonalizedActivityOutput,
    AnalyzeEvaluationReportOutput,
    EnhanceInterventionPlanOutput,
    SummarizePatientProgressInput,
    SummarizePatientProgressOutput,
};

export interface UserAccount {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    lastLogin: string;
    plan: 'Estudiante' | 'Profesional' | 'Experto' | 'Admin';
    status: 'Activo' | 'Inactivo' | 'Suspendido';
}
