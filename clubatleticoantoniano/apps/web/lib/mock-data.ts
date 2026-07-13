/**
 * Datos mock embebidos para que el preview funcione SIN backend.
 * Cuando la API esté lista, estas vistas pasarán a usar `lib/api.ts`.
 */
import type { Match } from "@/components/match-card";
import type { News } from "@/components/news-card";

export const PROXIMO_PARTIDO: Match = {
  id: "m1",
  competicion: "Segunda Federación · J34",
  fecha: "Dom 15 jun · 18:00",
  fechaISO: "2026-06-15T18:00:00",
  estadio: "Estadio Municipal de Lebrija",
  estado: "proximo",
  local: { nombre: "C.A. Antoniano", abreviatura: "CAA" },
  visitante: { nombre: "Atlético Onubense", abreviatura: "ATO" },
};

export const RESULTADOS_RECIENTES: Match[] = [
  {
    id: "r1",
    competicion: "Segunda Federación · J34",
    fecha: "Dom 8 jun",
    estado: "finalizado",
    golesLocal: 2,
    golesVisitante: 1,
    local: { nombre: "C.A. Antoniano", abreviatura: "CAA" },
    visitante: { nombre: "C.D. Utrera", abreviatura: "UTR" },
  },
  {
    id: "r2",
    competicion: "Segunda Federación · J34",
    fecha: "Dom 1 jun",
    estado: "finalizado",
    golesLocal: 0,
    golesVisitante: 0,
    local: { nombre: "Xerez D.F.C.", abreviatura: "XER" },
    visitante: { nombre: "C.A. Antoniano", abreviatura: "CAA" },
  },
  {
    id: "r3",
    competicion: "Copa RFAF · 1/4",
    fecha: "Mié 28 may",
    estado: "finalizado",
    golesLocal: 3,
    golesVisitante: 0,
    local: { nombre: "C.A. Antoniano", abreviatura: "CAA" },
    visitante: { nombre: "Coria C.F.", abreviatura: "COR" },
  },
];

export const NOTICIAS: News[] = [
  {
    id: "n1",
    titulo: "El Antoniano sella la permanencia con una remontada de época",
    resumen:
      "Dos goles en la recta final dan la vuelta al marcador en un Municipal entregado que celebró un curso muy completo.",
    categoria: "Primer Equipo",
    fecha: "8 jun 2026",
    destacada: true,
    imagen: "/images/partido-09.jpg",
  },
  {
    id: "n2",
    titulo: "El Infantil A se proclama campeón de la liga provincial",
    resumen:
      "La cantera roja vuelve a dar alegrías: los de categoría infantil cierran una temporada impecable con el título.",
    categoria: "Cantera",
    fecha: "5 jun 2026",
    imagen: "/images/partido-03.jpg",
  },
  {
    id: "n3",
    titulo: "Abierto el periodo de captación para la temporada 2026/27",
    resumen:
      "El club abre las pruebas de acceso para nuevas incorporaciones desde prebenjamín hasta juvenil. Inscripciones online.",
    categoria: "Cantera",
    fecha: "2 jun 2026",
    imagen: "/images/partido-05.jpg",
  },
  {
    id: "n4",
    titulo: "Renovación del acuerdo con el patrocinador principal",
    resumen:
      "El club asegura su estabilidad económica con la ampliación del contrato de patrocinio por dos temporadas más.",
    categoria: "Club",
    fecha: "29 may 2026",
    imagen: "/images/partido-07.jpg",
  },
  {
    id: "n5",
    titulo: "Nueva equipación oficial: vuelve el carmín clásico",
    resumen:
      "Presentamos la camiseta de la próxima campaña, inspirada en las históricas del club. Ya disponible en la tienda.",
    categoria: "Club",
    fecha: "25 may 2026",
    imagen: "/images/partido-11.jpg",
  },
  {
    id: "n6",
    titulo: "El cadete femenino estrena instalaciones en la ciudad deportiva",
    resumen:
      "El crecimiento del fútbol femenino del club se consolida con nuevos vestuarios y un campo de césped artificial.",
    categoria: "Cantera",
    fecha: "20 may 2026",
    imagen: "/images/partido-08.jpg",
  },
];

