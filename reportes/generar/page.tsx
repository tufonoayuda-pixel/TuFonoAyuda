
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileDown } from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { patients } from '@/lib/mock-data';
import { DatePickerWithRange } from '@/components/reportes/date-range-picker';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import type { Patient } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function GenerateReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [observations, setObservations] = useState('');

  const generatePDF = (patient: Patient) => {
    const doc = new jsPDF();
    const professionalName = "Dr. Cristóbal";
    const registryNumber = "123456";

    // Add logo if available and enabled
    const showLogoInReports = JSON.parse(localStorage.getItem('showLogoInReports') || 'true');
    const logoDataUri = localStorage.getItem('professionalLogo');
    if (showLogoInReports && logoDataUri) {
        try {
            const img = new Image();
            img.src = logoDataUri;
            const logoWidth = 30; 
            const logoHeight = 15;
            doc.addImage(img, 'PNG', doc.internal.pageSize.getWidth() - 14 - logoWidth, 15, logoWidth, logoHeight);
        } catch(e) {
            console.error("Error adding logo to PDF:", e);
        }
    }


    // Header
    doc.setFontSize(18);
    doc.text(`Informe de Avance: ${patient.name}`, 14, 22);

    // Patient Info
    doc.setFontSize(12);
    doc.text(`Paciente: ${patient.name}`, 14, 32);
    doc.text(`Edad: ${patient.age} años`, 14, 38);
    doc.text(`Diagnóstico: ${patient.diagnosis}`, 14, 44);
    doc.text(`Fecha de Generación: ${format(new Date(), 'dd/MM/yyyy')}`, 14, 50);

    // Session Records
    doc.setFontSize(14);
    doc.text('Registros de Sesiones', 14, 65);
    
    let yPos = 72;
    doc.setFontSize(10);
    patient.progress.forEach(entry => {
        if(yPos > 250) { // New page check before adding content
            doc.addPage();
            yPos = 22;
        }
        const date = format(new Date(entry.date), 'dd MMMM yyyy', { locale: es });
        doc.text(`${date} - Puntaje: ${entry.score}%`, 16, yPos);
        const notesLines = doc.splitTextToSize(`Notas: ${entry.notes}`, 170);
        doc.text(notesLines, 16, yPos + 5);
        yPos += notesLines.length * 5 + 8;
    });

    // Additional Observations
    if (observations) {
        if(yPos > 240) { 
            doc.addPage();
            yPos = 22;
        }
        doc.setFontSize(14);
        doc.text('Observaciones Adicionales', 14, yPos);
        yPos += 7;
        doc.setFontSize(10);
        const obsLines = doc.splitTextToSize(observations, 180);
        doc.text(obsLines, 16, yPos);
    }
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.height;
        const footerY = pageHeight - 35; 
        doc.setLineWidth(0.5);
        doc.line(70, footerY + 5, 140, footerY + 5); // Signature line
        doc.setFontSize(10);
        doc.text("Firma del Profesional (Fonoaudiólogo)", 105, footerY + 12, {align: 'center'});
        doc.text(professionalName, 105, footerY + 18, {align: 'center'});
        doc.text(`Registro Superintendencia de Salud: ${registryNumber}`, 105, footerY + 24, {align: 'center'});
    }


    doc.save(`informe_avance_${patient.name.replace(/ /g, '_')}.pdf`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
        toast({
            title: 'Error',
            description: 'Por favor, seleccione un paciente.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);

    const patient = patients.find(p => p.id === selectedPatientId);

    setTimeout(() => {
        setIsLoading(false);
        if (patient) {
            toast({
                title: 'Informe de Avance Generado',
                description: 'El informe se está descargando.',
            });
            generatePDF(patient);
        } else {
            toast({
                title: 'Error',
                description: 'No se pudo encontrar al paciente seleccionado.',
                variant: 'destructive',
            });
        }
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Generar Informe de Avance</CardTitle>
          <CardDescription>
            Seleccione el paciente y el rango de fechas para generar un informe.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
            
            <div className="space-y-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select required value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                        {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
              <Label>Rango de Fechas</Label>
              <DatePickerWithRange />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones Adicionales</Label>
              <Textarea 
                id="observaciones"
                placeholder="Añada cualquier observación o nota adicional para incluir en el informe..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>
           
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <FileDown className="mr-2 h-4 w-4" />
                    Generar y Descargar
                </Button>
            </div>
            </CardContent>
        </form>
      </Card>
    </div>
  );
}
