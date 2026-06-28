// Clínica GALA — Dentadura 3D realista (arcadas completas) con Three.js
// Carga diferida; respeta prefers-reduced-motion; degrada sin WebGL.
// Cada diente tiene forma anatómica propia (incisivo, canino, premolar,
// molar), apretados sin huecos y emergiendo de una encía continua.

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
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.25, 7.4);

    // Entorno PMREM (gradiente vertical) para reflejos suaves y realistas
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    {
      const c = document.createElement("canvas"); c.width = 16; c.height = 256;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "#f4fbfa"); g.addColorStop(0.45, "#c2e2dd");
      g.addColorStop(0.78, "#2f6f72"); g.addColorStop(1, "#0c2a2f");
      ctx.fillStyle = g; ctx.fillRect(0, 0, 16, 256);
      envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), side: THREE.BackSide })));
    }
    scene.environment = pmrem.fromScene(envScene, 0.04).texture;

    // Esmalte translúcido premium (con clearcoat y algo de transmisión)
    const enamel = new THREE.MeshPhysicalMaterial({
      color: 0xf7f3ea, roughness: 0.17, metalness: 0.0,
      clearcoat: 1.0, clearcoatRoughness: 0.1,
      transmission: 0.1, thickness: 0.7, ior: 1.6,
      attenuationColor: new THREE.Color(0xefe4cf), attenuationDistance: 2.4,
      sheen: 0.6, sheenColor: new THREE.Color(0xffffff),
      specularIntensity: 1.0, envMapIntensity: 1.15,
    });
    const gumMat = new THREE.MeshPhysicalMaterial({
      color: 0xcf7c84, roughness: 0.55, metalness: 0.0,
      clearcoat: 0.4, clearcoatRoughness: 0.5,
      sheen: 0.45, sheenColor: new THREE.Color(0xffd9dd), envMapIntensity: 0.7,
    });

    // ---- Geometría base: caja redondeada (mejor que una esfera) ----
    function roundedBox(seg, r) {
      const geo = new THREE.BoxGeometry(1, 1, 1, seg, seg, seg);
      const pos = geo.attributes.position; const v = new THREE.Vector3(); const core = 0.5 - r;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const qx = Math.max(-core, Math.min(core, v.x));
        const qy = Math.max(-core, Math.min(core, v.y));
        const qz = Math.max(-core, Math.min(core, v.z));
        const dx = v.x - qx, dy = v.y - qy, dz = v.z - qz;
        const len = Math.hypot(dx, dy, dz);
        if (len > 1e-5) { const k = r / len; v.set(qx + dx * k, qy + dy * k, qz + dz * k); }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      return geo;
    }
    const baseBox = roundedBox(13, 0.24);

    // Corona anatómica según el tipo de diente.
    // y local: -0.5 = borde incisal/oclusal (abajo), +0.5 = cuello/encía (arriba)
    function makeToothGeo(type, w, h, d) {
      const geo = baseBox.clone();
      const pos = geo.attributes.position; const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const yN = v.y + 0.5; // 0 incisal .. 1 cervical
        // Constricción cervical: el diente se estrecha hacia la encía
        const cerv = 0.82 + 0.18 * (1 - yN);
        v.x *= cerv; v.z *= cerv;
        // Cara frontal convexa (z+)
        if (v.z > 0) v.z += 0.08 * (1 - Math.pow(v.y * 2, 2));
        if (type === "canine") {
          // Cúspide puntiaguda hacia el borde incisal
          const t = Math.max(0, (-v.y - 0.1)) / 0.5;
          v.x *= 1 - 0.55 * t;
          if (v.y < -0.2) v.y -= 0.14 * t;
        } else if (type === "central" || type === "lateral") {
          // Borde incisal recto y ligeramente más ancho
          if (v.y < -0.3) v.x *= 1.05;
        } else if (type === "molar" || type === "premolar") {
          // Cara oclusal con relieve (ligera doble cúspide)
          if (v.y < -0.32) {
            const groove = Math.cos(v.x / (0.5 * cerv + 1e-3) * Math.PI) * 0.05;
            v.y += groove;
          }
        }
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();
      geo.scale(w, h, d);
      return geo;
    }

    // Media arcada, del centro hacia atrás: [tipo, ancho, alto, fondo]
    const slots = [
      ["central", 0.62, 0.96, 0.42],
      ["lateral", 0.50, 0.82, 0.40],
      ["canine", 0.54, 1.04, 0.50],
      ["premolar", 0.56, 0.74, 0.56],
      ["premolar", 0.56, 0.70, 0.58],
      ["molar", 0.74, 0.66, 0.66],
    ];
    const A = 2.05, B = 2.45, GUMY = 0.46;

    // Arcada canónica: encía arriba, coronas hacia abajo, dientes pegados.
    function buildArch() {
      const arch = new THREE.Group();
      const place = [];
      for (let side = -1; side <= 1; side += 2) {
        let theta = 0.0;
        for (const [type, w, h, d] of slots) {
          const dTheta = (w / A) * 0.9;
          const th = theta + dTheta * 0.5;
          place.push({
            type, w, h, d,
            x: side * A * Math.sin(th),
            z: -B * (1 - Math.cos(th)) + B * 0.9,
            ry: side * th,
          });
          theta += dTheta;
        }
      }
      // Encía continua siguiendo el arco
      const ordered = place.slice().sort((a, b) => Math.atan2(a.x, a.z + B) - Math.atan2(b.x, b.z + B));
      const pts = ordered.map((p) => new THREE.Vector3(p.x, GUMY, p.z));
      if (pts.length > 1) {
        const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.4);
        const gum = new THREE.Mesh(new THREE.TubeGeometry(curve, 110, 0.3, 18, false), gumMat);
        gum.scale.y = 0.8;
        arch.add(gum);
      }
      for (const p of place) {
        const tooth = new THREE.Mesh(makeToothGeo(p.type, p.w, p.h, p.d), enamel);
        tooth.position.set(p.x, GUMY - 0.06 - p.h * 0.5, p.z);
        tooth.rotation.y = p.ry;
        tooth.rotation.x = 0.06;
        arch.add(tooth);
      }
      return arch;
    }

    const denture = new THREE.Group();
    const upper = buildArch(); upper.position.y = 0.42;
    const lower = buildArch(); lower.rotation.x = Math.PI; lower.rotation.y = Math.PI; lower.position.y = -0.42;
    denture.add(upper, lower);
    denture.rotation.x = 0.14;
    denture.rotation.y = -0.22;
    scene.add(denture);

    // Iluminación de estudio + acentos de marca
    scene.add(new THREE.AmbientLight(0xc6dcd8, 0.45));
    const key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(2.5, 4, 4.5); scene.add(key);
    const teal = new THREE.DirectionalLight(0x2fa3a0, 1.2); teal.position.set(-3.8, 0.6, -2.5); scene.add(teal);
    const coral = new THREE.PointLight(0xd9a99c, 18, 30); coral.position.set(3.2, -2.2, 3); scene.add(coral);
    const topFill = new THREE.DirectionalLight(0xeaf6f4, 0.5); topFill.position.set(0, 5, 1); scene.add(topFill);

    // Destellos (sparkles) flotando alrededor
    function sparkleTex() {
      const c = document.createElement("canvas"); c.width = c.height = 64;
      const x = c.getContext("2d");
      const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.25, "rgba(214,244,240,0.85)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }
    const sTex = sparkleTex();
    const sparkles = [];
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: sTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.6 }));
      const a = (i / 16) * Math.PI * 2, rr = 2.9 + (i % 4) * 0.35;
      m.position.set(Math.cos(a) * rr, (((i * 53) % 100) / 100 - 0.5) * 3.4, Math.sin(a) * rr * 0.7 + 0.8);
      const s = 0.18 + (i % 3) * 0.05; m.scale.set(s, s, s);
      m.userData.phase = i * 0.7; m.userData.base = s;
      scene.add(m); sparkles.push(m);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.6;
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 1.1;
    controls.minPolarAngle = Math.PI * 0.32;
    controls.maxPolarAngle = Math.PI * 0.68;

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
      denture.position.y = Math.sin(t * 1.0) * 0.035;
      for (const s of sparkles) {
        const k = 0.5 + 0.5 * Math.sin(t * 1.6 + s.userData.phase);
        s.material.opacity = 0.25 + 0.55 * k;
        const sc = s.userData.base * (0.85 + 0.4 * k);
        s.scale.set(sc, sc, sc);
      }
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
