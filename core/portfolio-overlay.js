// ══════════════════════════════════════════
//  PORTFOLIO MODE — editorial list navigation
//  Self-contained: HTML + CSS + logic + scroll indicator
// ══════════════════════════════════════════

const DOMAIN_ACCENTS = {
  WORK:        { r: 107, g: 159, b: 255 },
  THOUGHTS:    { r: 184, g: 160, b: 110 },
  EXPERIMENTS: { r: 220, g: 220, b: 215 },
  SYSTEMS:     { r: 0,   g: 200, b: 50  },
}

const DOMAINS = [
  {
    key: 'WORK', label: 'Work',
    items: [
      { title: 'Suntimer',           client: 'Corona',              year: 2022, awards: 'El Ojo · Silver',  href: 'work/suntimer/',      col: [58,102,204],  live: true,  videoSrc: 'work/suntimer/assets/Cover.webm' },
      { title: 'Rachin',             client: 'Original IP',         year: 2024, awards: null,               href: 'work/rachin/',        col: [107,159,255], live: true,  videoSrc: 'work/rachin/assets/preview.webm' },
      { title: 'Pilsener FOMO',      client: 'Pilsener · AB InBev', year: 2023, awards: null,               href: 'work/pilsener-fomo/', col: [255,191,26],  live: false, videoSrc: 'work/rachin/assets/preview.webm' },
      { title: '#SeMeAntojaGuate',   client: 'Pepsi',               year: 2022, awards: 'Behance Featured', href: 'work/semeantoja/',    col: [51,77,230],   live: false, videoSrc: 'work/rachin/assets/preview.webm' },
      { title: 'Paradox',            client: 'Personal',            year: 2023, awards: null,               href: 'work/paradox/',       col: [179,77,255],  live: false, videoSrc: 'work/rachin/assets/preview.webm' },
      { title: 'Michelob Ultra NBA', client: 'Michelob · AB InBev', year: 2023, awards: null,               href: 'work/michelob-nba/', col: [26,179,230],  live: false, videoSrc: 'work/rachin/assets/preview.webm' },
      { title: 'Imperial 3D',        client: 'Imperial · AB InBev', year: 2022, awards: null,               href: 'work/imperial-3d/',  col: [204,140,38],  live: false, videoSrc: 'work/rachin/assets/preview.webm' },
      { title: 'Pilsener 3D',        client: 'Pilsener · AB InBev', year: 2021, awards: null,               href: 'work/pilsener-3d/', col: [255,115,26],  live: false, videoSrc: 'work/rachin/assets/preview.webm' },
    ],
  },
  {
    key: 'THOUGHTS', label: 'Thoughts',
    desc: 'Essays, reflexiones y exploraciones conceptuales. Filosofía del ego, conciencia y paradoja.',
    items: [
      { title: 'La Jaula Transparente', client: 'Ensayo',   year: 2024, awards: null, href: 'thoughts/jaula-transparente/', col: [184,160,110], live: true  },
      { title: 'Hipótesis H',           client: 'Framework',year: 2024, awards: null, href: null,                           col: [160,140,95],  live: false },
      { title: 'Kyran & Lyra',          client: 'Narrativa',year: 2024, awards: null, href: null,                           col: [200,175,120], live: false },
      { title: 'Nota Existencial',      client: 'Ensayo',   year: 2023, awards: null, href: null,                           col: [170,150,100], live: false },
    ],
  },
  {
    key: 'EXPERIMENTS', label: 'Experiments',
    desc: 'Exploraciones visuales y técnicas fuera de restricciones comerciales. Curiosidad hecha visible.',
    items: [
      { title: 'AI Video Studies',      client: 'Lab',      year: 2024, awards: null, href: null, col: [220,220,215], live: false },
      { title: 'Point Cloud / LiDAR',   client: 'Lab',      year: 2024, awards: null, href: null, col: [200,200,195], live: false },
      { title: 'Sculpting Lab',         client: 'Lab',      year: 2023, awards: null, href: null, col: [215,215,210], live: false },
      { title: 'Physics & Procedural',  client: 'Lab',      year: 2023, awards: null, href: null, col: [210,210,205], live: false },
    ],
  },
  {
    key: 'SYSTEMS', label: 'Systems',
    desc: 'Frameworks y metodologías. Pipelines, modelos analíticos y la arquitectura invisible detrás de todo.',
    items: [
      { title: 'Project Synapse',       client: 'Framework', year: 2024, awards: null, href: null, col: [0,200,50],  live: false },
      { title: 'AI Prompt Architecture',client: 'Framework', year: 2024, awards: null, href: null, col: [0,180,45],  live: false },
      { title: 'Regreso al Rigor',      client: 'Sistema',   year: 2024, awards: null, href: null, col: [0,160,40],  live: false },
      { title: 'UE5 Game Design',       client: 'Sistema',   year: 2024, awards: null, href: null, col: [0,220,55],  live: false },
    ],
  },
]

