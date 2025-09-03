
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Ear, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function OtoBoxLogo() {
  return (
    <div className="flex items-center justify-center gap-3">
        <div className="bg-primary/10 text-primary p-3 rounded-full">
            <Ear className="w-8 h-8"/>
        </div>
        <h1 className="text-4xl font-bold">OtoBox</h1>
    </div>
  );
}

const recentProtocols = [
    { patientId: '1', patientName: 'Juan Pérez', date: '2024-07-28', result: 'Cerumen Grado 2 O.D.' },
    { patientId: 'p2', patientName: 'Sofía Castro', date: '2024-07-26', result: 'Indemne bilateral' },
    { patientId: 'p3', patientName: 'Mateo Rojas', date: '2024-07-25', result: 'Otomicosis O.I.' },
]

export default function OtoBoxPage() {
    return (
        <div className="space-y-8">
            <Card className="bg-secondary/50 border-primary/20">
                <CardHeader className="text-center space-y-4">
                    <OtoBoxLogo />
                    <CardDescription className="text-lg max-w-2xl mx-auto">
                        Su centro de mando para la exploración otoscópica y gestión de informes de lavado de oídos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button size="lg" asChild>
                        <Link href="/otoscopia/protocolo">
                            <Plus className="mr-2 h-5 w-5" /> Iniciar Nuevo Protocolo
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                    <CardDescription>Últimos protocolos de exploración realizados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentProtocols.map(proto => (
                            <div key={proto.patientId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                                <div className="flex items-center gap-4">
                                    <FileText className="w-6 h-6 text-muted-foreground" />
                                    <div>
                                        <p className="font-semibold">{proto.patientName}</p>
                                        <p className="text-sm text-muted-foreground">Fecha: {proto.date} | Resultado: <span className="font-medium">{proto.result}</span></p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Ver Informe</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
