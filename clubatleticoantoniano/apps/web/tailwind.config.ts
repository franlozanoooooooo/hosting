import type { Config } from "tailwindcss";

/**
 * TailwindCSS v4 se configura principalmente vía CSS (`@theme` en globals.css).
 * Este archivo se mantiene para el escaneo de contenido y compatibilidad con
 * herramientas/editores. Los tokens de marca viven en `app/globals.css`.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
};

export default config;
