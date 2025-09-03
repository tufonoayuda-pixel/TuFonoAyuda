

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, DollarSign } from 'lucide-react';
import type { Session } from '@/lib/types';
import { useState } from 'react';

interface SessionDetailModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (session: Session) => void;
}

export function SessionDetailModal({ session, isOpen, onClose, onUpdate }: SessionDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editedSession, setEditedSession] = useState<Session>(session);
  const { toast } = useToast();

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onUpdate(editedSession);
      toast({
        title: 'Cita Actualizada',
        description: `Los detalles de la sesión de ${session.patientName} han sido guardados.`,
      });
      onClose();
    }, 1000);
  };
  
  const handleChange = (field: keyof Session, value: string | number) => {
    setEditedSession(prev => ({...prev, [field]: value}));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles de la Cita</DialogTitle>
          <DialogDescription>
            Gestiona la sesión de {session.patientName} del {new Date(session.date).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="session-status">Estado de la Cita</Label>
                <Select value={editedSession.status} onValueChange={(value) => handleChange('status', value)}>
                    <SelectTrigger id="session-status">
                        <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Programada">Programada</SelectItem>
                        <SelectItem value="Completada">Completada</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                        <SelectItem value="Ausente">Ausente</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="price">Precio de la Sesión (CLP)</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="price" type="number" value={editedSession.price} onChange={(e) => handleChange('price', Number(e.target.value))} className="pl-8" />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="payment-status">Estado del Pago</Label>
                <Select value={editedSession.paymentStatus} onValueChange={(value) => handleChange('paymentStatus', value)}>
                    <SelectTrigger id="payment-status">
                        <SelectValue placeholder="Seleccionar estado de pago" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pagado">Pagado</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Anulado">Anulado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
