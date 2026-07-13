import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type News = {
  id: string;
  titulo: string;
  resumen: string;
  categoria: string;
  fecha: string; // legible
  destacada?: boolean;
  imagen?: string; // ruta en /public
};

const CATEGORY_COLOR: Record<string, string> = {
  "Primer Equipo": "bg-brand text-white",
  Cantera: "bg-brand-dark text-white",
  Club: "bg-accent text-brand-dark",
};

export function NewsCard({
  news,
  featured = false,
}: {
  news: News;
  featured?: boolean;
}) {
  const tag = CATEGORY_COLOR[news.categoria] ?? "bg-brand-dark text-white";

  return (
    <article
      className={`group flex flex-col overflow-hidden border border-border bg-surface transition-colors hover:border-border-strong ${
        featured ? "sm:flex-row" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-brand-dark ${
          featured ? "min-h-56 sm:w-1/2" : "h-44"
        }`}
      >
        {news.imagen && (
          <img
            src={news.imagen}
            alt={news.titulo}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span
          className={`absolute left-0 top-0 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] ${tag}`}
        >
          {news.categoria}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-text-muted">
          {news.fecha}
        </span>

        <h3
          className={`mt-2 font-display font-bold uppercase leading-tight tracking-tight text-brand-dark transition-colors group-hover:text-brand ${
            featured ? "text-3xl" : "text-xl"
          }`}
        >
          {news.titulo}
        </h3>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-text-muted">
          {news.resumen}
        </p>

        <Link href="/noticias" className="link-more mt-4">
          Leer noticia
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
        </Link>
      </div>
    </article>
  );
}
