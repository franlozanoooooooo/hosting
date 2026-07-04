# Web del Club Atlético Antoniano — Guía de edición y publicación

Web estática (HTML + CSS + JavaScript, **sin instalaciones ni programas**): se edita
con cualquier editor de texto y se sube a cualquier hosting. Pensada para que puedas
cambiar textos, precios y fotos sin saber programar.

---

## 1. Los archivos

| Archivo | Qué es | ¿Lo editarás? |
|---|---|---|
| `index.html` | Toda la web: textos, secciones, precios, enlaces | ✅ Sí (textos) |
| `css/estilos.css` | El diseño. Los colores están al principio, en `:root` | Solo colores |
| `js/efectos.js` | Animaciones y efectos | ❌ No hace falta |
| `assets/img/` | Tus fotos (ver `LEEME-FOTOS.txt` ahí dentro) | ✅ Sí (subir fotos) |
| `assets/escudo-antoniano.svg` | Escudo (recreación). Si tienes el PNG oficial: guárdalo como `assets/escudo-antoniano.png` y en `index.html` reemplaza (Ctrl + H) `escudo-antoniano.svg` por `escudo-antoniano.png` | Opcional |

## 2. Cómo editar los textos

Abre `index.html` con el **Administrador de archivos de Hostinger** (lápiz "Editar") o
con el Bloc de notas / [VS Code](https://code.visualstudio.com/) en tu ordenador.

Todo lo editable está señalizado con comentarios así:

```html
<!-- ✏️ EDITAR: titular de la portada -->
```

Busca (Ctrl + F) el símbolo `✏️` y verás uno a uno todos los puntos editables:
titulares, historia, crónicas de Copa, categorías de cantera, **precios de abonos**,
teléfonos y enlaces. Cambia solo el texto entre `>` y `<`, guarda, y recarga la web.

**Precios de abonos:** busca `✏️ EDITAR: precios` — cada línea es una fila de la tabla.

> **Ojo con los enlaces repetidos:** el enlace de entradas
> (`https://antoniano.compralaentrada.com/`) y las redes sociales aparecen varias
> veces (menú, abonos, pie…). Para cambiarlos usa **Buscar y reemplazar** (Ctrl + H)
> con la URL completa y así los actualizas todos de una vez.

## 3. Cómo cambiar las fotos

Lee `assets/img/LEEME-FOTOS.txt`. Resumen: sube tus fotos a `assets/img/` con los
nombres exactos indicados (`portada.jpg`, `club.jpg`, `copa-betis.jpg`…) y aparecerán
solas. Mientras falte una foto, la web enseña un hueco con el nombre esperado.

## 4. Publicar en Hostinger (paso a paso)

1. Entra en **hPanel → Sitios web → Administrar**.
2. Abre **Archivos → Administrador de archivos**.
3. Entra en la carpeta **`public_html`** (borra lo que hubiera de ejemplo).
4. Sube **el contenido** de esta carpeta `antoniano/` (el `index.html`, y las carpetas
   `css/`, `js/` y `assets/`) directamente dentro de `public_html`.
   - Truco: comprime `antoniano/` en un `.zip`, súbelo y usa "Extraer"; luego mueve el
     contenido a `public_html` si quedó en una subcarpeta.
5. Abre tu dominio en el navegador. Listo.

Para futuras ediciones: hPanel → Administrador de archivos → editar `index.html` o
subir fotos a `assets/img/`. Los cambios son inmediatos (si no los ves, recarga con
Ctrl + F5).

> La web no necesita PHP, base de datos ni WordPress: funciona en cualquier plan de
> Hostinger, incluso el más básico.

**Toque final al publicar:** para que WhatsApp y las redes muestren la foto al
compartir tu web, edita en `index.html` la línea `og:image` (está señalizada con
`✏️ EDITAR`) y pon la dirección completa, p. ej.
`https://tudominio.es/assets/img/portada.jpg`.

## 5. Noticias de redes sociales (widget RRSS)

La sección **Actualidad** trae un hueco preparado (busca `✏️ WIDGET RRSS` en
`index.html`). Opciones, de más fácil a más completa:

1. **Elfsight – Social Feed** (elfsight.com): crea el widget con las cuentas del club
   (@caantoniano en Instagram/X y CAAntoniano en Facebook), copia el código `<script>`
   que te da y pégalo dentro del hueco. Plan gratuito con marca de agua y ~200
   visitas/mes; de pago desde ~5 €/mes.
2. **SociableKIT** o **Curator.io**: mismo sistema (pegar un código), planes gratuitos
   similares.
3. **Embeds oficiales gratuitos**: X permite incrustar la cronología del club gratis
   (publish.twitter.com) y Facebook tiene el "Page Plugin". Instagram ya no ofrece
   feed automático gratuito de terceros sin app propia.

> Nota: estos widgets son un código que se pega una vez; después se actualizan solos
> con cada publicación del club. Los plugins de WordPress (Smash Balloon, etc.) NO
> aplican aquí porque esta web no usa WordPress — y no lo necesita.

## 6. Cambiar colores o tipografías

Al principio de `css/estilos.css` está el bloque `:root` con los colores comentados
en español (granate, rojo, hueso…). Cambia el código hexadecimal y toda la web se
actualiza a la vez.
