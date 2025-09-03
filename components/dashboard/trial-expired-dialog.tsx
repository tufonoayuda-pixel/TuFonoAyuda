
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
import { Crown, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface TrialExpiredDialogProps {
  isOpen: boolean;
}

export function TrialExpiredDialog({ isOpen }: TrialExpiredDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive"/> Tu Período de Prueba ha Terminado
          </DialogTitle>
          <DialogDescription>
            Para continuar utilizando todas las herramientas y funcionalidades de TuFonoAyuda, por favor, elija un plan de suscripción.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <p className="text-sm text-muted-foreground">
                Al suscribirte, desbloquearás nuevamente el acceso a la gestión de pacientes, el generador de actividades IA, los reportes y mucho más.
            </p>
        </div>
        <DialogFooter>
            <Button asChild className="w-full">
                <Link href="/suscripcion">
                    <Crown className="mr-2 h-4 w-4" />
                    Ver Planes y Suscribirse
                </Link>
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
