// ══════════════════════════════════════════
//  THREE.JS SCENE
// ══════════════════════════════════════════
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 1000);
camera.position.set(0, 0, 460);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));
const pLight = new THREE.PointLight(0xffffff, 1.2, 1200);
pLight.position.set(0, 0, 400);
scene.add(pLight);

const objects = {};
const pulseParticles = [];

function nodeMat(alpha=0.5) {
  return new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: alpha });
}

// ── CENTER NODE ──
const centerGroup = new THREE.Group();
scene.add(centerGroup);

const cRing3 = new THREE.Mesh(new THREE.TorusGeometry(22, 0.4, 8, 96), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 }));
centerGroup.add(cRing3);
const cRing2 = new THREE.Mesh(new THREE.TorusGeometry(15, 0.6, 8, 80), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 }));
centerGroup.add(cRing2);
const cRing1 = new THREE.Mesh(new THREE.TorusGeometry(9, 0.8, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
centerGroup.add(cRing1);
const centerMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(11, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, wireframe: true }));
centerGroup.add(centerMesh);
const centerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(4, 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
centerGroup.add(centerCore);
const centerGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(28, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.025 }));
centerGroup.add(centerGlow);

// ── DOMAIN NODES ──
Object.entries(NODES).forEach(([key, d]) => {
  const [wx, wy] = angleToXY(d.angle, d.dist);
  const r = d.size;
  const ring  = new THREE.Mesh(new THREE.TorusGeometry(r, 0.8, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 }));
  ring.position.set(wx, wy, 0); scene.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(r * 0.62, 0.5, 8, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 }));
  ring2.position.set(wx, wy, 0); ring2.rotation.x = 0.4 + Math.random() * 0.3; scene.add(ring2);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(r * 1.3, 0.3, 6, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.04 }));
  ring3.position.set(wx, wy, 0); scene.add(ring3);
  const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 0.28, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
  coreMesh.position.set(wx, wy, 0); scene.add(coreMesh);
  const glowMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 2.8, 1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
  glowMesh.position.set(wx, wy, -8); scene.add(glowMesh);
  const driftSeed = Math.random() * Math.PI * 2;
  const driftRadius = 1 + Math.random() * 2;
  const driftSpeed = 0.12 + Math.random() * 0.08;
  objects[key] = { ring, ring2, ring3, coreMesh, glowMesh, wx, wy, driftSeed, driftRadius, driftSpeed };
});

// ── CONNECTIONS with fade effect ──
const connectionMap = {};
const crossConnections = [];

function makeLine(x1, y1, z1, x2, y2, z2, opacity=0.15) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([x1,y1,z1, x2,y2,z2]), 3));
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity });
  const line = new THREE.Line(geo, mat);
  scene.add(line);
  return line;
}

// N solid-color segments per center→node line, interpolating white→nodeColor
const GRADIENT_SEGS = 5;
function makeGradientLine(x1, y1, z1, x2, y2, z2, opacity=0.1) {
  const segs = [];
  for (let i = 0; i < GRADIENT_SEGS; i++) {
    const t0 = i / GRADIENT_SEGS, t1 = (i + 1) / GRADIENT_SEGS;
    const tmid = (i + 0.5) / GRADIENT_SEGS;
    segs.push({
      line: makeLine(x1+(x2-x1)*t0, y1+(y2-y1)*t0, z1, x1+(x2-x1)*t1, y1+(y2-y1)*t1, z2, opacity),
      tmid
    });
  }
  return segs;
}

const keys = Object.keys(NODES);
Object.entries(NODES).forEach(([key, d]) => {
  const [wx, wy] = angleToXY(d.angle, d.dist);
  const lineEnd = (d.lineDist ?? d.dist) - d.size;
  const [lx, ly] = angleToXY(d.angle, lineEnd);
  connectionMap[key] = makeGradientLine(0, 0, 0, lx, ly, 0, 0.1);
});
for (let i = 0; i < keys.length; i++) {
  for (let j = i + 1; j < keys.length; j++) {
    const a = objects[keys[i]], b = objects[keys[j]];
    crossConnections.push(makeLine(a.wx, a.wy, 0, b.wx, b.wy, 0, 0.025));
  }
}

