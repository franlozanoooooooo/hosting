// Clínica GALA — Diente 3D premium "kintsugi" (vetas de oro) con Three.js
// Inspirado en un héroe oscuro y editorial: un molar de marfil sobre un
// pedestal de piedra, con grietas de oro, luz dramática y giro suave.
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
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.45, 7.7);

    // Entorno PMREM: gradiente oscuro y cálido para reflejos sobrios
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    {
      const c = document.createElement("canvas"); c.width = 16; c.height = 256;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "#4a4035"); g.addColorStop(0.4, "#2a241d");
      g.addColorStop(0.8, "#100d0a"); g.addColorStop(1, "#05040a");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
      envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.BackSide })));
    }
    scene.environment = pmrem.fromScene(envScene, 0.05).texture;

    // ---------- Materiales ----------
    const enamel = new THREE.MeshPhysicalMaterial({
      color: 0xf1e9da, roughness: 0.32, metalness: 0.0,
      clearcoat: 0.8, clearcoatRoughness: 0.25,
      sheen: 0.5, sheenColor: new THREE.Color(0xfff6e8), envMapIntensity: 1.0,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: 0xc9962e, metalness: 1.0, roughness: 0.28,
      emissive: new THREE.Color(0x6e4a12), emissiveIntensity: 0.6, envMapIntensity: 1.5,
    });
    const stone = new THREE.MeshStandardMaterial({ color: 0x171310, roughness: 0.95, metalness: 0.0 });

    // ---------- Geometría base: caja redondeada ----------
    function roundedBox(seg, r) {
      const geo = new THREE.BoxGeometry(1, 1, 1, seg, seg, seg);
      const pos = geo.attributes.position; const v = new THREE.Vector3(); const core = 0.5 - r;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const qx = Math.max(-core, Math.min(core, v.x)), qy = Math.max(-core, Math.min(core, v.y)), qz = Math.max(-core, Math.min(core, v.z));
        const dx = v.x - qx, dy = v.y - qy, dz = v.z - qz; const len = Math.hypot(dx, dy, dz);
        if (len > 1e-5) { const k = r / len; v.set(qx + dx * k, qy + dy * k, qz + dz * k); }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals(); return geo;
    }

    // ---------- Molar (corona + cúspides + raíces) ----------
    const tooth = new THREE.Group();

    // Corona: caja redondeada ANCHA y BAJA (molar), estrechada hacia el cuello
    const crownGeo = roundedBox(26, 0.22);
    {
      const pos = crownGeo.attributes.position; const v = new THREE.Vector3();
      const cuspsXZ = [[-0.26, -0.24], [0.26, -0.24], [-0.26, 0.24], [0.26, 0.24]];
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const yN = v.y + 0.5; // 0 cuello .. 1 oclusal
        const taper = 0.74 + 0.26 * yN; // se estrecha hacia el cuello
        v.x *= taper; v.z *= taper;
        // Cúspides integradas: en la cara oclusal subimos 4 bultos y hundimos el surco
        if (v.y > 0.15) {
          let bump = -0.06; // surco central
          for (const [cxu, czu] of cuspsXZ) {
            const d2 = (v.x - cxu) ** 2 + (v.z - czu) ** 2;
            bump = Math.max(bump, 0.14 * Math.exp(-d2 / 0.020) - 0.04);
          }
          v.y += bump * ((v.y - 0.15) / 0.35);
        }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      crownGeo.computeVertexNormals();
    }
    const crown = new THREE.Mesh(crownGeo, enamel);
    crown.scale.set(1.62, 0.86, 1.5);
    crown.position.y = 0.5;
    tooth.add(crown);

    // Raíces: cuatro raíces cónicas cortas que convergen un poco hacia abajo
    const rootGeo = new THREE.CylinderGeometry(0.32, 0.10, 0.92, 16, 6, false);
    {
      const pos = rootGeo.attributes.position; const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const yN = (v.y + 0.46) / 0.92;
        v.x *= 0.82 + 0.18 * yN; v.z *= 0.82 + 0.18 * yN; // afinado suave hacia la punta
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      rootGeo.computeVertexNormals();
    }
    const rootDefs = [[-0.30, 0.15], [0.30, 0.15], [-0.24, -0.2], [0.24, -0.2]];
    for (const [rx, rz] of rootDefs) {
      const root = new THREE.Mesh(rootGeo, enamel);
      root.position.set(rx, -0.27, rz);
      root.rotation.z = -rx * 0.16;
      root.rotation.x = rz * 0.32;
      tooth.add(root);
    }

    // ---------- Vetas de oro (kintsugi) ----------
    // Caminos que recorren la corona y bajan por una raíz, como grietas doradas.
    function vein(points, radius) {
      const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.3);
      const geo = new THREE.TubeGeometry(curve, 80, radius, 7, false);
      return new THREE.Mesh(geo, gold);
    }
    const veins = new THREE.Group();
    veins.add(vein([[0.0, 0.92, 0.05], [0.2, 0.7, 0.55], [0.08, 0.42, 0.78], [0.26, 0.1, 0.72], [0.22, -0.25, 0.5], [0.36, -0.62, 0.28]], 0.030));
    veins.add(vein([[-0.05, 0.9, 0.12], [-0.4, 0.6, 0.5], [-0.62, 0.34, 0.28], [-0.68, 0.12, 0.0]], 0.024));
    veins.add(vein([[0.08, 0.42, 0.78], [-0.3, 0.42, 0.68], [-0.54, 0.44, 0.42]], 0.018)); // rama
    veins.add(vein([[0.26, 0.1, 0.72], [0.56, 0.2, 0.46], [0.72, 0.34, 0.1]], 0.018)); // rama
    veins.add(vein([[0.0, 0.9, -0.12], [0.12, 0.6, -0.5], [-0.12, 0.34, -0.66], [0.06, 0.0, -0.6]], 0.022));
    tooth.add(veins);

    tooth.position.y = 0.1;
    scene.add(tooth);

    // ---------- Pedestal de piedra ----------
    const pedestal = new THREE.Group();
    const slab = new THREE.Mesh(roundedBox(6, 0.18), stone);
    slab.scale.set(2.7, 0.46, 2.0); slab.position.y = -1.12;
    pedestal.add(slab);
    const slab2 = new THREE.Mesh(roundedBox(6, 0.2), stone);
    slab2.scale.set(2.1, 0.34, 1.55); slab2.position.y = -0.82;
    pedestal.add(slab2);
    scene.add(pedestal);

    // ---------- Iluminación dramática ----------
    scene.add(new THREE.AmbientLight(0x2a2620, 0.4));
    const key = new THREE.SpotLight(0xfff1dc, 90, 24, Math.PI * 0.28, 0.5, 1.4);
    key.position.set(-3.5, 7, 5); key.target = tooth; scene.add(key); scene.add(key.target);
    const goldRim = new THREE.DirectionalLight(0xffb95e, 1.6); goldRim.position.set(4.5, 1.5, -2.5); scene.add(goldRim);
    const coolRim = new THREE.DirectionalLight(0x9fc6d6, 0.5); coolRim.position.set(-4, 0.5, -3); scene.add(coolRim);
    const fill = new THREE.PointLight(0xffe6c0, 6, 20); fill.position.set(2, -1, 4); scene.add(fill);

    // Halos aditivos para simular el brillo (bloom barato) de las vetas
    function glowTex() {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const x = c.getContext("2d"); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,210,130,0.9)"); g.addColorStop(0.4, "rgba(220,160,60,0.35)"); g.addColorStop(1, "rgba(255,200,120,0)");
      x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
    }
    const gtex = glowTex();
    for (const p of [[0.28, 0.42, 0.78], [-0.6, 0.3, 0.3], [0.34, -0.5, 0.3]]) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.4 }));
      s.position.set(...p); s.scale.setScalar(0.4); tooth.add(s);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.05, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.9;
    controls.minPolarAngle = Math.PI * 0.34;
    controls.maxPolarAngle = Math.PI * 0.62;

    function resize() {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    let raf = null, running = false, last = 0;
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      if (ts - last < 33) return; // ~30 fps
      last = ts;
      tooth.position.y = 0.1 + Math.sin(ts * 0.001) * 0.04;
      controls.update();
      renderer.render(scene, camera);
    }
    function start() { if (running) return; running = true; reduce ? (controls.update(), renderer.render(scene, camera)) : (raf = requestAnimationFrame(frame)); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
    controls.addEventListener("change", () => { if (!running || reduce) renderer.render(scene, camera); });

    const playObserver = new IntersectionObserver(
      (entries) => { for (const e of entries) e.isIntersecting ? start() : stop(); }, { threshold: 0.01 }
    );
    playObserver.observe(canvas);
    start();
  }
}