export const CATEGORIAS_NOTICIAS = [
  "Todas",
  "Primer Equipo",
  "Cantera",
  "Club",
] as const;

// ───────── Primer equipo ─────────
export type Jugador = {
  id: string;
  nombre: string;
  dorsal: number;
  posicion: "Portero" | "Defensa" | "Centrocampista" | "Delantero";
};

export const PLANTILLA: Jugador[] = [
  { id: "j1", nombre: "Álvaro Ruiz", dorsal: 1, posicion: "Portero" },
  { id: "j13", nombre: "Marcos Gil", dorsal: 13, posicion: "Portero" },
  { id: "j2", nombre: "Javi Morales", dorsal: 2, posicion: "Defensa" },
  { id: "j4", nombre: "Diego Cantos", dorsal: 4, posicion: "Defensa" },
  { id: "j5", nombre: "Pablo Reina", dorsal: 5, posicion: "Defensa" },
  { id: "j3", nombre: "Rubén Vega", dorsal: 3, posicion: "Defensa" },
  { id: "j6", nombre: "Sergio Lara", dorsal: 6, posicion: "Centrocampista" },
  { id: "j8", nombre: "Iván Prieto", dorsal: 8, posicion: "Centrocampista" },
  { id: "j10", nombre: "Nacho Pérez", dorsal: 10, posicion: "Centrocampista" },
  { id: "j14", nombre: "Adri Soto", dorsal: 14, posicion: "Centrocampista" },
  { id: "j7", nombre: "Carlos Mena", dorsal: 7, posicion: "Delantero" },
  { id: "j9", nombre: "Hugo Belmonte", dorsal: 9, posicion: "Delantero" },
  { id: "j11", nombre: "Aitor Salas", dorsal: 11, posicion: "Delantero" },
];

export const CUERPO_TECNICO = [
  { nombre: "Manuel Castro", rol: "Entrenador" },
  { nombre: "Fran Domínguez", rol: "Segundo entrenador" },
  { nombre: "Luis Ortega", rol: "Preparador físico" },
  { nombre: "Ana Quintana", rol: "Entrenadora de porteros" },
  { nombre: "David Herrera", rol: "Fisioterapeuta" },
];

export const PROXIMOS_PARTIDOS_PE: Match[] = [
  PROXIMO_PARTIDO,
  {
    id: "m2",
    competicion: "Segunda Federación · J34",
    fecha: "Dom 22 jun · 12:00",
    estadio: "Campo del Recreativo",
    estado: "proximo",
    local: { nombre: "Recreativo B", abreviatura: "REC" },
    visitante: { nombre: "C.A. Antoniano", abreviatura: "CAA" },
  },
];

// ───────── Cantera ─────────
export const EQUIPOS_CANTERA = [
  { categoria: "Prebenjamín", equipos: 2, edad: "6-7 años" },
  { categoria: "Benjamín", equipos: 3, edad: "8-9 años" },
  { categoria: "Alevín", equipos: 3, edad: "10-11 años" },
  { categoria: "Infantil", equipos: 2, edad: "12-13 años" },
  { categoria: "Cadete", equipos: 2, edad: "14-15 años" },
  { categoria: "Juvenil", equipos: 2, edad: "16-18 años" },
];

// ───────── Entradas (precios en céntimos para formatEuros) ─────────
export type Evento = {
  id: string;
  titulo: string;
  fecha: string;
  lugar: string;
  precioCentimos: number;
  disponibles: number;
};

export const EVENTOS_ENTRADAS: Evento[] = [
  {
    id: "e1",
    titulo: "C.A. Antoniano vs Atlético Onubense",
    fecha: "Dom 15 jun · 18:00",
    lugar: "Estadio Municipal de Lebrija",
    precioCentimos: 1200,
    disponibles: 340,
  },
  {
    id: "e2",
    titulo: "Final Copa RFAF · C.A. Antoniano vs Xerez D.F.C.",
    fecha: "Sáb 28 jun · 20:00",
    lugar: "Estadio de la Juventud",
    precioCentimos: 2500,
    disponibles: 90,
  },
  {
    id: "e3",
    titulo: "Trofeo Ciudad de Lebrija (pretemporada)",
    fecha: "Sáb 19 jul · 19:30",
    lugar: "Estadio Municipal de Lebrija",
    precioCentimos: 800,
    disponibles: 500,
  },
];

