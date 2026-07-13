"use client";

/**
 * Página de retorno del redirect flow de GoCardless: el tutor vuelve aquí tras
 * autorizar el mandato en la página segura del proveedor. Confirmamos el
 * mandato contra la API y mostramos el resultado.
 */

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { CheckCircle2, Loader2, AlertTriangle, ArrowRight, Landmark } from "lucide-react";

export default function MandatoOkPage() {
  return (
    <Suspense fallback={null}>
      <Confirmacion />
    </Suspense>
  );
}

type Mandato = { ibanLast4: string; titular: string; estado: string };

function Confirmacion() {
  const redirectFlowId = useSearchParams().get("redirect_flow_id");
  const [mandato, setMandato] = useState<Mandato | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!redirectFlowId) {
      setError("Falta el identificador del flujo de autorización.");
      return;
    }
    api
      .post<Mandato>("/api/pagos/mandato/confirmar", { redirectFlowId })
      .then(setMandato)
      .catch(() =>
        setError("No se pudo confirmar la domiciliación. Contacta con el club."),
      );
  }, [redirectFlowId]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
        {error ? (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
              <AlertTriangle className="h-7 w-7 text-brand" strokeWidth={2} />
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase text-brand-dark">
              Algo no ha ido bien
            </h1>
            <p className="mt-2 text-sm text-text-muted">{error}</p>
          </>
        ) : !mandato ? (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand" strokeWidth={2} />
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase text-brand-dark">
              Confirmando tu domiciliación…
            </h1>
            <p className="mt-2 text-sm text-text-muted">Un momento, por favor.</p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-700" strokeWidth={2} />
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase text-brand-dark">
              ¡Domiciliación activada!
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Mandato SEPA de <strong className="text-brand-dark">{mandato.titular}</strong>{" "}
              (cuenta ····{mandato.ibanLast4}) activo. Los plazos de la cuota se
              cargarán automáticamente en tu cuenta — sin que tengas que hacer nada más.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              <Landmark className="h-3.5 w-3.5" strokeWidth={2} />
              Cargo automático activado
            </p>
          </>
        )}

        <div className="mt-8">
          <Link href="/intranet" className="btn btn-primary">
            Ir a mi área de cantera
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
