
'use client';

import { useRouter, useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Patient, ProgressEntry } from '@/lib/types';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

export function PatientHistoryForm() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [newEntry, setNewEntry] = useState<Omit<ProgressEntry, 'date'>>({ score: 50, notes: ''});
  const [user, setUser] = useState<User | null>(null);

  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if(currentUser) {
            setUser(currentUser);
            fetchPatient(currentUser.uid, patientId);
        } else {
            router.push('/login');
        }
    });
    return () => unsubscribe();
  }, [patientId, router]);
  
  const fetchPatient = async (uid: string, pid: string) => {
    const docRef = doc(db, `users/${uid}/patients`, pid);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        setPatient({ id: docSnap.id, ...docSnap.data() } as Patient);
    } else {
        notFound();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !user) return;
    setIsLoading(true);

    try {
        const newProgressEntry = { ...newEntry, date: new Date().toISOString() };
        const patientDocRef = doc(db, `users/${user.uid}/patients`, patient.id);
        
        await updateDoc(patientDocRef, {
            progress: arrayUnion(newProgressEntry)
        });

        // Optimistically update local state
        setPatient(prev => prev ? ({...prev, progress: [...prev.progress, newProgressEntry]}) : null);

        toast({
            title: 'Registro Guardado',
            description: 'El nuevo registro de historial ha sido añadido.',
        });
        setNewEntry({ score: 50, notes: '' });

    } catch (error) {
        console.error("Error adding history entry:", error);
        toast({ title: 'Error', description: 'No se pudo guardar el registro.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  const getUTCDate = (dateString: string) => {
    return toZonedTime(new Date(dateString), 'UTC');
  }

  if (!patient) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar Registro de Historial</CardTitle>
          <CardDescription>
            Añada una nueva entrada al historial de progreso para {patient.name}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="score">Puntaje de Progreso (%)</Label>
                    <Input 
                        id="score" 
                        type="number" 
                        value={newEntry.score}
                        onChange={(e) => setNewEntry({...newEntry, score: parseInt(e.target.value)})}
                        min="0" max="100"
                        required 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="notes">Notas de la Sesión</Label>
                    <Textarea 
                        id="notes" 
                        placeholder="Describa los avances, dificultades y observaciones de la sesión..." 
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                        required
                        rows={5}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                 <Button variant="ghost" type="button" onClick={() => router.back()}>Volver</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Registro
                </Button>
            </CardFooter>
        </form>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Historial de Progreso</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  {patient.progress.slice().reverse().map((entry, index) => (
                      <div key={`${entry.date}-${index}`} className="border-l-2 pl-4">
                          <p className="font-semibold">{format(getUTCDate(entry.date), 'dd MMMM, yyyy', { locale: es })}</p>
                          <p className="text-sm text-muted-foreground">Puntaje: {entry.score}%</p>
                          <p className="mt-1 whitespace-pre-wrap">{entry.notes}</p>
                      </div>
                  ))}
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
