/* ════════════════════════════════════════════════════════════════════════
   CLUB ATLÉTICO ANTONIANO — Efectos e interacción
   ────────────────────────────────────────────────────────────────────────
   No hace falta tocar este archivo para editar contenidos.
   Todo respeta "prefers-reduced-motion" (accesibilidad).
   ════════════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* La clase .js activa los estados animados del CSS. Se pone aquí (y no en el
     HTML) a propósito: si este archivo no cargara, la web se vería entera. */
  document.documentElement.classList.add("js");

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1. Intro con escudo (solo la primera visita de la sesión) ────────── */
  var intro = document.getElementById("intro");
  function cerrarIntro() {
    if (!intro) return;
    intro.classList.add("fuera");
    document.body.classList.add("cargado");
  }
  var introVista = false;
  try { introVista = !!sessionStorage.getItem("introVista"); } catch (e) {}
  if (intro) {
    if (reducido || introVista) {
      intro.remove();
      document.body.classList.add("cargado");
    } else {
      try { sessionStorage.setItem("introVista", "1"); } catch (e) {}
      window.setTimeout(cerrarIntro, 1600);
      intro.addEventListener("click", cerrarIntro);
    }
  } else {
    document.body.classList.add("cargado");
  }

  /* ── 2. Título del héroe letra a letra ───────────────────────────────── */
  document.querySelectorAll("[data-letras]").forEach(function (titulo) {
    if (titulo.children.length) return; // si el editor mete etiquetas, se respeta tal cual
    var texto = titulo.textContent.trim();
    titulo.textContent = "";
    titulo.setAttribute("aria-label", texto);
    texto.split("").forEach(function (ch, i) {
      var s = document.createElement("span");
      s.className = "letra";
      s.setAttribute("aria-hidden", "true");
      s.textContent = ch === " " ? " " : ch;
      s.style.transitionDelay = 0.35 + i * 0.045 + "s";
      titulo.appendChild(s);
    });
  });

  /* ── 3. Cabecera: compacta al bajar, se esconde bajando y vuelve subiendo ─ */
  var cabecera = document.getElementById("cabecera");
  var ultimoY = 0;
  function alScroll() {
    var y = window.scrollY;
    if (cabecera) {
      cabecera.classList.toggle("compacta", y > 40);
      var menuAbierto = document.getElementById("menu-movil");
      var bloqueada = menuAbierto && menuAbierto.classList.contains("abierto");
      cabecera.classList.toggle("escondida", !bloqueada && y > 420 && y > ultimoY);
    }
    ultimoY = y;
  }
  window.addEventListener("scroll", alScroll, { passive: true });
  alScroll();

  /* ── 4. Menú móvil ────────────────────────────────────────────────────── */
  var botonMenu = document.getElementById("abrir-menu");
  var menuMovil = document.getElementById("menu-movil");
  function conmutarMenu(forzarCerrar) {
    if (!botonMenu || !menuMovil) return;
    var abrir = forzarCerrar ? false : !menuMovil.classList.contains("abierto");
    menuMovil.classList.toggle("abierto", abrir);
    botonMenu.classList.toggle("abierto", abrir);
    botonMenu.setAttribute("aria-expanded", abrir ? "true" : "false");
    document.body.style.overflow = abrir ? "hidden" : "";
    document.documentElement.style.overflow = abrir ? "hidden" : "";
    if (abrir) {
      menuMovil.querySelectorAll("nav a").forEach(function (a, i) {
        a.style.transitionDelay = 0.15 + i * 0.06 + "s";
      });
    }
  }
  if (botonMenu) botonMenu.addEventListener("click", function () { conmutarMenu(); });
  if (menuMovil) menuMovil.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { conmutarMenu(true); });
  });
  // Si la ventana pasa a tamaño escritorio con el menú abierto, se cierra solo
  var mqEscritorio = window.matchMedia("(min-width: 1081px)");
  function alCambiarTamano(e) { if (e.matches) conmutarMenu(true); }
  if (mqEscritorio.addEventListener) mqEscritorio.addEventListener("change", alCambiarTamano);
  else if (mqEscritorio.addListener) mqEscritorio.addListener(alCambiarTamano);

  /* ── 5. Revelados al hacer scroll ─────────────────────────────────────── */
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("dentro");
        observador.unobserve(e.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".revela, .revela-clip, .revela-lados").forEach(function (el) {
    observador.observe(el);
  });

  /* ── 6. Contadores animados (sección El Club) ─────────────────────────── */
  function animarCifra(el) {
    var bruto = el.getAttribute("data-cifra");
    if (!/^\d+$/.test(bruto) || reducido) { return; } // solo anima números puros
    var fin = parseInt(bruto, 10);
    var inicio = Math.max(0, fin - 140);
    var conPuntos = el.getAttribute("data-formato") === "miles";
    var t0 = null;
    function paso(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1);
      var suave = 1 - Math.pow(1 - p, 4);
      var valor = Math.round(inicio + (fin - inicio) * suave);
      el.textContent = conPuntos ? valor.toLocaleString("es-ES") : String(valor);
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }
  var obsCifras = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (e.isIntersecting) { animarCifra(e.target); obsCifras.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-cifra]").forEach(function (el) { obsCifras.observe(el); });

  /* ── 7. Parallax suave en fotos grandes ───────────────────────────────── */
  var capasParallax = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (!reducido && capasParallax.length) {
    var pintando = false;
    function pintarParallax() {
      capasParallax.forEach(function (capa) {
        var caja = capa.getBoundingClientRect();
        if (caja.bottom < 0 || caja.top > window.innerHeight) return;
        var factor = parseFloat(capa.getAttribute("data-parallax")) || 0.12;
        var centro = caja.top + caja.height / 2 - window.innerHeight / 2;
        capa.style.transform = "translateY(" + (-centro * factor).toFixed(1) + "px)";
      });
      pintando = false;
    }
    window.addEventListener("scroll", function () {
      if (!pintando) { pintando = true; requestAnimationFrame(pintarParallax); }
    }, { passive: true });
    window.addEventListener("resize", pintarParallax);
    pintarParallax();
  }

  /* ── 8. Línea de progreso de la sección Copa del Rey ──────────────────── */
  var listaNoches = document.querySelector(".noches");
  var progreso = document.querySelector(".noches .progreso");
  if (listaNoches && progreso && !reducido) {
    function pintarProgreso() {
      var caja = listaNoches.getBoundingClientRect();
      var visible = Math.min(Math.max(window.innerHeight * 0.75 - caja.top, 0), caja.height);
      progreso.style.height = visible + "px";
    }
    window.addEventListener("scroll", pintarProgreso, { passive: true });
    window.addEventListener("resize", pintarProgreso);
    pintarProgreso();
  }

  /* ── 9. Fotos pendientes: si falta el archivo se enseña el hueco ──────── */
  document.querySelectorAll(".foto img").forEach(function (img) {
    function marcar() { img.closest(".foto").classList.add("sin-foto"); }
    img.addEventListener("error", marcar);
    if (img.complete && img.naturalWidth === 0) marcar();
  });

  /* ── 10. Enlace activo del menú según la sección visible ──────────────── */
  var enlacesNav = Array.prototype.slice.call(document.querySelectorAll(".nav-principal a[href^='#']"));
  var secciones = enlacesNav.map(function (a) {
    return document.querySelector(a.getAttribute("href"));
  }).filter(Boolean);
  if (secciones.length) {
    var obsSecciones = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        enlacesNav.forEach(function (a) {
          a.classList.toggle("activo", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    secciones.forEach(function (s) { obsSecciones.observe(s); });
  }

  /* ── 11. Año automático en el pie ─────────────────────────────────────── */
  var anio = document.getElementById("anio-actual");
  if (anio) anio.textContent = new Date().getFullYear();
})();
