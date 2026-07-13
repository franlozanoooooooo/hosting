"use client";

/**
 * Alta REAL de familia en cantera, contra la API NestJS + PostgreSQL:
 *
 *  1. POST /api/auth/registro  → crea Usuario(FAMILIA) + Tutor + Jugador
 *     + las 2 cuotas de la temporada (1 jul y 1 ene, 100 € cada una) y
 *     deja la sesión iniciada (JWT en cookies httpOnly).
 *  2. GET  /api/pagos/cuotas   → muestra las cuotas reales del jugador.
 *  3. POST /api/pagos/mandato  → registra la domiciliación SEPA (sandbox).
 *
 * El cobro automático de cada plazo lo ejecuta el proveedor (GoCardless)
 * sobre el mandato; en sandbox queda registrado sin mover dinero real.
 */

import { useState } from "react";
import Link from "next/link";
import { formatEuros } from "@caa/shared";
import { api, ApiError } from "@/lib/api";
import {
  UserPlus,
  Baby,
  ReceiptText,
  Landmark,
  CheckCircle2,
  ShieldCheck,
  CalendarClock,
  Zap,
  ArrowRight,
  Lock,
  Info,
  Loader2,
} from "lucide-react";

type Cuota = {
  id: string;
  periodo: string;
  concepto: string;
  importeCentimos: number;
  estado: string;
  venceEn: string | null;
  jugador: { nombre: string; apellidos: string };
};

type Tutor = { nombre: string; apellidos: string; dni: string; email: string; telefono: string; password: string };
type Hijo = { nombre: string; apellidos: string; fechaNacimiento: string; equipo: string };

const EQUIPOS = ["Prebenjamín", "Benjamín A", "Alevín A", "Infantil A", "Cadete A", "Juvenil A"];

const PASOS = [
  { n: 0, label: "Tutor", icon: UserPlus },
  { n: 1, label: "Hijo/a", icon: Baby },
  { n: 2, label: "Cuotas", icon: ReceiptText },
  { n: 3, label: "Domiciliar", icon: Landmark },
  { n: 4, label: "Listo", icon: CheckCircle2 },
];

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand";

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-brand-dark">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-brand">{error}</span>}
    </label>
  );
}

