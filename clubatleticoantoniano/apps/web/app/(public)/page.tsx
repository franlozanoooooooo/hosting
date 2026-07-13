import Link from "next/link";
import { ArrowRight, MapPin, Ticket, Trophy, Users } from "lucide-react";
import { InstagramFeed } from "@/components/instagram-feed";
import { StatsBand } from "@/components/stats-band";
import { PATROCINADORES } from "@/lib/patrocinadores";
import { TICKETS_URL } from "@/lib/links";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-brand-dark text-white">
        <img
          src="/images/partido-01.jpg"
          alt="Jugadores del Club Atlético Antoniano saltando al campo"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/35" aria-hidden />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark/90 to-transparent" aria-hidden />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1.5 bg-brand" aria-hidden />

        <div className="container-page relative py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="eyebrow eyebrow-light">Desde 1963 · Lebrija</p>
            <h1 className="mt-6 font-display text-6xl font-extrabold uppercase leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
              Lebrija,
              <br />
              mi <span className="text-brand">fuerza</span> eres tú
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
              La web oficial del Club Atlético Antoniano. Primer equipo,
              cantera y toda la actualidad del club.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={TICKETS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Ticket className="h-4 w-4" strokeWidth={2} />
                Comprar entradas
              </a>
              <Link href="/cantera" className="btn btn-outline-light">
                Conoce la cantera
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
              <div className="inline-flex items-center gap-2">
                <Trophy className="h-4 w-4 text-brand" strokeWidth={2} />
                <dt className="sr-only">Competición</dt>
                <dd>Segunda Federación</dd>
              </div>
              <div className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand" strokeWidth={2} />
                <dt className="sr-only">Sede</dt>
                <dd>Municipal de Lebrija</dd>
              </div>
              <div className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-brand" strokeWidth={2} />
                <dt className="sr-only">Cantera</dt>
                <dd>14 equipos de cantera</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CIFRAS DEL CLUB */}
      <section className="container-page -mt-10 mb-4 sm:-mt-14">
        <div className="relative z-10 shadow-sm">
          <StatsBand />
        </div>
      </section>

      {/* ACTUALIDAD: publicaciones de redes sociales */}
      <section className="relative overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-4 left-2 select-none font-display text-[7rem] font-extrabold uppercase leading-none tracking-tight text-brand-dark/[0.035] sm:text-[10rem]"
        >
          Actualidad
        </span>
        <div className="container-page relative py-20">
          <div className="flex items-end justify-between border-b border-border pb-6">
            <div>
              <p className="eyebrow">El club, al día · @caantoniano</p>
              <h2 className="section-title mt-3">Actualidad</h2>
            </div>
            <Link href="/noticias" className="link-more hidden sm:inline-flex">
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
          <div className="mt-8">
            <InstagramFeed />
          </div>
        </div>
      </section>

      {/* CTA día de partido */}
      <section className="container-page mt-4">
        <div className="card-photo min-h-80 justify-between gap-8 border border-border p-10">
          <img src="/images/partido-10.jpg" alt="Afición en el Estadio Municipal de Lebrija" />
          <div className="relative">
            <p className="eyebrow eyebrow-light">Día de partido</p>
            <h3 className="mt-4 font-display text-4xl font-extrabold uppercase leading-none">
              No te pierdas
              <br />
              ni un partido
            </h3>
            <p className="mt-4 max-w-sm text-white/85">
              Entradas para los próximos encuentros en el Municipal de Lebrija.
            </p>
          </div>
          <Link href="/entradas" className="btn btn-primary w-fit">
            <Ticket className="h-4 w-4" strokeWidth={2} />
            Ver entradas
          </Link>
        </div>
      </section>

      {/* PATROCINADORES */}
      <section className="bg-surface py-16">
        <div className="container-page text-center">
          <p className="eyebrow justify-center text-center">Nuestros patrocinadores</p>
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
            {PATROCINADORES.map((p) => (
              <a
                key={p.nombre}
                href={p.web}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-32 flex-col items-center justify-center gap-3 bg-surface px-6 py-8"
                aria-label={`Web de ${p.nombre}`}
              >
                <img
                  src={p.logo}
                  alt={`Logo de ${p.nombre}`}
                  className={`h-12 w-auto max-w-full object-contain transition-transform group-hover:scale-105 ${p.logoClass ?? ""}`}
                />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted transition-colors group-hover:text-brand-dark">
                  {p.nombre}
                </span>
              </a>
            ))}
          </div>
          <Link href="/contacto" className="btn btn-outline-dark mt-8">
            Hazte patrocinador
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>
    </>
  );
}
