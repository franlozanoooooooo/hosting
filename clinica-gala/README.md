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
  barra de confianza, 3 categorías, filosofía, tecnología, galería real,
  testimonios, financiación, FAQ y CTA.
- `servicios.html` — Hub con **buscador y filtros** (14 tratamientos).
- `estetica-dental.html` · `funcion.html` · `salud-oral.html` — Páginas de área.
- `equipo.html` · `sobre-nosotros.html` · `contacto.html`.

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
