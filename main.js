(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const fine = matchMedia('(hover:hover)').matches;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Loader ---------- */
  let pct = 0;
  const fill = $('#loader-fill'), pctEl = $('#loader-pct');
  const li = setInterval(() => {
    pct = Math.min(100, pct + Math.random() * 18);
    fill.style.width = pct + '%';
    pctEl.textContent = 'Initializing ' + Math.floor(pct) + '%';
    if (pct >= 100) { clearInterval(li); finish(); }
  }, 120);
  function finish() {
    setTimeout(() => {
      $('#loader').classList.add('done');
      document.body.classList.add('ready');
      typeLoop();
    }, 250);
  }

  /* ---------- Typed roles ---------- */
  const roles = ['Team Leader — Engineering', 'Full-Stack Developer', 'AI / ML Engineer', 'Data Analytics Specialist', 'Systems & CRM Architect'];
  const typed = $('#typed');
  let ri = 0, ci = 0, del = false;
  function typeLoop() {
    const w = roles[ri];
    typed.textContent = w.slice(0, ci);
    if (!del && ci === w.length) { del = true; return setTimeout(typeLoop, 1600); }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    ci += del ? -1 : 1;
    setTimeout(typeLoop, del ? 35 : 70);
  }

  /* ---------- Nav ---------- */
  const nav = $('#nav'), prog = $('#progress'), burger = $('#burger'), menu = $('#menu');
  const secs = $$('main section[id]');
  function onScroll() {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (y / h * 100) + '%';
    nav.classList.toggle('scrolled', y > 40);
    let cur = '';
    secs.forEach(s => { if (y >= s.offsetTop - 200) cur = s.id; });
    $$('#menu a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.onclick = () => { burger.classList.toggle('open'); menu.classList.toggle('open'); };
  $$('#menu a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

  /* ---------- Reveal + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(counter);
    if (e.target.matches('[data-count]')) counter(e.target);
    io.unobserve(e.target);
  }), { threshold: .12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (el.closest('.hero') ? i * 0.08 : 0) + 's'; io.observe(el); });
  function counter(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 1600);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Cursor, tilt, magnetic ---------- */
  if (fine) {
    const c = $('#cursor'), d = $('#cursor-dot');
    let mx = 0, my = 0, cx = 0, cy = 0;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; c.style.opacity = d.style.opacity = 1; d.style.left = mx + 'px'; d.style.top = my + 'px'; });
    (function loop() { cx += (mx - cx) * .15; cy += (my - cy) * .15; c.style.left = cx + 'px'; c.style.top = cy + 'px'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', e => c.classList.toggle('hover', !!e.target.closest('a,button,.tilt,input,textarea')));

    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transition = 'transform .1s'; el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transition = 'transform .6s'; el.style.transform = ''; });
    });
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ---------- Contact form -> mailto ---------- */
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `${f.get('msg')}\n\n— ${f.get('name')} (${f.get('email')})`;
    location.href = `mailto:singhsachin82736@gmail.com?subject=${encodeURIComponent('Portfolio enquiry from ' + f.get('name'))}&body=${encodeURIComponent(body)}`;
  });

  /* ---------- Three.js background ---------- */
  if (window.THREE && !reduce) initBg();
  function initBg() {
    const canvas = $('#bg3d');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060f, 0.035);
    const cam = new THREE.PerspectiveCamera(60, 1, .1, 200);
    cam.position.z = 12;

    // particle field
    const N = innerWidth < 700 ? 900 : 2200, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const pal = [new THREE.Color('#7c5cff'), new THREE.Color('#00e5ff'), new THREE.Color('#ff4fd8')];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - .5) * 60; pos[i * 3 + 1] = (Math.random() - .5) * 60; pos[i * 3 + 2] = (Math.random() - .5) * 60;
      const c = pal[i % 3]; col.set([c.r, c.g, c.b], i * 3);
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const points = new THREE.Points(pg, new THREE.PointsMaterial({ size: .09, vertexColors: true, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(points);

    // hero objects
    const group = new THREE.Group(); scene.add(group);
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(2.2, .55, 220, 24), new THREE.MeshBasicMaterial({ color: 0x7c5cff, wireframe: true, transparent: true, opacity: .35 }));
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true, transparent: true, opacity: .6 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, .015, 8, 120), new THREE.MeshBasicMaterial({ color: 0xff4fd8 }));
    group.add(knot, ico, ring);
    const orbs = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(.25 + Math.random() * .25), new THREE.MeshBasicMaterial({ color: pal[i % 3], wireframe: true }));
      m.userData = { r: 4.5 + Math.random() * 2, s: .3 + Math.random() * .5, o: Math.random() * 6.28, y: (Math.random() - .5) * 4 };
      orbs.push(m); group.add(m);
    }

    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
      group.position.x = innerWidth > 900 ? 4.2 : 0; group.scale.setScalar(innerWidth > 900 ? 1 : .7);
    }
    addEventListener('resize', resize); resize();

    let mx = 0, my = 0, sy = 0;
    addEventListener('mousemove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
    addEventListener('scroll', () => sy = scrollY, { passive: true });
    const clock = new THREE.Clock();
    (function animate() {
      const t = clock.getElapsedTime();
      knot.rotation.x = t * .15; knot.rotation.y = t * .2;
      ico.rotation.x = -t * .4; ico.rotation.y = t * .3;
      ring.rotation.x = t * .3; ring.rotation.y = t * .1;
      orbs.forEach(o => { const u = o.userData, a = t * u.s + u.o; o.position.set(Math.cos(a) * u.r, u.y + Math.sin(t + u.o), Math.sin(a) * u.r); o.rotation.x = t; o.rotation.y = t * .7; });
      points.rotation.y = t * .015 + mx * .2; points.rotation.x = my * .15;
      cam.position.x += (mx * 2 - cam.position.x) * .04;
      cam.position.y += (-my * 1.5 - sy * .004 - cam.position.y) * .04;
      group.rotation.y = mx * .5; group.rotation.x = my * .3;
      group.position.y = -sy * .004;
      group.children[0].material.opacity = Math.max(.08, .35 - sy / 2500);
      cam.lookAt(0, cam.position.y * .5, 0);
      renderer.render(scene, cam);
      requestAnimationFrame(animate);
    })();
  }

  /* ---------- 3D skill sphere (canvas) ---------- */
  (function sphere() {
    const cv = $('#sphere'), ctx = cv.getContext('2d');
    const words = ['Python', 'Java', 'JavaScript', 'C', 'MongoDB', 'MySQL', 'REST API', 'AI/ML', 'Full-Stack', 'Data Analytics', 'Computer Vision', 'Linux', 'Windows', 'GitHub', 'Colab', 'MATLAB', 'OpenFOAM', 'SmartPLS', 'VS Code', 'Leadership', 'Architecture', 'UI/UX', 'CRM', 'Deployment', 'IoT', 'Front-End', 'Mentoring', 'Problem Solving'];
    const pts = words.map((w, i) => {
      const k = (i + .5) / words.length, phi = Math.acos(1 - 2 * k), th = Math.PI * (1 + Math.sqrt(5)) * i;
      return { w, x: Math.cos(th) * Math.sin(phi), y: Math.sin(th) * Math.sin(phi), z: Math.cos(phi), hue: [260, 190, 320][i % 3] };
    });
    let size, dpr, vx = .004, vy = .003, drag = false, lx = 0, ly = 0, vis = true;
    function fit() { dpr = Math.min(devicePixelRatio, 2); size = cv.clientWidth; cv.width = cv.height = size * dpr; }
    fit(); addEventListener('resize', fit);
    new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
    const down = e => { drag = true; lx = e.clientX; ly = e.clientY; cv.style.cursor = 'grabbing'; };
    addEventListener('pointerup', () => { drag = false; cv.style.cursor = 'grab'; });
    cv.addEventListener('pointerdown', down);
    addEventListener('pointermove', e => { if (!drag) return; vy = (e.clientX - lx) * .0008; vx = -(e.clientY - ly) * .0008; lx = e.clientX; ly = e.clientY; });
    cv.style.touchAction = 'pan-y';
    (function draw() {
      requestAnimationFrame(draw);
      if (!vis) return;
      const s = size * dpr, R = s * .36;
      ctx.clearRect(0, 0, s, s);
      const cx = Math.cos(vx), sx = Math.sin(vx), cyy = Math.cos(vy), syy = Math.sin(vy);
      pts.forEach(p => {
        let y = p.y * cx - p.z * sx, z = p.y * sx + p.z * cx; p.y = y; p.z = z;
        let x = p.x * cyy + p.z * syy; z = -p.x * syy + p.z * cyy; p.x = x; p.z = z;
      });
      if (!drag) { vx *= .995; vy *= .995; if (Math.abs(vx) < .0015) vx = .0015 * Math.sign(vx || 1); if (Math.abs(vy) < .003) vy = .003 * Math.sign(vy || 1); }
      // glow
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, R * 1.3);
      g.addColorStop(0, 'rgba(124,92,255,.18)'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      [...pts].sort((a, b) => a.z - b.z).forEach(p => {
        const sc = (p.z + 2) / 3, a = .25 + .75 * ((p.z + 1) / 2);
        ctx.font = `600 ${Math.round(s * .042 * (.55 + sc * .7))}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = `hsla(${p.hue},95%,${68 + p.z * 12}%,${a})`;
        if (p.z > .3) { ctx.shadowColor = `hsl(${p.hue},100%,60%)`; ctx.shadowBlur = 12 * dpr; } else ctx.shadowBlur = 0;
        ctx.fillText(p.w, s / 2 + p.x * R, s / 2 + p.y * R);
      });
      ctx.shadowBlur = 0;
    })();
  })();
})();
