
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface Photo {
  id: string;
  url: string;
  area: string;
  description: string;
  date: string;
}

const initialPhotos: Photo[] = [
  { id: 'p1', url: 'https://placehold.co/600x400.png', area: 'Motricidad Orofacial', description: 'Medidas faciales iniciales.', date: '2024-05-10', },
  { id: 'p2', url: 'https://placehold.co/600x400.png', area: 'Voz', description: 'Imagen de FEES - Cierre glótico.', date: '2024-04-22' },
  { id: 'p3', url: 'https://placehold.co/600x400.png', area: 'Audiología', description: 'Otoscopia oído derecho.', date: '2024-03-15' },
];

const therapeuticAreas = [
    'Motricidad Orofacial',
    'Voz',
    'Deglución',
    'Audiología',
    'General',
];

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPhotoData, setNewPhotoData] = useState({ url: '', area: '', description: '' });
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewPhotoData(prev => ({...prev, url: e.target?.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    setTimeout(() => {
        const newPhoto: Photo = {
            id: `p${photos.length + 1}`,
            url: newPhotoData.url,
            area: newPhotoData.area,
            description: newPhotoData.description,
            date: format(new Date(), 'yyyy-MM-dd'),
        };
        setPhotos(prev => [newPhoto, ...prev]);
        setIsUploading(false);
        setIsDialogOpen(false);
        setNewPhotoData({ url: '', area: '', description: '' });
        setFileName('');
        toast({
            title: 'Fotografía Guardada',
            description: 'La nueva imagen ha sido añadida a la galería del paciente.'
        });
    }, 1500);
  }

  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Galería de Fotografías</CardTitle>
                <CardDescription>Registro visual de la evolución del paciente.</CardDescription>
            </div>
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4" />Añadir Fotografía</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Subir Nueva Fotografía</DialogTitle>
                        <DialogDescription>Seleccione una imagen y proporcione los detalles.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpload}>
                        <div className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="photo-file">Archivo de Imagen</Label>
                                <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="photo-file"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-muted"
                                >
                                    {newPhotoData.url ? (
                                        <Image src={newPhotoData.url} alt="Previsualización" width={100} height={100} className="h-full w-auto object-contain p-2"/>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Click para subir</p>
                                        </div>
                                    )}
                                    <Input id="photo-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} required/>
                                </label>
                                </div>
                                {fileName && <p className="text-xs text-muted-foreground mt-1">Archivo: {fileName}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">Área Terapéutica</Label>
                                <Select required onValueChange={(value) => setNewPhotoData(prev => ({...prev, area: value}))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar área" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {therapeuticAreas.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" placeholder="Breve descripción de la imagen..." required value={newPhotoData.description} onChange={(e) => setNewPhotoData(prev => ({...prev, description: e.target.value}))}/>
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isUploading}>
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Plus className="mr-2 h-4 w-4"/>}
                                Guardar Fotografía
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
            {photos.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {photos.map(photo => (
                        <Card key={photo.id}>
                            <CardContent className="p-0">
                                <Image 
                                    src={photo.url} 
                                    alt={photo.description} 
                                    width={300} 
                                    height={200} 
                                    className="w-full h-40 object-cover rounded-t-lg"
                                    data-ai-hint="patient photo"
                                />
                            </CardContent>
                            <CardFooter className="flex flex-col items-start p-3">
                                <Badge variant="secondary">{photo.area}</Badge>
                                <p className="text-sm mt-2">{photo.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">{format(new Date(photo.date), 'dd MMM, yyyy')}</p>
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No hay fotografías en la galería.</p>
                    <p className="text-sm">Haga clic en "Añadir Fotografía" para empezar.</p>
                </div>
            )}
        </CardContent>
    </Card>
  )
}
