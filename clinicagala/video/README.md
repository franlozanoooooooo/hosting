# Vídeo

✅ **Ya hay un vídeo puesto**: `clinica-gala.mp4` (vertical, formato reel), que se
reproduce en la sección de vídeo de la home (`index.html`) con **carga diferida**
(no se descarga hasta pulsar «play») y póster `img/video-poster.svg`.

## Cambiar el vídeo
- **Otro MP4 propio**: reemplaza `clinica-gala.mp4` por tu archivo (mismo nombre).
  Si es horizontal (16:9), quita la clase `video-facade--portrait` y
  `video-wrap--portrait` en `index.html` para que se vea apaisado.
- **YouTube/Vimeo**: en el `<div class="video-facade ...">` de `index.html`,
  pon `data-embed="https://www.youtube-nocookie.com/embed/TU_ID"` y borra `data-video`.

## Cambiar el póster (imagen previa)
Sustituye `img/video-poster.svg` o cambia el `src` de `<img class="poster">`
y el atributo `data-poster` en `index.html`.

Recomendado para MP4: H.264 + AAC, **< 15–20 MB**.
