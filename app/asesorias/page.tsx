
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, User, Phone, CheckCircle, Reply, GraduationCap, Clock, Video, HelpCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { AdvisoryRequest } from '@/lib/types';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/reportes/date-picker';
import { cn } from '@/lib/utils';
import { addDays } from 'date-fns';

const professionals = [
    {
        id: 'cristobal_san_martin',
        name: 'Flgo. Cristóbal San Martín',
        areas: [
            { name: 'Deglución', subareas: ['Trastornos de la Deglución en Adultos', 'Trastornos de la Deglución Pediátrico'] },
            { name: 'Voz', subareas: ['Disfonías Orgánicas', 'Disfonías Funcionales', 'Disfonías Orgánico-Funcionales', 'Voz Cantada', 'Voz Cantada-Hablada'] },
            { name: 'Motricidad Orofacial', subareas: ['Desorden Miofuncional Orofacial', 'Parálisis Facial'] },
            { name: 'Habla', subareas: ['Trastornos de los Sonidos del Habla', 'Disartria'] },
            { name: 'Lenguaje', subareas: ['Afasia (especificar cual en los comentarios)', 'TDL /TL'] },
            { name: 'Cognición', subareas: ['Trastorno Cognitivo-Comunicativo'] },
        ],
        options: [
            { name: 'Análisis de Casos' },
            { name: 'Orientaciones en la Planificación Terapéutica', suboptions: ['Área de Voz', 'Área de Deglución', 'Área de Motricidad Orofacial', 'Área de Lenguaje'] },
            { name: 'Simulación de Defensa de Casos Clínicos', suboptions: ['Enfocado a Infanto-Juvenil', 'Enfocado en Adultos', 'Al azar'] },
        ],
        details: [
            { icon: <Clock className="h-4 w-4 text-primary" />, text: 'Asesorías de 1 hora de duración' },
            { icon: <Video className="h-4 w-4 text-primary" />, text: 'Modalidad Online (mediante plataforma Meet)' },
            { icon: <HelpCircle className="h-4 w-4 text-primary" />, text: 'Contacto con el asistente de Ayuda para resolución de dudas' },
        ]
    }
];

// Mock de disponibilidad del profesional
const professionalAvailability = [
    { date: addDays(new Date(), 2), times: ['10:00', '11:00', '15:00'] },
    { date: addDays(new Date(), 4), times: ['09:00', '10:00', '12:00', '16:00'] },
    { date: addDays(new Date(), 7), times: ['14:00', '15:00', '16:00'] },
    { date: addDays(new Date(), 8), times: ['09:00', '11:00'] },
];

const availableDates = professionalAvailability.map(d => d.date);


