import type { Metadata } from "next";
import { InstagramFeed } from "@/components/instagram-feed";

export const metadata: Metadata = { title: "Noticias" };

export default function NoticiasPage() {
  return (
    <div>
      <section className="page-hero">
        <img src="/images/partido-02.jpg" alt="" className="page-hero-img" />
        <div className="container-page relative py-24 lg:py-32">
          <p className="eyebrow eyebrow-light">Actualidad</p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight sm:text-6xl lg:text-7xl">
            Noticias
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">
            Toda la actualidad del Club Atlético Antoniano.
          </p>
        </div>
      </section>

      <div className="container-page py-12">
        <p className="max-w-2xl text-lg leading-relaxed text-text-muted">
          Contamos el día a día del club allí donde está nuestra gente: en las
          redes sociales. Convocatorias, resultados, cantera y toda la vida del
          Antoniano, publicados al momento.
        </p>

        {/*
          Aquí irá el plugin que muestra automáticamente las publicaciones de
          redes sociales (p. ej. LightWidget/Behold con la cuenta @caantoniano,
          configurando NEXT_PUBLIC_LIGHTWIDGET_ID en .env). Mientras tanto, el
          componente InstagramFeed hace de contenedor: si el ID del widget está
          configurado lo incrusta, y si no, muestra la rejilla de fotos con
          enlace al perfil.
        */}
        <div className="mt-10">
          <InstagramFeed />
        </div>
      </div>
    </div>
  );
}
