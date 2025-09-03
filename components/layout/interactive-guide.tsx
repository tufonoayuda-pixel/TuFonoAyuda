
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight, X, Hand } from 'lucide-react';
import { Button } from '../ui/button';

const FonoClippy = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 120" 
      className="w-40 h-52"
    >
        <g>
            {/* Body */}
            <path d="M 20 110 C 10 90, 10 60, 25 40 S 40 15, 50 20 S 60 25, 75 40 S 90 90, 80 110 Z" fill="hsl(var(--primary))" stroke="hsl(var(--sidebar-foreground))" strokeWidth="2.5" />
            <path d="M 22 108 C 12 88, 12 58, 27 38 S 42 13, 50 18 S 58 23, 73 38 S 88 88, 78 108 Z" fill="hsl(var(--background))" />
            
            {/* Eyes */}
            <circle cx="40" cy="50" r="8" fill="#fff" stroke="#333" strokeWidth="1.5" />
            <circle cx="60" cy="50" r="8" fill="#fff" stroke="#333" strokeWidth="1.5" />
            <circle cx="38" cy="50" r="3" fill="#333" />
            <circle cx="58" cy="50" r="3" fill="#333" />
            
            {/* Mouth */}
            <path d="M 45 65 Q 50 70, 55 65" stroke="#333" fill="none" strokeWidth="2" strokeLinecap='round' />

            {/* Brain waves */}
            <path d="M 50 35 Q 55 30, 60 35" stroke="hsl(var(--primary))" fill="none" strokeWidth="2.5" strokeLinecap='round'/>
            <path d="M 50 28 Q 58 20, 66 28" stroke="hsl(var(--primary))" fill="none" strokeWidth="2.5" strokeLinecap='round' opacity="0.7"/>
        </g>
    </svg>
);