// ── State ─────────────────────────────────────────────────────────────
let _basePath     = ''
let _overlay      = null
let _card         = null
let _open         = false
let _mouseX       = 0
let _mouseY       = 0
let _activeDomain = 'WORK'
let _scrollEl     = null
let _siIdleTimer  = null
let _siShowing    = false

// ── Micro-audio ────────────────────────────────────────────────────────
let _aC = null
function _tone(freq, gain = 0.028, dur = 0.10, type = 'sine') {
  try {
    if (!_aC) _aC = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = _aC, now = ctx.currentTime
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = type; o.frequency.value = freq
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(gain, now + 0.010)
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    o.connect(g); g.connect(ctx.destination)
    o.start(now); o.stop(now + dur + 0.04)
  } catch(e) {}
}
function _chord(freqs, gain = 0.020, dur = 0.18) {
  freqs.forEach(f => _tone(f, gain, dur))
}

// ══════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════

function toggleOverlay() {
  if (_open) closeOverlay()
  else openOverlay()
}

export function initOverlay({ basePath = '' } = {}) {
  _basePath = basePath
  _injectCSS()
  _injectHTML()
  _bindEvents()
  window.openPortfolioOverlay  = toggleOverlay
  window.closePortfolioOverlay = closeOverlay
}

export function openOverlay() {
  if (_open) return
  _open = true

  // open sweep: rising chord
  _tone(330, 0.022, 0.14)
  setTimeout(() => _tone(440, 0.018, 0.16), 55)
  setTimeout(() => _tone(554, 0.014, 0.20), 110)

  document.body.style.overflow = 'hidden'   // lock body — NOT html (html propagates to viewport and kills fixed scroll)
  document.getElementById('portfolio-btn')?.classList.add('active')
  document.body.classList.add('pf-open')
  _overlay.style.pointerEvents = 'all'
  _scrollEl.scrollTop = 0

  // Force WORK accent on open
  _applyAccent('WORK', true)
  _activeDomain = 'WORK'

  const g = window.gsap
  if (g) {
    g.killTweensOf(_overlay)
    g.to(_overlay, { opacity: 1, duration: 0.44, ease: 'power2.out' })
    g.fromTo('.pf-domain',
      { y: 32, opacity: 0, filter: 'blur(6px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.09, ease: 'power3.out', delay: 0.10 }
    )
    g.fromTo('#pf-meta',
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.04 }
    )
  } else {
    _overlay.style.opacity = '1'
  }

  setTimeout(_showSI, 700)

  const gn  = window._getGainNode?.()
  const ctx = window._getAudioCtx?.()
  if (ctx && window._isAudioPlaying?.() && gn)
    gn.gain.setTargetAtTime(0.18, ctx.currentTime, 1.2)
}

export function closeOverlay() {
  if (!_open) return
  _open = false

  // close: descending tones
  _tone(440, 0.020, 0.12)
  setTimeout(() => _tone(330, 0.014, 0.16), 60)

  document.body.style.overflow = ''
  document.getElementById('portfolio-btn')?.classList.remove('active')
  document.body.classList.remove('pf-open')
  _overlay.style.pointerEvents = 'none'
  _hideCard()
  _hideSI()

  const g = window.gsap
  if (g) {
    g.killTweensOf(_overlay)
    g.to(_overlay, { opacity: 0, duration: 0.32, ease: 'power2.in' })
  } else {
    _overlay.style.opacity = '0'
  }

  const gn  = window._getGainNode?.()
  const ctx = window._getAudioCtx?.()
  if (ctx && window._isAudioPlaying?.() && gn)
    gn.gain.setTargetAtTime(1, ctx.currentTime, 1.5)
}

