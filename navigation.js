// ══════════════════════════════════════════
//  NAVIGATION.JS — Panels · Side Nav · Tooltip
//  Conecta el sistema 3D (main.js) con la UI (ui.js)
//  Expone funciones en window para HTML onclick
// ══════════════════════════════════════════
import { NODES }        from './data/nodes.js';
import { panelContent } from './data/content.js';

// ══════════════════════════════════════════
//  MOUSE — para tooltip position
// ══════════════════════════════════════════
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  const tip = document.getElementById('tip');
  if (tip && tip.classList.contains('on')) {
    tip.style.left = (mouseX + 18) + 'px';
    tip.style.top  = (mouseY - 16) + 'px';
  }
});

// ══════════════════════════════════════════
//  TOOLTIP
// ══════════════════════════════════════════
function updateTooltip(key) {
  const tip = document.getElementById('tip');
  if (!tip) return;

  if (!key) {
    tip.classList.remove('on');
    const hState = document.getElementById('h-state');
    if (hState) hState.textContent = 'Exploring';
    return;
  }

  const d = NODES[key];
  if (!d) return;

  if (key === 'INFO') {
    document.getElementById('tl').textContent = 'About';
    document.getElementById('tn').textContent = 'Nifdel Rivera';
    document.getElementById('ts').textContent = 'Creative Technologist';
  } else {
    document.getElementById('tl').textContent = 'Domain';
    document.getElementById('tn').textContent = key;
    document.getElementById('ts').innerHTML   = `${d.body} · Click to enter`;
  }

  tip.classList.add('on');
  tip.style.left = (mouseX + 18) + 'px';
  tip.style.top  = (mouseY - 16) + 'px';

  const hState = document.getElementById('h-state');
  if (hState) hState.textContent = key;
}

// ══════════════════════════════════════════
//  FOCUS SPOTLIGHT — radial-gradient dinámico
// ══════════════════════════════════════════
window.updateFocusSpot = function(sx, sy) {
  const fo = document.getElementById('focus-overlay');
  if (!fo || !fo.classList.contains('active')) return;
  const px = ((sx / window.innerWidth)  * 100).toFixed(2);
  const py = ((sy / window.innerHeight) * 100).toFixed(2);
  fo.style.background =
    `radial-gradient(circle at ${px}% ${py}%, transparent 8%, rgba(3,3,5,0.44) 38%)`;
};

// Vignette del depth-blur centrado en el nodo activo del carousel
window.updateDepthBlurSpot = function(sx, sy) {
  const db = document.getElementById('depth-blur');
  if (!db || !db.classList.contains('on')) return;
  const px = ((sx / window.innerWidth)  * 100).toFixed(2);
  const py = ((sy / window.innerHeight) * 100).toFixed(2);
  db.style.background =
    `radial-gradient(ellipse 38% 55% at ${px}% ${py}%, transparent 0%, rgba(2,2,4,0.28) 60%, rgba(2,2,4,0.52) 100%)`;
};

// ══════════════════════════════════════════
//  HOOK — nodo hovered
// ══════════════════════════════════════════
let _prevHoveredKey = null;

window.onNodeHovered = function(key) {
  if (!window.entered) return;

  const changed = _prevHoveredKey !== key;
  _prevHoveredKey   = key;
  window.hoveredKey = key;

  if (changed) {
    updateTooltip(key);
    const fo = document.getElementById('focus-overlay');
    if (fo) {
      if (!key) fo.style.background = '';
      fo.classList.toggle('active', !!key);
    }
    document.body.classList.toggle('on-node', !!key);

    if (key) {
      if (key === 'INFO') {
        window.uiChord && window.uiChord([523.25, 659.25], .022, .08, 1.8, .08);
      } else {
        window.playHoverTone && window.playHoverTone(key);
      }
    }
  }
};

// ══════════════════════════════════════════
//  HOOK — nodo entrado
// ══════════════════════════════════════════
window.onNodeEntered = function(key) {
  openPanel(key);
};

// ══════════════════════════════════════════
//  INIT LABELS — llamado desde ui.js enter()
// ══════════════════════════════════════════
function initLabels() {
  updateSideNav('hidden');
  const hBr = document.getElementById('h-br');
  if (hBr) hBr.style.opacity = '1';
}

