
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ShieldCheck, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Patient, Consent } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface ConsentManagerProps {
    patient: Patient;
    onConsentChange: (consent: Consent) => void;
}

const statusConfig = {
    'Pendiente': { 
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        badgeVariant: 'outline' as const,
        textColor: 'text-yellow-600',
        description: 'El consentimiento aún no ha sido aceptado o rechazado.'
    },
    'Aceptado': { 
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        badgeVariant: 'secondary' as const,
        textColor: 'text-green-600',
        description: 'El paciente/apoderado ha aceptado los términos.'
     },
     'Rechazado': {
        icon: <XCircle className="h-4 w-4 text-destructive" />,
        badgeVariant: 'destructive' as const,
        textColor: 'text-destructive',
        description: 'El paciente/apoderado ha rechazado los términos.'
     },
    'Revocado': { 
        icon: <XCircle className="h-4 w-4 text-destructive" />,
        badgeVariant: 'destructive' as const,
        textColor: 'text-destructive',
        description: 'El paciente/apoderado ha revocado su consentimiento.'
     },
}

export function ConsentManager({ patient, onConsentChange }: ConsentManagerProps) {
    const [isSending, setIsSending] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const { toast } = useToast();
    
    // This state will hold the most up-to-date consent info.
    const [currentConsent, setCurrentConsent] = useState<Consent>(patient.consent || { status: 'Pendiente' });
    
    // This effect ensures that any time the patient prop changes (e.g. from parent),
    // the local state is updated, but it also checks localStorage for the most recent version.
    useEffect(() => {
        const loadConsent = () => {
            if (typeof window !== 'undefined') {
                const consentDataString = localStorage.getItem(`consent_data_${patient.id}`);
                if (consentDataString) {
                    const consentData = JSON.parse(consentDataString);
                    setCurrentConsent(consentData);
                } else {
                    setCurrentConsent(patient.consent || { status: 'Pendiente' });
                }
            }
        };
        loadConsent();
    }, [patient.id, patient.consent]);

    const { icon, badgeVariant, textColor, description } = statusConfig[currentConsent.status] || statusConfig['Pendiente'];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleSendConsent = (method: 'Email' | 'WhatsApp') => {
        setIsSending(true);
        const professionalName = user?.displayName || 'Cristóbal San Martín Zamorano';
        const professionalTitle = 'Fonoaudiólogo'; // This could be dynamic based on user profile settings
        const professionalRegistry = 'N° 826561'; // This should also come from user settings

        const consentUrl = `${window.location.origin}/consentimiento/${patient.id}`;
        const subject = "Envio de Consentimiento Informado para toma de Fotografias y Documentos";
        const signature = `
--------------------------------------
${professionalName}
${professionalTitle}
Registro Superintendencia de Salud: ${professionalRegistry}
`;
        
        const body = `Estimado/a,\n\nPara continuar con el proceso terapéutico de ${patient.name}, requerimos su autorización para la toma de fotografías y el almacenamiento de documentos clínicos, de acuerdo con la normativa de privacidad vigente.\n\nPor favor, revise y responda el formulario en el siguiente enlace:\n${consentUrl}\n\nEste proceso es fundamental para garantizar la seguridad y confidencialidad de la información.\n\nSaludos cordiales,\n${signature}`;

        // Check if the logged-in user is a Google user
        const isGoogleUser = user?.providerData.some(
            (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
        );
        
        if (isGoogleUser) {
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(patient.contact.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(gmailUrl, '_blank');
        } else {
            const mailtoLink = `mailto:${patient.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.location.href = mailtoLink;
        }

        // Simulate the action of sending and updating the status locally
        setTimeout(() => {
            const updatedConsent: Consent = {
                ...currentConsent,
                status: 'Pendiente',
                date: new Date().toISOString(),
                method: method,
            };
            setCurrentConsent(updatedConsent); // Update local state
            onConsentChange(updatedConsent); // Update parent state
            
            // Persist this "sent" state
            localStorage.setItem(`consent_data_${patient.id}`, JSON.stringify(updatedConsent));

            setIsSending(false);
            toast({
                title: 'Cliente de Correo Abierto',
                description: `Se ha generado un borrador para enviar a ${patient.contact.email}. El estado se ha actualizado a "Pendiente".`,
            });
        }, 500); // Short delay to allow the mail client to open
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <ShieldCheck /> Consentimiento Informado
                </CardTitle>
                <CardDescription>
                    Gestione el consentimiento del paciente o apoderado para el uso de imágenes y documentos con fines terapéuticos.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                        <p className="font-medium">Estado Actual</p>
                        <Badge variant={badgeVariant} className="text-base">
                            <span className={textColor}>{icon}</span>
                            <span className="ml-2">{currentConsent.status}</span>
                        </Badge>
                    </div>
                    {currentConsent.date && (
                        <div className="text-right">
                            <p className="font-medium">Última Actualización</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(currentConsent.date), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                            </p>
                            {currentConsent.method && (
                                <p className="text-xs text-muted-foreground">Método: {currentConsent.method}</p>
                            )}
                        </div>
                    )}
                </div>
                 <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                <div className="flex gap-2">
                    <Button onClick={() => handleSendConsent('Email')} disabled={isSending}>
                        {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Mail className="mr-2 h-4 w-4"/>}
                        Enviar por Email
                    </Button>
                    
                </div>
                <Link href={`/consentimiento/${patient.id}`} target="_blank" className="text-sm underline text-muted-foreground hover:text-primary">
                    Ver Formulario de Consentimiento
                </Link>
            </CardFooter>
        </Card>
    );
}
