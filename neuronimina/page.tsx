
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calculator, FilePenLine, Loader2, BrainCircuit, FileCheck, ArrowLeft, ClipboardCheck, MessageCircleWarning } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tests } from '@/lib/test-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpontaneousSpeechAnalyzer } from './spontaneous-speech-analyzer';
import { BostonProtocolForm } from './boston-protocol-form';
import { MastProtocolForm } from './mast-protocol-form';
import { MocaTestForm } from './moca-test-form';
import { DysarthriaIntelligibilityScale } from './dysarthria-intelligibility-scale';

function BostonTestCalculator() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState<string>('');
    const [score, setScore] = useState<number | ''>('');
    const [ageYears, setAgeYears] = useState<number | ''>('');
    
    const [result, setResult] = useState<{ ds: string; interpretation: string; } | null>(null);
    
    const availableTests = useMemo(() => {
        return tests.filter(test => test.id.startsWith('boston'));
    }, []);

    const selectedTest = useMemo(() => availableTests.find(t => t.id === selectedTestId), [selectedTestId, availableTests]);
    
    const activeBaremo = useMemo(() => {
        if (!selectedTest) return null;
        // For adult tests, we might have a single age range
        return selectedTest.baremos[0];
    }, [selectedTest]);


    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        if (!selectedTest || score === '' || ageYears === '') {
            toast({
                title: 'Error de Validación',
                description: 'Por favor, complete todos los campos.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        if (!activeBaremo) {
            toast({
                title: 'Error en Baremo',
                description: 'No se encontró un baremo para este test.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        setTimeout(() => {
            const foundResult = activeBaremo.baremo.find(b => Number(score) >= b.min && Number(score) <= b.max);

            if (foundResult) {
                setResult({ ds: foundResult.ds, interpretation: foundResult.interpretation });
                toast({
                    title: 'Cálculo Completo',
                    description: 'Se ha determinado el rendimiento del puntaje.',
                });
            } else {
                 setResult({ ds: 'Fuera de Rango', interpretation: 'El puntaje no se encuentra en el baremo.' });
                 toast({
                    title: 'Puntaje Fuera de Rango',
                    description: 'El puntaje ingresado está fuera de los rangos definidos.',
                    variant: 'destructive',
                });
            }
           
            setIsLoading(false);
        }, 1000);
      };

    const handleTestChange = () => {
        setResult(null);
        setScore('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            <Card>
                <CardHeader>
                <CardTitle>Calculadora de Rendimiento de Boston</CardTitle>
                <CardDescription>
                    Seleccione la versión del test, la edad del paciente y el puntaje directo para obtener el percentil y su interpretación.
                </CardDescription>
                </CardHeader>
                <form onSubmit={handleCalculate}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="age-years">Edad (Años)</Label>
                            <Input
                                id="age-years"
                                type="number"
                                value={ageYears}
                                onChange={(e) => setAgeYears(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="Ej: 65"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="test-select">Versión del Test</Label>
                            <Select onValueChange={(value) => { setSelectedTestId(value); handleTestChange(); }} value={selectedTestId}>
                                <SelectTrigger id="test-select">
                                    <SelectValue placeholder="Seleccionar versión..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTests.map(test => (
                                        <SelectItem key={test.id} value={test.id}>{test.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="score-input">Puntaje Directo (PD)</Label>
                            <Input
                                id="score-input"
                                type="number"
                                value={score}
                                onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
                                placeholder="Ingrese el puntaje obtenido"
                                disabled={!selectedTestId}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || !selectedTestId || score === ''} className="w-full">
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Calculator className="mr-2 h-4 w-4" />
                            )}
                            Calcular Rendimiento
                        </Button>
                    </CardContent>
                </form>
            </Card>
            
            <div className="space-y-6">
                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Resultado del Análisis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-lg">Rendimiento (Percentil):</p>
                            <p className="text-3xl font-bold text-primary">{result.ds}</p>
                            <p className="text-lg pt-2">Interpretación:</p>
                            <p className="text-2xl font-semibold">{result.interpretation}</p>
                        </CardContent>
                    </Card>
                )}

                {activeBaremo && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Baremos para {selectedTest?.name}</CardTitle>
                            <CardDescription>Rangos de puntajes para la evaluación.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Puntaje</TableHead>
                                        <TableHead>Percentil</TableHead>
                                        <TableHead>Interpretación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {activeBaremo.baremo.map((b, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{b.scoreRange}</TableCell>
                                            <TableCell>{b.ds}</TableCell>
                                            <TableCell>{b.interpretation}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}


export default function NeuroNominaPage() {
  const [view, setView] = useState<'main' | 'boston' | 'mast' | 'moca' | 'disartria'>('main');

  const renderView = () => {
    switch(view) {
        case 'boston':
            return (
                 <div className="space-y-4">
                    <Button variant="outline" onClick={() => setView('main')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Tests
                    </Button>
                    <Tabs defaultValue="boston-test" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="boston-test">
                                <Calculator className="mr-2 h-4 w-4"/>
                                Test de Denominación
                            </TabsTrigger>
                            <TabsTrigger value="boston-protocol">
                                <FileCheck className="mr-2 h-4 w-4"/>
                                Protocolo de Registro
                            </TabsTrigger>
                             <TabsTrigger value="speech-analysis">
                                <BrainCircuit className="mr-2 h-4 w-4"/>
                                Perfil de Habla
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="boston-test">
                            <BostonTestCalculator />
                        </TabsContent>
                        <TabsContent value="boston-protocol">
                            <BostonProtocolForm />
                        </TabsContent>
                        <TabsContent value="speech-analysis">
                            <SpontaneousSpeechAnalyzer />
                        </TabsContent>
                    </Tabs>
                </div>
            )
        case 'mast':
            return (
                 <div className="space-y-4">
                    <Button variant="outline" onClick={() => setView('main')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Tests
                    </Button>
                   <MastProtocolForm />
                </div>
            )
        case 'moca':
            return (
                <div className="space-y-4">
                    <Button variant="outline" onClick={() => setView('main')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Tests
                    </Button>
                    <MocaTestForm />
                </div>
            )
        case 'disartria':
            return (
                <div className="space-y-4">
                    <Button variant="outline" onClick={() => setView('main')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Tests
                    </Button>
                    <DysarthriaIntelligibilityScale />
                </div>
            )
        case 'main':
        default:
             return (
                 <Card>
                    <CardHeader>
                        <CardTitle>Batería de Tests Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        <Button size="lg" onClick={() => setView('boston')}>
                            Test de Denominación de Boston
                        </Button>
                        <Button size="lg" onClick={() => setView('mast')}>
                           Test de Cribado de Afasia (MAST)
                        </Button>
                        <Button size="lg" onClick={() => setView('moca')}>
                           Test de MoCA
                        </Button>
                         <Button size="lg" onClick={() => setView('disartria')}>
                           Escala de Inteligibilidad para Disartria
                        </Button>
                    </CardContent>
                </Card>
             )

    }
  }


  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold flex items-center gap-3"><BrainCircuit/>NeuroNomina</h1>
        <p className="text-muted-foreground">
          Seleccione una herramienta de evaluación para el paciente adulto.
        </p>
      </header>
      {renderView()}
    </div>
  );
}