// ── STAR DUST PARTICLES ──
// FIX: store reference instead of calling scene.getObjectByName() every frame (O(n) scan)
const STAR_COUNT = 900;
let starsRef = null;
(function buildStars() {
  const geo = new THREE.BufferGeometry();
  const pos    = new Float32Array(STAR_COUNT * 3);
  const phases = new Float32Array(STAR_COUNT);
  for (let i = 0; i < STAR_COUNT; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 1400;
    pos[i*3+1] = (Math.random() - 0.5) * 1000;
    pos[i*3+2] = (Math.random() - 0.5) * 200 - 60;
    phases[i]  = Math.random() * Math.PI * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.1, transparent: true, opacity: 0.14, sizeAttenuation: true, depthWrite: false });
  starsRef = new THREE.Points(geo, mat);
  starsRef.userData.phases = phases;
  starsRef.userData.basePosArr = pos.slice();
  scene.add(starsRef);
})();

// ── BACKGROUND MICRO PARTICLES ──
const bgParticles = [];
for (let i = 0; i < 120; i++) {
  const m = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.6 + Math.random()*0.8, 0),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: Math.random()*0.12+0.02 })
  );
  m.position.set((Math.random()-0.5)*900, (Math.random()-0.5)*600, (Math.random()-0.5)*200 - 100);
  m.userData.vx = (Math.random()-0.5)*0.05;
  m.userData.vy = (Math.random()-0.5)*0.05;
  scene.add(m);
  bgParticles.push(m);
}

// ── PULSE PARTICLES ──
function makePulse(fromKey, toKey) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
  scene.add(mesh);
  const fromPos = fromKey === 'CENTER' ? {wx:0,wy:0} : objects[fromKey];
  const toPos   = toKey   === 'CENTER' ? {wx:0,wy:0} : objects[toKey];
  pulseParticles.push({ mesh, fromPos, toPos, t: Math.random(), speed: 0.004 + Math.random()*0.005 });
}
keys.forEach(k => { makePulse('CENTER', k); makePulse(k, 'CENTER'); });
makePulse(keys[0], keys[2]); makePulse(keys[1], keys[3]);

// ══════════════════════════════════════════
//  CAMERA
// ══════════════════════════════════════════
let camTarget = { x:0, y:0, z:460 };
let camCur    = { x:0, y:0, z:460 };
let isDrag = false, dragStart = {x:0,y:0}, camDragStart = {x:0,y:0};

canvas.addEventListener('mousedown', e => { isDrag=true; dragStart={x:e.clientX,y:e.clientY}; camDragStart={x:camTarget.x,y:camTarget.y}; });
document.addEventListener('mouseup', () => isDrag=false);
document.addEventListener('mousemove', e => {
  if (isDrag) {
    camTarget.x = camDragStart.x - (e.clientX - dragStart.x) * 0.4;
    camTarget.y = camDragStart.y + (e.clientY - dragStart.y) * 0.4;
  }
});
canvas.addEventListener('wheel', e => {
  camTarget.z = Math.max(160, Math.min(720, camTarget.z + e.deltaY * 0.4));
}, {passive:true});

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// ══════════════════════════════════════════
//  CURSOR
// ══════════════════════════════════════════
let curX=0, curY=0, rawX=0, rawY=0;
document.addEventListener('mousemove', e => { rawX=e.clientX; rawY=e.clientY; });
function updateCursor() {
  curX += (rawX-curX)*0.15; curY += (rawY-curY)*0.15;
  document.getElementById('cur').style.cssText  = `left:${rawX}px;top:${rawY}px`;
  document.getElementById('cur-r').style.cssText = `left:${curX}px;top:${curY}px`;
}

// ══════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════
let entered = false;
let hoveredKey = null;
let activeKey = null;
let t = 0;
const _nodeAura  = document.getElementById('node-aura');
const _depthBlur = document.getElementById('depth-blur');

function getNodeColor(key, isHover, isActive) {
  if (isActive || isHover) return NODES[key].col;
  return [255, 255, 255];
}

