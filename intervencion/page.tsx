
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Wand2, File, BookUp, FileText, User, ClipboardCheck, Gem, Lock, KeyRound } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  enhanceInterventionPlan
} from '@/app/api/actions/enhance-intervention-plan';
import { references as initialReferences, patients } from '@/lib/mock-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Reference, EnhanceInterventionPlanOutput } from '@/lib/types';
import { InterventionPlanDisplay } from '@/components/intervencion/intervention-plan-display';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';


export default function InterventionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [planFileName, setPlanFileName] = useState('');
  const [planDataUri, setPlanDataUri] = useState<string | null>(null);

  const [references, setReferences] = useState<Reference[]>(initialReferences);
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  
  const [isDragging, setIsDragging] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<EnhanceInterventionPlanOutput | null>(null);
  const [isLocked, setIsLocked] = useState(true); // Subscription lock
  const [user, setUser] = useState<FirebaseUser | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        const isCreator = currentUser && ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(currentUser.email!);
        setIsLocked(!isCreator);
    });

    const storedReferences = localStorage.getItem('fonoayuda-references');
    if (storedReferences) {
        setReferences(JSON.parse(storedReferences));
    }
    
    return () => unsubscribe();
  }, []);

  const handleFile = (file: File) => {
    if (file && file.type === 'application/pdf') {
      setPlanFileName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setPlanDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        toast({ title: 'Archivo no válido', description: 'Por favor, suba solo archivos PDF.', variant: 'destructive'});
    }
  }

  const handlePlanFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleReferenceToggle = (referenceId: string) => {
    setSelectedReferences(prev => 
      prev.includes(referenceId) 
        ? prev.filter(id => id !== referenceId) 
        : [...prev, referenceId]
    );
  };


  const handleAnalyze = async () => {
    const patient = patients.find(p => p.id === selectedPatientId);

    if (!patient) {
        toast({ title: 'Falta Paciente', description: 'Por favor, seleccione un paciente.', variant: 'destructive'});
        return;
    }
    if (!planDataUri) {
        toast({ title: 'Falta Plan', description: 'Por favor, suba el plan de intervención.', variant: 'destructive'});
        return;
    }
     if (selectedReferences.length === 0) {
        toast({ title: 'Faltan Modelos', description: 'Por favor, seleccione al menos un modelo de intervención de la lista.', variant: 'destructive'});
        return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const modelDocumentsUri = selectedReferences
      .map(refId => references.find(r => r.id === refId)?.dataUri)
      .filter((uri): uri is string => !!uri);

    if (modelDocumentsUri.length !== selectedReferences.length) {
       toast({ title: 'Error de Referencia', description: 'Algunos documentos de referencia no tienen contenido válido. Por favor, vuelva a subirlos.', variant: 'destructive'});
       setIsAnalyzing(false);
       return;
    }

    try {
        const result = await enhanceInterventionPlan({ 
            patientProfile: patient.profile,
            interventionPlanUri: planDataUri,
            modelDocumentsUri: modelDocumentsUri
        });
        setAnalysisResult(result);
        toast({
            title: 'Análisis Completado',
            description: 'La IA ha mejorado el plan de intervención.',
        });
    } catch (error) {
        console.error('Error enhancing plan: ', error);
        toast({
            title: 'Error de Análisis',
            description: 'No se pudo procesar la solicitud. Intente de nuevo.',
            variant: 'destructive',
        });
    } finally {
        setIsAnalyzing(false);
    }
  }

  const handleSaveToHistory = () => {
    if (!analysisResult || !selectedPatientId) return;

    // In a real app, this would be an API call.
    // Here we simulate by storing it in localStorage.
    const key = `intervention_plan_${selectedPatientId}`;
    localStorage.setItem(key, JSON.stringify(analysisResult));

    toast({
      title: 'Plan Guardado',
      description: `El plan de intervención ha sido guardado en la ficha de ${patients.find(p=>p.id === selectedPatientId)?.name}.`,
    });
    router.push(`/pacientes/${selectedPatientId}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Asistente de Intervención IA</h1>
        <p className="text-muted-foreground">
          Suba un plan de intervención y seleccione los modelos teóricos para que la IA lo enriquezca.
        </p>
      </header>

       {isLocked && (
            <Alert className="border-amber-500/50 text-amber-600 dark:text-amber-400 [&>svg]:text-amber-500">
                <Gem className="h-4 w-4" />
                <AlertTitle>Funcionalidad Premium</AlertTitle>
                <AlertDescription>
                   El Asistente de Intervención IA está disponible en el Plan Experto. Esta herramienta le permite usar su propia base de conocimiento para generar planes terapéuticos avanzados.
                    <Button variant="link" asChild className="p-0 h-auto ml-2 text-amber-600 dark:text-amber-400">
                        <Link href="/suscripcion">Mejorar Plan</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}
      
      <Card data-tour-id="intervencion-main-card" className={isLocked ? 'relative overflow-hidden' : ''}>
           {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"><Lock className="h-10 w-10 text-muted-foreground"/></div>}
          <CardHeader>
              <CardTitle className='flex items-center gap-2'><User/> Paciente</CardTitle>
              <CardDescription>Seleccione el paciente para el cual es el plan de intervención.</CardDescription>
          </CardHeader>
          <CardContent>
             <Select required onValueChange={setSelectedPatientId} value={selectedPatientId} disabled={isLocked}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.diagnoses.join(', ')}</SelectItem>)}
                </SelectContent>
            </Select>
          </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={isLocked ? 'relative overflow-hidden' : ''}>
             {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>}
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText /> Plan de Intervención</CardTitle>
                <CardDescription>Suba el plan terapéutico que desea mejorar (PDF).</CardDescription>
            </CardHeader>
             <CardContent>
                <label 
                    htmlFor="plan-file" 
                    className={cn("flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 transition-colors", isDragging ? "bg-muted border-primary" : "hover:bg-muted", isLocked && 'cursor-not-allowed')}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click para subir</span> o arrastre el archivo</p>
                        <p className="text-xs text-muted-foreground">SOLO ARCHIVOS PDF</p>
                    </div>
                    <Input id="plan-file" type="file" accept="application/pdf" className="hidden" onChange={handlePlanFileChange} disabled={isLocked}/>
                </label>
                {planFileName && <p className="text-sm text-muted-foreground mt-2">Archivo seleccionado: {planFileName}</p>}
             </CardContent>
        </Card>
        <Card className={isLocked ? 'relative overflow-hidden' : ''}>
            {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>}
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookUp /> Modelos de Intervención</CardTitle>
                <CardDescription>Seleccione los documentos de su base de conocimiento que la IA usará como referencia.</CardDescription>
            </CardHeader>
             <CardContent>
                <div className='mt-4 space-y-2 max-h-48 overflow-y-auto rounded-md border p-2'>
                    {references.map(doc => (
                        <div key={doc.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary">
                            <Checkbox 
                                id={`ref-${doc.id}`}
                                checked={selectedReferences.includes(doc.id)}
                                onCheckedChange={() => handleReferenceToggle(doc.id)}
                                disabled={isLocked}
                             />
                             <Label htmlFor={`ref-${doc.id}`} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                                <File className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{doc.title} ({doc.year})</span>
                            </Label>
                        </div>
                    ))}
                </div>
             </CardContent>
        </Card>
      </div>

       <div className="text-center">
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !planDataUri || selectedReferences.length === 0 || isLocked} size="lg">
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Mejorar Plan con IA
            </Button>
      </div>
      
       {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>La IA está analizando los documentos y re-diseñando el plan. Esto puede tardar unos momentos...</p>
        </div>
      )}

      {analysisResult && (
         <Card>
            <CardHeader>
                <CardTitle>Plan de Intervención Mejorado</CardTitle>
                <CardDescription>
                    Este es el nuevo plan, enriquecido con la evidencia proporcionada.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <InterventionPlanDisplay analysisResult={analysisResult}/>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSaveToHistory} disabled={!selectedPatientId}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Guardar Resultados en Ficha
                </Button>
            </CardFooter>
         </Card>
      )}

    </div>
  );
}