// ══════════════════════════════════════════
//  DOMAIN ACCENT — scroll-position based
// ══════════════════════════════════════════

function _applyAccent(domainKey, instant = false) {
  const c = DOMAIN_ACCENTS[domainKey]
  if (!c) return
  _activeDomain = domainKey

  if (instant) {
    _overlay.style.setProperty('--pf-ar', c.r)
    _overlay.style.setProperty('--pf-ag', c.g)
    _overlay.style.setProperty('--pf-ab', c.b)
  } else {
    // Animate via GSAP proxy for smooth transition
    const proxy = { r: +(_overlay.style.getPropertyValue('--pf-ar') || DOMAIN_ACCENTS.WORK.r),
                    g: +(_overlay.style.getPropertyValue('--pf-ag') || DOMAIN_ACCENTS.WORK.g),
                    b: +(_overlay.style.getPropertyValue('--pf-ab') || DOMAIN_ACCENTS.WORK.b) }
    const gsap = window.gsap
    if (gsap) {
      gsap.killTweensOf(proxy)
      gsap.to(proxy, {
        r: c.r, g: c.g, b: c.b,
        duration: 0.9, ease: 'power2.inOut',
        onUpdate: () => {
          _overlay.style.setProperty('--pf-ar', Math.round(proxy.r))
          _overlay.style.setProperty('--pf-ag', Math.round(proxy.g))
          _overlay.style.setProperty('--pf-ab', Math.round(proxy.b))
        }
      })
    } else {
      _overlay.style.setProperty('--pf-ar', c.r)
      _overlay.style.setProperty('--pf-ag', c.g)
      _overlay.style.setProperty('--pf-ab', c.b)
    }
  }
}

function _checkActiveDomain() {
  const vh = _scrollEl.clientHeight
  let active = DOMAINS[0].key

  document.querySelectorAll('.pf-domain').forEach(section => {
    const rect = section.getBoundingClientRect()
    const relTop = rect.top - _scrollEl.getBoundingClientRect().top
    if (relTop < vh * 0.55) {
      active = section.dataset.domain
    }
  })

  if (active !== _activeDomain) _applyAccent(active, false)
}

// ══════════════════════════════════════════
//  CSS INJECTION
// ══════════════════════════════════════════

