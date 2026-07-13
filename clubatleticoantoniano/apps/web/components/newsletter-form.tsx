"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo: sin backend todavía. Aquí iría POST /api/newsletter.
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setDone(true);
  }

  if (done) {
    return (
      <p className="inline-flex items-center gap-2 border border-brand/40 bg-brand/10 px-5 py-3 text-sm font-semibold text-white">
        <Check className="h-4 w-4 text-brand" strokeWidth={2.5} />
        ¡Listo! Te has suscrito con {email}.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm items-stretch gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@correo.es"
        aria-label="Correo electrónico"
        className="w-full border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-brand"
      />
      <button type="submit" className="btn btn-primary shrink-0">
        <Send className="h-4 w-4" strokeWidth={2} />
        <span className="hidden sm:inline">Suscribirme</span>
      </button>
    </form>
  );
}