export default function AsesoriasPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', area: '', option: '', message: '' });
    const [suggestedDate, setSuggestedDate] = useState<Date | undefined>();
    const [suggestedTime, setSuggestedTime] = useState<string>('');
    const [myRequests, setMyRequests] = useState<AdvisoryRequest[]>([]);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('cristobal_san_martin');

    const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId);

    const availableTimesForSelectedDate = useMemo(() => {
        if (!suggestedDate) return [];
        const availabilityForDay = professionalAvailability.find(
            (d) => format(d.date, 'yyyy-MM-dd') === format(suggestedDate, 'yyyy-MM-dd')
        );
        return availabilityForDay ? availabilityForDay.times : [];
    }, [suggestedDate]);

    useEffect(() => {
        if(typeof window !== 'undefined') {
            const storedRequests = localStorage.getItem('advisoryRequests');
            if (storedRequests) {
                setMyRequests(JSON.parse(storedRequests));
            }
        }
    }, []);
    
     useEffect(() => {
        // Reset time when date changes
        setSuggestedTime('');
    }, [suggestedDate]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            const newRequest: AdvisoryRequest = {
                id: `adv-${Date.now()}`,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: `Área: ${formData.area}. Opción: ${formData.option}. Fecha Sugerida: ${suggestedDate ? format(suggestedDate, 'PPP') : 'N/A'} a las ${suggestedTime}. Mensaje: ${formData.message}`,
                date: format(new Date(), 'yyyy-MM-dd'),
                status: 'Pendiente'
            };
            const updatedRequests = [...myRequests, newRequest];
            setMyRequests(updatedRequests);
            if (typeof window !== 'undefined') {
                localStorage.setItem('advisoryRequests', JSON.stringify(updatedRequests));
            }

            toast({
                title: "Solicitud Enviada",
                description: "Gracias por tu interés. Me pondré en contacto contigo pronto para agendar la asesoría."
            });
            setFormData({ name: '', email: '', phone: '', area: '', option: '', message: '' });
            setSuggestedDate(undefined);
            setSelectedProfessionalId('cristobal_san_martin');
        }, 1500);
    }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Asesorías Profesionales</h1>
        <p className="text-muted-foreground">
          Potencia tus habilidades con asesorías personalizadas para estudiantes de último año y recién egresados.
        </p>
      </header>

      <Card>
          <CardHeader>
              <CardTitle>Temario y Opciones de Asesoría</CardTitle>
              <CardDescription>
                  Seleccione un profesional para ver las áreas de especialización y las opciones de mentoría disponibles.
              </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="professional-select">Profesional</Label>
                <Select onValueChange={setSelectedProfessionalId} value={selectedProfessionalId}>
                    <SelectTrigger id="professional-select">
                        <SelectValue placeholder="Elegir un profesional..." />
                    </SelectTrigger>
                    <SelectContent>
                        {professionals.map(prof => (
                            <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {selectedProfessional && (
                 <Card className="bg-secondary/30 mt-4">
                    <CardContent className="p-4 space-y-4">
                         <div className='p-4 border-b'>
                             <ul className="space-y-2 text-sm">
                                {selectedProfessional.details.map((detail, index) => (
                                    <li key={index} className="flex items-center gap-2">{detail.icon}{detail.text}</li>
                                ))}
                            </ul>
                        </div>
                        <Accordion type="multiple" className="w-full">
                            <AccordionItem value="areas">
                                <AccordionTrigger className='font-semibold'>Áreas de Asesoría</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc list-inside pl-4 text-muted-foreground space-y-2">
                                        {selectedProfessional.areas.map(area => (
                                            <li key={area.name}>
                                                <strong>{area.name}:</strong> {area.subareas.join(', ')}.
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="options">
                                <AccordionTrigger className='font-semibold'>Opciones de Asesoría</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc list-inside pl-4 text-muted-foreground space-y-2">
                                        {selectedProfessional.options.map((opt) => (
                                            <li key={opt.name}>
                                                <strong>{opt.name}</strong>
                                                {opt.suboptions && ` (${opt.suboptions.join(', ')})`}
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            )}
          </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle>Formulario de Solicitud</CardTitle>
            <CardDescription>Completa el formulario y te contactaremos para agendar una sesión.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className='flex items-center gap-2'><User className='h-4 w-4' />Nombre Completo</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Tu nombre" required/>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className='flex items-center gap-2'><Mail className='h-4 w-4' />Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="tu.correo@email.com" required/>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className='flex items-center gap-2'><Phone className='h-4 w-4' />Teléfono</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+56912345678" required/>
              </div>
               <div className="grid sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="area">Área de Interés</Label>
                    <Select value={formData.area} onValueChange={(val) => handleInputChange('area', val)} required>
                        <SelectTrigger id="area"><SelectValue placeholder="Seleccionar área..." /></SelectTrigger>
                        <SelectContent>{professionals[0].areas.map(a => <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-1">
                    <Label htmlFor="option">Tipo de Asesoría</Label>
                    <Select value={formData.option} onValueChange={(val) => handleInputChange('option', val)} required>
                        <SelectTrigger id="option"><SelectValue placeholder="Seleccionar opción..." /></SelectTrigger>
                        <SelectContent>{professionals[0].options.map(o => <SelectItem key={o.name} value={o.name}>{o.name}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
               </div>
                <div className="space-y-4 rounded-md border p-4">
                    <h4 className='font-medium'>Fecha y Hora Sugerida para Reunión</h4>
                    <div className='flex flex-col md:flex-row gap-4'>
                        <div className='flex-1'>
                             <Label htmlFor="sugested-date">Paso 1: Seleccione un día disponible</Label>
                            <DatePicker 
                                date={suggestedDate} 
                                setDate={setSuggestedDate}
                                availableDates={availableDates}
                            />
                        </div>
                        {suggestedDate && (
                            <div className='flex-1 space-y-2'>
                                <Label>Paso 2: Seleccione una hora disponible</Label>
                                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                                    {availableTimesForSelectedDate.map(hour => (
                                        <Button
                                            key={hour}
                                            variant={suggestedTime === hour ? 'default' : 'outline'}
                                            onClick={() => setSuggestedTime(hour)}
                                            type="button"
                                        >
                                            {hour}
                                        </Button>
                                    ))}
                                    {availableTimesForSelectedDate.length === 0 && (
                                        <p className="text-sm text-muted-foreground col-span-full">No hay horas disponibles para este día.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

              <div className="space-y-1">
                <Label htmlFor="message">Mensaje Adicional</Label>
                <Textarea id="message" value={formData.message} onChange={(e) => handleInputChange('message', e.target.value)} placeholder="Especifique su caso, duda o tema a profundizar." required/>
              </div>
              <div className='flex justify-end'>
                <Button type="submit" className="w-full sm:w-auto" disabled={isLoading || !suggestedDate || !suggestedTime}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Enviar Solicitud
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

       {myRequests.length > 0 && (
          <section className="space-y-4 pt-8 border-t">
              <h2 className="text-2xl font-bold text-center">Mis Solicitudes</h2>
              <div className="space-y-4">
                  {myRequests.map(req => (
                      <Card key={req.id}>
                          <CardHeader>
                              <CardTitle className="flex justify-between items-center text-lg">
                                  <span>Solicitud del {format(new Date(req.date), 'dd/MM/yyyy')}</span>
                                  <span className={`text-sm font-medium flex items-center gap-2 ${req.status === 'Respondido' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {req.status === 'Respondido' ? <CheckCircle className="h-4 w-4"/> : <Loader2 className="h-4 w-4 animate-spin"/>}
                                    {req.status}
                                  </span>
                              </CardTitle>
                              <CardDescription>Asunto: {req.message.substring(0, 100)}...</CardDescription>
                          </CardHeader>
                          {req.response && (
                            <CardContent>
                                <div className="p-4 bg-secondary rounded-lg">
                                    <h4 className="font-semibold flex items-center gap-2"><Reply className="h-4 w-4"/> Respuesta del Administrador:</h4>
                                    <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{req.response}</p>
                                </div>
                            </CardContent>
                          )}
                      </Card>
                  ))}
              </div>
          </section>
      )}
    </div>
  );
}
