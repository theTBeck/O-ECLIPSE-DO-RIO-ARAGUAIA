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

/* Inicializador do Livro 3D Livre (Sem Card - Escala Ampliada) no Hero */
window.initHero3DBook = function() {
  const container = document.getElementById("hero-3d-book-container");
  if (!container || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(3.1, 1.25, 4.0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false; // Não interfere no scroll da página
  controls.maxPolarAngle = Math.PI / 2 + 0.08;
  controls.target.set(0, 0, 0);

  // Iluminação Soft Studio
  const ambient = new THREE.AmbientLight(0xffffff, 0.82);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
  keyLight.position.set(4.5, 6, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.85);
  fillLight.position.set(-5, 3, -2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
  rimLight.position.set(0, 4, -5);
  scene.add(rimLight);

  // Sombra no chão (Suave/Sombra de contato)
  const planeGeo = new THREE.PlaneGeometry(12, 12);
  const planeMat = new THREE.ShadowMaterial({ opacity: 0.42 });
  const shadowPlane = new THREE.Mesh(planeGeo, planeMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -2.05;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  // Texturas Oficiais
  const loader = new THREE.TextureLoader();
  const coverTex = loader.load("assets/C1-capa-frontal.jpg", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAnisotropy;
  });
  const backTex = loader.load("assets/C4-contracapa.jpg", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAnisotropy;
  });
  const spineTex = loader.load("assets/lombada-pt.jpg", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = maxAnisotropy;
  });

  // Textura do Miolo com Linhas Verticais de Páginas
  const pageCanvas = document.createElement("canvas");
  pageCanvas.width = 1024;
  pageCanvas.height = 1024;
  const pctx = pageCanvas.getContext("2d");
  pctx.fillStyle = "#f6f2e8";
  pctx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 1024; i += 4) {
    pctx.strokeStyle = i % 16 === 0 ? "rgba(70, 60, 50, 0.5)" : "rgba(105, 95, 80, 0.3)";
    pctx.lineWidth = 1;
    pctx.beginPath();
    pctx.moveTo(i, 0);
    pctx.lineTo(i, 1024); // Riscos verticais ao longo da altura
    pctx.stroke();
  }
  const pagesTex = new THREE.CanvasTexture(pageCanvas);
  pagesTex.anisotropy = maxAnisotropy;

  // 6 Faces da Caixa 3D
  const materials = [
    new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.65 }), // Direita (Miolo)
    new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.28, metalness: 0.05 }), // Esquerda (Lombada)
    new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.65 }), // Topo (Miolo)
    new THREE.MeshStandardMaterial({ map: pagesTex, roughness: 0.65 }), // Base (Miolo)
    new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.28, metalness: 0.05 }), // Frente (Capa C1)
    new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.28, metalness: 0.05 })   // Verso (Contracapa C4)
  ];

  // Geometria Ampliada em +20% (2.55 x 3.75 x 0.48)
  const bookGeo = new THREE.BoxGeometry(2.55, 3.75, 0.48);
  const bookMesh = new THREE.Mesh(bookGeo, materials);
  bookMesh.castShadow = true;
  bookMesh.receiveShadow = true;
  bookMesh.rotation.y = -Math.PI / 5;
  bookMesh.rotation.x = 0.08;
  scene.add(bookMesh);

  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    bookMesh.position.y = Math.sin(elapsed * 0.8) * 0.04;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
};
