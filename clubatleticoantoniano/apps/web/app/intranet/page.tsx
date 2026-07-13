import Link from "next/link";
import { CalendarDays, Megaphone, ArrowRight } from "lucide-react";
import { formatEuros } from "@caa/shared";
import { HIJO, CUOTAS, COMUNICACIONES, EVENTOS_CALENDARIO } from "@/lib/mock-data";

export default function DashboardPage() {
  const pendientes = CUOTAS.filter((c) => c.estado !== "pagada");
  const totalPendiente = pendientes.reduce(
    (acc, c) => acc + c.importeCentimos,
    0,
  );
  const abonadas = CUOTAS.filter((c) => c.estado === "pagada");
  const totalAbonado = abonadas.reduce((acc, c) => acc + c.importeCentimos, 0);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">
          Hola de nuevo, familia Jiménez
        </h1>
        <p className="mt-1 text-text-muted">
          Resumen de la actividad de tu familia en el club.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Datos del hijo */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Ficha del jugador
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-extrabold text-white">
              {HIJO.dorsal}
            </span>
            <div>
              <p className="text-xl font-extrabold text-brand-dark">
                {HIJO.nombre}
              </p>
              <p className="text-sm text-text-muted">
                {HIJO.equipo} · {HIJO.categoria} · Temporada {HIJO.temporada}
              </p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-surface-muted p-3">
              <dt className="text-text-muted">Entrenador</dt>
              <dd className="font-semibold text-brand-dark">{HIJO.entrenador}</dd>
            </div>
            <div className="rounded-lg bg-surface-muted p-3">
              <dt className="text-text-muted">Dorsal</dt>
              <dd className="font-semibold text-brand-dark">{HIJO.dorsal}</dd>
            </div>
          </dl>
        </section>

        {/* Widget pagos */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Pagos
          </h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-brand/10 p-4">
              <p className="text-xs font-semibold text-brand">Pendiente</p>
              <p className="text-2xl font-extrabold text-brand">
                {formatEuros(totalPendiente)}
              </p>
              <p className="text-xs text-text-muted">
                {pendientes.length} cuota(s)
              </p>
            </div>
            <div className="rounded-lg bg-surface-muted p-4">
              <p className="text-xs font-semibold text-text-muted">
                Abonado esta temporada
              </p>
              <p className="text-2xl font-extrabold text-brand-dark">
                {formatEuros(totalAbonado)}
              </p>
            </div>
          </div>
          <Link
            href="/intranet/pagos"
            className="btn btn-dark mt-4 w-full"
          >
            Ver pagos
          </Link>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Comunicaciones */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
              <Megaphone className="h-4 w-4 text-brand" strokeWidth={2} aria-hidden />
              Comunicaciones
            </h2>
            <Link
              href="/intranet/comunicaciones"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {COMUNICACIONES.map((c) => (
              <li key={c.id} className="border-b border-border pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-brand-dark">{c.titulo}</p>
                  <span className="text-xs text-text-muted">{c.fecha}</span>
                </div>
                <p className="mt-0.5 text-sm text-text-muted">{c.resumen}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Próximos eventos */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-text-muted">
              <CalendarDays className="h-4 w-4 text-brand" strokeWidth={2} aria-hidden />
              Próximos eventos
            </h2>
            <Link
              href="/intranet/calendario"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
            >
              Calendario
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {EVENTOS_CALENDARIO.map((ev) => (
              <li key={ev.id} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
                  <CalendarDays className="h-5 w-5 text-[#9a6400]" strokeWidth={2} aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-brand-dark">{ev.titulo}</p>
                  <p className="text-xs text-text-muted">
                    {ev.fecha} · {ev.lugar}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
