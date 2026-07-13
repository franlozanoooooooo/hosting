"use client";

import { useEffect, useState } from "react";

type Parts = { dias: number; horas: number; min: number; seg: number; fin: boolean };

function diff(target: number): Parts {
  const ms = target - Date.now();
  if (ms <= 0) return { dias: 0, horas: 0, min: 0, seg: 0, fin: true };
  const seg = Math.floor(ms / 1000);
  return {
    dias: Math.floor(seg / 86400),
    horas: Math.floor((seg % 86400) / 3600),
    min: Math.floor((seg % 3600) / 60),
    seg: seg % 60,
    fin: false,
  };
}

function Box({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-2xl font-extrabold tabular-nums leading-none sm:text-3xl">
        {String(valor).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-white/55">
        {etiqueta}
      </span>
    </div>
  );
}

/** Cuenta atrás en vivo hacia una fecha ISO. Pensada para fondo oscuro. */
export function Countdown({ targetISO }: { targetISO: string }) {
  const target = new Date(targetISO).getTime();
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(diff(target)); // primer cálculo en cliente (evita desajuste SSR)
    const id = setInterval(() => setParts(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!parts) {
    // Placeholder estable para el render del servidor
    return <div className="h-[52px]" aria-hidden />;
  }

  if (parts.fin) {
    return (
      <p className="font-display text-lg font-bold uppercase tracking-wide text-brand">
        ¡Partido en juego!
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <Box valor={parts.dias} etiqueta="Días" />
      <span className="font-display text-2xl text-white/30 sm:text-3xl">:</span>
      <Box valor={parts.horas} etiqueta="Horas" />
      <span className="font-display text-2xl text-white/30 sm:text-3xl">:</span>
      <Box valor={parts.min} etiqueta="Min" />
      <span className="font-display text-2xl text-white/30 sm:text-3xl">:</span>
      <Box valor={parts.seg} etiqueta="Seg" />
    </div>
  );
}
