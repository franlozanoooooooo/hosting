import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * ZONA PRIVADA OCULTA: el área de cantera (intranet), el login y el alta de
 * familia están desactivados de cara al público. El código se conserva; para
 * reactivarlos, pon `ZONA_PRIVADA_OCULTA` a false.
 *
 * Protección de zonas privadas contra la sesión REAL de la API (NestJS):
 * - /admin/**     → requiere JWT válido con rol SUPER_ADMIN o ADMIN.
 * - /intranet/**  → requiere JWT válido (cualquier rol).
 *
 * El `access_token` lo emite la API en una cookie httpOnly al hacer login o
 * registro. Aquí se verifica su firma (HS256, mismo JWT_ACCESS_SECRET).
 * Si expira (15 min), se redirige a /login — el refresh automático se
 * cableará junto al resto de vistas conectadas a la API.
 */

const ZONA_PRIVADA_OCULTA = true;

const RUTAS_OCULTAS = [
  "/login",
  "/recuperar",
  "/intranet",
  "/admin",
  "/cantera/alta",
];

const ROLES_ADMIN = new Set(["SUPER_ADMIN", "ADMIN"]);

async function rolDesdeToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.rol === "string" ? payload.rol : null;
  } catch {
    return null; // firma inválida o token caducado
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    ZONA_PRIVADA_OCULTA &&
    RUTAS_OCULTAS.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const esAdmin = pathname.startsWith("/admin");
  const esIntranet = pathname.startsWith("/intranet");
  if (!esAdmin && !esIntranet) return NextResponse.next();

  const rol = await rolDesdeToken(req.cookies.get("access_token")?.value);

  if (!rol) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?desde=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (esAdmin && !ROLES_ADMIN.has(rol)) {
    const url = req.nextUrl.clone();
    url.pathname = "/intranet";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/intranet/:path*",
    "/login",
    "/recuperar",
    "/cantera/alta",
  ],
};
