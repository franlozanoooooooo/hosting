/**
 * Descarga la clasificación de la categoría del primer equipo desde Wikipedia
 * (API abierta, legal) y la guarda en lib/standings.json.
 *
 * - Detecta la temporada actual automáticamente.
 * - Localiza la tabla del grupo en el que está el Antoniano (no depende del nº de grupo).
 * - Si algo falla (sin red, cambio de formato, fuera de temporada), NO sobrescribe
 *   el último JSON válido: la web nunca se queda sin tabla.
 *
 * Se ejecuta en cada build (script "prebuild") y puede lanzarse a diario
 * con un build programado para que se actualice sola.
 */
import { load } from "cheerio";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "lib", "standings.json");

const CLUB_MATCH = "Antoniano"; // texto que identifica al club en la tabla
const COMPETICION = "Segunda Federación";
const GRUPO = "Grupo IV";

function temporadaActual() {
  const d = new Date();
  const inicio = d.getMonth() + 1 >= 7 ? d.getFullYear() : d.getFullYear() - 1;
  return `${inicio}-${String(inicio + 1).slice(2)}`;
}

function limpiarEquipo(s) {
  s = (s || "").replace(/\s+/g, " ").trim();
  s = s.replace(/\s*\([A-Z](,\s*[A-Z])*\)\s*$/, ""); // quita (A) (C) (A, C)
  // deshace duplicados tipo "Atlético AntonianoAtlético Antoniano"
  const n = s.length;
  if (n % 2 === 0 && s.slice(0, n / 2) === s.slice(n / 2)) s = s.slice(0, n / 2);
  return s.trim();
}

async function main() {
  const temporada = temporadaActual();
  const page = `${COMPETICION} ${temporada}`;
  const url =
    "https://es.wikipedia.org/w/api.php?action=parse&format=json&formatversion=2&prop=text&page=" +
    encodeURIComponent(page);

  const res = await fetch(url, {
    headers: { "User-Agent": "caa-club-site/1.0 (clasificacion)" },
  });
  if (!res.ok) throw new Error(`Wikipedia HTTP ${res.status}`);
  const data = await res.json();
  const html = data?.parse?.text;
  if (!html) throw new Error("Sin HTML en la respuesta");

  const $ = load(html);
  let elegida = null;

  $("table").each((_, el) => {
    if (elegida) return;
    const $t = $(el);
    const head = $t.find("tr").first().text();
    const esClasif =
      /Pos/.test(head) && /Equipo/.test(head) && /Pts/.test(head);
    if (esClasif && $t.text().includes(CLUB_MATCH)) elegida = $t;
  });

  if (!elegida) throw new Error("No se encontró la tabla de clasificación del club");

  const filas = [];
  elegida.find("tr").each((i, tr) => {
    if (i === 0) return; // cabecera
    const tds = $(tr).find("td, th");
    if (tds.length < 4) return;
    const cell = (n) => $(tds[n]).clone().find("sup,style").remove().end().text();
    const pos = parseInt(cell(0).replace(/\D/g, ""), 10);
    const equipo = limpiarEquipo(cell(1));
    const pts = parseInt(cell(2).replace(/\D/g, ""), 10);
    const pj = parseInt(cell(3).replace(/\D/g, ""), 10);
    if (!Number.isFinite(pos) || !equipo) return;
    filas.push({
      pos,
      equipo,
      pj: Number.isFinite(pj) ? pj : null,
      pts: Number.isFinite(pts) ? pts : null,
      esCAA: equipo.includes(CLUB_MATCH),
    });
  });

  if (filas.length < 4) throw new Error(`Tabla con muy pocas filas (${filas.length})`);

  const payload = {
    competicion: `${COMPETICION} · ${GRUPO}`,
    temporada,
    actualizado: new Date().toISOString(),
    fuente: "Wikipedia",
    filas,
  };
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(
    `✓ Clasificación actualizada: ${filas.length} equipos (${temporada}). Antoniano: ` +
      (filas.find((f) => f.esCAA)?.pos ?? "?") +
      "º"
  );
}

main().catch((e) => {
  console.warn("⚠ No se pudo actualizar la clasificación:", e.message);
  if (existsSync(OUT)) {
    console.warn("  Se mantiene la última versión guardada (la web no se queda sin tabla).");
    process.exit(0); // no rompemos el build
  }
  process.exit(0);
});
