/* ═══════════════════════════════════════════════════════════════
   CLUB ATLÉTICO ANTONIANO · main.js
   Preloader · header · menú móvil · reveal · contadores ·
   timeline · parallax · scrollspy · volver arriba
   Sin dependencias. Respeta prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noIntro = /[?&]nointro\b/.test(location.search);

  /* ── Preloader / intro ─────────────────────────────────────── */
  var preloader = document.getElementById('preloader');
  var hero = document.querySelector('.hero');

  function finishIntro() {
    if (preloader && !preloader.classList.contains('is-done')) {
      preloader.classList.add('is-done');
      document.body.classList.remove('is-locked');
      preloader.addEventListener('transitionend', function () {
        preloader.remove();
      }, { once: true });
      // fallback por si transitionend no dispara
      setTimeout(function () { if (preloader.parentNode) preloader.remove(); }, 1200);
    }
    if (hero) hero.classList.add('hero--in');
  }

  if (!preloader || reduceMotion || noIntro) {
    if (preloader) { preloader.classList.add('no-anim'); preloader.remove(); }
    if (hero) hero.classList.add('hero--in');
  } else {
    document.body.classList.add('is-locked');
    var minTime = new Promise(function (res) { setTimeout(res, 2350); });
    var loaded = new Promise(function (res) {
      if (document.readyState === 'complete') res();
      else window.addEventListener('load', res, { once: true });
    });
    Promise.all([minTime, loaded]).then(finishIntro);
    setTimeout(finishIntro, 5000); // red de seguridad
  }

  /* ── Header con scroll ─────────────────────────────────────── */
  var header = document.getElementById('header');
  var totop = document.getElementById('totop');
  var heroCrest = document.querySelector('[data-parallax]');
  var timeline = document.getElementById('timeline');
  var tlProgress = timeline ? timeline.querySelector('.timeline__progress') : null;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;

    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (totop) totop.classList.toggle('is-visible', y > 620);

    // Parallax suave del escudo del hero
    if (heroCrest && !reduceMotion && y < window.innerHeight * 1.4) {
      var f = parseFloat(heroCrest.getAttribute('data-parallax')) || 0.1;
      heroCrest.style.transform = 'translateY(' + (y * f) + 'px)';
    }

    // Progreso de la línea de la Copa
    if (tlProgress && timeline) {
      var r = timeline.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.55 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      tlProgress.style.transform = 'scaleY(' + p + ')';
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ── Menú móvil ────────────────────────────────────────────── */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');

  function closeNav() {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('is-locked');
    burger.focus();
  }

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('is-locked', open);
      if (open) {
        var first = nav.querySelector('.nav__link');
        if (first) first.focus();
      }
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ── Reveal al hacer scroll ────────────────────────────────── */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    // Escalonado dentro de grupos
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      group.querySelectorAll('[data-reveal]').forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', (i * 90) + 'ms');
      });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ── Contadores (años, sin separador de miles) ─────────────── */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var ioCount = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          ioCount.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { ioCount.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ── Scrollspy (enlace activo) ─────────────────────────────── */
  var navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var sec = document.querySelector(link.getAttribute('href'));
    if (sec) sections.push({ link: link, sec: sec });
  });
  if ('IntersectionObserver' in window && sections.length) {
    var ioSpy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          var match = sections.find(function (s) { return s.sec === entry.target; });
          if (match) match.link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-38% 0px -55% 0px' });
    sections.forEach(function (s) { ioSpy.observe(s.sec); });
  }

  /* ── Volver arriba ─────────────────────────────────────────── */
  if (totop) {
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ── Año del pie ───────────────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
