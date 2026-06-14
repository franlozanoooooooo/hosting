# Imágenes de la web

Guarda aquí tus fotos con **estos nombres exactos**. Mientras no estén, la web
muestra una imagen de stock de reserva automáticamente (no se ve rota).

| Archivo | Dónde aparece | Foto que enviaste |
|---|---|---|
| `logo.png` | Cabecera (navbar) de todas las páginas | Logo "Clínica GALA Estética Dental" |
| `dra-gala.jpg` | Hero de Inicio + primera tarjeta de Equipo | Dra. Gala R-M (bata azul) |
| `dr-2.jpg` | Tarjeta "Especialista en implantes" (Equipo) | Doctor con bata y estetoscopio |
| `recepcion.jpg` | "Por qué elegirnos" (Inicio), Tratamientos y Sobre nosotros | Recepción con el logo |
| `fachada.jpg` | Imagen ancha en Sobre nosotros | Fachada / entrada de la clínica |

Opcionales (resto del equipo). Si no las pones, se usa stock:
`equipo-2.jpg`, `equipo-4.jpg`, `equipo-5.jpg`, `equipo-6.jpg`

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
