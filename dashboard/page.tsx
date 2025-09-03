
'use client';

import Link from 'next/link';
import {
  Activity,
  BarChart2,
  FileText,
  Plus,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { patients } from '@/lib/mock-data';
import { AiActivityGenerator } from '@/components/dashboard/ai-activity-generator';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ProfileSetupDialog } from '@/components/dashboard/profile-setup-dialog';
import Image from 'next/image';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from "@/lib/firebase";
import { FreeTrialDialog } from '@/components/dashboard/free-trial-dialog';
import { InteractiveGuide } from '@/components/layout/interactive-guide';


export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showFreeTrial, setShowFreeTrial] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        // Set trial start date on first login after registration
        const isCreator = ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(currentUser.email!);
        if (!localStorage.getItem('trialStartDate') && !isCreator) {
          localStorage.setItem('trialStartDate', new Date().toISOString());
        }
         // Show profile setup after tutorial is completed via HelpAssistant
        const tutorialCompleted = localStorage.getItem('tutorialCompleted');
        if (tutorialCompleted && !localStorage.getItem('profileSetupCompleted')) {
          setShowProfileSetup(true);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);


  const handleProfileSetupClose = () => {
    setShowProfileSetup(false);
    const isCreator = user && ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(user.email!);
    if (!isCreator) {
        setShowFreeTrial(true);
    }
     if (typeof window !== 'undefined') {
        localStorage.setItem('profileSetupCompleted', 'true');
    }
  }

  const welcomeMessage = user?.displayName ? `¡Bienvenido, ${user.displayName.split(' ')[0]}!` : '¡Bienvenido!';

  return (
    <>
      <ProfileSetupDialog isOpen={showProfileSetup} onClose={handleProfileSetupClose} />
      <FreeTrialDialog isOpen={showFreeTrial} onClose={() => setShowFreeTrial(false)} />
      <div className="flex flex-col gap-8">
        <Card className="bg-gradient-to-r from-primary/80 via-primary to-accent text-primary-foreground overflow-hidden">
            <div className="flex items-center justify-between p-6 relative">
                <div className="space-y-2 z-10">
                    <CardTitle className="text-3xl" data-tour-id="step-1">{welcomeMessage}</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Estos han sido los avances de la semana.</CardDescription>
                    <div className='pt-4 space-y-2'>
                        <Progress value={75} className="bg-primary-foreground/30 [&>div]:bg-primary-foreground" />
                        <p className='text-sm text-primary-foreground/90'>75% de los objetivos semanales completados.</p>
                    </div>
                </div>
            </div>
        </Card>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card data-tour-id="pacientes-table">
              <CardHeader>
                <CardTitle>Gestión de Pacientes</CardTitle>
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar pacientes..." className="pl-10" />
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/pacientes/nuevo">
                      <Plus className="mr-2 h-4 w-4" /> Nuevo Paciente
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead className="hidden sm:table-cell">Progreso</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={patient.avatarUrl}
                                data-ai-hint="profile picture"
                              />
                              <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.age} años
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{patient.diagnoses.join(', ')}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-secondary rounded-full">
                              <div
                                className="h-2 bg-primary rounded-full"
                                style={{ width: `${patient.progress[patient.progress.length - 1].score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{patient.progress[patient.progress.length - 1].score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/pacientes/${patient.id}`}>Ver</Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                               <Link href={`/pacientes/${patient.id}/editar`}>Editar</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <AiActivityGenerator />
          </div>
        </div>
      </div>
    </>
  );
}
