const DOCS = [
  { nombre: "Autorización de imagen 2025/26.pdf", tamano: "120 KB", fecha: "1 sep 2025" },
  { nombre: "Normativa interna del club.pdf", tamano: "240 KB", fecha: "1 sep 2025" },
  { nombre: "Ficha médica del jugador.pdf", tamano: "85 KB", fecha: "5 sep 2025" },
  { nombre: "Calendario de competición.pdf", tamano: "310 KB", fecha: "10 sep 2025" },
];

export default function DocumentosPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-brand-dark">Documentación</h1>
        <p className="mt-1 text-text-muted">
          Documentos del club disponibles para descargar.
        </p>
      </header>

      <ul className="space-y-3">
        {DOCS.map((d) => (
          <li
            key={d.nombre}
            className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                📄
              </span>
              <div>
                <p className="font-semibold text-brand-dark">{d.nombre}</p>
                <p className="text-xs text-text-muted">
                  {d.tamano} · Subido el {d.fecha}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Descargar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
