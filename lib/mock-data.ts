import type { Patient, Activity, Session, Reference, EvaluationTool, UserAccount } from './types';

// Placeholder for a real PDF data URI.
const mockPdfDataUri = "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nL1BhZ2VzIDIgMCBSL091dGxpbmVzIDMgMCBSPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZSAvUGFnZXMvQ291bnQgMS9LaWRzIFsgNCAwIFIgXT4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUgL091dGxpbmVzL0NvdW50IDAgPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZSAvUGFnZS9QYXJlbnQgMiAwIFIvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNSAwIFI+Pj4+L01lZGlhQm94IFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNiAwIFI+PgplbmRvYmoKNSAwIG9iago8PC9UeXBlIC9Gb250L1N1YnR5cGUgL1R5cGUxL0Jhc2VGb250IC9IZWx2ZXRpY2E+PgplbmRvYmoKNyAwIG9iago8PC9MZW5ndGggNTQ+PgpzdHJlYW0KQVQKTFRCCkJUL0YxIDEyIFRmCjcyIDcyIFRkCihIZWxsbyB3b3JsZCkhJwpFVAplbmRzdHJlYW0KZW5kb2JqCjYgMCBvYmoKPDwvTGVuZ3RoIDY5Pj4Kc3RyZWFtCjIgSgpyZwoxIDAgMCBSQgovRjEgMTIgVGYKL1RleHQgV2luZ2RpbmdzCjAgMCAwIHJnemIKQlQKMTAwIDIwMCBUZAooVGhpcyBpcyBhIHRlc3QhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDYyIDAwMDAwIG4gCjAwMDAwMDAxMTQgMDAwMDAgbiAKMDAwMDAwMDE0MyAwMDAwMCBuIAowMDAwMDAwMjQ3IDAwMDAwIG4gCjAwMDAwMDA0MDMgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDcvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKNTEwCjUlRUNPRgo=";

const currentYear = new Date().getFullYear();
const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).getMonth().toString().padStart(2, '0');


export const patients: Patient[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    age: 7,
    diagnoses: ['Trastorno de los sonidos del habla (TSH)', 'Disfonía infantil'],
    avatarUrl: 'https://placehold.co/100x100.png',
    icon: 'Mic',
    lastSession: '2024-07-20',
    progress: [
      { date: '2024-03-01', score: 40, notes: 'Inicio de terapia, dificultad con fonemas /r/ y /s/.' },
      { date: '2024-04-01', score: 65, notes: 'Comienza a generalizar /s/ en palabras.' },
      { date: '2024-05-01', score: 80, notes: 'Mejora significativa en conversación espontánea.' },
    ],
    assignedActivities: [{id: '101', title: 'El Juego de la Serpiente', category: 'Articulación', description: 'Repetir palabras con /s/ mientras se juega.', targetSkills: ['Fonema /s/']}],
    contact: { email: 'juan.perez@example.com', phone: '+56912345678' },
    profile: 'Niño de 7 años, en 2º básico, colaborador y con buen apoyo familiar. Presenta dislalia selectiva de /r/ y /s/.',
    consent: {
        status: 'Pendiente',
    }
  },
  {
    id: 'p2',
    name: 'Sofía Castro',
    age: 5,
    diagnoses: ['Retraso del Lenguaje'],
    avatarUrl: 'https://placehold.co/100x100/C2B2A9/FFFFFF',
    icon: 'MessageSquare',
    lastSession: '2024-07-22',
    progress: [
      { date: '2024-05-10', score: 20, notes: 'Evaluación inicial, vocabulario limitado.' },
      { date: '2024-06-12', score: 45, notes: 'Aumento en el uso de frases de dos palabras.' },
      { date: '2024-07-15', score: 60, notes: 'Mejora en la comprensión de instrucciones simples.' },
    ],
    assignedActivities: [{id: '102', title: 'El Cuento Interactivo', category: 'Lenguaje Comprensivo', description: 'Leer un cuento y responder preguntas.', targetSkills: ['Comprensión Auditiva', 'Vocabulario']}],
    contact: { email: 'sofia.castro@example.com', phone: '+56987654321' },
    profile: 'Niña de 5 años, asiste a jardín infantil. Tímida inicialmente, pero participativa. Le gustan los animales.',
    consent: {
        status: 'Aceptado',
        date: '2024-05-09T10:00:00Z',
        method: 'En Persona'
    }
  }
];

