// ══════════════════════════════════════════
//  HIT TEST
// ══════════════════════════════════════════
function screenToWorld2D(sx, sy) {
  const nx = ((sx / innerWidth) * 2 - 1);
  const ny = (-(sy / innerHeight) * 2 + 1);
  const vFov = camera.fov * Math.PI / 180;
  const h = 2 * Math.tan(vFov/2) * camCur.z;
  const w = h * camera.aspect;
  return { x: nx * w/2 + camCur.x, y: ny * h/2 - camCur.y };
}

function hitTest(sx, sy) {
  const w = screenToWorld2D(sx, sy);
  if (Math.hypot(w.x, w.y) < 32) return 'CENTER';
  return null;
}

// ══════════════════════════════════════════
//  HOVER / CLICK
// ══════════════════════════════════════════
document.addEventListener('mousemove', e => {
  if (!entered) return;
  const hit = hitTest(e.clientX, e.clientY);
  hoveredKey = hit && hit !== 'CENTER' ? hit : null;
  document.body.classList.toggle('on-node', !!hit);
  document.getElementById('focus-overlay').classList.toggle('active', !!hoveredKey);
  updateTooltip(hit, e.clientX, e.clientY);
  if (hit === 'CENTER') uiSound('hover:center', 600);
});

canvas.addEventListener('click', e => {
  if (!entered) return;
  const hit = hitTest(e.clientX, e.clientY);
  if (hit && hit !== 'CENTER') openPanel(hit);
  else if (hit === 'CENTER') returnToIntro();
  else closePanel();
});

function updateTooltip(hit, sx, sy) {
  const tip = document.getElementById('tip');
  if (hit && hit !== 'CENTER') {
    const d = NODES[hit];
    document.getElementById('tl').textContent = 'Domain';
    document.getElementById('tn').textContent = hit;
    document.getElementById('ts').innerHTML = `${d.body} · Click to enter`;
    tip.classList.add('on');
    tip.style.left = (sx + 18) + 'px';
    tip.style.top  = (sy - 16) + 'px';
    document.getElementById('h-state').textContent = hit;
  } else if (hit === 'CENTER') {
    document.getElementById('tl').textContent = 'Origin';
    document.getElementById('tn').textContent = 'Nifdel Rivera';
    document.getElementById('ts').textContent = 'Creative Technologist';
    tip.classList.add('on');
    tip.style.left = (sx+18)+'px'; tip.style.top = (sy-16)+'px';
  } else {
    tip.classList.remove('on');
    document.getElementById('h-state').textContent = 'Exploring';
  }
}

// ══════════════════════════════════════════
//  SIDE NAV — UNIVERSAL CONTEXTUAL
// ══════════════════════════════════════════
function updateSideNav(state) {
  const nav   = document.getElementById('side-nav');
  const label = document.getElementById('sn-label');
  const sub   = document.getElementById('sn-sub');
  if (!nav || !label) return;

  nav.classList.remove('state-map', 'state-panel', 'state-pm');

  if (state === 'hidden') {
    nav.classList.remove('visible');
    return;
  }

  nav.classList.add('visible');

  if (state === 'map') {
    nav.classList.add('state-map');
    label.textContent = 'Explorar';
    sub.textContent   = '';
    nav.style.removeProperty('--sn-color');
  } else if (state === 'panel') {
    nav.classList.add('state-panel');
    label.textContent = 'Cerrar';
    sub.textContent   = 'panel';
    if (activeKey) {
      const c = NODES[activeKey].col;
      nav.style.setProperty('--sn-color', `rgba(${c[0]},${c[1]},${c[2]},.75)`);
    }
  } else if (state === 'pm') {
    nav.classList.add('state-pm');
    label.textContent = 'Volver';
    sub.textContent   = 'al mapa';
    nav.style.removeProperty('--sn-color');
  }
}

