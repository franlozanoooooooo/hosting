import Link from "next/link";
import { Construction, ArrowRight } from "lucide-react";

/**
 * Sección del panel pendiente de construir (requiere la API/BD conectada).
 * Mantiene el panel navegable sin 404 mientras se desarrolla.
 */
export function AdminPlaceholder({
  titulo,
  desc,
  ctaHref,
  ctaLabel,
}: {
  titulo: string;
  desc: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">{titulo}</h1>
        <p className="mt-1 text-text-muted">{desc}</p>
      </header>

      <div className="flex flex-col items-center rounded-2xl border border-border bg-surface px-6 py-16 text-center shadow-sm">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15">
          <Construction className="h-7 w-7 text-[#9a6400]" strokeWidth={1.75} />
        </span>
        <p className="mt-4 font-bold text-brand-dark">Sección en construcción</p>
        <p className="mt-1 max-w-md text-sm text-text-muted">
          Esta vista se activará al conectar la base de datos y la API del club.
          La estructura y los permisos (RBAC) ya están preparados en el backend.
        </p>
        {ctaHref && ctaLabel && (
          <Link href={ctaHref} className="btn btn-primary mt-6">
            {ctaLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        )}
      </div>
    </div>
  );
}
