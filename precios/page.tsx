
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Briefcase, BrainCircuit, GraduationCap, ArrowLeft, Gift, Hourglass } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const plans = [
    {
        name: 'Estudiante',
        priceMonthly: 4990,
        target: 'Herramientas esenciales para tu formación y práctica clínica.',
        icon: GraduationCap,
        features: [
            'Gestión de hasta 10 pacientes',
            'Generador de Actividades IA (30 usos/mes)',
            'Agenda digital con recordatorios por email',
            'Herramientas Clínicas básicas',
            'Acceso a Academia FonoAyuda',
            'Soporte por comunidad',
        ],
        isRecommended: false,
        buttonText: 'Comenzar Plan Estudiante',
        disabled: false,
    },
    {
        name: 'Profesional',
        priceMonthly: 12990,
        target: 'Para el profesional que busca crecer y optimizar su consulta.',
        icon: Briefcase,
        features: [
            'Pacientes ilimitados',
            'Generador de Actividades IA (Usos ilimitados)',
            'Recordatorios por WhatsApp',
            'Módulo de Finanzas y Reportes',
            'Teleconsulta (10 sesiones/mes)',
            'Soporte Prioritario',
        ],
        isRecommended: true,
        buttonText: 'Iniciar Prueba Gratuita',
        disabled: false,
    },
    {
        name: 'Experto',
        priceMonthly: 19990,
        target: 'Para el innovador que quiere usar IA al máximo potencial.',
        icon: BrainCircuit,
        features: [
            'Todo lo del plan Profesional',
            'Asistente de Intervención IA (con tu base de conocimiento)',
            'Análisis de Informes Externos con IA',
            'Teleconsultas ilimitadas',
            'Acceso anticipado a nuevas funciones',
        ],
        isRecommended: false,
        buttonText: 'Próximamente',
        disabled: true,
    },
]

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8" data-tour-id="precios-page">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Planes diseñados para cada fonoaudiólogo</h1>
        <p className="text-muted-foreground mt-2 text-md md:text-lg">
          Desde estudiantes hasta expertos en IA, encuentra el plan que se adapta a tu forma de trabajar.
        </p>
         <div className="flex items-center justify-center gap-4 mt-6">
            <Label htmlFor="billing-cycle" className={cn(!isAnnual && "text-primary font-bold")}>Pago Mensual</Label>
            <Switch id="billing-cycle" checked={isAnnual} onCheckedChange={setIsAnnual} disabled={true} />
            <Label htmlFor="billing-cycle" className={cn(isAnnual ? "text-primary font-bold" : "text-muted-foreground")}>Pago Anual (Ahorra 20%)</Label>
        </div>
      </header>

        <Alert className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 text-primary-foreground p-6 rounded-lg">
            <div className="flex items-center gap-4">
                <Gift className="h-10 w-10 text-primary" />
                <div>
                    <AlertTitle className="text-primary font-bold text-lg">Prueba Gratuita de 7 Días</AlertTitle>
                    <AlertDescription className="text-primary/90 mt-1">
                        Explora todas las funcionalidades de nuestros planes sin compromiso. 
                        <b> No se requiere tarjeta de crédito o débito</b> para comenzar.
                    </AlertDescription>
                </div>
                 <Button variant="default" asChild className="ml-auto shrink-0">
                    <Link href="/registro">¡Activa tu prueba ahora!</Link>
                </Button>
            </div>
        </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map(plan => (
            <Card key={plan.name} className={cn("flex flex-col h-full", plan.isRecommended && "border-primary border-2 shadow-lg")}>
                {plan.isRecommended && (
                     <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                        <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                            <Star className='w-4 h-4' />
                            Más Popular
                        </div>
                     </div>
                )}
                <CardHeader className="text-center">
                    <plan.icon className="w-10 h-10 mx-auto text-primary" />
                    <CardTitle className='text-2xl font-bold pt-2'>
                        {plan.name}
                    </CardTitle>
                    <CardDescription>
                        {plan.target}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                     <div className='text-center'>
                        <p className='text-4xl font-extrabold'>
                            {plan.priceMonthly > 0 ? (plan.disabled ? '...' : `$${new Intl.NumberFormat('es-CL').format(plan.priceMonthly)}`) : 'Gratis'}
                        </p>
                        {plan.priceMonthly > 0 && !plan.disabled &&
                            <p className='text-muted-foreground text-sm'>
                                CLP / mes
                            </p>
                        }
                     </div>
                     <ul className='space-y-3 pt-4 text-sm'>
                        {plan.features.map(feature => (
                            <li key={feature} className='flex items-start gap-3'>
                                <Check className='w-5 h-5 text-green-500 flex-shrink-0 mt-0.5' />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                     <Button className="w-full" size="lg" variant={plan.isRecommended ? "default" : "outline"} asChild disabled={plan.disabled}>
                        <Link href="/registro">{plan.buttonText}</Link>
                     </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
