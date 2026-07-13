import type { Metadata } from "next";
import Link from "next/link";
import { EQUIPOS_CANTERA } from "@/lib/mock-data";
import {
  Users,
  CalendarRange,
  Layers,
  Heart,
  ShieldCheck,
  Sprout,
  HandHeart,
  Dumbbell,
  Trees,
  Building2,
  Stethoscope,
  ClipboardList,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = { title: "Cantera" };

const ENTRENADORES = [
  { nombre: "Roberto Aguilar", equipo: "Infantil A" },
  { nombre: "Laura Méndez", equipo: "Alevín B" },
  { nombre: "Tomás Niño", equipo: "Cadete A" },
  { nombre: "Elena Ríos", equipo: "Benjamín A" },
];

const INSTALACIONES: { texto: string; icon: LucideIcon }[] = [
  { texto: "2 campos de césped artificial de última generación", icon: Layers },
  { texto: "Campo de césped natural para competición", icon: Trees },
  { texto: "Gimnasio y sala de recuperación", icon: Dumbbell },
  { texto: "Vestuarios renovados y zona de fisioterapia", icon: Stethoscope },
];

const VALORES: { titulo: string; texto: string; icon: LucideIcon }[] = [
  {
    titulo: "Formación con valores",
    texto:
      "Esfuerzo, respeto y compañerismo dentro y fuera del campo. Educamos personas, no solo jugadores.",
    icon: Heart,
  },
  {
    titulo: "Método propio",
    texto:
      "Un modelo de juego común a todas las categorías, con seguimiento individual del desarrollo de cada niño.",
    icon: ClipboardList,
  },
  {
    titulo: "Entorno seguro",
    texto:
      "Cuerpo técnico titulado y protocolos de protección del menor en todas las actividades del club.",
    icon: ShieldCheck,
  },
  {
    titulo: "Crecimiento real",
    texto:
      "Puente directo con el primer equipo: la cantera es la base del proyecto deportivo del Antoniano.",
    icon: Sprout,
  },
];

export default function CanteraPage() {
  const totalEquipos = EQUIPOS_CANTERA.reduce((n, c) => n + c.equipos, 0);

  return (
    <div>
      {/* Héroe con foto de la cantera en partido */}
      <section className="page-hero">
        <img src="/images/partido-03.jpg" alt="" className="page-hero-img" />
        <div className="container-page relative py-24 lg:py-32">
          <p className="eyebrow eyebrow-light">Fútbol base</p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight sm:text-6xl lg:text-7xl">
            La Cantera
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">
            Más de 250 niños y niñas forman parte del proyecto formativo del
            Club Atlético Antoniano. Educamos a través del fútbol con valores de
            esfuerzo, respeto y compañerismo.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-sm font-semibold uppercase tracking-[0.12em] text-white/85">
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" strokeWidth={2} />
              +250 deportistas
            </span>
            <span className="inline-flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" strokeWidth={2} />
              {totalEquipos} equipos
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-accent" strokeWidth={2} />6
              categorías
            </span>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <p className="eyebrow">De prebenjamín a juvenil</p>
        <h2 className="mt-3 flex items-center gap-2.5 font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark">
          Equipos por categoría
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EQUIPOS_CANTERA.map((c) => (
            <div
              key={c.categoria}
              className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Users className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                  {c.equipos} equipos
                </span>
              </div>
              <h3 className="mt-4 font-display text-xl font-bold uppercase tracking-tight text-brand-dark">
                {c.categoria}
              </h3>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-muted">
                <CalendarRange className="h-4 w-4 text-brand" strokeWidth={2} />
                {c.edad}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <p className="eyebrow">Nuestro proyecto</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight text-brand-dark">
            Por qué elegirnos
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.titulo}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 font-bold text-brand-dark">{v.titulo}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                    {v.texto}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2.5 font-display text-2xl font-extrabold uppercase tracking-tight text-brand-dark">
              <ClipboardList className="h-5 w-5 text-brand" strokeWidth={2} />
              Entrenadores
            </h2>
            <ul className="mt-6 space-y-3">
              {ENTRENADORES.map((e) => (
                <li
                  key={e.nombre}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <span className="inline-flex items-center gap-2.5 font-semibold text-brand-dark">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark font-display text-xs font-bold text-white">
                      {e.nombre
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    {e.nombre}
                  </span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-text-muted">
                    {e.equipo}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="flex items-center gap-2.5 font-display text-2xl font-extrabold uppercase tracking-tight text-brand-dark">
              <Building2 className="h-5 w-5 text-brand" strokeWidth={2} />
              Instalaciones
            </h2>
            <ul className="mt-6 space-y-3">
              {INSTALACIONES.map((i) => {
                const Icon = i.icon;
                return (
                  <li
                    key={i.texto}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-brand-dark"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
                    <span>{i.texto}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page pb-16">
        {/* CTA de captación sobre foto de partido */}
        <div className="card-photo rounded-2xl p-8 sm:p-12">
          <img src="/images/partido-08.jpg" alt="" />
          <div className="stripes-brand absolute inset-x-0 top-0 h-2" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/80">
              <HandHeart className="h-4 w-4 text-accent" strokeWidth={2} />
              Plazas limitadas
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
              Captación 2026/27 abierta
            </h2>
            <p className="mt-3 max-w-xl text-white/85">
              ¿Tu hijo o hija quiere formar parte del club? Realizamos pruebas de
              acceso para todas las categorías, de prebenjamín a juvenil.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contacto" className="btn btn-primary">
                <MessageCircle className="h-4 w-4" strokeWidth={2} />
                Contactar con la coordinación
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
