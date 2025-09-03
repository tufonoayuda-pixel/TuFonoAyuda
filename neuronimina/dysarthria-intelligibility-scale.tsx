
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Printer, Save, User, Info } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { patients } from '@/lib/mock-data';
import { DatePicker } from '@/components/reportes/date-picker';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const scaleData = [
  { level: 1, severity: 'Normal', dimensions: ['Ambiente', 'Contenido', 'Eficiencia'], description: 'Normal en todos los ambientes sin restricciones de contenido y sin necesidad de realizar reparos.' },
  { level: 2, severity: 'Leve', dimensions: ['Ambiente', 'Contenido', 'Eficiencia'], description: 'A veces (#) reducida frente a condiciones adversas cuando el contenido no tiene restricciones, pero adecuada al realizar reparos.' },
  { level: 3, severity: 'Leve', dimensions: ['Ambiente', 'Contenido', 'Eficiencia'], description: 'A veces reducida frente a condiciones ideales cuando no hay restricciones de contenido, pero adecuada al realizar reparos.' },
  { level: 4, severity: 'Leve', dimensions: ['Ambiente', 'Contenido', 'Eficiencia'], description: 'A veces reducida frente a condiciones adversas aún cuando el contenido está restringido, pero adecuada al realizar reparos.' },
  { level: 5, severity: 'Moderado', dimensions: ['Ambiente', 'Contenido', 'Eficiencia'], description: 'A veces reducida en condiciones ideales cuando no existen restricciones de contenido, aún cuando se intenta realizar reparos.' },
  { level: 6, severity: 'Moderado', dimensions: ['Ambiente', 'Contenido', 'Eficiencia'], description: 'Usualmente (##) reducida bajo condiciones adversas cuando el contenido no tiene restricciones, aún cuando se intenta realizar reparos.' },
  { level: 7, severity: 'Moderado', dimensions: ['Ambiente', 'Contenido'], description: 'Usualmente reducida bajo condiciones ideales aún cuando el contenido es restringido, pero adecuada al realizar reparos.' },
  { level: 8, severity: 'Moderado', dimensions: ['Ambiente', 'Contenido', 'Eficiencia'], description: 'Usualmente reducida bajo condiciones adversas aún cuando hay restricciones de contenido, a pesar del intento por realizar reparos.' },
  { level: 9, severity: 'Moderado', dimensions: ['Ambiente', 'Contenido', 'Eficiencia'], description: 'Usualmente reducida en condiciones ideales aún cuando hay restricciones de contenido, a pesar del intento por realizar reparos.' },
  { level: 10, severity: 'Severo', dimensions: [], description: 'El habla no es un medio viable de comunicación en cualquier ambiente prescindiendo de restricciones de contenido o intentos de reparos.' },
];

const footnotes = [
  { id: 'ambiente', symbol: '(*)', text: 'El ambiente puede ser "ideal" (ej: cara a cara, sin déficit visuales o auditivos en el oyente, sin distractores visuales o auditivos) o "adverso" (ej: a distancia, con déficit o distracciones visuales o auditivas).' },
  { id: 'contenido', symbol: '(**)', text: 'El contenido puede ser "sin restricciones" (incluye todos los contenidos pragmáticamente adecuados, nuevos tópicos, etc.) o "restringido" (ej: limitado a respuestas breves o relatos que permiten realizar alguna predicción sobre respuestas de contenido).' },
  { id: 'eficiencia', symbol: '(***)', text: 'La eficiencia puede ser "normal" (rara vez se necesita repetición o clarificación) o necesitar de "reparos" (repetición, reformulación, respuestas a preguntas clarificadoras, modificación de la producción, etc.).' },
  { id: 'reducida25', symbol: '(#)', text: 'La inteligibilidad está reducida en un 25% o menos de las producciones.' },
  { id: 'reducida50', symbol: '(##)', text: 'La inteligibilidad está reducida en un 50% o más de las producciones, pero no afecta la totalidad de éstas.' },
];

export function DysarthriaIntelligibilityScale() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [evaluationDate, setEvaluationDate] = useState<Date|undefined>(new Date());
    const [selectedLevel, setSelectedLevel] = useState<string>('');

    const handleSave = () => {
        if (!selectedPatientId || !selectedLevel) {
            toast({ title: 'Error', description: 'Por favor, seleccione un paciente y un nivel de inteligibilidad.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({ title: 'Protocolo Guardado', description: 'La escala ha sido guardada en la ficha del paciente.' });
        }, 1500);
    }

    const handlePrint = () => { window.print(); }

    const selectedLevelData = useMemo(() => scaleData.find(item => item.level.toString() === selectedLevel), [selectedLevel]);

  return (
    <Card className="mt-4 print:shadow-none print:border-none">
        <CardHeader className="print:hidden">
            <CardTitle>Escala de Inteligibilidad para la Disartria</CardTitle>
            <CardDescription>Duffy, J. "Motor Speech Disorders", 2005</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            
            <Separator />

            <RadioGroup value={selectedLevel} onValueChange={setSelectedLevel} className="space-y-2">
              {scaleData.map((item) => (
                <div key={item.level} className="flex items-center space-x-2 p-3 rounded-lg border has-[:checked]:bg-secondary has-[:checked]:border-primary transition-all">
                  <RadioGroupItem value={item.level.toString()} id={`level-${item.level}`} />
                  <Label htmlFor={`level-${item.level}`} className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                        <span className="font-bold">Nivel {item.level} ({item.severity})</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {selectedLevelData && (
                 <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle>Detalle del Nivel {selectedLevelData.level}: {selectedLevelData.severity}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p><strong>Estado de la Inteligibilidad:</strong> {selectedLevelData.description}</p>
                        <p><strong>Dimensiones Afectadas:</strong> {selectedLevelData.dimensions.join(', ')}</p>
                    </CardContent>
                </Card>
            )}
            
            <Separator />
            
            <Alert>
                <Info className="h-4 w-4"/>
                <AlertTitle>Notas Aclaratorias</AlertTitle>
                <AlertDescription>
                    <ul className="space-y-1 text-xs">
                        {footnotes.map(note => <li key={note.id}><strong>{note.symbol}</strong> {note.text}</li>)}
                    </ul>
                </AlertDescription>
            </Alert>


        </CardContent>
         <CardFooter className="flex justify-between gap-4 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !selectedPatientId || !selectedLevel}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Guardar en Ficha
            </Button>
        </CardFooter>
    </Card>
  );
}
