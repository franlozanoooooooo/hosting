// Clínica GALA — "Magic scrolling": entradas con zoom + parallax suave.
// Respeta prefers-reduced-motion. Sin dependencias externas.
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // 1) Marcos de imagen que entran con un sutil zoom al aparecer
  const frames = document.querySelectorAll(
    ".cat-card, .split-media, .team-card .photo, .gallery a, .svc-card .thumb, .post-card .post-thumb, .article-hero-media"
  );
  if (frames.length && "IntersectionObserver" in window) {
    frames.forEach((f) => f.classList.add("ms-media"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { e.target.classList.add("ms-in"); io.unobserve(e.target); }
      },
      { threshold: 0.18, rootMargin: "0px 0px -50px 0px" }
    );
    frames.forEach((f) => io.observe(f));
  }

  // 2) Parallax continuo y suave (gap-safe) en elementos seleccionados
  const layers = [];
  const push = (sel, speed) => document.querySelectorAll(sel).forEach((el) => layers.push({ el, speed }));
  push(".hero .float-card", 0.05);   // tarjetas flotantes del hero
  push(".hero-deco", -0.12);
  push(".banner, .cta-strip", 0.0);  // (sin efecto, reservado)

  let ticking = false;
  function update() {
    ticking = false;
    const mid = window.innerHeight / 2;
    for (const l of layers) {
      if (!l.speed) continue;
      const r = l.el.getBoundingClientRect();
      const prog = ((r.top + r.height / 2) - mid) / window.innerHeight;
      const ty = Math.max(-1, Math.min(1, prog)) * (l.speed * 220);
      l.el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0)`;
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  if (layers.some((l) => l.speed)) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }
})();
