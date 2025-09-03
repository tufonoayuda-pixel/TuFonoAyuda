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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Wand2, FileSignature, CheckCircle, UserCheck, Lightbulb, Share2, ClipboardCheck, Info, KeyRound } from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { patients } from '@/lib/mock-data';
import type { AnalyzeEvaluationReportOutput } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function UploadEvaluationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeEvaluationReportOutput | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);


  const handleFile = (file: File) => {
    if (file && file.type === 'application/pdf') {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setFileDataUri(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        toast({
            title: 'Archivo no válido',
            description: 'Por favor, suba solo archivos PDF.',
            variant: 'destructive',
        });
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAnalyze = async () => {
    if (!fileDataUri || !selectedPatientId) {
        toast({
            title: 'Faltan datos',
            description: 'Por favor, seleccione un paciente y un archivo PDF.',
            variant: 'destructive',
        });
        return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
        const response = await fetch('/api/analyze-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentDataUri: fileDataUri }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ocurrió un error en el servidor');
        }
        
        const result = await response.json();
        setAnalysisResult(result);
        toast({
            title: 'Análisis Completado',
            description: 'La IA ha procesado el informe de evaluación.',
        });
    } catch (error: any) {
        console.error('Error analyzing report: ', error);
        toast({
            title: 'Error de Análisis',
            description: `No se pudo analizar el informe: ${error.message}`,
            variant: 'destructive',
        });
    } finally {
        setIsAnalyzing(false);
    }
  }

  const handleSaveResults = () => {
    // In a real app, this would save the results to the patient's record.
    toast({
        title: 'Resultados Guardados',
        description: `El análisis del informe ha sido guardado para ${patients.find(p=>p.id === selectedPatientId)?.name}.`,
    });
    router.push(`/pacientes/${selectedPatientId}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analizar Informe de Evaluación</CardTitle>
          <CardDescription>
            Suba el informe de evaluación de un paciente en formato PDF. La IA lo analizará para extraer fortalezas, debilidades y sugerencias.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        
        <div className="space-y-2">
            <Label htmlFor="patient">Paciente</Label>
            <Select required onValueChange={setSelectedPatientId} value={selectedPatientId}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                    {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="evaluation-file">Informe de Evaluación (PDF)</Label>
          <div className="flex items-center justify-center w-full">
              <label htmlFor="evaluation-file" 
                className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 transition-colors", isDragging ? "bg-muted border-primary" : "hover:bg-muted")}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click para subir</span> o arrastre el archivo</p>
                      <p className="text-xs text-muted-foreground">SOLO ARCHIVOS PDF</p>
                  </div>
                  <Input id="evaluation-file" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
              </label>
          </div>
          {fileName && <p className='text-sm text-muted-foreground mt-2'>Archivo seleccionado: {fileName}</p>}
        </div>
       
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={() => router.back()}>Volver</Button>
            <Button onClick={handleAnalyze} disabled={isAnalyzing || !fileName || !selectedPatientId}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Analizar con IA
            </Button>
        </CardFooter>
      </Card>

      {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>La IA está leyendo y analizando el informe. Esto puede tardar un momento...</p>
        </div>
      )}

      {analysisResult && (
        <Card>
            <CardHeader>
                <CardTitle>Resultados del Análisis</CardTitle>
                <CardDescription>Resumen generado por IA para ${'${patients.find(p => p.id === selectedPatientId)?.name}'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                           <FileSignature className="h-5 w-5" /> Diagnóstico Fonoaudiológico
                        </CardTitle>
                         <CardDescription className="pt-1 font-semibold text-base text-foreground">${'${Array.isArray(analysisResult.diagnoses) ? analysisResult.diagnoses.join(", ") : analysisResult.diagnoses}'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-medium mb-2 flex items-center gap-2"><Info className="h-4 w-4" />Justificación Diagnóstica</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">${'${analysisResult.diagnosticJustification}'}</p>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" />Fortalezas</h3>
                    ${'${analysisResult.strengths.map((item, index) => (`<Card key=${`strength-${index}`} className="bg-green-500/5 border-green-500/20"><CardHeader className="p-4"><Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">${item.topic}</Badge></CardHeader><CardContent className="p-4 pt-0"><p className="text-sm whitespace-pre-wrap">${item.description}</p></CardContent></Card>`)).join("")}'}
                </div>

                 <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2"><UserCheck className="h-5 w-5 text-destructive" />Debilidades</h3>
                    ${'${analysisResult.weaknesses.map((item, index) => (`<Card key=${`weakness-${index}`} className="bg-red-500/5 border-red-500/20"><CardHeader className="p-4"><Badge variant="destructive" className="bg-red-100 text-red-800 w-fit">${item.topic}</Badge></CardHeader><CardContent className="p-4 pt-0"><p className="text-sm whitespace-pre-wrap">${item.description}</p></CardContent></Card>`)).join("")}'}
                </div>
                
                <Alert>
                     <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Sugerencias y Recomendaciones</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">${'${analysisResult.suggestions}'}</AlertDescription>
                </Alert>
                
                ${'${analysisResult.referralRequired && `<Alert><Share2 className="h-4 w-4" /><AlertTitle>Derivación Sugerida</AlertTitle><AlertDescription className="whitespace-pre-wrap">${analysisResult.referralSuggestion}</AlertDescription></Alert>`}'}
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSaveResults}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Guardar Resultados en Ficha
                </Button>
            </CardFooter>
        </Card>
      )}

    </div>
  );
}