// ══════════════════════════════════════════
//  SIDE NAV
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
    label.textContent = 'Nifdel';
    if (sub) sub.textContent = 'Rivera';
    nav.style.removeProperty('--sn-color');
  } else if (state === 'panel') {
    nav.classList.add('state-panel');
    label.textContent = 'Cerrar';
    if (sub) sub.textContent = 'panel';
    if (window.activeKey) {
      const c = NODES[window.activeKey]?.col;
      if (Array.isArray(c))
        nav.style.setProperty('--sn-color', `rgba(${c[0]},${c[1]},${c[2]},.75)`);
    }
  } else if (state === 'pm') {
    nav.classList.add('state-pm');
    label.textContent = 'Volver';
    if (sub) sub.textContent = 'al mapa';
    nav.style.removeProperty('--sn-color');
  }
}

function sideNavAction() {
  const pmOpen = document.getElementById('portfolio-mode').classList.contains('open');
  if (pmOpen) {
    closePortfolioMode();
  } else if (window.activeKey) {
    closePanel();
  }
}

// ══════════════════════════════════════════
//  OPEN PANEL
// ══════════════════════════════════════════
function openPanel(key) {
  const d = NODES[key];
  if (!d) return;

  window.activeKey = key;

  const panel = document.getElementById('panel');
  panel.className = `open ${d.theme}`;
  document.getElementById('p-eye').textContent   = d.eye;
  document.getElementById('p-title').textContent = d.title;
  document.getElementById('p-desc').textContent  = d.desc;

  // ── Microinteracciones: contenido entra escalonado tras el slide del panel ──
  gsap.killTweensOf(['#p-eye,#p-title,#p-desc,.p-rule,#p-body']);
  gsap.timeline({ defaults:{ ease:'power3.out' } })
    .fromTo('.p-b1-header', { opacity:0, x:10 }, { opacity:1, x:0, duration:.35 }, 0.12)
    .fromTo('#p-title',     { opacity:0, y:12 }, { opacity:1, y:0, duration:.45 }, 0.20)
    .fromTo('#p-desc',      { opacity:0, y:8  }, { opacity:1, y:0, duration:.40 }, 0.30)
    .fromTo('.p-rule',      { scaleX:0, transformOrigin:'left center' },
                            { scaleX:1, duration:.5 }, 0.36)
    .fromTo('#p-body',      { opacity:0, y:14 }, { opacity:1, y:0, duration:.50 }, 0.40);

  const pBody = document.getElementById('p-body');
  if (d.body && panelContent[d.body]) {
    pBody.innerHTML = panelContent[d.body];
  } else {
    pBody.innerHTML = '';
  }

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

  updateSideNav('panel');
  window.setAudioMood        && window.setAudioMood(key);
  window.playActivationSound && window.playActivationSound(key);

  document.getElementById('node-aura').classList.add('on');
  document.getElementById('depth-blur').classList.add('on');

  const hBr = document.getElementById('h-br');
  if (hBr) hBr.style.opacity = '0';
}

// ══════════════════════════════════════════
//  CLOSE PANEL
// ══════════════════════════════════════════
function closePanel() {
  const panel = document.getElementById('panel');
  window.activeKey = null;

  // ── Side effects inmediatos (no visuales) ──
  updateSideNav('hidden');
  window.setAudioMood && window.setAudioMood(null);
  document.getElementById('node-aura').classList.remove('on');
  const _db = document.getElementById('depth-blur');
  _db.classList.remove('on');
  _db.style.background = '';
  const hBr = document.getElementById('h-br');
  if (hBr) hBr.style.opacity = '1';
  if (typeof window.returnToOrbit === 'function') window.returnToOrbit();

  // ── Microinteracciones: contenido sale → luego el panel desliza ──
  gsap.timeline()
    .to(['#p-body', '#p-desc'],      { opacity:0, y:-8, duration:.18, ease:'power2.in', stagger:.04 }, 0)
    .to(['.p-rule'],                  { scaleX:0, transformOrigin:'left center', duration:.2, ease:'power2.in' }, 0.04)
    .to(['#p-title', '.p-b1-header'], { opacity:0, y:-6, duration:.22, ease:'power2.in', stagger:.03 }, 0.06)
    .call(() => {
      panel.classList.remove('open');
      // Reset props para la próxima apertura
      gsap.set(['#p-body','#p-desc','.p-rule','#p-title','.p-b1-header'], { clearProps:'all' });
    }, null, 0.18);
}

