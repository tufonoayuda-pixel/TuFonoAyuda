
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, FileText, CheckCircle, XCircle, AlertCircle, BarChart, LineChart as LineChartIcon, DollarSign, Users, Check, Ban, Printer, Loader2, Gem, Lock, BookOpen } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Session } from '@/lib/types';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
}

const statusConfig = {
    'Completada': { icon: <CheckCircle className='h-4 w-4 text-green-500' />, variant: 'secondary'},
    'Programada': { icon: <AlertCircle className='h-4 w-4 text-yellow-500' />, variant: 'outline'},
    'Ausente': { icon: <XCircle className='h-4 w-4 text-red-500' />, variant: 'destructive'},
    'Cancelada': { icon: <Ban className='h-4 w-4 text-muted-foreground' />, variant: 'outline'}
}


export default function FinancesPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [isLocked, setIsLocked] = useState(true); // Subscription lock
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isCreator = ['cristobalz.sanmartin@gmail.com', 'tufonoayuda@gmail.com'].includes(currentUser.email!);
        setIsLocked(!isCreator);

        // Firestore real-time listener for sessions
        const q = query(collection(db, 'users', currentUser.uid, 'sessions'));
        const unsubscribeSessions = onSnapshot(q, (snapshot) => {
          const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];
          setAllSessions(sessionsData);
        });
        return () => unsubscribeSessions(); // Cleanup listener
      } else {
        setAllSessions([]);
        setIsLocked(true);
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);


  const filteredSessions = useMemo(() => {
    return allSessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate.getFullYear() === year && sessionDate.getMonth() === month;
    });
  }, [year, month, allSessions]);

  const summary = useMemo(() => {
    const total = filteredSessions.reduce((acc, s) => acc + (s.price || 0), 0);
    const paid = filteredSessions.filter(s => s.paymentStatus === 'Pagado').reduce((acc, s) => acc + (s.price || 0), 0);
    const unpaid = total - paid;
    const totalAppointments = filteredSessions.length;
    const attended = filteredSessions.filter(s => s.status === 'Completada').length;
    const missed = filteredSessions.filter(s => s.status === 'Ausente').length;
    return { total, paid, unpaid, totalAppointments, attended, missed };
  }, [filteredSessions]);

  const chartDataByDay = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      Ingresos: 0,
    }));
    filteredSessions.forEach(s => {
      const day = toZonedTime(new Date(s.date), 'UTC').getDate();
      if (s.paymentStatus === 'Pagado' && s.price) {
        data[day - 1].Ingresos += s.price;
      }
    });
    return data;
  }, [filteredSessions, year, month]);

  const chartDataByType = useMemo(() => {
    const data: {[key: string]: number} = {};
    filteredSessions.forEach(s => {
        if(s.paymentStatus === 'Pagado' && s.price) {
            if(!data[s.type]) data[s.type] = 0;
            data[s.type] += s.price;
        }
    });
    return Object.entries(data).map(([name, value]) => ({ name, Ingresos: value }));
  }, [filteredSessions]);

  const generatePDF = () => {
    if (!user) return;
    setIsLoading(true);
    const doc = new jsPDF();
    const professionalName = user.displayName || "Dr. Cristóbal";
    const registryNumber = "123456";
    const monthName = new Date(year, month).toLocaleString('es-CL', { month: 'long' });

    // Header
    doc.setFontSize(18);
    doc.text(`Informe Financiero Mensual`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Mes: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`, 14, 30);
    doc.text(`Profesional: ${professionalName}`, 14, 36);
    doc.text(`Registro S.S.: ${registryNumber}`, 14, 42);
    
    // Summary
    const summaryData = [
        ['Ingreso Total', formatCurrency(summary.total)],
        ['Total Pagado', formatCurrency(summary.paid)],
        ['Por Cobrar', formatCurrency(summary.unpaid)],
        ['Citas Totales', summary.totalAppointments.toString()],
        ['Citas Asistidas', summary.attended.toString()],
        ['Citas Ausentes', summary.missed.toString()]
    ];

    (doc as any).autoTable({
        startY: 50,
        head: [['Concepto', 'Valor']],
        body: summaryData,
        theme: 'grid',
    });

    // Transactions
    const tableData = filteredSessions.map(s => [
        s.patientName,
        format(toZonedTime(new Date(s.date), 'UTC'), 'dd-MM-yyyy'),
        s.type,
        formatCurrency(s.price || 0),
        s.paymentStatus || 'N/A',
        s.status
    ]);

    (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Paciente', 'Fecha', 'Tipo', 'Precio', 'Estado Pago', 'Asistencia']],
        body: tableData,
        theme: 'striped',
    });
    
    // Signature
    const finalY = (doc as any).lastAutoTable.finalY || 180;
    const signatureY = finalY > 250 ? 270 : finalY + 20;
    
    doc.line(70, signatureY, 140, signatureY);
    doc.text("Firma del Profesional", 105, signatureY + 8, { align: 'center'});
    doc.text(professionalName, 105, signatureY + 14, { align: 'center'});
    doc.text(`Registro: ${registryNumber}`, 105, signatureY + 20, { align: 'center'});

    doc.save(`informe_financiero_${monthName}_${year}.pdf`);
    setIsLoading(false);
    toast({
        title: "PDF Generado",
        description: "El informe financiero se ha descargado."
    })
  }

  const handleGenerateInvoice = (session: any) => {
    toast({
      title: "Generando Boleta",
      description: `Se está preparando la boleta para ${session.patientName}.`,
    });
    // Placeholder for actual SII integration
    setTimeout(() => {
        window.open('https://www.sii.cl/', '_blank');
    }, 1000);
  };
  
  const handleAttendanceChange = async (sessionId: string, newStatus: 'Completada' | 'Ausente') => {
    if(!user) return;
    const sessionRef = doc(db, 'users', user.uid, 'sessions', sessionId);
    try {
        await updateDoc(sessionRef, { status: newStatus });
        toast({
            title: "Asistencia Actualizada",
            description: `La sesión ha sido marcada como "${newStatus}".`
        });
    } catch (error) {
        console.error("Error updating session status: ", error);
        toast({ title: 'Error', description: 'No se pudo actualizar el estado de la sesión.', variant: 'destructive'});
    }
  }


  return (
    <div className="space-y-6 print:space-y-4">
       <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
            <h1 className="text-3xl font-bold">Gestión Financiera</h1>
            <p className="text-muted-foreground">
            Revise sus ingresos, pagos pendientes y estadísticas de la consulta.
            </p>
        </div>
        <div className="flex gap-2">
            <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({length: 12}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>{new Date(0, i).toLocaleString('es-CL', { month: 'long' })}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
             <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                    {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={generatePDF} disabled={isLoading || isLocked}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                <span className="sr-only">Imprimir Resumen</span>
            </Button>
        </div>
      </header>
       
       {isLocked && (
            <Alert className="border-amber-500/50 text-amber-600 dark:text-amber-400 [&>svg]:text-amber-500">
                <Gem className="h-4 w-4" />
                <AlertTitle>Funcionalidad Premium</AlertTitle>
                <AlertDescription>
                    El módulo de finanzas está disponible en el Plan Profesional y superiores.
                    <Button variant="link" asChild className="p-0 h-auto ml-2 text-amber-600 dark:text-amber-400">
                        <Link href="/precios">Mejorar Plan</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 print:grid-cols-4">
        <Card className={isLocked ? 'relative overflow-hidden' : ''}>
             {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"><Lock className="h-8 w-8 text-muted-foreground"/></div>}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingreso Total (CLP)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
            </CardContent>
        </Card>
        <Card className={isLocked ? 'relative overflow-hidden' : ''}>
             {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"><Lock className="h-8 w-8 text-muted-foreground"/></div>}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pagado (CLP)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.paid)}</div>
            </CardContent>
        </Card>
        <Card className={isLocked ? 'relative overflow-hidden' : ''}>
             {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"><Lock className="h-8 w-8 text-muted-foreground"/></div>}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Por Cobrar (CLP)</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.unpaid)}</div>
            </CardContent>
        </Card>
         <Card className={isLocked ? 'relative overflow-hidden' : ''}>
             {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center"><Lock className="h-8 w-8 text-muted-foreground"/></div>}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resumen Citas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-sm">Total: {summary.totalAppointments} | Asistidas: {summary.attended} | Ausentes: {summary.missed}</div>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
        <Card className={isLocked ? 'relative overflow-hidden' : ''}>
            {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>}
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5"/>Ingresos por Tipo de Cita (CLP)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart layout="vertical" data={chartDataByType} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis type="number" tickFormatter={(value) => `$${value/1000}k`} />
                <YAxis dataKey="name" type="category" width={110} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="Ingresos" barSize={20} fill="hsl(var(--primary))" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className={isLocked ? 'relative overflow-hidden' : ''}>
            {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>}
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5"/>Rendimiento Financiero Mensual (CLP)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartDataByDay} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Ingresos" stroke="hsl(var(--primary))" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className={isLocked ? 'relative overflow-hidden' : ''}>
        {isLocked && <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10"></div>}
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Listado de los últimos pagos y cobros pendientes del mes seleccionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado Pago</TableHead>
                <TableHead>Asistencia</TableHead>
                <TableHead className="text-right print:hidden">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map(session => (
                <TableRow key={session.id}>
                  <TableCell>{session.patientName}</TableCell>
                  <TableCell>{format(toZonedTime(new Date(session.date), 'UTC'), 'dd-MM-yyyy')}</TableCell>
                  <TableCell>{formatCurrency(session.price || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={session.paymentStatus === 'Pagado' ? 'secondary' : 'destructive'} className='flex items-center gap-2 w-fit'>
                        {session.paymentStatus === 'Pagado' ? <CheckCircle className='h-4 w-4' /> : <AlertCircle className='h-4 w-4' />}
                        {session.paymentStatus}
                    </Badge>
                  </TableCell>
                   <TableCell>
                     <Badge variant={statusConfig[session.status].variant} className='flex items-center gap-2 w-fit'>
                        {statusConfig[session.status].icon}
                        {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2 print:hidden">
                    {session.status === 'Programada' && (
                        <>
                            <Button variant="outline" size="sm" className="bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleAttendanceChange(session.id, 'Completada')}>
                                <Check className="mr-2 h-4 w-4" /> Asistió
                            </Button>
                            <Button variant="outline" size="sm" className="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleAttendanceChange(session.id, 'Ausente')}>
                                <XCircle className="mr-2 h-4 w-4" /> Ausente
                            </Button>
                        </>
                    )}
                     <Button variant="outline" size="sm" onClick={() => handleGenerateInvoice(session)}>
                        <FileText className='mr-2 h-4 w-4'/>
                        Boleta
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSessions.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">No hay transacciones para el período seleccionado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5"/>Arancel Fonasa 2025 (Modalidad Libre Elección)</CardTitle>
                <CardDescription>Valores de referencia para prestaciones de Fonoaudiología. Esto es útil para emitir boletas y para informar a pacientes sobre los montos de reembolso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div>
                    <h3 className="font-semibold mb-2">Arancel Reformulado 2025</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Denominación</TableHead>
                                <TableHead className="text-right">Nivel 1</TableHead>
                                <TableHead className="text-right">Nivel 2</TableHead>
                                <TableHead className="text-right">Nivel 3</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow><TableCell>1303010</TableCell><TableCell>Evaluación Integral de Fonoaudiólogo</TableCell><TableCell className="text-right">{formatCurrency(12170)}</TableCell><TableCell className="text-right">{formatCurrency(15820)}</TableCell><TableCell className="text-right">{formatCurrency(19470)}</TableCell></TableRow>
                            <TableRow><TableCell>1303011</TableCell><TableCell>Rehabilitación Integral de Fonoaudiólogo</TableCell><TableCell className="text-right">{formatCurrency(5630)}</TableCell><TableCell className="text-right">{formatCurrency(7320)}</TableCell><TableCell className="text-right">{formatCurrency(9010)}</TableCell></TableRow>
                            <TableRow><TableCell colSpan={5} className="font-medium bg-secondary">Telerehabilitación</TableCell></TableRow>
                            <TableRow><TableCell>1308010</TableCell><TableCell>Telerehabilitación: Evaluación Integral</TableCell><TableCell className="text-right">{formatCurrency(10350)}</TableCell><TableCell className="text-right">{formatCurrency(13460)}</TableCell><TableCell className="text-right">{formatCurrency(16560)}</TableCell></TableRow>
                            <TableRow><TableCell>1308011</TableCell><TableCell>Telerehabilitación: Rehabilitación Integral</TableCell><TableCell className="text-right">{formatCurrency(4780)}</TableCell><TableCell className="text-right">{formatCurrency(6210)}</TableCell><TableCell className="text-right">{formatCurrency(7650)}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
