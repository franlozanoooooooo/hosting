"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, Menu, Ticket, X as XClose } from "lucide-react";
import { SOCIAL_LINKS, SocialIcon } from "@/components/social-icons";
import { TICKETS_URL } from "@/lib/links";

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/noticias", label: "Noticias" },
  { href: "/cantera", label: "Cantera" },
  { href: "/entradas", label: "Entradas" },
  { href: "/club", label: "Club" },
  { href: "/contacto", label: "Contacto" },
] as const;

function Crest({ size = "h-12" }: { size?: string }) {
  return (
    <img
      src="/escudo-blanco.png"
      alt="Escudo del Club Atlético Antoniano"
      className={`${size} w-auto`}
    />
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Inicio">
      <Crest />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-extrabold uppercase tracking-tight text-white">
          Club Atlético
        </span>
        <span className="font-display text-xl font-extrabold uppercase tracking-[0.22em] text-brand">
          Antoniano
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      {/* Barra institucional superior */}
      <div className="hidden border-b border-white/10 bg-black/95 text-white/60 lg:block">
        <div className="container-page flex h-9 items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.16em]">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-brand" strokeWidth={2.25} />
            Lebrija · Sevilla — Fundado en 1963
          </span>
          <nav className="flex items-center gap-4">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="transition-colors hover:text-white"
              >
                <SocialIcon name={s.key} className="h-4 w-4" />
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Barra principal — tinta de estadio nocturno */}
      <div className="border-b-2 border-brand bg-brand-dark">
        <div className="container-page flex h-20 items-center justify-between">
          <Logo />

          <nav className="hidden items-center lg:flex">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 font-display text-base font-bold uppercase tracking-wide transition-colors ${
                    active
                      ? "text-white"
                      : "text-white/65 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-4 -bottom-[3px] h-[3px] bg-brand transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={TICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light hidden h-11 xl:inline-flex"
            >
              <Ticket className="h-4 w-4" strokeWidth={2} />
              Entradas
            </a>
            <button
              type="button"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center border border-white/25 text-white transition-colors hover:bg-brand lg:hidden"
            >
              <span className="sr-only">Menú</span>
              {open ? <XClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="border-b border-white/10 bg-brand-dark lg:hidden">
          <div className="container-page flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-l-2 px-3 py-3 font-display text-lg font-bold uppercase tracking-wide ${
                  isActive(item.href)
                    ? "border-brand text-white"
                    : "border-transparent text-white/65"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={TICKETS_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="btn btn-outline-light mt-2"
            >
              <Ticket className="h-4 w-4" strokeWidth={2} />
              Comprar entradas
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
