
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookMarked,
  CalendarDays,
  Users,
  Home,
  Brain,
  FileText,
  Calculator,
  Settings,
  MessageSquarePlus,
  Loader2,
  Waves,
  Gem,
  ClipboardEdit,
  DollarSign,
  BarChart,
  ChevronDown,
  GraduationCap,
  School,
  BrainCircuit,
  ClipboardCheck,
  Shield,
  Ear
} from 'lucide-react';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { HelpAssistant } from './help-assistant';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const menuItems = [
  { href: '/dashboard', label: 'Menú', icon: Home, tourId: 'sidebar-menu-dashboard' },
  { href: '/pacientes', label: 'Pacientes', icon: Users, tourId: 'sidebar-menu-pacientes' },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays, tourId: 'sidebar-menu-agenda' },
  { href: '/intervencion', label: 'Intervención IA', icon: ClipboardEdit, tourId: 'sidebar-menu-intervencion' },
  {
    label: 'Evaluación y Reportes',
    icon: FileText,
    tourId: 'sidebar-menu-evaluaciones',
    subItems: [
        { href: '/evaluaciones', label: 'Herramientas', icon: FileText},
        { href: '/evaluaciones/subir', label: 'Analizar Informe', icon: Brain},
        { href: '/reportes/generar', label: 'Generar Reporte', icon: BarChart},
        { href: '/reportes/derivacion', label: 'Generar Derivación', icon: Users},
        { href: '/otoscopia', label: 'OtoBox', icon: Ear },
    ]
  },
  { href: '/referencias', label: 'Referencias', icon: BookMarked, tourId: 'sidebar-menu-referencias' },
  { href: '/finanzas', label: 'Finanzas', icon: DollarSign, tourId: 'sidebar-menu-finanzas' },
  { href: '/laboratorio-voz', label: 'Laboratorio de Voz', icon: Waves, tourId: 'sidebar-menu-laboratorio' },
  { href: '/calcutelator', label: 'CalcuTELator', icon: Calculator, tourId: 'sidebar-menu-calcutelator' },
  { href: '/neuronimina', label: 'NeuroNomina', icon: ClipboardCheck, tourId: 'sidebar-menu-neuronimina' },
  { href: '/academia', label: 'Academia', icon: School, tourId: 'sidebar-menu-academia' },
  { href: '/asesorias', label: 'Solicitud de Asesoría Profesional', icon: GraduationCap, tourId: 'sidebar-menu-asesorias' },
  { href: '/ajustes', label: 'Ajustes', icon: Settings, tourId: 'sidebar-menu-ajustes' },
  { href: '/suscripcion', label: 'Suscripción', icon: Gem, tourId: 'sidebar-menu-suscripcion' },
];

const creatorMenuItems = [
    { href: '/admin', label: 'Panel de Admin', icon: Shield, tourId: 'sidebar-menu-admin'},
]

const Logo = () => {
    return (
        <div className="flex items-center gap-2 px-2 py-1">
            <Brain className="h-8 w-8 text-primary" />
            <div className="flex items-baseline overflow-hidden transition-all duration-300 group-data-[state=expanded]:w-[150px] w-0">
                <span className="font-bold text-xl text-sidebar-foreground">TuFonoAyuda</span>
            </div>
        </div>
    )
};

export function AppSidebar() {
  const pathname = usePathname();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [openCollapsible, setOpenCollapsible] = useState('');


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    if (href === '/suscripcion') return pathname === href;
    return pathname.startsWith(href) && href !== '/';
  };

   useEffect(() => {
    const activeItem = menuItems.find(item => item.subItems?.some(sub => isActive(sub.href)));
    if (activeItem) {
      setOpenCollapsible(activeItem.label);
    }
  }, [pathname]);
  
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingFeedback(true);
    setTimeout(() => {
        setIsSendingFeedback(false);
        setIsFeedbackOpen(false);
        toast({
            title: '¡Gracias por tu opinión!',
            description: 'Hemos recibido tus comentarios y los tendremos en cuenta para futuras mejoras.',
        })
    }, 1500)
  }

  const isCreator = user && ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(user.email!);

  return (
    <>
    <Sidebar side="left" variant="sidebar" className="print:hidden">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {authLoading ? (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-sidebar-foreground" />
            </div>
        ) : (
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label} data-tour-id={item.tourId}>
              {item.subItems ? (
                <Collapsible open={openCollapsible === item.label} onOpenChange={(isOpen) => setOpenCollapsible(isOpen ? item.label : '')}>
                  <CollapsibleTrigger asChild>
                     <Button
                        variant="ghost"
                        className="justify-between w-full h-8 px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground group-data-[state=expanded]:justify-start"
                        data-active={item.subItems.some(sub => isActive(sub.href))}
                      >
                      <div className="flex items-center gap-2">
                          <item.icon className="size-5" />
                          <span className='group-data-[state=expanded]:opacity-100 opacity-0 transition-opacity duration-200'>{item.label}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=expanded]:opacity-100 opacity-0 ml-auto data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton href={subItem.href} isActive={isActive(subItem.href)}>
                                    <subItem.icon className="size-4" />
                                    <span>{subItem.label}</span>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                   </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href!)}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <Link href={item.href!} passHref>
                    <item.icon className="size-5" />
                    <span className="group-data-[state=expanded]:opacity-100 opacity-0 transition-opacity duration-200">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
            {isCreator && (
                <>
                <SidebarSeparator />
                {creatorMenuItems.map((item) => (
                    <SidebarMenuItem key={item.label} data-tour-id={item.tourId}>
                         <SidebarMenuButton
                            asChild
                            isActive={isActive(item.href!)}
                            tooltip={item.label}
                            className="justify-start"
                            >
                            <Link href={item.href!} passHref>
                                <item.icon className="size-5" />
                                <span className="group-data-[state=expanded]:opacity-100 opacity-0 transition-opacity duration-200">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                </>
            )}
        </SidebarMenu>
        )}
      </SidebarContent>
      <SidebarFooter>
         <HelpAssistant />
        <div className="p-2 group-data-[state=expanded]:block hidden space-y-3">
            <Button className="w-full" variant="secondary" onClick={() => setIsFeedbackOpen(true)}>
                <MessageSquarePlus className="mr-2 h-4 w-4" />
                Sugerencias
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
    <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Buzón de Sugerencias</DialogTitle>
                <DialogDescription>
                    Tu opinión es muy importante. Ayúdanos a mejorar la plataforma.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFeedbackSubmit}>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                         <Label htmlFor="feedback-type">Tipo de comentario</Label>
                         <Select required>
                            <SelectTrigger id="feedback-type">
                                <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="suggestion">Sugerencia</SelectItem>
                                <SelectItem value="recommendation">Recomendación</SelectItem>
                                <SelectItem value="complaint">Reclamo o Error</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="feedback-message">Mensaje</Label>
                        <Textarea id="feedback-message" required placeholder="Describe tu sugerencia o problema aquí..." rows={5}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsFeedbackOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isSendingFeedback}>
                         {isSendingFeedback && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Enviar Comentario
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
    </>
  );
}
