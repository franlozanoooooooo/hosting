import Link from "next/link";
import { DashboardNav, type NavItem } from "@/components/dashboard-nav";
import { LogoutButton } from "@/components/logout-button";

const NAV: NavItem[] = [
  { href: "/admin", label: "Resumen", icon: "dashboard" },
  { href: "/admin/inscripciones", label: "Inscripciones", icon: "inscripciones" },
  { href: "/admin/jugadores", label: "Jugadores", icon: "jugadores" },
  { href: "/admin/equipos", label: "Equipos", icon: "equipos" },
  { href: "/admin/familias", label: "Familias", icon: "familias" },
  { href: "/admin/pagos", label: "Pagos", icon: "pagos" },
  { href: "/admin/noticias", label: "Noticias", icon: "noticias" },
  { href: "/admin/comunicaciones", label: "Comunicaciones", icon: "comunicaciones" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SEGURIDAD: zona protegida por middleware.ts — exige rol ADMIN en la
  // cookie de sesión demo. En producción, validar el JWT contra la API y
  // exigir un rol de ROLES_ADMIN (@caa/shared) manteniendo el middleware.

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="flex flex-col bg-brand-dark p-4 text-white lg:w-64 lg:shrink-0">
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2 pt-2">
          <img
            src="/escudo-blanco.png"
            alt="Escudo del Club Atlético Antoniano"
            className="h-11 w-auto"
          />
          <span className="text-sm font-bold leading-tight">
            Panel de gestión
          </span>
        </Link>

        <DashboardNav items={NAV} />

        <div className="mt-auto pt-6">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 bg-surface-muted">
        <div className="mx-auto w-full max-w-5xl p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
