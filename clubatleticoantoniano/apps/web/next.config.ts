import type { NextConfig } from "next";

// STATIC_EXPORT=1 genera la web como sitio 100% estático (carpeta out/),
// pensado para el despliegue manual por zip en la pestaña Deploys de Netlify.
// En ese modo no hay middleware, rewrites ni redirects de Next: las rutas
// ocultas se eliminan y se cubren con _redirects (ver scripts/exportar-estatico.sh).
const esExportEstatico = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El paquete compartido se distribuye como TypeScript sin compilar.
  transpilePackages: ["@caa/shared"],
  // typedRoutes desactivado en el scaffold: el panel admin enlaza a subrutas
  // (jugadores, equipos…) aún no implementadas. Activar al completarlas.
  ...(esExportEstatico ? { output: "export" as const, trailingSlash: true } : {}),

  // En producción, la web proxya /api/* hacia la API (Railway). Así el
  // navegador solo habla con el dominio de la web y las cookies httpOnly
  // de sesión son de primera parte (sin problemas de SameSite/CORS).
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (esExportEstatico || !target) return [];
    return [{ source: "/api/:path*", destination: `${target}/api/:path*` }];
  },

  // La sección "Primer equipo" se retiró: quien guarde el enlace va a inicio.
  async redirects() {
    if (esExportEstatico) return [];
    return [{ source: "/primer-equipo", destination: "/", permanent: false }];
  },
};

export default nextConfig;