function sideNavAction() {
  const pmOpen = document.getElementById('portfolio-mode').classList.contains('open');
  if (pmOpen) {
    closePortfolioMode();
  } else if (activeKey) {
    closePanel();
  } else if (!activeKey) {
    const d = NODES['WORK'];
    const [wx, wy] = angleToXY(d.angle, d.dist);
    camTarget.x = wx * 0.2; camTarget.y = -wy * 0.2; camTarget.z = 500;
    setTimeout(() => { camTarget.x=0; camTarget.y=0; camTarget.z=580; }, 2000);
  }
}

// ══════════════════════════════════════════
//  PANEL CONTENT
// ══════════════════════════════════════════
const panelContent = {
  work: `
    <div class="p-nodes">
      <div class="p-project">
        <div class="pp-tag">Motion Graphics</div>
        <div class="pp-name">Advertising Campaigns</div>
        <div class="pp-sub">Brand films, TV spots, and digital campaigns. Full pipeline from concept to final render.</div>
        <div class="pp-links"><a class="pp-link p-item-cta" href="#" onmouseenter="playCTAHover('work')">View reel</a></div>
      </div>
      <div class="p-project">
        <div class="pp-tag">3D & Visual Development</div>
        <div class="pp-name">Product & Environment</div>
        <div class="pp-sub">Product visualization, architectural environments, and character development for commercial clients.</div>
        <a class="p-item-cta" href="#" onmouseenter="playCTAHover('work')">Ver proyecto</a>
      </div>
      <div class="p-project">
        <div class="pp-tag">AI-Assisted Production</div>
        <div class="pp-name">Kling / Higgsfield Pipelines</div>
        <div class="pp-sub">Ultra-slow-motion athlete footage, chromatic aberration, point cloud / LiDAR reconstruction aesthetics.</div>
        <a class="p-item-cta" href="#" onmouseenter="playCTAHover('work')">Ver proyecto</a>
      </div>
      <div class="p-project">
        <div class="pp-tag">Branding</div>
        <div class="pp-name">Identity Systems</div>
        <div class="pp-sub">Visual identity, art direction, and brand language for creative and commercial clients.</div>
        <a class="p-item-cta" href="#" onmouseenter="playCTAHover('work')">Ver proyecto</a>
      </div>
    </div>
    <div class="p-work-see-all" onclick="openPortfolioMode()" onmouseenter="uiSound('hover:see-all')" style="cursor:none">
      <div>
        <span class="p-work-see-all-label">Ver portfolio completo</span>
        <span class="p-work-see-all-meta">6 proyectos · Motion · 3D · Branding · AI</span>
      </div>
      <div class="p-work-see-all-right">
        <span class="p-work-see-all-arrow">→</span>
        <span class="p-work-see-all-count">6 / 6</span>
      </div>
    </div>

    <div class="p-manifesto">
      <div class="p-manifesto-tabs">
        <button class="pm-tab active" data-tab="manifesto">Manifiesto</button>
        <button class="pm-tab" data-tab="contact">Contacto</button>
      </div>
      <div id="pmt-manifesto" class="pm-tab-content active">
        <div class="manifesto-body">
          <p><strong>El trabajo no es el punto de llegada.</strong> Es la evidencia de un sistema en movimiento — la prueba visible de que algo invisible fue pensado con suficiente profundidad.</p>
          <p>No distingo entre trabajo comercial y trabajo autoral. Esa distinción es una ficción conveniente para quienes no saben cómo hacer ambas cosas al mismo tiempo. Cada brief es un sistema con restricciones. Cada restricción es una oportunidad para pensar con más precisión.</p>
          <p><strong>El craft no es estética.</strong> Es epistemología. La manera en que hago una cosa es la manera en que pienso sobre esa cosa. La atención a los detalles no es perfeccionismo — es una declaración filosófica sobre qué merece existir en el mundo.</p>
          <p>Soy un creative technologist porque no creo en la separación entre el pensamiento y la herramienta. Unreal Engine, Three.js, Kling, Photoshop, papel y bolígrafo — son todos el mismo gesto. El medio cambia. La pregunta debajo no.</p>
          <p><strong>Lo que me interesa</strong> es el espacio donde la estructura se vuelve poética. Donde un framework se convierte en una voz. Donde un sistema genera algo que no esperabas.</p>
        </div>
      </div>
      <div id="pmt-contact" class="pm-tab-content">
        <div class="contact-body">
          <div class="contact-row">
            <div class="contact-label">Email</div>
            <div class="contact-val"><a href="mailto:hola@nifdel.com">hola@nifdel.com</a></div>
          </div>
          <div class="contact-row">
            <div class="contact-label">Instagram</div>
            <div class="contact-val"><a href="#" onclick="return false">@nifdel</a></div>
          </div>
          <div class="contact-row">
            <div class="contact-label">LinkedIn</div>
            <div class="contact-val"><a href="#" onclick="return false">Nifdel Rivera</a></div>
          </div>
          <div class="contact-row">
            <div class="contact-label">Behance</div>
            <div class="contact-val"><a href="#" onclick="return false">behance.net/nifdel</a></div>
          </div>
          <div class="contact-row">
            <div class="contact-label">Ubicación</div>
            <div class="contact-val">Guatemala · Remote worldwide</div>
          </div>
        </div>
      </div>
    </div>`,

  thoughts: `
    <div class="p-nodes">
      <div class="p-node">
        <div class="pn-n">Essay I</div>
        <div class="pn-name">La Jaula Transparente</div>
        <div class="pn-sub">On ego, consciousness, and the transparent cage we cannot see from within.</div>
        <a class="p-item-cta gold" href="jaula-v2-fixed.html" onclick="navigateOut(event, 'jaula-v2-fixed.html')" onmouseenter="playCTAHover('thoughts')">Leer ensayo</a>
      </div>
      <div class="p-node">
        <div class="pn-n">Framework</div>
        <div class="pn-name">Hipótesis H</div>
        <div class="pn-sub">A theoretical framework for meaning-making in fragmented systems.</div>
        <a class="p-item-cta gold" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-thoughts')">Próximamente</a>
      </div>
      <div class="p-node">
        <div class="pn-n">Universe</div>
        <div class="pn-name">Kyran & Lyra</div>
        <div class="pn-sub">Sci-fi narrative. The Lattice of States — consciousness and time reimagined.</div>
        <a class="p-item-cta gold" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-thoughts')">En desarrollo</a>
      </div>
      <div class="p-node">
        <div class="pn-n">Platform</div>
        <div class="pn-name">Nota Existencial</div>
        <div class="pn-sub">Essays on paradox, agency, and identity within systems that cannot fully perceive themselves.</div>
        <a class="p-item-cta gold" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-thoughts')">Próximamente</a>
      </div>
    </div>`,

  experiments: `
    <div class="p-nodes">
      <div class="p-node">
        <div class="pn-n">Research</div>
        <div class="pn-name">AI Video Studies</div>
        <div class="pn-sub">Slow-motion, chromatic aberration ghosts, directional motion blur. Kling 3.0 + Higgsfield.</div>
        <a class="p-item-cta dark" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-experiments')">Ver estudios</a>
      </div>
      <div class="p-node">
        <div class="pn-n">Aesthetic</div>
        <div class="pn-name">Point Cloud / LiDAR</div>
        <div class="pn-sub">Reconstruction aesthetics as visual language. The poetics of incomplete data.</div>
        <a class="p-item-cta dark" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-experiments')">Ver serie</a>
      </div>
      <div class="p-node">
        <div class="pn-n">3D</div>
        <div class="pn-name">Sculpting Lab</div>
        <div class="pn-sub">Figures, environments, abstraction — work that doesn't need a brief to exist.</div>
      </div>
      <div class="p-node">
        <div class="pn-n">Motion</div>
        <div class="pn-name">Physics & Procedural</div>
        <div class="pn-sub">Tests that are valuable precisely because they don't know what they are yet.</div>
      </div>
    </div>`,

  systems: `<div class="sys-block"><span class="s-cmd">$ ls ./frameworks</span>
<span class="s-out">→ bullseye_synapse.md</span>
<span class="s-out">→ ai_prompt_architecture/</span>
<span class="s-out">→ regreso_al_rigor/</span>
<span class="s-out">→ ue5_game_design/</span>
</div>
    <div class="p-nodes" style="margin-top:20px">
      <div class="p-node">
        <div class="pn-n">001</div>
        <div class="pn-name">Bullseye Synapse</div>
        <div class="pn-sub">Creative analysis framework. A system for dissecting what makes work land.</div>
        <a class="p-item-cta green" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')">Ver framework</a>
      </div>
      <div class="p-node">
        <div class="pn-n">002</div>
        <div class="pn-name">AI Prompt Architecture</div>
        <div class="pn-sub">Structured prompt engineering for cinematic AI video. Labeled sections, constraints, negative prompts.</div>
        <a class="p-item-cta green" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')">Ver sistema</a>
      </div>
      <div class="p-node">
        <div class="pn-n">003</div>
        <div class="pn-name">Regreso al Rigor</div>
        <div class="pn-sub">16-week interactive algebra course. Duolingo structure. Feynman-for-teenagers voice. UE5 soul.</div>
        <a class="p-item-cta green" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')">Ver curso</a>
      </div>
      <div class="p-node">
        <div class="pn-n">004</div>
        <div class="pn-name">Game Design — UE5</div>
        <div class="pn-sub">Spanish Inquisition / early colonial Latin America. Souls × God of War. La Llorona. El Cadejo.</div>
        <a class="p-item-cta green" href="#" onclick="return false" onmouseenter="uiSound('hover:panel-cta-systems')">En desarrollo</a>
      </div>
    </div>`
};

