
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Save, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { patients as mockPatients } from '@/lib/mock-data';
import type { Patient } from '@/lib/types';
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';


const socialQuestions = [
  "¿Cómo está usted hoy?",
  "¿Ha estado alguna vez aquí antes? o ¿lo he examinado alguna vez antes?",
  "¿Cree que podemos ayudarlo (lo hemos ayudado antes)?",
  "¿Cree que puede mejorar?",
  "¿Cuándo cree que va a terminar el tratamiento?",
  "¿Cuál es su nombre completo?",
  "¿Cuál es su dirección completa?",
];

export function BostonProtocolForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const q = query(collection(db, `users/${currentUser.uid}/patients`));
                const unsubscribePatients = onSnapshot(q, (snapshot) => {
                    const patientsData: Patient[] = [];
                    snapshot.forEach((doc) => patientsData.push({ id: doc.id, ...doc.data() } as Patient));
                    setPatients(patientsData);
                });
                return () => unsubscribePatients();
            } else {
                setPatients([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const selectedPatient = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId);
    }, [selectedPatientId, patients]);


    const handleSave = async () => {
        if (!selectedPatientId || !user) {
            toast({ title: 'Error', description: 'Por favor, seleccione un paciente primero.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        // Here you would collect all the form data into a structured object.
        const protocolData = {
            testName: 'Test de Boston',
            date: new Date().toISOString(),
            //... collect other fields
        };
        try {
            const patientDocRef = doc(db, `users/${user.uid}/patients`, selectedPatientId);
            await updateDoc(patientDocRef, {
                evaluations: arrayUnion(protocolData)
            });
            toast({ title: 'Protocolo Guardado', description: 'El registro del Test de Boston ha sido guardado en la ficha del paciente.' });
        } catch (error) {
            console.error("Error saving protocol: ", error);
            toast({ title: 'Error', description: 'No se pudo guardar el protocolo.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }

    const handlePrint = () => {
        window.print();
    }

  return (
    <Card className="mt-4 print:shadow-none print:border-none">
        <CardHeader className="print:hidden">
            <CardTitle>Protocolo de Registro del Test de Boston</CardTitle>
            <CardDescription>Seleccione un paciente y complete el cuadernillo de registro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Patient Info */}
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="patient-select" className='flex items-center gap-2'><User className='h-4 w-4' /> Paciente</Label>
                    <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                        <SelectTrigger id="patient-select">
                            <SelectValue placeholder="Seleccionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                            {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                {selectedPatient && (
                 <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1"><Label htmlFor="codigo">Código</Label><Input id="codigo" value={selectedPatient.id} readOnly/></div>
                        <div className="space-y-1"><Label htmlFor="fecha">Fecha</Label><Input id="fecha" type="date" /></div>
                        <div className="space-y-1"><Label htmlFor="direccion">Dirección</Label><Input id="direccion" /></div>
                        <div className="space-y-1"><Label htmlFor="edad">Edad</Label><Input id="edad" type="number" value={selectedPatient.age} readOnly/></div>
                        <div className="space-y-1"><Label htmlFor="sexo">Sexo</Label><RadioGroup defaultValue="m" className="flex items-center space-x-4 pt-2"><RadioGroupItem value="m" id="m"/><Label htmlFor="m">M</Label><RadioGroupItem value="f" id="f" /><Label htmlFor="f">F</Label></RadioGroup></div>
                        <div className="space-y-1"><Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label><Input id="fechaNacimiento" type="date" /></div>
                        <div className="space-y-1"><Label htmlFor="lugarNacimiento">Lugar de nacimiento</Label><Input id="lugarNacimiento" /></div>
                        <div className="space-y-1"><Label htmlFor="nivelEstudios">Nivel de estudios</Label><Input id="nivelEstudios" /></div>
                        <div className="space-y-1"><Label htmlFor="cursoEstudios">¿Hasta qué curso?</Label><Input id="cursoEstudios" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="antecedentesOcupacionales">Antecedentes ocupacionales</Label><Input id="antecedentesOcupacionales" /></div>
                        <div className="space-y-1"><Label htmlFor="antecedentesLenguaje">Antecedentes de lenguaje</Label><Input id="antecedentesLenguaje" defaultValue="Sólo español" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1"><Label htmlFor="dominanciaManual">Dominancia manual</Label><RadioGroup defaultValue="diestro" className="flex items-center space-x-2 pt-2"><RadioGroupItem value="diestro" id="diestro"/><Label htmlFor="diestro">Diestro</Label><RadioGroupItem value="zurdo" id="zurdo"/><Label htmlFor="zurdo">Zurdo</Label><RadioGroupItem value="ambidiestro" id="ambidiestro"/><Label htmlFor="ambidiestro">Ambidiestro</Label></RadioGroup></div>
                        <div className="space-y-1"><Label htmlFor="antecedentesFamiliares">Antecedentes familiares de dominancia manual</Label><Input id="antecedentesFamiliares" /></div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="naturalezaEnfermedad">Naturaleza y duración de la enfermedad actual</Label>
                        <Textarea id="naturalezaEnfermedad" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1"><Label>Hemiplejía</Label><div className="flex items-center space-x-4"><Checkbox id="hemi-der"/><Label htmlFor='hemi-der'>Derecha</Label><Checkbox id="hemi-izq"/><Label htmlFor='hemi-izq'>Izquierda</Label></div></div>
                        <div className="space-y-1"><Label>Hemianopsia</Label><div className="flex items-center space-x-4"><Checkbox id="hemian-der"/><Label htmlFor='hemian-der'>Derecha</Label><Checkbox id="hemian-izq"/><Label htmlFor='hemian-izq'>Izquierda</Label></div></div>
                        <div className="space-y-1"><Label>Recuperada</Label><Checkbox /></div>
                        <div className="space-y-1"><Label>Ausente</Label><Checkbox /></div>
                    </div>
                </>
                )}
            </div>
            
            <Separator />
            
            {/* Habla de Conversación y Exposición */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">I. HABLA DE CONVERSACIÓN Y EXPOSICIÓN</h3>
                
                {/* A. Respuestas sociales sencillas */}
                <div className="space-y-2">
                    <h4 className="font-medium">A. Respuestas sociales sencillas (Conversación informal)</h4>
                    {socialQuestions.map((q, i) => (
                        <div key={i} className="flex items-center">
                            <Label className="w-8">{i+1}.</Label>
                            <p className="flex-1 text-sm">{q}</p>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                        <Label htmlFor="puntuacionSocial">Puntuación: Número de respuestas sociales apropiadas obtenidas</Label>
                        <Input id="puntuacionSocial" type="number" className="w-20" max={7} min={0} />
                        <span>/ 7</span>
                    </div>
                </div>

                {/* B. Conversación libre */}
                 <div className="space-y-2">
                    <h4 className="font-medium">B. Conversación libre: durante 3 min. Aproximadamente.</h4>
                    <p className="text-sm text-muted-foreground">Iniciar con temas familiares (¿A qué se dedicaba usted antes de ponerse enfermo? o ¿Qué le sucedió para que lo trajeran aquí?)</p>
                    <Textarea id="transcripcionLiteral" rows={8} placeholder="Transcripción literal..." />
                </div>
            </div>
        </CardContent>
         <CardFooter className="flex justify-end gap-4 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !selectedPatientId}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Guardar en Ficha
            </Button>
        </CardFooter>
    </Card>
  );
}

    