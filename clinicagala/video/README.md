# Vídeo de presentación

La home (`index.html`) tiene una sección de vídeo con **carga diferida**: el vídeo
no se descarga hasta que el visitante pulsa «play» (mejor rendimiento y Core Web Vitals).
Mientras tanto se muestra un **póster** (imagen) con un botón de reproducción.

Tienes **dos formas** de poner tu vídeo. Edita la sección marcada con
`<!-- CÓMO AÑADIR EL VÍDEO -->` en `index.html`:

## Opción A — Vídeo propio (MP4)  ·  *configurada por defecto*
1. Sube tu archivo aquí con el nombre **`clinica-gala.mp4`** (esta carpeta `/video/`).
2. Listo: el bloque ya apunta a `data-video="video/clinica-gala.mp4"`.

Recomendado: MP4 (H.264 + AAC), 1080p, **< 15–20 MB**, formato horizontal 16:9.

## Opción B — YouTube o Vimeo (sin alojar el archivo)
En el `<div class="video-facade" ...>` de `index.html`:
1. **Borra** el atributo `data-video="video/clinica-gala.mp4"`.
2. **Añade** `data-embed="https://www.youtube-nocookie.com/embed/TU_ID_DE_VIDEO"`
   (usa `youtube-nocookie.com` para no cargar cookies hasta el clic).

## Cambiar el póster (imagen previa)
Cambia el `src` de `<img class="poster" ...>` y el atributo `data-poster`
por la imagen que prefieras (idealmente 16:9, p. ej. `img/tu-poster.jpg`).
