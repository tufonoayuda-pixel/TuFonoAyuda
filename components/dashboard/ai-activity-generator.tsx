
'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { Sparkles, Loader2, Gem } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
    CardDescription,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
  } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Label } from "../ui/label";
import { ActivityResultDisplay } from "../actividades/activity-result-display";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import Link from 'next/link';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import type { Patient, Reference, GeneratePersonalizedActivityOutput } from "@/lib/types";
import { references as mockReferences } from "@/lib/mock-data";
import { Checkbox } from "../ui/checkbox";
import { useAI } from "@/hooks/useAI";

const validatePatientProfile = (patient: Patient) => {
    if (!patient.profile) {
        throw new Error("El perfil del paciente no está definido. Por favor, edite la ficha del paciente para añadir un perfil detallado.");
    }
    return true;
};

export function AiActivityGenerator() {
    const { toast } = useToast();
    const { loading: isLoading, error, generateActivity } = useAI();
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Inputs
    const [patients, setPatients] = useState<Patient[]>([]);
    const [references, setReferences] = useState<Reference[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [specificNeeds, setSpecificNeeds] = useState('');
    const [sessionDuration, setSessionDuration] = useState(15);
    const [sessionType, setSessionType] = useState('Individual');
    const [isPediatric, setIsPediatric] = useState(false);
    const [additionalDescription, setAdditionalDescription] = useState('');
    const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
   
    // Output
    const [generatedActivity, setGeneratedActivity] = useState<GeneratePersonalizedActivityOutput | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLocked, setIsLocked] = useState(true);
    const [user, setUser] = useState<FirebaseUser | null>(null);

    useEffect(() => {
        setIsLoadingData(true);
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            const isCreator = currentUser && ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(currentUser.email!);
            setIsLocked(!isCreator);

            if (currentUser) {
                const patientsQuery = query(collection(db, `users/${currentUser.uid}/patients`));
                const unsubscribePatients = onSnapshot(patientsQuery, 
                    (snapshot) => {
                        const patientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
                        setPatients(patientsData);
                        setIsLoadingData(false);
                    }, 
                    (error) => {
                        console.error("Error fetching patients:", error);
                        setPatients([]);
                        setIsLoadingData(false);
                    }
                );

                const referencesQuery = query(collection(db, `users/${currentUser.uid}/references`));
                const unsubscribeReferences = onSnapshot(referencesQuery,
                    (snapshot) => {
                        const referencesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()} as Reference));
                        setReferences(referencesData);
                    },
                    (error) => {
                        console.error("Error fetching references:", error);
                        setReferences(mockReferences);
                    }
                );
                
                return () => {
                    unsubscribePatients();
                    unsubscribeReferences();
                };

            } else {
                setPatients([]);
                setReferences(mockReferences);
                setIsLoadingData(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);
    
    const selectedPatient = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId);
    }, [selectedPatientId, patients]);

    const handlePatientChange = useCallback((patientId: string) => {
        setSelectedPatientId(patientId);
        const patient = patients.find(p => p.id === patientId);
        if (patient) {
            setIsPediatric(patient.age < 18);
        }
    }, [patients]);

    const handleReferenceToggle = useCallback((referenceId: string) => {
        setSelectedReferences(prev => 
          prev.includes(referenceId) 
            ? prev.filter(id => id !== referenceId) 
            : [...prev, referenceId]
        );
    }, []);

    useEffect(() => {
      if(error) {
        toast({
          title: "Error de la IA",
          description: `No se pudo generar la actividad: ${error}`,
          variant: "destructive"
        });
      }
    }, [error, toast]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLocked) {
            toast({
                title: 'Función Premium',
                description: (
                    <p>El Generador de Actividades IA está disponible en los planes de pago. 
                    <Button variant="link" asChild className="p-0 h-auto ml-1"><Link href="/suscripcion">¡Mejora tu plan ahora!</Link></Button></p>
                ),
                variant: 'destructive'
            });
            return;
        }

        if (!selectedPatient) {
            toast({
                title: "Error de Validación",
                description: "Por favor, seleccione un paciente.",
                variant: "destructive"
            });
            return;
        }

        if (specificNeeds.trim().length < 5) {
            toast({
                title: "Error de Validación",
                description: "Por favor, proporcione un objetivo específico más detallado.",
                variant: "destructive"
            });
            return;
        }

        try {
            validatePatientProfile(selectedPatient);
        } catch (error: any) {
             toast({
                title: "Error en perfil del paciente",
                description: error.message,
                variant: "destructive"
            });
            return;
        }


        const referenceSummaries = references
            .filter(ref => selectedReferences.includes(ref.id))
            .map(ref => `- ${ref.title}: ${ref.summary}`)
            .join('\n');
        
        const requestBody = {
            patientProfile: selectedPatient.profile,
            specificNeeds: specificNeeds.trim(),
            sessionDuration,
            sessionType,
            isPediatric,
            additionalDescription: additionalDescription.trim(),
            scientificReferences: referenceSummaries,
        };

        const result = await generateActivity(requestBody);
        
        if (result) {
            setGeneratedActivity(result);
            setIsModalOpen(true);
            toast({
                title: "Actividad Generada",
                description: "La nueva actividad ha sido creada por la IA.",
            });
        }
    }

    if (isLoadingData) {
        return (
            <Card className="lg:col-span-1 relative flex items-center justify-center h-80">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Cargando datos...</p>
                </div>
            </Card>
        );
    }
    
    return (
        <>
        <Card className="lg:col-span-1 relative" data-tour-id="ai-activity-generator">
            {isLocked && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
                    <div className="text-center space-y-2">
                        <Gem className="h-10 w-10 text-primary mx-auto"/>
                        <h4 className="font-bold text-lg">Desbloquee el Generador IA</h4>
                        <p className="text-sm text-muted-foreground">Esta es una función de nuestros planes de pago. ¡Actualice para crear actividades ilimitadas!</p>
                        <Button asChild>
                            <Link href="/suscripcion">Ver Planes</Link>
                        </Button>
                    </div>
                </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary" />
                Generador de Actividades IA
              </CardTitle>
              <CardDescription>Cree una nueva actividad personalizada para un paciente.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Paciente</Label>
                      <Select required onValueChange={handlePatientChange} value={selectedPatientId} disabled={isLocked}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.length > 0 ? (
                                patients.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} ({p.age} años)
                                    </SelectItem>
                                ))
                             ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">No hay pacientes creados.</div>
                            )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedPatientId && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="specific-needs">Objetivo Específico a Trabajar</Label>
                                <Textarea
                                    id="specific-needs"
                                    value={specificNeeds}
                                    onChange={(e) => setSpecificNeeds(e.target.value)}
                                    placeholder="Ej: Producción del fonema /r/ en palabras"
                                    required
                                    disabled={isLocked}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="session-duration">Duración (min)</Label>
                                    <Input id="session-duration" type="number" value={sessionDuration} onChange={(e) => setSessionDuration(Number(e.target.value))} required disabled={isLocked}/>
                                </div>
                                <div className="space-y-2">
                                <Label htmlFor="session-type">Tipo de Sesión</Label>
                                <Select value={sessionType} onValueChange={setSessionType} disabled={isLocked}>
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
                                <Textarea id="additional-description" value={additionalDescription} onChange={(e) => setAdditionalDescription(e.target.value)} placeholder="Añada detalles como: tipo de material (concreto/abstracto), apoyo tecnológico..." disabled={isLocked}/>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Switch id="is-pediatric" checked={isPediatric} onCheckedChange={setIsPediatric} disabled={isLocked}/>
                                    <Label htmlFor="is-pediatric">Sesión Pediátrica</Label>
                                </div>
                            </div>
                            <div>
                            <Label className="block text-sm font-medium mb-2">Fundamentar en Referencias (Opcional)</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto rounded-md border p-2">
                                {references.length > 0 ? references.map(ref => (
                                <div key={ref.id} className="flex items-center space-x-2">
                                    <Checkbox id={`ref-${ref.id}`} checked={selectedReferences.includes(ref.id)} onCheckedChange={() => handleReferenceToggle(ref.id)} disabled={isLocked}/>
                                    <Label htmlFor={`ref-${ref.id}`} className="text-sm font-normal cursor-pointer">{ref.title} ({ref.year})</Label>
                                </div>
                                )) : <p className="text-xs text-muted-foreground p-2">No hay referencias en tu base de conocimiento.</p>}
                            </div>
                            </div>
                        </>
                    )}

                    <div className="pt-2">
                        <Button type="submit" className="w-full" disabled={isLoading || isLocked || !selectedPatientId}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generar Actividad con IA
                        </Button>
                    </div>
                </form>
            </CardContent>
          </Card>

          {generatedActivity && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Actividad Sugerida</DialogTitle>
                    <DialogDescription>
                    Este es un plan de actividad detallado generado por IA. Puede copiar, editar y guardarlo para su paciente.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-4">
                     <ActivityResultDisplay sessionPlan={generatedActivity} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                    <Button type="button" variant="secondary">Cerrar</Button>
                    </DialogClose>
                    <Button type="button" onClick={() => {
                        toast({title: "Actividad Guardada", description: "La actividad se ha añadido al plan del paciente."});
                        setIsModalOpen(false);
                    }}>
                    Guardar en Plan
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
        </>
    )
}
