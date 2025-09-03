
'use client';

import {
  BookOpenCheck, Plus
} from 'lucide-react';
import { ReferenciasClient } from './referencias-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { references as initialReferences } from '@/lib/mock-data';

export default function ReferenciasPage() {
  return (
    <div className="space-y-6" data-tour-id="referencias-page">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Referencias</h1>
            <p className="text-muted-foreground">
                Explore y gestione su base de conocimiento científico.
            </p>
        </div>
        <Button asChild>
          <Link href="/referencias/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Referencia
          </Link>
        </Button>
      </header>
      <ReferenciasClient initialReferences={initialReferences} />
    </div>
  );
}
