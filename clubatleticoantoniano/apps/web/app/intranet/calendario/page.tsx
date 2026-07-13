import { EVENTOS_CALENDARIO } from "@/lib/mock-data";

export default function CalendarioPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">Calendario</h1>
        <p className="mt-1 text-text-muted">
          Entrenamientos, partidos y eventos del equipo.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <ol className="relative space-y-6 border-l border-border pl-6">
          {EVENTOS_CALENDARIO.map((ev) => (
            <li key={ev.id} className="relative">
              <span className="absolute -left-[1.6rem] top-1 flex h-3 w-3 rounded-full bg-brand ring-4 ring-surface" />
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {ev.fecha}
              </p>
              <p className="mt-0.5 font-semibold text-brand-dark">{ev.titulo}</p>
              <p className="text-sm text-text-muted">{ev.lugar}</p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-6 rounded-xl bg-surface-muted p-4 text-sm text-text-muted">
        Vista de calendario completa próximamente. Sincronización con Google
        Calendar / iCal en desarrollo.
      </p>
    </div>
  );
}
