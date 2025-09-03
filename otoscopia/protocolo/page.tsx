
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, Printer, User, ArrowLeft, Ear, Loader2, FileDown, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import type { Patient, GenerateOtoscopyReportOutput } from '@/lib/types';
import { collection, query, onSnapshot } from 'firebase/firestore';

const otoscopyItems = {
  pabellon: [
    { id: 'implantacion', label: 'Implantación' }, { id: 'forma', label: 'Forma' },
    { id: 'integridad', label: 'Integridad' }, { id: 'microsurcos', label: 'Microsurcos' },
    { id: 'edemas-pabellon', label: 'Edemas' }, { id: 'eritemas-pabellon', label: 'Eritemas' },
    { id: 'dolor-trago', label: 'Dolor a la presión en trago' }, { id: 'dolor-apofisis', label: 'Dolor a la presión en apófisis mastoides' }
  ],
  cae: [
    { id: 'cae-permeable', label: 'Permeable' }, { id: 'cae-estenosis', label: 'Estenosis' },
    { id: 'cae-edemas', label: 'Edemas' }, { id: 'cae-eritemas', label: 'Eritemas' },
    { id: 'cae-cuerpo-extrano', label: 'Cuerpo extraño' }, { id: 'cae-exostosis', label: 'Exostosis' },
  ],
  secretions: [
    { id: 'sec-otorrea', label: 'Otorrea' }, { id: 'sec-otorragia', label: 'Otorragia' }, { id: 'sec-otomicosis', label: 'Otomicosis' },
  ],
  cerumen: [
      { id: 'cer-grado1', label: 'Grado 1' }, { id: 'cer-grado2', label: 'Grado 2' }, { id: 'cer-grado3', label: 'Grado 3' },
  ],
  mt: [
    { id: 'mt-integra', label: 'Íntegra' }, { id: 'mt-opaca', label: 'Opaca' },
    { id: 'mt-vascularizada', label: 'Vascularizada' }, { id: 'mt-perforada', label: 'Perforada' },
    { id: 'mt-abombada', label: 'Abombada' }, { id: 'mt-retraida', label: 'Retraída' },
    { id: 'mt-cicatrizal', label: 'Cicatrizal' }, { id: 'mt-cono', label: 'Cono de luz presente' }
  ]
};

const sullivanScale = [
      { id: '0', level: '0', description: 'Cerumen virtualmente ausente o presente en muy poca cantidad, insuficiente para limitar el acceso audiológico al oído. La MT puede ser visualizada completamente, incluyendo el annulus. No se indica remoción de cerumen.' },
      { id: '1', level: '+1', description: 'Presencia de cerumen en menor cantidad. MT puede ser visualizada completamente. Puede interferir con la evaluación con fonos de inserción, mediciones en oído real, o toma de impresión. Se sugiere remoción en seco.' },
      { id: '2', level: '+2', description: 'Presencia de cerumen en cantidad moderada. La MT puede estar parcialmente visible. Probablemente interferirá con la evaluación con fonos de inserción y uso de audífonos. Se sugiere remoción en seco y/o lavado de oídos.' },
      { id: '3', level: '+3', description: 'Presencia de cerumen ocluyendo completamente la visualización de la MT. Interfiere con TODOS los procedimientos audiológicos. La remoción es esencial. Se sugiere remoción y lavado de oídos.' },
];

interface Findings {
    pabellon: { status: string; alterations: string[]; observations: string };
    cae: { status: string; alterations: string[]; secretions: string[]; observations: string };
    mt: { status: string; alterations: string[]; observations: string };
    cerumen: { od: string; oi: string };
    anamnesis: string;
    diagnosis: string;
}

const initialFindings: Findings = {
    pabellon: { status: 'indemne', alterations: [], observations: '' },
    cae: { status: 'indemne', alterations: [], secretions: [], observations: '' },
    mt: { status: 'indemne', alterations: [], observations: '' },
    cerumen: { od: '', oi: '' },
    anamnesis: '',
    diagnosis: ''
};


