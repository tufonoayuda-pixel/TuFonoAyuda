
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, User, Save, Info, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { patients } from '@/lib/mock-data';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

const speechProfileItems = [
    { id: 'agility', label: '1. Agilidad Articulatoria', minLabel: 'Incapaz de formar sonidos', maxLabel: 'Nunca defectuosa', value: 4 },
    { id: 'phraseLength', label: '2. Longitud de la Frase', minLabel: '1 palabra', maxLabel: '7+ palabras', value: 4 },
    { id: 'grammaticalForm', label: '3. Forma Gramatical', minLabel: 'Sin agrupamientos', maxLabel: 'Rango normal de sintaxis', value: 4 },
    { id: 'prosody', label: '4. Línea Melódica (Prosodia)', minLabel: 'Palabra por palabra', maxLabel: 'Melodía normal', value: 4 },
    { id: 'wordFinding', label: '5. Acceso al léxico (Fluidez)', minLabel: 'Habla fluida pero vacía', maxLabel: 'Producción con contenido', value: 4 },
];

type ProfileState = {
    [key: string]: number | string;
};

const initialProfileState = {
    agility: 4, phraseLength: 4, grammaticalForm: 4, prosody: 4,
    wordFinding: 4,
    ucCount: 0,
    icl: 0,
    interpretation: ''
};

export function SpontaneousSpeechAnalyzer() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [discourse, setDiscourse] = useState('');
    const [profile, setProfile] = useState<ProfileState>(initialProfileState);

    const selectedPatient = useMemo(() => {
        return patients.find(p => p.id === selectedPatientId);
    }, [selectedPatientId]);
    
    const handleSliderChange = (id: string, value: number[]) => {
        setProfile(prev => ({...prev, [id]: value[0]}));
    };
    
    const handleInputChange = (id: string, value: string) => {
        setProfile(prev => ({...prev, [id]: value}));
    };

    const handleAnalyze = () => {
        setIsLoading(true);
        // Simulate IA analysis based on discourse length and keywords
        setTimeout(() => {
            const words = discourse.split(/\s+/).length;
            const sentences = discourse.split(/[.!?]+/).length;

            const ucCount = sentences > 1 ? sentences - 1 : 0;
            const icl = ucCount > 0 ? words / ucCount : 0;
            
            setProfile({
                agility: 5, phraseLength: 6, grammaticalForm: 5, prosody: 6,
                wordFinding: 5,
                ucCount: ucCount,
                icl: parseFloat(icl.toFixed(2)),
                interpretation: 'El paciente presenta un discurso con una longitud de frase adecuada y buena agilidad articulatoria. Se observan dificultades leves en el acceso al léxico y una prosodia ligeramente monotóna. La complejidad sintáctica es apropiada para el contexto.'
            });
            setIsLoading(false);
            toast({
                title: 'Análisis IA Completado',
                description: 'El perfil del habla ha sido autocompletado. Revise y ajuste si es necesario.'
            });
        }, 2000);
    }

    const handleSave = () => {
        toast({
            title: 'Perfil Guardado',
            description: `El perfil de lenguaje espontáneo para ${selectedPatient?.name} ha sido guardado.`
        });
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Perfil de Características del Habla</CardTitle>
                <CardDescription>Pegue una muestra de lenguaje y utilice la IA para obtener un perfil de habla detallado y métricas clave.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <Label htmlFor="discourse-text">Transcripción de la Muestra de Lenguaje</Label>
                    <Textarea id="discourse-text" value={discourse} onChange={(e) => setDiscourse(e.target.value)} rows={6} placeholder="Pegue aquí la transcripción del discurso espontáneo del paciente (ej: descripción de la lámina 'Robo de Galletas')..." />
                </div>
                <div className="text-center">
                    <Button onClick={handleAnalyze} disabled={isLoading || !discourse || !selectedPatientId}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                        Analizar con IA
                    </Button>
                </div>

                <div className="border-t pt-6 space-y-6">
                    <h3 className="text-lg font-semibold text-center">Perfil de Características del Habla</h3>
                    {speechProfileItems.map(item => (
                        <div key={item.id} className="space-y-2">
                            <Label htmlFor={item.id}>{item.label}</Label>
                            <Slider id={item.id} min={1} max={7} step={1} value={[profile[item.id] as number]} onValueChange={(val) => handleSliderChange(item.id, val)} />
                            <div className="flex justify-between text-xs text-muted-foreground px-1">
                                <span>{item.minLabel}</span>
                                <span>{profile[item.id]}</span>
                                <span>{item.maxLabel}</span>
                            </div>
                        </div>
                    ))}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                             <Label htmlFor="ucCount">Nº Unidades de Comunicación (UC)</Label>
                             <Input id="ucCount" type="number" value={profile.ucCount as number} onChange={(e) => handleInputChange('ucCount', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                             <Label htmlFor="icl">Índice de Complejidad Lingüística (ICL)</Label>
                             <Input id="icl" type="number" step="0.01" value={profile.icl as number} onChange={(e) => handleInputChange('icl', e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="interpretation">Resumen Interpretativo (generado por IA)</Label>
                         <Textarea id="interpretation" value={profile.interpretation as string} onChange={(e) => handleInputChange('interpretation', e.target.value)} rows={5} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                 <Button onClick={handleSave} disabled={!selectedPatientId}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar en Ficha del Paciente
                </Button>
            </CardFooter>
        </Card>
    );
}
