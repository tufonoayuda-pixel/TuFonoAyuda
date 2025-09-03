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
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, Wand2, Save, UploadCloud } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { references as initialReferences } from '@/lib/mock-data';
import type { Reference, AnalyzeReferenceDocumentOutput } from '@/lib/types';
import {
    analyzeReferenceDocument,
} from '@/app/api/actions/analyze-reference-document';
import { cn } from '@/lib/utils';


export default function EditReferencePage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [referenceData, setReferenceData] = useState<Partial<Reference> | null>(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedReferencesString = localStorage.getItem('fonoayuda-references');
        const allReferences: Reference[] = storedReferencesString ? JSON.parse(storedReferencesString) : initialReferences;
        const refToEdit = allReferences.find(r => r.id === id);
        if(refToEdit) {
            setReferenceData(refToEdit);
        } else {
            toast({ title: 'Error', description: 'No se encontró la referencia para editar.', variant: 'destructive'});
            router.push('/referencias');
        }
    }
  }, [id, router, toast]);

    const handleFile = (file: File) => {
        if (file && file.type === 'application/pdf') {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                handleInputChange('dataUri', loadEvent.target?.result as string);
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
    if (!referenceData?.dataUri) {
        toast({
            title: 'Error',
            description: 'Por favor, seleccione un archivo PDF.',
            variant: 'destructive',
        });
        return;
    }

    setIsAnalyzing(true);
    try {
        const result = await analyzeReferenceDocument({ documentDataUri: referenceData.dataUri });
        setReferenceData(prev => prev ? ({...prev, ...result}) : null);
        toast({
            title: 'Análisis Completado',
            description: 'La IA ha actualizado la información del documento.',
        });
    } catch (error) {
        console.error('Error analyzing document: ', error);
        toast({
            title: 'Error de Análisis',
            description: 'No se pudo analizar el nuevo documento. Por favor, intente de nuevo.',
            variant: 'destructive',
        });
    } finally {
        setIsAnalyzing(false);
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceData) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const existingReferencesString = localStorage.getItem('fonoayuda-references');
      let existingReferences: Reference[] = existingReferencesString ? JSON.parse(existingReferencesString) : initialReferences;
      
      const updatedReferences = existingReferences.map(ref => ref.id === id ? {...ref, ...referenceData} : ref);
      
      localStorage.setItem('fonoayuda-references', JSON.stringify(updatedReferences));

      toast({
        title: 'Referencia Actualizada',
        description: 'La referencia ha sido actualizada en su base de conocimiento.',
      });
      router.push('/referencias');
    }, 1500);
  };

  const handleInputChange = (field: keyof Reference, value: string | string[]) => {
    setReferenceData(prev => prev ? ({...prev, [field]: value}) : null);
  }

  if (!referenceData) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Referencia</CardTitle>
          <CardDescription>
            Actualice los detalles del documento de referencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="reference-file">Actualizar Archivo (PDF)</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="reference-file"
                        className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 transition-colors", isDragging ? "bg-muted border-primary" : "hover:bg-muted")}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click para subir</span> o
                            arrastre un nuevo archivo
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
                          Nuevo archivo: {fileName}
                        </p>
                        <Button onClick={handleAnalyze} disabled={isAnalyzing || !referenceData.dataUri} type="button">
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
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : <Save className="mr-2 h-4 w-4" />}
                    Guardar Cambios
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