// ══════════════════════════════════════════
//  RENDER LOOP
// ══════════════════════════════════════════
const lerp = (a, b, f) => a + (b - a) * f;

function loop() {
  requestAnimationFrame(loop);
  t += 0.016;

  camCur.x = lerp(camCur.x, camTarget.x, 0.06);
  camCur.y = lerp(camCur.y, camTarget.y, 0.06);
  camCur.z = lerp(camCur.z, camTarget.z, 0.05);
  camera.position.set(camCur.x, camCur.y, camCur.z);

  const mx=(rawX/innerWidth-.5)*.04, my=(rawY/innerHeight-.5)*.03;
  camera.rotation.y = lerp(camera.rotation.y, -mx, 0.04);
  camera.rotation.x = lerp(camera.rotation.x, my, 0.04);

  // CENTER
  const breathFast=Math.sin(t*1.2)*.5+.5, breathSlow=Math.sin(t*.5)*.5+.5;
  const hasActive=!!(activeKey||hoveredKey);
  centerGroup.rotation.y=t*.04; centerGroup.rotation.x=Math.sin(t*.2)*.06;
  centerMesh.rotation.z=t*.02; centerCore.rotation.y=-t*.12; centerCore.rotation.x=t*.07;
  cRing3.rotation.z=t*.015; cRing2.rotation.z=-t*.025; cRing1.rotation.z=t*.04;
  cRing3.rotation.x=Math.sin(t*.18)*.15; cRing2.rotation.x=Math.cos(t*.22)*.12;
  const cd=hasActive?.4:1.0;
  cRing3.material.opacity=lerp(cRing3.material.opacity,.07*cd,.05);
  cRing2.material.opacity=lerp(cRing2.material.opacity,(.1+breathSlow*.05)*cd,.05);
  cRing1.material.opacity=lerp(cRing1.material.opacity,(.18+breathFast*.08)*cd,.05);
  centerCore.material.opacity=lerp(centerCore.material.opacity,(.6+breathFast*.3)*cd,.05);
  centerMesh.material.opacity=lerp(centerMesh.material.opacity,.06*cd,.05);
  centerGlow.material.opacity=lerp(centerGlow.material.opacity,.02*cd,.04);

  // DOMAIN NODES
  // FIX: use nodeIndices[key] instead of Object.keys(NODES).indexOf(key) (array alloc + O(n) per node per frame)
  Object.entries(objects).forEach(([key, obj]) => {
    const isHover=hoveredKey===key, isActive=activeKey===key;
    const isOther=(hoveredKey||activeKey)&&!isHover&&!isActive;
    const idx=nodeIndices[key];
    const b=Math.sin(t*.85+idx*1.3)*.5+.5;
    const driftX=Math.sin(t*obj.driftSpeed+obj.driftSeed)*obj.driftRadius;
    const driftY=Math.cos(t*obj.driftSpeed*.7+obj.driftSeed)*obj.driftRadius*.6;
    const px=obj.wx+driftX, py=obj.wy+driftY;
    obj.ring.position.set(px,py,0); obj.ring2.position.set(px,py,0);
    obj.ring3.position.set(px,py,0); obj.coreMesh.position.set(px,py,0); obj.glowMesh.position.set(px,py,-8);
    const rotSpeeds={WORK:.05,THOUGHTS:.018,EXPERIMENTS:.09,SYSTEMS:.055,INFO:.008};
    const spd=rotSpeeds[key];
    obj.ring.rotation.z=t*spd*(idx%2===0?1:-1);
    obj.ring2.rotation.z=-t*spd*1.6; obj.ring3.rotation.z=t*spd*.4;
    if (key==='SYSTEMS'&&isHover) obj.ring.rotation.z+=Math.sin(t*20)*.05;
    if (key==='EXPERIMENTS') obj.ring2.rotation.x=Math.sin(t*.35+obj.driftSeed)*.5;
    if (key==='THOUGHTS')    obj.ring.rotation.x=Math.sin(t*.15)*.25;
    const col=getNodeColor(key,isHover,isActive);
    const colHex=(col[0]<<16)|(col[1]<<8)|col[2];
    const basePres={WORK:.25,THOUGHTS:.10,EXPERIMENTS:.08,SYSTEMS:.09};
    const base=basePres[key];
    let tOpacity,tCore,tGlow;
    if (isHover) { tOpacity=.7+b*.25; tCore=1.0; tGlow=.03+b*.02; }
    else if (isActive) { tOpacity=.5+b*.2; tCore=.9; tGlow=0; }
    else if (isOther) { tOpacity=base*.25; tCore=.1; tGlow=0; }
    else { tOpacity=base+b*.04; tCore=.25+b*.15; tGlow=0; }
    obj.ring.material.opacity=lerp(obj.ring.material.opacity,tOpacity,.08);
    obj.ring2.material.opacity=lerp(obj.ring2.material.opacity,tOpacity*.4,.08);
    obj.ring3.material.opacity=lerp(obj.ring3.material.opacity,tOpacity*.2,.07);
    obj.coreMesh.material.opacity=lerp(obj.coreMesh.material.opacity,tCore,.07);
    obj.glowMesh.material.opacity=lerp(obj.glowMesh.material.opacity,tGlow,.05);
    obj.ring.material.color.setHex(colHex); obj.ring2.material.color.setHex(colHex);
    obj.ring3.material.color.setHex(colHex); obj.coreMesh.material.color.setHex(colHex); obj.glowMesh.material.color.setHex(colHex);
    const hoverScale=key==='WORK'?1.22:1.16;
    const tScale=isHover?hoverScale:isActive?1.30:isOther?.85:1.0;
    const sc=lerp(obj.ring.scale.x,tScale,.07);
    obj.ring.scale.setScalar(sc); obj.ring2.scale.setScalar(sc);
    obj.ring3.scale.setScalar(sc); obj.coreMesh.scale.setScalar(sc);
    if (isHover) playHoverTone(key);
  });
  if (!hoveredKey) lastHoveredForTone=null;

  // CONNECTIONS — multi-segment gradient: white at center → node color at node end
  Object.entries(connectionMap).forEach(([key, segs]) => {
    const isHover=hoveredKey===key, isActive=activeKey===key;
    const isOther=(hoveredKey||activeKey)&&!isHover&&!isActive;
    const pulse=Math.sin(t*1.5+nodeIndices[key])*.5+.5;
    let tOp;
    if (isHover) tOp=.60+pulse*.25;
    else if (isActive) tOp=.42+pulse*.18;
    else if (isOther) tOp=.02;
    else tOp=.08+pulse*.04;
    const col = (isHover||isActive) ? NODES[key].col : null;
    segs.forEach(({ line, tmid }) => {
      line.material.opacity = lerp(line.material.opacity, tOp, .08);
      if (col && Array.isArray(col)) {
        let r, g, b;
        if (key === 'EXPERIMENTS') {
          // Inverted: desaturated dim gray at origin → pure intense white at node end
          r = 0.28 + 0.72 * tmid;
          g = 0.28 + 0.72 * tmid;
          b = 0.26 + 0.74 * tmid;
        } else {
          // Boost saturation at node end — push color further from white
          const sat = key === 'WORK' ? 0.60 : 1.0;
          r = 1 + (col[0]/255*sat - 1) * tmid;
          g = 1 + (col[1]/255*sat - 1) * tmid;
          b = 1 + (col[2]/255*sat - 1) * tmid;
        }
        line.material.color.setRGB(r, g, b);
      } else {
        line.material.color.setRGB(1, 1, 1);
      }
    });
  });
  crossConnections.forEach(line => {
    const tOp=(hoveredKey||activeKey)?.008:.022;
    line.material.opacity=lerp(line.material.opacity,tOp,.05);
  });

  // PULSE PARTICLES
  pulseParticles.forEach(p => {
    p.t+=p.speed; if (p.t>1) { p.t=0; p.speed=.003+Math.random()*.006; }
    const fromX=p.fromPos.wx||0, fromY=p.fromPos.wy||0;
    const toX=p.toPos.wx||0, toY=p.toPos.wy||0;
    p.mesh.position.set(lerp(fromX,toX,p.t),lerp(fromY,toY,p.t),3);
    p.mesh.material.opacity=Math.sin(p.t*Math.PI)*.45;
  });

  // BACKGROUND PARTICLES
  // FIX: wrap both positive AND negative boundaries (particles were accumulating at negative edge)
  bgParticles.forEach(m => {
    m.position.x+=m.userData.vx; m.position.y+=m.userData.vy;
    if (m.position.x >  500) m.position.x = -500;
    if (m.position.x < -500) m.position.x =  500;
    if (m.position.y >  350) m.position.y = -350;
    if (m.position.y < -350) m.position.y =  350;
  });

  // STAR PARTICLES
  // FIX: use starsRef (stored at creation) instead of scene.getObjectByName('stars') O(n) scan every frame
  if (starsRef) {
    const posArr=starsRef.geometry.attributes.position.array;
    const base=starsRef.userData.basePosArr, phases=starsRef.userData.phases;
    for (let i=0; i<STAR_COUNT; i++) {
      const p=phases[i];
      posArr[i*3]  =base[i*3]  +Math.sin(t*.06+p)*1.8;
      posArr[i*3+1]=base[i*3+1]+Math.cos(t*.04+p*1.3)*1.4;
      posArr[i*3+2]=base[i*3+2]+Math.sin(t*.03+p*.7)*.6;
    }
    starsRef.geometry.attributes.position.needsUpdate=true;
    starsRef.material.opacity=.10+Math.sin(t*.18)*.04;
  }

  // ATMOSPHERIC AURA — project active node to screen, drive CSS radial gradient
  if (_nodeAura && activeKey && objects[activeKey]) {
    const obj = objects[activeKey];
    // Include drift so aura tracks the visual node position exactly
    const driftX = Math.sin(t*obj.driftSpeed+obj.driftSeed)*obj.driftRadius;
    const driftY = Math.cos(t*obj.driftSpeed*.7+obj.driftSeed)*obj.driftRadius*.6;
    const v = new THREE.Vector3(obj.wx+driftX, obj.wy+driftY, 0);
    v.project(camera);
    const rawX = (v.x + 1) / 2 * innerWidth;
    const rawY = (-v.y + 1) / 2 * innerHeight;
    // Clamp gradient center to viewport — keeps aura visible even when node is off-screen on zoom
    const sx = Math.max(0, Math.min(innerWidth,  rawX));
    const sy = Math.max(0, Math.min(innerHeight, rawY));
    // Scale aura size with zoom: closer camera → larger gradient so it fills the screen
    const zoomScale = 460 / Math.max(camCur.z, 160);
    const aw = Math.min(160, Math.round(90  * zoomScale));
    const ah = Math.min(150, Math.round(88  * zoomScale));
    const col = NODES[activeKey].col;
    const [r,g,b] = Array.isArray(col) ? col : [200,200,208];
    const AURA_I = {
      WORK:        [0.15, 0.07, 0.022],
      THOUGHTS:    [0.18, 0.09, 0.030],
      EXPERIMENTS: [0.22, 0.11, 0.040],
      SYSTEMS:     [0.12, 0.06, 0.018],
      INFO:        [0.10, 0.05, 0.015],
    };
    const [i0,i1,i2] = AURA_I[activeKey] || [0.12, 0.06, 0.018];
    _nodeAura.style.background = `radial-gradient(ellipse ${aw}vw ${ah}vh at ${sx}px ${sy}px, rgba(${r},${g},${b},${i0}) 0%, rgba(${r},${g},${b},${i1}) 28%, rgba(${r},${g},${b},${i2}) 50%, transparent 68%)`;

    // Depth blur mask — clear lens around selected node, blurred everywhere else
    if (_depthBlur) {
      const mask = `radial-gradient(circle at ${rawX}px ${rawY}px, transparent 0%, transparent 160px, black 320px)`;
      _depthBlur.style.webkitMaskImage = mask;
      _depthBlur.style.maskImage = mask;
    }
  }

  updateCursor();
  if (entered) updateLabels();
  renderer.render(scene, camera);
}
loop();
