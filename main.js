(() => {
  const loader = document.getElementById("loader");
  const pctEl = document.getElementById("loader-pct");
  const year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let p = 0;
  const tick = () => {
    p = Math.min(100, p + (p < 70 ? 3 : p < 90 ? 1.5 : 0.8));
    if (pctEl) pctEl.textContent = `${Math.floor(p)}%`;
    if (p < 100) requestAnimationFrame(tick);
    else {
      document.body.classList.add("is-ready");
      if (loader) loader.classList.add("is-done");
    }
  };
  requestAnimationFrame(tick);
  window.addEventListener("load", () => {
    p = Math.max(p, 92);
  });

  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");
  toggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  if (reduce) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* Projetos enter + parallax (exceto hero full) */
  const projetos = [...document.querySelectorAll(".projeto")];
  const parallaxImgs = [...document.querySelectorAll(".projeto__bg[data-parallax]")];

  if ("IntersectionObserver" in window) {
    const pio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle("is-in-view", e.isIntersecting);
        });
      },
      { threshold: 0.22 }
    );
    projetos.forEach((el) => pio.observe(el));
  } else {
    projetos.forEach((el) => el.classList.add("is-in-view"));
  }

  let ticking = false;
  const applyParallax = () => {
    ticking = false;
    if (reduce) return;
    const vh = window.innerHeight || 1;
    parallaxImgs.forEach((img) => {
      const parent = img.closest(".projeto");
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = (vh / 2 - (rect.top + rect.height / 2)) / vh;
      const strength = parseFloat(img.getAttribute("data-parallax") || "0.08");
      const y = progress * strength * 120;
      img.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(1.1)`;
    });
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyParallax);
  };
  if (!reduce) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    applyParallax();
  }

  /* Atmosferas: troca berahatxi → uni → guajupia ao longo do scroll */
  const atmos = [...document.querySelectorAll(".lp-atmos__img")];
  const setAtmos = (idx) => {
    atmos.forEach((img, i) => img.classList.toggle("is-on", i === idx));
  };
  const updateAtmos = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const t = max > 0 ? window.scrollY / max : 0;
    const idx = t < 0.33 ? 0 : t < 0.66 ? 1 : 2;
    setAtmos(idx);
  };
  window.addEventListener("scroll", updateAtmos, { passive: true });
  updateAtmos();

  /* Panteão — botões sutis prev/next */
  document.querySelectorAll(".panteao__wrap").forEach((wrap) => {
    const rail = wrap.querySelector(".panteao__rail");
    if (!rail) return;
    const step = () => Math.max(220, Math.floor(rail.clientWidth * 0.72));
    wrap.querySelector(".panteao__nav--prev")?.addEventListener("click", () => {
      rail.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" });
    });
    wrap.querySelector(".panteao__nav--next")?.addEventListener("click", () => {
      rail.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" });
    });
  });
})();
