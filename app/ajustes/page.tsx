
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, User, Calendar, Bell, KeyRound, Database, Palette, CheckCircle, Archive, ShieldCheck, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import JSZip from 'jszip';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { patients } from '@/lib/mock-data';
import type { Document, Patient } from '@/lib/types';
import { updateProfile, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from "@/lib/firebase";
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';


const themes = [
    { name: 'Menta Fresca', value: 'theme-default', colors: ['bg-[#95c9c7]', 'bg-[#e4f1f1]', 'bg-[#374c4b]'], font: 'font-body' },
    { name: 'Océano Profundo', value: 'theme-ocean', colors: ['bg-[#4a90e2]', 'bg-[#d8e7f8]', 'bg-[#1e3a5f]'], font: 'font-roboto' },
    { name: 'Amanecer Coral', value: 'theme-coral', colors: ['bg-[#ff8a65]', 'bg-[#ffebe0]', 'bg-[#6d3a28]'], font: 'font-lato' },
    { name: 'Bosque Sereno', value: 'theme-forest', colors: ['bg-[#66bb6a]', 'bg-[#e3f3e4]', 'bg-[#2a4c2b]'], font: 'font-open-sans' },
    { name: 'Chispa Eléctrica', value: 'theme-pokemon', colors: ['bg-[#ffcb05]', 'bg-[#f1faee]', 'bg-[#e63946]'], font: 'font-anton' },
    { name: 'Atardecer Synthwave', value: 'theme-synthwave', colors: ['bg-[#ff33a8]', 'bg-[#0a0f2c]', 'bg-[#00e5ff]'], font: 'font-orbitron' },
    { name: 'Código Esmeralda', value: 'theme-matrix', colors: ['bg-[#00ff41]', 'bg-[#0d0d0d]', 'bg-[#008f11]'], font: 'font-orbitron' },
    { name: 'Clínico Azul', value: 'theme-clinical', colors: ['bg-[#0077b6]', 'bg-[#e7f5ff]', 'bg-[#03045e]'], font: 'font-open-sans' },
    { name: 'Día Místico', value: 'theme-mystic', colors: ['bg-[#c5aeff]', 'bg-[#fde2e4]', 'bg-[#fad2e1]'], font: 'font-yanone' },
    { name: 'Valkyrie (80s)', value: 'theme-valkyrie', colors: ['bg-[#e63946]', 'bg-[#f1faee]', 'bg-[#1d3557]'], font: 'font-orbitron' },
    { name: 'Prisma Lunar (90s)', value: 'theme-prisma', colors: ['bg-[#ffafcc]', 'bg-[#a2d2ff]', 'bg-[#bde0fe]'], font: 'font-yanone' },
    { name: 'Morphosis (90s)', value: 'theme-morphosis', colors: ['bg-[#e63946]', 'bg-[#0077b6]', 'bg-[#ffc300]'], font: 'font-anton' },
];

function ThemeCard({ theme, currentTheme, setTheme }: { theme: typeof themes[0], currentTheme: string | undefined, setTheme: (theme: string) => void }) {
    const isActive = currentTheme === theme.value;
    return (
        <Card onClick={() => setTheme(theme.value)} className={cn("cursor-pointer transition-all", isActive ? "ring-2 ring-primary" : "hover:shadow-md")}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    {theme.name}
                    {isActive && <CheckCircle className="h-5 w-5 text-primary" />}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-2">
                    {theme.colors.map(color => (
                        <div key={color} className={`w-8 h-8 rounded-full ${color}`} />
                    ))}
                </div>
                <p className={`mt-2 text-lg text-muted-foreground ${theme.font}`}>Aa Bb Cc</p>
            </CardContent>
        </Card>
    )
}

const generatePatientPdf = (patient: Patient): Blob => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(`Ficha de Paciente: ${patient.name}`, 14, 22);

  doc.setFontSize(12);
  doc.text(`Fecha de Exportación: ${new Date().toLocaleDateString('es-CL')}`, 14, 30);
  
  (doc as any).autoTable({
    startY: 40,
    head: [['Campo', 'Información']],
    body: [
      ['ID', patient.id],
      ['Nombre Completo', patient.name],
      ['Edad', `${patient.age} años`],
      ['Diagnóstico', patient.diagnoses.join(', ')],
      ['Email', patient.contact.email],
      ['Teléfono', patient.contact.phone],
      ['Última Sesión', patient.lastSession],
      ['Perfil', patient.profile],
    ],
    theme: 'grid',
    styles: { cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185] }
  });

  if (patient.progress && patient.progress.length > 0) {
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Fecha', 'Puntaje (%)', 'Notas de Sesión']],
      body: patient.progress.map(p => [p.date, p.score, p.notes]),
      theme: 'striped',
    });
  }

  return doc.output('blob');
};


