
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
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Mic, Ear, MessageSquare, Brain, Smile, BookOpen, GraduationCap, Puzzle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Patient } from '@/lib/types';
import { format } from 'date-fns';
import { onAuthStateChanged, User } from 'firebase/auth';


const icons = [
    { name: 'Mic', component: <Mic className="h-4 w-4" /> },
    { name: 'Ear', component: <Ear className="h-4 w-4" /> },
    { name: 'MessageSquare', component: <MessageSquare className="h-4 w-4" /> },
    { name: 'Brain', component: <Brain className="h-4 w-4" /> },
    { name: 'Smile', component: <Smile className="h-4 w-4" /> },
    { name: 'BookOpen', component: <BookOpen className="h-4 w-4" /> },
    { name: 'GraduationCap', component: <GraduationCap className="h-4 w-4" /> },
    { name: 'Puzzle', component: <Puzzle className="h-4 w-4" /> },
];

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [diagnoses, setDiagnoses] = useState(['']);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleDiagnosesChange = (index: number, value: string) => {
    const newDiagnoses = [...diagnoses];
    newDiagnoses[index] = value;
    setDiagnoses(newDiagnoses);
  }

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, '']);
  }

  const removeDiagnosis = (index: number) => {
    const newDiagnoses = diagnoses.filter((_, i) => i !== index);
    setDiagnoses(newDiagnoses);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: 'Error', description: 'Debe iniciar sesión para crear un paciente.', variant: 'destructive'});
        return;
    }
    
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());

    try {
        const newPatientData: Omit<Patient, 'id'> = {
            name: formValues.name as string,
            age: Number(formValues.age),
            diagnoses: diagnoses.filter(d => d.trim() !== ''),
            avatarUrl: 'https://placehold.co/100x100.png',
            icon: formValues.icon as string,
            lastSession: format(new Date(), 'yyyy-MM-dd'),
            progress: [{ date: new Date().toISOString(), score: 0, notes: 'Paciente nuevo, sesión de evaluación inicial.' }],
            assignedActivities: [],
            contact: {
                email: formValues.email as string,
                phone: formValues.phone as string,
            },
            profile: formValues.profile as string,
            createdAt: serverTimestamp(),
            ownerId: user.uid,
            consent: { status: 'Pendiente' },
        };

        const docRef = await addDoc(collection(db, `users/${user.uid}/patients`), newPatientData);

        toast({
            title: 'Paciente Creado',
            description: `${newPatientData.name} ha sido añadido a su lista de pacientes.`,
        });
        router.push('/pacientes');
    } catch (error) {
        console.error("Error creating patient:", error);
        toast({ title: 'Error', description: 'No se pudo crear el paciente.', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Incorporar Nuevo Paciente</CardTitle>
          <CardDescription>
            Ingrese los detalles del nuevo paciente para añadirlo a su lista.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input id="name" name="name" placeholder="Ej: Maria Ignacia Gonzalez" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rut">RUT</Label>
                        <Input id="rut" name="rut" placeholder="Ej: 12.345.678-9" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Edad</Label>
                        <Input id="age" name="age" type="number" placeholder="Ej: 7" required onChange={(e) => setIsMinor(Number(e.target.value) < 18)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="estado-civil">Estado Civil</Label>
                        <Select name="estado-civil">
                            <SelectTrigger id="estado-civil">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="soltero">Soltero/a</SelectItem>
                                <SelectItem value="casado">Casado/a</SelectItem>
                                <SelectItem value="viudo">Viudo/a</SelectItem>
                                <SelectItem value="divorciado">Divorciado/a</SelectItem>
                                <SelectItem value="conviviente">Conviviente Civil</SelectItem>
                                <SelectItem value="no-aplica">No Aplica</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="profesion">Profesión / Ocupación</Label>
                        <Input id="profesion" name="profesion" placeholder="Ej: Estudiante" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="icon">Ícono</Label>
                        <Select name="icon">
                            <SelectTrigger id="icon">
                                <SelectValue placeholder="Seleccionar ícono" />
                            </SelectTrigger>
                            <SelectContent>
                                {icons.map(icon => (
                                <SelectItem key={icon.name} value={icon.name}>
                                    <div className="flex items-center gap-2">
                                        {icon.component}
                                        {icon.name}
                                    </div>
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {isMinor && (
                        <div className="space-y-2">
                            <Label htmlFor="responsable">Responsable</Label>
                            <Input id="responsable" name="responsable" placeholder="Nombre del apoderado" required />
                        </div>
                    )}
                </div>

                <div className="border-t pt-6 space-y-6">
                    <h3 className="text-lg font-medium">Información de Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email de Contacto</Label>
                            <Input id="email" name="email" type="email" placeholder="ejemplo@email.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono de Contacto</Label>
                            <Input id="phone" name="phone" type="tel" placeholder="+56912345678" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" name="direccion" placeholder="Ej: Av. Siempreviva 742" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="localidad">Localidad</Label>
                            <Input id="localidad" name="localidad" placeholder="Ej: Springfield" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zona">Zona</Label>
                            <Select name="zona">
                                <SelectTrigger id="zona">
                                    <SelectValue placeholder="Seleccionar zona" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="norte">Norte</SelectItem>
                                    <SelectItem value="centro">Centro</SelectItem>
                                    <SelectItem value="sur">Sur</SelectItem>
                                    <SelectItem value="austral">Austral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6 space-y-6">
                    <h3 className="text-lg font-medium">Información Fonoaudiológica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2 md:col-span-2">
                            <Label>Diagnóstico(s) Fonoaudiológico(s)</Label>
                            {diagnoses.map((diag, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input 
                                        value={diag}
                                        onChange={(e) => handleDiagnosesChange(index, e.target.value)}
                                        placeholder={`Diagnóstico ${index + 1}`}
                                        name={`diagnostico-${index}`}
                                        required 
                                    />
                                    {diagnoses.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDiagnosis(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={addDiagnosis} className="mt-2">
                                <Plus className="mr-2 h-4 w-4" />
                                Añadir Diagnóstico
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="therapeutic-area">Área Terapéutica</Label>
                            <Select name="therapeutic-area">
                                <SelectTrigger id="therapeutic-area">
                                    <SelectValue placeholder="Seleccionar área" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lenguaje-infantil">Lenguaje infantil</SelectItem>
                                    <SelectItem value="lenguaje-adulto">Lenguaje adulto</SelectItem>
                                    <SelectItem value="habla-infantil">Habla infantil</SelectItem>
                                    <SelectItem value="habla-adulto">Habla adulto</SelectItem>
                                    <SelectItem value="comunicacion">Comunicación</SelectItem>
                                    <SelectItem value="atencion-temprana">Atención temprana</SelectItem>
                                    <SelectItem value="deglucion-adulto">Deglución adulto</SelectItem>
                                    <SelectItem value="deglucion-infantil">Deglución infantil</SelectItem>
                                    <SelectItem value="voz-adulto">Voz adulto</SelectItem>
                                    <SelectItem value="voz-infantil">Voz infantil</SelectItem>
                                    <SelectItem value="motricidad-orofacial-infantil">Motricidad orofacial infantil</SelectItem>
                                    <SelectItem value="motricidad-orofacial-adulto">Motricidad orofacial adulto</SelectItem>
                                    <SelectItem value="fonoaudiologia-estetica">Fonoaudiología estética</SelectItem>
                                    <SelectItem value="cognicion-adulto">Cognición adulto</SelectItem>
                                    <SelectItem value="cognicion-infantil">Cognición infantil</SelectItem>
                                    <SelectItem value="audiovestibular">Audiovestibular</SelectItem>
                                    <SelectItem value="audiologia-adulto">Audiología adulto</SelectItem>
                                    <SelectItem value="audiologia-infantil">Audiología infantil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="seguro">Seguro de Salud</Label>
                            <Select name="seguro">
                                <SelectTrigger id="seguro">
                                    <SelectValue placeholder="Seleccionar seguro" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fonasa">FONASA</SelectItem>
                                    <SelectItem value="colmena">Isapre Colmena</SelectItem>
                                    <SelectItem value="cruzblanca">Isapre CruzBlanca</SelectItem>
                                    <SelectItem value="consalud">Isapre Consalud</SelectItem>
                                    <SelectItem value="vidatres">Isapre Vida Tres</SelectItem>
                                    <SelectItem value="banmedica">Isapre Banmédica</SelectItem>
                                    <SelectItem value="particular">Particular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="motivo">Motivo de Consulta</Label>
                        <Textarea id="motivo" name="motivo" placeholder="Describa el motivo principal de la consulta."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="intereses">Intereses del Paciente</Label>
                        <Textarea id="intereses" name="intereses" placeholder="Describa los intereses, hobbies y gustos del paciente."/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="profile">Perfil del Paciente</Label>
                        <Textarea id="profile" name="profile" placeholder="Describa brevemente al paciente, su contexto y sus necesidades generales."/>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <Button variant="ghost" type="button" onClick={() => router.back()} className="w-full sm:w-auto">Cancelar</Button>
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Paciente
                    </Button>
                </div>
            </CardContent>
        </form>
      </Card>
    </div>
  );
}
