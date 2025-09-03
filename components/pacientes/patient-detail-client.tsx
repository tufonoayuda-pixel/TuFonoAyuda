

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bot, FileText, Loader2, Sparkles, Plus, Copy, Mail, Phone, Camera, BookCheck, ClipboardCheck, ShieldCheck, Mic, Ear, MessageSquare, Brain, Smile, BookOpen, GraduationCap, Puzzle, KeyRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { Patient, Consent, SummarizePatientProgressOutput, GeneratePersonalizedActivityOutput, EnhanceInterventionPlanOutput } from '@/lib/types';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { references, patients as mockPatients } from '@/lib/mock-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityResultDisplay } from '@/components/actividades/activity-result-display';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PhotoGallery } from '@/components/pacientes/photo-gallery';
import { DocumentManager } from '@/components/pacientes/document-manager';
import { InterventionPlanDisplay } from '@/components/intervencion/intervention-plan-display';
import { ConsentManager } from '@/components/pacientes/consent-manager';
import { useParams, notFound } from 'next/navigation';

const iconMap: { [key: string]: React.ReactElement } = {
    Mic: <Mic className="h-4 w-4 text-white" />,
    Ear: <Ear className="h-4 w-4 text-white" />,
    MessageSquare: <MessageSquare className="h-4 w-4 text-white" />,
    Brain: <Brain className="h-4 w-4 text-white" />,
    Smile: <Smile className="h-4 w-4 text-white" />,
    BookOpen: <BookOpen className="h-4 w-4 text-white" />,
    GraduationCap: <GraduationCap className="h-4 w-4 text-white" />,
    Puzzle: <Puzzle className="h-4 w-4 text-white" />,
};

function PatientAvatar({ patient, onImageChange }: { patient: any, onImageChange: (url: string) => void }) {
    const { toast } = useToast();
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageChange(e.target?.result as string);
                toast({
                    title: 'Foto actualizada',
                    description: 'La foto de perfil del paciente ha sido actualizada.',
                });
            };
            reader.readAsDataURL(file);
        }
    }, [onImageChange, toast]);

    return (
        <div className="relative group">
            <Image
                alt={patient.name}
                className="aspect-square w-28 rounded-full object-cover"
                height="112"
                src={patient.avatarUrl}
                width="112"
                data-ai-hint="profile picture"
            />
            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-8 w-8 text-white" />
                <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
            {patient.icon && (
              <div className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-background">
                {iconMap[patient.icon]}
              </div>
            )}
        </div>
    )
}

