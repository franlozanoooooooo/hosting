# Clínica GALA — Rediseño moderno

Rediseño del sitio de **Clínica GALA Estética Dental** (Sevilla) aplicando un estilo
moderno inspirado en la plantilla OralCare (verde lima, cards redondeadas, hero limpio).

Sitio estático multipágina, sin dependencias de build.

## Páginas
- `index.html` — Inicio (hero, servicios, stats, testimonio, CTA)
- `tratamientos.html` — Catálogo de tratamientos y proceso
- `equipo.html` — Equipo de la clínica
- `sobre-nosotros.html` — Filosofía y valores
- `contacto.html` — Formulario, datos de contacto y mapa

## Estructura
```
clinica-gala/
├── index.html
├── tratamientos.html
├── equipo.html
├── sobre-nosotros.html
├── contacto.html
├── css/styles.css
└── js/main.js
```

## Cómo verlo
Abre `index.html` en el navegador, o sirve la carpeta:
```bash
cd clinica-gala && python3 -m http.server 8080
```
Luego visita http://localhost:8080

## Notas / pendientes de personalizar
- Las **fotos** son de stock (Unsplash). Sustituir por imágenes reales de la clínica.
- Los **nombres y cargos del equipo** son orientativos. Indicar los reales.
- Enlaces de **redes sociales** y **páginas legales** están como `#`.
- El **formulario** es una demo en cliente (sin backend). Conectar a email/CRM.

## Datos reales usados
- Estética Dental · "Especialistas en sonrisas"
- Dirección: Avenida José Laguillo 26, 41003 Sevilla
- Teléfono: +34 955 18 65 02 · Email: info@clinicagaladental.es
- Tratamientos: diseño de sonrisa, carillas, implantes, ortodoncia invisible y con
  brackets, blanqueamiento, prótesis, periodoncia, férulas, extracciones,
  odontología conservadora y digital.
- Extra: 1 hora de parking gratis en Parking José Laguillo Aussa.
