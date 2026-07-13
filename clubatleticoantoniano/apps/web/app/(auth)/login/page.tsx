"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, LogIn, Info } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const desde = useSearchParams().get("desde");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const datos = new FormData(e.currentTarget);
    try {
      // Login REAL contra la API NestJS: emite JWT en cookies httpOnly.
      const { user } = await api.post<{ user: { sub: string; rol: string } }>(
        "/api/auth/login",
        {
          identificador: datos.get("identificador"),
          password: datos.get("password"),
        },
      );
      const esAdmin = user.rol === "SUPER_ADMIN" || user.rol === "ADMIN";
      router.replace(desde ?? (esAdmin ? "/admin" : "/intranet"));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "Usuario o contraseña incorrectos."
            : err.message,
        );
      } else {
        setError("No se pudo conectar con el servidor. ¿Está la API arrancada?");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark p-4">
      <img
        src="/images/partido-09.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-brand-dark/90"
      />
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <img
            src="/escudo.png"
            alt="Escudo del Club Atlético Antoniano"
            className="h-20 w-auto"
          />
        </Link>
        <h1 className="mt-6 text-center font-display text-2xl font-extrabold uppercase tracking-tight text-brand-dark">
          Área de cantera
        </h1>
        <p className="mt-1 text-center text-sm text-text-muted">
          Accede con tu DNI o email y tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <p className="flex items-start gap-2 rounded-lg bg-brand/10 px-4 py-3 text-sm font-medium text-brand">
              <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </p>
          )}

          <div>
            <label
              htmlFor="identificador"
              className="mb-1 block text-sm font-semibold"
            >
              DNI o email
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                strokeWidth={2}
              />
              <input
                id="identificador"
                name="identificador"
                required
                autoComplete="username"
                placeholder="12345678A o tu@email.com"
                className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold">
                Contraseña
              </label>
              <Link
                href="/recuperar"
                className="text-xs font-semibold text-brand hover:underline"
              >
                ¿La olvidaste?
              </Link>
            </div>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                strokeWidth={2}
              />
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <button type="submit" disabled={cargando} className="btn btn-primary w-full disabled:opacity-50">
            <LogIn className="h-4 w-4" strokeWidth={2.5} />
            {cargando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          ¿Aún no tienes cuenta?{" "}
          <Link href="/cantera/alta" className="font-semibold text-brand hover:underline">
            Inscribe a tu hijo/a
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-text-muted">
          ¿Problemas para acceder?{" "}
          <Link href="/contacto" className="text-brand hover:underline">
            Contacta con el club
          </Link>
        </p>
      </div>
    </main>
  );
}
