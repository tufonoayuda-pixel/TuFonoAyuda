'use client';

export interface Consent {
    status: 'Pendiente' | 'Aceptado' | 'Rechazado' | 'Revocado';
    date?: string; // Fecha de la última actualización del estado
    method?: 'Email' | 'En Persona' | 'WhatsApp';
    notes?: string;
}

export interface ProgressEntry {
    date: string;
    score: number;
    notes: string;
}
  
export interface Activity {
    id: string;
    title: string;
    description: string;
    category: string;
    targetSkills: string[];
}
  
export interface Session {
    id: string;
    patientId: string;
    patientName: string;
    date: string;
    time: string;
    status: 'Programada' | 'Completada' | 'Cancelada' | 'Ausente';
    type: string;
    color: string;
    price?: number;
    paymentStatus?: 'Pagado' | 'Pendiente' | 'Anulado';
    duration?: number;
}
  
export interface SavedSession {
      id: string;
      date: string;
      time: string;
      minPitch: { hz: number; note: string; octave: number } | null;
      maxPitch: { hz: number; note: string; octave: number } | null;
      avgPitch: number;
      recordedTimes: string[];
}
  
export interface Reference {
      id: string;
      title: string;
      authors: string;
      year: string;
      source: string; // Revista o Editorial
      evidenceLevel: string;
      therapeuticAreas: string[];
      summary: string;
      dataUri: string; // El contenido del archivo en base64
}
  
export interface EvaluationTool {
      id: string;
      name: string;
      type: 'Estandarizada' | 'No Estandarizada';
      area: string;
      description: string;
}
  
export interface Document {
      id: string;
      name: string;
      type: string;
      description: string;
      date: string;
      fileUrl: string; 
      securePath?: string;
}
  
export interface AdvisoryRequest {
      id: string;
      name: string;
      email: string;
      phone: string;
      message: string;
      date: string;
      status: 'Pendiente' | 'Respondido';
      response?: string;
}
  
export interface BaremoEntry {
      scoreRange: string;
      ds: string;
      interpretation: 'Normal' | 'Normal Lento' | 'Riesgo' | 'Déficit' | 'Sin estructura' | 'Transición' | 'Estructura I' | 'Estructura II' | 'Estructura III' | 'Normal Alto' | 'Muy buen desarrollo' | 'Sobresaliente' | 'Normal bajo' | 'Retraso o Dificultad' | 'Dentro de los límites normales' | 'Leve' | 'Moderado' | 'Severo';
      min: number;
      max: number;
}
    
export interface AgeBaremo {
      ageRange: {
          from: { years: number; months: number };
          to: { years: number; months: number };
      };
      baremo: BaremoEntry[];
}
  
export interface StandardizedTest {
      id: string;
      name: string;
      area: string;
      baremos: AgeBaremo[];
}
  
export interface Patient {
    id: string;
    name: string;
    age: number;
    diagnoses: string[];
    avatarUrl: string;
    lastSession: string;
    icon?: string;
    progress: ProgressEntry[];
    assignedActivities: Activity[];
    contact: {
      email: string;
      phone: string;
    };
    profile: string;
    consent?: Consent;
    labSessions?: SavedSession[]; // Added for voice lab results
    evaluations?: any[]; // For storing evaluation protocol results
    createdAt?: any;
    ownerId?: string;
  }
  
