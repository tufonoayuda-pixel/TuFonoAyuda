
'use client';

import { Star, ArrowRight, BrainCircuit, CalendarCheck, FileHeart, Users, BarChart, GraduationCap, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Header } from '@/components/layout/header';
import { AppFooter } from '@/components/layout/footer';
import { FallingIcons } from '@/components/layout/falling-icons';

const features = [
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Gestión Integral de Pacientes",
    description: "Mantén fichas clínicas completas, registra el progreso y gestiona toda la documentación de tus pacientes de forma segura y centralizada.",
  },
   {
    icon: <CalendarCheck className="w-8 h-8 text-primary" />,
    title: "Agenda y Citas Inteligente",
    description: "Organiza tus sesiones, configura recordatorios automáticos por email y WhatsApp, y gestiona tu disponibilidad sin esfuerzo.",
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: "Asistente de Terapia con IA",
    description: "Genera actividades terapéuticas personalizadas, resume informes y mejora tus planes de intervención basándote en evidencia científica.",
  },
   {
    icon: <FileText className="w-8 h-8 text-primary" />,
    title: "Documentación y Reportes",
    description: "Crea informes de avance y fichas de derivación profesionales en segundos. Analiza informes externos con IA para extraer datos clave.",
  },
   {
    icon: <BarChart className="w-8 h-8 text-primary" />,
    title: "Herramientas Clínicas",
    description: "Accede a un laboratorio de voz para análisis acústico en tiempo real y utiliza la CalcuTELator para interpretar baremos de tests chilenos.",
  },
   {
    icon: <GraduationCap className="w-8 h-8 text-primary" />,
    title: "Asesorías Profesionales",
    description: "Potencia tus habilidades con asesorías personalizadas para estudiantes y recién egresados sobre casos clínicos y temas específicos.",
  },
];

const testimonials = [
    {
        name: "Valentina Rojas",
        title: "Fonoaudióloga, Especialista en TSH",
        avatar: "https://placehold.co/100x100.png",
        comment: "TuFonoAyuda ha transformado mi consulta. La IA para generar actividades me ahorra horas de planificación y los resultados con mis pacientes son increíbles."
    },
    {
        name: "Matías Silva",
        title: "Fonoaudiólogo, recién egresado",
        avatar: "https://placehold.co/100x100.png",
        comment: "Como recién egresado, esta herramienta me ha dado la confianza que necesitaba. La sección de CalcuTELator y los informes automáticos son indispensables."
    },
    {
        name: "Carolina Nuñez",
        title: "Directora de Centro Fonoaudiológico",
        avatar: "https://placehold.co/100x100.png",
        comment: "Implementamos TuFonoAyuda en nuestro centro y la eficiencia ha mejorado en un 50%. La gestión de pacientes y la colaboración en equipo son mucho más fluidas."
    }
]

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="py-16 sm:py-20 md:py-32 text-center relative overflow-hidden" id="hero">
           <FallingIcons />
          <div className="container relative z-10">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">La primera plataforma de gestión fonoaudiológica con IA en Chile</h1>
            <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Simplifica tu trabajo, personaliza tus terapias y haz un seguimiento del progreso de tus pacientes con herramientas inteligentes. Únete a la comunidad de fonoaudiólogos que ya están innovando.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/registro">Comenzar Gratis</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Saber más</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary/50" id="features">
            <div className="container text-center">
                 <h2 className="text-3xl md:text-4xl font-bold">Todo lo que necesitas, en un solo lugar</h2>
                 <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Desde la gestión de pacientes hasta la generación de Informes y actividades con IA, TuFonoAyuda centraliza tus tareas diarias.</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="text-center">
                            <CardHeader className="items-center">
                                {feature.icon}
                                <CardTitle className="pt-2">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

         <section className="py-20" id="testimonials">
            <div className="container text-center">
                 <h2 className="text-3xl md:text-4xl font-bold">Lo que dicen nuestros colegas</h2>
                 <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Opiniones de profesionales que ya están potenciando su práctica con TuFonoAyuda.</p>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                         <Card key={index} className="text-left">
                            <CardHeader className="flex flex-row items-center gap-4">
                               <Avatar>
                                 <AvatarImage src={testimonial.avatar} data-ai-hint="person face" />
                                 <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <div>
                                 <CardTitle className="text-base">{testimonial.name}</CardTitle>
                                 <CardDescription>{testimonial.title}</CardDescription>
                               </div>
                            </CardHeader>
                            <CardContent>
                               <div className="flex mb-2">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                               </div>
                               <p className="text-muted-foreground">&ldquo;{testimonial.comment}&rdquo;</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground" id="cta">
            <div className="container text-center">
                <h2 className="text-3xl md:text-4xl font-bold">¿Listo para llevar tu terapia al siguiente nivel?</h2>
                <p className="mt-4 max-w-2xl mx-auto">
                    Únete a la vanguardia de la fonoaudiología en Chile. Comienza con nuestro plan gratuito o potencia tu consulta sin límites.
                </p>
                <div className="mt-8">
                    <Button size="lg" variant="secondary" asChild>
                         <Link href="/registro">
                            Comienza gratis ahora <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
                 <div className="text-center pt-8">
                    <p className="text-sm text-primary-foreground/80 mb-2">Pagos seguros procesados por</p>
                    <p className="font-semibold text-primary-foreground">Webpay de Transbank</p>
                </div>
            </div>
        </section>

      </main>
      <AppFooter />
    </div>
  );
}

export default LandingPage;
