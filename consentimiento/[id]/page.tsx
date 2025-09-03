
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { patients } from '@/lib/mock-data';
import { Check, Printer, ShieldCheck, ThumbsDown, ThumbsUp, X, Edit, Save, Loader2, FileDown } from 'lucide-react';
import { useParams, notFound } from 'next/navigation';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import { Loader2 as Loader } from 'lucide-react';
import type { Consent } from '@/lib/types';

const initialTexts = {
    intro: "Por medio de este documento, yo, el apoderado/representante legal del paciente {patientName}, autorizo de manera voluntaria al fonoaudiólogo a cargo para realizar las siguientes acciones como parte del proceso terapéutico:",
    point1: "Toma de Fotografías y/o Videos: Entiendo que se podrán tomar fotografías y/o grabar videos con fines exclusivamente terapéuticos. Esto incluye el registro de la estructura orofacial, posturas, realización de ejercicios, entre otros, con el objetivo de analizar la evolución y planificar la intervención.",
    point2: "Almacenamiento de Documentos Clínicos: Autorizo el almacenamiento digital de informes médicos, exámenes, derivaciones y otros documentos relevantes para la terapia en la plataforma segura TuFonoAyuda.",
    confidentiality: "Se me ha informado que todo el material audiovisual y documental será tratado con la más estricta confidencialidad, de acuerdo con la Ley N° 20.584 sobre los Derechos y Deberes de los Pacientes. Este material será utilizado únicamente para el análisis clínico y el seguimiento del caso, y no será compartido con terceros sin mi autorización explícita.",
    revocation: "Entiendo que puedo revocar este consentimiento en cualquier momento, comunicándolo por escrito al profesional tratante."
};

