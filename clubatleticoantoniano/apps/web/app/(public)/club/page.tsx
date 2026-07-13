import type { Metadata } from "next";
import {
  Flame,
  Handshake,
  Sprout,
  Users,
  Flag,
  Trophy,
  Star,
  Medal,
  Sparkles,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import { PATROCINADORES } from "@/lib/patrocinadores";

export const metadata: Metadata = { title: "El Club" };

const VALORES = [
  {
    titulo: "Esfuerzo",
    desc: "El trabajo y la constancia están por encima del talento.",
    icon: Flame,
    foto: "/images/partido-03.jpg",
  },
  {
    titulo: "Respeto",
    desc: "Hacia compañeros, rivales, árbitros y aficionados.",
    icon: Handshake,
    foto: "/images/partido-08.jpg",
  },
  {
    titulo: "Cantera",
    desc: "Apostamos por el talento local y la formación propia.",
    icon: Sprout,
    foto: "/images/partido-10.jpg",
  },
  {
    titulo: "Comunidad",
    desc: "Somos parte de Lebrija y trabajamos por su gente.",
    icon: Users,
    foto: "/images/partido-06.jpg",
  },
] as const;

const HITOS = [
  {
    anio: "1963",
    titulo: "Fundación del club",
    desc: "Nace de la mano de un grupo de jóvenes de la Juventud Antoniana, con el decisivo apoyo de los Padres Franciscanos. Su nombre honra a San Antonio de Padua.",
    icon: Flag,
  },
  {
    anio: "Jul. 1963",
    titulo: "Inscripción federativa",
    desc: "El 27 de julio se inscribe en la Federación Andaluza y comienza en categoría Provincial, jugando en el histórico Campo Municipal de la Victoria.",
    icon: ClipboardList,
  },
  {
    anio: "2019-20",
    titulo: "Debut en la Copa del Rey",
    desc: "Primera participación en el torneo del KO. El sorteo depara un Antoniano–Real Betis y el club disputa la eliminatoria en el Benito Villamarín.",
    icon: Star,
  },
  {
    anio: "2023",
    titulo: "Ascenso histórico a Segunda Federación",
    desc: "El 23 de abril, el Antoniano se proclama campeón de su grupo de Tercera Federación y alcanza por primera vez una categoría nacional.",
    icon: Trophy,
  },
  {
    anio: "2023-24",
    titulo: "La Copa del Rey, en el Municipal",
    desc: "Segunda participación copera y primera en casa: el CD Lugo visita el Municipal de Lebrija en la primera ronda del torneo.",
    icon: Medal,
  },
  {
    anio: "2025-26",
    titulo: "La gesta copera",
    desc: "Tercera participación y primera victoria del club en la Copa del Rey al eliminar al CD Castellón (1-0). En segunda ronda rozó la machada ante el Villarreal CF: 1-1 tras la prórroga y eliminación en los penaltis.",
    icon: Sparkles,
  },
  {
    anio: "Hoy",
    titulo: "Asentado en 2ª RFEF",
    desc: "El club compite en Segunda Federación y juega como local en el Estadio Municipal de Lebrija, con la cantera como corazón del proyecto.",
    icon: ShieldCheck,
  },
] as const;

export default function ClubPage() {
  return (
    <div>
      <section className="page-hero">
        <img src="/images/partido-07.jpg" alt="" className="page-hero-img" />
        <div className="container-page relative py-24 lg:py-32">
          <p className="eyebrow eyebrow-light">Desde 1963</p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight sm:text-6xl lg:text-7xl">
            El Club
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">
            Fundado en 1963, el Club Atlético Antoniano es una de las
            instituciones deportivas históricas de Lebrija. Más de seis décadas
            defendiendo sus colores con orgullo.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <span className="eyebrow">La entidad</span>
        <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark">
          Nuestra historia
        </h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 text-text-muted">
            <p>
              El Club Atlético Antoniano nació en 1963 de la mano de un grupo
              de jóvenes de la Juventud Antoniana, con el decisivo apoyo de los
              Padres Franciscanos. Su nombre rinde homenaje a San Antonio de
              Padua, símbolo de los valores de humildad y entrega que han
              marcado al club desde entonces.
            </p>
            <p>
              Inscrito en la Federación Andaluza el 27 de julio de 1963,
              comenzó su andadura en categoría Provincial disputando sus
              partidos en el histórico Campo Municipal de la Victoria. Hoy
              juega como local en el Estadio Municipal de Lebrija (Sevilla).
            </p>
            <p>
              El 23 de abril de 2023, el Antoniano logró un hito histórico al
              ascender a Segunda Federación tras proclamarse campeón de su
              grupo en Tercera Federación, alcanzando por primera vez una
              categoría nacional.
            </p>
            <figure className="pt-2">
              <div className="border border-border">
                <img
                  src="/images/partido-12.jpg"
                  alt="El primer equipo del Antoniano durante un partido en el Municipal"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
              <div className="stripes-brand mt-0 h-1.5" />
              <figcaption className="mt-2 text-xs uppercase tracking-[0.14em] text-text-muted">
                El carmín, sobre el césped del Municipal de Lebrija.
              </figcaption>
            </figure>
          </div>

          <ol className="relative space-y-6 border-l border-border pl-7">
            {HITOS.map((h) => (
              <li key={h.anio} className="relative">
                <span className="absolute -left-[calc(1.75rem+1px)] flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-brand">
                  <h.icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <p className="font-display text-lg font-bold uppercase leading-none tracking-tight text-brand">
                  {h.anio}
                </p>
                <p className="mt-1 font-semibold text-brand-dark">{h.titulo}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted">
                  {h.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <span className="eyebrow">Lo que nos define</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark">
            Nuestros valores
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map((v) => (
              <div key={v.titulo} className="card-photo">
                <img src={v.foto} alt="" />
                <div className="relative">
                  <span className="flex h-10 w-10 items-center justify-center bg-brand text-white">
                    <v.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold uppercase tracking-tight">
                    {v.titulo}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/80">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <span className="eyebrow">Con el apoyo de</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark">
            Patrocinadores
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Empresas de Lebrija y la comarca que hacen posible el día a día del
            club, temporada tras temporada.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PATROCINADORES.map((p) => (
              <a
                key={p.nombre}
                href={p.web}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-32 flex-col items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 text-center transition-colors hover:border-brand"
              >
                <img
                  src={p.logo}
                  alt={`Logo de ${p.nombre}`}
                  className={`h-11 w-auto max-w-full object-contain ${p.logoClass ?? ""}`}
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted group-hover:text-brand-dark">
                  {p.nombre}
                </span>
              </a>
            ))}
          </div>
          <a href="/contacto" className="btn btn-outline-dark mt-6">
            Hazte patrocinador
          </a>
        </div>
      </section>
    </div>
  );
}
