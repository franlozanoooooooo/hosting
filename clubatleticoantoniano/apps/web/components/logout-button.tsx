"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api";

/** Cierra la sesión real (revoca tokens en la API y borra cookies). */
export function LogoutButton() {
  const router = useRouter();

  async function salir() {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Aunque falle (p.ej. token ya caducado), volvemos al login.
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={salir}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
      Cerrar sesión
    </button>
  );
}
