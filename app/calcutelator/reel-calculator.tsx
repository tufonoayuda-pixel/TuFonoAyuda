
'use client';

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface ReelCalculatorProps {
    ageInMonths: number;
}

interface ReelResult {
    linguisticAge: number;
    quotient: number;
    difference: number;
    interpretation: 'Normal' | 'Retraso o Dificultad';
}

export function ReelCalculator({ ageInMonths }: ReelCalculatorProps) {
    const { toast } = useToast();
    const [receptiveScore, setReceptiveScore] = useState<number | ''>('');
    const [expressiveScore, setExpressiveScore] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [receptiveResult, setReceptiveResult] = useState<ReelResult | null>(null);
    const [expressiveResult, setExpressiveResult] = useState<ReelResult | null>(null);
    const [combinedResult, setCombinedResult] = useState<ReelResult | null>(null);

    const calculateReel = (score: number): ReelResult => {
        const linguisticAge = score; // El puntaje es igual a la edad en meses
        const quotient = Math.round((linguisticAge / ageInMonths) * 100);
        const difference = ageInMonths - linguisticAge;
        const interpretation = (difference >= 6 || quotient <= 85) ? 'Retraso o Dificultad' : 'Normal';
        return { linguisticAge, quotient, difference, interpretation };
    };

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (receptiveScore === '' || expressiveScore === '') {
            toast({
                title: 'Error',
                description: 'Por favor, ingrese ambos puntajes.',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        setTimeout(() => {
            const recResult = calculateReel(Number(receptiveScore));
            setReceptiveResult(recResult);
            
            const expResult = calculateReel(Number(expressiveScore));
            setExpressiveResult(expResult);

            const combinedLingAge = (Number(receptiveScore) + Number(expressiveScore)) / 2;
            const combResult = calculateReel(combinedLingAge);
            setCombinedResult(combResult);

            toast({
                title: 'Cálculo REEL Completo',
                description: 'Se han calculado las edades y cocientes lingüísticos.'
            });

            setIsLoading(false);
        }, 1000);
    };

    const ResultDisplay = ({ title, result }: { title: string, result: ReelResult | null }) => {
        if (!result) return null;
        
        const isDelayed = result.interpretation === 'Retraso o Dificultad';

        return (
            <div className="space-y-2">
                <h3 className="font-semibold">{title}</h3>
                <Alert variant={isDelayed ? 'destructive' : 'default'}>
                    {isDelayed ? <AlertTriangle className="h-4 w-4"/> : <CheckCircle className="h-4 w-4" />}
                    <AlertTitle>{result.interpretation}</AlertTitle>
                    <AlertDescription>
                        <p>Edad Lingüística (EL): {result.linguisticAge.toFixed(1)} meses.</p>
                        <p>Cociente Lingüístico (CL): {result.quotient}.</p>
                        <p>Diferencia con Edad Cronológica (EC): {result.difference.toFixed(1)} meses.</p>
                        <p className="text-xs mt-1">(CL {"<="} 85 o una diferencia entre EC y EL de 6 meses o más se considera un retraso o dificultad).</p>
                    </AlertDescription>
                </Alert>
            </div>
        )
    };

    return (
        <CardContent className="border-t pt-4">
            <form onSubmit={handleCalculate} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="receptive-score">Puntaje Receptivo (ELR)</Label>
                        <Input 
                            id="receptive-score"
                            type="number"
                            value={receptiveScore}
                            onChange={(e) => setReceptiveScore(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Puntaje"
                            max={36}
                            min={0}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="expressive-score">Puntaje Expresivo (ELE)</Label>
                        <Input 
                            id="expressive-score"
                            type="number"
                            value={expressiveScore}
                            onChange={(e) => setExpressiveScore(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Puntaje"
                            max={36}
                            min={0}
                        />
                    </div>
                 </div>
                 <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Calculator className="mr-2 h-4 w-4" />
                    )}
                    Calcular REEL
                </Button>
            </form>

            {(receptiveResult || expressiveResult || combinedResult) && (
                <div className="mt-6 space-y-4 border-t pt-4">
                     <ResultDisplay title="Resultado Receptivo (ELR)" result={receptiveResult} />
                     <ResultDisplay title="Resultado Expresivo (ELE)" result={expressiveResult} />
                     <ResultDisplay title="Resultado Combinado (ELC)" result={combinedResult} />
                </div>
            )}
        </CardContent>
    );
}

    