interface TourStep {
  elementId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tours: Record<string, TourStep[]> = {
  '/dashboard': [
    {
      elementId: 'step-1',
      title: '¡Bienvenido al Dashboard!',
      content: 'Aquí tienes un resumen de tu actividad. Puedes ver el progreso semanal y acceder a funciones rápidas.',
      position: 'bottom',
    },
    {
      elementId: 'pacientes-table',
      title: 'Gestión de Pacientes',
      content: 'Puedes ver tus pacientes, añadir nuevos y acceder rápidamente a sus perfiles para ver su progreso y planificar sesiones.',
      position: 'top',
    },
    {
      elementId: 'ai-activity-generator',
      title: 'Generador de Actividades IA',
      content: '¡Esta es la parte mágica! Aquí puedes generar actividades personalizadas y basadas en evidencia para tus pacientes.',
      position: 'left',
    },
  ],
   '/pacientes': [
    {
        elementId: 'pacientes-table',
        title: 'Gestión de Pacientes',
        content: 'Esta es tu lista de pacientes. Puedes ver, editar, o eliminar sus fichas desde aquí.',
        position: 'bottom',
    },
  ],
  '/evaluaciones': [
    {
        elementId: 'evaluaciones-header',
        title: 'Herramientas de Evaluación',
        content: 'Aquí puedes gestionar tu biblioteca de herramientas de evaluación, tanto estandarizadas como no estandarizadas.',
        position: 'bottom',
    },
  ],
  '/intervencion': [
    {
      elementId: 'intervencion-main-card',
      title: 'Asistente de Intervención IA',
      content: 'Esta herramienta te permite enriquecer un plan de intervención existente. Sube el plan de un paciente, selecciona los modelos teóricos de tu base de conocimiento y deja que la IA sugiera mejoras.',
      position: 'bottom',
    },
  ],
  '/referencias': [
    {
      elementId: 'referencias-page',
      title: 'Base de Conocimiento',
      content: 'Aquí puedes gestionar todas tus referencias científicas. Sube artículos, guías clínicas y otros documentos para que la IA los utilice al generar planes y actividades.',
      position: 'bottom',
    },
  ],
  '/agenda': [
    {
      elementId: 'planificacion-page',
      title: 'Agenda',
      content: 'Visualiza y gestiona todas tus citas en este calendario. Puedes ver las sesiones por día y añadir nuevas citas fácilmente.',
      position: 'bottom',
    },
  ],
  '/laboratorio-voz': [
    {
      elementId: 'laboratorio-main',
      title: 'Laboratorio de Voz',
      content: 'Utiliza esta herramienta para un análisis acústico en tiempo real. Detecta el tono, la frecuencia y guarda las métricas de la sesión de voz de tu paciente.',
      position: 'bottom',
    },
  ],
  '/calcutelator': [
    {
      elementId: 'calcutelator-main',
      title: 'Calculadora Educacional',
      content: 'Ingresa los puntajes de tests estandarizados chilenos para obtener al instante la desviación estándar y la interpretación del rendimiento. ¡Adiós a las tablas manuales!',
      position: 'bottom',
    },
  ],
  '/precios': [
    {
        elementId: 'precios-page',
        title: 'Suscripciones',
        content: 'Consulta los detalles de nuestros planes. Puedes cambiar entre facturación mensual y anual para ver los ahorros.',
        position: 'bottom',
    }
  ],
  '/ajustes': [
    {
        elementId: 'ajustes-page',
        title: 'Ajustes de la Cuenta',
        content: 'Aquí puedes personalizar toda tu experiencia: desde tu perfil profesional y la apariencia de la aplicación, hasta tus horarios y plantillas de notificación.',
        position: 'bottom',
    }
  ],
};

const generalTour: TourStep[] = [
    {
      elementId: 'sidebar-menu-dashboard',
      title: 'Navegación Principal',
      content: 'Usa este menú para navegar por todas las secciones de la aplicación, desde la gestión de pacientes hasta los ajustes.',
      position: 'right',
    },
    {
      elementId: 'header-quick-actions',
      title: 'Acciones Rápidas',
      content: 'Desde aquí puedes crear rápidamente una nueva cita, analizar un informe o generar documentos importantes.',
      position: 'left',
    },
     {
      elementId: 'header-user-menu',
      title: 'Tu Cuenta',
      content: 'Accede a la configuración de tu perfil o cierra sesión desde este menú.',
      position: 'left',
    },
];

export function InteractiveGuide({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const [tour, setTour] = useState<TourStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [position, setPosition] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState<'idle' | 'finding' | 'found' | 'not-found'>('idle');

  const updatePosition = useCallback(() => {
    if (status !== 'found' || !tour.length) return;

    const step = tour[currentStepIndex];
    if (!step) return;

    if (step.position === 'center') {
      setPosition({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      setIsVisible(true);
      return;
    }

    const element = document.querySelector(`[data-tour-id="${step.elementId}"]`);
    if (!element) {
        setIsVisible(false);
        return;
    }

    const rect = element.getBoundingClientRect();
    const guideEl = guideRef.current;
    if (!guideEl) return;

    const guideWidth = guideEl.offsetWidth;
    const guideHeight = guideEl.offsetHeight;
    const margin = 10;

    const positions = {
      top: {
        top: rect.top - guideHeight - margin,
        left: rect.left + rect.width / 2 - guideWidth / 2,
      },
      bottom: {
        top: rect.bottom + margin,
        left: rect.left + rect.width / 2 - guideWidth / 2,
      },
      left: {
        top: rect.top + rect.height / 2 - guideHeight / 2,
        left: rect.left - guideWidth - margin,
      },
      right: {
        top: rect.top + rect.height / 2 - guideHeight / 2,
        left: rect.right + margin,
      },
    };
    
    let pos = positions[step.position || 'bottom'];

    // Adjust if out of bounds
    if (pos.top < margin) pos.top = margin;
    if (pos.left < margin) pos.left = margin;
    if (pos.top + guideHeight > window.innerHeight - margin) pos.top = window.innerHeight - guideHeight - margin;
    if (pos.left + guideWidth > window.innerWidth - margin) pos.left = window.innerWidth - guideWidth - margin;

    setPosition({ top: pos.top, left: pos.left });
    setIsVisible(true);
  }, [tour, currentStepIndex, status]);


  useEffect(() => {
    const tourKey = Object.keys(tours).find(key => pathname.startsWith(key) && key !== '/');
    const finalStep: TourStep = { elementId: '', title: '¡Guía Completa!', content: 'Eso es todo por ahora. Si me necesitas de nuevo, solo haz clic en mi ícono.', position: 'center' };
    let steps: TourStep[];
    
    if (tourKey && tours[tourKey]) {
        steps = tours[tourKey];
    } else {
        steps = generalTour;
    }

    setTour([...steps, finalStep]);
    setCurrentStepIndex(0);
    setStatus('idle');
  }, [pathname]);

  useEffect(() => {
    if (tour.length > 0 && status === 'idle') {
      setStatus('finding');
      setIsVisible(false);
      
      const step = tour[currentStepIndex];
      if (!step || step.position === 'center') {
        setStatus('found');
        return;
      }
      
      const maxRetries = 20;
      let retries = 0;
      const interval = setInterval(() => {
        const element = document.querySelector(`[data-tour-id="${step.elementId}"]`);
        if (element) {
          clearInterval(interval);
          setStatus('found');
        } else if (retries >= maxRetries) {
          clearInterval(interval);
          setStatus('not-found');
        }
        retries++;
      }, 50);

      return () => clearInterval(interval);
    }
  }, [tour, currentStepIndex, status]);

  useEffect(() => {
    if (status === 'found') {
      updatePosition();
      window.addEventListener('resize', updatePosition);
    }
    return () => window.removeEventListener('resize', updatePosition);
  }, [status, updatePosition]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < tour.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setStatus('idle');
    } else {
      onClose();
    }
  }, [currentStepIndex, tour.length, onClose]);

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setStatus('idle');
    }
  };
  
