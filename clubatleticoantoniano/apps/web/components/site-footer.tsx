import Link from "next/link";
import { MapPin } from "lucide-react";
import { SOCIAL_LINKS, SocialIcon } from "@/components/social-icons";
import { NewsletterForm } from "@/components/newsletter-form";

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-base font-bold uppercase tracking-[0.12em] text-white">
        {title}
      </h3>
      <ul className="mt-5 space-y-2.5 text-sm text-white/65">{children}</ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-dark text-white">
      <div className="h-1.5 bg-brand" aria-hidden />

      {/* Franja de newsletter */}
      <div className="border-b border-white/10">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-10 lg:flex-row lg:items-center">
          <div>
            <p className="eyebrow eyebrow-light">No te pierdas nada</p>
            <h3 className="mt-3 font-display text-2xl font-extrabold uppercase tracking-tight">
              Recibe las novedades del club
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/55">
              Convocatorias, partidos, noticias de cantera y entradas, directos a tu correo.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src="/escudo-blanco.png"
              alt="Escudo del Club Atlético Antoniano"
              className="h-14 w-auto"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-extrabold uppercase tracking-tight">
                Club Atlético
              </span>
              <span className="font-display text-lg font-extrabold uppercase tracking-[0.22em] text-brand">
                Antoniano
              </span>
            </span>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
            Más que un club: una familia. Formando deportistas y personas en
            Lebrija desde 1963.
          </p>

          <ul className="mt-6 space-y-2.5 text-sm text-white/65">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
              <span>
                Estadio Municipal de Lebrija
                <br />
                Lebrija (Sevilla) · Andalucía, España
              </span>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/70 transition-colors hover:border-brand hover:bg-brand hover:text-white"
              >
                <SocialIcon name={s.key} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <Col title="El club">
          <li><Link href="/club" className="hover:text-white">Historia</Link></li>
          <li><Link href="/cantera" className="hover:text-white">Cantera</Link></li>
          <li><Link href="/club" className="hover:text-white">Patrocinadores</Link></li>
        </Col>

        <Col title="Web">
          <li><Link href="/noticias" className="hover:text-white">Noticias</Link></li>
          <li><Link href="/entradas" className="hover:text-white">Entradas</Link></li>
          <li><Link href="/contacto" className="hover:text-white">Contacto</Link></li>
        </Col>

        <Col title="Legal">
          <li><Link href="/club" className="hover:text-white">Aviso legal</Link></li>
          <li><Link href="/club" className="hover:text-white">Privacidad (RGPD)</Link></li>
          <li><Link href="/club" className="hover:text-white">Política de cookies</Link></li>
        </Col>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/45 sm:flex-row">
          <p>© {year} Club Atlético Antoniano. Todos los derechos reservados.</p>
          <p>Fotografías © Raúl Pajares · Tratamiento de datos conforme al RGPD.</p>
        </div>
      </div>
    </footer>
  );
}
