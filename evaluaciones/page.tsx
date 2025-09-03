
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { evaluationTools } from '@/lib/mock-data';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function EvaluacionesPage() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center" data-tour-id="evaluaciones-header">
        <div>
            <h1 className="text-3xl font-bold">Herramientas de Evaluación</h1>
            <p className="text-muted-foreground">
                Gestione sus instrumentos de evaluación estandarizados y no estandarizados.
            </p>
        </div>
        <Button asChild>
          <Link href="/evaluaciones/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Herramienta
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-tour-id="evaluaciones-list">
        {evaluationTools.map((tool) => (
          <Card key={tool.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{tool.name}</CardTitle>
              <CardDescription>
                <Badge variant={tool.type === 'Estandarizada' ? 'default' : 'secondary'}>
                  {tool.type}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <h4 className="font-semibold mb-1 text-sm">Área de Evaluación:</h4>
                <p className="text-sm text-muted-foreground">{tool.area}</p>
              </div>
               <div>
                <h4 className="font-semibold mb-1 text-sm">Descripción:</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{tool.description}</p>
              </div>
            </CardContent>
            <CardFooter>
                 <Button variant="outline" className="w-full">Ver Detalles</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
