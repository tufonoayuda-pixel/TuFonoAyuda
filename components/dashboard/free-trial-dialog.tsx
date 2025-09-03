
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
import { Check, Star } from 'lucide-react';
import Link from 'next/link';

interface FreeTrialDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
    'Pacientes ilimitados',
    'Todas las herramientas de IA, incluyendo Asistente de Intervención',
    'Uso de tu propia base de conocimiento para la IA',
    'Teleconsultas ilimitadas con grabación',
    'Módulo de Finanzas con integración a SII (boletas)',
    'Reportes y estadísticas avanzadas',
];

export function FreeTrialDialog({ isOpen, onClose }: FreeTrialDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Star className="text-yellow-400"/>¡Prueba Gratuita Activada!</DialogTitle>
          <DialogDescription>
            Disfruta de 7 días de acceso completo a todas las funcionalidades del plan Experto para que explores todo el potencial de la plataforma.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
             <ul className='space-y-3 text-sm'>
                {features.map((feature, index) => (
                    <li key={index} className='flex items-start gap-3'>
                        <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2">
            <Button variant="ghost" onClick={onClose}>
                Explorar la App
            </Button>
            <Button asChild>
                <Link href="/suscripcion">Ver Planes de Suscripción</Link>
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
