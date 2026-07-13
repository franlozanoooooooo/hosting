"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Megaphone,
  CalendarDays,
  Users,
  ShieldHalf,
  UsersRound,
  Newspaper,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

// Registro de iconos: el layout (server component) pasa una CLAVE serializable
// y aquí (client component) la resolvemos al icono. No se pueden pasar
// componentes de React como props de un server a un client component.
const ICONS = {
  dashboard: LayoutDashboard,
  pagos: CreditCard,
  documentos: FileText,
  comunicaciones: Megaphone,
  calendario: CalendarDays,
  jugadores: Users,
  equipos: ShieldHalf,
  familias: UsersRound,
  noticias: Newspaper,
  inscripciones: ClipboardList,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof ICONS;
export type NavItem = { href: string; label: string; icon: IconKey };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active =
          item.href === pathname ||
          (item.href !== "/intranet" &&
            item.href !== "/admin" &&
            pathname.startsWith(item.href));
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
