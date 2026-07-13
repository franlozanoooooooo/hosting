"use client";

import { useEffect, useState } from "react";

/**
 * Animación de entrada: página en blanco con el escudo apareciendo entre dos
 * líneas carmín que crecen, y fundido de salida (réplica de la intro de la
 * maqueta del club). Se muestra una vez por sesión y respeta la preferencia
 * de "reducir movimiento" del sistema.
 */
type Fase = "inicio" | "abierto" | "saliendo" | "oculto";

const CLAVE = "caa-intro-vista";

export function IntroOverlay() {
  // Se renderiza visible desde el servidor para que la intro cubra el primer
  // pintado (sin parpadeo de contenido).
  const [fase, setFase] = useState<Fase>("inicio");

  useEffect(() => {
    const yaVista = sessionStorage.getItem(CLAVE) === "1";
    const sinAnimaciones = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (yaVista || sinAnimaciones) {
      sessionStorage.setItem(CLAVE, "1");
      setFase("oculto");
      return;
    }
    sessionStorage.setItem(CLAVE, "1");

    // Doble rAF: garantiza que el estado inicial se pinte antes de animar.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setFase("abierto"));
    });
    const salida = setTimeout(() => setFase("saliendo"), 1500);
    const fin = setTimeout(() => setFase("oculto"), 2200);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(salida);
      clearTimeout(fin);
    };
  }, []);

  if (fase === "oculto") return null;

  const abierto = fase === "abierto" || fase === "saliendo";
  const easing = "[transition-timing-function:cubic-bezier(.16,1,.3,1)]";

  return (
    <div
      aria-hidden
      className={`intro-overlay pointer-events-none fixed inset-0 z-[999] flex items-center justify-center bg-white transition-[opacity,visibility] duration-700 ease-out ${
        fase === "saliendo" ? "invisible opacity-0" : "visible opacity-100"
      }`}
    >
      <div className="flex w-full items-center justify-center gap-5 px-6">
        <span
          className={`h-[2px] bg-brand transition-all duration-1000 ${easing} ${
            abierto ? "w-[45%]" : "w-0"
          }`}
        />
        <img
          src="/escudo.png"
          alt=""
          className={`w-24 shrink-0 drop-shadow-lg transition-all duration-1000 ${easing} md:w-32 ${
            abierto ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
        />
        <span
          className={`h-[2px] bg-brand transition-all duration-1000 ${easing} ${
            abierto ? "w-[45%]" : "w-0"
          }`}
        />
      </div>
    </div>
  );
}
