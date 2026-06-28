// Clínica GALA — Diente 3D (Three.js)
// Carga diferida: Three.js solo se importa cuando la sección entra en viewport.
// Respeta prefers-reduced-motion y degrada con elegancia si no hay WebGL.

const canvas = document.getElementById("tooth-canvas");
const wrap = document.querySelector(".tech-3d");

if (canvas && wrap) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    { rootMargin: "400px 0px" }
  );
  startObserver.observe(canvas);

  async function init() {
    const THREE = await import("three");
    const { OrbitControls } = await import("./vendor/OrbitControls.js");

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (err) {
      wrap.classList.add("no-3d");
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.15, 5.2);

    // Entorno (degradado suave) para reflejos de esmalte
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    {
      const c = document.createElement("canvas");
      c.width = 16;
      c.height = 256;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "#eaf6f4");
      g.addColorStop(0.45, "#bfe0db");
      g.addColorStop(0.75, "#2f6f72");
      g.addColorStop(1, "#0c2a2f");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 16, 256);
      const tex = new THREE.CanvasTexture(c);
      envScene.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(50, 32, 32),
          new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide })
        )
      );
    }
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;

    // Diente estilizado (perfil de revolución: raíz puntiaguda -> corona redondeada)
    const profile = [
      [0.02, -1.45], [0.12, -1.25], [0.22, -0.92], [0.32, -0.5], [0.4, -0.18],
      [0.46, 0.1], [0.52, 0.4], [0.535, 0.62], [0.49, 0.8], [0.35, 0.92],
      [0.17, 0.985], [0.0, 1.02],
    ].map((p) => new THREE.Vector2(p[0], p[1]));
    const geo = new THREE.LatheGeometry(profile, 80);
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xf2ede2,
      roughness: 0.26,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.16,
      sheen: 0.7,
      sheenColor: new THREE.Color(0xffffff),
      sheenRoughness: 0.5,
      envMapIntensity: 1.15,
    });
    const tooth = new THREE.Mesh(geo, mat);
    tooth.scale.set(1.05, 1, 0.72);
    tooth.rotation.x = 0.12;
    scene.add(tooth);

    // Luces (paleta de marca)
    scene.add(new THREE.AmbientLight(0xc6dcd8, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 1.05);
    key.position.set(2.5, 3.5, 4);
    scene.add(key);
    const teal = new THREE.DirectionalLight(0x2fa3a0, 1.15);
    teal.position.set(-3.5, 0.5, -2.5);
    scene.add(teal);
    const coral = new THREE.PointLight(0xd9a99c, 18, 30);
    coral.position.set(3, -2.2, 2.5);
    scene.add(coral);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.6;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 1.7;
    controls.minPolarAngle = Math.PI * 0.3;
    controls.maxPolarAngle = Math.PI * 0.7;

    function resize() {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    wrap.classList.add("is-3d"); // oculta el fallback

    let t = 0;
    let raf = null;
    let running = false;
    function frame() {
      raf = requestAnimationFrame(frame);
      t += 0.016;
      tooth.position.y = Math.sin(t * 1.1) * 0.05;
      controls.update();
      renderer.render(scene, camera);
    }
    function start() {
      if (running) return;
      running = true;
      if (reduce) {
        controls.update();
        renderer.render(scene, camera);
      } else {
        frame();
      }
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }
    // Renderiza al interactuar (clave en reduced-motion)
    controls.addEventListener("change", () => {
      if (!running || reduce) renderer.render(scene, camera);
    });

    // Pausa cuando no está en pantalla
    const playObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? start() : stop();
      },
      { threshold: 0.01 }
    );
    playObserver.observe(canvas);
    start();
  }
}