function ActivityGeneratorForm({ patient, onActivityGenerated }: { patient: Patient, onActivityGenerated: (activity: GeneratePersonalizedActivityOutput) => void}) {
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [specificNeeds, setSpecificNeeds] = useState('');
  const [sessionDuration, setSessionDuration] = useState(45);
  const [sessionType, setSessionType] = useState('Individual');
  const [isPediatric, setIsPediatric] = useState(patient.age < 18);
  const [additionalDescription, setAdditionalDescription] = useState('');
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerateActivity = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActivityLoading(true);

    const referenceSummaries = references
      .filter(ref => selectedReferences.includes(ref.id))
      .map(ref => `- ${ref.title}: ${ref.summary}`)
      .join('\n');

    const requestBody = {
        patientProfile: patient.profile,
        specificNeeds: specificNeeds,
        sessionDuration,
        sessionType,
        isPediatric,
        additionalDescription,
        scientificReferences: referenceSummaries,
    };

    try {
      const response = await fetch('/api/generate-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ocurrió un error en el servidor');
      }

      const result = await response.json();

      onActivityGenerated(result);
      toast({
        title: "Actividad Generada",
        description: "La nueva actividad ha sido creada por la IA.",
      });
    } catch (error: any) {
      console.error('Error generating activity:', error);
      toast({
        title: 'Error de la IA',
        description: `No se pudo generar la actividad: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsActivityLoading(false);
    }
  }, [patient, specificNeeds, sessionDuration, sessionType, isPediatric, additionalDescription, selectedReferences, onActivityGenerated, toast]);

  const handleReferenceToggle = useCallback((referenceId: string) => {
    setSelectedReferences(prev => 
      prev.includes(referenceId) 
        ? prev.filter(id => id !== referenceId) 
        : [...prev, referenceId]
    );
  }, []);

  return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'><Sparkles className="text-primary"/>Generador de Actividades con IA</CardTitle>
          <CardDescription>
            Cree una nueva actividad personalizada para {patient.name}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerateActivity}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specific-needs">Objetivo Específico a Trabajar</Label>
              <Textarea id="specific-needs" value={specificNeeds} onChange={(e) => setSpecificNeeds(e.target.value)} placeholder="Ej: Producción del fonema /r/ en palabras" required/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="session-duration">Duración de la Actividad (min)</Label>
                    <Input id="session-duration" type="number" value={sessionDuration} onChange={(e) => setSessionDuration(Number(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-type">Tipo de Sesión</Label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Grupal">Grupal</SelectItem>
                          <SelectItem value="Evaluación">Evaluación</SelectItem>
                          <SelectItem value="Consulta">Consulta</SelectItem>
                          <SelectItem value="Rutina Terapeutica en Casa">Rutina Terapéutica en Casa</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additional-description">Contexto Adicional (Opcional)</Label>
              <Textarea id="additional-description" value={additionalDescription} onChange={(e) => setAdditionalDescription(e.target.value)} placeholder="Añada más contexto sobre el estado de ánimo del paciente, tipo de material (concreto/abstracto), apoyo tecnológico, estrategia de intervención, criterio de logro, tipo de interacción, creatividad..."/>
            </div>
            <div className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Switch id="is-pediatric" checked={isPediatric} onCheckedChange={setIsPediatric} />
                    <Label htmlFor="is-pediatric">Sesión Pediátrica</Label>
                </div>
                <p className="text-xs text-muted-foreground ml-8">La IA generará instrucciones con lenguaje lúdico y adaptado para niños.</p>
            </div>
            <div>
              <Label className="block text-sm font-medium mb-2">Fundamentar en Referencias (Opcional)</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-md border p-2">
                {references.map(ref => (
                  <div key={ref.id} className="flex items-center space-x-2">
                    <Checkbox id={`ref-${'${ref.id}'}`} checked={selectedReferences.includes(ref.id)} onCheckedChange={() => handleReferenceToggle(ref.id)}/>
                    <Label htmlFor={`ref-${'${ref.id}'}`} className="text-sm font-normal cursor-pointer">{ref.title} ({ref.year})</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isActivityLoading}>
              {isActivityLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generar Actividad
            </Button>
          </CardFooter>
        </form>
      </Card>
  )
}

export function PatientDetailClient() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [summary, setSummary] = useState<SummarizePatientProgressOutput | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [sessionActivities, setSessionActivities] = useState<GeneratePersonalizedActivityOutput[]>([]);
  const [showGenerator, setShowGenerator] = useState(true);
  const [interventionPlan, setInterventionPlan] = useState<EnhanceInterventionPlanOutput | null>(null);

  const { toast } = useToast();
  const params = useParams();
  
  const id = useMemo(() => Array.isArray(params.id) ? params.id[0] : params.id, [params.id]);

  const loadPatientData = useCallback(() => {
    const storedPatientsString = localStorage.getItem('fonoayuda-patients');
    const allPatients = storedPatientsString ? JSON.parse(storedPatientsString) : mockPatients;
    const foundPatient = allPatients.find((p: Patient) => p.id === id);

    if (foundPatient) {
        if (typeof window !== 'undefined') {
            const consentDataString = localStorage.getItem(`consent_data_${id}`);
            if(consentDataString) {
                const consentData = JSON.parse(consentDataString);
                setPatient({ ...foundPatient, consent: consentData });
                return;
            }
        }
      setPatient(foundPatient);
    } else {
      notFound();
    }
  }, [id]);

  useEffect(() => {
    loadPatientData();
    const handleFocus = () => loadPatientData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadPatientData]);
  
  useEffect(() => {
    if (patient) {
        const key = `intervention_plan_${patient.id}`;
        const savedPlan = localStorage.getItem(key);
        if (savedPlan) {
            setInterventionPlan(JSON.parse(savedPlan));
        }
    }
  }, [patient]);

  const handleGenerateSummary = useCallback(async () => {
    if (!patient) return;
    setIsSummaryLoading(true);
    setSummary(null);
    try {
        const response = await fetch('/api/summarize-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientName: patient.name,
                sessionData: `Paciente de ${patient.age} años con diagnóstico de ${patient.diagnoses.join(', ')}. Última sesión el ${patient.lastSession}.`,
                activityResults: JSON.stringify(patient.progress),
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al generar el resumen');
        }

      const result = await response.json();
      setSummary(result);
    } catch (error: any) {
      console.error('Error generating summary:', error);
      toast({ title: 'Error de la IA', description: `No se pudo generar el resumen: ${error.message}`, variant: 'destructive'});
    } finally {
      setIsSummaryLoading(false);
    }
  }, [patient, toast]);

  const handleActivityGenerated = useCallback((activity: GeneratePersonalizedActivityOutput) => {
    setSessionActivities(prev => [...prev, activity]);
    setShowGenerator(false);
  }, []);

  const handleSaveSession = useCallback(() => {
     toast({
        title: 'Sesión Guardada',
        description: 'Las actividades y notas han sido guardadas en el historial del paciente.',
      });
      setSessionActivities([]);
      setShowGenerator(true);
  }, [toast]);

  const handleCopySummary = useCallback(() => {
    if (summary) {
      const summaryText = `Resumen de Progreso: ${summary.progress}\n\n${summary.summary}`;
      navigator.clipboard.writeText(summaryText);
      toast({ title: 'Copiado', description: 'El resumen ha sido copiado al portapapeles.'});
    }
  }, [summary, toast]);

  const handleImageChange = useCallback((newUrl: string) => {
    setPatient(p => p ? {...p, avatarUrl: newUrl} : null);
  }, []);
  
  const handleConsentChange = useCallback((newConsent: Consent) => {
    setPatient(p => p ? ({...p, consent: newConsent}) : null);
  }, []);

  if (!patient) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="items-center"><PatientAvatar patient={patient} onImageChange={handleImageChange} /></CardHeader>
                <CardContent className="text-center">
                    <h2 className="text-2xl font-bold">{patient.name}</h2>
                    <p className="text-muted-foreground">{patient.age} años</p>
                    <Separator className="my-4" />
                     <div className="space-y-2 text-left">
                        <h3 className="font-semibold text-sm">Contacto</h3>
                        <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{patient.contact.email}</span></div>
                        <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{patient.contact.phone}</span></div>
                     </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><h3 className="font-semibold text-lg">Diagnóstico(s)</h3></CardHeader>
                <CardContent className="flex flex-col gap-2">
                    {patient.diagnoses.map((diag, index) => <Badge key={index} variant="secondary">{diag}</Badge>)}
                </CardContent>
            </Card>
        </div>
        <div className="flex flex-col">
            <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7">
                <TabsTrigger value="progress">Progreso</TabsTrigger>
                <TabsTrigger value="activities">Plan</TabsTrigger>
                <TabsTrigger value="evaluation">Evaluación</TabsTrigger>
                <TabsTrigger value="photos">Fotos</TabsTrigger>
                <TabsTrigger value="documents">Docs</TabsTrigger>
                <TabsTrigger value="consent">Consentimiento</TabsTrigger>
                <TabsTrigger value="current_session" className="flex items-center gap-1"><Bot className="h-4 w-4" /> Sesión</TabsTrigger>
            </TabsList>
            <TabsContent value="progress" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Progreso del Paciente</CardTitle>
                        <CardDescription>Visualización del puntaje de progreso a lo largo del tiempo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={patient.progress}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString('es-CL', {month: 'short'})} />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}/>
                                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4">
                        <Button onClick={handleGenerateSummary} disabled={isSummaryLoading}>{isSummaryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}Generar Resumen con IA</Button>
                        {isSummaryLoading && <p className="text-sm text-muted-foreground">La IA está analizando los datos...</p>}
                        {summary && (
                            <Card className="w-full bg-secondary/50 relative">
                                <CardHeader>
                                    <CardTitle className="text-lg">Resumen de Progreso (IA)</CardTitle>
                                    <CardDescription>{summary.progress}</CardDescription>
                                </CardHeader>
                                <CardContent><p className="text-sm whitespace-pre-wrap">{summary.summary}</p></CardContent>
                                <CardFooter><Button variant="ghost" size="sm" className="absolute bottom-2 right-2" onClick={handleCopySummary}><Copy className="mr-2 h-4 w-4" />Copiar Texto</Button></CardFooter>
                            </Card>
                        )}
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="activities" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Plan Terapéutico</CardTitle>
                        <CardDescription>Listado de actividades en el plan terapéutico actual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {patient.assignedActivities.length > 0 ? patient.assignedActivities.map((activity: any, index: number) => (
                                <Card key={activity.id} className="p-4">
                                    <h4 className="font-bold">{activity.title}</h4>
                                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                                    <div className="text-xs text-muted-foreground mt-2">Próxima sesión: {patient.lastSession} - Actividad {index + 1}</div>
                                    <div className="flex flex-wrap gap-2 mt-2">{activity.targetSkills.map((skill: any) => <Badge key={skill} variant="outline">{skill}</Badge>)}</div>
                                </Card>
                            )) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    <p>No hay actividades asignadas.</p>
                                    <p className="text-sm">Vaya a la pestaña "Sesión" para generar una nueva actividad.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter><Button variant="outline"><Sparkles className="mr-2 h-4 w-4" />Generar Nueva Actividad con IA</Button></CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="evaluation" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ClipboardCheck /> Resultados de Evaluación e Intervención</CardTitle>
                        <CardDescription>Planes de intervención generados y análisis de evaluaciones para este paciente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {interventionPlan ? <InterventionPlanDisplay analysisResult={interventionPlan} /> : <div className="text-center py-10 text-muted-foreground"><p>No hay planes de intervención generados por IA guardados.</p></div>}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="photos" className="mt-4"><PhotoGallery /></TabsContent>
            <TabsContent value="documents" className="mt-4"><DocumentManager /></TabsContent>
            <TabsContent value="consent" className="mt-4"><ConsentManager patient={patient} onConsentChange={handleConsentChange} /></TabsContent>
            <TabsContent value="current_session" className="mt-4 space-y-6">
                {sessionActivities.map((activity, index) => <div key={index}><ActivityResultDisplay sessionPlan={activity} /></div>)}
                {showGenerator && <ActivityGeneratorForm patient={patient} onActivityGenerated={handleActivityGenerated} />}
                {!showGenerator && (
                    <div className='flex flex-col gap-4 items-center'>
                        <Button onClick={() => setShowGenerator(true)}><Plus className="mr-2 h-4 w-4" />Agregar otra actividad con IA</Button>
                        <Button onClick={handleSaveSession} variant="secondary">Guardar y Finalizar Sesión</Button>
                    </div>
                )}
            </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
