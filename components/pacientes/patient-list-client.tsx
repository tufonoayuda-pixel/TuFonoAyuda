

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, Trash2, History, Video, Mic, Ear, MessageSquare, Brain, Smile, BookOpen, GraduationCap, Puzzle, Loader2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Patient } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const formatDateSafe = (dateStr: string | undefined): string => {
  if (!dateStr || typeof dateStr !== 'string') return 'N/A';
  
  const date = parseISO(dateStr);
  if (isValid(date)) {
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  }

  return 'Fecha inválida';
};

const iconMap: { [key: string]: React.ReactElement } = {
    Mic: <Mic className="h-4 w-4" />,
    Ear: <Ear className="h-4 w-4" />,
    MessageSquare: <MessageSquare className="h-4 w-4" />,
    Brain: <Brain className="h-4 w-4" />,
    Smile: <Smile className="h-4 w-4" />,
    BookOpen: <BookOpen className="h-4 w-4" />,
    GraduationCap: <GraduationCap className="h-4 w-4" />,
    Puzzle: <Puzzle className="h-4 w-4" />,
};

function PatientActions({ patient, onDelete, onVideoCall, isVideoLocked }: { patient: Patient, onDelete: (id: string) => void, onVideoCall: () => void, isVideoLocked: boolean }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const videoCallItem = (
     <DropdownMenuItem onClick={() => {
        onVideoCall();
        setIsMenuOpen(false);
      }}
      disabled={isVideoLocked}
      >
        <Video className="mr-2 h-4 w-4" />
        Iniciar Videollamada
      </DropdownMenuItem>
  );

  return (
    <>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al paciente y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(patient.id)}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/pacientes/${patient.id}`}>Ver Detalles</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/pacientes/${patient.id}/editar`}>Editar</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/pacientes/${patient.id}/historial`}>
              <History className="mr-2 h-4 w-4" />
              Historial
            </Link>
          </DropdownMenuItem>
          
          {isVideoLocked ? (
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className='w-full'>{videoCallItem}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Disponible en el Plan Profesional.</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
          ) : (
            videoCallItem
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive focus:bg-destructive/10" 
            onSelect={(e) => {
                e.preventDefault();
                setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}


export function PatientListClient() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [isVideoLocked, setIsVideoLocked] = useState(true);
    const [user, setUser] = useState<User | null>(null);

     useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const isCreator = ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(currentUser.email!);
                setIsVideoLocked(!isCreator);

                const q = query(collection(db, `users/${currentUser.uid}/patients`));
                const unsubscribePatients = onSnapshot(q, 
                    (snapshot) => {
                        const patientsData: Patient[] = [];
                        snapshot.forEach((doc) => {
                            patientsData.push({ id: doc.id, ...doc.data() } as Patient);
                        });
                        setPatients(patientsData);
                        setIsLoading(false);
                    },
                    (error) => {
                        console.error("Error fetching patients:", error);
                        toast({ title: 'Error', description: 'No se pudieron cargar los pacientes.', variant: 'destructive'});
                        setIsLoading(false);
                    }
                );
                return () => unsubscribePatients();
            } else {
                setPatients([]);
                setIsLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [toast]);

    const handleDelete = async (patientId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/patients`, patientId));
            toast({
                title: "Paciente Eliminado",
                description: "El paciente ha sido eliminado de la base de datos.",
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error deleting patient: ", error);
            toast({ title: 'Error', description: 'No se pudo eliminar al paciente.', variant: 'destructive'});
        }
    }

    const handleVideoCall = () => {
      window.open('https://meet.new', '_blank');
      toast({
        title: "Iniciando Videollamada",
        description: "Se está abriendo una nueva pestaña de Google Meet."
      });
    }

  const formattedPatients = patients.map((p) => ({
    ...p,
    formattedLastSession: formatDateSafe(p.lastSession),
  }));

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pacientes</CardTitle>
        <CardDescription>
          Gestione sus pacientes y vea su progreso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
            <div className="text-center py-10">
                <p className="text-muted-foreground">No tiene pacientes registrados.</p>
                <Button asChild className="mt-4">
                    <Link href="/pacientes/nuevo">Agregar primer paciente</Link>
                </Button>
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Avatar</span>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead className="hidden md:table-cell">Edad</TableHead>
                <TableHead className="hidden md:table-cell">
                    Última Sesión
                </TableHead>
                <TableHead>
                    <span className="sr-only">Acciones</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {formattedPatients.map((patient) => (
                <TableRow key={patient.id}>
                    <TableCell className="hidden sm:table-cell">
                    <Image
                        alt={`${patient.name}'s avatar`}
                        className="aspect-square rounded-full object-cover"
                        height="64"
                        src={patient.avatarUrl}
                        width="64"
                        data-ai-hint="profile picture"
                    />
                    </TableCell>
                    <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        {patient.icon && iconMap[patient.icon]}
                        <Link
                        href={`/pacientes/${patient.id}`}
                        className="hover:underline"
                        >
                        {patient.name}
                        </Link>
                    </div>
                    </TableCell>
                    <TableCell>
                    <Badge variant="outline">{patient.diagnoses && patient.diagnoses[0]}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    {patient.age} años
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    {patient.formattedLastSession}
                    </TableCell>
                    <TableCell>
                    <PatientActions patient={patient} onDelete={handleDelete} onVideoCall={handleVideoCall} isVideoLocked={isVideoLocked} />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
