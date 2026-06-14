# Imágenes de la web

Guarda aquí tus fotos con **estos nombres exactos**. Mientras no estén, la web
muestra una imagen de stock de reserva automáticamente (no se ve rota).

| Archivo | Dónde aparece | Foto que enviaste |
|---|---|---|
| `logo.png` | Cabecera (navbar) de todas las páginas | Logo "Clínica GALA Estética Dental" |
| `dra-gala.jpg` | Hero de Inicio + Equipo | Dra. Mª Ángeles Gala (bata azul) |
| `recepcion.jpg` | "Por qué elegirnos" (Inicio), Tratamientos y Sobre nosotros | Recepción con el logo |
| `fachada.jpg` | Imagen ancha en Sobre nosotros | Fachada / entrada de la clínica |

### Fotos del equipo (página Equipo)
| Archivo | Persona |
|---|---|
| `dra-gala.jpg` | Dra. Mª Ángeles Gala Rojas-Marcos |
| `lorena.jpg` | Lorena Ustárroz Cacho (uniforme malva) |
| `gala-marquez.jpg` | Gala Márquez López |
| `marcela.jpg` | Dra. Marcela Moura Vieira |
| `manuel.jpg` | Dr. Manuel González O'Sullivan |

## Antes / Después (casos reales)

El comparador usa **2 fotos por caso** (la misma persona, antes y después).
Deben ser fotos de **tus pacientes con su consentimiento** — no uses stock como
si fueran resultados propios (es engañoso y no está permitido en publicidad sanitaria).

| Caso | Archivo "antes" | Archivo "después" |
|---|---|---|
| 1 · Blanqueamiento | `caso1-antes.jpg` | `caso1-despues.jpg` |
| 2 · Carillas | `caso2-antes.jpg` | `caso2-despues.jpg` |
| 3 · Ortodoncia (apiñados → alineados) | `caso3-antes.jpg` | `caso3-despues.jpg` |
| 4 · Diseño de sonrisa | `caso4-antes.jpg` | `caso4-despues.jpg` |

- Encuadra ambas fotos **igual** (mismo ángulo y zoom) para que el deslizador case.
- Cuando pongas las fotos reales, en `index.html` añade la clase `real` a cada
  `<div class="ba">` → `<div class="ba real">` para quitar el tinte amarillo del placeholder.

## Recomendaciones
- Formato `.jpg` (o cambia la extensión en el HTML si usas `.png`/`.webp`).
- Fotos del equipo: cuadradas (1:1) quedan mejor.
- Hero/fachada: horizontales o verticales grandes, mín. 1000px de ancho.
- Optimiza el peso (ideal < 300 KB) para que cargue rápido.
