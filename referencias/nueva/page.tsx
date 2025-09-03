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
import { Loader2, UploadCloud, FileText, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  analyzeReferenceDocument,
} from '@/app/api/actions/analyze-reference-document';
import { references as initialReferences } from '@/lib/mock-data';
import type { Reference, AnalyzeReferenceDocumentOutput } from '@/lib/types';


export default function NewReferencePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [referenceData, setReferenceData] =
    useState<Partial<AnalyzeReferenceDocumentOutput> | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        setFileDataUri(loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
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
    setReferenceData(null);

    try {
        const result = await analyzeReferenceDocument({ documentDataUri: fileDataUri });
        setReferenceData(result);
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

      const existingReferencesString = localStorage.getItem('fonoayuda-references');
      const existingReferences: Reference[] = existingReferencesString ? JSON.parse(existingReferencesString) : initialReferences;
      
      const newReference: Reference = {
          id: `ref${Date.now()}`,
          title: referenceData?.title || 'Sin Título',
          authors: referenceData?.authors || 'Anónimo',
          year: referenceData?.year || new Date().getFullYear().toString(),
          source: referenceData?.source || 'Desconocido',
          evidenceLevel: referenceData?.evidenceLevel || 'N/A',
          therapeuticAreas: Array.isArray(referenceData?.therapeuticAreas) ? referenceData.therapeuticAreas : [],
          summary: referenceData?.summary || 'Sin resumen.',
          dataUri: fileDataUri || '',
      };

      const updatedReferences = [newReference, ...existingReferences];
      localStorage.setItem('fonoayuda-references', JSON.stringify(updatedReferences));

      toast({
        title: 'Referencia Guardada',
        description: 'La nueva referencia ha sido añadida a su base de conocimiento.',
      });
      router.push('/referencias');
    }, 1500);
  };

  const handleInputChange = (field: keyof AnalyzeReferenceDocumentOutput, value: string | string[]) => {
    setReferenceData(prev => ({...prev, [field]: value}));
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Referencia</CardTitle>
          <CardDescription>
            Suba un artículo o libro en formato PDF. La IA analizará el
            documento para rellenar los campos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reference-file">Archivo (PDF)</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="reference-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted"
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
                  id="reference-file"
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
          
          {(isAnalyzing || referenceData) && (
            <form onSubmit={handleSubmit} className="border-t pt-6 space-y-4">
                 {isAnalyzing && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p>Analizando documento, por favor espere...</p>
                    </div>
                )}
                {referenceData && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título</Label>
                                <Input id="title" value={referenceData.title || ''} onChange={(e) => handleInputChange('title', e.target.value)} required/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="authors">Autores</Label>
                                <Input id="authors" value={referenceData.authors || ''} onChange={(e) => handleInputChange('authors', e.target.value)} placeholder="Ej: Autor 1, Autor 2" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="year">Año</Label>
                                <Input id="year" type="number" value={referenceData.year || ''} onChange={(e) => handleInputChange('year', e.target.value)} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="source">Revista/Editorial</Label>
                                <Input id="source" value={referenceData.source || ''} onChange={(e) => handleInputChange('source', e.target.value)} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="evidenceLevel">Nivel de Evidencia</Label>
                                <Input id="evidenceLevel" value={referenceData.evidenceLevel || ''} onChange={(e) => handleInputChange('evidenceLevel', e.target.value)} placeholder="Ej: 1a, IIb, etc." />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="therapeuticAreas">Áreas Terapéuticas</Label>
                                <Input id="therapeuticAreas" value={Array.isArray(referenceData.therapeuticAreas) ? referenceData.therapeuticAreas.join(', ') : ''} onChange={(e) => handleInputChange('therapeuticAreas', e.target.value.split(',').map(s => s.trim()))} placeholder="Separadas por coma. Ej: Articulación, Lenguaje" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="summary">Resumen</Label>
                            <Textarea id="summary" value={referenceData.summary || ''} onChange={(e) => handleInputChange('summary', e.target.value)} rows={6} />
                        </div>

                         <div className="flex justify-end gap-2 pt-4">
                            <Button
                            variant="ghost"
                            type="button"
                            onClick={() => router.back()}
                            >
                            Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Guardar Referencia
                            </Button>
                        </div>
                    </>
                )}
            </form>
          )}


        </CardContent>
      </Card>
    </div>
  );
}
