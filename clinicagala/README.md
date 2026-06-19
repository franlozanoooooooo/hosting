# Clínica GALA — Estética Dental · Sevilla

Sitio web estático (multipágina, sin build) para **Clínica GALA Estética Dental**
(Avenida José Laguillo 26, Sevilla). Rediseño premium con identidad propia,
tipografía editorial (Fraunces + Manrope) y la paleta petróleo/teal de la marca.

100 % autónomo: **todas las fotos e iconos están incluidos** en `img/`. Listo para
arrastrar a **Netlify** (o servir como carpeta estática).

## Intro de marca
Al entrar, aparece primero el **logo animado** (el isotipo se "dibuja" y el
nombre se desvanece en pantalla) y después se muestra la web. Se enseña **una vez
por sesión** (no se repite al navegar entre páginas) y respeta `prefers-reduced-motion`.

## Páginas
- `index.html` — Inicio: intro de marca, hero con foto real de la Dra. Gala,
  barra de confianza, 3 categorías, filosofía, tecnología, **sección de vídeo**,
  galería real, testimonios, financiación, FAQ y CTA.
- `servicios.html` — Hub con **buscador y filtros** (14 tratamientos).
- `estetica-dental.html` · `funcion.html` · `salud-oral.html` — Páginas de área.
- `equipo.html` · `sobre-nosotros.html` · `contacto.html`.
- `blog/` — **Blog**: índice (`blog/index.html`) + 3 artículos optimizados para SEO.

## Novedades de esta versión (mejora 2026)
1. **Vídeo** (en Inicio): sección responsive con **carga diferida** (no descarga el
   vídeo hasta pulsar play), póster e infraestructura lista para MP4 propio o
   YouTube/Vimeo. Cómo configurarlo → `video/README.md`.
2. **Equipo** ampliado: las 5 personas con foto local en `img/equipo/`, diseño en
   grid responsive y **fallback de inicial** si falta la foto. Sube las fotos
   siguiendo `img/equipo/README.md`.
3. **SEO + GEO**: `title`/`description` únicos por página, jerarquía H1–H3, `alt`
   en imágenes, **Schema.org** (Organization, WebSite, LocalBusiness/Dentist con
   geocoordenadas, Person del equipo, BreadcrumbList, FAQPage, BlogPosting),
   canónicas absolutas, Open Graph + Twitter Cards, `sitemap.xml`, `robots.txt`
   y **meta geográficas** (geo.region, geo.position, ICBM) centradas en Sevilla.
4. **Blog**: índice + plantilla de artículo + 3 artículos de ejemplo con fecha,
   autor del equipo y datos estructurados `Article`.

> **Geocoordenadas:** se usa `37.38967, -5.97683` (aprox. Avda. José Laguillo 26).
> Ajústalas con la ubicación exacta de tu ficha de Google Business si lo prefieres.

## Desplegar en Netlify
1. **Arrastrar y soltar:** entra en Netlify → *Add new site* → *Deploy manually*
   y suelta el `.zip` (o la carpeta). El `index.html` está en la raíz.
2. **Por Git:** conecta el repositorio y pon el *publish directory* en esta carpeta.
   Incluye `netlify.toml` con `publish = "."`.

## Imágenes
Todas locales en `img/` (logo SVG, favicons, OG, foto real de la Dra. Gala,
recepción, gabinete, fachada, rótulo) e **iconos de marca** en las tarjetas de
tratamiento. Excepción: en `equipo.html`, las fotos de 3 miembros del equipo se
cargan desde el sitio actual de la clínica y, si no estuvieran disponibles,
muestran su inicial automáticamente. Para incluirlas en el paquete, guárdalas en
`img/` (`lorena.jpg`, `marcela.jpg`, `manuel.jpg`) y cambia las URLs.

## Dependencias externas (no son fotos)
- Google Fonts (tipografías) y un iframe de Google Maps en Contacto.

## Pendiente de personalizar
- **Testimonios**: son ejemplos; sustitúyelos por reseñas reales.
- **Horario**: Lun–Vie 9:00–20:00 (ajústalo si procede).
- Redes sociales y páginas legales están como `#`.
- El **formulario** es demo en cliente; conéctalo a Netlify Forms o a tu email/CRM.

## Datos reales usados
- Avenida José Laguillo 26, 41003 Sevilla · +34 955 18 65 02 · info@clinicagaladental.es
- 1 hora de parking gratis en Parking José Laguillo (Aussa).
