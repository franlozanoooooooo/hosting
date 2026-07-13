"use client";

/**
 * Feed de Instagram para la sección "Actualidad".
 *
 * Vía oficial y permitida: un widget que usa la API de Instagram (Meta).
 * Recomendado: LightWidget o Behold (plan gratis). El club conecta @caantoniano
 * una vez y pega aquí el ID del widget en .env:
 *   NEXT_PUBLIC_LIGHTWIDGET_ID=xxxxxxxx
 *
 * Si no hay ID configurado, mostramos un hueco con el estilo del club
 * (la maquetación queda lista para el día que se conecte).
 */
const WIDGET_ID = process.env.NEXT_PUBLIC_LIGHTWIDGET_ID;
const IG_URL = "https://www.instagram.com/caantoniano/";

export function InstagramFeed() {
  if (WIDGET_ID) {
    return (
      <iframe
        src={`https://cdn.lightwidget.com/widgets/${WIDGET_ID}.html`}
        title="Instagram del Club Atlético Antoniano"
        scrolling="no"
        className="w-full border border-border"
        style={{ height: 540 }}
      />
    );
  }

  // Mientras el club no conecte la cuenta: rejilla con fotos reales del club,
  // cada una enlazando al perfil de Instagram.
  const FOTOS = [
    { src: "/images/partido-11.jpg", alt: "La nueva equipación carmín del Antoniano" },
    { src: "/images/partido-05.jpg", alt: "Jugadores del Antoniano durante un partido" },
    { src: "/images/partido-02.jpg", alt: "El equipo celebrando con la afición" },
    { src: "/images/partido-12.jpg", alt: "Día de partido en el Municipal de Lebrija" },
  ];

  return (
    <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {FOTOS.map((f) => (
        <a
          key={f.src}
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block aspect-square overflow-hidden"
          aria-label="Abrir el Instagram del club"
        >
          <img
            src={f.src}
            alt={f.alt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-brand-dark/0 transition-colors group-hover:bg-brand-dark/45">
            <span className="font-display text-sm font-bold uppercase tracking-[0.16em] text-white opacity-0 transition-opacity group-hover:opacity-100">
              @caantoniano
            </span>
          </span>
        </a>
      ))}
      <div className="col-span-full flex flex-col items-center gap-3 border-t border-border bg-surface px-6 py-8 text-center sm:col-span-2 lg:col-span-4">
        <p className="text-sm text-text-muted">
          Síguenos en{" "}
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand hover:underline"
          >
            @caantoniano
          </a>{" "}
          para no perderte nada del día a día del club.
        </p>
        <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
          Síguenos en Instagram
        </a>
      </div>
    </div>
  );
}
