# Web del Club Atlético Antoniano — Guía de despliegue

Web 100 % estática (HTML + CSS + JS vanilla, sin build). Lista para Hostinger.

## Desplegar en Hostinger

1. Entra en **hPanel → Archivos → Administrador de archivos**.
2. Abre la carpeta **`public_html`** de tu dominio.
3. Sube **el contenido de esta carpeta** (`index.html`, `404.html`, `.htaccess`,
   `robots.txt`, `sitemap.xml` y las carpetas `css/`, `js/`, `assets/`).
   ⚠️ Sube el *contenido*, no la carpeta `antoniano` entera.
4. Listo. Abre tu dominio y comprueba la web.

> Alternativa: comprime el contenido en un `.zip`, súbelo a `public_html`
> y usa "Extraer" en el administrador de archivos.

## Probar en local

```bash
cd antoniano
python3 -m http.server 8080
# abre http://localhost:8080
```

Trucos:
- `http://localhost:8080/?nointro` → salta la animación de entrada (útil al desarrollar).

## Pendientes / personalización (TODO)

| Qué | Dónde |
|-----|-------|
| **Escudo oficial**: la web usa una recreación vectorial (`assets/escudo.svg`). Para usar el archivo original, reemplaza el contenido del `<symbol id="crest">` de `index.html` por `<image>` con tu PNG, o sustituye los `<svg class="crest">` por `<img src="assets/escudo.png">` | `index.html` + `assets/` |
| **Dominio real** en Open Graph, robots y sitemap (busca `TU-DOMINIO`) | `index.html`, `robots.txt`, `sitemap.xml` |
| **Imagen para compartir** (`assets/og.jpg`, 1200×630) | `assets/og.jpg` |
| **Redes sociales**: enlaza los perfiles oficiales (ahora apuntan a `#`) | `index.html` → `footer__social` |
| **Aviso legal y privacidad**: crea las páginas y enlázalas | `index.html` → `footer__bottom` |
| **Noticias**: sustituye las tarjetas de la hemeroteca cuando haya noticias nuevas | `index.html` → sección `#noticias` |
| **Calendario/clasificación**: cuando arranque la temporada, añade el próximo partido en la sección Partidos | `index.html` → sección `#partidos` |
| **Fotos reales** (héroe, Copa, plantilla): añade `assets/img/` y colócalas donde quieras | `index.html` |

## Enlaces ya configurados

- **Entradas** (todos los botones): <https://antoniano.compralaentrada.com/> (pestaña nueva)
- **Clasificación**: página oficial de 2ª RFEF en <https://www.rfef.es/es/competiciones/segunda-federacion>
- Noticias de la hemeroteca → El Pespunte y Ayuntamiento de Lebrija

## Estructura

```
antoniano/
├── index.html          ← toda la web (una página con anclas)
├── 404.html            ← página de error personalizada
├── .htaccess           ← caché + gzip + 404 (Apache/Hostinger)
├── robots.txt / sitemap.xml
├── css/styles.css
├── js/main.js          ← preloader, reveals, contadores, timeline…
└── assets/             ← escudo, favicon, og.jpg
```

Accesibilidad y rendimiento: contraste AA, `prefers-reduced-motion`
respetado, sin librerías externas (solo Google Fonts), objetivos táctiles
≥ 44 px, HTML semántico.
