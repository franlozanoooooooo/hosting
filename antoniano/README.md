# Club Atlético Antoniano — Web oficial

Web del **Club Atlético Antoniano** (Lebrija, Sevilla) construida a imagen de la web de
referencia, con las secciones adaptadas al club rojiblanco.

> **Lema:** *Convertir en rutina lo extraordinario.*

## 🧱 Secciones

- **Header** fijo + menú móvil (Noticias · Club · Cantera · Patrocinadores · Tienda · Clasificación · Entradas)
- **Intro** animada con el escudo
- **Hero** a pantalla completa con el lema del club
- **Noticia destacada**
- **Experiencia Estadio** (Estadio Municipal de Lebrija) → botón **Entradas**
- **Actualidad / Noticias** + sidebar (Horarios Cantera, Plan Semanal, Día de Partido)
- **Club** → historia + botón **Ver Clasificación de la Liga**
- **Cantera** (sustituye a la sección *Campus* de la referencia)
- **Tienda**
- **Patrocinadores**
- **Banner de cookies**
- **Footer** (contacto, enlaces, redes)

### Cambios respecto a la web de referencia
- ❌ Eliminada la sección **Jugadores**.
- 🔁 **Campus → Cantera**.
- 🎟️ Botones de **Entradas / Abonos** → `https://antoniano.compralaentrada.com/`
- 📊 **Club** enlaza a la **clasificación** de Segunda Federación (Wikipedia).

## 🔗 Enlaces externos configurados

| Elemento | Destino |
|---|---|
| Entradas / Abonos | https://antoniano.compralaentrada.com/ |
| Clasificación liga | https://es.wikipedia.org/wiki/Segunda_Federaci%C3%B3n_2025-26#Clasificaci%C3%B3n_4 |
| Instagram | https://www.instagram.com/caantoniano/ |
| X (Twitter) | https://x.com/caantoniano |
| Facebook | https://www.facebook.com/CAAntoniano/ |

## 🖼️ Imágenes — ¡IMPORTANTE!

El escudo (`assets/escudo-antoniano.svg`) es una **recreación en SVG** del original.
Si tienes el PNG oficial, sustitúyelo (o cambia la referencia en el HTML).

Las secciones con foto usan un **fondo rojiblanco automático** (estilo gradas) mientras no
exista la imagen real. Para poner tus fotos, basta con dejar estos archivos en `assets/`:

| Archivo | Dónde aparece |
|---|---|
| `assets/aficion.jpg` | Fondo del **hero** (la foto de la afición/grada que me pasaste) |
| `assets/destacada.jpg` | Imagen de la **noticia destacada** |
| `assets/estadio.jpg` | Fondo de la sección **Estadio** |
| `assets/patrocinadores.png` | Logos de **patrocinadores** |

> No hace falta tocar el código: si el archivo existe, se muestra; si no, se ve el fondo
> rojiblanco de respaldo.

## 🚀 Cómo verla / publicarla

- **Local:** abre `index.html` en el navegador (necesita conexión para Tailwind y las fuentes vía CDN).
- **Hosting estático:** sube la carpeta `antoniano/` a Netlify, GitHub Pages, Vercel, etc.
- Para que sea la web **principal** del dominio, mueve el contenido de `antoniano/` a la raíz
  del repositorio (sustituyendo el `index.html` actual de demo).

## ⚙️ Tecnología

HTML estático + **Tailwind CSS** (Play CDN) + fuentes Google (Oswald, Libre Franklin,
IBM Plex Mono, Playfair Display) + JavaScript propio (intro, header, menú, reveal, cookies).
Sin dependencias de build.

> Nota: el Play CDN de Tailwind es ideal para prototipo. Para producción conviene compilar
> Tailwind a un CSS estático (elimina el aviso de consola y mejora el rendimiento).

## 📚 Fuentes de la información del club
- https://es.wikipedia.org/wiki/Club_Atl%C3%A9tico_Antoniano
