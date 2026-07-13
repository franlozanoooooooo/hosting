"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Users, Trophy, ShieldHalf, type LucideIcon } from "lucide-react";

type Stat = {
  icon: LucideIcon;
  valor: number;
  sufijo?: string;
  etiqueta: string;
  detalle: string;
};

const STATS: Stat[] = [
  { icon: CalendarDays, valor: 63, etiqueta: "Años de historia", detalle: "Fundado en 1963" },
  { icon: ShieldHalf, valor: 14, etiqueta: "Equipos de cantera", detalle: "De prebenjamín a juvenil" },
  { icon: Users, valor: 280, sufijo: "+", etiqueta: "Jugadores formados", detalle: "Cada temporada" },
  { icon: Trophy, valor: 2023, etiqueta: "Ascenso a 2ª RFEF", detalle: "Campeones de grupo el 23 de abril" },
];

function useCountUp(target: number, run: boolean, ms = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start = 0;
    const step = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / ms, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return value;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const value = useCountUp(stat.valor, run);
  const Icon = stat.icon;
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <Icon className="h-7 w-7 text-brand" strokeWidth={1.75} />
      <span className="mt-4 font-display text-5xl font-extrabold tabular-nums text-brand-dark sm:text-6xl">
        {value}
        {stat.sufijo ?? ""}
      </span>
      <span className="mt-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-brand-dark">
        {stat.etiqueta}
      </span>
      <span className="mt-1 text-xs text-text-muted">{stat.detalle}</span>
    </div>
  );
}

export function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-px overflow-hidden border border-border bg-border lg:grid-cols-4"
    >
      {STATS.map((s) => (
        <div key={s.etiqueta} className="bg-surface">
          <StatItem stat={s} run={run} />
        </div>
      ))}
    </div>
  );
}