export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [signatureFileName, setSignatureFileName] = useState('');
  const [profilePicFileName, setProfilePicFileName] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('https://placehold.co/80x80.png');
  const [logoUrl, setLogoUrl] = useState('https://placehold.co/100x40.png');
  const [fullName, setFullName] = useState('');
  const [showLogoInReports, setShowLogoInReports] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  
  const [appointmentTypes, setAppointmentTypes] = useState([
    { id: '1', name: 'Evaluación Inicial', color: '#3b82f6' },
    { id: '2', name: 'Sesión de Terapia', color: '#10b981' },
    { id: '3', name: 'Consulta de Seguimiento', color: '#f97316' },
    { id: '4', name: 'Reunión con Apoderados', color: '#8b5cf6' },
  ]);
  const [newTypeName, setNewTypeName] = useState('');
  const { theme, setTheme } = useTheme();
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setFullName(user.displayName || '');
            setProfilePicUrl(user.photoURL || 'https://placehold.co/80x80.png');
        }
    });

    if(typeof window !== 'undefined'){
      const savedLogo = localStorage.getItem('professionalLogo');
      if (savedLogo) {
          setLogoUrl(savedLogo);
      }

      const savedShowLogoPref = localStorage.getItem('showLogoInReports');
      if (savedShowLogoPref !== null) {
          setShowLogoInReports(JSON.parse(savedShowLogoPref));
      }

      const saved2FAPref = localStorage.getItem('2fa_enabled');
      if (saved2FAPref !== null) {
          setIsTwoFactorEnabled(JSON.parse(saved2FAPref));
      }
      
      const savedSoundPref = localStorage.getItem('notification_sound_enabled');
      if (savedSoundPref !== null) {
          setIsSoundEnabled(JSON.parse(savedSoundPref));
      }
    }


    return () => unsubscribe();
  }, []);

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setProfilePicFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            setProfilePicUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setLogoFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setLogoUrl(result);
            if(typeof window !== 'undefined'){
                localStorage.setItem('professionalLogo', result); 
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleShowLogoToggle = (checked: boolean) => {
    setShowLogoInReports(checked);
    if(typeof window !== 'undefined'){
        localStorage.setItem('showLogoInReports', JSON.stringify(checked));
    }
  }

  const handle2faToggle = (checked: boolean) => {
    setIsTwoFactorEnabled(checked);
    if(typeof window !== 'undefined'){
        localStorage.setItem('2fa_enabled', JSON.stringify(checked));
    }
    toast({
        title: `Autenticación de Dos Pasos ${checked ? 'Habilitada' : 'Deshabilitada'}`,
        description: `La seguridad de su cuenta ha sido actualizada.`,
    });
  }
  
  const handleSoundToggle = (checked: boolean) => {
    setIsSoundEnabled(checked);
    if(typeof window !== 'undefined'){
        localStorage.setItem('notification_sound_enabled', JSON.stringify(checked));
    }
    toast({
        title: `Sonido de notificaciones ${checked ? 'habilitado' : 'deshabilitado'}.`,
    });
  }

  const handleAddAppointmentType = () => {
    if (newTypeName.trim()) {
        const newType = {
            id: (appointmentTypes.length + 1).toString(),
            name: newTypeName.trim(),
            color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
        };
        setAppointmentTypes([...appointmentTypes, newType]);
        setNewTypeName('');
        toast({
            title: 'Tipo de Cita Añadido',
            description: `Se ha añadido "${newType.name}".`
        });
    }
  };

  const handleDeleteAppointmentType = (id: string) => {
    setAppointmentTypes(appointmentTypes.filter(type => type.id !== id));
     toast({
        title: 'Tipo de Cita Eliminado',
        variant: 'destructive'
    });
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (auth.currentUser) {
      updateProfile(auth.currentUser, {
        displayName: fullName,
        photoURL: profilePicUrl,
      })
        .then(() => {
          toast({
            title: 'Perfil Actualizado',
            description: 'Tus datos han sido guardados.',
          });
        })
        .catch((error) => {
          toast({
            title: 'Error',
            description: 'No se pudo actualizar tu perfil. ' + error.message,
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        toast({
            title: 'Error',
            description: 'No has iniciado sesión.',
            variant: 'destructive'
        })
        setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent, section: string) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Ajustes Guardados',
        description: `Tus ajustes de ${section} han sido actualizados.`,
      });
    }, 1500);
  };

  const handleExportAllData = async () => {
    setIsExporting(true);
    toast({
        title: "Iniciando Exportación",
        description: "Estamos preparando tus datos. Esto puede tardar unos minutos...",
    });

    try {
        const zip = new JSZip();
        const professionalFolder = zip.folder("user_cristobal");

        if (professionalFolder) {
            for (const patient of patients) {
                const patientFolder = professionalFolder.folder(`paciente_${patient.id}_${patient.name.replace(/ /g, '_')}`);
                if(patientFolder){
                    // Add patient data as a PDF file
                    const patientPdfBlob = generatePatientPdf(patient);
                    patientFolder.file("datos_paciente.pdf", patientPdfBlob);
                    
                    // Add documents
                    const documentsFolder = patientFolder.folder("documentos_adjuntos");
                    if(documentsFolder){
                       // This is a simulation. A real implementation would fetch document files.
                       documentsFolder.file("informe_externo_ejemplo.pdf", "Contenido simulado de un PDF de informe externo.");
                    }
                }
            }
        }

        const zipContent = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipContent);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exportacion_fonoayuda.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Exportación Completa",
            description: "Tu archivo ZIP ha sido descargado.",
        });

    } catch (error) {
        console.error("Error during data export:", error);
        toast({
            title: "Error de Exportación",
            description: "No se pudieron exportar los datos. Inténtelo de nuevo.",
            variant: "destructive",
        });
    } finally {
        setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    setIsLoading(true);
    // Simulate API call to delete account
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Cuenta Eliminada",
        description: "Tu cuenta y todos tus datos han sido eliminados permanentemente.",
      });
      // In a real app, you would also sign the user out from Firebase
      router.push('/');
    }, 2000);
  };

  return (
    <div className="space-y-6" data-tour-id="ajustes-page">
      <header>
        <h1 className="text-3xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu perfil, disponibilidad y datos de la aplicación.
        </p>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
           <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Calendar className="mr-2 h-4 w-4" />
            Disponibilidad
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="account">
            <KeyRound className="mr-2 h-4 w-4" />
            Cuenta y Datos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil Profesional</CardTitle>
              <CardDescription>
                Esta información aparecerá en los informes y en tu perfil público.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileSubmit}>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-8 items-start">
                    <div className="space-y-2">
                        <Label>Foto de Perfil</Label>
                        <div className="flex items-center gap-4">
                            <Image
                            src={profilePicUrl}
                            alt="Foto de perfil"
                            width={80}
                            height={80}
                            className="rounded-full"
                            data-ai-hint='profile image'
                            />
                            <Input id="profile-picture" type="file" accept="image/png, image/jpeg" className="max-w-xs" onChange={handleProfilePicChange} />
                        </div>
                        {profilePicFileName && <p className='text-sm text-muted-foreground mt-2'>Archivo: {profilePicFileName}</p>}
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Logo Profesional</Label>
                            <div className="flex items-center gap-4">
                                <Image
                                src={logoUrl}
                                alt="Logo profesional"
                                width={100}
                                height={40}
                                className="rounded-md object-contain border p-1"
                                data-ai-hint='company logo'
                                />
                                <Input id="logo" type="file" accept="image/png, image/jpeg" className="max-w-xs" onChange={handleLogoChange} />
                            </div>
                            {logoFileName && <p className='text-sm text-muted-foreground mt-2'>Archivo: {logoFileName}</p>}
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch id="show-logo" checked={showLogoInReports} onCheckedChange={handleShowLogoToggle} />
                            <Label htmlFor="show-logo">Incluir logo en informes</Label>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full-name">Nombre Completo</Label>
                  <Input id="full-name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                   <Select defaultValue="male">
                      <SelectTrigger id="gender" className="w-[180px]">
                          <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Femenino</SelectItem>
                          <SelectItem value="other">Prefiero no decirlo</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="health-registry">Registro Superintendencia de Salud</Label>
                  <Input id="health-registry" placeholder="Ej: 123456" defaultValue="123456" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" type="tel" placeholder="+56912345678" defaultValue="+56912345678" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="digital-signature">Firma Digital (Imagen)</Label>
                  <Input id="digital-signature" type="file" accept="image/png" className="max-w-xs" onChange={(e) => setSignatureFileName(e.target.files?.[0]?.name || '')} />
                  {signatureFileName && <p className='text-sm text-muted-foreground mt-2'>Archivo seleccionado: {signatureFileName}</p>}
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Perfil
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Tema de la Aplicación</CardTitle>
                <CardDescription>
                Seleccione un tema para personalizar la interfaz de la aplicación. La barra lateral se ajustará automáticamente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map(t => (
                        <ThemeCard key={t.value} theme={t} currentTheme={theme} setTheme={setTheme}/>
                    ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad</CardTitle>
              <CardDescription>
                Configura tus horarios de trabajo y tipos de citas para el calendario.
              </CardDescription>
            </CardHeader>
             <form onSubmit={(e) => handleSubmit(e, 'Disponibilidad')}>
                <CardContent className="space-y-6">
                    <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-medium">Días de la semana</h3>
                        <div className="flex flex-wrap gap-4">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                                <div key={day} className="flex items-center space-x-2">
                                    <Switch id={`switch-${day.toLowerCase()}`} defaultChecked={day !== 'Sábado' && day !== 'Domingo'} />
                                    <Label htmlFor={`switch-${day.toLowerCase()}`}>{day}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-medium">Horario Laboral</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start-time">Hora de Apertura</Label>
                                <Input id="start-time" type="time" defaultValue="09:00" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-time">Hora de Cierre</Label>
                                <Input id="end-time" type="time" defaultValue="18:00" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="break-start">Inicio Colación</Label>
                                <Input id="break-start" type="time" defaultValue="13:00" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="break-end">Fin Colación</Label>
                                <Input id="break-end" type="time" defaultValue="14:00" />
                            </div>
                        </div>
                    </div>
                     <div className="space-y-4 rounded-md border p-4">
                        <h3 className="font-medium">Citas</h3>
                         <div className="space-y-2">
                            <Label htmlFor="appointment-duration">Duración de la Cita (minutos)</Label>
                            <Select defaultValue="45">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">30 minutos</SelectItem>
                                    <SelectItem value="45">45 minutos</SelectItem>
                                    <SelectItem value="60">60 minutos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label>Tipos de Cita</Label>
                             <div className="space-y-2">
                                {appointmentTypes.map(type => (
                                    <div key={type.id} className="flex items-center justify-between p-2 bg-secondary/20 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={type.color} onChange={(e) => {
                                                const newColor = e.target.value;
                                                setAppointmentTypes(currentTypes => currentTypes.map(t => t.id === type.id ? {...t, color: newColor } : t));
                                            }} className="w-6 h-6 p-0 border-none bg-transparent rounded-full cursor-pointer" />
                                            <span>{type.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteAppointmentType(type.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                             </div>
                             <div className="flex items-center gap-2 pt-2">
                                 <Input placeholder="Nuevo tipo de cita" value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)}/>
                                 <Button type="button" onClick={handleAddAppointmentType}>Añadir</Button>
                             </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Disponibilidad
                        </Button>
                    </div>
                </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
            <Card>
                 <CardHeader>
                    <CardTitle>Plantillas y Sonidos de Notificación</CardTitle>
                    <CardDescription>Personalice los mensajes de recordatorio y las alertas sonoras.</CardDescription>
                </CardHeader>
                <form onSubmit={(e) => handleSubmit(e, 'Notificaciones')}>
                    <CardContent className="space-y-6">
                        <div className="space-y-4 rounded-md border p-4">
                            <h3 className="font-medium">Preferencias de Sonido</h3>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="sound-switch">Habilitar sonido de notificación</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Reproducirá un sonido agradable al recibir una alerta de cita.
                                    </p>
                                </div>
                                <Switch
                                    id="sound-switch"
                                    checked={isSoundEnabled}
                                    onCheckedChange={handleSoundToggle}
                                />
                            </div>
                        </div>
                        <div className="space-y-4 rounded-md border p-4">
                            <h3 className="font-medium">Recordatorio por Email</h3>
                            <div className="space-y-2">
                                <Label htmlFor="email-subject">Asunto del Email</Label>
                                <Input id="email-subject" defaultValue="Recordatorio de su cita fonoaudiológica" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email-body">Cuerpo del Email</Label>
                                <Textarea id="email-body" rows={8} defaultValue={`Hola [Nombre Paciente],\n\nLe recordamos su próxima cita con el fonoaudiólogo Dr. Cristóbal.\n\nDetalles de la Cita:\n- Fecha: [Fecha Cita]\n- Hora: [Hora Cita]\n\nPor favor, sea puntual. Si necesita reagendar, contáctenos con al menos 24 horas de antelación.\n\n¡Que tenga un excelente día!`} />
                            </div>
                        </div>
                         <div className="space-y-4 rounded-md border p-4">
                            <h3 className="font-medium">Recordatorio por WhatsApp</h3>
                             <div className="space-y-2">
                                <Label htmlFor="whatsapp-body">Mensaje de WhatsApp</Label>
                                <Textarea id="whatsapp-body" rows={4} defaultValue={`Hola [Nombre Paciente]! Le recordamos su cita fonoaudiológica con el Dr. Cristóbal para el día [Fecha Cita] a las [Hora Cita]. Por favor, confirme su asistencia. ¡Saludos!`} />
                            </div>
                        </div>
                         <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Plantillas
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </TabsContent>
        
        <TabsContent value="account">
            <Card>
                 <CardHeader>
                    <CardTitle>Cuenta y Datos</CardTitle>
                    <CardDescription>Gestiona tu información de inicio de sesión, seguridad y exportación de datos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={(e) => handleSubmit(e, 'Cuenta')} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input id="email" type="email" defaultValue={auth.currentUser?.email || ''} readOnly/>
                        </div>
                        <div className="space-y-4 rounded-md border p-4">
                             <h3 className="font-medium flex items-center gap-2"><ShieldCheck/> Autenticación de Dos Pasos (2FA)</h3>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="two-factor-auth">Habilitar 2FA</Label>
                                <Switch
                                    id="two-factor-auth"
                                    checked={isTwoFactorEnabled}
                                    onCheckedChange={handle2faToggle}
                                />
                            </div>
                            {isTwoFactorEnabled && (
                                <div className="space-y-4 pt-2">
                                    <Alert>
                                        <AlertDescription>
                                            Se enviará un código a su teléfono cada vez que inicie sesión desde un nuevo dispositivo.
                                        </AlertDescription>
                                    </Alert>
                                    <div className="flex items-end gap-2">
                                        <div className="flex-grow space-y-2">
                                            <Label htmlFor="phone-2fa">Número de Teléfono</Label>
                                            <Input id="phone-2fa" type="tel" placeholder="+56912345678" defaultValue="+56912345678" />
                                        </div>
                                        <Button variant="outline">Verificar</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                         <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios de Cuenta
                            </Button>
                        </div>
                    </form>
                    <Separator />
                     <div className="space-y-4 rounded-md border p-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-medium">Exportar Todos mis Datos</h3>
                                <p className="text-sm text-muted-foreground">Descarga un archivo ZIP con todos los datos de tus pacientes, informes y documentos.</p>
                            </div>
                             <Button onClick={handleExportAllData} variant="secondary" disabled={isExporting}>
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
                                Exportar Datos (ZIP)
                            </Button>
                        </div>
                    </div>
                    <Separator />
                     <div className="space-y-4 rounded-md border border-destructive/50 p-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                             <div>
                                <h3 className="font-medium text-destructive">Eliminar Cuenta</h3>
                                <p className="text-sm text-destructive/80">Esta acción es irreversible y eliminará todos tus datos de forma permanente.</p>
                            </div>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" type="button">Eliminar Mi Cuenta</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente
                                    su cuenta y todos sus datos de nuestros servidores.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sí, eliminar mi cuenta
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