export const activities: Activity[] = [
  {
    id: '101',
    title: 'El Juego de la Serpiente',
    description: 'Un juego de tablero donde el niño avanza repitiendo palabras con el fonema /s/ en diferentes posiciones.',
    category: 'Articulación',
    targetSkills: ['Producción del fonema /s/', 'Conciencia fonológica'],
  },
];

export const sessions: Session[] = [
    { id: 's1', patientId: '1', patientName: 'Juan Pérez', date: '2024-07-20', time: '10:00', status: 'Completada', type: 'Sesión de Terapia', color: '#10b981', price: 25000, paymentStatus: 'Pagado' },
    { id: 's2', patientId: '1', patientName: 'Juan Pérez', date: '2024-07-27', time: '11:00', status: 'Programada', type: 'Sesión de Terapia', color: '#10b981', price: 25000, paymentStatus: 'Pendiente' },
    { id: 's3', patientId: '1', patientName: 'Juan Pérez', date: '2024-07-24', time: '15:00', status: 'Cancelada', type: 'Evaluación', color: '#3b82f6', price: 40000, paymentStatus: 'Anulado' },
    { id: 's4', patientId: 'p2', patientName: 'Sofía Castro', date: '2024-07-22', time: '09:00', status: 'Completada', type: 'Sesión de Terapia', color: '#f97316', price: 25000, paymentStatus: 'Pagado' },
    { id: 's5', patientId: 'p2', patientName: 'Sofía Castro', date: '2024-07-29', time: '09:00', status: 'Programada', type: 'Sesión de Terapia', color: '#f97316', price: 25000, paymentStatus: 'Pendiente' },
    { id: 's6', patientId: '1', patientName: 'Juan Pérez', date: '2024-06-15', time: '10:00', status: 'Completada', type: 'Sesión de Terapia', color: '#10b981', price: 25000, paymentStatus: 'Pagado' },
];

export const references: Reference[] = [
    {
      id: 'ref1',
      title: 'Intervención temprana en trastornos del lenguaje',
      authors: 'García, L. & Martinez, C.',
      year: '2021',
      source: 'Revista Chilena de Fonoaudiología',
      evidenceLevel: '1a',
      therapeuticAreas: ['Lenguaje Infantil', 'Prevención'],
      summary: 'Revisión sistemática de la efectividad de programas de intervención temprana para niños con riesgo de trastorno del desarrollo del lenguaje (TDL). Los resultados indican que la intervención antes de los 3 años mejora significativamente los resultados a largo plazo.',
      dataUri: mockPdfDataUri,
    },
  ];

export const evaluationTools: EvaluationTool[] = [
    {
      id: 'eval1',
      name: 'Test para la Comprensión Auditiva del Lenguaje (TECAL)',
      type: 'Estandarizada',
      area: 'Lenguaje Comprensivo',
      description: 'Evalúa la comprensión del lenguaje en niños de 3 a 6 años, abarcando vocabulario, morfología y sintaxis.',
    },
];

export const mockUsers: UserAccount[] = [
    {
        id: 'user1',
        name: 'Valentina Rojas',
        email: 'val.rojas@email.com',
        avatarUrl: 'https://placehold.co/100x100/A9C2C1/FFFFFF',
        lastLogin: '2024-08-19T10:00:00Z',
        plan: 'Profesional',
        status: 'Activo'
    },
    {
        id: 'user2',
        name: 'Matías Silva',
        email: 'm.silva.est@email.com',
        avatarUrl: 'https://placehold.co/100x100/C1A9C2/FFFFFF',
        lastLogin: '2024-08-18T15:30:00Z',
        plan: 'Estudiante',
        status: 'Activo'
    },
    {
        id: 'user3',
        name: 'Carolina Nuñez',
        email: 'caro.nunez.fono@email.com',
        avatarUrl: 'https://placehold.co/100x100/C2B2A9/FFFFFF',
        lastLogin: '2024-07-20T09:00:00Z',
        plan: 'Profesional',
        status: 'Inactivo'
    },
     {
        id: 'user4',
        name: 'Benjamín Soto',
        email: 'benja.soto@email.com',
        avatarUrl: 'https://placehold.co/100x100/A9B5C2/FFFFFF',
        lastLogin: '2024-08-19T11:20:00Z',
        plan: 'Experto',
        status: 'Activo'
    },
];
