/** Patrocinadores oficiales del club (logos en /public/sponsors/). */
export type Patrocinador = {
  nombre: string;
  logo: string;
  web: string;
  /** Clases extra para el <img> (p. ej. invertir logos blancos sobre fondo claro). */
  logoClass?: string;
};

export const PATROCINADORES: Patrocinador[] = [
  {
    nombre: "Grupo Velázquez",
    logo: "/sponsors/grupo-velazquez.png",
    web: "https://grupovelazquez.com",
  },
  {
    nombre: "Sipcam Iberia",
    logo: "/sponsors/sipcam.svg",
    web: "https://sipcamiberia.es",
  },
  {
    nombre: "Vela Ventanas",
    logo: "/sponsors/vela-ventanas.png",
    web: "https://www.velaventanas.es",
  },
  {
    nombre: "Algosur",
    logo: "/sponsors/algosur.png",
    web: "https://algosur.es",
    // El logo original es blanco: se invierte para verse sobre tarjeta clara.
    logoClass: "invert",
  },
];
