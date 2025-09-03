

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, MessageCircle, AlertTriangle, DollarSign, Gem, CalendarDays } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { patients } from '@/lib/mock-data';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { add, format, parseISO, addDays, nextMonday, nextWednesday, nextFriday, nextTuesday, nextThursday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';

export default function NewAppointmentPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isWhatsAppLocked, setIsWhatsAppLocked] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [frequency, setFrequency] = useState('once');
  const [weeks, setWeeks] = useState(4);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [upcomingDates, setUpcomingDates] = useState<Date[]>([]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser && ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(currentUser.email!)) {
            setIsWhatsAppLocked(false);
        } else {
            setIsWhatsAppLocked(true);
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!startDate || frequency === 'once') {
        setUpcomingDates([]);
        return;
    }

    const dates: Date[] = [];
    let currentDate = startDate;
    const sessionDays: ((date: Date) => Date)[] = [];

    switch(frequency) {
        case 'twice-weekly':
            sessionDays.push(nextMonday, nextWednesday);
            break;
        case 'thrice-weekly':
            sessionDays.push(nextMonday, nextWednesday, nextFriday);
            break;
        case 'five-times-weekly':
            sessionDays.push(nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday);
            break;
    }

    if(sessionDays.length > 0) {
        for(let w = 0; w < weeks; w++) {
            // Find the first applicable session day for the week
            let weekBaseDate = add(currentDate, { weeks: w });
            
            // Adjust to the start of the week for consistent logic if needed
            // For simplicity, we'll just advance from the current date.

            for(const nextDayFn of sessionDays) {
                // Ensure we start looking from the beginning of the current week for each day type.
                let sessionDate = nextDayFn(add(startDate, { weeks: w, days: -1 })); // go back one to include start date if it's a Monday etc.
                if (sessionDate <= add(startDate, { weeks: w-1 })) { // ensure it's in the correct week
                  sessionDate = nextDayFn(add(startDate, { weeks: w }));
                }

                if (dates.length < (weeks * sessionDays.length)) {
                  dates.push(sessionDate);
                }
            }
        }
    }
    
    // Sort and take the correct number of sessions
    const sortedDates = dates.sort((a,b) => a.getTime() - b.getTime());
    const finalDates = Array.from(new Set(sortedDates.map(d=>d.toISOString().split('T')[0]))) // unique dates
                         .slice(0, weeks * sessionDays.length)
                         .map(d => parseISO(d));

    setUpcomingDates(finalDates);

  }, [startDate, frequency, weeks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
        setIsLoading(false);
        let toastDescription = 'La nueva cita ha sido agendada.';
        if (sendEmail && sendWhatsApp) {
            toastDescription += ` Se enviará una notificación por Email y WhatsApp.`
        } else if (sendEmail) {
            toastDescription += ` Se enviará una notificación por Email.`
        } else if(sendWhatsApp) {
            toastDescription += ` Se enviará una notificación por WhatsApp.`
        }

        toast({
            title: 'Cita Creada',
            description: toastDescription,
        });
        router.push('/agenda');
    }, 1500)
  };

  const notificationScheduleMessage = useMemo(() => {
    if (!appointmentTime) return '';
    const hour = parseInt(appointmentTime.split(':')[0]);

    if (hour >= 8 && hour < 13) {
      return "Se enviarán 2 recordatorios: uno el día anterior a las 17:00 y otro el día de la cita a las 08:00.";
    }
    if (hour >= 13) {
      return "Se enviará un recordatorio el día de la cita entre las 08:00 y las 11:00.";
    }
    return '';
  }, [appointmentTime]);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Cita</CardTitle>
          <CardDescription>
            Agende una nueva sesión para un paciente.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
            
            <div className="space-y-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select required>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                        {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Fecha de Inicio</Label>
                    <Input id="date" type="date" required onChange={e => setStartDate(parseISO(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input id="time" type="time" required value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="frequency">Frecuencia</Label>
                    <Select onValueChange={setFrequency} defaultValue="once">
                        <SelectTrigger id="frequency">
                            <SelectValue placeholder="Seleccionar frecuencia" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="once">Una vez</SelectItem>
                            <SelectItem value="twice-weekly">Dos veces por semana</SelectItem>
                            <SelectItem value="thrice-weekly">Tres veces por semana</SelectItem>
                            <SelectItem value="five-times-weekly">Cinco veces por semana</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 {frequency !== 'once' && (
                    <div className="space-y-2">
                        <Label htmlFor="weeks">Repetir por (semanas)</Label>
                        <Input id="weeks" type="number" value={weeks} onChange={e => setWeeks(Number(e.target.value))} />
                    </div>
                )}
            </div>
            
            {upcomingDates.length > 0 && (
                <Card className="bg-muted/50">
                    <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="h-4 w-4"/> Próximas Sesiones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {upcomingDates.map((date, index) => (
                            <Badge key={index} variant="secondary" className="justify-center">
                               {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                            </Badge>
                        ))}
                    </CardContent>
                </Card>
            )}

             <div className="space-y-2">
                <Label htmlFor="price">Precio de la Sesión (CLP)</Label>
                 <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="price" type="number" placeholder="Ej: 25000" className="pl-8" />
                 </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                    <Label className="font-medium">Notificación al Paciente</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                    Envíe un recordatorio automático al paciente sobre su próxima cita.
                </p>
                <div className="flex gap-4 pt-2">
                    <div className='flex items-center gap-2'>
                        <Checkbox id="send-email" checked={sendEmail} onCheckedChange={(checked) => setSendEmail(!!checked)} />
                        <Label htmlFor="send-email" className="flex items-center gap-2 cursor-pointer">
                            <Mail className="h-4 w-4" /> Enviar por Email
                        </Label>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Checkbox id="send-whatsapp" checked={sendWhatsApp} onCheckedChange={(checked) => setSendWhatsApp(!!checked)} disabled={isWhatsAppLocked}/>
                        <Label htmlFor="send-whatsapp" className="flex items-center gap-2" data-disabled={isWhatsAppLocked ? 'true' : 'false'}>
                            <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
                            {isWhatsAppLocked && (
                                <Badge variant="outline" className="text-amber-600 border-amber-500/50">
                                    <Gem className="mr-1 h-3 w-3" /> Profesional
                                </Badge>
                            )}
                        </Label>
                    </div>
                </div>
                
                 {isWhatsAppLocked && user?.email !== 'cristobalz.sanmartin@gmail.com' && (
                    <p className="text-xs text-muted-foreground">
                        Los recordatorios por WhatsApp están disponibles en el <Link href="/precios" className="underline">Plan Profesional</Link>.
                    </p>
                )}

                {(sendEmail || sendWhatsApp) && (
                    <div className='space-y-2 pt-2'>
                         <Label htmlFor="custom-message">Mensaje Personalizado (Opcional)</Label>
                         <Textarea 
                            id="custom-message" 
                            placeholder="Añada un mensaje personal a la notificación. Ej: 'Recuerda traer la libreta.'"
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                          />
                    </div>
                )}


                {notificationScheduleMessage && (sendEmail || sendWhatsApp) && (
                    <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            {notificationScheduleMessage}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
           
            <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Agendar Cita
                </Button>
            </div>
            </CardContent>
        </form>
      </Card>
    </div>
  );
}
