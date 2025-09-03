
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Save, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { patients as mockPatients } from '@/lib/mock-data';
import type { Patient } from '@/lib/types';
import { DatePicker } from '@/components/reportes/date-picker';
import { collection, query, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

const denominationItems = [
    { id: 'den1', label: '1) Lápiz' },
    { id: 'den2', label: '2) Mano' },
    { id: 'den3', label: '3) Pulgar' },
    { id: 'den4', label: '4) Reloj' },
    { id: 'den5', label: '5) Techo' },
];

const automaticSpeechItems = [
    { id: 'aut1', label: '1) Contar del 1 al 10', criteria: 'sequence' },
    { id: 'aut2', label: '2) Los días de la semana', criteria: 'sequence' },
    { id: 'aut3', label: '3) Más vale pájaro en mano...', criteria: 'phrase' },
    { id: 'aut4', label: '4) Perro que ladra...', criteria: 'phrase' },
    { id: 'aut5', label: '5) No por mucho madrugar...', criteria: 'phrase' },
];

const repetitionItems = [
    { id: 'rep1', label: '1) Tarro', criteria: 'word' },
    { id: 'rep2', label: '2) Zanahoria', criteria: 'word' },
    { id: 'rep3', label: '3) Abecedario', criteria: 'word' },
    { id: 'rep4', label: '4) Debajo del viejo puente de madera', criteria: 'phrase' },
    { id: 'rep5', label: '5) La plateada luna brilla en la oscura noche', criteria: 'phrase' },
]

export function MastProtocolForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [evaluationDate, setEvaluationDate] = useState<Date|undefined>(new Date());
    const [scores, setScores] = useState<Record<string, number>>({});

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

    const handleScoreChange = (id: string, value: string) => {
        setScores(prev => ({ ...prev, [id]: parseInt(value) || 0 }));
    }

    const calculateTotal = (itemIds: string[]) => {
        return itemIds.reduce((acc, id) => acc + (scores[id] || 0), 0);
    }
    
    const denominationTotal = useMemo(() => calculateTotal(denominationItems.map(i => i.id)), [scores]);
    const automaticSpeechTotal = useMemo(() => calculateTotal(automaticSpeechItems.map(i => i.id)), [scores]);
    const repetitionTotal = useMemo(() => calculateTotal(repetitionItems.map(i => i.id)), [scores]);


    const handleSave = async () => {
        if (!selectedPatientId || !user) {
            toast({ title: 'Error', description: 'Por favor, seleccione un paciente primero.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        const protocolData = {
            testName: 'MAST',
            date: evaluationDate?.toISOString(),
            scores,
            total: denominationTotal + automaticSpeechTotal + repetitionTotal
        };
        try {
            const patientDocRef = doc(db, `users/${user.uid}/patients`, selectedPatientId);
            await updateDoc(patientDocRef, {
                evaluations: arrayUnion(protocolData)
            });
            toast({ title: 'Protocolo Guardado', description: 'El registro del MAST ha sido guardado en la ficha del paciente.' });
        } catch (error) {
             console.error("Error saving MAST protocol: ", error);
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
            <CardTitle>Protocolo de Registro - MAST</CardTitle>
            <CardDescription>Test de Cribado de Afasia (Mississippi Aphasia Screening Test).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Patient Info */}
            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                     <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha de Evaluación</Label>
                        <DatePicker date={evaluationDate} setDate={setEvaluationDate} />
                    </div>
                </div>
            </div>
            
            <Separator />
            
            {/* Denominación */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Denominación: {denominationTotal}/10</h3>
                 {denominationItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                        <Label htmlFor={item.id} className="flex-1">{item.label}</Label>
                        <RadioGroup id={item.id} onValueChange={(val) => handleScoreChange(item.id, val)} className="flex gap-4">
                           <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`${item.id}-2`} /><Label htmlFor={`${item.id}-2`}>2</Label></div>
                           <div className="flex items-center space-x-2"><RadioGroupItem value="0" id={`${item.id}-0`} /><Label htmlFor={`${item.id}-0`}>0</Label></div>
                        </RadioGroup>
                    </div>
                 ))}
                 <Card className='bg-muted/50 text-sm p-3'>
                    <p><b>2 Puntos:</b> Acceso adecuado y/o comete una parafasia fonética.</p>
                    <p><b>0 Puntos:</b> Si comete más de una parafasia fonética.</p>
                 </Card>
            </div>

            <Separator />

            {/* Habla automática */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Habla automática: {automaticSpeechTotal}/10</h3>
                 {automaticSpeechItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                        <Label htmlFor={item.id} className="flex-1">{item.label}</Label>
                        <RadioGroup id={item.id} onValueChange={(val) => handleScoreChange(item.id, val)} className="flex gap-4">
                           <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`${item.id}-2`} /><Label htmlFor={`${item.id}-2`}>2</Label></div>
                           {item.criteria === 'sequence' && <div className="flex items-center space-x-2"><RadioGroupItem value="1" id={`${item.id}-1`}/><Label htmlFor={`${item.id}-1`}>1</Label></div>}
                           <div className="flex items-center space-x-2"><RadioGroupItem value="0" id={`${item.id}-0`} /><Label htmlFor={`${item.id}-0`}>0</Label></div>
                        </RadioGroup>
                    </div>
                 ))}
                <Card className='bg-muted/50 text-sm p-3 space-y-2'>
                    <div>
                        <p className='font-bold'>(Ítems 1-2)</p>
                        <p><b>2 Puntos:</b> Si lo hace correctamente.</p>
                        <p><b>1 Punto:</b> Si hace bien la mitad de la secuencia.</p>
                        <p><b>0 Puntos:</b> No logra completar correctamente la mitad de la secuencia.</p>
                    </div>
                    <Separator/>
                     <div>
                        <p className='font-bold'>(Ítems 3-5)</p>
                        <p><b>2 Puntos:</b> Si lo realiza correctamente.</p>
                        <p><b>0 Puntos:</b> Si comete algún error.</p>
                    </div>
                 </Card>
            </div>
            
            <Separator />

             {/* Repetición */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Repetición: {repetitionTotal}/10</h3>
                 {repetitionItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                        <Label htmlFor={item.id} className="flex-1">{item.label}</Label>
                        <RadioGroup id={item.id} onValueChange={(val) => handleScoreChange(item.id, val)} className="flex gap-4">
                           <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`${item.id}-2`} /><Label htmlFor={`${item.id}-2`}>2</Label></div>
                           <div className="flex items-center space-x-2"><RadioGroupItem value="0" id={`${item.id}-0`} /><Label htmlFor={`${item.id}-0`}>0</Label></div>
                        </RadioGroup>
                    </div>
                 ))}
                <Card className='bg-muted/50 text-sm p-3 space-y-2'>
                    <div>
                        <p className='font-bold'>(Ítems 1-3)</p>
                        <p><b>2 Puntos:</b> Repetición correcta de la palabra.</p>
                        <p><b>0 Puntos:</b> Si comete algún error.</p>
                    </div>
                 </Card>
            </div>


        </CardContent>
         <CardFooter className="flex justify-between gap-4 print:hidden">
            <div className='font-bold text-xl'>Puntaje Total: {denominationTotal + automaticSpeechTotal + repetitionTotal} / 30</div>
            <div className='flex gap-4'>
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Imprimir
                </Button>
                <Button onClick={handleSave} disabled={isLoading || !selectedPatientId}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    Guardar en Ficha
                </Button>
            </div>
        </CardFooter>
    </Card>
  );
}

    