function _injectCSS() {
  if (document.getElementById('pf-overlay-style')) return
  const s = document.createElement('style')
  s.id = 'pf-overlay-style'
  s.textContent = `
/* ── Portfolio toggle — lives on body, above everything ─────────────── */
#portfolio-btn {
  position: fixed !important;
  right: 28px; top: 47px;
  z-index: 8100;
  pointer-events: auto !important;
  opacity: 0;
  transition: opacity .55s cubic-bezier(.16,1,.3,1) .4s, background .28s, border-color .32s, color .28s, box-shadow .38s !important;
}
/* Reveal after splash/intro dismiss */
#hud.on ~ #top-nav ~ #portfolio-btn,
#top-nav.nav-on ~ #portfolio-btn {
  opacity: 1;
}
#portfolio-btn .pb-icon {
  width: 14px; height: 14px;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 2.5px; flex-shrink: 0;
  transition: transform .38s cubic-bezier(.34,1.56,.64,1), gap .32s;
}
#portfolio-btn .pb-icon span {
  display: block; background: rgba(255,255,255,.45);
  border-radius: 1.5px;
  transition: background .25s, border-radius .32s cubic-bezier(.34,1.56,.64,1), transform .32s;
}
#portfolio-btn:hover .pb-icon span { background: rgba(255,255,255,.80); }

/* ── Toggle ON state ── */
#portfolio-btn.active {
  background: rgba(107,159,255,.14) !important;
  border-color: rgba(107,159,255,.44) !important;
  color: rgba(107,159,255,.95) !important;
  box-shadow: 0 0 26px rgba(107,159,255,.18), inset 0 0 0 1px rgba(107,159,255,.10) !important;
}
#portfolio-btn.active .pb-icon {
  transform: rotate(45deg);
  gap: 1.5px;
}
#portfolio-btn.active .pb-icon span {
  background: rgba(107,159,255,.92);
  border-radius: 50%;
}
#portfolio-btn.active:hover .pb-icon span {
  background: rgba(255,255,255,.95);
}

/* ── Overlay container ───────────────────────────────────────────────── */
#pf-overlay {
  --pf-ar: 107; --pf-ag: 159; --pf-ab: 255;
  position: fixed; inset: 0; z-index: 8000;
  opacity: 0; pointer-events: none;
  overflow-y: auto; overflow-x: hidden;
  font-family: 'Space Mono', monospace;
  scrollbar-width: none;
}
#pf-overlay::-webkit-scrollbar { display: none; }

#pf-overlay-bg {
  position: fixed; inset: 0;
  background: rgba(3, 4, 8, 0.93);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

/* ── Domain atmosphere — top glow ────────────────────────────────────── */
#pf-atmosphere {
  position: fixed; top: 0; left: 0; right: 0;
  height: 400px; pointer-events: none; z-index: 0;
}
#pf-atmosphere-inner {
  position: absolute; inset: 0;
  background: radial-gradient(
    ellipse 80% 360px at 50% -40px,
    rgba(var(--pf-ar), var(--pf-ag), var(--pf-ab), 0.10) 0%,
    transparent 100%
  );
}


/* ── Inner layout ────────────────────────────────────────────────────── */
#pf-inner {
  position: relative; z-index: 1;
  padding: 88px 140px 160px 140px;
  max-width: 1280px; margin: 0 auto;
}

/* ── Meta strip ──────────────────────────────────────────────────────── */
#pf-meta {
  margin-bottom: 72px;
  font-size: 8px; letter-spacing: .44em;
  color: rgba(255,255,255,.18);
  text-transform: uppercase;
  display: flex; align-items: center; gap: 14px;
}

/* ── Domain section ──────────────────────────────────────────────────── */
.pf-domain { margin-bottom: 80px; opacity: 0; }

.pf-domain-header {
  display: flex; align-items: baseline; gap: 24px;
  margin-bottom: 10px;
}
.pf-domain-label {
  font-family: 'Syne', sans-serif;
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 800;
  letter-spacing: -.04em; line-height: 1.0;
  white-space: nowrap; flex-shrink: 0;
  user-select: none;
  /* Color driven by current CSS vars */
  color: rgba(var(--pf-ar), var(--pf-ag), var(--pf-ab), 0.18);
}
.pf-domain-rule {
  flex: 1; height: 1px;
  background: rgba(var(--pf-ar), var(--pf-ag), var(--pf-ab), 0.18);
  align-self: center;
}

/* each domain paints its own label/rule with its own accent */
.pf-domain[data-domain="WORK"]        .pf-domain-label { color: rgba(107,159,255,.30); }
.pf-domain[data-domain="WORK"]        .pf-domain-rule  { background: rgba(107,159,255,.18); }
.pf-domain[data-domain="THOUGHTS"]    .pf-domain-label { color: rgba(184,160,110,.30); }
.pf-domain[data-domain="THOUGHTS"]    .pf-domain-rule  { background: rgba(184,160,110,.18); }
.pf-domain[data-domain="EXPERIMENTS"] .pf-domain-label { color: rgba(220,220,215,.26); }
.pf-domain[data-domain="EXPERIMENTS"] .pf-domain-rule  { background: rgba(220,220,215,.15); }
.pf-domain[data-domain="SYSTEMS"]     .pf-domain-label { color: rgba(0,200,50,.30); }
.pf-domain[data-domain="SYSTEMS"]     .pf-domain-rule  { background: rgba(0,200,50,.18); }

.pf-domain-desc {
  font-size: 9px; letter-spacing: .20em;
  color: rgba(255,255,255,.22);
  margin-bottom: 6px;
  padding-left: 2px;
}
.pf-domain-empty {
  padding: 28px 0 12px;
  font-size: 9px; letter-spacing: .28em;
  color: rgba(255,255,255,.10);
  text-transform: uppercase;
}

/* ── List items ──────────────────────────────────────────────────────── */
.pf-list { list-style: none; margin: 0; padding: 0; }
.pf-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 20px;
  border-bottom: 1px solid rgba(255,255,255,.05);
  cursor: pointer; position: relative;
  border-radius: 8px;
  transition: background .25s ease, border-color .25s ease;
}
.pf-item:first-child { border-top: 1px solid rgba(255,255,255,.05); }

/* domain-specific hover tints */
.pf-domain[data-domain="WORK"]        .pf-item:hover { background: rgba(107,159,255,.06); border-color: rgba(107,159,255,.14); }
.pf-domain[data-domain="THOUGHTS"]    .pf-item:hover { background: rgba(184,160,110,.06); border-color: rgba(184,160,110,.14); }
.pf-domain[data-domain="EXPERIMENTS"] .pf-item:hover { background: rgba(220,220,215,.05); border-color: rgba(220,220,215,.12); }
.pf-domain[data-domain="SYSTEMS"]     .pf-item:hover { background: rgba(0,200,50,.05);    border-color: rgba(0,200,50,.12); }

.pf-item-main { flex: 1; min-width: 0; padding-right: 40px; }
.pf-item-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(24px, 2.8vw, 42px); font-weight: 700;
  color: rgba(255,255,255,.86);
  letter-spacing: -.025em; line-height: 1.08;
  margin-bottom: 7px;
  transition: color .22s, transform .35s cubic-bezier(.34,1.56,.64,1);
  transform: translateX(0);
}
.pf-item:hover .pf-item-title { color: #fff; transform: translateX(5px); }
.pf-item-meta {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  transition: transform .35s cubic-bezier(.34,1.56,.64,1);
}
.pf-item:hover .pf-item-meta { transform: translateX(5px); }
.pf-item-client { font-size: 8px; letter-spacing: .30em; color: rgba(255,255,255,.28); text-transform: uppercase; }
.pf-item-year   { font-size: 8px; letter-spacing: .20em; color: rgba(255,255,255,.16); }
.pf-item-sep    { color: rgba(255,255,255,.12); font-size: 8px; }

/* awards — domain-tinted */
.pf-item-awards { font-size: 7px; letter-spacing: .26em; text-transform: uppercase; padding: 3px 9px; border-radius: 3px; }
.pf-domain[data-domain="WORK"]     .pf-item-awards { color: rgba(107,159,255,.85); background: rgba(107,159,255,.10); border: 1px solid rgba(107,159,255,.22); }
.pf-domain[data-domain="THOUGHTS"] .pf-item-awards { color: rgba(184,160,110,.85); background: rgba(184,160,110,.10); border: 1px solid rgba(184,160,110,.22); }

.pf-item-soon {
  font-size: 7px; letter-spacing: .26em; text-transform: uppercase;
  color: rgba(255,255,255,.22); padding: 3px 9px; border-radius: 3px;
  border: 1px solid rgba(255,255,255,.10);
}

.pf-item-arrow { flex-shrink: 0; color: rgba(255,255,255,.18); transition: color .22s; }
.pf-item-arrow svg { width: 20px; height: 20px; display: block; }
.pf-item:hover .pf-item-arrow { color: rgba(255,255,255,.65); }

/* ── Hover card ──────────────────────────────────────────────────────── */
#pf-card {
  position: fixed; width: 338px;
  pointer-events: none; z-index: 8200; opacity: 0;
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 48px 96px rgba(0,0,0,.70), 0 12px 32px rgba(0,0,0,.45),
              0 0 0 1px rgba(255,255,255,.07), inset 0 1px 0 rgba(255,255,255,.09);
  will-change: transform, opacity, top, left;
}
#pf-card-media { width: 100%; aspect-ratio: 4/3; position: relative; overflow: hidden; background: #080a14; border-radius: 20px 20px 0 0; }
#pf-card-video {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block; z-index: 0;
  opacity: 0; transition: opacity .4s ease;
}
#pf-card-video.visible { opacity: 1; }
#pf-card-glow  { position: absolute; inset: 0; z-index: 1; transition: background .4s ease; }
#pf-card-noise { position: absolute; inset: 0; z-index: 2; opacity: .035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: cover; }
#pf-card-info  { padding: 16px 18px 18px; background: rgba(6,8,18,.96); backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px); border-top: 1px solid rgba(255,255,255,.06); }
#pf-card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: rgba(255,255,255,.90); letter-spacing: -.01em; margin-bottom: 4px; }
#pf-card-meta  { font-size: 7px; letter-spacing: .34em; color: rgba(255,255,255,.28); text-transform: uppercase; }

/* ── Side nav when Portfolio Mode is open ────────────────────────────── */
/* Toggle bottom: 47px + 44px height + 16px gap = 107px */
body.pf-open #side-nav {
  top: 107px !important;
  transform: translateX(0) translateY(0) !important;
  height: 160px !important;
  opacity: .45 !important;
  transition: top .45s cubic-bezier(.16,1,.3,1),
              transform .45s cubic-bezier(.16,1,.3,1),
              height .45s cubic-bezier(.16,1,.3,1),
              opacity .45s ease !important;
}

/* ── Scroll indicator ────────────────────────────────────────────────── */
#pf-si {
  position: fixed; right: 16px; top: 50%; transform: translateY(-50%);
  z-index: 8150; pointer-events: none; width: 48px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 14px 0;
  background: rgba(8,10,18,.38); backdrop-filter: blur(28px) saturate(1.7); -webkit-backdrop-filter: blur(28px) saturate(1.7);
  border: 1px solid rgba(255,255,255,.09); border-radius: 99px;
  opacity: 0; transition: opacity .5s ease;
}
.pf-si-track  { position: relative; width: 2px; height: 200px; background: rgba(255,255,255,.07); border-radius: 999px; overflow: visible; }
.pf-si-fill   { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform-origin: top center; transform: scaleY(0); border-radius: 999px; background: rgba(var(--pf-ar), var(--pf-ag), var(--pf-ab), .75); }
.pf-si-thumb  { position: absolute; left: 50%; top: 0; transform: translateX(-50%); width: 5px; height: 22px; background: rgba(255,255,255,.85); border-radius: 3px; box-shadow: 0 0 7px rgba(var(--pf-ar), var(--pf-ag), var(--pf-ab), .45); }
.pf-si-pct    { font-family: 'Space Mono', monospace; font-size: 7px; letter-spacing: .06em; color: rgba(255,255,255,.20); line-height: 1; user-select: none; }
  `
  document.head.appendChild(s)
}