const Section = ({ title, ear, findings, onFindingChange, children }: { title: string, ear: 'od' | 'oi', findings: any, onFindingChange: (section: string, field: string, value: any) => void, children: React.ReactNode }) => {
    
    const handleStatusChange = (value: string) => {
        onFindingChange(title.toLowerCase().replace(/ /g, '_'), 'status', value);
    }

    const handleObservationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onFindingChange(title.toLowerCase().replace(/ /g, '_'), 'observations', e.target.value);
    }
    
    return (
        <div className='p-4 border rounded-md'>
            <h4 className='font-semibold text-lg mb-4'>{title}</h4>
            <div className='space-y-4'>
                <RadioGroup value={findings.status} onValueChange={handleStatusChange} className='flex gap-4'>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='indemne' id={`${ear}-${title}-indemne`}/>
                        <Label htmlFor={`${ear}-${title}-indemne`}>Indemne</Label>
                    </div>
                     <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='alterado' id={`${ear}-${title}-alterado`}/>
                        <Label htmlFor={`${ear}-${title}-alterado`}>Alterado</Label>
                    </div>
                     <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='ausente' id={`${ear}-${title}-ausente`}/>
                        <Label htmlFor={`${ear}-${title}-ausente`}>Ausente</Label>
                    </div>
                </RadioGroup>
                <div className="pl-6 space-y-3">
                     {React.Children.map(children, child => {
                        if (React.isValidElement(child) && child.type === CheckboxItem) {
                            return React.cloneElement(child as React.ReactElement<any>, { alterations: findings.alterations });
                        }
                        if(React.isValidElement(child) && typeof child.type !== 'string' && child.type.name === 'SecretionCheckboxes') {
                            return React.cloneElement(child as React.ReactElement<any>, { secretions: findings.secretions });
                        }
                        return child;
                    })}
                </div>
                 <Textarea placeholder="Observaciones..." className="mt-2" value={findings.observations} onChange={handleObservationChange}/>
            </div>
        </div>
    )
}

const SecretionCheckboxes = ({ ear, onSecretionChange, secretions }: { ear: 'od' | 'oi', onSecretionChange: (label: string, checked: boolean) => void, secretions: string[] }) => (
    <>
        <div className='font-medium pt-2'>Secreciones</div>
        {otoscopyItems.secretions.map(item => (
            <CheckboxItem 
                key={item.id} 
                id={`${ear}-${item.id}`} 
                label={item.label} 
                ear={ear} 
                onAlterationChange={onSecretionChange} 
                alterations={secretions}
            />
        ))}
    </>
);

const CheckboxItem = ({ id, label, ear, onAlterationChange, alterations }: { id: string, label: string, ear: 'od' | 'oi', onAlterationChange: (id: string, checked: boolean) => void, alterations: string[] }) => (
    <div className="flex items-center space-x-2">
        <Checkbox id={`${ear}-${id}`} onCheckedChange={(checked) => onAlterationChange(label, checked as boolean)} checked={alterations.includes(label)} />
        <Label htmlFor={`${ear}-${id}`} className="font-normal">{label}</Label>
    </div>
);


export default function ProtocoloOtoscopiaPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<GenerateOtoscopyReportOutput | null>(null);


    const [findingsOD, setFindingsOD] = useState<Findings>(initialFindings);
    const [findingsOI, setFindingsOI] = useState<Findings>(initialFindings);
    const [anamnesis, setAnamnesis] = useState('');
    const [diagnosis, setDiagnosis] = useState('');

    const handleFindingChange = (ear: 'od' | 'oi', section: string, field: string, value: any) => {
        const setFindings = ear === 'od' ? setFindingsOD : setFindingsOI;
        setFindings(prev => ({
            ...prev,
            [section]: {
                ...prev[section as keyof Omit<Findings, 'anamnesis'|'diagnosis'| 'cerumen'>],
                [field]: value
            }
        }));
    };
    
    const handleAlterationChange = (ear: 'od' | 'oi', section: 'pabellon' | 'cae' | 'mt', label: string, checked: boolean) => {
        const setFindings = ear === 'od' ? setFindingsOD : setFindingsOI;
        setFindings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                alterations: checked 
                    ? [...prev[section].alterations, label]
                    : prev[section].alterations.filter(l => l !== label)
            }
        }));
    };
    
    const handleSecretionChange = (ear: 'od' | 'oi', label: string, checked: boolean) => {
        const setFindings = ear === 'od' ? setFindingsOD : setFindingsOI;
        setFindings(prev => ({
            ...prev,
            cae: {
                ...prev.cae,
                secretions: checked
                    ? [...prev.cae.secretions, label]
                    : prev.cae.secretions.filter(s => s !== label)
            }
        }));
    };

    useEffect(() => {
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

    const generatePDF = (reportContent: GenerateOtoscopyReportOutput) => {
        const selectedPatient = patients.find(p => p.id === selectedPatientId);
        if (!selectedPatient || !user) return;
    
        const doc = new jsPDF();
        const professionalName = user.displayName || "Dr. Cristóbal San Martín";
        const registryNumber = "N° 826561"; 
        const margin = 14;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
    
        const professionalLogo = localStorage.getItem('professionalLogo');
        if (professionalLogo) {
            doc.addImage(professionalLogo, 'PNG', margin, 10, 25, 25);
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(professionalName, pageWidth - margin, 20, { align: 'right' });
    
        let yPos = 45;
    
        doc.setFontSize(18);
        doc.text('Informe de Exploración Otoscópica', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
    
        doc.setFontSize(12);
        doc.text(`Paciente: ${selectedPatient.name}`, margin, yPos);
        doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 10;
        doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);

        yPos += 5;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Informe Narrativo (Generado por IA):", margin, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        const narrativeLines = doc.splitTextToSize(reportContent.narrativeReport, pageWidth - margin * 2);
        doc.text(narrativeLines, margin, yPos);
        yPos += narrativeLines.length * 5 + 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Impresión Diagnóstica:", margin, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        const impressionLines = doc.splitTextToSize(reportContent.impression, pageWidth - margin * 2);
        doc.text(impressionLines, margin, yPos);

        const footerY = pageHeight - 35;
        doc.line(margin, footerY, pageWidth - margin, footerY);
        const signatureX = pageWidth / 2;
        doc.setFontSize(10);
        doc.text("Firma del Profesional (Fonoaudiólogo)", signatureX, footerY + 8, { align: 'center'});
        doc.text(professionalName, signatureX, footerY + 13, { align: 'center'});
        doc.text(`Reg.Salud: ${registryNumber}`, signatureX, footerY + 23, { align: 'center'});
    
        doc.save(`informe_otoscopia_${selectedPatient.name.replace(/ /g, '_')}.pdf`);
    };

    const handleGenerateReport = async () => {
        const patient = patients.find(p => p.id === selectedPatientId);
        if (!patient) {
            toast({ title: "Error", description: "Por favor, seleccione un paciente.", variant: "destructive" });
            return;
        }

        setIsGeneratingReport(true);
        setGeneratedReport(null);

        const apiInput = {
            patientName: patient.name,
            findings: {
                od: {
                    pabellon: `Estado: ${findingsOD.pabellon.status}. Alteraciones: ${findingsOD.pabellon.alterations.join(', ') || 'ninguna'}. Obs: ${findingsOD.pabellon.observations || 'ninguna'}.`,
                    cae: `Estado: ${findingsOD.cae.status}. Alteraciones: ${findingsOD.cae.alterations.join(', ') || 'ninguna'}. Secreciones: ${findingsOD.cae.secretions.join(', ') || 'ninguna'}. Obs: ${findingsOD.cae.observations || 'ninguna'}.`,
                    mt: `Estado: ${findingsOD.mt.status}. Alteraciones: ${findingsOD.mt.alterations.join(', ') || 'ninguna'}. Obs: ${findingsOD.mt.observations || 'ninguna'}.`,
                },
                oi: {
                    pabellon: `Estado: ${findingsOI.pabellon.status}. Alteraciones: ${findingsOI.pabellon.alterations.join(', ') || 'ninguna'}. Obs: ${findingsOI.pabellon.observations || 'ninguna'}.`,
                    cae: `Estado: ${findingsOI.cae.status}. Alteraciones: ${findingsOI.cae.alterations.join(', ') || 'ninguna'}. Secreciones: ${findingsOI.cae.secretions.join(', ') || 'ninguna'}. Obs: ${findingsOI.cae.observations || 'ninguna'}.`,
                    mt: `Estado: ${findingsOI.mt.status}. Alteraciones: ${findingsOI.mt.alterations.join(', ') || 'ninguna'}. Obs: ${findingsOI.mt.observations || 'ninguna'}.`,
                }
            },
            observations: anamnesis,
        };

        try {
            const response = await fetch('/api/generate-otoscopy-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiInput)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Error en el servidor");
            }
            const result = await response.json();
            setGeneratedReport(result);
            setIsReportModalOpen(true);

        } catch (error: any) {
            toast({
                title: "Error de IA",
                description: `No se pudo generar el informe: ${error.message}`,
                variant: "destructive"
            });
        } finally {
            setIsGeneratingReport(false);
        }
    }
    
    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Volver
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-3"><Ear/> Protocolo de Exploración Otoscópica</CardTitle>
                    <CardDescription>Rellene los campos para documentar la exploración. Marque las casillas si encuentra una alteración.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Patient Section */}
                    <div className="space-y-4 p-4 border rounded-lg bg-secondary/30">
                        <h3 className="font-semibold text-lg flex items-center gap-2"><User /> Datos del Paciente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="patient-select">Paciente</Label>
                                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar paciente"/></SelectTrigger>
                                    <SelectContent>
                                        {patients.length > 0 ? patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>) : <SelectItem value="" disabled>No hay pacientes</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="protocol-date">Fecha del Protocolo</Label>
                                <Input id="protocol-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="anamnesis">Anamnesis Relevante</Label>
                            <Textarea id="anamnesis" placeholder="Ej: Paciente refiere hipoacusia en oído derecho y sensación de oído tapado..." value={anamnesis} onChange={e => setAnamnesis(e.target.value)} />
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Oído Derecho */}
                        <div className='space-y-6'>
                            <h3 className="text-xl font-bold text-center py-2 bg-muted rounded-md">OÍDO DERECHO (O.D.)</h3>
                            <Section title='Pabellón Auricular' ear='od' findings={findingsOD.pabellon} onFindingChange={(section, field, value) => handleFindingChange('od', section, field, value)}>
                                {otoscopyItems.pabellon.map(item => (<CheckboxItem key={item.id} id={`od-${item.id}`} label={item.label} ear='od' onAlterationChange={(label, checked) => handleAlterationChange('od', 'pabellon', label, checked)} alterations={findingsOD.pabellon.alterations}/>))}
                            </Section>
                            <Section title='Conducto Auditivo Externo (CAE)' ear='od' findings={findingsOD.cae} onFindingChange={(section, field, value) => handleFindingChange('od', section, field, value)}>
                                {otoscopyItems.cae.map(item => (<CheckboxItem key={item.id} id={`od-${item.id}`} label={item.label} ear='od' onAlterationChange={(label, checked) => handleAlterationChange('od', 'cae', label, checked)} alterations={findingsOD.cae.alterations}/>))}
                                <SecretionCheckboxes ear="od" onSecretionChange={(label, checked) => handleSecretionChange('od', label, checked)} secretions={findingsOD.cae.secretions} />
                            </Section>
                             <Section title='Membrana Timpánica (MT)' ear='od' findings={findingsOD.mt} onFindingChange={(section, field, value) => handleFindingChange('od', section, field, value)}>
                                {otoscopyItems.mt.map(item => (<CheckboxItem key={item.id} id={`od-${item.id}`} label={item.label} ear='od' onAlterationChange={(label, checked) => handleAlterationChange('od', 'mt', label, checked)} alterations={findingsOD.mt.alterations} />))}
                            </Section>
                        </div>
                        {/* Oído Izquierdo */}
                        <div className='space-y-6'>
                            <h3 className="text-xl font-bold text-center py-2 bg-muted rounded-md">OÍDO IZQUIERDO (O.I.)</h3>
                           <Section title='Pabellón Auricular' ear='oi' findings={findingsOI.pabellon} onFindingChange={(section, field, value) => handleFindingChange('oi', section, field, value)}>
                                {otoscopyItems.pabellon.map(item => (<CheckboxItem key={item.id} id={`oi-${item.id}`} label={item.label} ear='oi' onAlterationChange={(label, checked) => handleAlterationChange('oi', 'pabellon', label, checked)} alterations={findingsOI.pabellon.alterations} />))}
                            </Section>
                            <Section title='Conducto Auditivo Externo (CAE)' ear='oi' findings={findingsOI.cae} onFindingChange={(section, field, value) => handleFindingChange('oi', section, field, value)}>
                                {otoscopyItems.cae.map(item => (<CheckboxItem key={item.id} id={`oi-${item.id}`} label={item.label} ear='oi' onAlterationChange={(label, checked) => handleAlterationChange('oi', 'cae', label, checked)} alterations={findingsOI.cae.alterations} />))}
                                <SecretionCheckboxes ear="oi" onSecretionChange={(label, checked) => handleSecretionChange('oi', label, checked)} secretions={findingsOI.cae.secretions} />
                            </Section>
                            <Section title='Membrana Timpánica (MT)' ear='oi' findings={findingsOI.mt} onFindingChange={(section, field, value) => handleFindingChange('oi', section, field, value)}>
                                {otoscopyItems.mt.map(item => (<CheckboxItem key={item.id} id={`oi-${item.id}`} label={item.label} ear='oi' onAlterationChange={(label, checked) => handleAlterationChange('oi', 'mt', label, checked)} alterations={findingsOI.mt.alterations} />))}
                            </Section>
                        </div>
                    </div>

                     <div className="space-y-2 pt-4">
                        <Label htmlFor="possible-diagnosis" className='text-lg font-semibold'>Impresión Diagnóstica / Hipótesis</Label>
                        <Textarea id="possible-diagnosis" placeholder="Describa su hipótesis diagnóstica basada en la exploración..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end gap-4 print:hidden">
                     <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/>Imprimir Protocolo</Button>
                     <Button onClick={handleGenerateReport} disabled={isGeneratingReport || !selectedPatientId}>
                         {isGeneratingReport ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4" />}
                         Generar Informe con IA
                     </Button>
                </CardFooter>
            </Card>

            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Informe Otoscópico Generado por IA</DialogTitle>
                        <DialogDescription>Revise el informe y descargue el PDF.</DialogDescription>
                    </DialogHeader>
                    {generatedReport && (
                        <ScrollArea className="max-h-[60vh] p-4 border rounded-md">
                           <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold">Informe Narrativo</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedReport.narrativeReport}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Diagnósticos</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {generatedReport.diagnoses.map((dx, i) => <li key={i}>{dx}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold">Impresión Diagnóstica General</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedReport.impression}</p>
                            </div>
                           </div>
                        </ScrollArea>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setIsReportModalOpen(false)}>Cerrar</Button>
                        <Button type="button" onClick={() => generatedReport && generatePDF(generatedReport)}>
                            <FileDown className="mr-2 h-4 w-4" />Descargar PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    )
}