// ───────── Intranet (dashboard familia) ─────────
export const HIJO = {
  nombre: "Marco Jiménez",
  equipo: "Infantil A",
  categoria: "Infantil",
  entrenador: "Roberto Aguilar",
  dorsal: 10,
  temporada: "2025/26",
};

export type Cuota = {
  id: string;
  concepto: string;
  periodo: string;
  importeCentimos: number;
  estado: "pagada" | "pendiente" | "vencida";
  vencimiento: string;
};

export const CUOTAS: Cuota[] = [
  {
    id: "c1",
    concepto: "Cuota mensual",
    periodo: "2026-06",
    importeCentimos: 4500,
    estado: "pendiente",
    vencimiento: "10 jun 2026",
  },
  {
    id: "c2",
    concepto: "Cuota mensual",
    periodo: "2026-05",
    importeCentimos: 4500,
    estado: "pagada",
    vencimiento: "10 may 2026",
  },
  {
    id: "c3",
    concepto: "Cuota mensual",
    periodo: "2026-04",
    importeCentimos: 4500,
    estado: "pagada",
    vencimiento: "10 abr 2026",
  },
  {
    id: "c4",
    concepto: "Equipación oficial",
    periodo: "2025-09",
    importeCentimos: 6500,
    estado: "vencida",
    vencimiento: "30 sep 2025",
  },
];

export const COMUNICACIONES = [
  {
    id: "k1",
    titulo: "Convocatoria partido del domingo",
    fecha: "7 jun 2026",
    resumen: "Citación a las 16:30 en el campo. Equipación roja.",
  },
  {
    id: "k2",
    titulo: "Cierre de temporada y entrega de trofeos",
    fecha: "3 jun 2026",
    resumen: "El 21 de junio celebramos la fiesta de fin de temporada.",
  },
  {
    id: "k3",
    titulo: "Recordatorio: cuota de junio",
    fecha: "1 jun 2026",
    resumen: "El cargo SEPA se realizará el día 10.",
  },
];

export const EVENTOS_CALENDARIO = [
  { id: "v1", titulo: "Entrenamiento", fecha: "Mar 10 jun · 18:00", lugar: "Campo 2" },
  { id: "v2", titulo: "Entrenamiento", fecha: "Jue 12 jun · 18:00", lugar: "Campo 2" },
  { id: "v3", titulo: "Partido vs Utrera", fecha: "Dom 15 jun · 11:00", lugar: "Municipal" },
  { id: "v4", titulo: "Fiesta fin de temporada", fecha: "Sáb 21 jun · 19:00", lugar: "Pabellón" },
];

// ───────── Clasificación (mock) ─────────
export type FilaClasificacion = {
  pos: number;
  equipo: string;
  abr: string;
  pj: number;
  pts: number;
  esCAA?: boolean;
};

export const CLASIFICACION: FilaClasificacion[] = [
  { pos: 1, equipo: "Xerez D.F.C.", abr: "XER", pj: 28, pts: 64 },
  { pos: 2, equipo: "C.D. Utrera", abr: "UTR", pj: 28, pts: 61 },
  { pos: 3, equipo: "C.A. Antoniano", abr: "CAA", pj: 28, pts: 58, esCAA: true },
  { pos: 4, equipo: "Atlético Onubense", abr: "ATO", pj: 28, pts: 54 },
  { pos: 5, equipo: "Coria C.F.", abr: "COR", pj: 28, pts: 50 },
  { pos: 6, equipo: "Conil C.F.", abr: "CON", pj: 28, pts: 47 },
  { pos: 7, equipo: "Recreativo B", abr: "REC", pj: 28, pts: 45 },
  { pos: 8, equipo: "Ciudad de Lucena", abr: "LUC", pj: 28, pts: 43 },
];
