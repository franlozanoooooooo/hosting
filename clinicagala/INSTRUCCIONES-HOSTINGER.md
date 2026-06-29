# Cómo subir esta web a Hostinger (y migrar el dominio)

Esta web es **estática** (HTML, CSS, JS e imágenes). No necesita base de datos ni
PHP. Por eso se sube tal cual y funciona en cualquier alojamiento, incluido el
**hosting normal de Hostinger** (no hace falta WordPress).

---

## Opción A — Hosting estático de Hostinger (recomendada)

Es la que mejor encaja: rápida, segura y sin mantenimiento.

### 1. Subir los archivos
1. Entra en **hPanel** de Hostinger → tu plan → **Administrador de archivos**
   (*File Manager*).
2. Abre la carpeta **`public_html`** y borra lo que haya de ejemplo
   (`default.php`, etc.).
3. Sube **todo el contenido de esta carpeta** (que `index.html` quede
   directamente dentro de `public_html`, **no** dentro de una subcarpeta).
   - Puedes subir el `.zip` y usar la opción **"Extraer"** del propio
     administrador de archivos. Asegúrate de que al extraer los archivos
     quedan en la raíz de `public_html`.
4. Comprueba que dentro de `public_html` está: `index.html`, las carpetas
   `css/`, `js/`, `img/`, `video/`, `blog/`, y `sitemap.xml`, `robots.txt`, etc.

> El archivo `netlify.toml` solo lo usa Netlify; en Hostinger se ignora, puedes
> dejarlo o borrarlo, da igual.

### 2. Conectar el dominio
- **Si el dominio ya está en Hostinger:** en hPanel asegúrate de que el dominio
  apunta a este plan de hosting (*Dominios → Apuntar dominio*). Listo.
- **Si el dominio está en otro proveedor** (IONOS, GoDaddy, Dondominio…), tienes
  dos caminos:
  - **Cambiar los DNS (nameservers)** del dominio a los de Hostinger
    (te los da hPanel, suelen ser `ns1.dns-parking.com` y `ns2.dns-parking.com`).
    Es lo más cómodo. Tarda de minutos a 24-48 h en propagar.
  - O **mantener los DNS actuales** y crear un registro **A** apuntando a la IP
    que te indique Hostinger (y `www` como CNAME).

### 3. Activar HTTPS (candado)
En hPanel → **SSL** → instala el certificado **gratuito** para tu dominio.
Después activa "Forzar HTTPS".

### 4. Repasar antes de dar por bueno
- Que se ve el sitio en `https://tudominio.es`.
- Que `https://tudominio.es/blog/` carga (el blog vacío con "Pronto publicaremos").
- Que el `robots.txt` y el `sitemap.xml` cargan.

---

## Opción B — WordPress en Hostinger

Hostinger también ofrece WordPress, pero **no es recomendable** para esta web:
habría que reconstruir todo el diseño actual como un tema de WordPress, sería más
lento, con plugins y actualizaciones de seguridad constantes, y **peor para SEO**
que lo que ya tienes. Solo tendría sentido si quisieras un panel de administración
para muchos editores. Para añadir artículos sin tocar código hay una alternativa
mejor (ver abajo).

---

## Añadir artículos al blog

El blog está **vacío** y preparado para ir creciendo. Cómo publicar una entrada
está explicado paso a paso en **`blog/COMO-ANADIR-UN-ARTICULO.md`**.

Si prefieres un **panel tipo WordPress en el navegador** (escribir y pulsar
"Publicar", sin ver archivos ni código) manteniendo esta misma web rápida y su
SEO, se puede montar **Decap CMS** encima. Pídelo y se configura.

---

## Datos del sitio (para referencia)
- Dominio previsto: **clinicagaladental.es**
- Dirección: Avenida José Laguillo 26, 41003 Sevilla · +34 955 18 65 02
- El formulario de contacto es de demostración: conviene conectarlo a tu correo
  o a un servicio de formularios antes de darlo por definitivo.
