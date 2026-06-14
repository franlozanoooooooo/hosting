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

// ---------- Lightbox "Saber más" ----------
const lb = document.querySelector('#lightbox');
if (lb) {
  const lbImg = lb.querySelector('img');
  const lbTitle = lb.querySelector('h3');
  const lbDesc = lb.querySelector('p');
  const openLb = (btn) => {
    lbImg.src = btn.dataset.img;
    lbImg.alt = btn.dataset.title || '';
    lbTitle.textContent = btn.dataset.title || '';
    lbDesc.textContent = btn.dataset.desc || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('.more[data-img]').forEach(btn =>
    btn.addEventListener('click', () => openLb(btn))
  );
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.closest('.lightbox-close')) closeLb();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
}

// ---------- Comparador Antes / Después ----------
document.querySelectorAll('.ba').forEach(ba => {
  const range = ba.querySelector('.ba-range');
  const before = ba.querySelector('.before');
  const divider = ba.querySelector('.ba-divider');
  const update = (v) => {
    before.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
    divider.style.left = v + '%';
  };
  if (range) {
    update(range.value);
    range.addEventListener('input', () => update(range.value));
  }
});

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
