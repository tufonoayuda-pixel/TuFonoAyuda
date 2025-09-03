
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
import { Calculator, FilePenLine, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tests } from '@/lib/test-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { ReelCalculator } from './reel-calculator';
import { TeprosifAnalyzer } from './teprosif-analyzer';

export default function CalcuTELatorPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [score, setScore] = useState<number | ''>('');
  const [ageYears, setAgeYears] = useState<number | ''>('');
  const [ageMonths, setAgeMonths] = useState<number | ''>('');
  const [view, setView] = useState<'calculator' | 'teprosif'>('calculator');

  const [result, setResult] = useState<{ ds: string; interpretation: string; } | null>(null);
  
  const patientTotalMonths = useMemo(() => {
    if (ageYears === '' || ageMonths === '') return null;
    return Number(ageYears) * 12 + Number(ageMonths);
  }, [ageYears, ageMonths]);

  const availableTests = useMemo(() => {
    if (patientTotalMonths === null) {
      return tests;
    }
    return tests.filter(test => 
      test.baremos.some(baremo => {
        const fromTotalMonths = baremo.ageRange.from.years * 12 + baremo.ageRange.from.months;
        const toTotalMonths = baremo.ageRange.to.years * 12 + baremo.ageRange.to.months;
        return patientTotalMonths >= fromTotalMonths && patientTotalMonths <= toTotalMonths;
      })
    );
  }, [patientTotalMonths]);

  const selectedTest = useMemo(() => availableTests.find(t => t.id === selectedTestId), [selectedTestId, availableTests]);
  
  const activeBaremo = useMemo(() => {
    if (!selectedTest || patientTotalMonths === null) {
        return null;
    }
    return selectedTest.baremos.find(b => {
        const fromTotalMonths = b.ageRange.from.years * 12 + b.ageRange.from.months;
        const toTotalMonths = b.ageRange.to.years * 12 + b.ageRange.to.months;
        return patientTotalMonths >= fromTotalMonths && patientTotalMonths <= toTotalMonths;
    });
  }, [selectedTest, patientTotalMonths]);


  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    if (!selectedTest || score === '' || ageYears === '' || ageMonths === '') {
        toast({
            title: 'Error de Validación',
            description: 'Por favor, complete todos los campos: test, puntaje y edad.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    if (!activeBaremo) {
        toast({
            title: 'Error en Baremo',
            description: 'No se encontró un baremo para la edad seleccionada en este test.',
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
                description: 'El puntaje ingresado está fuera de los rangos definidos para la edad seleccionada.',
                variant: 'destructive',
            });
        }
       
        setIsLoading(false);
    }, 1000);
  };

  const handleAgeChange = () => {
    setSelectedTestId('');
    setResult(null);
  };

  const isReelSelected = selectedTestId === 'reel';

  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold">CalcuTELator</h1>
        <p className="text-muted-foreground">
          Calcule rápidamente el rendimiento de un estudiante según los baremos de tests estandarizados chilenos.
        </p>
      </header>

      <div className="flex gap-4">
        <Button onClick={() => setView('calculator')} variant={view === 'calculator' ? 'default' : 'outline'}>
            <Calculator className="mr-2 h-4 w-4"/>
            Calculadora de Baremos
        </Button>
         <Button onClick={() => setView('teprosif')} variant={view === 'teprosif' ? 'default' : 'outline'}>
            <FilePenLine className="mr-2 h-4 w-4"/>
            Análisis TEPROSIF-R
        </Button>
      </div>

        {view === 'calculator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tour-id="calcutelator-main">
                <Card>
                    <CardHeader>
                    <CardTitle>Calculadora de Rendimiento</CardTitle>
                    <CardDescription>
                        Ingrese la edad del paciente para ver los tests disponibles. Luego, seleccione uno e ingrese el puntaje directo para obtener la Desviación Estándar y su interpretación.
                    </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleCalculate}>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age-years">Edad (Años)</Label>
                                    <Input
                                        id="age-years"
                                        type="number"
                                        value={ageYears}
                                        onChange={(e) => {
                                            setAgeYears(e.target.value === '' ? '' : Number(e.target.value));
                                            handleAgeChange();
                                        }}
                                        placeholder="Ej: 5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="age-months">Edad (Meses)</Label>
                                    <Input
                                        id="age-months"
                                        type="number"
                                        value={ageMonths}
                                        onChange={(e) => {
                                            setAgeMonths(e.target.value === '' ? '' : Number(e.target.value));
                                            handleAgeChange();
                                        }}
                                        placeholder="Ej: 3"
                                        min="0"
                                        max="11"
                                    />
                                </div>
                            </div>
                            {patientTotalMonths !== null && availableTests.length === 0 && (
                                <Alert variant="destructive">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Edad fuera de rango</AlertTitle>
                                <AlertDescription>
                                    No hay tests disponibles para la edad ingresada.
                                </AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="test-select">Test Estandarizado</Label>
                                <Select onValueChange={setSelectedTestId} value={selectedTestId} disabled={patientTotalMonths === null || availableTests.length === 0}>
                                    <SelectTrigger id="test-select">
                                        <SelectValue placeholder="Seleccionar un test..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTests.map(test => (
                                            <SelectItem key={test.id} value={test.id}>{test.name} - {test.area}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {!isReelSelected ? (
                                <>
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
                                </>
                            ) : null}
                        </CardContent>
                    </form>
                    {isReelSelected && patientTotalMonths !== null && (
                        <ReelCalculator ageInMonths={patientTotalMonths} />
                    )}
                </Card>
                
                <div className="space-y-6">
                    {result && !isReelSelected && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultado del Análisis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-center">
                                <p className="text-lg">Desviación Estándar (DS):</p>
                                <p className="text-3xl font-bold text-primary">{result.ds}</p>
                                <p className="text-lg pt-2">Interpretación:</p>
                                <p className="text-2xl font-semibold">{result.interpretation}</p>
                            </CardContent>
                        </Card>
                    )}

                    {activeBaremo && !isReelSelected && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Baremos para {selectedTest?.name}</CardTitle>
                                <CardDescription>Rango de puntajes para la edad seleccionada: {activeBaremo.ageRange.from.years}a {activeBaremo.ageRange.from.months}m - {activeBaremo.ageRange.to.years}a {activeBaremo.ageRange.to.months}m.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Puntaje</TableHead>
                                            <TableHead>D.S.</TableHead>
                                            <TableHead>Rendimiento</TableHead>
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
        )}
        {view === 'teprosif' && <TeprosifAnalyzer />}
    </div>
  );
}
