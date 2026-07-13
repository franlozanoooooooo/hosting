import { formatEuros } from "@caa/shared";
import { CUOTAS, type Cuota } from "@/lib/mock-data";

const BADGE: Record<Cuota["estado"], string> = {
  pagada: "bg-green-100 text-green-700",
  pendiente: "bg-accent/20 text-[#9a6400]",
  vencida: "bg-brand/10 text-brand",
};

const LABEL: Record<Cuota["estado"], string> = {
  pagada: "Pagada",
  pendiente: "Pendiente",
  vencida: "Vencida",
};

export default function PagosPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">Pagos</h1>
        <p className="mt-1 text-text-muted">
          Consulta y gestiona las cuotas de tu familia.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-muted text-left text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Concepto</th>
                <th className="px-4 py-3 font-semibold">Periodo</th>
                <th className="px-4 py-3 font-semibold">Vencimiento</th>
                <th className="px-4 py-3 font-semibold">Importe</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CUOTAS.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted/50">
                  <td className="px-4 py-3 font-medium text-brand-dark">
                    {c.concepto}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{c.periodo}</td>
                  <td className="px-4 py-3 text-text-muted">{c.vencimiento}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">
                    {formatEuros(c.importeCentimos)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[c.estado]}`}
                    >
                      {LABEL[c.estado]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={c.estado !== "pagada"}
                      className="text-xs font-semibold text-brand hover:underline disabled:cursor-not-allowed disabled:text-text-muted disabled:no-underline"
                    >
                      Descargar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SEPA */}
      <section className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-brand-dark">
          Domiciliación bancaria (SEPA)
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Registra tu IBAN para domiciliar las cuotas. El mandato SEPA se
          procesa de forma segura. (Demo: sin envío real.)
        </p>
        <form className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="titular" className="mb-1 block text-sm font-semibold">
              Titular de la cuenta
            </label>
            <input
              id="titular"
              name="titular"
              placeholder="Nombre y apellidos"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="iban" className="mb-1 block text-sm font-semibold">
              IBAN
            </label>
            <input
              id="iban"
              name="iban"
              placeholder="ES00 0000 0000 0000 0000 0000"
              className="w-full rounded-lg border border-border px-4 py-2.5 font-mono text-sm uppercase outline-none focus:border-brand"
            />
            <p className="mt-1 text-xs text-text-muted">
              Validado con el formato español (empieza por ES, 24 caracteres).
            </p>
          </div>
          <label className="flex items-start gap-3 text-sm text-text-muted sm:col-span-2">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#c8102e]" />
            <span>
              Autorizo al Club Atlético Antoniano a girar los recibos en la
              cuenta indicada (mandato SEPA Core).
            </span>
          </label>
          <div className="sm:col-span-2">
            <button type="button" className="btn btn-primary">
              Guardar mandato
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
