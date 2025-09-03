
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Save, User, Brain } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { patients } from '@/lib/mock-data';
import { DatePicker } from '@/components/reportes/date-picker';
import { cn } from '@/lib/utils';

interface SectionProps {
    title: string;
    score: number;
    maxScore: number;
    children: React.ReactNode;
}

const Section = ({ title, score, maxScore, children }: SectionProps) => (
    <div className="grid grid-cols-[1fr_50px] items-start gap-4 py-4 border-b">
        <div>
            <h3 className="font-semibold">{title}</h3>
            {children}
        </div>
        <div className="text-right">
            <Input type="number" value={score} max={maxScore} min={0} className="w-16 text-center font-bold" readOnly />
            <span className="text-sm text-muted-foreground">/ {maxScore}</span>
        </div>
    </div>
);

const ScoreInput = ({ id, value, onChange, max, ...props }: { id: string, value: number, onChange: (id: string, value: number) => void, max: number } & React.ComponentProps<typeof Input>) => (
    <Input 
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(id, Math.min(max, Number(e.target.value)))}
        className="w-16 h-8 text-center"
        max={max}
        min={0}
        {...props}
    />
)

export function MocaTestForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [evaluationDate, setEvaluationDate] = useState<Date|undefined>(new Date());
    const [scores, setScores] = useState<Record<string, number>>({});
    const [memoryWords, setMemoryWords] = useState<Record<string, boolean[]>>({
        'ROSTRO': [false, false], 'SEDA': [false, false], 'IGLESIA': [false, false], 'CLAVEL': [false, false], 'ROJO': [false, false]
    });
    const [deferredRecall, setDeferredRecall] = useState<Record<string, boolean>>({
        'ROSTRO': false, 'SEDA': false, 'IGLESIA': false, 'CLAVEL': false, 'ROJO': false
    });

    const selectedPatient = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId);
    }, [selectedPatientId]);

    const handleScoreChange = (id: string, value: number) => {
        setScores(prev => ({ ...prev, [id]: value }));
    };

    const handleMemoryChange = (word: string, attempt: number, checked: boolean) => {
        setMemoryWords(prev => ({
            ...prev,
            [word]: prev[word] ? (attempt === 1 ? [checked, prev[word][1]] : [prev[word][0], checked]) : [false, false]
        }))
    }
    const handleDeferredChange = (word: string, checked: boolean) => {
        setDeferredRecall(prev => ({...prev, [word]: checked}));
    }

    const visuospatialScore = useMemo(() => (scores['trail'] || 0) + (scores['cube'] || 0) + (scores['clock'] || 0), [scores]);
    const identificationScore = useMemo(() => (scores['lion'] || 0) + (scores['rhino'] || 0) + (scores['camel'] || 0), [scores]);
    const attentionScore = useMemo(() => (scores['digitsFwd'] || 0) + (scores['digitsBwd'] || 0) + (scores['letters'] || 0) + (scores['subtraction'] || 0), [scores]);
    const languageScore = useMemo(() => (scores['repetition'] || 0) + (scores['fluency'] || 0), [scores]);
    const abstractionScore = useMemo(() => (scores['abstraction'] || 0), [scores]);
    const deferredRecallScore = useMemo(() => Object.values(deferredRecall).filter(Boolean).length, [deferredRecall]);
    const orientationScore = useMemo(() => (scores['date'] || 0) + (scores['month'] || 0) + (scores['year'] || 0) + (scores['day'] || 0) + (scores['place'] || 0) + (scores['city'] || 0), [scores]);
    
    const subTotal = useMemo(() => {
        return visuospatialScore + identificationScore + attentionScore + languageScore + abstractionScore + deferredRecallScore + orientationScore;
    }, [visuospatialScore, identificationScore, attentionScore, languageScore, abstractionScore, deferredRecallScore, orientationScore]);
    
    const [addPoint, setAddPoint] = useState(false);
    const totalScore = useMemo(() => subTotal + (addPoint ? 1 : 0), [subTotal, addPoint]);

    useEffect(() => {
        setScores({
            'trail': 0, 'cube': 0, 'clock': 0,
            'lion': 0, 'rhino': 0, 'camel': 0,
            'digitsFwd': 0, 'digitsBwd': 0, 'letters': 0, 'subtraction': 0,
            'repetition': 0, 'fluency': 0,
            'abstraction': 0,
            'date': 0, 'month': 0, 'year': 0, 'day': 0, 'place': 0, 'city': 0,
        });
        setMemoryWords({
            'ROSTRO': [false, false], 'SEDA': [false, false], 'IGLESIA': [false, false], 'CLAVEL': [false, false], 'ROJO': [false, false]
        });
        setDeferredRecall({
            'ROSTRO': false, 'SEDA': false, 'IGLESIA': false, 'CLAVEL': false, 'ROJO': false
        })
    }, [selectedPatientId]);


    const handleSave = () => {
        if (!selectedPatientId) {
            toast({ title: 'Error', description: 'Por favor, seleccione un paciente primero.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({ title: 'Protocolo Guardado', description: 'El registro del MoCA ha sido guardado en la ficha del paciente.' });
        }, 1500);
    }

    const handlePrint = () => { window.print(); }

  return (
    <Card className="mt-4 print:shadow-none print:border-none">
        <CardHeader className="print:hidden">
            <CardTitle>Montreal Cognitive Assessment (MoCA)</CardTitle>
            <CardDescription>Seleccione un paciente y complete el protocolo de evaluación.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="patient-select" className='flex items-center gap-2'><User className='h-4 w-4' /> Paciente</Label>
                        <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
                            <SelectTrigger id="patient-select"><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                            <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha de Evaluación</Label>
                        <DatePicker date={evaluationDate} setDate={setEvaluationDate} />
                    </div>
                </div>
            </div>
            
            <Separator />
            
            <Section title="Visuoespacial / Ejecutiva" score={visuospatialScore} maxScore={5}>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>1-A, 2-B, 3-C, 4-D, 5-E</p>
                    <ScoreInput id="trail" value={scores['trail'] || 0} onChange={handleScoreChange} max={1} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Cubo</p>
                    <ScoreInput id="cube" value={scores['cube'] || 0} onChange={handleScoreChange} max={1} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Reloj (Once y diez)</p>
                    <ScoreInput id="clock" value={scores['clock'] || 0} onChange={handleScoreChange} max={3} />
                </div>
            </Section>

            <Section title="Identificación" score={identificationScore} maxScore={3}>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>León</p>
                    <ScoreInput id="lion" value={scores['lion'] || 0} onChange={handleScoreChange} max={1} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Rinoceronte</p>
                    <ScoreInput id="rhino" value={scores['rhino'] || 0} onChange={handleScoreChange} max={1} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Camello</p>
                    <ScoreInput id="camel" value={scores['camel'] || 0} onChange={handleScoreChange} max={1} />
                </div>
            </Section>

            <Section title="Memoria" score={0} maxScore={0}>
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Lista de palabras</span><span>1er intento</span><span>2do intento</span>
                </div>
                 {Object.keys(memoryWords).map(word => (
                     <div key={word} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
                        <span>{word}</span>
                        <Checkbox checked={memoryWords[word][0]} onCheckedChange={(checked) => handleMemoryChange(word, 1, checked as boolean)} />
                        <Checkbox checked={memoryWords[word][1]} onCheckedChange={(checked) => handleMemoryChange(word, 2, checked as boolean)} />
                    </div>
                ))}
            </Section>
            
            <Section title="Atención" score={attentionScore} maxScore={6}>
                 <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Repetir dígitos (2 1 8 5 4)</p>
                    <ScoreInput id="digitsFwd" value={scores['digitsFwd'] || 0} onChange={handleScoreChange} max={1} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Repetir dígitos a la inversa (7 4 2)</p>
                    <ScoreInput id="digitsBwd" value={scores['digitsBwd'] || 0} onChange={handleScoreChange} max={1} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Golpecito con la mano en la letra "A"</p>
                    <ScoreInput id="letters" value={scores['letters'] || 0} onChange={handleScoreChange} max={1} />
                </div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Restar de 7 en 7 desde 100</p>
                    <ScoreInput id="subtraction" value={scores['subtraction'] || 0} onChange={handleScoreChange} max={3} />
                </div>
            </Section>

            <Section title="Lenguaje" score={languageScore} maxScore={3}>
                 <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Repetición de frases</p>
                    <ScoreInput id="repetition" value={scores['repetition'] || 0} onChange={handleScoreChange} max={2} />
                </div>
                 <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Fluidez del lenguaje (letra "P")</p>
                    <ScoreInput id="fluency" value={scores['fluency'] || 0} onChange={handleScoreChange} max={1} />
                </div>
            </Section>
            
            <Section title="Abstracción" score={abstractionScore} maxScore={2}>
                 <div className="grid grid-cols-[1fr_auto] items-center gap-4 mt-2">
                    <p>Similitud (ej: tren-bicicleta)</p>
                    <ScoreInput id="abstraction" value={scores['abstraction'] || 0} onChange={handleScoreChange} max={2} />
                </div>
            </Section>

            <Section title="Recuerdo Diferido" score={deferredRecallScore} maxScore={5}>
                <div className="grid grid-cols-5 gap-2 mt-2">
                {Object.keys(deferredRecall).map(word => (
                     <div key={word} className="flex flex-col items-center gap-2">
                        <Label htmlFor={`recall-${word}`}>{word}</Label>
                        <Checkbox id={`recall-${word}`} checked={deferredRecall[word]} onCheckedChange={(checked) => handleDeferredChange(word, checked as boolean)}/>
                    </div>
                ))}
                </div>
            </Section>

             <Section title="Orientación" score={orientationScore} maxScore={6}>
                 <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
                    <div className="space-y-1"><Label>Día</Label><ScoreInput id="date" value={scores['date'] || 0} onChange={handleScoreChange} max={1} /></div>
                    <div className="space-y-1"><Label>Mes</Label><ScoreInput id="month" value={scores['month'] || 0} onChange={handleScoreChange} max={1} /></div>
                    <div className="space-y-1"><Label>Año</Label><ScoreInput id="year" value={scores['year'] || 0} onChange={handleScoreChange} max={1} /></div>
                    <div className="space-y-1"><Label>Semana</Label><ScoreInput id="day" value={scores['day'] || 0} onChange={handleScoreChange} max={1} /></div>
                    <div className="space-y-1"><Label>Lugar</Label><ScoreInput id="place" value={scores['place'] || 0} onChange={handleScoreChange} max={1} /></div>
                    <div className="space-y-1"><Label>Localidad</Label><ScoreInput id="city" value={scores['city'] || 0} onChange={handleScoreChange} max={1} /></div>
                 </div>
            </Section>

        </CardContent>
         <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
            <div className="flex flex-col items-start gap-2">
                <div className={cn("flex items-center space-x-2", totalScore < 26 ? 'text-destructive' : 'text-green-600')}>
                    <Label htmlFor="totalScore" className="text-lg font-bold">TOTAL:</Label>
                    <Input id="totalScore" value={totalScore} className="w-20 h-10 text-xl font-bold text-center" readOnly />
                    <span className="text-lg font-bold">/ 30</span>
                </div>
                 <div className="flex items-center space-x-2 pl-1">
                    <Checkbox id="addPoint" checked={addPoint} onCheckedChange={(checked) => setAddPoint(checked as boolean)} />
                    <Label htmlFor="addPoint" className="text-xs text-muted-foreground">Añadir 1 punto si tiene ≤ 12 años de estudios</Label>
                </div>
            </div>
            <div className='flex gap-4 print:hidden'>
                <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
                <Button onClick={handleSave} disabled={isLoading || !selectedPatientId}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                    Guardar en Ficha
                </Button>
            </div>
        </CardFooter>
    </Card>
  );
}

