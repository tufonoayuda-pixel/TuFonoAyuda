
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import type { Patient } from '@/lib/types';
import { format, differenceInYears, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

export default function GenerateReferralPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [referralDate, setReferralDate] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // This effect runs only on the client
    setReferralDate(format(new Date(), 'yyyy-MM-dd'));

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            const patientsQuery = query(collection(db, `users/${currentUser.uid}/patients`));
            const unsubscribePatients = onSnapshot(patientsQuery, (snapshot) => {
                const patientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
                setPatients(patientsData);
            });
            return () => unsubscribePatients();
        } else {
            setPatients([]);
        }
    });

    return () => unsubscribeAuth();
  }, []);


  const [formData, setFormData] = useState({
      rut: '',
      birthDate: '',
      age: '',
      address: '',
      phone: '',
      reason: '',
      referralTo: ''
  });

  useEffect(() => {
    const patient = patients.find(p => p.id === selectedPatientId);
    if(patient){
        const birthDate = parseISO('2017-01-01'); // Using a static birthdate for consistent age calculation
        const age = differenceInYears(new Date(), birthDate);
        setSelectedPatient(patient);
        setFormData({
            rut: '25.123.456-7', // mock data
            birthDate: format(birthDate, 'dd/MM/yyyy'),
            age: `${age} años`,
            address: 'Av. Siempreviva 742', // mock data
            phone: patient.contact.phone,
            reason: patient.diagnoses.join(', '),
            referralTo: ''
        });
    } else {
        setSelectedPatient(null);
        // Reset form
        setFormData({ rut: '', birthDate: '', age: '', address: '', phone: '', reason: '', referralTo: ''});
    }
  }, [selectedPatientId, patients]);


  const generatePDF = () => {
    if (!selectedPatient || !user) return;

    const doc = new jsPDF();
    const professionalName = user.displayName || "Cristóbal San Martín Zamorano";
    const professionalRUT = "20.165.794-6";
    const healthRegistry = "N°826561";

    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add logo if available and enabled
    const showLogoInReports = JSON.parse(localStorage.getItem('showLogoInReports') || 'true');
    const logoDataUri = localStorage.getItem('professionalLogo');
    if (showLogoInReports && logoDataUri) {
        try {
            const img = new Image();
            img.src = logoDataUri;
            const logoWidth = 30; 
            const logoHeight = 15;
            doc.addImage(img, 'PNG', pageWidth - margin - logoWidth, 8, logoWidth, logoHeight);
        } catch(e) {
            console.error("Error adding logo to PDF:", e);
        }
    }


    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Ficha de Derivación', pageWidth / 2.5, 20, { align: 'center' });
    
    // Date box
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.rect(pageWidth - margin - 42, 25, 42, 7);
    doc.line(pageWidth - margin - 27, 25, pageWidth - margin - 27, 32);
    doc.text('Fecha', pageWidth - margin - 40, 29.5);
    doc.text(format(new Date(referralDate), 'dd/MM/yyyy'), pageWidth - margin - 25, 29.5);

    
    const patientTableY = 40;
    const col1X = margin;
    const col2X = 50;
    const col3X = 105;
    const col4X = 125;
    const rowHeight = 7;
    const tableWidth = pageWidth - margin * 2;
    
    doc.setFont('helvetica', 'bold');
    
    // Line 1
    let y = patientTableY;
    doc.rect(col1X, y, tableWidth, rowHeight);
    doc.line(col2X, y, col2X, y + rowHeight);
    doc.line(col3X, y, col3X, y + rowHeight);
    doc.line(col4X, y, col4X, y + rowHeight);
    doc.text('Nombre', col1X + 2, y + 5);
    doc.text('RUT', col3X + 2, y + 5);

    // Line 2
    y += rowHeight;
    doc.rect(col1X, y, tableWidth, rowHeight);
    doc.line(col2X, y, col2X, y + rowHeight);
    doc.line(col3X, y, col3X, y + rowHeight);
    doc.line(col4X, y, col4X, y + rowHeight);
    doc.text('Fecha de', col1X + 2, y + 3.5);
    doc.text('Nacimiento', col1X + 2, y + 6.5);
    doc.text('Edad', col3X + 2, y + 5);

    // Line 3
    y += rowHeight;
    doc.rect(col1X, y, tableWidth, rowHeight);
    doc.line(col2X, y, col2X, y + rowHeight);
    doc.line(col3X, y, col3X, y + rowHeight);
    doc.line(col4X, y, col4X, y + rowHeight);
    doc.text('Domicilio', col1X + 2, y + 5);
    doc.text('Teléfono', col3X + 2, y + 5);
    
    // Line 4
    y += rowHeight;
    const motivoRowHeight = 20;
    doc.rect(col1X, y, tableWidth, motivoRowHeight);
    doc.line(col2X, y, col2X, y + motivoRowHeight);
    doc.text('Motivo de', col1X + 2, y + 5);
    doc.text('Consulta', col1X + 2, y + 9);

    doc.setFont('helvetica', 'normal');
    // Fill data
    y = patientTableY;
    doc.text(selectedPatient.name, col2X + 2, y + 5);
    doc.text(formData.rut, col4X + 2, y + 5);
    y += rowHeight;
    doc.text(formData.birthDate, col2X + 2, y + 5);
    doc.text(formData.age, col4X + 2, y + 5);
    y += rowHeight;
    doc.text(formData.address, col2X + 2, y + 5);
    doc.text(formData.phone, col4X + 2, y + 5);
    y += rowHeight;
    const motivoLines = doc.splitTextToSize(formData.reason, col3X - col2X - 4);
    doc.text(motivoLines, col2X + 2, y + 5);

    // Referral Box
    y += motivoRowHeight + 5;
    const referralBoxHeight = 50;
    doc.rect(margin, y, tableWidth, referralBoxHeight);
    doc.line(col2X, y, col2X, y + referralBoxHeight);
    doc.setFont('helvetica', 'bold');
    doc.text('Derivación a', margin + 2, y + 5);
    doc.setFont('helvetica', 'normal');
    const referralTextLines = doc.splitTextToSize(formData.referralTo, tableWidth - (col2X - margin) - 4);
    doc.text(referralTextLines, col2X + 2, y + 5);

    // Signature Block
    const signatureY = y + referralBoxHeight + 20;
    const firmaX = pageWidth / 2;
    doc.setFontSize(10);
    doc.line(firmaX - 40, signatureY, firmaX + 40, signatureY);
    
    doc.setFontSize(11);
    doc.text("Firma del Profesional (Fonoaudiólogo)", firmaX, signatureY + 8, { align: 'center'});
    doc.text(professionalName, firmaX, signatureY + 13, { align: 'center'});
    doc.text(`RUT: ${professionalRUT}`, firmaX, signatureY + 18, { align: 'center'});
    doc.text(`Reg.Salud: ${healthRegistry}`, firmaX, signatureY + 23, { align: 'center'});

    doc.save(`derivacion_${selectedPatient.name.replace(/ /g, '_')}.pdf`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
        toast({
            title: 'Error',
            description: 'Por favor, seleccione un paciente.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);

    const patient = patients.find(p => p.id === selectedPatientId);

    setTimeout(() => {
        setIsLoading(false);
        if (patient) {
            toast({
                title: 'Ficha de Derivación Generada',
                description: 'El informe se está descargando.',
            });
            generatePDF();
        } else {
            toast({
                title: 'Error',
                description: 'No se pudo encontrar al paciente seleccionado.',
                variant: 'destructive',
            });
        }
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Generar Ficha de Derivación</CardTitle>
          <CardDescription>
            Complete los campos para generar una ficha de derivación para un paciente.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
            
            <div className="space-y-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select required value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                        {patients.length > 0 ? patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>) : <SelectItem value="" disabled>Cargando pacientes...</SelectItem>}
                    </SelectContent>
                </Select>
            </div>
            
            {selectedPatient && (
                <div className='border-t pt-4 space-y-4'>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={selectedPatient.name} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label>RUT</Label>
                            <Input value={formData.rut} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label>Fecha de Nacimiento</Label>
                            <Input value={formData.birthDate} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label>Edad</Label>
                            <Input value={formData.age} readOnly />
                        </div>
                         <div className="space-y-2">
                            <Label>Domicilio</Label>
                            <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}/>
                        </div>
                         <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input value={formData.phone} readOnly />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="reason">Motivo de Consulta</Label>
                        <Textarea id="reason" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referralTo">Derivación a</Label>
                        <Textarea id="referralTo" value={formData.referralTo} onChange={e => setFormData({...formData, referralTo: e.target.value})} placeholder="Escriba aquí los detalles de la derivación..." required/>
                    </div>
                </div>
            )}
           
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" disabled={isLoading || !selectedPatientId}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <FileDown className="mr-2 h-4 w-4" />
                    Generar y Descargar
                </Button>
            </div>
            </CardContent>
        </form>
      </Card>
    </div>
  );
}
