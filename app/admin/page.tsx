
'use client';

import { BarChart as BarChartIcon, Users, MessageSquare, LineChart, Reply, GraduationCap, Sparkles, FileText, CheckCircle, Power, UserCheck, UserX, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, BarChart } from 'recharts';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { AdvisoryRequest, UserAccount } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

const initialFeedback = [
    { id: 1, type: 'Sugerencia', user: 'Valentina R.', content: 'Me encantaría poder personalizar los colores de la agenda.', date: '2024-07-28', status: 'Pendiente' },
    { id: 2, type: 'Error', user: 'Matías S.', content: 'El cálculo del TEPROSIF a veces no muestra el resultado.', date: '2024-07-27', status: 'Pendiente' },
    { id: 3, type: 'Recomendación', user: 'Carolina N.', content: 'Podrían agregar un módulo para teleconsulta directamente en la app.', date: '2024-07-26', status: 'Pendiente' },
    { id: 4, type: 'Sugerencia', user: 'Javier M.', content: 'Sería útil poder exportar el historial de un paciente a un excel.', date: '2024-07-25', status: 'Pendiente' },
];

function ReplyDialog({ feedbackItem, isOpen, onClose, onReplySent }: { feedbackItem: any, isOpen: boolean, onClose: () => void, onReplySent: (id: number | string, response: string) => void }) {
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            onReplySent(feedbackItem.id, replyMessage);
            toast({
                title: 'Respuesta Enviada',
                description: `Tu respuesta ha sido enviada a ${feedbackItem.user || feedbackItem.name}.`
            });
            onClose();
            setReplyMessage('');
        }, 1000);
    }, [feedbackItem, replyMessage, onClose, onReplySent, toast]);

    if (!feedbackItem) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Responder a {feedbackItem.user || feedbackItem.name}</DialogTitle>
                    <DialogDescription>Estás respondiendo al comentario: "{feedbackItem.content || feedbackItem.message}"</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="py-4">
                        <Label htmlFor="reply-message">Tu Respuesta</Label>
                        <Textarea id="reply-message" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Escribe tu respuesta aquí..." rows={5} required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isSending}>
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Respuesta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AdminPage() {
    const [isClient, setIsClient] = useState(false);
    const [feedbackData, setFeedbackData] = useState(initialFeedback);
    const [advisoryRequests, setAdvisoryRequests] = useState<AdvisoryRequest[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [errorLoadingUsers, setErrorLoadingUsers] = useState<string | null>(null);

    const { toast } = useToast();

     useEffect(() => {
        setIsClient(true);
        
        const fetchUsers = async () => {
            // Wait for auth to initialize
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setIsLoadingUsers(true);
                    setErrorLoadingUsers(null);
                    try {
                        const functions = getFunctions(getApp());
                        const listUsersCallable = httpsCallable(functions, 'listUsers');
                        const result = await listUsersCallable();
                        
                        const fetchedUsers = result.data as UserAccount[];
                        
                        const formattedUsers = fetchedUsers.map(u => ({
                            ...u,
                            lastLogin: u.lastLogin ? format(parseISO(u.lastLogin), "dd MMM yyyy, HH:mm", { locale: es }) : 'Nunca',
                        }));

                        setUsers(formattedUsers);
                    } catch (error: any) {
                        console.error("Error al llamar a la Cloud Function:", error);
                        setErrorLoadingUsers(`Error: ${error.message || 'No se pudieron cargar los usuarios'}. Asegúrate de tener permisos de administrador y de haber desplegado la Cloud Function como se indica en la guía.`);
                        setUsers([]);
                    } finally {
                        setIsLoadingUsers(false);
                    }
                } else {
                    // Handle case where user is not logged in or auth is still loading
                    setErrorLoadingUsers('Autenticación requerida para cargar usuarios.');
                    setIsLoadingUsers(false);
                }
            });

            return () => unsubscribe(); // Cleanup auth listener
        };

        fetchUsers();

        const storedRequests = localStorage.getItem('advisoryRequests');
        if (storedRequests) {
            setAdvisoryRequests(JSON.parse(storedRequests));
        }
    }, []);

    const handlePlanChange = (userId: string, newPlan: UserAccount['plan']) => {
        setUsers(users.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
    }

    const handleStatusChange = (userId: string, newStatus: boolean) => {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus ? 'Activo' : 'Inactivo' } : u));
    }
    
    const handleSendWelcomeEmail = (user: UserAccount) => {
        const subject = "¡Bienvenido/a a TuFonoAyuda!";
        const body = `¡Hola, ${user.name}!\n\nTe damos la más cordial bienvenida a TuFonoAyuda, la plataforma diseñada para potenciar tu práctica fonoaudiológica.\n\nEstamos muy contentos de tenerte con nosotros. Para ayudarte a comenzar, te recomendamos explorar la guía interactiva que encontrarás en el menú lateral.\n\nSi tienes cualquier duda, no dudes en contactarnos.\n\n¡Mucho éxito!\n\nAtentamente,\nEl equipo de TuFonoAyuda`;
        
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(user.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.open(gmailUrl, '_blank');

        toast({
            title: "Correo de Bienvenida Listo",
            description: `Se ha abierto Gmail para enviar el email a ${user.name}.`
        });
    };

    const analyticsData = useMemo(() => ({
        websiteVisits: 1253,
        activeUsers: users.filter(u => u.status === 'Activo').length,
        newSuggestions: feedbackData.filter(f => f.status === 'Pendiente').length,
        newAdvisoryRequests: advisoryRequests.filter(r => r.status === 'Pendiente').length,
        aiActivitiesGenerated: 842,
        aiReportsAnalyzed: 123,
    }), [feedbackData, advisoryRequests, users]);

    const handleReplyClick = useCallback((item: any) => {
        setSelectedItem(item);
        setIsReplyDialogOpen(true);
    }, []);
    
    const handleReplySent = useCallback((itemId: number | string, response: string) => {
        if (typeof itemId === 'number') {
             setFeedbackData(prev => prev.map(item => item.id === itemId ? { ...item, status: 'Respondido' } : item));
        } else {
             setAdvisoryRequests(prev => {
                const updated = prev.map(item => 
                    item.id === itemId ? { ...item, status: 'Respondido', response: response } : item
                );
                if (typeof window !== 'undefined') {
                    localStorage.setItem('advisoryRequests', JSON.stringify(updated));
                }
                return updated;
             });
        }
    }, []);
    
    const closeReplyDialog = useCallback(() => {
        setIsReplyDialogOpen(false);
        setSelectedItem(null);
    }, []);

    if (!isClient) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    <p className="text-muted-foreground">
                        Métricas de la aplicación y gestión de usuarios.
                    </p>
                </header>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.length}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Actividades IA Generadas</CardTitle>
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analyticsData.aiActivitiesGenerated}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Informes IA Analizados</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analyticsData.aiReportsAnalyzed}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Visitas a la Web (30d)</CardTitle>
                            <LineChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analyticsData.websiteVisits.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Feedback Pendiente</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{analyticsData.newSuggestions}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Asesorías Pendientes</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{analyticsData.newAdvisoryRequests}</div>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Gestión de Usuarios</CardTitle>
                        <CardDescription>Administre los planes y el estado de los usuarios.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingUsers ? (
                            <div className="flex justify-center items-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : errorLoadingUsers ? (
                            <Alert variant="destructive">
                                <AlertTitle>Error al Cargar</AlertTitle>
                                <AlertDescription>{errorLoadingUsers}</AlertDescription>
                            </Alert>
                        ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead className="hidden sm:table-cell">Último Login</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className="text-center">Estado</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatarUrl} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{user.lastLogin}</TableCell>
                                        <TableCell>
                                            <Select value={user.plan} onValueChange={(value) => handlePlanChange(user.id, value as UserAccount['plan'])}>
                                                <SelectTrigger className="w-[130px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Estudiante">Estudiante</SelectItem>
                                                    <SelectItem value="Profesional">Profesional</SelectItem>
                                                    <SelectItem value="Experto">Experto</SelectItem>
                                                    <SelectItem value="Admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={user.status === 'Activo' ? 'secondary' : 'destructive'} className={user.status === 'Activo' ? 'text-green-700 bg-green-100 border-green-200' : ''}>
                                                {user.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="flex justify-center items-center gap-2">
                                            <Switch
                                                checked={user.status === 'Activo'}
                                                onCheckedChange={(checked) => handleStatusChange(user.id, checked)}
                                                aria-label={`Activar/Desactivar a ${user.name}`}
                                            />
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleSendWelcomeEmail(user)}>
                                                <Mail className="h-4 w-4" />
                                                <span className="sr-only">Enviar Email</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                             </TableBody>
                        </Table>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bandeja de Feedback</CardTitle>
                            <CardDescription>Últimos comentarios de los usuarios.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead className="text-right">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedbackData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Badge variant={item.type === 'Error' ? 'destructive' : 'secondary'}>{item.type}</Badge>
                                        </TableCell>
                                        <TableCell>{item.user}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleReplyClick(item)} disabled={item.status === 'Respondido'}>
                                                {item.status === 'Respondido' ? <CheckCircle className="mr-2 h-4 w-4"/> : <Reply className="mr-2 h-4 w-4"/>}
                                                {item.status}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Solicitudes de Asesoría</CardTitle>
                            <CardDescription>Nuevas solicitudes de mentoría profesional.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead className="text-right">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {advisoryRequests.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleReplyClick(item)} disabled={item.status === 'Respondido'}>
                                                {item.status === 'Respondido' ? <CheckCircle className="mr-2 h-4 w-4"/> : <Reply className="mr-2 h-4 w-4"/>}
                                                {item.status}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                     {advisoryRequests.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                                No hay nuevas solicitudes.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ReplyDialog 
                feedbackItem={selectedItem} 
                isOpen={isReplyDialogOpen} 
                onClose={closeReplyDialog}
                onReplySent={handleReplySent}
            />
        </>
    );
}
