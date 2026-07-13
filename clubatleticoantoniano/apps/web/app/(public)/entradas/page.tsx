import type { Metadata } from "next";
import { Ticket, ArrowUpRight } from "lucide-react";
import { TICKETS_URL } from "@/lib/links";

export const metadata: Metadata = { title: "Entradas" };

export default function EntradasPage() {
  return (
    <div>
      {/* Héroe con foto de la grada del Municipal */}
      <section className="page-hero">
        <img src="/images/partido-10.jpg" alt="" className="page-hero-img" />
        <div className="container-page relative py-24 lg:py-32">
          <p className="eyebrow eyebrow-light">
            <Ticket
              className="mr-1.5 inline h-4 w-4 text-accent"
              strokeWidth={2}
            />
            Venta oficial
          </p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight sm:text-6xl lg:text-7xl">
            Entradas
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">
            Asegura tu sitio en el Municipal. Compra anticipada a través del
            proveedor oficial del club, con acceso directo el día del partido.
          </p>
        </div>
      </section>

      <div className="container-page py-12">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="stripes-brand h-1.5" />
          <div className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-brand-dark">
                Compra tu entrada
              </h2>
              <p className="mt-2 max-w-lg text-sm text-text-muted">
                La venta de entradas de los partidos del primer equipo se
                gestiona a través del proveedor oficial de ticketing del club.
              </p>
            </div>
            <a
              href={TICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary shrink-0"
            >
              <Ticket className="h-4 w-4" strokeWidth={2} />
              Comprar entradas
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
