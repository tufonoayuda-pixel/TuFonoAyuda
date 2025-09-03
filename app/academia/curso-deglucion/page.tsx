
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Brain, CheckCircle, Clock, Construction, Download, GitBranch, Lightbulb, ListChecks, Target, TestTube, Wind, BookOpen, AlertTriangle, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';


const totalSlides = 8; // Total de diapositivas

const courseModules = [
  {
    title: 'Módulo 1: Fundamentos de la Deglución',
    lessons: [
      { name: 'Anatomía y Fisiología de la Deglución', slide: 1 },
    ],
    progress: 33,
  },
  {
    title: 'Módulo 2: Modelos y Coordinación',
    lessons: [
      { name: 'Modelo de 4 Etapas vs. Modelo de Proceso', slide: 4 },
      { name: 'Procesamiento de alimentos sólidos', slide: 6 },
      { name: 'Coordinación deglución-respiración', slide: 7 },
    ],
    progress: 0,
  },
   {
    title: 'Módulo 3: Evaluación y Patología',
    lessons: [
      { name: 'Alteraciones estructurales y funcionales', slide: 8 },
      { name: 'Conceptos de penetración y aspiración', slide: 8 },
      { name: 'Implicancias clínicas de los hallazgos', slide: 8 },
    ],
    progress: 0,
  },
];


const courseNotes = [
    { 
        slide: 1, 
        title: "Notas de la Diapositiva 1:", 
        points: [
            "Contexto: La deglución es un proceso extremadamente complejo que involucra la coordinación precisa de más de 30 músculos y nervios. Esta presentación se basa en el trabajo de Matsuo y Palmer de Johns Hopkins University.",
            "Punto clave: La deglución tiene dos funciones biológicas cruciales: 1) el paso seguro del alimento desde la cavidad oral al estómago, y 2) la protección de la vía aérea."
        ] 
    },
    { 
        slide: 2, 
        title: "Notas de la Diapositiva 2:", 
        points: [
            "Desarrollo anatómico: Es crucial entender que la anatomía cambia dramáticamente desde el nacimiento. En lactantes, la laringe está más alta, permitiendo respiración nasal simultánea con alimentación.",
            "Implicación clínica: El descenso laríngeo en desarrollo humano permite el habla pero nos hace vulnerables a la aspiración, a diferencia de otros mamíferos."
        ] 
    },
    { 
        slide: 3, 
        title: "Notas de la Diapositiva 3:", 
        points: [
            "Inervación compleja: La comprensión de la inervación es fundamental para localizar lesiones. El nervio vago inerva músculos críticos para la protección de vía aérea.",
            "Evaluación clínica: Lesiones del hipogloso afectan principalmente la movilidad lingual, mientras que lesiones del vago comprometen la protección laríngea."
        ] 
    },
    { 
        slide: 4, 
        title: "Notas de la Diapositiva 4:", 
        points: [
            "Limitaciones del modelo clásico: El modelo de 4 etapas no puede explicar el comportamiento normal durante la alimentación con sólidos, donde el bolo puede acumularse en orofaringe mientras continúa la masticación.",
            "Aplicación clínica: El Modelo de Proceso explica mejor los hallazgos videofluoroscópicos normales durante la alimentación con texturas mixtas."
        ] 
    },
    { 
        slide: 5, 
        title: "Notas de la Diapositiva 5:", 
        points: [
            "Timing crítico: La etapa faríngea ocurre en menos de 1 segundo. La elevación del paladar blando debe ocurrir simultáneamente con la llegada del bolo para prevenir regurgitación nasal.",
            "Mecanismos de protección: Múltiples mecanismos actúan coordinadamente: cierre vocal, basculación epiglótica, elevación hio-laríngea."
        ] 
    },
    { 
        slide: 6, 
        title: "Notas de la Diapositiva 6:", 
        points: [
            "Diferencia clave: Durante el procesamiento, NO hay sellado oral posterior, permitiendo que aromas lleguen a receptores nasales. Esto es normal y necesario para la experiencia sensorial completa.",
            "Variabilidad normal: La duración de acumulación en orofaringe puede ser de fracciones de segundo hasta 10 segundos en individuos normales."
        ] 
    },
    { 
        slide: 7, 
        title: "Notas de la Diapositiva 7:", 
        points: [
            "Dominancia de deglución: La deglución siempre tiene prioridad sobre la respiración. Esto es tanto por cierre físico como por supresión neural central.",
            "Implicaciones patológicas: Alteraciones en esta coordinación son comunes en pacientes con enfermedades neurológicas y aumentan significativamente el riesgo aspirativo."
        ] 
    },
    { 
        slide: 8, 
        title: "Notas de la Diapositiva 8:", 
        points: [
            "Aspiración silente: El 25-30% de pacientes con disfagia presentan aspiración silente (sin tos refleja). La higiene oral deficiente aumenta el riesgo de neumonía bacteriana.",
            "Factores determinantes: El efecto de la aspiración depende de: cantidad, profundidad, propiedades físicas y mecanismos de aclaramiento pulmonar del individuo."
        ] 
    },
];

