import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El paquete compartido se distribuye como TypeScript sin compilar.
  transpilePackages: ["@caa/shared"],
  // typedRoutes desactivado en el scaffold: el panel admin enlaza a subrutas
  // (jugadores, equipos…) aún no implementadas. Activar al completarlas.

  // En producción, la web proxya /api/* hacia la API (Railway). Así el
  // navegador solo habla con el dominio de la web y las cookies httpOnly
  // de sesión son de primera parte (sin problemas de SameSite/CORS).
  async rewrites() {
    const target = process.env.API_PROXY_TARGET;
    if (!target) return [];
    return [{ source: "/api/:path*", destination: `${target}/api/:path*` }];
  },

  // La sección "Primer equipo" se retiró: quien guarde el enlace va a inicio.
  async redirects() {
    return [{ source: "/primer-equipo", destination: "/", permanent: false }];
  },
};

export default nextConfig;
