
'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
  } from '@/components/ui/card';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { BookOpenCheck, Edit } from 'lucide-react';
  import { Reference } from '@/lib/types';
  import { useState, useEffect } from 'react';
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from '@/components/ui/dialog';
  import { ScrollArea } from '@/components/ui/scroll-area';
  import Link from 'next/link';
  
  export function ReferenciasClient({ initialReferences }: { initialReferences: Reference[]}) {
    const [references, setReferences] = useState(initialReferences);
    const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedReferences = localStorage.getItem('fonoayuda-references');
            if (storedReferences) {
                setReferences(JSON.parse(storedReferences));
            }
        }
    }, []);
  
    const handleViewDetails = (reference: Reference) => {
      setSelectedReference(reference);
      setIsDetailModalOpen(true);
    };
  
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {references.map((ref) => (
                <Card key={ref.id} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">{ref.title}</CardTitle>
                        <CardDescription>{ref.authors} ({ref.year})</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Fuente:</h4>
                            <p className="text-sm text-muted-foreground">{ref.source}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Resumen:</h4>
                            <p className="text-sm text-muted-foreground line-clamp-3">{ref.summary}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 text-sm">Áreas Terapéuticas:</h4>
                            <div className="flex flex-wrap gap-2">
                                {ref.therapeuticAreas.map(area => (
                                    <Badge key={area} variant="secondary">{area}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className='flex-col items-stretch gap-2'>
                        <Badge variant="outline" className='py-1 justify-center'>Nivel de Evidencia: {ref.evidenceLevel}</Badge>
                        <Button className="w-full" onClick={() => handleViewDetails(ref)}>
                            <BookOpenCheck className="mr-2 h-4 w-4" />
                            Ver Detalles
                        </Button>
                    </CardFooter>
                </Card>
                ))}
            </div>

            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-2xl">
                    {selectedReference && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedReference.title}</DialogTitle>
                                <DialogDescription>{selectedReference.authors} ({selectedReference.year})</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh] pr-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-1">Fuente</h4>
                                        <p className="text-sm text-muted-foreground">{selectedReference.source}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Nivel de Evidencia</h4>
                                        <p className="text-sm text-muted-foreground">{selectedReference.evidenceLevel}</p>
                                    </div>
                                     <div>
                                        <h4 className="font-semibold mb-1">Áreas Terapéuticas</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedReference.therapeuticAreas.map(area => (
                                                <Badge key={area} variant="secondary">{area}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">Resumen Completo</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedReference.summary}</p>
                                    </div>
                                </div>
                            </ScrollArea>
                            <DialogFooter className="justify-between">
                                <Button variant="outline" asChild>
                                  <Link href={`/referencias/editar/${selectedReference.id}`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                  </Link>
                                </Button>
                                <Button onClick={() => setIsDetailModalOpen(false)}>Cerrar</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
  }