const SlideContent = ({ slideNumber }: { slideNumber: number }) => {
    switch (slideNumber) {
        case 1:
            return (
                <div className="space-y-6">
                    <CardHeader className="text-center p-0">
                        <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight text-primary flex items-center justify-center gap-2">
                           <ListChecks className="h-10 w-10"/> Anatomía y Fisiología de la Deglución
                        </CardTitle>
                        <p className="mt-2 text-lg text-muted-foreground">Normal y Patológica</p>
                    </CardHeader>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="text-xl">📚 Contenido</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {['Anatomía de las estructuras', 'Fisiología normal', 'Modelos de deglución', 'Coordinación con respiración', 'Alteraciones patológicas', 'Protección de vía aérea'].map((item, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <span className="bg-primary/20 text-primary font-bold rounded-full h-6 w-6 text-sm flex items-center justify-center">{index + 1}</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <Alert className="bg-primary/10 border-primary/20">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-primary font-bold">Objetivo</AlertTitle>
                                <AlertDescription>
                                    Comprender los mecanismos normales y anormales de la alimentación y deglución para desarrollar programas de rehabilitación efectivos en disfagia.
                                </AlertDescription>
                            </Alert>
                             <Alert className="text-center">
                                <Brain className="h-4 w-4" />
                                <AlertTitle>Sistema Complejo</AlertTitle>
                                <AlertDescription>
                                    +30 nervios y músculos trabajando coordinadamente.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                </div>
            );
        case 2:
            return (
                <div className="space-y-6">
                    <CardHeader className="text-center p-0">
                        <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><Construction className="h-8 w-8"/>Anatomía de las Estructuras</CardTitle>
                    </CardHeader>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader><CardTitle className="text-xl">Cavidad Oral y Faringe</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Lengua: superficies oral y faríngea</li>
                                    <li>Pilares fauciales separan oral-faringe</li>
                                    <li>Músculos constrictores faríngeos</li>
                                    <li>Epiglotis: origen laríngeo</li>
                                    <li>Valéculas: espacio lengua-epiglotis</li>
                                </ul>
                            </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <Card className="bg-secondary"><CardHeader><CardTitle className="text-xl">Laringe</CardTitle></CardHeader><CardContent><p>Cuerdas vocales verdaderas y falsas, Aditus laríngeo.</p></CardContent></Card>
                            <Card className="bg-secondary"><CardHeader><CardTitle className="text-xl">Senos Piriformes</CardTitle></CardHeader><CardContent><p>Espacios laterales a la laringe.</p></CardContent></Card>
                        </div>
                    </div>
                     <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Desarrollo Anatómico</AlertTitle>
                        <AlertDescription>
                            La anatomía infantil difiere del adulto. En lactantes, la laringe está más alta, la epiglotis toca el paladar blando, manteniendo separadas la vía aérea y alimentaria.
                        </AlertDescription>
                    </Alert>
                </div>
            );
        case 3:
            return (
                 <div className="space-y-6">
                    <CardHeader className="text-center p-0">
                        <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><Brain className="h-8 w-8"/>Inervación de Músculos</CardTitle>
                    </CardHeader>
                     <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                             <CardHeader><CardTitle className="text-xl">Pares Craneales</CardTitle></CardHeader>
                             <CardContent>
                                 <ul className="list-disc list-inside space-y-2">
                                     <li><strong>V Trigémino:</strong> Músculos masticatorios</li>
                                     <li><strong>VII Facial:</strong> Músculos faciales</li>
                                     <li><strong>IX Glosofaríngeo:</strong> Estilofaríngeo</li>
                                     <li><strong>X Vago:</strong> Constrictores faríngeos</li>
                                     <li><strong>XII Hipogloso:</strong> Músculos intrínsecos linguales</li>
                                 </ul>
                             </CardContent>
                        </Card>
                        <div className="space-y-6">
                            <Card className="bg-secondary"><CardHeader><CardTitle className="text-xl">Músculos (Vago X)</CardTitle></CardHeader><CardContent><p>Elevador del velo, laríngeos intrínsecos, cricofaríngeo.</p></CardContent></Card>
                             <Card className="bg-secondary"><CardHeader><CardTitle className="text-xl">Músculos (Hipogloso XII)</CardTitle></CardHeader><CardContent><p>Geniogloso, Hiogloso, Estilogloso.</p></CardContent></Card>
                        </div>
                    </div>
                </div>
            );
        case 4:
            return (
                 <div className="space-y-6">
                    <CardHeader className="text-center p-0">
                         <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><GitBranch className="h-8 w-8"/>Modelos Fisiológicos</CardTitle>
                    </CardHeader>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader><CardTitle className="text-xl">🥤 Modelo de 4 Etapas (Líquidos)</CardTitle></CardHeader>
                            <CardContent className="flex flex-col md:flex-row items-center justify-around gap-2 text-center">
                                <Badge>Preparatoria Oral</Badge>
                                <ArrowRight className="h-4 w-4 hidden md:block"/>
                                <Badge>Propulsiva Oral</Badge>
                                <ArrowRight className="h-4 w-4 hidden md:block"/>
                                <Badge>Faríngea</Badge>
                                <ArrowRight className="h-4 w-4 hidden md:block"/>
                                <Badge>Esofágica</Badge>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader><CardTitle className="text-xl">🍖 Modelo de Proceso (Sólidos)</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-decimal list-inside space-y-1">
                                    <li>Transporte Etapa I</li>
                                    <li>Procesamiento del alimento</li>
                                    <li>Transporte Etapa II</li>
                                    <li>Etapa faríngea</li>
                                    <li>Etapa esofágica</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                    <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                            El Modelo de 4 Etapas describe bien la deglución de líquidos, pero el Modelo de Proceso es más apropiado para alimentos sólidos que requieren masticación y formación de bolo.
                        </AlertDescription>
                    </Alert>
                </div>
            );
        case 5:
            return (
                 <div className="space-y-6">
                     <CardHeader className="text-center p-0">
                         <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><TestTube className="h-8 w-8"/>Etapas Oral y Faríngea</CardTitle>
                    </CardHeader>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <Card className="mb-4"><CardHeader><CardTitle>Etapa Oral Preparatoria</CardTitle></CardHeader><CardContent><ul className="list-disc list-inside"><li>Bolo líquido en piso anterior de boca</li><li>Sellado posterior por lengua-paladar</li></ul></CardContent></Card>
                            <Card><CardHeader><CardTitle>Etapa Oral Propulsiva</CardTitle></CardHeader><CardContent><ul className="list-disc list-inside"><li>Punta lingual toca reborde alveolar</li><li>Expulsión del bolo hacia faringe</li></ul></CardContent></Card>
                        </div>
                         <Card>
                             <CardHeader><CardTitle>Etapa Faríngea</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                 <Alert>
                                     <AlertTitle>Dos Funciones Críticas</AlertTitle>
                                     <AlertDescription>1. Paso del bolo, 2. Protección de vía aérea.</AlertDescription>
                                 </Alert>
                                <ul className="list-disc list-inside">
                                    <li>Elevación del paladar blando</li>
                                    <li>Retracción de base lingual</li>
                                    <li>Constricción faríngea secuencial</li>
                                    <li>Apertura del EES</li>
                                </ul>
                             </CardContent>
                        </Card>
                    </div>
                </div>
            );
        case 6:
            return (
                <div className="space-y-6">
                    <CardHeader className="text-center p-0">
                         <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><ListChecks className="h-8 w-8"/>Procesamiento de Alimentos Sólidos</CardTitle>
                    </CardHeader>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <Card className="mb-4"><CardHeader><CardTitle>Transporte Etapa I</CardTitle></CardHeader><CardContent><p>La lengua transporta el alimento a la región post-canina y rota lateralmente.</p></CardContent></Card>
                            <Card><CardHeader><CardTitle>Procesamiento</CardTitle></CardHeader><CardContent><ul className="list-disc list-inside"><li>Reducción por masticación</li><li>Ablandamiento por salivación</li></ul></CardContent></Card>
                        </div>
                         <Card>
                             <CardHeader><CardTitle>Coordinación Muscular</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                <Alert><AlertTitle>Movimientos Coordinados</AlertTitle><AlertDescription>Mandíbula, lengua, mejillas, paladar blando, hioides.</AlertDescription></Alert>
                                <Alert className="bg-primary/10 border-primary/20"><AlertTitle className="text-primary">Transporte Etapa II</AlertTitle><AlertDescription>El alimento procesado se coloca sobre la lengua y se propulsa.</AlertDescription></Alert>
                             </CardContent>
                        </Card>
                    </div>
                </div>
            );
        case 7:
            return (
                <div className="space-y-6">
                    <CardHeader className="text-center p-0">
                         <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><Wind className="h-8 w-8"/>Coordinación Deglución-Respiración</CardTitle>
                    </CardHeader>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader><CardTitle>Patrones Normales</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="list-disc list-inside">
                                    <li>Deglución domina sobre respiración</li>
                                    <li>Pausa respiratoria: 0.5-1.5 segundos</li>
                                    <li>Patrón: Expirar → Tragar → Expirar</li>
                                </ul>
                                <Alert><AlertDescription>La deglución inicia típicamente durante la fase espiratoria.</AlertDescription></Alert>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader><CardTitle>Durante la Alimentación</CardTitle></CardHeader>
                             <CardContent className="space-y-4">
                                 <Alert className="bg-primary/10 border-primary/20"><AlertDescription>El ritmo respiratorio se perturba, las pausas son más largas antes de tragar.</AlertDescription></Alert>
                                 <Alert variant="destructive"><AlertTitle>Importante</AlertTitle><AlertDescription>Alteraciones en esta coordinación pueden predisponer a aspiración.</AlertDescription></Alert>
                             </CardContent>
                        </Card>
                    </div>
                </div>
            );
        case 8:
            return (
                <div className="space-y-6">
                     <CardHeader className="text-center p-0">
                         <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2"><AlertTriangle className="h-8 w-8"/>Disfagia y Alteraciones</CardTitle>
                    </CardHeader>
                    <div className="grid md:grid-cols-2 gap-8">
                        <Card>
                             <CardHeader><CardTitle>Alteraciones Estructurales</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside">
                                    <li>Labio/paladar hendido</li>
                                    <li>Osteofitos cervicales</li>
                                    <li>Divertículos (Zenker)</li>
                                    <li>Webs y estenosis</li>
                                </ul>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader><CardTitle>Alteraciones Funcionales</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Alert variant="destructive"><AlertTitle>Fase Oral</AlertTitle><AlertDescription>Debilidad lingual, escape prematuro, retención.</AlertDescription></Alert>
                                <Alert variant="destructive"><AlertTitle>Fase Faríngea</AlertTitle><AlertDescription>Inicio tardío, propulsión inefectiva, apertura inadecuada EES.</AlertDescription></Alert>
                            </CardContent>
                        </Card>
                    </div>
                    <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Protección de Vía Aérea</AlertTitle>
                        <AlertDescription>Penetración vs Aspiración - La aspiración visible es patológica y aumenta riesgo de neumonía aspirativa.</AlertDescription>
                    </Alert>
                </div>
            );
        default:
            return (
                 <div className="flex flex-col items-center justify-center text-center h-full">
                    <h2 className="text-2xl font-bold text-foreground">Diapositiva {slideNumber}</h2>
                    <p className="text-muted-foreground mt-2">Contenido de la diapositiva {slideNumber} va aquí.</p>
                </div>
            )
    }
}

const NotesContent = ({ slideNumber }: { slideNumber: number }) => {
    const note = courseNotes.find(n => n.slide === slideNumber);
    if (!note) return <p>No hay notas para esta diapositiva.</p>;
    
    return (
        <div className="space-y-2">
            <h4 className="font-bold">{note.title}</h4>
            {note.points.map((point, index) => <p key={index}>{point}</p>)}
        </div>
    );
}

const PresentationView = ({ onBack, startSlide }: { onBack: () => void; startSlide: number }) => {
    const [currentSlide, setCurrentSlide] = useState(startSlide);
    const [isNotesVisible, setIsNotesVisible] = useState(false);

    const changeSlide = useCallback((n: number) => {
        setIsNotesVisible(false); // Hide notes when changing slide
        setCurrentSlide(prev => {
            const newSlide = prev + n;
            if (newSlide < 1) return 1;
            if (newSlide > totalSlides) return totalSlides;
            return newSlide;
        });
    }, []);

    const downloadNotes = () => {
        const fullNotesText = courseNotes.map(note => {
            return `${note.title}\n${note.points.join('\n')}\n`;
        }).join('\n--------------------------------------------------\n\n');

        const blob = new Blob([fullNotesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'notas_curso_deglucion.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                changeSlide(-1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                changeSlide(1);
            }
            if (e.key.toLowerCase() === 'n') {
                e.preventDefault();
                setIsNotesVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [changeSlide]);

     return (
        <div className="w-full max-w-6xl mx-auto space-y-4">
             <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Temario
            </Button>
            <div className="relative w-full max-w-6xl bg-card border rounded-2xl shadow-2xl overflow-hidden">
                <div className="absolute top-4 right-4 z-10 bg-secondary/80 text-secondary-foreground text-sm font-bold px-3 py-1 rounded-full">
                    <span>{currentSlide}</span> / <span>{totalSlides}</span>
                </div>
                
                <div className="p-6 md:p-10 min-h-[600px] flex flex-col justify-center">
                    <SlideContent slideNumber={currentSlide} />
                </div>
                
                <div className={cn(
                    "absolute bottom-6 w-full px-6 flex justify-between items-center z-20 transition-opacity",
                    isNotesVisible && "opacity-0 pointer-events-none"
                )}>
                    <Button onClick={() => changeSlide(-1)} disabled={currentSlide === 1}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={downloadNotes}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar Notas
                        </Button>
                        <Button variant="secondary" onClick={() => setIsNotesVisible(true)}>
                            Notas
                        </Button>
                    </div>
                    <Button onClick={() => changeSlide(1)} disabled={currentSlide === totalSlides}>
                        Siguiente <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>

                <div className={cn("absolute bottom-0 left-0 w-full bg-secondary text-secondary-foreground p-6 transition-transform duration-300 ease-in-out z-30", isNotesVisible ? 'translate-y-0' : 'translate-y-full')}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setIsNotesVisible(false)}
                    >
                        <ArrowDown className="h-4 w-4" />
                        <span className="sr-only">Cerrar notas</span>
                    </Button>
                    <h4 className="font-bold mb-2">Notas de la Diapositiva {currentSlide}</h4>
                    <div className="text-sm max-h-[150px] overflow-y-auto">
                        <NotesContent slideNumber={currentSlide} />
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function DeglucionCoursePage() {
    const [isCourseStarted, setIsCourseStarted] = useState(false);
    const [startSlide, setStartSlide] = useState(1);

    const handleLessonClick = (slide: number) => {
        setStartSlide(slide);
        setIsCourseStarted(true);
    };

    if (!isCourseStarted) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                       <div className="bg-primary text-primary-foreground p-8">
                         <h1 className="text-3xl font-bold">Curso: Trastornos de la Deglución y Alimentación Oral en todo el Ciclo Vital</h1>
                         <p className="mt-2 text-primary-foreground/80">Un enfoque práctico y basado en evidencia para el manejo de la disfagia.</p>
                       </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2"><Target /> Objetivos del Curso</h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>Comprender la anatomofisiología de la deglución normal y alterada.</li>
                                    <li>Identificar y aplicar modelos de evaluación e intervención.</li>
                                    <li>Analizar la coordinación entre deglución y respiración.</li>
                                    <li>Reconocer las principales patologías y sus implicancias.</li>
                                </ul>
                            </div>
                             <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Clock className="h-8 w-8 text-primary"/>
                                    <div>
                                        <p className="font-semibold">Duración Estimada</p>
                                        <p className="text-sm text-muted-foreground">2 horas cronológicas</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <BookOpen className="h-8 w-8 text-primary"/>
                                    <div>
                                        <p className="font-semibold">Modalidad</p>
                                        <p className="text-sm text-muted-foreground">Asincrónico, a tu propio ritmo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                             <h3 className="font-semibold text-lg mb-4">Contenido del Curso</h3>
                             <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                                {courseModules.map((module, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                        <AccordionTrigger>
                                            <div className='flex-grow text-left'>
                                                <p className='font-semibold'>{module.title}</p>
                                                <div className='flex items-center gap-2 mt-1'>
                                                    <Progress value={module.progress} className="w-1/4 h-2" />
                                                    <span className='text-xs text-muted-foreground'>{module.progress}% completado</span>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ul className='list-none space-y-1 pl-4'>
                                                {module.lessons.map(lesson => (
                                                    <li key={lesson.name}>
                                                        <Button variant="link" className="p-0 h-auto font-normal text-muted-foreground" onClick={() => handleLessonClick(lesson.slide)}>
                                                            <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                                                            {lesson.name}
                                                        </Button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                         <div className="pt-6 text-center">
                            <Button size="lg" onClick={() => setIsCourseStarted(true)}>
                                Comenzar Curso Ahora
                            </Button>
                        </div>
                         <div className="text-left">
                            <Button variant="outline" asChild>
                                <Link href="/academia">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Volver a Academia
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }


    return (
        <div className="bg-background min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center p-4">
            <PresentationView onBack={() => setIsCourseStarted(false)} startSlide={startSlide} />
        </div>
    );
}
