"use client";

import Link from "next/link";
import { useState } from "react";

export default function RecuperarPage() {
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: validar con recuperarPasswordSchema (@caa/shared) y POST /auth/recuperar.
    setEnviado(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <img
            src="/escudo.png"
            alt="Escudo del Club Atlético Antoniano"
            className="h-20 w-auto"
          />
        </Link>
        <h1 className="mt-6 text-center text-2xl font-extrabold text-brand-dark">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-center text-sm text-text-muted">
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {enviado ? (
          <div className="mt-8 rounded-lg bg-accent/15 px-4 py-4 text-center text-sm font-medium text-[#9a6400]">
            Si el email existe en nuestro sistema, recibirás instrucciones en
            breve.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
            </div>
            <button type="submit" className="btn btn-primary w-full">
              Enviar enlace
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            ← Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
