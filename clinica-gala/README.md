# Clínica GALA — Rediseño moderno

Rediseño del sitio de **Clínica GALA Estética Dental** (Sevilla) aplicando un estilo
moderno inspirado en la plantilla OralCare (verde lima, cards redondeadas, hero limpio).

Sitio estático multipágina, sin dependencias de build.

## Páginas
- `index.html` — Inicio (hero, 3 categorías, filosofía, tecnología, antes/después, financiación, CTA)
- `servicios.html` — Hub de servicios con **buscador y filtros** por categoría
- `estetica-dental.html` — Categoría Estética dental
- `funcion.html` — Categoría Función
- `salud-oral.html` — Categoría Salud oral
- `equipo.html` — Equipo de la clínica (datos reales)
- `sobre-nosotros.html` — "La Clínica": filosofía y valores
- `contacto.html` — Formulario, datos de contacto y mapa

## Estructura
```
clinica-gala/
├── index.html
├── servicios.html
├── estetica-dental.html
├── funcion.html
├── salud-oral.html
├── equipo.html
├── sobre-nosotros.html
├── contacto.html
├── css/styles.css
├── js/main.js
└── img/ (placeholder.svg + tus fotos)
```

## Servicios (estructura real de negocio)
- **Estética dental:** diseño de sonrisa, carillas, blanqueamiento, remodelado de encías, ortodoncia invisible y convencional.
- **Función:** implantes, prótesis, bruxismo, apnea del sueño.
- **Salud oral:** endodoncia, odontología conservadora, disfunción de ATM, enfermedad periodontal.

## Cómo verlo
Abre `index.html` en el navegador, o sirve la carpeta:
```bash
cd clinica-gala && python3 -m http.server 8080
```
Luego visita http://localhost:8080

## Efectos (estilo OralCare)
- **Aparición al hacer scroll** (reveal) con escalonado en las tarjetas.
- **Parallax** suave en la imagen del hero.
- **Sombra dinámica** en la cabecera al desplazar.
- **Contador animado** en las cifras de Inicio.
- Respeta `prefers-reduced-motion` (se desactivan si el usuario lo pide).

## Imágenes
Coloca tus fotos en `img/` con los nombres indicados en `img/README.md`
(`dra-gala.jpg`, `recepcion.jpg`, `fachada.jpg`, ...). Mientras no estén, se
muestra una imagen de stock de reserva, así que la web nunca se ve rota.

## Notas / pendientes de personalizar
- Añadir las **fotos reales** en `img/` (ver `img/README.md`).
- **Nombres y cargos del equipo**: solo la Dra. Gala R-M es real; el resto es orientativo.
- Enlaces de **redes sociales** y **páginas legales** están como `#`.
- El **formulario** es una demo en cliente (sin backend). Conectar a email/CRM
  (p. ej. Netlify Forms).

## Datos reales usados
- Estética Dental · "Especialistas en sonrisas"
- Dirección: Avenida José Laguillo 26, 41003 Sevilla
- Teléfono: +34 955 18 65 02 · Email: info@clinicagaladental.es
- Tratamientos: diseño de sonrisa, carillas, implantes, ortodoncia invisible y con
  brackets, blanqueamiento, prótesis, periodoncia, férulas, extracciones,
  odontología conservadora y digital.
- Extra: 1 hora de parking gratis en Parking José Laguillo Aussa.