// ══════════════════════════════════════════
//  HTML INJECTION
// ══════════════════════════════════════════

function _buildItem(item) {
  const badge = item.awards
    ? `<span class="pf-item-awards">${item.awards}</span>`
    : (!item.live ? `<span class="pf-item-soon">Próximamente</span>` : '')

  return `
    <li class="pf-item"
        data-href="${item.href || ''}"
        data-col="${item.col.join(',')}"
        data-title="${item.title}"
        data-meta="${item.client} · ${item.year}"
        data-live="${item.live}"
        data-video="${item.videoSrc || ''}">
      <div class="pf-item-main">
        <div class="pf-item-title">${item.title}</div>
        <div class="pf-item-meta">
          <span class="pf-item-client">${item.client}</span>
          <span class="pf-item-sep">·</span>
          <span class="pf-item-year">${item.year}</span>
          ${badge}
        </div>
      </div>
      <div class="pf-item-arrow">
        <svg viewBox="0 0 24 24" fill="none">
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          <polyline points="13,6 19,12 13,18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </li>`
}

function _buildDomain(d) {
  const list = d.items.length === 0
    ? `<div class="pf-domain-empty">Coming soon</div>`
    : `<ul class="pf-list">${d.items.map(_buildItem).join('')}</ul>`

  return `
    <section class="pf-domain" data-domain="${d.key}">
      <div class="pf-domain-header">
        <span class="pf-domain-label">${d.label}</span>
        <div class="pf-domain-rule"></div>
      </div>
      ${d.desc ? `<p class="pf-domain-desc">${d.desc}</p>` : ''}
      ${list}
    </section>`
}

