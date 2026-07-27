# Fotografías de los vehículos

Copia aquí las fotos con **estos nombres exactos**. La web las detecta sola:
aparecen a la vez en la tarjeta del catálogo, en el carrusel de destacados y en
la galería de la ficha. No hay que tocar el código.

Mientras un archivo no exista, la web muestra automáticamente una silueta
vectorial pintada en el color real de ese coche, así que la página nunca se ve
rota ni con huecos.

## Nombres de archivo

Cada vehículo admite hasta 3 fotos (`-1` es la principal, la que sale en la
tarjeta; `-2` y `-3` completan la galería del modal).

| Vehículo | Archivos |
|---|---|
| Peugeot 208 · Blanco · 8.500 € | `peugeot-208-blanco-1.jpg` · `-2.jpg` · `-3.jpg` |
| Peugeot 208 · Gris · 8.900 € | `peugeot-208-gris-1.jpg` · `-2.jpg` · `-3.jpg` |
| Mitsubishi Colt · Blanco | `mitsubishi-colt-blanco-1.jpg` · `-2.jpg` · `-3.jpg` |
| Volkswagen Polo · Blanco | `volkswagen-polo-blanco-1.jpg` · `-2.jpg` · `-3.jpg` |
| Ford Focus · Negro | `ford-focus-negro-1.jpg` · `-2.jpg` · `-3.jpg` |
| Peugeot 207 · Azul turquesa | `peugeot-207-turquesa-1.jpg` · `-2.jpg` · `-3.jpg` |
| Seat Córdoba · Gris oscuro | `seat-cordoba-gris-1.jpg` · `-2.jpg` · `-3.jpg` |
| Volkswagen New Beetle · Azul | `volkswagen-beetle-azul-1.jpg` · `-2.jpg` · `-3.jpg` |
| Kia Ceed · Blanco | `kia-ceed-blanco-1.jpg` · `-2.jpg` · `-3.jpg` |
| Citroën C4 · Gris plata | `citroen-c4-plata-1.jpg` · `-2.jpg` · `-3.jpg` |

## Las tres fotos que enviaste

Las fotos adjuntas en el chat no llegaron como archivos al entorno de trabajo,
así que no se pudieron guardar automáticamente. Corresponden a:

- **Ford Focus negro** (Mk3, llantas de aleación) → `ford-focus-negro-1.jpg`
- **Volkswagen Polo blanco** (6C, con cartel «Fos Motor») → `volkswagen-polo-blanco-1.jpg`
- **Peugeot 208 blanco** (5 puertas) → `peugeot-208-blanco-1.jpg`

Guárdalas con esos nombres en esta carpeta y aparecerán en la web al recargar.

## Recomendaciones

- **Formato:** `.jpg` (o `.webp` si prefieres, cambiando la extensión en
  `index.html`, en el array `fotos` de cada vehículo).
- **Proporción:** las tarjetas recortan a 4:3 y la galería a 16:10, siempre con
  `object-fit: cover`, así que cualquier foto horizontal encaja bien. Evita
  fotos verticales para la imagen principal.
- **Tamaño:** entre 1200 y 1600 px de ancho es más que suficiente. Comprime a
  ~200 KB por foto para que la web siga cargando rápido.
- **Encuadre:** tres cuartos delantero (como las que enviaste) es el que mejor
  queda y el que da un aspecto homogéneo a todo el catálogo.

## Añadir un vehículo nuevo

En `index.html`, dentro del array `VEHICULOS`, duplica un bloque y cambia los
datos. El campo `id` debe ser único y es el que da nombre a los archivos de
foto. `colorHex` es el color con el que se pinta la silueta provisional.
