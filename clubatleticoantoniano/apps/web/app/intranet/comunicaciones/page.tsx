import { COMUNICACIONES } from "@/lib/mock-data";

export default function ComunicacionesPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">Comunicaciones</h1>
        <p className="mt-1 text-text-muted">
          Avisos y mensajes del club y del cuerpo técnico.
        </p>
      </header>

      <ul className="space-y-4">
        {COMUNICACIONES.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-border bg-surface p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-brand-dark">{c.titulo}</h2>
              <span className="text-xs text-text-muted">{c.fecha}</span>
            </div>
            <p className="mt-2 text-sm text-text-muted">{c.resumen}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