  useEffect(() => {
    if (status === 'not-found') {
        handleNext();
    }
  }, [status, handleNext]);

  const currentStep = tour[currentStepIndex];
  if (!currentStep || status !== 'found') return null;
  
  const element = currentStep.position !== 'center' 
    ? document.querySelector(`[data-tour-id="${currentStep.elementId}"]`) 
    : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/10 animate-in fade-in-50">
        <div
            ref={guideRef}
            className="absolute z-[102] w-80 rounded-lg bg-background shadow-2xl transition-all duration-300"
            style={{ ...position, visibility: isVisible ? 'visible' : 'hidden', opacity: isVisible ? 1 : 0 }}
        >
             <div className="relative p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 -mt-16 -ml-10">
                         <div className="relative w-40 h-52">
                            <FonoClippy />
                        </div>
                    </div>
                    <div className="flex-grow pt-2">
                        <h3 className="text-lg font-bold mb-1">{currentStep.title}</h3>
                        <p className="text-sm text-muted-foreground">{currentStep.content}</p>
                    </div>
                </div>
                <button onClick={onClose} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                    <X size={18} />
                </button>
            </div>
            
            <div className="flex justify-between items-center mt-2 px-4 pb-4">
                <span className="text-xs text-muted-foreground">
                    Paso {currentStepIndex + 1} de {tour.length}
                </span>
                <div className="flex gap-2">
                    {currentStepIndex > 0 && (
                        <Button variant="outline" size="sm" onClick={handlePrev}>
                            <ArrowLeft size={14} className="mr-1" /> Anterior
                        </Button>
                    )}
                    <Button size="sm" onClick={handleNext}>
                        {currentStepIndex === tour.length - 1 ? 'Finalizar' : 'Siguiente'}
                        {currentStepIndex < tour.length - 1 && <ArrowRight size={14} className="ml-1" />}
                    </Button>
                </div>
            </div>
        </div>
        {isVisible && element && (
             <div 
                className="absolute z-[101] transition-all duration-300" 
                style={{
                    top: element.getBoundingClientRect().top - 4,
                    left: element.getBoundingClientRect().left - 4,
                    width: element.getBoundingClientRect().width + 8,
                    height: element.getBoundingClientRect().height + 8,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.2)',
                    borderRadius: '8px'
                }}
             >
                <div onClick={handleNext} className="absolute inset-0 cursor-pointer"/>
             </div>
        )}
    </div>
  );
}
