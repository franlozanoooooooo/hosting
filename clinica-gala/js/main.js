// ---------- Menú móvil ----------
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.textContent = '☰';
    })
  );
}

// ---------- Envío de formulario (demo, sin backend) ----------
const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = document.querySelector('#form-ok');
    if (ok) ok.style.display = 'block';
    form.reset();
  });
}

// ---------- Cabecera con sombra al hacer scroll ----------
const header = document.querySelector('.site-header');
const onScrollHeader = () => {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 8);
};
onScrollHeader();
window.addEventListener('scroll', onScrollHeader, { passive: true });

// ---------- Parallax suave del hero ----------
const heroImg = document.querySelector('.hero-img img');
if (heroImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const offset = Math.min(window.scrollY * 0.12, 60);
    heroImg.style.transform = `translateY(${offset}px) scale(1.05)`;
  }, { passive: true });
}

// ---------- Contador animado ----------
function countUp(el) {
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const sep = el.dataset.sep === 'true';
  const duration = 1400;
  const start = performance.now();
  const format = (n) => {
    let v = Math.round(n);
    let s = sep ? v.toLocaleString('es-ES') : String(v);
    return prefix + s + suffix;
  };
  function frame(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = format(target * eased);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ---------- Reveal al hacer scroll + disparo del contador ----------
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('in'));
  document.querySelectorAll('[data-target]').forEach(el => {
    const sep = el.dataset.sep === 'true';
    const v = parseFloat(el.dataset.target);
    el.textContent = (el.dataset.prefix || '') + (sep ? v.toLocaleString('es-ES') : v) + (el.dataset.suffix || '');
  });
} else {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      entry.target.querySelectorAll('[data-target]').forEach(countUp);
      if (entry.target.matches('[data-target]')) countUp(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));
}
