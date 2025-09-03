

import { AgendaClient } from './agenda-client';

export default function AgendaPage() {
  return (
    <div className="space-y-6" data-tour-id="planificacion-page">
      <header>
        <h1 className="text-3xl font-bold">Agenda de Sesiones</h1>
        <p className="text-muted-foreground">
          Organice sus próximas citas y revise el historial de sesiones.
        </p>
      </header>
      <AgendaClient />
    </div>
  );
}
