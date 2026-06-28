// Clínica GALA — Dentadura 3D (arcadas completas) con Three.js
// Carga diferida; respeta prefers-reduced-motion; degrada sin WebGL.

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
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (err) { wrap.classList.add("no-3d"); return; }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.5, 7.0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    {
      const c = document.createElement("canvas"); c.width = 16; c.height = 256;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "#eaf6f4"); g.addColorStop(0.45, "#bfe0db");
      g.addColorStop(0.75, "#2f6f72"); g.addColorStop(1, "#0c2a2f");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
      envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.BackSide })));
    }
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;

    const enamel = new THREE.MeshPhysicalMaterial({
      color: 0xf5f1e9, roughness: 0.22, metalness: 0.0,
      clearcoat: 1.0, clearcoatRoughness: 0.16,
      sheen: 0.5, sheenColor: new THREE.Color(0xffffff), envMapIntensity: 1.1,
    });
    const gumMat = new THREE.MeshPhysicalMaterial({
      color: 0xd9777e, roughness: 0.6, clearcoat: 0.35, clearcoatRoughness: 0.5, envMapIntensity: 0.6,
    });

    // Corona de diente: esfera deformada (más plana delante en incisivos),
    // con la cara incisal/oclusal ligeramente aplanada.
    function makeTooth(w, h, d, molar) {
      const geo = new THREE.SphereGeometry(0.5, 28, 22);
      const pos = geo.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        // aplanar la mitad inferior (borde incisal/oclusal)
        if (v.y < 0) { v.x *= 1 + (-v.y) * 0.25; v.z *= 1 + (-v.y) * 0.15; v.y *= 0.92; }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      const t = new THREE.Group();
      const crown = new THREE.Mesh(geo, enamel);
      crown.scale.set(w, h, d);
      t.add(crown);
      if (molar) {
        for (let cx = -1; cx <= 1; cx += 2) for (let cz = -1; cz <= 1; cz += 2) {
          const cusp = new THREE.Mesh(geo, enamel);
          cusp.scale.set(w * 0.3, h * 0.26, d * 0.3);
          cusp.position.set(cx * w * 0.24, -h * 0.4, cz * d * 0.24);
          t.add(cusp);
        }
      }
      return t;
    }

    // media arcada (se refleja): [ang°, ancho, alto, fondo, molar]
    const slots = [
      [8, 0.5, 0.66, 0.3, false],
      [25, 0.4, 0.56, 0.3, false],
      [43, 0.44, 0.72, 0.42, false],
      [63, 0.54, 0.56, 0.54, false],
      [87, 0.66, 0.48, 0.62, true],
      [112, 0.66, 0.46, 0.64, true],
    ];
    const Ax = 1.85, Az = 2.5, GUMY = 0.28;

    // Arcada canónica: encía arriba, coronas colgando hacia abajo.
    function buildArch() {
      const arch = new THREE.Group();
      const place = [];
      for (let side = -1; side <= 1; side += 2)
        for (const [ang, w, h, d, molar] of slots) {
          const rad = (ang * Math.PI) / 180;
          place.push({ x: side * Math.sin(rad) * Ax, z: (1 - Math.cos(rad)) * -Az + Az * 0.92, rad: side * rad, w, h, d, molar });
        }
      // Encía (tubo siguiendo el arco, achatado)
      const ordered = place.slice().sort((a, b) => Math.atan2(a.x, a.z + Az) - Math.atan2(b.x, b.z + Az));
      const pts = ordered.map((p) => new THREE.Vector3(p.x, GUMY, p.z));
      if (pts.length > 1) {
        const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
        const gum = new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.26, 16, false), gumMat);
        gum.scale.y = 0.62;
        arch.add(gum);
      }
      for (const p of place) {
        const tooth = makeTooth(p.w, p.h, p.d, p.molar);
        tooth.position.set(p.x, GUMY - 0.04 - p.h * 0.5, p.z);
        tooth.rotation.y = p.rad;
        tooth.rotation.x = 0.08;
        arch.add(tooth);
      }
      return arch;
    }

    const denture = new THREE.Group();
    const upper = buildArch(); upper.position.y = 0.36;
    const lower = buildArch(); lower.rotation.x = Math.PI; lower.rotation.y = Math.PI; lower.position.y = -0.36;
    denture.add(upper, lower);
    denture.rotation.x = 0.16;
    scene.add(denture);

    scene.add(new THREE.AmbientLight(0xc6dcd8, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(2.5, 4, 4); scene.add(key);
    const teal = new THREE.DirectionalLight(0x2fa3a0, 1.1); teal.position.set(-3.5, 0.5, -2.5); scene.add(teal);
    const coral = new THREE.PointLight(0xd9a99c, 16, 30); coral.position.set(3, -2, 3); scene.add(coral);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.6;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 1.3;
    controls.minPolarAngle = Math.PI * 0.3;
    controls.maxPolarAngle = Math.PI * 0.7;

    function resize() {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    let raf = null, running = false, t = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      t += 0.016;
      denture.position.y = Math.sin(t * 1.05) * 0.035;
      controls.update();
      renderer.render(scene, camera);
    }
    function start() { if (running) return; running = true; reduce ? (controls.update(), renderer.render(scene, camera)) : frame(); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
    controls.addEventListener("change", () => { if (!running || reduce) renderer.render(scene, camera); });

    const playObserver = new IntersectionObserver(
      (entries) => { for (const e of entries) e.isIntersecting ? start() : stop(); }, { threshold: 0.01 }
    );
    playObserver.observe(canvas);
    start();
  }
}
