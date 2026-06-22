# Mejoras · Clínica GALA (pestaña Servicios)

## 1. Fotos reales en todas las tarjetas de tratamiento

Las tarjetas de tratamiento de la pestaña **Servicios** mostraban solo un icono.
Ahora cada una se ilustra con una **foto real**, aplicada de forma consistente en
`servicios.html`, `funcion.html`, `estetica-dental.html` y `salud-oral.html`
(28 tarjetas en total · 14 tratamientos):

| Área | Tratamiento | Foto (Pexels) |
|---|---|---|
| Estética | Diseño de sonrisa | photo `20130737` |
| Estética | Carillas dentales | photo `12474261` |
| Estética | Blanqueamiento dental | photo `6627570` |
| Estética | Remodelado de encías | photo `12148417` |
| Estética | Ortodoncia invisible | photo `28407748` |
| Estética | Ortodoncia convencional | photo `4636175` |
| Función | Implantes dentales | photo `4687905` |
| Función | Prótesis dentales | photo `11768114` |
| Función | Bruxismo · Férulas | photo `3845985` |
| Función | Apnea del sueño | photo `6940880` |
| Salud | Endodoncia | photo `3946835` |
| Salud | Odontología conservadora | photo `5355715` |
| Salud | Disfunción de ATM | photo `3724452` |
| Salud | Enfermedad periodontal | photo `6812536` |

URL de cada foto: `https://www.pexels.com/photo/<ID>/`.

### Cómo funcionan
- Se añade `<img class="thumb-photo">` dentro de cada `.thumb` (la hoja de estilos
  ya contempla `.svc-card .thumb img`). Una regla nueva en `css/styles.css` hace que
  la foto cubra el icono.
- **Reserva automática:** si una foto no carga, `onerror="this.remove()"` la elimina
  y vuelve a verse el icono de marca con su degradado. El diseño nunca se rompe.
- **Licencia:** [Pexels License](https://www.pexels.com/license/) — uso gratuito,
  también comercial, **sin atribución obligatoria**.

> La sección **«Casos de éxito»** (antes/después) ya usaba fotos reales de pacientes
> y no se ha tocado.

### Recomendación
Las fotos se sirven desde el CDN de Pexels (no fue posible descargarlas a `img/`
porque el entorno solo permite tráfico de salida a GitHub). Para una imagen 100 %
auténtica y sin depender de un servidor externo, sustituye estas fotos por
fotografías propias de la clínica (mismo `src`, o descárgalas a `img/servicios/`).

## 2. Copy mejorado

- **Servicios, Estética, Función, Salud:** titulares y textos de entrada más
  orientados a beneficio; CTA de cierre más concreta.
- **Función:** hero, filosofía, lista de ventajas y descripciones de cada
  tratamiento (tarjeta + ventana «Saber más») reescritas; meta-descripción
  optimizada para SEO local.
- **La Clínica (`sobre-nosotros.html`):** filosofía y cierre más cálidos; se corrige
  un titular duplicado («Ven a conocernos»).