function _injectHTML() {
  if (document.getElementById('pf-overlay')) return

  const div = document.createElement('div')
  div.id = 'pf-overlay'
  div.innerHTML = `
    <div id="pf-overlay-bg"></div>
    <div id="pf-atmosphere"><div id="pf-atmosphere-inner"></div></div>

    <div id="pf-inner">
      <div id="pf-meta">
        <span>Nifdel Rivera</span><span>·</span><span>Portfolio Mode</span>
      </div>
      <div id="pf-domains">${DOMAINS.map(_buildDomain).join('')}</div>
    </div>

    <div id="pf-card">
      <div id="pf-card-media">
        <video id="pf-card-video" muted loop playsinline preload="none"></video>
        <div id="pf-card-glow"></div>
        <div id="pf-card-noise"></div>
      </div>
      <div id="pf-card-info">
        <div id="pf-card-title"></div>
        <div id="pf-card-meta"></div>
      </div>
    </div>

    <div id="pf-si">
      <div class="pf-si-track">
        <div class="pf-si-fill"></div>
        <div class="pf-si-thumb"></div>
      </div>
      <div class="pf-si-pct">0%</div>
    </div>
  `
  document.body.appendChild(div)
  _overlay  = div
  _card     = document.getElementById('pf-card')
  _scrollEl = div
}

