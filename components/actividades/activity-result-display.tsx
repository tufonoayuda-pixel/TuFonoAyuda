
'use client';

import { GeneratePersonalizedActivityOutput } from "@/ai/schemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CalendarClock, Check, Clipboard, ClipboardCheck, Book, Shield, Target, Users, ThumbsUp, ThumbsDown, MessageSquare, List } from "lucide-react";

interface ActivityResultDisplayProps {
    sessionPlan: GeneratePersonalizedActivityOutput;
}

const SectionCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4 pt-4">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
            {icon}
        </div>
        <div className="flex-grow">
            <h3 className="font-semibold">{title}</h3>
            <div className="text-sm text-muted-foreground space-y-2 mt-1">
                {children}
            </div>
        </div>
    </div>
);

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="font-medium text-foreground">{label}</p>
        {typeof value === 'string' ? <p>{value}</p> : value}
    </div>
)

const ListSection = ({ items }: { items: string[] }) => (
    <ul className="list-disc list-inside space-y-1">
        {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
);

export function ActivityResultDisplay({ sessionPlan }: ActivityResultDisplayProps) {

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{sessionPlan.titulo_actividad}</CardTitle>
                    <CardDescription>
                       Área: <Badge variant="secondary">{sessionPlan.area_intervencion}</Badge> | Paciente: <Badge variant="secondary">{sessionPlan.tipo_paciente} ({sessionPlan.rango_edad})</Badge>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                     <SectionCard icon={<Target size={20} />} title="Objetivos Terapéuticos">
                        <DetailItem label="Objetivo Principal" value={sessionPlan.objetivo_terapeutico} />
                        {sessionPlan.subobjetivos.length > 0 && <DetailItem label="Sub-objetivos" value={<ListSection items={sessionPlan.subobjetivos} />} />}
                    </SectionCard>

                    <SectionCard icon={<Clipboard size={20} />} title="Procedimiento de la Actividad">
                        {sessionPlan.procedimiento.calentamiento.length > 0 && <DetailItem label="Calentamiento" value={<ListSection items={sessionPlan.procedimiento.calentamiento} />} />}
                        <DetailItem label="Desarrollo Principal" value={<ListSection items={sessionPlan.procedimiento.desarrollo_principal} />} />
                        {sessionPlan.procedimiento.cierre.length > 0 && <DetailItem label="Cierre y Consolidación" value={<ListSection items={sessionPlan.procedimiento.cierre} />} />}
                        {sessionPlan.procedimiento.estimulos.length > 0 && (
                            <DetailItem 
                                label="Estímulos Sugeridos" 
                                value={
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {sessionPlan.procedimiento.estimulos.map((item, i) => <Badge key={i} variant="outline">{item}</Badge>)}
                                    </div>
                                } 
                            />
                        )}
                        {sessionPlan.procedimiento.instrucciones_ejemplo && (
                            <DetailItem
                                label="Instrucciones para el Terapeuta"
                                value={
                                    <div className="p-3 bg-secondary/50 rounded-md border italic">
                                        <MessageSquare className="inline-block h-4 w-4 mr-2 text-muted-foreground"/>
                                        "{sessionPlan.procedimiento.instrucciones_ejemplo}"
                                    </div>
                                }
                            />
                        )}
                    </SectionCard>
                    
                    <SectionCard icon={<BrainCircuit size={20} />} title="Técnicas y Materiales">
                        <DetailItem label="Población Objetivo" value={sessionPlan.poblacion_objetivo} />
                        <DetailItem label="Técnicas Aplicadas" value={<ListSection items={sessionPlan.tecnicas_aplicadas} />} />
                        <DetailItem label="Materiales Necesarios" value={<ListSection items={sessionPlan.materiales_necesarios} />} />
                    </SectionCard>

                    <SectionCard icon={<CalendarClock size={20} />} title="Planificación y Seguimiento">
                         <DetailItem label="Duración Estimada" value={`${sessionPlan.duracion_estimada} minutos`} />
                         <DetailItem label="Frecuencia Recomendada" value={sessionPlan.frecuencia_recomendada} />
                         <DetailItem label="Indicadores de Progreso" value={<ListSection items={sessionPlan.indicadores_progreso} />} />
                         <DetailItem label="Criterios de Alta" value={sessionPlan.criterios_alta} />
                    </SectionCard>

                    <SectionCard icon={<Users size={20} />} title="Adaptaciones y Variaciones">
                        <DetailItem label="Adaptaciones Poblacionales" value={<ListSection items={sessionPlan.adaptaciones_poblacionales}/>} />
                        <DetailItem label="Variación: Nivel Inicial" value={sessionPlan.variaciones_dificultad.nivel_inicial} />
                        <DetailItem label="Variación: Nivel Intermedio" value={sessionPlan.variaciones_dificultad.nivel_intermedio} />
                        <DetailItem label="Variación: Nivel Avanzado" value={sessionPlan.variaciones_dificultad.nivel_avanzado} />
                    </SectionCard>

                    <SectionCard icon={<Shield size={20} />} title="Seguridad y Recomendaciones">
                        {sessionPlan.criterios_seguridad.length > 0 && <DetailItem label="Criterios de Seguridad" value={<ListSection items={sessionPlan.criterios_seguridad}/>} />}
                        {sessionPlan.contraindicaciones.length > 0 && <DetailItem label="Contraindicaciones" value={<ListSection items={sessionPlan.contraindicaciones}/>} />}
                        {sessionPlan.recomendaciones_adicionales.length > 0 && <DetailItem label="Recomendaciones Adicionales" value={<ListSection items={sessionPlan.recomendaciones_adicionales}/>} />}
                    </SectionCard>
                    
                    <SectionCard icon={<Book size={20} />} title="Transferencia y Generalización">
                         <DetailItem label="Transferencia Funcional" value={sessionPlan.transferencia_funcional} />
                         <DetailItem label="Seguimiento Domiciliario" value={sessionPlan.seguimiento_domiciliario} />
                         <DetailItem label="Referencias Aplicadas" value={sessionPlan.referencias_aplicadas} />
                    </SectionCard>
                </CardContent>
            </Card>
        </div>
    );
}
