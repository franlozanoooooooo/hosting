import Link from "next/link";
import { Users, ShieldHalf, UsersRound, CreditCard, ArrowRight, type LucideIcon } from "lucide-react";

const STATS: { label: string; valor: string; icon: LucideIcon }[] = [
  { label: "Jugadores", valor: "268", icon: Users },
  { label: "Equipos", valor: "14", icon: ShieldHalf },
  { label: "Familias", valor: "241", icon: UsersRound },
  { label: "Cuotas pendientes", valor: "37", icon: CreditCard },
];

const ACCESOS = [
  { href: "/admin/inscripciones", titulo: "Inscripciones", desc: "Altas de cantera, mandatos SEPA y cuotas." },
  { href: "/admin/jugadores", titulo: "Jugadores", desc: "Altas, bajas y fichas." },
  { href: "/admin/equipos", titulo: "Equipos", desc: "Categorías y plantillas." },
  { href: "/admin/familias", titulo: "Familias", desc: "Tutores y contactos." },
  { href: "/admin/pagos", titulo: "Pagos", desc: "Cuotas y mandatos SEPA." },
  { href: "/admin/noticias", titulo: "Noticias", desc: "Publicar y editar." },
  { href: "/admin/comunicaciones", titulo: "Comunicaciones", desc: "Avisos a familias." },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">
          Panel de gestión
        </h1>
        <p className="mt-1 text-text-muted">
          Resumen general del club. (Datos de demostración.)
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
                <Icon className="h-5 w-5 text-brand" strokeWidth={2} aria-hidden />
              </span>
              <p className="mt-3 text-3xl font-extrabold text-brand-dark">
                {s.valor}
              </p>
              <p className="text-sm text-text-muted">{s.label}</p>
            </div>
          );
        })}
      </div>

      <h2 className="mb-4 mt-10 text-lg font-extrabold text-brand-dark">
        Accesos rápidos
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACCESOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="font-bold text-brand-dark group-hover:text-brand">
              {a.titulo}
            </p>
            <p className="mt-1 text-sm text-text-muted">{a.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              Gestionar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
