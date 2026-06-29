# Imágenes de la web

## Ya incluidas (locales)
| Archivo | Uso |
|---|---|
| `logo.svg` | Logo de marca (cabecera y pie) |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Iconos / PWA |
| `og.jpg` | Imagen para compartir en redes (Open Graph) |
| `placeholder.svg` | Imagen de reserva de marca (fallback) |
| `dra-gala.jpg` | Foto de la Dra. Gala — hero de Inicio (vertical) |
| `dra-gala-sq.jpg` | Foto de la Dra. Gala — tarjeta de Equipo (cuadrada) |
| `dra-gala-wide.jpg` | Foto de la Dra. Gala — galería de Inicio (horizontal) |

## Se cargan por URL (con fallback automático)
Para evitar enlazar a servidores externos en producción, descarga estas imágenes
a esta carpeta con el nombre indicado y reemplaza la URL en el HTML.

### Equipo (página Equipo) — desde `clinicagaladental.es`
| Sugerido | Persona | URL actual |
|---|---|---|
| `lorena.jpg` | Lorena Ustárroz Cacho | `…/Clinica-Gala12.jpg` |
| `marcela.jpg` | Dra. Marcela Moura Vieira | `…/Clinica-Gala14.jpg` |
| `manuel.jpg` | Dr. Manuel González O'Sullivan | `…/Clinica-Gala8.jpg` |
| `gala-marquez.jpg` | Gala Márquez López | *(sin foto → muestra inicial "G")* |

### Instalaciones (Inicio y La Clínica) — desde `clinicagaladental.es`
| Sugerido | Uso | URL actual |
|---|---|---|
| `recepcion.jpg` | "Por qué elegirnos" / recepción | `…/Clinica-Gala10-1024x682.jpg` |
| `clinica.jpg` | Galería / imagen ancha | `…/Clinica-Gala28-1024x682.jpg` |

### Tratamientos (Servicios y áreas) — desde Unsplash
Las tarjetas de tratamiento usan fotos de Unsplash. Puedes sustituirlas por fotos
propias de la clínica para una imagen 100 % auténtica.

## Antes / Después (casos reales)
Usa **2 fotos por caso** (la misma persona) **con consentimiento** del paciente:
`caso1-antes.jpg` / `caso1-despues.jpg`, etc. En `index.html`, sustituye las URLs
y quita la clase `demo` de cada `<div class="ba demo">`.

## Recomendaciones
- Equipo: fotos cuadradas (1:1). Hero/instalaciones: horizontales o verticales, ≥ 1000 px.
- Optimiza el peso (ideal < 300 KB) para que cargue rápido.