let dwellTimer = null;

// ══════════════════════════════════════════
//  OPEN / CLOSE PANEL
// ══════════════════════════════════════════
function openPanel(key) {
  const d = NODES[key];
  activeKey = key;
  const panel = document.getElementById('panel');
  panel.className = `open ${d.theme}`;
  document.getElementById('p-eye').textContent   = d.eye;
  document.getElementById('p-title').textContent = d.title;
  document.getElementById('p-desc').textContent  = d.desc;
  document.getElementById('p-body').innerHTML    = panelContent[d.body];

  // FIX: scope querySelector to #p-body to avoid selecting stale .pm-tab elements globally
  if (key === 'WORK') {
    document.querySelectorAll('#p-body .pm-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('#p-body .pm-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#p-body .pm-tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const target = document.getElementById('pmt-' + this.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  }

  updateLabels();
  setAudioMood(key);
  playActivationSound(key);
  const [wx, wy] = angleToXY(d.angle, d.dist);
  camTarget.x = wx * 0.25; camTarget.y = -wy * 0.25; camTarget.z = 450;
  updateSideNav('panel');
  document.getElementById('node-aura').classList.add('on');
  document.getElementById('depth-blur').classList.add('on');
}

function closePanel() {
  document.getElementById('panel').classList.remove('open');
  activeKey = null;
  updateLabels();
  setAudioMood(null);
  camTarget.x = 0; camTarget.y = 0; camTarget.z = 460;
  updateSideNav('map');
  document.getElementById('node-aura').classList.remove('on');
  document.getElementById('depth-blur').classList.remove('on');
}

// ══════════════════════════════════════════
//  PORTFOLIO MODE
// ══════════════════════════════════════════
function openPortfolioMode() {
  document.getElementById('portfolio-mode').classList.add('open');
  updateSideNav('pm');
  if (audioCtx && audioPlaying) gainNode.gain.setTargetAtTime(0.2, audioCtx.currentTime, 1.5);
}

function closePortfolioMode() {
  document.getElementById('portfolio-mode').classList.remove('open');
  updateSideNav(activeKey ? 'panel' : 'map');
  if (audioCtx && audioPlaying) gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 1.5);
  camTarget.x = 0; camTarget.y = 0; camTarget.z = 580;
}

// ══════════════════════════════════════════
//  LABELS — HTML overlay synced to 3D
// ══════════════════════════════════════════
const LABEL_META = {
  WORK:        { sub: '4 projects' },
  THOUGHTS:    { sub: '4 essays' },
  EXPERIMENTS: { sub: 'open lab' },
  SYSTEMS:     { sub: '4 frameworks' },
  INFO:        { sub: 'about' },
};

function initLabels() {
  updateSideNav('map');
  const container = document.getElementById('labels');
  Object.entries(NODES).forEach(([key, d]) => {
    const r = d.badgeR;
    const el = document.createElement('div');
    el.className = 'n-badge';
    el.dataset.key = key;
    el.innerHTML = `
      <div class="n-badge-ring" style="width:${r*2}px;height:${r*2}px;">
        <svg viewBox="0 0 ${r*2} ${r*2}">
          <circle class="c-outer" cx="${r}" cy="${r}" r="${r - 2}"/>
          <circle class="c-inner" cx="${r}" cy="${r}" r="${r * 0.6}"/>
        </svg>
        <div class="n-badge-pulse" style="width:${r*2}px;height:${r*2}px;top:0;left:0;"></div>
        <div class="n-badge-dot"></div>
      </div>
      <div class="n-badge-text">
        <span class="n-badge-name">${key}</span>
        <span class="n-badge-sub">${LABEL_META[key].sub}</span>
      </div>
    `;
    el.addEventListener('click', () => {
      if (key === 'INFO') {
        uiSound('hover:back-btn');
        // Persist audio state and fade out before navigating
        if (audioPlaying && gainNode) {
          sessionStorage.setItem('audioOn', '1');
          gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.35);
        } else {
          sessionStorage.removeItem('audioOn');
        }
        pageFadeOut(() => { window.location.href = 'info.html'; }, 420);
      } else {
        openPanel(key);
      }
    });
    el.addEventListener('mouseenter', () => {
      hoveredKey = key;
      document.body.classList.add('on-node');
      document.getElementById('focus-overlay').classList.add('active');
      updateTooltip(key, 0, 0);
      if (key === 'INFO') {
        uiChord([523.25, 659.25], .022, .08, 1.8, .08);
      } else {
        playHoverTone(key);
      }
    });
    el.addEventListener('mouseleave', () => {
      hoveredKey = null;
      document.body.classList.remove('on-node');
      document.getElementById('focus-overlay').classList.remove('active');
      document.getElementById('tip').classList.remove('on');
      document.getElementById('h-state').textContent = 'Exploring';
      lastHoveredForTone = null;
    });
    el.addEventListener('mousemove', e => {
      const tip = document.getElementById('tip');
      tip.style.left = (e.clientX + 16) + 'px';
      tip.style.top  = (e.clientY - 12) + 'px';
    });
    container.appendChild(el);
  });
}

function projectToScreen(wx, wy) {
  const vFov = camera.fov * Math.PI / 180;
  const h = 2 * Math.tan(vFov / 2) * camCur.z;
  const w = h * camera.aspect;
  const sx = ((wx - camCur.x) / w + 0.5) * innerWidth;
  const sy = (-(wy - camCur.y) / h + 0.5) * innerHeight;
  return { sx, sy };
}

const SAFE = 100;
function updateLabels() {
  const badges = document.querySelectorAll('.n-badge');
  badges.forEach(el => {
    const key = el.dataset.key, obj = objects[key];
    if (!obj) return;
    const { sx, sy } = projectToScreen(obj.ring.position.x, obj.ring.position.y);
    const safeX = Math.max(SAFE, Math.min(innerWidth - SAFE, sx));
    const safeY = Math.max(SAFE, Math.min(innerHeight - SAFE, sy));
    el.style.left = safeX + 'px';
    el.style.top  = safeY + 'px';
    el.classList.toggle('hovered',   hoveredKey === key);
    el.classList.toggle('active',    key !== 'INFO' && activeKey === key);
    el.classList.toggle('depth-bg',  !!(activeKey && activeKey !== key && !hoveredKey));
  });
}
