
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { School, Video, CheckCircle, Mail, User, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

const courseModules = [
  {
    title: 'Módulo 1: Fundamentos de la Deglución',
    lessons: [
      'Anatomía y Fisiología de la Deglución Normal',
      'Neurofisiología y control motor de la deglución',
      'Desarrollo de la deglución en el ciclo vital (Neonato a Adulto Mayor)',
    ],
  },
  {
    title: 'Módulo 2: Evaluación de la Disfagia',
    lessons: [
      'Evaluación Clínica: Protocolos e Instrumentos',
      'Evaluación Instrumental: Videofluoroscopía (VDF) y Nasofibroscopía (FEES)',
      'Interpretación de hallazgos y diagnóstico diferencial',
    ],
  },
  {
    title: 'Módulo 3: Intervención en Disfagia Pediátrica',
    lessons: [
      'Trastornos de la alimentación en neonatos y lactantes',
      'Abordaje en trastornos sensoriales y conductuales',
      'Estrategias terapéuticas para población pediátrica',
    ],
  },
  {
    title: 'Módulo 4: Intervención en Disfagia Adultos',
    lessons: [
      'Disfagia Orofaríngea Neurogénica (ACV, TEC, Parkinson)',
      'Manejo de la Presbifagia y Sarcopenia',
      'Rehabilitación en pacientes oncológicos y post-intubación',
    ],
  },
];

export default function AcademiaPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: '¡Inscripción Exitosa!',
      description: 'Te hemos enviado un correo con los detalles del curso y el acceso.',
    });
    setIsRegistering(false);
  }

  const isCreator = user && ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(user.email!);

  if (isLoadingUser) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <School className="w-24 h-24 mb-4 text-primary mx-auto" />
        <h1 className="text-4xl font-bold">Academia FonoAyuda</h1>
        <p className="text-xl text-muted-foreground mt-2">
            Un espacio exclusivo con cursos y recursos para potenciar tu práctica clínica.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Contenido Educativo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <Card>
                <CardHeader>
                    <CardTitle>Tutorial de Bienvenida</CardTitle>
                    <CardDescription>
                        <span className="flex items-center gap-2 mt-2">
                            <PlayCircle className="w-4 h-4" /> Video
                        </span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Un recorrido completo por todas las funcionalidades de la plataforma para que le saques el máximo provecho desde el primer día.
                    </p>
                </CardContent>
                <CardFooter>
                     <Button variant="outline" className="w-full" asChild>
                        <Link href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">Ver Tutorial</Link>
                    </Button>
                </CardFooter>
            </Card>

            {isCreator && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Curso Trastornos de la Deglución y Alimentación Oral en todo el Ciclo Vital</CardTitle>
                        <CardDescription>
                            <span className="flex items-center gap-2 mt-2">
                                <Video className="w-4 h-4" /> Asincrónico
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Profundiza en la evaluación y abordaje de la disfagia y los trastornos de la alimentación desde la neonatología hasta el adulto mayor, basándote en la evidencia más reciente.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" asChild>
                            <Link href="/academia/curso-deglucion">Ver Temario</Link>
                        </Button>
                        <Button onClick={() => setIsRegistering(true)}>Inscribirse</Button>
                    </CardFooter>
                </Card>
            )}

            <Card className="flex flex-col items-center justify-center p-6 border-dashed">
                 <h3 className="text-lg font-semibold text-center">Próximamente más cursos</h3>
                 <p className="text-sm text-muted-foreground text-center mt-2">¡Estamos preparando nuevo material educativo para ti!</p>
            </Card>
        </div>
      </section>

      {isRegistering && (
        <section className="space-y-8 pt-8 border-t">
          <h2 className="text-2xl font-bold text-center">Inscripción y Temario del Curso</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card>
              <CardHeader>
                <CardTitle>Completa tu Inscripción</CardTitle>
                <CardDescription>Rellena tus datos para asegurar tu cupo.</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegistrationSubmit}>
                  <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className='flex items-center gap-2'><User className='h-4 w-4' /> Nombre Completo</Label>
                            <Input id="name" placeholder="Tu nombre y apellido" required/>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="email" className='flex items-center gap-2'><Mail className='h-4 w-4' /> Email de Contacto</Label>
                             <Input id="email" type="email" placeholder="tu.correo@email.com" required/>
                        </div>
                         <div>
                            <p className='text-sm font-medium'>Método de Pago</p>
                            <p className='text-xs text-muted-foreground'>Al confirmar, se te redirigirá a un portal de pago seguro.</p>
                        </div>
                  </CardContent>
                  <CardFooter className='flex-col gap-4'>
                        <Button type="submit" className='w-full'>Confirmar Inscripción</Button>
                        <Button variant="ghost" className='w-full' onClick={() => setIsRegistering(false)}>Cancelar</Button>
                  </CardFooter>
              </form>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Contenido del Curso</CardTitle>
                    <CardDescription>Explora los módulos que te convertirán en un experto.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {courseModules.map((module, index) => (
                        <div key={index} className='space-y-2'>
                            <h4 className='font-semibold'>{module.title}</h4>
                            <ul className='list-none space-y-1 pl-2'>
                                {module.lessons.map(lesson => (
                                    <li key={lesson} className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <CheckCircle className='h-4 w-4 text-primary' />
                                        {lesson}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
