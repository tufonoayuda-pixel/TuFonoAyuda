
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, UploadCloud, FileText, Download, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { cn } from '@/lib/utils';
import type { Document } from '@/lib/types';


const initialDocuments: Document[] = [
  { id: 'd1', name: 'informe_audiologico.pdf', type: 'Informe Médico', description: 'Audiometría y resultados de impedanciometría.', date: '2024-04-18', fileUrl: '#', securePath: 'users/user_cristobal/patients/p1/informe_audiologico.pdf' },
  { id: 'd2', name: 'derivacion_neurologo.pdf', type: 'Derivación', description: 'Derivación a neurólogo para evaluación de TDAH.', date: '2024-03-05', fileUrl: '#', securePath: 'users/user_cristobal/patients/p1/derivacion_neurologo.pdf'},
  { id: 'd3', name: 'receta_amoxicilina.jpg', type: 'Receta Médica', description: 'Receta por otitis media aguda.', date: '2024-04-15', fileUrl: '#', securePath: 'users/user_cristobal/patients/p1/receta_amoxicilina.jpg' },
];

const documentTypes = [
    'Receta Médica',
    'Informe Médico',
    'Derivación',
    'Examen de Laboratorio',
    'Consentimiento Informado',
    'Otro',
];

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDocumentData, setNewDocumentData] = useState({ type: '', description: '' });
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file) {
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        toast({ title: 'Archivo no válido', description: 'Por favor, suba solo archivos PDF, JPG o PNG.', variant: 'destructive'});
        return;
      }
      setFileName(file.name);
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

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
        const uniqueUserId = "user_cristobal"; // In a real app, this would come from the auth session
        const newDocument: Document = {
            id: `d${documents.length + 1}`,
            name: fileName,
            type: newDocumentData.type,
            description: newDocumentData.description,
            date: format(new Date(), 'yyyy-MM-dd'),
            fileUrl: '#', // Placeholder URL
            securePath: `users/${uniqueUserId}/patients/patient_id/${fileName}`
        };
        setDocuments(prev => [newDocument, ...prev]);
        setIsUploading(false);
        setIsDialogOpen(false);
        setNewDocumentData({ type: '', description: '' });
        setFileName('');
        toast({
            title: 'Documento Guardado',
            description: 'El nuevo documento ha sido añadido al historial del paciente.'
        });
    }, 1500);
  }

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Gestor de Documentos</CardTitle>
                <CardDescription>Recetas, informes y derivaciones del paciente.</CardDescription>
            </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Añadir Documento</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subir Nuevo Documento</DialogTitle>
                        <DialogDescription>Seleccione un archivo y proporcione los detalles.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload}>
                        <div className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="doc-file">Archivo (PDF, JPG, PNG)</Label>
                                <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="doc-file"
                                    className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 transition-colors", isDragging ? "bg-muted border-primary" : "hover:bg-muted")}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">{fileName || 'Click o arrastre para subir'}</p>
                                    </div>
                                    <Input id="doc-file" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} required/>
                                </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo de Documento</Label>
                                <Select required onValueChange={(value) => setNewDocumentData(prev => ({...prev, type: value}))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {documentTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" placeholder="Breve descripción del documento..." required value={newDocumentData.description} onChange={(e) => setNewDocumentData(prev => ({...prev, description: e.target.value}))}/>
                            </div>
                              <Alert variant="default" className="bg-blue-500/5 border-blue-500/20">
                                <ShieldCheck className="h-4 w-4 !text-blue-500" />
                                <AlertTitle className="text-blue-700">Nota de Privacidad</AlertTitle>
                                <AlertDescription className="text-blue-600">
                                Los archivos se guardan en una ruta segura y única para cada profesional, garantizando la privacidad de los datos.
                                </AlertDescription>
                            </Alert>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isUploading}>
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4"/>}
                                Guardar Documento
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            {documents.length > 0 ? (
                 <div className="space-y-3">
                    {documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
                            <div className='flex items-center gap-3'>
                                <FileText className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="font-semibold">{doc.name}</p>
                                    <p className="text-sm text-muted-foreground">{doc.type} - {format(new Date(doc.date), 'dd MMM, yyyy', { locale: es })}</p>
                                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                                    {doc.securePath && (
                                        <p className="text-xs text-blue-500 mt-1 font-mono">Ruta Segura: {doc.securePath}</p>
                                    )}
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <a href={doc.fileUrl} download={doc.name}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Ver
                                </a>
                            </Button>
                        </div>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No hay documentos guardados.</p>
                    <p className="text-sm">Haga clic en "Añadir Documento" para empezar.</p>
                </div>
            )}
        </CardContent>
    </Card>
  )
}
