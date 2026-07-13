import Link from "next/link";
import { DashboardNav, type NavItem } from "@/components/dashboard-nav";
import { LogoutButton } from "@/components/logout-button";

const NAV: NavItem[] = [
  { href: "/intranet", label: "Dashboard", icon: "dashboard" },
  { href: "/intranet/pagos", label: "Pagos", icon: "pagos" },
  { href: "/intranet/documentos", label: "Documentación", icon: "documentos" },
  { href: "/intranet/comunicaciones", label: "Comunicaciones", icon: "comunicaciones" },
  { href: "/intranet/calendario", label: "Calendario", icon: "calendario" },
];

export default function IntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SEGURIDAD: zona protegida por middleware.ts, que verifica la firma del
  // JWT real (cookie httpOnly `access_token` emitida por la API).

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
            Área de cantera
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
