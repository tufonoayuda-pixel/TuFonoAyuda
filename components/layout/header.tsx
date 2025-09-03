
'use client';

import { Bell, FileUp, BarChart, Plus, Upload, Share2, MoreVertical, LogIn, UserPlus, Brain, Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { differenceInMinutes, isSameDay, startOfWeek, endOfWeek, parse } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { sessions as allSessions } from '@/lib/mock-data';
import { TrialExpiredDialog } from '../dashboard/trial-expired-dialog';

const playNotificationSound = () => {
    if (typeof window !== 'undefined') {
        const isSoundEnabled = JSON.parse(localStorage.getItem('notification_sound_enabled') || 'true');
        if (isSoundEnabled) {
             // Pleasant notification sound
             const audio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTSEUAAAABAAAAmGFjdXN0aWNhX2ZpbmdlcnByaW50X29mX3RoZV9vcm...",);
             audio.play().catch(e => console.error("Error playing sound:", e));
        }
    }
};

const notify = (title: string, description: string) => {
    playNotificationSound();
    // Assuming useToast is available in this scope
    // This part requires the toast function from useToast() to be passed in or available in context
};

export function Header() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [notifiedAppointments, setNotifiedAppointments] = useState<Set<string>>(new Set());
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isCreator = ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(currentUser.email!);
        if (isCreator) return; // Skip trial logic for creators

        const trialStartDate = localStorage.getItem('trialStartDate');
        if (trialStartDate) {
          const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
          const trialStart = new Date(trialStartDate).getTime();
          if (Date.now() - trialStart > sevenDaysInMillis) {
            setIsTrialExpired(true);
          }
        }
      }
    });

    // Show weekly summary on initial load
    const weeklyToastShown = sessionStorage.getItem('weeklyToastShown');
    if (!weeklyToastShown) {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      
      const upcomingSessions = allSessions.filter(session => {
        const sessionDate = parse(session.date, 'yyyy-MM-dd', new Date());
        return sessionDate >= weekStart && sessionDate <= weekEnd && session.status === 'Programada';
      });

      if (upcomingSessions.length > 0) {
        toast({
          title: 'Resumen Semanal',
          description: `Tienes ${upcomingSessions.length} cita${upcomingSessions.length > 1 ? 's' : ''} programada${upcomingSessions.length > 1 ? 's' : ''} para esta semana.`,
          duration: 10000,
        });
        sessionStorage.setItem('weeklyToastShown', 'true');
      }
    }

    // Set up interval for real-time reminders
    const interval = setInterval(() => {
        const now = new Date();
        const todaySessions = allSessions.filter(s => isSameDay(parse(s.date, 'yyyy-MM-dd', new Date()), now) && s.status === 'Programada');

        todaySessions.forEach(session => {
            const [hours, minutes] = session.time.split(':').map(Number);
            const sessionDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            const minutesToAppointment = differenceInMinutes(sessionDateTime, now);

            const checkAndNotify = (threshold: number, label: string) => {
                const notificationId = `${session.id}-${threshold}`;
                if (minutesToAppointment > (threshold - 5) && minutesToAppointment <= threshold && !notifiedAppointments.has(notificationId)) {
                    playNotificationSound();
                    toast({
                        title: 'Recordatorio de Cita',
                        description: `Tu cita con ${session.patientName} es en ${label}.`,
                        duration: 10000,
                    });
                    setNotifiedAppointments(prev => new Set(prev).add(notificationId));
                }
            };
            
            checkAndNotify(120, 'aproximadamente 2 horas');
            checkAndNotify(60, '1 hora');
            checkAndNotify(30, '30 minutos');
            checkAndNotify(10, '10 minutos');
        });

    }, 60000); // Check every minute

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [toast, notifiedAppointments]);
  
  const isLandingPage = pathname === '/';
  const isStandalonePricingPage = pathname === '/precios';


  if (isLandingPage || isStandalonePricingPage) {
    return (
        <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                    <Brain className="h-6 w-6 text-primary" />
                    <span>TuFonoAyuda</span>
                </Link>
                <nav className="hidden md:flex gap-6 items-center">
                    <Link href="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Características
                    </Link>
                    <Link href="/precios" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Precios
                    </Link>
                </nav>
                <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/registro">Registrarse</Link>
                    </Button>
                </div>
                 <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild><Link href="/#features">Características</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/precios">Precios</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href="/login"><LogIn className="mr-2 h-4 w-4"/>Iniciar Sesión</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/registro"><UserPlus className="mr-2 h-4 w-4"/>Registrarse</Link></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
            </div>
        </header>
    )
  }

  // Logged-in header
  const profileData = {
    displayName: user?.displayName || 'Dr. Cristóbal',
    photoURL: user?.photoURL || 'https://placehold.co/32x32.png'
  };

  const professionalRole = 'Fonoaudiólogo';
  const motivationalPhrase = "Cada palabra cuenta en el camino hacia la comunicación.";
  
  const playActivationSound = () => {
    // This is a short, silent WAV file to enable audio playback on all browsers on first user interaction.
    const bellSound = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAD//w==");
    bellSound.play().catch(e => console.error("Error playing sound:", e));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Sesión Cerrada',
        description: 'Has cerrado sesión exitosamente.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
      toast({
        title: 'Error',
        description: 'No se pudo cerrar la sesión. Por favor, intente de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
    {isTrialExpired && <TrialExpiredDialog isOpen={isTrialExpired} />}
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2 print:hidden">
      {!isStandalonePricingPage && <SidebarTrigger className="sm:hidden" />}
      
      <div className="ml-auto flex items-center gap-2" data-tour-id="header-quick-actions">
        
        {/* Mobile Quick Actions Dropdown */}
        <div className="md:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Acciones Rápidas</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild><Link href="/agenda/nueva-cita">Nueva Cita</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/evaluaciones/subir">Analizar Informe</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/reportes/generar">Generar Reporte</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href="/reportes/derivacion">Generar Derivación</Link></DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Desktop Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href="/agenda/nueva-cita">
                <Plus className="mr-2 h-4 w-4" />
                <span>Nueva Cita</span>
            </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1">
            <Link href="/evaluaciones/subir">
                <Upload className="mr-2 h-4 w-4" />
                <span>Analizar Informe</span>
            </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1">
                <Link href="/reportes/generar">
                    <BarChart className="h-4 w-4" />
                    <span>Reporte</span>
                </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1">
                <Link href="/reportes/derivacion">
                    <Share2 className="h-4 w-4" />
                    <span>Derivación</span>
                </Link>
            </Button>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" onClick={playActivationSound}>
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/90"></span>
              </span>
              <span className="sr-only">Notificaciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex-col items-start gap-1">
                <p className="font-medium">¡Hola, {profileData.displayName}!</p>
                <p className="text-xs text-muted-foreground">{motivationalPhrase}</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2" data-tour-id="header-user-menu">
                     <Image src={profileData.photoURL} data-ai-hint="male profile" width={32} height={32} alt={profileData.displayName} className="rounded-full" />
                     <div className="text-left hidden md:block">
                         <p className="text-sm font-medium">{profileData.displayName}</p>
                         <p className="text-xs text-muted-foreground">{professionalRole}</p>
                     </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/ajustes">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/ajustes">Configuración</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    Cerrar Sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    </>
  );
}
