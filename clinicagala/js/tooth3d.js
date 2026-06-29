// Clínica GALA — Dentadura 3D realista (modelo anatómico) con Three.js
// Modelo "mouth/teeth" (boca y dientes reales) cargado vía glTF.
// Crédito del modelo: AdnanKhan45/interactive_3d (MIT). Carga diferida,
// respeta prefers-reduced-motion y degrada sin WebGL.

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
    const { GLTFLoader } = await import("./vendor/GLTFLoader.js");

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (err) { wrap.classList.add("no-3d"); return; }
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Indicador de carga (el modelo pesa unos MB)
    const loadingEl = document.createElement("div");
    loadingEl.className = "tooth-loading";
    loadingEl.innerHTML = '<span class="spin" aria-hidden="true"></span>';
    wrap.appendChild(loadingEl);
    const clearLoading = () => loadingEl.remove();
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
    camera.position.set(0, 0.24, 5.3);

    // Entorno PMREM (gradiente) para reflejos suaves y realistas
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

    // Iluminación de estudio + acentos de marca
    scene.add(new THREE.AmbientLight(0xc6dcd8, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2, 4, 4.5); scene.add(key);
    const teal = new THREE.DirectionalLight(0x2fa3a0, 0.9); teal.position.set(-3.5, 0.8, -2.2); scene.add(teal);
    const coral = new THREE.PointLight(0xd9a99c, 8, 30); coral.position.set(3, -2, 3); scene.add(coral);
    const fill = new THREE.DirectionalLight(0xeaf6f4, 0.45); fill.position.set(0, 3.5, 2); scene.add(fill);

    // Materiales para los modos brackets / ortodoncia invisible
    const bracketMat = new THREE.MeshPhysicalMaterial({ color: 0xd9dee1, metalness: 0.95, roughness: 0.3, clearcoat: 0.6, envMapIntensity: 1.3 });
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xe6ebee, metalness: 1.0, roughness: 0.28, envMapIntensity: 1.4 });
    const clearMat = new THREE.MeshPhysicalMaterial({
      color: 0xeaf7ff, metalness: 0.0, roughness: 0.04, transmission: 0.92, thickness: 0.2, ior: 1.4,
      clearcoat: 1.0, clearcoatRoughness: 0.03, transparent: true, opacity: 0.55, depthWrite: false, envMapIntensity: 1.7,
    });

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
    const bracketBox = roundedBox(5, 0.28);
    // Bracket cuadrado: placa base + 4 aletas en las esquinas, dejando un
    // canal horizontal en el centro por donde pasa el alambre (como uno real).
    function makeBracket(s) {
      const g = new THREE.Group();
      const base = new THREE.Mesh(bracketBox, bracketMat); base.scale.set(s, s, s * 0.34); g.add(base);
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
        const w = new THREE.Mesh(bracketBox, bracketMat);
        w.scale.set(s * 0.34, s * 0.32, s * 0.55);
        w.position.set(sx * s * 0.3, sy * s * 0.32, s * 0.2);
        g.add(w);
      }
      return g;
    }

    // Pivote que gira suavemente; cámara orbitable por el usuario
    const pivot = new THREE.Group();
    scene.add(pivot);

    const bracesGroup = new THREE.Group(); bracesGroup.visible = false; pivot.add(bracesGroup);
    const alignerGroup = new THREE.Group(); alignerGroup.visible = false; pivot.add(alignerGroup);

    const loader = new GLTFLoader();
    loader.load(
      "models/tooth/Tooth-2.gltf",
      (gltf) => { clearLoading(); onModel(gltf); },
      undefined,
      () => { clearLoading(); wrap.classList.add("no-3d"); }
    );

    let teethMesh = null;
    function onModel(gltf) {
      const model = gltf.scene;
      // Centrar y escalar
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const ctr = box.getCenter(new THREE.Vector3());
      const maxd = Math.max(size.x, size.y, size.z) || 1;
      const s = 2.7 / maxd;
      model.position.sub(ctr);
      model.scale.setScalar(s);
      model.position.multiplyScalar(s);
      model.rotation.x = 0.07; // vista casi frontal de las arcadas
      pivot.add(model);

      model.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = o.receiveShadow = false;
          if (o.material) { o.material.envMapIntensity = 1.1; o.material.needsUpdate = true; }
          if (o.name === "Object_6") teethMesh = o; // malla de dientes
        }
      });

      pivot.updateMatrixWorld(true);
      if (teethMesh) { buildAligner(); buildBraces(); }

      buildToggle();
      resize();
      start();
    }

    // Férula transparente: copia de la malla de dientes, ligeramente mayor
    function buildAligner() {
      teethMesh.updateWorldMatrix(true, false);
      const geo = teethMesh.geometry.clone();
      geo.applyMatrix4(teethMesh.matrixWorld); // a coords del pivote (identidad)
      geo.computeBoundingBox();
      const c = geo.boundingBox.getCenter(new THREE.Vector3());
      geo.translate(-c.x, -c.y, -c.z); geo.scale(1.035, 1.025, 1.035); geo.translate(c.x, c.y, c.z);
      const shell = new THREE.Mesh(geo, clearMat);
      alignerGroup.add(shell);
    }

    // Brackets: un cuadrado centrado en CADA diente (detectando la parte más
    // saliente de cada corona) y el alambre pasando por la ranura de todos.
    function buildBraces() {
      teethMesh.updateWorldMatrix(true, false);
      const wbox = new THREE.Box3().setFromObject(teethMesh);
      const sz = wbox.getSize(new THREE.Vector3());
      const cx = (wbox.min.x + wbox.max.x) / 2;
      const brScale = sz.x * 0.058;
      const xLim = 0.40 * sz.x; // solo dientes frontales (evita caninos muy retraídos)
      const mw = teethMesh.matrixWorld;
      const pos = teethMesh.geometry.attributes.position;
      const nor = teethMesh.geometry.attributes.normal;
      const zfwd = new THREE.Vector3(0, 0, 1);

      // Coloca un cuadrado por diente en una arcada (banda vertical [yLo,yHi]):
      // detecta el bulto labial de cada corona y enhebra el alambre por todos.
      function placeArch(yLo, yHi) {
        const v = new THREE.Vector3(), n = new THREE.Vector3();
        const NB = 60;
        const bins = new Array(NB).fill(null);
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(mw);
          if (v.y < yLo || v.y > yHi || Math.abs(v.x - cx) > xLim) continue;
          n.fromBufferAttribute(nor, i).transformDirection(mw);
          if (n.z < 0.42) continue; // cara labial (frontal)
          const t = (v.x - wbox.min.x) / sz.x;
          const bi = Math.min(NB - 1, Math.max(0, Math.floor(t * NB)));
          if (!bins[bi] || v.z > bins[bi].z) bins[bi] = { p: v.clone(), n: n.clone().normalize(), z: v.z };
        }
        const prof = bins.filter(Boolean).sort((a, b) => a.p.x - b.p.x);
        if (prof.length < 4) return;
        const sm = prof.map((o, i) => {
          let a = 0, k = 0;
          for (let j = i - 1; j <= i + 1; j++) if (j >= 0 && j < prof.length) { a += prof[j].z; k++; }
          return a / k;
        });
        const W = 3;
        let peaks = [];
        for (let i = 0; i < prof.length; i++) {
          let isMax = true;
          for (let j = i - W; j <= i + W; j++) if (j >= 0 && j < prof.length && sm[j] > sm[i] + 1e-5) { isMax = false; break; }
          if (!isMax) continue;
          if (peaks.length && i - peaks[peaks.length - 1] < W) {
            if (sm[i] > sm[peaks[peaks.length - 1]]) peaks[peaks.length - 1] = i;
          } else peaks.push(i);
        }
        if (peaks.length < 5 || peaks.length > 9) {
          const M = Math.min(7, prof.length);
          peaks = [];
          for (let k = 0; k < M; k++) peaks.push(Math.round((prof.length - 1) * k / (M - 1)));
        }
        const pts = [];
        for (const pi of peaks) {
          const o = prof[pi];
          const br = makeBracket(brScale);
          br.position.copy(o.p).addScaledVector(o.n, brScale * 0.30);
          br.quaternion.setFromUnitVectors(zfwd, o.n);
          bracesGroup.add(br);
          pts.push(o.p.clone().addScaledVector(o.n, brScale * 0.46));
        }
        if (pts.length > 1) {
          const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2);
          bracesGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 180, brScale * 0.1, 8, false), wireMat));
        }
      }

      placeArch(wbox.min.y + 0.58 * sz.y, wbox.min.y + 0.80 * sz.y); // arcada superior
      placeArch(wbox.min.y + 0.34 * sz.y, wbox.min.y + 0.52 * sz.y); // arcada inferior
    }

    // ---- Conmutador: Natural / Con brackets / Invisible ----
    function setMode(mode) {
      bracesGroup.visible = mode === "brackets";
      alignerGroup.visible = mode === "invisible";
      renderer.render(scene, camera);
    }
    function buildToggle() {
      if (wrap.querySelector(".tooth-modes")) return;
      const ctrl = document.createElement("div");
      ctrl.className = "tooth-modes";
      ctrl.setAttribute("role", "group");
      ctrl.setAttribute("aria-label", "Comparar sonrisa: natural, con brackets u ortodoncia invisible");
      [["natural", "Natural"], ["brackets", "Con brackets"], ["invisible", "Invisible"]].forEach(([key, label], i) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = label; b.dataset.mode = key;
        if (i === 0) b.classList.add("is-active");
        b.addEventListener("click", () => {
          ctrl.querySelectorAll("button").forEach((x) => x.classList.remove("is-active"));
          b.classList.add("is-active");
          setMode(key);
        });
        ctrl.appendChild(b);
      });
      wrap.appendChild(ctrl);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.55;
    controls.minPolarAngle = Math.PI * 0.30;
    controls.maxPolarAngle = Math.PI * 0.70;
    let userActive = false;
    controls.addEventListener("start", () => (userActive = true));
    controls.addEventListener("end", () => (userActive = false));

    function resize() {
      const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize);

    // Rotación ligada al scroll (magic scrolling): el 3D gira según avanzas.
    function scrollYaw() {
      const r = canvas.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = r.top + r.height / 2;
      const p = Math.max(0, Math.min(1, 1 - center / vh)); // 0 (abajo) .. 1 (arriba)
      return (p - 0.5) * 1.7; // gira ~ -0.85 a 0.85 rad al recorrer la sección
    }
    let raf = null, running = false, last = 0;
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      if (ts - last < 33) return; // ~30 fps: menos carga de GPU/CPU
      last = ts;
      if (!userActive && !reduce) {
        const target = scrollYaw();
        pivot.rotation.y += (target - pivot.rotation.y) * 0.09; // suavizado
      }
      pivot.position.y = Math.sin(ts * 0.001) * 0.02;
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
  }
}