export default function AltaCanteraPage() {
  const [step, setStep] = useState(0);
  const [tutor, setTutor] = useState<Tutor>({ nombre: "", apellidos: "", dni: "", email: "", telefono: "", password: "" });
  const [hijo, setHijo] = useState<Hijo>({ nombre: "", apellidos: "", fechaNacimiento: "", equipo: "Infantil A" });
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [mandato, setMandato] = useState<{ titular: string; ibanLast4: string } | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  /** Paso 1 → llama al registro real y carga las cuotas creadas. */
  async function registrar() {
    setCargando(true);
    setErrores({});
    setErrorGeneral(null);
    try {
      await api.post("/api/auth/registro", {
        nombre: tutor.nombre,
        apellidos: tutor.apellidos,
        dni: tutor.dni,
        email: tutor.email,
        telefono: tutor.telefono || undefined,
        password: tutor.password,
        hijoNombre: hijo.nombre,
        hijoApellidos: hijo.apellidos,
        hijoFechaNacimiento: hijo.fechaNacimiento,
        equipo: hijo.equipo,
      });
      const lista = await api.get<Cuota[]>("/api/pagos/cuotas");
      setCuotas(lista.sort((a, b) => a.periodo.localeCompare(b.periodo)));
      setStep(2);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.body) {
        const fe = (err.body as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {};
        setErrores(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v[0]])));
        setErrorGeneral("Revisa los campos marcados.");
        // Los errores del tutor están en el paso 0; vuelve si hace falta.
        const camposTutor = ["nombre", "apellidos", "dni", "email", "telefono", "password"];
        if (Object.keys(fe).some((k) => camposTutor.includes(k))) setStep(0);
      } else if (err instanceof ApiError && err.status === 409) {
        setErrorGeneral("Ya existe una cuenta con ese email o DNI. Prueba a iniciar sesión.");
        setStep(0);
      } else {
        setErrorGeneral("No se pudo conectar con el servidor. ¿Está la API arrancada?");
      }
    } finally {
      setCargando(false);
    }
  }

  /** Paso 3 → registra el mandato SEPA en la API (GoCardless). */
  async function domiciliar(titular: string, iban: string) {
    setCargando(true);
    setErrorGeneral(null);
    try {
      const flow = await api.post<{ redirectUrl: string; redirectFlowId: string; esReal: boolean }>(
        "/api/pagos/mandato",
        { iban: iban.replace(/\s+/g, "").toUpperCase(), titular },
      );
      if (flow.esReal) {
        // Modo real: el tutor autoriza el mandato en la página segura de
        // GoCardless y vuelve a /intranet/pagos/mandato/ok.
        window.location.href = flow.redirectUrl;
        return;
      }
      // Modo simulado (sin credenciales): confirmamos el mandato directamente.
      await api.post("/api/pagos/mandato/confirmar", { redirectFlowId: flow.redirectFlowId });
      setMandato({ titular, ibanLast4: iban.replace(/\s+/g, "").slice(-4) });
      setStep(4);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.body) {
        const fe = (err.body as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {};
        setErrorGeneral(fe.iban?.[0] ?? fe.titular?.[0] ?? "Datos del mandato no válidos.");
      } else {
        setErrorGeneral("No se pudo registrar la domiciliación. Inténtalo de nuevo.");
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="bg-surface-muted">
      <section className="page-hero">
        <img src="/images/partido-08.jpg" alt="" className="page-hero-img" />
        <div className="container-page relative py-16 lg:py-24">
          <p className="eyebrow eyebrow-light">Cantera · Alta de familia</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl lg:text-6xl">
            Inscribe a tu hijo y domicilia la cuota
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">
            Date de alta una sola vez. La cuota de la temporada se cobra en dos plazos
            (1 de julio y 1 de enero) y, al domiciliar, cada cargo se hace
            automáticamente — como el recibo de la luz.
          </p>
        </div>
      </section>

      <div className="container-page py-10 lg:py-12">
        <div className="flex items-start gap-2.5 border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-[#7a5200]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#9a6400]" strokeWidth={2} />
          <p>
            <strong>Alta real (entorno de pruebas).</strong> Tus datos se guardan en la
            base de datos del club. La domiciliación usa el sandbox del proveedor de
            pagos: no se mueve dinero real.
          </p>
        </div>

        {/* Stepper */}
        <ol className="mt-8 flex flex-wrap items-center gap-2">
          {PASOS.map((p, i) => {
            const Icon = p.icon;
            const hecho = step > p.n;
            const activo = step === p.n;
            return (
              <li key={p.n} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    activo
                      ? "border-brand bg-brand text-white"
                      : hecho
                        ? "border-brand/30 bg-brand/10 text-brand"
                        : "border-border bg-surface text-text-muted"
                  }`}
                >
                  {hecho ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> : <Icon className="h-4 w-4" strokeWidth={2} />}
                  {p.label}
                </div>
                {i < PASOS.length - 1 && <span className="h-px w-4 bg-border-strong sm:w-6" />}
              </li>
            );
          })}
        </ol>

        {errorGeneral && (
          <p className="mt-5 flex items-start gap-2 rounded-lg bg-brand/10 px-4 py-3 text-sm font-medium text-brand">
            <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            {errorGeneral}
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
            {step === 0 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setStep(1);
                }}
              >
                <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold uppercase text-brand-dark">
                  <UserPlus className="h-6 w-6 text-brand" strokeWidth={2} />
                  Regístrate como tutor
                </h2>
                <p className="mt-2 text-sm text-text-muted">
                  Crea tu cuenta de familia. Con ella verás pagos, documentos y avisos del club.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Campo label="Nombre" error={errores.nombre}>
                    <input className={inputCls} required value={tutor.nombre} onChange={(e) => setTutor({ ...tutor, nombre: e.target.value })} placeholder="Francisco" />
                  </Campo>
                  <Campo label="Apellidos" error={errores.apellidos}>
                    <input className={inputCls} required value={tutor.apellidos} onChange={(e) => setTutor({ ...tutor, apellidos: e.target.value })} placeholder="Bastará Ruiz" />
                  </Campo>
                  <Campo label="DNI / NIE" error={errores.dni}>
                    <input className={inputCls} required value={tutor.dni} onChange={(e) => setTutor({ ...tutor, dni: e.target.value.toUpperCase() })} placeholder="12345678Z" />
                  </Campo>
                  <Campo label="Teléfono (opcional)" error={errores.telefono}>
                    <input className={inputCls} value={tutor.telefono} onChange={(e) => setTutor({ ...tutor, telefono: e.target.value })} placeholder="600 123 456" />
                  </Campo>
                  <Campo label="Email" error={errores.email}>
                    <input className={inputCls} type="email" required value={tutor.email} onChange={(e) => setTutor({ ...tutor, email: e.target.value })} placeholder="francisco@correo.es" />
                  </Campo>
                  <Campo label="Contraseña" error={errores.password}>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" strokeWidth={2} />
                      <input
                        className={`${inputCls} pl-9`}
                        type="password"
                        required
                        minLength={8}
                        value={tutor.password}
                        onChange={(e) => setTutor({ ...tutor, password: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                      />
                    </div>
                  </Campo>
                </div>
                <div className="mt-6 flex justify-end">
                  <button type="submit" className="btn btn-primary">
                    Continuar
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </form>
            )}

            {step === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void registrar();
                }}
              >
                <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold uppercase text-brand-dark">
                  <Baby className="h-6 w-6 text-brand" strokeWidth={2} />
                  Datos del jugador
                </h2>
                <p className="mt-2 text-sm text-text-muted">
                  Quedará vinculado a ti como tutor responsable de sus cuotas.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Campo label="Nombre" error={errores.hijoNombre}>
                    <input className={inputCls} required value={hijo.nombre} onChange={(e) => setHijo({ ...hijo, nombre: e.target.value })} placeholder="Paco" />
                  </Campo>
                  <Campo label="Apellidos" error={errores.hijoApellidos}>
                    <input className={inputCls} required value={hijo.apellidos} onChange={(e) => setHijo({ ...hijo, apellidos: e.target.value })} placeholder="Bastará Gómez" />
                  </Campo>
                  <Campo label="Fecha de nacimiento" error={errores.hijoFechaNacimiento}>
                    <input className={inputCls} type="date" required value={hijo.fechaNacimiento} onChange={(e) => setHijo({ ...hijo, fechaNacimiento: e.target.value })} />
                  </Campo>
                  <Campo label="Equipo / categoría" error={errores.equipo}>
                    <select className={inputCls} value={hijo.equipo} onChange={(e) => setHijo({ ...hijo, equipo: e.target.value })}>
                      {EQUIPOS.map((eq) => (
                        <option key={eq}>{eq}</option>
                      ))}
                    </select>
                  </Campo>
                </div>
                <div className="mt-6 flex justify-between">
                  <button type="button" onClick={() => setStep(0)} className="btn btn-outline-dark" disabled={cargando}>
                    Atrás
                  </button>
                  <button type="submit" disabled={cargando} className="btn btn-primary disabled:opacity-50">
                    {cargando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                        Creando cuenta…
                      </>
                    ) : (
                      <>
                        Crear cuenta e inscribir
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold uppercase text-brand-dark">
                  <ReceiptText className="h-6 w-6 text-brand" strokeWidth={2} />
                  Cuota de la temporada
                </h2>
                <p className="mt-2 text-sm text-text-muted">
                  ¡Cuenta creada! Estas son las cuotas de{" "}
                  <strong className="text-brand-dark">
                    {cuotas[0]?.jugador.nombre} {cuotas[0]?.jugador.apellidos}
                  </strong>{" "}
                  registradas en el club:
                </p>
                <ul className="mt-6 divide-y divide-border border border-border">
                  {cuotas.map((c, i) => (
                    <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 font-display text-sm font-bold text-brand">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-brand-dark">{c.concepto}</p>
                          <p className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                            <CalendarClock className="h-3.5 w-3.5" strokeWidth={2} />
                            Cargo en el periodo {c.periodo}
                          </p>
                        </div>
                      </div>
                      <span className="font-display text-xl font-extrabold text-brand-dark">{formatEuros(c.importeCentimos)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border border-border-strong bg-surface-muted px-4 py-3">
                  <span className="text-sm font-bold uppercase tracking-wide text-text-muted">Total temporada</span>
                  <span className="font-display text-xl font-extrabold text-brand-dark">
                    {formatEuros(cuotas.reduce((a, c) => a + c.importeCentimos, 0))}
                  </span>
                </div>
                <div className="mt-6 flex justify-end">
                  <button type="button" onClick={() => setStep(3)} className="btn btn-primary">
                    <Landmark className="h-4 w-4" strokeWidth={2} />
                    Domiciliar los pagos
                  </button>
                </div>
              </div>
            )}

            {step === 3 && <PasoDomiciliacion titularSugerido={`${tutor.nombre} ${tutor.apellidos}`.trim()} cargando={cargando} onConfirm={domiciliar} />}

            {step === 4 && (
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                    <CheckCircle2 className="h-7 w-7 text-brand" strokeWidth={2} />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-extrabold uppercase text-brand-dark">¡Inscripción completada!</h2>
                    <p className="text-sm text-text-muted">
                      {hijo.nombre} ya consta en la base de datos del club, con su domiciliación activa.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-border bg-surface-muted p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Mandato SEPA registrado (sandbox)</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                    <span className="font-semibold text-brand-dark">{mandato?.titular}</span>
                    <span className="text-text-muted">IBAN ····{mandato?.ibanLast4}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-brand/30 bg-brand/5 p-5">
                  <h3 className="flex items-center gap-2 font-bold text-brand-dark">
                    <Zap className="h-4 w-4 text-brand" strokeWidth={2.5} />
                    Los plazos se cobrarán solos
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">
                    Con el mandato activo, el club pasará el cargo de cada plazo
                    ({cuotas.map((c) => c.periodo).join(" y ")}) automáticamente a tu cuenta,
                    sin que tengas que hacer nada. Recibirás aviso antes de cada cargo.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/intranet" className="btn btn-primary">
                    Ir a mi área de cantera
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Lateral */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-brand-dark">
                <ReceiptText className="h-4 w-4 text-brand" strokeWidth={2} />
                Resumen
              </h3>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Tutor</dt>
                  <dd className="font-semibold text-brand-dark">{tutor.nombre ? `${tutor.nombre} ${tutor.apellidos}` : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Jugador</dt>
                  <dd className="font-semibold text-brand-dark">{hijo.nombre ? `${hijo.nombre} ${hijo.apellidos}` : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Domiciliación</dt>
                  <dd className="font-semibold text-brand-dark">{mandato ? `····${mandato.ibanLast4}` : "—"}</dd>
                </div>
              </dl>
              {cuotas.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-border pt-4">
                  {cuotas.map((c) => (
                    <li key={c.id} className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">{c.periodo}</span>
                      <span className="font-semibold text-brand-dark">{formatEuros(c.importeCentimos)}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          c.estado === "PAGADA"
                            ? "bg-green-100 text-green-700"
                            : mandato
                              ? "bg-brand/10 text-brand"
                              : "bg-accent/20 text-[#9a6400]"
                        }`}
                      >
                        {c.estado === "PAGADA" ? "Pagada" : mandato ? "Domiciliada" : "Pendiente"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 text-sm shadow-sm">
              <h3 className="flex items-center gap-2 font-bold text-brand-dark">
                <ShieldCheck className="h-4 w-4 text-brand" strokeWidth={2} />
                Tus datos, protegidos
              </h3>
              <p className="mt-2 text-text-muted">
                Nunca guardamos tu IBAN completo: solo los últimos 4 dígitos y la
                autorización (mandato), que custodia el proveedor de pagos. Conforme al RGPD.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PasoDomiciliacion({
  titularSugerido,
  cargando,
  onConfirm,
}: {
  titularSugerido: string;
  cargando: boolean;
  onConfirm: (titular: string, iban: string) => void;
}) {
  const [titular, setTitular] = useState(titularSugerido);
  const [iban, setIban] = useState("");
  const limpio = iban.replace(/\s+/g, "");
  const valido = titular.trim().length > 2 && /^ES\d{22}$/i.test(limpio);

  return (
    <div>
      <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold uppercase text-brand-dark">
        <Landmark className="h-6 w-6 text-brand" strokeWidth={2} />
        Domiciliación bancaria (SEPA)
      </h2>
      <p className="mt-2 text-sm text-text-muted">
        Autoriza el adeudo en tu cuenta. El club podrá cobrar los plazos de la
        temporada automáticamente. Puedes anular la autorización cuando quieras.
      </p>

      <div className="mt-6 space-y-4">
        <Campo label="Titular de la cuenta">
          <input className={inputCls} value={titular} onChange={(e) => setTitular(e.target.value)} />
        </Campo>
        <Campo label="IBAN">
          <input className={inputCls} value={iban} onChange={(e) => setIban(e.target.value)} placeholder="ES00 0000 0000 0000 0000 0000" />
          <span className="mt-1 block text-xs text-text-muted">
            Sandbox:{" "}
            <button type="button" className="font-semibold text-brand underline" onClick={() => setIban("ES7620770024003102575766")}>
              usar IBAN de prueba
            </button>
          </span>
        </Campo>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-lg bg-surface-muted px-4 py-3 text-xs text-text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={2} />
        Tu IBAN viaja cifrado al proveedor de pagos (GoCardless). El club solo guarda
        los últimos 4 dígitos y el identificador del mandato — nunca el número completo.
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => onConfirm(titular.trim(), iban)}
          disabled={!valido || cargando}
          className="btn btn-primary disabled:opacity-50"
        >
          {cargando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              Registrando mandato…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" strokeWidth={2} />
              Autorizar domiciliación
            </>
          )}
        </button>
      </div>
    </div>
  );
}
