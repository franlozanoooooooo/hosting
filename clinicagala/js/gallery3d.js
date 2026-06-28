// Clínica GALA — Galería 3D (globo de fotos) con Three.js
// Carga diferida; lee las imágenes de #gallery3d-images (JSON).
// Respeta prefers-reduced-motion y degrada sin WebGL.

const canvas = document.getElementById("gallery3d-canvas");
const wrap = document.querySelector(".gallery3d");
const dataEl = document.getElementById("gallery3d-images");

if (canvas && wrap && dataEl) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let urls = [];
  try { urls = JSON.parse(dataEl.textContent.trim()); } catch (e) {}
  let started = false;

  const startObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !started) {
          started = true;
          startObserver.disconnect();
          init().catch(() => wrap.classList.add("no-3d"));
        }
      }
    },
    { rootMargin: "500px 0px" }
  );
  startObserver.observe(canvas);

  async function init() {
    if (!urls.length) { wrap.classList.add("no-3d"); return; }
    const THREE = await import("three");
    const { OrbitControls } = await import("./vendor/OrbitControls.js");

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (err) { wrap.classList.add("no-3d"); return; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const INK = 0x0c2a2f;
    const COUNT = Math.max(46, urls.length); // nº de tarjetas (repite imágenes si hacen falta)
    const R = 4.7;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(INK, R * 1.4, R * 3.9);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, R * 2.65);

    const group = new THREE.Group();
    scene.add(group);

    const planeGeo = new THREE.PlaneGeometry(1, 1);
    const loader = new THREE.TextureLoader();
    let needsRender = true;
    const requestRender = () => { needsRender = true; };

    // Distribución uniforme en la esfera (espiral de Fibonacci)
    const inc = Math.PI * (3 - Math.sqrt(5));
    const off = 2 / COUNT;
    const TILE = 0.92;

    for (let i = 0; i < COUNT; i++) {
      const y = i * off - 1 + off / 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * inc;
      const dir = new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r);

      const url = urls[i % urls.length];
      const mat = new THREE.MeshBasicMaterial({ color: 0x9fb6b2, side: THREE.DoubleSide, toneMapped: false, fog: true });
      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.position.copy(dir).multiplyScalar(R);
      mesh.lookAt(dir.clone().multiplyScalar(R * 2));
      mesh.scale.set(TILE, TILE, 1);
      group.add(mesh);

      loader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
          mat.map = tex;
          mat.color.set(0xffffff);
          mat.needsUpdate = true;
          const a = (tex.image.width || 1) / (tex.image.height || 1);
          if (a >= 1) mesh.scale.set(TILE * a, TILE, 1);
          else mesh.scale.set(TILE, TILE / a, 1);
          requestRender();
        },
        undefined,
        () => {}
      );
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.9;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.addEventListener("change", requestRender);

    function resize() {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      requestRender();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    let raf = null, running = false;
    function frame() {
      raf = requestAnimationFrame(frame);
      const moving = controls.update(); // true si hay damping/autorotate en curso
      if (moving || needsRender || controls.autoRotate) {
        needsRender = false;
        renderer.render(scene, camera);
      }
    }
    function start() {
      if (running) return;
      running = true;
      if (reduce) { controls.update(); renderer.render(scene, camera); }
      else frame();
    }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    const playObserver = new IntersectionObserver(
      (entries) => { for (const e of entries) e.isIntersecting ? start() : stop(); },
      { threshold: 0.01 }
    );
    playObserver.observe(canvas);
    start();
  }
}
