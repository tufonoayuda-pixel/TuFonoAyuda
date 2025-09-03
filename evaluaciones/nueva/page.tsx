
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  analyzeReferenceDocument,
  AnalyzeReferenceDocumentOutput,
} from '@/ai/flows/analyze-reference-document';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// We can reuse the Reference document analysis output for this, as the fields are similar.
type EvaluationToolData = Partial<AnalyzeReferenceDocumentOutput> & { type?: 'Estandarizada' | 'No Estandarizada', area?: string };

export default function NewEvaluationToolPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [toolData, setToolData] = useState<EvaluationToolData | null>(null);
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
        toast({ title: 'Archivo no válido', description: 'Por favor, suba solo archivos PDF.', variant: 'destructive'});
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
    if (!fileDataUri) {
        toast({
            title: 'Error',
            description: 'Por favor, seleccione un archivo PDF.',
            variant: 'destructive',
        });
        return;
    }

    setIsAnalyzing(true);
    setToolData(null);

    try {
        const result = await analyzeReferenceDocument({ documentDataUri: fileDataUri });
        setToolData({
            title: result.title,
            summary: result.summary,
            area: result.therapeuticAreas.join(', ')
        });
        toast({
            title: 'Análisis Completado',
            description: 'La IA ha extraído la información del documento.',
        });
    } catch (error) {
        console.error('Error analyzing document: ', error);
        toast({
            title: 'Error de Análisis',
            description: 'No se pudo analizar el documento. Por favor, intente de nuevo o rellene los campos manualmente.',
            variant: 'destructive',
        });
    } finally {
        setIsAnalyzing(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Herramienta Guardada',
        description: 'La nueva herramienta de evaluación ha sido añadida a su base de conocimiento.',
      });
      router.push('/evaluaciones');
    }, 1500);
  };

  const handleInputChange = (field: keyof EvaluationToolData, value: string) => {
    setToolData(prev => ({...prev, [field]: value}));
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Herramienta</CardTitle>
          <CardDescription>
            Suba el manual de una herramienta de evaluación (PDF). La IA lo analizará para rellenar los campos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tool-file">Archivo (PDF)</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="tool-file"
                className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 transition-colors", isDragging ? "bg-muted border-primary" : "hover:bg-muted")}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click para subir</span> o
                    arrastre el archivo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SOLO ARCHIVOS PDF
                  </p>
                </div>
                <Input
                  id="tool-file"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {fileName && (
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {fileName}
                </p>
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !fileDataUri}>
                  {isAnalyzing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Analizar con IA
                </Button>
              </div>
            )}
          </div>
          
           <form onSubmit={handleSubmit} className="border-t pt-6 space-y-4">
             {isAnalyzing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Analizando documento, por favor espere...</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tool-name">Nombre de la Herramienta</Label>
                    <Input id="tool-name" value={toolData?.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} placeholder="Ej: Test para la Comprensión Auditiva del Lenguaje (TECAL)" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tool-type">Tipo de Herramienta</Label>
                    <Select required onValueChange={(value) => setToolData(prev => ({...prev, type: value as any}))} value={toolData?.type}>
                        <SelectTrigger id="tool-type">
                            <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Estandarizada">Estandarizada</SelectItem>
                            <SelectItem value="No Estandarizada">No Estandarizada</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="tool-area">Área de Evaluación</Label>
                <Input id="tool-area" value={toolData?.area || ''} onChange={(e) => handleInputChange('area', e.target.value)} placeholder="Ej: Lenguaje Comprensivo, Habla, Voz" required />
            </div>

             <div className="space-y-2">
                <Label htmlFor="tool-description">Descripción</Label>
                <Textarea id="tool-description" value={toolData?.summary || ''} onChange={(e) => handleInputChange('summary', e.target.value)} placeholder="Describa brevemente la herramienta, su propósito y a quién está dirigida." required rows={5}/>
            </div>
           
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
                 <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar Herramienta
                </Button>
            </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
