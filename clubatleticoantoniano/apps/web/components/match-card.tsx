import { CalendarDays, MapPin } from "lucide-react";

export type MatchTeam = {
  nombre: string;
  abreviatura: string;
};

export type Match = {
  id: string;
  competicion: string;
  fecha: string; // legible, p.ej. "Dom 15 jun · 18:00"
  fechaISO?: string; // ISO 8601 para cuenta atrás, p.ej. "2026-06-15T18:00:00"
  local: MatchTeam;
  visitante: MatchTeam;
  estadio?: string;
  golesLocal?: number;
  golesVisitante?: number;
  estado: "proximo" | "finalizado";
};

function Crest({ abreviatura }: { abreviatura: string }) {
  if (abreviatura === "CAA") {
    return (
      <img
        src="/escudo.png"
        alt="Escudo del Club Atlético Antoniano"
        className="h-12 w-auto"
      />
    );
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center border border-border-strong bg-surface font-display text-sm font-extrabold tracking-tight text-brand-dark">
      {abreviatura}
    </span>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const finalizado = match.estado === "finalizado";

  return (
    <article className="border border-border bg-surface transition-colors hover:border-border-strong">
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
        <span className="font-display text-sm font-bold uppercase tracking-wide text-brand">
          {match.competicion}
        </span>
        <span
          className={`text-[0.65rem] font-bold uppercase tracking-[0.14em] ${
            finalizado ? "text-text-muted" : "text-brand"
          }`}
        >
          {finalizado ? "Final" : "Próximo"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-6">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <Crest abreviatura={match.local.abreviatura} />
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
            {match.local.nombre}
          </span>
        </div>

        <div className="flex min-w-16 flex-col items-center">
          {finalizado ? (
            <span className="font-display text-4xl font-extrabold tabular-nums text-brand-dark">
              {match.golesLocal}–{match.golesVisitante}
            </span>
          ) : (
            <span className="font-display text-2xl font-bold tracking-widest text-text-muted">
              VS
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <Crest abreviatura={match.visitante.abreviatura} />
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-dark">
            {match.visitante.nombre}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5 border-t border-border px-5 py-3 text-center text-xs text-text-muted">
        <span className="inline-flex items-center gap-1.5 font-semibold text-brand-dark">
          <CalendarDays className="h-3.5 w-3.5 text-brand" strokeWidth={2} />
          {match.fecha}
        </span>
        {match.estadio && (
          <span className="inline-flex items-center gap-1.5 text-[0.7rem]">
            <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
            {match.estadio}
          </span>
        )}
      </div>
    </article>
  );
}
