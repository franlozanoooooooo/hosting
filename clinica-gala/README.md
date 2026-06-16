# Clínica GALA — Estética Dental · Sevilla

Sitio web estático (multipágina, sin build) para **Clínica GALA Estética Dental**
(Avenida José Laguillo 26, Sevilla). Rediseño premium con identidad propia,
tipografía editorial (Fraunces + Manrope) y la paleta petróleo/teal del uniforme
de la clínica.

> Demo desplegada en GitHub Pages dentro de este repo: `/clinica-gala/`.

## Páginas
- `index.html` — Inicio: hero con foto real de la Dra. Gala, barra de confianza,
  3 categorías, filosofía, tecnología, antes/después (ilustrativo), galería,
  testimonios, financiación, FAQ y CTA.
- `servicios.html` — Hub con **buscador y filtros** por área (14 tratamientos).
- `estetica-dental.html` · `funcion.html` · `salud-oral.html` — Páginas de área.
- `equipo.html` — Equipo de la clínica.
- `sobre-nosotros.html` — "La Clínica": filosofía, valores, horario y ubicación.
- `contacto.html` — Formulario, datos de contacto, horario y mapa.

## Novedades del rediseño
- **Identidad propia**: logo SVG, favicon, imagen Open Graph y placeholder de marca
  generados a medida (`img/logo.svg`, `img/favicon.svg`, `img/og.jpg`).
- **Foto real de la Dra. Gala** integrada y optimizada (hero, equipo y galería).
- **Tipografía editorial** Fraunces para titulares + Manrope para texto.
- **Componentes nuevos**: barra superior, barra de confianza, testimonios, FAQ
  acordeón, horario, botón flotante de WhatsApp y CTA fija en móvil.
- **SEO**: meta + Open Graph/Twitter, datos estructurados JSON-LD (`Dentist`),
  `sitemap.xml`, `robots.txt`, `site.webmanifest` y favicons.
- **Accesibilidad**: enlace "saltar al contenido", foco visible, `aria-*`,
  respeto a `prefers-reduced-motion` y fallback `<noscript>`.

## Imágenes — qué es local y qué se carga por URL
Ver detalle en [`img/README.md`](img/README.md).

- **Locales** (en `img/`): logo, favicons, OG, placeholder y las fotos de la
  **Dra. Gala** (`dra-gala.jpg`, `dra-gala-sq.jpg`, `dra-gala-wide.jpg`).
- **Por URL** (se muestran en el navegador del visitante): fotos del equipo y de
  las instalaciones desde `clinicagaladental.es`, e imágenes de tratamientos desde
  Unsplash. Todas tienen **fallback** automático al placeholder de marca, así que
  la web nunca se ve rota.

> Para servir **todo en local** (recomendado para producción), descarga esas
> imágenes a `img/` con los nombres indicados en `img/README.md` y sustituye las
> URLs. No se pudieron descargar automáticamente porque el entorno de desarrollo
> bloquea la salida a esos dominios.

## Antes / Después
El comparador de Inicio usa **imágenes ilustrativas** (marcadas como tales). Para
mostrar **casos reales** necesitas fotos de tus pacientes **con su consentimiento**;
no uses stock como si fueran resultados propios (no está permitido en publicidad
sanitaria). Coloca cada par como `img/caso1-antes.jpg` / `img/caso1-despues.jpg`,
sustituye las URLs y quita la clase `demo` del `<div class="ba demo">`.

## Cómo verlo
```bash
cd clinica-gala && python3 -m http.server 8080
# luego abre http://localhost:8080
```

## Pendiente de personalizar
- Localizar las fotos del equipo e instalaciones (ver arriba).
- **Testimonios**: son ejemplos representativos; sustitúyelos por reseñas reales.
- **Horario**: confirmado como Lun–Vie 9:00–20:00 (ajústalo si procede).
- Enlaces de **redes sociales** y **páginas legales** están como `#`.
- El **formulario** es una demo en cliente; conéctalo a email/CRM (p. ej. Netlify Forms).

## Datos reales usados
- Estética Dental · "Especialistas en sonrisas"
- Dirección: Avenida José Laguillo 26, 41003 Sevilla
- Teléfono: +34 955 18 65 02 · Email: info@clinicagaladental.es
- 1 hora de parking gratis en Parking José Laguillo (Aussa).