// ══════════════════════════════════════════
//  CARD
// ══════════════════════════════════════════

function _showCard(item) {
  const col  = item.dataset.col.split(',').map(Number)
  const [r, g, b] = col

  document.getElementById('pf-card-glow').style.background =
    `linear-gradient(145deg, rgba(${r},${g},${b},.35) 0%, rgba(3,4,8,.88) 100%)`
  document.getElementById('pf-card-title').textContent = item.dataset.title
  document.getElementById('pf-card-meta').textContent  = item.dataset.meta

  // ── Video ──────────────────────────────────────────────────────────
  const video   = document.getElementById('pf-card-video')
  const vidSrc  = item.dataset.video
  if (video && vidSrc) {
    const fullSrc = _basePath + vidSrc
    if (video.getAttribute('src') !== fullSrc) {
      video.src = fullSrc
      video.load()
    }
    video.play().catch(() => {})
    video.classList.add('visible')
    document.getElementById('pf-card-glow').style.opacity = '0.45'
  } else if (video) {
    video.classList.remove('visible')
    document.getElementById('pf-card-glow').style.opacity = '1'
  }

  // Position anchored to the arrow element of this row
  const arrowEl   = item.querySelector('.pf-item-arrow')
  const arrowRect = (arrowEl || item).getBoundingClientRect()
  _positionCard(arrowRect)

  const gsap = window.gsap
  if (gsap) {
    gsap.killTweensOf(_card)
    gsap.fromTo(_card,
      { opacity: 0, x: 16, rotateY: -8, rotateX: 2, scale: 0.88 },
      { opacity: 1, x: 0,  rotateY: -3.5, rotateX: 0.5, scale: 1,
        duration: 0.55, ease: 'elastic.out(1, 0.65)' }
    )
  } else {
    _card.style.opacity = '1'
  }
}

function _positionCard(arrowRect) {
  const cardH  = _card.offsetHeight || 364
  const cardW  = _card.offsetWidth  || 338
  const CARD_W = cardW

  // Horizontally: card left edge = arrow right edge + small gap
  // If it would overflow right edge, flip to left of arrow
  let left = arrowRect.right + 10
  if (left + CARD_W > window.innerWidth - 8) left = arrowRect.left - CARD_W - 10

  // Vertically: vertically center on the row
  const rowMid = arrowRect.top + arrowRect.height / 2
  const maxTop = window.innerHeight - cardH - 16
  const top    = Math.max(16, Math.min(rowMid - cardH / 2, maxTop))

  _card.style.left = left + 'px'
  _card.style.top  = top  + 'px'
}

function _hideCard() {
  const video = document.getElementById('pf-card-video')
  if (video) {
    video.pause()
    video.classList.remove('visible')
  }

  const gsap = window.gsap
  if (gsap) {
    gsap.killTweensOf(_card)
    gsap.to(_card, { opacity: 0, x: 10, scale: 0.95, duration: 0.22, ease: 'power2.in' })
  } else {
    _card.style.opacity = '0'
  }
}

function _updateCardParallax() {
  if (!_open) return
  const g = window.gsap
  if (!g) return
  const cx = window.innerWidth / 2
  const cy = window.innerHeight / 2
  const dx = (_mouseX - cx) / cx
  const dy = (_mouseY - cy) / cy
  g.to(_card, {
    rotateY: -3.5 + dx * 2,
    rotateX: 0.5 - dy * 1.5,
    duration: 0.4, ease: 'power2.out', overwrite: 'auto'
  })
}

