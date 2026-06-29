# Cómo añadir un artículo al blog

El blog está **vacío** a propósito. Cada artículo es un archivo `.html` dentro de
esta carpeta `blog/`. Publicar uno nuevo son **3 pasos** y no hace falta tocar el
diseño ni el código del resto de la web.

---

## Paso 1 — Crear la página del artículo

1. Haz una **copia** del archivo `_plantilla-articulo.html`.
2. Renómbrala con un nombre en minúsculas, con guiones, **sin acentos ni espacios**.
   Ese nombre será la dirección del artículo en Google.
   - ✅ `limpieza-dental-cada-cuanto.html`
   - ❌ `Limpieza Dental.html`
3. Abre el archivo con cualquier editor de texto (incluso el Bloc de notas, o
   mejor [VS Code](https://code.visualstudio.com/), gratis) y **reemplaza todas
   las marcas `[[ ... ]]`** por tu contenido:
   - `[[TÍTULO DEL ARTÍCULO]]` → el título.
   - `[[RESUMEN DE 150-160 CARACTERES...]]` → la frase que sale en Google.
   - `[[NOMBRE-DEL-ARCHIVO]]` → el nombre que pusiste (sin `.html`).
   - `[[CATEGORÍA]]` → Estética dental / Ortodoncia / Implantes / Salud oral…
   - `[[IMAGEN.jpg]]` → una imagen de la carpeta `img/` (ej. `gabinete.jpg`).
   - Fechas, autor, etc.
4. Escribe el cuerpo entre `<div class="article-body"> … </div>` usando solo estas
   etiquetas (es como Word, pero con marcas):
   - `<p>un párrafo</p>`
   - `<h2>Subtítulo</h2>` y `<h3>Subtítulo menor</h3>`
   - `<ul><li>elemento de lista</li></ul>`
   - `<strong>negrita</strong>` y `<a href="../contacto.html">enlace</a>`

> Consejo SEO: que el título y el primer párrafo incluyan de forma natural lo que
> buscaría un paciente (p. ej. *"blanqueamiento dental en Sevilla"*).

---

## Paso 2 — Mostrarlo en la portada del blog

Abre `index.html` (el de esta carpeta `blog/`) y, dentro de
`<section class="section">`:

1. **Borra** el bloque `<div class="blog-empty"> … </div>` (el cartel de
   "Pronto publicaremos aquí"). Solo la primera vez.
2. Pega una **tarjeta** por cada artículo dentro de un grid. Tienes el modelo
   listo, comentado, justo debajo de ese bloque (búscalo: *"PLANTILLA DE TARJETA"*).
   Copia ese HTML, quítale los `<!-- -->` y cambia el enlace, el título, la
   imagen, la categoría, la fecha y el resumen.

---

## Paso 3 — Avisar a Google (sitemap)

Abre `sitemap.xml` (en la **raíz** del sitio, no en `blog/`) y añade una línea
con la dirección de tu artículo, justo después de la del blog:

```xml
<url><loc>https://clinicagaladental.es/blog/limpieza-dental-cada-cuanto.html</loc><lastmod>2026-07-15</lastmod><changefreq>yearly</changefreq><priority>0.6</priority></url>
```

(Cambia el nombre del archivo y la fecha `lastmod` por la de publicación.)

---

## Paso 4 — Publicar

Sube los archivos nuevos/modificados a tu hosting (ver
`INSTRUCCIONES-HOSTINGER.md` en la raíz):
`blog/tu-articulo.html`, `blog/index.html` y `sitemap.xml`.

¡Listo! El artículo ya está online con el mismo diseño que el resto de la web.

---

### ¿Quieres no tocar archivos nunca?

Esto funciona perfecto y es gratis, pero requiere copiar/pegar. Si prefieres un
**panel tipo WordPress en el navegador** (escribir el artículo en un formulario y
darle a "Publicar", sin ver código), se puede montar encima de esta misma web con
**Decap CMS**. Pídelo y te lo dejamos configurado.
