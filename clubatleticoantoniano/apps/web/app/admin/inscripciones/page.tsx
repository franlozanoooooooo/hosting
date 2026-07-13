"use client";

/**
 * Panel admin: inscripciones reales desde la API (PostgreSQL).
 *  - GET /api/jugadores      → jugadores con equipo, tutores y mandatos.
 *  - GET /api/pagos/cuotas   → todas las cuotas (rol administrador).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatEuros } from "@caa/shared";
import { api, ApiError } from "@/lib/api";
import {
  ClipboardList,
  Landmark,
  CalendarClock,
  Inbox,
  ArrowRight,
  UserRound,
  Baby,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type Mandato = { ibanLast4: string; estado: string; createdAt: string };
type Jugador = {
  id: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
  equipo: { id: string; nombre: string } | null;
  tutores: {
    parentesco: string;
    esContactoPrincipal: boolean;
    tutor: { nombre: string; apellidos: string; email: string | null; telefono: string | null; mandatos: Mandato[] };
  }[];
};
type Cuota = {
  id: string;
  jugadorId: string;
  periodo: string;
  concepto: string;
  importeCentimos: number;
  estado: string;
};

function badgeCuota(estado: string, tieneMandato: boolean) {
  switch (estado) {
    case "PAGADA":
      return { txt: "Pagada", cls: "bg-green-100 text-green-700" };
    case "EN_REMESA":
      return { txt: "En remesa", cls: "bg-brand/10 text-brand" };
    case "IMPAGADA":
    case "DEVUELTA":
      return { txt: estado === "IMPAGADA" ? "Impagada" : "Devuelta", cls: "bg-brand text-white" };
    default:
      return tieneMandato
        ? { txt: "Domiciliada · cargo automático", cls: "bg-brand/10 text-brand" }
        : { txt: "Pendiente", cls: "bg-accent/20 text-[#9a6400]" };
  }
}

export default function InscripcionesAdminPage() {
  const [jugadores, setJugadores] = useState<Jugador[] | null>(null);
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [js, cs] = await Promise.all([
          api.get<Jugador[]>("/api/jugadores"),
          api.get<Cuota[]>("/api/pagos/cuotas"),
        ]);
        setJugadores(js);
        setCuotas(cs);
      } catch (err) {
        setError(
          err instanceof ApiError && err.status === 401
            ? "Tu sesión ha caducado. Vuelve a iniciar sesión."
            : "No se pudo cargar desde la API. ¿Está arrancada (puerto 4000)?",
        );
      }
    })();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="flex items-center gap-2.5 text-3xl font-extrabold text-brand-dark">
          <ClipboardList className="h-7 w-7 text-brand" strokeWidth={2} />
          Inscripciones de cantera
        </h1>
        <p className="mt-1 text-text-muted">
          Datos reales de la base de datos del club: familias, mandatos SEPA y cuotas.
        </p>
      </header>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand/5 px-6 py-5 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
          <div>
            <p className="font-bold text-brand-dark">{error}</p>
            <Link href="/login?desde=/admin/inscripciones" className="link-more mt-2">
              Ir al login
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      ) : jugadores === null ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-10 text-sm text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-brand" strokeWidth={2} />
          Cargando inscripciones…
        </div>
      ) : jugadores.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-border bg-surface px-6 py-16 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
            <Inbox className="h-7 w-7 text-text-muted" strokeWidth={1.75} />
          </span>
          <p className="mt-4 font-bold text-brand-dark">Aún no hay inscripciones</p>
          <p className="mt-1 max-w-sm text-sm text-text-muted">
            Cuando una familia complete el alta en la web, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {jugadores.map((j) => {
            const principal = j.tutores.find((t) => t.esContactoPrincipal) ?? j.tutores[0];
            const mandato = principal?.tutor.mandatos[0];
            const cuotasJugador = cuotas
              .filter((c) => c.jugadorId === j.id)
              .sort((a, b) => a.periodo.localeCompare(b.periodo));

            return (
              <section key={j.id} className="rounded-2xl border border-border bg-surface shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 p-6">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand font-display text-lg font-extrabold text-white">
                      {j.nombre.charAt(0)}
                    </span>
                    <div>
                      <p className="flex flex-wrap items-center gap-2 text-lg font-extrabold text-brand-dark">
                        <Baby className="h-4 w-4 text-brand" strokeWidth={2} />
                        {j.nombre} {j.apellidos}
                        {j.equipo && (
                          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                            {j.equipo.nombre}
                          </span>
                        )}
                      </p>
                      {principal && (
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-text-muted">
                          <UserRound className="h-3.5 w-3.5" strokeWidth={2} />
                          Tutor:{" "}
                          <span className="font-semibold text-brand-dark">
                            {principal.tutor.nombre} {principal.tutor.apellidos}
                          </span>
                          {principal.tutor.email && <span>· {principal.tutor.email}</span>}
                          {principal.tutor.telefono && <span>· {principal.tutor.telefono}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      mandato ? "bg-green-100 text-green-700" : "bg-accent/20 text-[#9a6400]"
                    }`}
                  >
                    <Landmark className="h-3.5 w-3.5" strokeWidth={2} />
                    {mandato ? `Domiciliado ····${mandato.ibanLast4} (${mandato.estado.toLowerCase()})` : "Sin domiciliación"}
                  </span>
                </div>

                {cuotasJugador.length > 0 && (
                  <div className="border-t border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-[0.7rem] font-bold uppercase tracking-[0.1em] text-text-muted">
                          <th className="px-6 py-2.5">Concepto</th>
                          <th className="px-3 py-2.5">
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="h-3.5 w-3.5" strokeWidth={2} />
                              Periodo
                            </span>
                          </th>
                          <th className="px-3 py-2.5 text-right">Importe</th>
                          <th className="px-6 py-2.5 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cuotasJugador.map((c) => {
                          const b = badgeCuota(c.estado, !!mandato);
                          return (
                            <tr key={c.id} className="border-b border-border last:border-0">
                              <td className="px-6 py-3 font-semibold text-brand-dark">{c.concepto}</td>
                              <td className="px-3 py-3 text-text-muted">{c.periodo}</td>
                              <td className="px-3 py-3 text-right font-display text-base font-extrabold text-brand-dark">
                                {formatEuros(c.importeCentimos)}
                              </td>
                              <td className="px-6 py-3 text-right">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.cls}`}>{b.txt}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