// ══════════════════════════════════════════
//  SCROLL INDICATOR
// ══════════════════════════════════════════

function _showSI() {
  const si = document.getElementById('pf-si')
  if (!si) return
  _siShowing = true
  si.style.opacity = '0.85'
}

function _hideSI() {
  const si = document.getElementById('pf-si')
  if (!si) return
  _siShowing = false
  si.style.opacity = '0'
}

function _updateSI() {
  const el    = _scrollEl
  const total = el.scrollHeight - el.clientHeight
  if (total <= 0) return

  const progress = el.scrollTop / total
  const fill  = document.querySelector('.pf-si-fill')
  const thumb = document.querySelector('.pf-si-thumb')
  const pct   = document.querySelector('.pf-si-pct')

  const TRACK_H = 200, THUMB_H = 22
  if (fill)  fill.style.transform = `scaleY(${progress})`
  if (thumb) thumb.style.top      = `${progress * (TRACK_H - THUMB_H)}px`
  if (pct)   pct.textContent      = Math.round(progress * 100) + '%'

  // Pulse on activity
  const si = document.getElementById('pf-si')
  if (si && _siShowing) {
    si.style.opacity = '0.85'
    clearTimeout(_siIdleTimer)
    _siIdleTimer = setTimeout(() => {
      if (_siShowing) si.style.opacity = '0.25'
    }, 1800)
  }
}

// ══════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════

function _navigate(href) {
  const full = _basePath + href
  const fade = document.createElement('div')
  fade.style.cssText = 'position:fixed;inset:0;z-index:9500;background:#020408;pointer-events:none;opacity:0;transition:opacity .32s ease'
  document.body.appendChild(fade)
  requestAnimationFrame(() => {
    fade.style.opacity = '1'
    setTimeout(() => { window.location.href = full }, 340)
  })
}

// ══════════════════════════════════════════
//  EVENTS
// ══════════════════════════════════════════

function _bindEvents() {
  document.getElementById('pf-overlay-bg').addEventListener('click', closeOverlay)

  // Move toggle button to body to escape #top-nav stacking context (z-index:95)
  const btn = document.getElementById('portfolio-btn')
  if (btn) {
    document.body.appendChild(btn)
    btn.addEventListener('click', () => {
      _tone(698, 0.014, 0.08)
      toggleOverlay()
    })
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _open) closeOverlay()
  })

  document.addEventListener('mousemove', e => {
    _mouseX = e.clientX
    _mouseY = e.clientY
    if (_card && parseFloat(_card.style.opacity) > 0.1) {
      _updateCardParallax()
    }
  })

  // Scroll — domain detection + indicator
  _scrollEl.addEventListener('scroll', () => {
    _checkActiveDomain()
    _updateSI()
  }, { passive: true })

  // Items
  document.querySelectorAll('.pf-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      // hover tone: domain-tinted pitch
      const domain = item.closest('.pf-domain')?.dataset.domain
      const pitchMap = { WORK: 1046, THOUGHTS: 880, EXPERIMENTS: 1174, SYSTEMS: 932 }
      _tone(pitchMap[domain] || 1046, 0.016, 0.09)

      _showCard(item)
      const arrow = item.querySelector('.pf-item-arrow')
      if (arrow && window.gsap)
        window.gsap.fromTo(arrow, { x: 0 }, { x: 7, duration: 0.5, ease: 'elastic.out(1, 0.50)' })
    })

    item.addEventListener('mouseleave', () => {
      _hideCard()
      const arrow = item.querySelector('.pf-item-arrow')
      if (arrow && window.gsap)
        window.gsap.to(arrow, { x: 0, duration: 0.25, ease: 'power2.out' })
    })

    item.addEventListener('click', () => {
      const href = item.dataset.href
      if (!href) {
        // coming soon — muted thud
        _tone(110, 0.025, 0.14, 'triangle')
        return
      }
      // navigate confirm: crisp double-tap
      _tone(660, 0.030, 0.10)
      setTimeout(() => _tone(880, 0.022, 0.12), 55)
      closeOverlay()
      _navigate(href)
    })
  })
}
