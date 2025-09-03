
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Mic, Ear, MessageSquare, Brain, Smile, BookOpen, GraduationCap, Puzzle } from 'lucide-react';
import { useState } from 'react';
import type { Patient } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export function EditPatientForm({ patient, onSave }: { patient: Patient, onSave: (updatedPatient: Omit<Patient, 'id'>) => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Patient, 'id'>>(patient);
  const [diagnoses, setDiagnoses] = useState(patient.diagnoses || ['']);
  
  const handleDiagnosesChange = (index: number, value: string) => {
    const newDiagnoses = [...diagnoses];
    newDiagnoses[index] = value;
    setDiagnoses(newDiagnoses);
    setFormData(prev => ({...prev, diagnoses: newDiagnoses}));
  }

  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, '']);
  }

  const removeDiagnosis = (index: number) => {
    const newDiagnoses = diagnoses.filter((_, i) => i !== index);
    setDiagnoses(newDiagnoses);
    setFormData(prev => ({...prev, diagnoses: newDiagnoses}));
  }

  const handleInputChange = (field: keyof Omit<Patient, 'id'> | keyof Patient['contact'], value: string) => {
    if (['email', 'phone'].includes(field)) {
      setFormData(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field as keyof Omit<Patient, 'id'>]: value
      }));
    }
  }
  
  const handleAgeChange = (value: string) => {
    const age = Number(value);
    setFormData(prev => ({ ...prev, age }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        setIsLoading(false);
        onSave(formData);
        toast({
            title: 'Paciente Actualizado',
            description: 'Los datos del paciente han sido actualizados.',
        });
        router.push(`/pacientes/${patient.id}`);
    }, 1500)
  };

  const isMinor = formData.age < 18;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Paciente</CardTitle>
          <CardDescription>
            Actualice los detalles de {patient.name}.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
             <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rut">RUT</Label>
                        <Input id="rut" placeholder="Ej: 12.345.678-9" defaultValue="12.345.678-9" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Edad</Label>
                        <Input id="age" type="number" value={formData.age} onChange={(e) => handleAgeChange(e.target.value)} required/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="estado-civil">Estado Civil</Label>
                        <Select defaultValue="soltero">
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
                        <Input id="profesion" placeholder="Ej: Estudiante" defaultValue="Estudiante"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="icon">Ícono</Label>
                        <Select value={formData.icon} onValueChange={(value) => handleInputChange('icon', value)}>
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
                            <Input id="responsable" placeholder="Nombre del apoderado" defaultValue="Apoderado Ejemplo" required />
                        </div>
                    )}
                </div>

                <div className="border-t pt-6 space-y-6">
                    <h3 className="text-lg font-medium">Información de Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email de Contacto</Label>
                            <Input id="email" type="email" value={formData.contact.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono de Contacto</Label>
                            <Input id="phone" type="tel" value={formData.contact.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Input id="direccion" placeholder="Ej: Av. Siempreviva 742" defaultValue="Av. Siempreviva 742"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="localidad">Localidad</Label>
                            <Input id="localidad" placeholder="Ej: Springfield" defaultValue="Springfield" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zona">Zona</Label>
                            <Select defaultValue="centro">
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
                                        required 
                                    />
                                    {diagnoses.length > 1 ? (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDiagnosis(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            ))}
                             <Button type="button" variant="outline" size="sm" onClick={addDiagnosis} className="mt-2">
                                <Plus className="mr-2 h-4 w-4" />
                                Añadir Diagnóstico
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="therapeutic-area">Área Terapéutica</Label>
                            <Select defaultValue="lenguaje-infantil">
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
                            <Select defaultValue="fonasa">
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
                        <Textarea id="motivo" placeholder="Describa el motivo principal de la consulta." defaultValue="El paciente fue referido por dificultades en la pronunciación."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="intereses">Intereses del Paciente</Label>
                        <Textarea id="intereses" placeholder="Describa los intereses, hobbies y gustos del paciente." defaultValue="Le gustan los dinosaurios y los autos."/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="profile">Perfil del Paciente (Para la IA)</Label>
                        <Textarea id="profile" value={formData.profile} onChange={(e) => handleInputChange('profile', e.target.value)} />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                    <Button variant="ghost" type="button" onClick={() => router.back()} className="w-full sm:w-auto">Cancelar</Button>
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>
            </CardContent>
        </form>
      </Card>
    </div>
  );
}