export default function ConsentPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { toast } = useToast();
    
    const [patient, setPatient] = useState<any>(null);
    const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [consentTexts, setConsentTexts] = useState(initialTexts);
    const [isSaving, setIsSaving] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const foundPatient = patients.find((p) => p.id === id);
        if (foundPatient) {
            setPatient(foundPatient);
            // Check localStorage for a saved status for this patient
            if (typeof window !== 'undefined') {
                const savedConsentStatus = localStorage.getItem(`consent_status_${id}`);
                if (savedConsentStatus === 'Aceptado' || savedConsentStatus === 'Rechazado') {
                    setStatus(savedConsentStatus === 'Aceptado' ? 'accepted' : 'rejected');
                }
            }
        } else {
            notFound();
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [id]);
    
    const updateConsentStatus = (newStatus: 'Aceptado' | 'Rechazado') => {
        if (typeof window !== 'undefined') {
            const consentData: Consent = {
                status: newStatus,
                date: new Date().toISOString(),
                method: 'Enlace Web' // or derive from how it was sent
            };
            localStorage.setItem(`consent_status_${id}`, newStatus);
            localStorage.setItem(`consent_data_${id}`, JSON.stringify(consentData));
        }
    }


    const handleAccept = () => {
        setStatus('accepted');
        updateConsentStatus('Aceptado');
        toast({
            title: 'Consentimiento Aceptado',
            description: 'Gracias. Su respuesta ha sido registrada.'
        });
    };

    const handleReject = () => {
        setStatus('rejected');
        updateConsentStatus('Rechazado');
         toast({
            title: 'Consentimiento Rechazado',
            description: 'Su respuesta ha sido registrada. No se tomarán fotos ni se guardarán documentos sensibles.',
            variant: 'destructive'
        });
    }

    const handlePrint = () => {
        window.print();
    }
    
    const handleSave = () => {
        setIsSaving(true);
        // Here you would typically save the updated consentTexts to your backend.
        // For this demo, we'll just simulate it and update the local state.
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            toast({
                title: 'Consentimiento Actualizado',
                description: 'El texto del consentimiento ha sido guardado.'
            });
        }, 1000);
    }

    const handleTextChange = (field: keyof typeof initialTexts, value: string) => {
        setConsentTexts(prev => ({...prev, [field]: value}));
    }

    const generatePdf = () => {
        const doc = new jsPDF();
        const margin = 14;
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        const addText = (text: string, size: number, style: 'normal' | 'bold', spacing: number) => {
            doc.setFontSize(size);
            doc.setFont('helvetica', style);
            const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
            doc.text(lines, margin, y);
            y += (doc.getTextDimensions(lines).h) + spacing;
        };

        addText("Consentimiento Informado", 18, 'bold', 8);
        addText(`Para el paciente: ${patient.name}`, 12, 'normal', 10);

        addText(consentTexts.intro.replace('{patientName}', patient.name), 11, 'normal', 6);
        addText("1. " + consentTexts.point1, 11, 'normal', 6);
        addText("2. " + consentTexts.point2, 11, 'normal', 8);
        addText(consentTexts.confidentiality, 11, 'normal', 6);
        addText(consentTexts.revocation, 11, 'normal', 25);

        // Signature section
        const signatureY = y > 240 ? 260 : y;
        doc.text("______________________________", margin, signatureY);
        doc.text("Firma Paciente/Apoderado", margin, signatureY + 5);
        doc.text("Nombre: ____________________", margin, signatureY + 12);
        doc.text("RUT: _______________________", margin, signatureY + 19);

        doc.text("______________________________", pageWidth / 2 + 10, signatureY);
        doc.text("Firma Profesional", pageWidth / 2 + 10, signatureY + 5);
        doc.text("Fonoaudiólogo/a", pageWidth / 2 + 10, signatureY + 12);


        doc.save(`consentimiento_informado_${patient.name.replace(/ /g, '_')}.pdf`);
    }

    if (authLoading || !patient) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 print:py-0">
             <Card>
                <CardHeader>
                    <div className='grid grid-cols-2 items-start'>
                        <div className='flex flex-col items-start'>
                            <div className='flex items-center gap-2 mb-2'>
                                <ShieldCheck className='h-8 w-8 text-primary' />
                                <CardTitle className='text-2xl'>Consentimiento Informado</CardTitle>
                            </div>
                            <CardDescription>
                            Para el paciente: <span className="font-semibold">{patient.name}</span>
                            </CardDescription>
                        </div>
                         {user && (
                            <div className="flex justify-end print:hidden">
                                {isEditing ? (
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Guardar
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className='prose dark:prose-invert max-w-none space-y-4'>
                    {isEditing ? (
                        <Textarea value={consentTexts.intro.replace('{patientName}', patient.name)} onChange={(e) => handleTextChange('intro', e.target.value)} rows={4}/>
                    ) : (
                        <p>{consentTexts.intro.replace('{patientName}', patient.name)}</p>
                    )}
                    <ol className="space-y-4">
                        <li>
                            {isEditing ? (
                                <Textarea value={consentTexts.point1} onChange={(e) => handleTextChange('point1', e.target.value)} rows={4}/>
                            ) : (
                                <p>{consentTexts.point1}</p>
                            )}
                        </li>
                        <li>
                             {isEditing ? (
                                <Textarea value={consentTexts.point2} onChange={(e) => handleTextChange('point2', e.target.value)} rows={3}/>
                            ) : (
                                <p>{consentTexts.point2}</p>
                            )}
                        </li>
                    </ol>
                    {isEditing ? (
                        <Textarea value={consentTexts.confidentiality} onChange={(e) => handleTextChange('confidentiality', e.target.value)} rows={4}/>
                    ) : (
                        <p>{consentTexts.confidentiality}</p>
                    )}
                    {isEditing ? (
                        <Textarea value={consentTexts.revocation} onChange={(e) => handleTextChange('revocation', e.target.value)} rows={2}/>
                    ) : (
                        <p>{consentTexts.revocation}</p>
                    )}
                </CardContent>

                <CardContent className="pt-16">
                  <div className="grid grid-cols-2 gap-16">
                    <div className="text-center">
                      <div className="border-t border-foreground w-full"></div>
                      <p className="mt-2 text-sm">Firma Paciente/Apoderado</p>
                      <p className="mt-4 text-xs text-muted-foreground">Nombre: ____________________</p>
                      <p className="mt-2 text-xs text-muted-foreground">RUT: _______________________</p>
                    </div>
                    <div className="text-center">
                      <div className="border-t border-foreground w-full"></div>
                      <p className="mt-2 text-sm">Firma Profesional</p>
                      <p className="mt-4 text-xs text-muted-foreground">Fonoaudiólogo/a</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="print:hidden mt-8">
                    {status === 'pending' && !isEditing && (
                        <div className='w-full flex flex-col sm:flex-row justify-between items-center gap-4'>
                            <div className="flex gap-2">
                                <Button variant="outline" size="lg" onClick={handlePrint}>
                                    <Printer className="mr-2 h-5 w-5" />
                                    Imprimir
                                </Button>
                                <Button variant="outline" size="lg" onClick={generatePdf}>
                                    <FileDown className="mr-2 h-5 w-5" />
                                    Descargar PDF
                                </Button>
                            </div>
                            <div className='flex flex-col sm:flex-row gap-4'>
                                <Button variant="destructive" size="lg" onClick={handleReject}>
                                    <ThumbsDown className="mr-2 h-5 w-5" />
                                    No, no acepto
                                </Button>
                                <Button size="lg" onClick={handleAccept}>
                                    <ThumbsUp className="mr-2 h-5 w-5" />
                                    Sí, acepto y firmo
                                </Button>
                            </div>
                        </div>
                    )}
                    {status === 'accepted' && (
                        <div className="w-full text-center text-green-600 font-semibold flex items-center justify-center gap-2 p-4 bg-green-500/10 rounded-lg">
                            <Check className="h-6 w-6" />
                            <p>¡Gracias! Su consentimiento ha sido registrado exitosamente.</p>
                        </div>
                    )}
                     {status === 'rejected' && (
                        <div className="w-full text-center text-red-600 font-semibold flex items-center justify-center gap-2 p-4 bg-red-500/10 rounded-lg">
                            <X className="h-6 w-6" />
                            <p>Su rechazo ha sido registrado. Puede cerrar esta ventana.</p>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
