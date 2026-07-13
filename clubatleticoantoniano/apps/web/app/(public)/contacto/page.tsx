"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Tag,
  MessageSquare,
  Send,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

const FAQS = [
  {
    pregunta: "¿Cómo apunto a mi hijo o hija a la cantera?",
    respuesta:
      "Cuando se hagan captaciones podrás inscribirte, o bien escribiéndonos por este formulario. Te citaremos para una jornada de prueba según la categoría por edad.",
  },
  {
    pregunta: "¿Dónde compro las entradas de los partidos?",
    respuesta:
      "La venta se gestiona en nuestro proveedor oficial de ticketing. Encontrarás el botón de compra en la sección Entradas.",
  },
  {
    pregunta: "¿Cómo me hago socio o socia del club?",
    respuesta:
      "Puedes solicitar el alta de abonado escribiéndonos con tus datos. Te enviaremos las modalidades de abono vigentes y la forma de pago por domiciliación.",
  },
  {
    pregunta: "¿Cuánto tardáis en responder?",
    respuesta:
      "Atendemos los mensajes en horario de oficina, normalmente en menos de 48 horas laborables. Para asuntos urgentes el día de partido, llámanos por teléfono.",
  },
];

const CAMPO_INPUT =
  "w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand";

export default function ContactoPage() {
  const [enviado, setEnviado] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState<number | null>(0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: conectar con la API (POST /contacto) usando lib/api.ts + contactoSchema.
    setEnviado(true);
  }

  return (
    <div>
      <section className="page-hero">
        <img src="/images/partido-05.jpg" alt="" className="page-hero-img" />
        <div className="container-page relative py-24 lg:py-32">
          <p className="eyebrow eyebrow-light">
            <HelpCircle className="h-4 w-4" strokeWidth={2} />
            Atención al aficionado
          </p>
          <h1 className="mt-4 font-display text-5xl font-extrabold uppercase tracking-tight sm:text-6xl lg:text-7xl">
            Contacto
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/75">
            ¿Tienes alguna duda sobre la cantera, los abonos o un partido?
            Escríbenos y te responderemos lo antes posible.
          </p>
        </div>
      </section>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm"
        >
          {enviado && (
            <p className="flex items-center gap-2 rounded-lg bg-accent/15 px-4 py-3 text-sm font-medium text-[#9a6400]">
              <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={2} />
              ¡Gracias! Hemos recibido tu mensaje y te responderemos pronto
              (demo, sin envío real).
            </p>
          )}

          <div>
            <label
              htmlFor="nombre"
              className="mb-1 flex items-center gap-1.5 text-sm font-semibold"
            >
              <User className="h-4 w-4 text-brand" strokeWidth={2} />
              Nombre
            </label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                strokeWidth={2}
              />
              <input
                id="nombre"
                name="nombre"
                required
                placeholder="Nombre y apellidos"
                className={CAMPO_INPUT}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 flex items-center gap-1.5 text-sm font-semibold"
            >
              <Mail className="h-4 w-4 text-brand" strokeWidth={2} />
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                strokeWidth={2}
              />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="tucorreo@ejemplo.com"
                className={CAMPO_INPUT}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="asunto"
              className="mb-1 flex items-center gap-1.5 text-sm font-semibold"
            >
              <Tag className="h-4 w-4 text-brand" strokeWidth={2} />
              Asunto
            </label>
            <div className="relative">
              <Tag
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                strokeWidth={2}
              />
              <input
                id="asunto"
                name="asunto"
                required
                placeholder="¿Sobre qué nos escribes?"
                className={CAMPO_INPUT}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="mensaje"
              className="mb-1 flex items-center gap-1.5 text-sm font-semibold"
            >
              <MessageSquare className="h-4 w-4 text-brand" strokeWidth={2} />
              Mensaje
            </label>
            <div className="relative">
              <MessageSquare
                className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-text-muted"
                strokeWidth={2}
              />
              <textarea
                id="mensaje"
                name="mensaje"
                rows={5}
                required
                minLength={10}
                placeholder="Cuéntanos en qué podemos ayudarte…"
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <label className="flex items-start gap-3 text-sm text-text-muted">
            <input
              type="checkbox"
              name="consentimiento"
              required
              className="mt-0.5 h-4 w-4 accent-[#c8102e]"
            />
            <span>
              He leído y acepto la{" "}
              <a href="#" className="font-semibold text-brand hover:underline">
                política de privacidad
              </a>{" "}
              y el tratamiento de mis datos conforme al RGPD.
            </span>
          </label>

          <button type="submit" className="btn btn-primary w-full">
            <Send className="h-4 w-4" strokeWidth={2} />
            Enviar mensaje
          </button>
        </form>

        <div className="h-fit space-y-6 border border-border bg-surface-muted p-5 sm:p-6">
          <div className="stripes-brand h-1.5" />
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-xl uppercase text-brand-dark">
              Dónde estamos
            </h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                  strokeWidth={2}
                />
                <span className="text-text-muted">
                  Estadio Municipal de Lebrija
                  <br />
                  Lebrija (Sevilla) · Andalucía, España
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                  strokeWidth={2}
                />
                <span className="text-text-muted">
                  Usa el formulario o escríbenos por redes sociales: en{" "}
                  <a
                    href="https://www.instagram.com/caantoniano/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-brand hover:underline"
                  >
                    @caantoniano
                  </a>{" "}
                  respondemos cada día.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-display text-xl uppercase text-brand-dark">
              Preguntas frecuentes
            </h2>
            <div className="mt-3 divide-y divide-border">
              {FAQS.map((faq, i) => {
                const abierta = faqAbierta === i;
                return (
                  <div key={faq.pregunta}>
                    <button
                      type="button"
                      onClick={() => setFaqAbierta(abierta ? null : i)}
                      aria-expanded={abierta}
                      className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-semibold text-brand-dark"
                    >
                      {faq.pregunta}
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-brand transition-transform ${
                          abierta ? "rotate-180" : ""
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                    {abierta && (
                      <p className="pb-3 text-sm text-text-muted">
                        {faq.respuesta}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
