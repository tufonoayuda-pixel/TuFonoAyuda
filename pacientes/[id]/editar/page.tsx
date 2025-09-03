
'use client';
import { notFound, useParams } from 'next/navigation';
import { EditPatientForm } from './edit-patient-form';
import type { Patient } from '@/lib/types';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function EditPatientPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
        } else {
            setLoading(false);
            notFound();
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !id) return;
    
    const fetchPatient = async () => {
        setLoading(true);
        const patientDocRef = doc(db, `users/${user.uid}/patients`, id);
        const docSnap = await getDoc(patientDocRef);

        if (docSnap.exists()) {
            setPatient({ id: docSnap.id, ...docSnap.data() } as Patient);
        } else {
            notFound();
        }
        setLoading(false);
    }
    fetchPatient();
  }, [id, user]);

  const handleSave = async (updatedPatientData: Omit<Patient, 'id'>) => {
    if (!user || !id) return;
    const patientDocRef = doc(db, `users/${user.uid}/patients`, id);
    try {
        await updateDoc(patientDocRef, updatedPatientData);
        toast({ title: 'Éxito', description: 'Paciente actualizado correctamente.' });
    } catch (error) {
        console.error("Error updating patient:", error);
        toast({ title: 'Error', description: 'No se pudo actualizar el paciente.', variant: 'destructive'});
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!patient) {
      notFound();
      return null;
  }

  return <EditPatientForm patient={patient} onSave={(data) => handleSave(data)} />;
}