// ══════════════════════════════════════════
//  PORTFOLIO MODE
// ══════════════════════════════════════════
function openPortfolioMode() {
  document.getElementById('portfolio-mode').classList.add('open');
  updateSideNav('pm');
  const ctx = window._getAudioCtx && window._getAudioCtx();
  const gn  = window._getGainNode  && window._getGainNode();
  if (ctx && window._isAudioPlaying && window._isAudioPlaying() && gn)
    gn.gain.setTargetAtTime(0.2, ctx.currentTime, 1.5);
}

function closePortfolioMode() {
  document.getElementById('portfolio-mode').classList.remove('open');
  updateSideNav(window.activeKey ? 'panel' : 'hidden');
  const ctx = window._getAudioCtx && window._getAudioCtx();
  const gn  = window._getGainNode  && window._getGainNode();
  if (ctx && window._isAudioPlaying && window._isAudioPlaying() && gn)
    gn.gain.setTargetAtTime(1, ctx.currentTime, 1.5);
}

// ══════════════════════════════════════════
//  NAVIGATE TO PORTFOLIO
// ══════════════════════════════════════════
function navigateToPortfolio() {
  // Guardar nodo activo para restaurar al volver (browser back o botón back)
  sessionStorage.setItem('returnPanel', 'WORK');
  sessionStorage.setItem('returnFlag',  '1');

  const ctx = window._getAudioCtx && window._getAudioCtx();
  const gn  = window._getGainNode  && window._getGainNode();
  if (window._isAudioPlaying && window._isAudioPlaying() && ctx && gn) {
    sessionStorage.setItem('audioOn', '1');
    gn.gain.setTargetAtTime(0, ctx.currentTime, 0.35);
  } else {
    sessionStorage.removeItem('audioOn');
  }

  // Zoom cinematic — mismo feeling que click en card dentro de Work
  if (window._zoomBlur) {
    const zb   = window._zoomBlur;
    const start = performance.now();
    const dur   = 480;
    const tick  = (now) => {
      const p = Math.min((now - start) / dur, 1);
      // ease-in cubic: empieza suave, termina con fuerza
      const e = p * p * p;
      zb.uniforms.uStrength.value = e * 0.90;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  window.pageFadeOut(() => { window.location.href = 'work/'; }, 480);
}

// ══════════════════════════════════════════
//  RETORNO DESDE SUBPÁGINA (?back=1)
// ══════════════════════════════════════════
// Restaurar panel al volver desde subpágina (browser back o botón back)
// Usa sessionStorage flag — no depende de ?back=1 en la URL
if (sessionStorage.getItem('returnFlag')) {
  const returnKey = sessionStorage.getItem('returnPanel');
  sessionStorage.removeItem('returnFlag');
  sessionStorage.removeItem('returnPanel');
  if (returnKey && NODES[returnKey]) {
    const _checkEntered = setInterval(() => {
      if (window.entered && typeof window.restoreNodeByKey === 'function') {
        clearInterval(_checkEntered);
        window.restoreNodeByKey(returnKey);
      }
    }, 100);
    setTimeout(() => clearInterval(_checkEntered), 5000);
  }
}

// ══════════════════════════════════════════
//  CAROUSEL PANEL UPDATE
// ══════════════════════════════════════════
function updateCarouselPanel(key) {
  const d = NODES[key];
  if (!d) return;

  window.activeKey = key;

  const panel = document.getElementById('panel');
  if (!panel.classList.contains('open')) panel.classList.add('open');
  panel.className = `open ${d.theme}`;

  document.getElementById('p-eye').textContent   = d.eye;
  document.getElementById('p-title').textContent = d.title;
  document.getElementById('p-desc').textContent  = d.desc;

  const pBody = document.getElementById('p-body');
  if (d.body && panelContent[d.body]) {
    pBody.innerHTML = panelContent[d.body];
  } else {
    pBody.innerHTML = '';
  }

  updateSideNav('panel');
  window.setAudioMood && window.setAudioMood(key);
}

// ══════════════════════════════════════════
//  EXPOSE GLOBALS
// ══════════════════════════════════════════
window.initLabels           = initLabels;
window.openPanel            = openPanel;
window.closePanel           = closePanel;
window.updateSideNav        = updateSideNav;
window.sideNavAction        = sideNavAction;
window.openPortfolioMode    = openPortfolioMode;
window.closePortfolioMode   = closePortfolioMode;
window.navigateToPortfolio  = navigateToPortfolio;
window.updateCarouselPanel  = updateCarouselPanel;
