
'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Book, LifeBuoy, Loader2, Send } from 'lucide-react';

interface SupportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onStartGuide: () => void;
    isPremium: boolean;
}

export function SupportDialog({ isOpen, onClose, onStartGuide, isPremium }: SupportDialogProps) {
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            onClose();
            toast({
                title: 'Mensaje Enviado',
                description: `Hemos recibido tu solicitud de soporte. Te contactaremos pronto. ${isPremium ? 'Tu solicitud ha sido marcada como prioritaria.' : ''}`,
            });
        }, 1500);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LifeBuoy className="text-primary" />
                        Asistente de Ayuda
                    </DialogTitle>
                     <DialogDescription>
                        {isPremium ? 'Soporte Prioritario para Plan Profesional' : '¿Necesitas ayuda o tienes alguna pregunta?'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="support-subject">Asunto</Label>
                            <Input id="support-subject" placeholder="Ej: Problema al generar reporte" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="support-message">¿En qué podemos ayudarte?</Label>
                            <Textarea id="support-message" placeholder="Describe tu consulta o problema en detalle..." rows={5} required />
                        </div>
                    </div>
                     <DialogFooter className="flex-col sm:flex-row sm:justify-between w-full">
                        <Button type="button" variant="outline" onClick={onStartGuide}>
                            <Book className="mr-2 h-4 w-4"/> Iniciar Guía Interactiva
                        </Button>
                        <Button type="submit" disabled={isSending}>
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Enviar Mensaje
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
