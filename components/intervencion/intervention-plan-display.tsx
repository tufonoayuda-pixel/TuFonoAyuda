
'use client';

import { useState } from 'react';
import { EnhanceInterventionPlanOutput } from "@/ai/flows/enhance-intervention-plan";
import { GeneratePersonalizedActivityOutput } from '@/ai/schemas';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Eye, Wand2 } from "lucide-react";
import { ActivityResultDisplay } from '../actividades/activity-result-display';

interface InterventionPlanDisplayProps {
    analysisResult: EnhanceInterventionPlanOutput;
}

export function InterventionPlanDisplay({ analysisResult }: InterventionPlanDisplayProps) {
    if (!analysisResult) return null;
    const [selectedActivity, setSelectedActivity] = useState<GeneratePersonalizedActivityOutput | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const handleViewActivity = (activity: GeneratePersonalizedActivityOutput) => {
        setSelectedActivity(activity);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="space-y-6">
                <Alert>
                    <Wand2 className="h-4 w-4" />
                    <AlertTitle>Justificación General de la IA</AlertTitle>
                    <AlertDescription>{analysisResult.justification}</AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Objetivos Terapéuticos (Revisados)</h3>
                    {analysisResult.suggestedGoals.map((goal, index) => (
                        <Card key={`goal-${index}`} className="bg-secondary/30">
                            <CardHeader className="p-4">
                               <p className="font-semibold">{goal.goal}</p>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-sm">
                                <p className="text-muted-foreground"><span className='font-medium'>Justificación:</span> {goal.justification}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Actividades Sugeridas</h3>
                    {analysisResult.suggestedActivities.map((activity, index) => (
                         <Card key={`activity-${index}`}>
                            <CardHeader className="p-4 flex flex-row justify-between items-center">
                                <p className="font-semibold">{activity.titulo_actividad}</p>
                                <div className="flex items-center gap-2">
                                     <Button variant="outline" size="sm" onClick={() => handleViewActivity(activity)}>
                                        <Eye className="mr-2 h-4 w-4" /> Ver Actividad
                                     </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
                    {selectedActivity && (
                         <>
                            <DialogHeader>
                                <DialogTitle>Plan de Sesión Sugerido</DialogTitle>
                                <DialogDescription>
                                    Plan de sesión generado por IA para la actividad: {selectedActivity.titulo_actividad}.
                                </DialogDescription>
                            </DialogHeader>
                             <ScrollArea className="flex-grow pr-6 -mr-6">
                                <ActivityResultDisplay sessionPlan={selectedActivity} />
                            </ScrollArea>
                            <DialogFooter>
                                <Button type="button" onClick={() => setIsModalOpen(false)}>Cerrar</Button>
                            </DialogFooter>
                         </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
