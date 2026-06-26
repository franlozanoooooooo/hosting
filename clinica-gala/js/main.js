/* Clínica GALA — interacciones del sitio */
(function () {
  "use strict";

  // ---------- Intro de marca (se muestra una vez por sesión) ----------
  const intro = document.getElementById("intro");
  if (intro) {
    if (document.documentElement.classList.contains("intro-skip")) {
      intro.remove();
    } else {
      intro.addEventListener("animationend", (e) => {
        if (e.animationName === "introOut") intro.remove();
      });
      setTimeout(() => intro && intro.parentNode && intro.remove(), 4200);
    }
  }

  // ---------- Menú móvil ----------
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.textContent = open ? "✕" : "☰";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.textContent = "☰";
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  // ---------- Año actual en el footer ----------
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // ---------- Envío de formulario (demo, sin backend) ----------
  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = document.querySelector("#form-ok");
      if (ok) {
        ok.style.display = "block";
        ok.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  }

  // ---------- Barra de progreso + botón "arriba" ----------
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  document.body.appendChild(progress);

  const toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Volver arriba");
  toTop.innerHTML = "↑";
  document.body.appendChild(toTop);
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const header = document.querySelector(".site-header");
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 8);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    toTop.classList.toggle("show", y > 600);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Parallax suave del hero ----------
  const heroImg = document.querySelector(".hero-img img");
  if (heroImg && !reduceMotion) {
    window.addEventListener(
      "scroll",
      () => {
        const offset = Math.min(window.scrollY * 0.08, 40);
        heroImg.style.transform = `translateY(${offset}px) scale(1.04)`;
      },
      { passive: true }
    );
  }

  // ---------- Contador animado ----------
  function countUp(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const sep = el.dataset.sep === "true";
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 1500;
    const start = performance.now();
    const format = (n) => {
      let s;
      if (decimals > 0) {
        s = n.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      } else {
        const v = Math.round(n);
        s = sep ? v.toLocaleString("es-ES") : String(v);
      }
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
  const lb = document.querySelector("#lightbox");
  if (lb) {
    const lbTitle = lb.querySelector("h3");
    const lbDesc = lb.querySelector("p");
    const lbHead = lb.querySelector(".lightbox-head");
    const lbIc = lb.querySelector(".lh-ic");
    const openLb = (btn) => {
      if (lbTitle) lbTitle.textContent = btn.dataset.title || "";
      if (lbDesc) lbDesc.textContent = btn.dataset.desc || "";
      if (lbHead) lbHead.className = "lightbox-head" + (btn.dataset.cat ? " thumb-" + btn.dataset.cat : "");
      if (lbIc) {
        const card = btn.closest(".svc-card");
        const ic = card && card.querySelector(".thumb-ic");
        lbIc.innerHTML = ic ? ic.innerHTML : "";
      }
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const closeLb = () => {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    };
    document.querySelectorAll(".more[data-title]").forEach((btn) =>
      btn.addEventListener("click", () => openLb(btn))
    );
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.closest(".lightbox-close")) closeLb();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLb();
    });
  }

  // ---------- Comparador Antes / Después ----------
  document.querySelectorAll(".ba").forEach((ba) => {
    const range = ba.querySelector(".ba-range");
    const before = ba.querySelector(".before");
    const divider = ba.querySelector(".ba-divider");
    const update = (v) => {
      if (before) before.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
      if (divider) divider.style.left = v + "%";
    };
    if (range) {
      update(range.value);
      range.addEventListener("input", () => update(range.value));
    }
  });

  // ---------- FAQ: abrir de una en una ----------
  const faqItems = document.querySelectorAll(".faq .faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        faqItems.forEach((o) => {
          if (o !== item) o.open = false;
        });
      }
    });
  });

  // ---------- Buscador / filtro de servicios ----------
  const svcSearch = document.querySelector("#svc-search");
  const svcCards = Array.from(document.querySelectorAll(".svc-card"));
  const svcTags = Array.from(document.querySelectorAll(".svc-tag"));
  const svcEmpty = document.querySelector("#svc-empty");
  if (svcCards.length) {
    let activeCat = "all";
    const diacritics = /[̀-ͯ]/g;
    const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(diacritics, "");
    const applyFilter = () => {
      const q = norm(svcSearch ? svcSearch.value : "");
      let visible = 0;
      svcCards.forEach((card) => {
        const matchCat = activeCat === "all" || card.dataset.cat === activeCat;
        const haystack = norm((card.dataset.name || "") + " " + card.textContent);
        const matchText = !q || haystack.includes(q);
        const show = matchCat && matchText;
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (svcEmpty) svcEmpty.style.display = visible ? "none" : "block";
    };
    if (svcSearch) svcSearch.addEventListener("input", applyFilter);
    svcTags.forEach((tag) =>
      tag.addEventListener("click", () => {
        svcTags.forEach((t) => t.classList.remove("active"));
        tag.classList.add("active");
        activeCat = tag.dataset.cat;
        applyFilter();
      })
    );
  }

  // ---------- Reveal al hacer scroll + disparo del contador ----------
  const revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in"));
    document.querySelectorAll("[data-target]").forEach((el) => {
      const sep = el.dataset.sep === "true";
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const v = parseFloat(el.dataset.target);
      const s =
        decimals > 0
          ? v.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          : sep
          ? v.toLocaleString("es-ES")
          : v;
      el.textContent = (el.dataset.prefix || "") + s + (el.dataset.suffix || "");
    });
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          entry.target.querySelectorAll("[data-target]").forEach(countUp);
          if (entry.target.matches("[data-target]")) countUp(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ---------- Visor de galería (lightbox de imágenes) ----------
  const gitems = Array.from(document.querySelectorAll(".gitem"));
  const glb = document.getElementById("gallery-lightbox");
  if (glb && gitems.length) {
    const gimg = glb.querySelector("img");
    const gcap = glb.querySelector(".glb-cap");
    let idx = 0;
    const open = (i) => {
      idx = (i + gitems.length) % gitems.length;
      const a = gitems[idx];
      gimg.src = a.getAttribute("href") || a.dataset.full || "";
      gimg.alt = a.dataset.cap || "";
      if (gcap) gcap.textContent = a.dataset.cap || "";
      glb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      glb.classList.remove("open");
      document.body.style.overflow = "";
    };
    gitems.forEach((a, i) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        open(i);
      })
    );
    glb.addEventListener("click", (e) => {
      if (e.target === glb || e.target.closest(".glb-close")) close();
    });
    const prev = glb.querySelector(".glb-prev");
    const next = glb.querySelector(".glb-next");
    if (prev) prev.addEventListener("click", () => open(idx - 1));
    if (next) next.addEventListener("click", () => open(idx + 1));
    document.addEventListener("keydown", (e) => {
      if (!glb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") open(idx - 1);
      else if (e.key === "ArrowRight") open(idx + 1);
    });
  }
})();
