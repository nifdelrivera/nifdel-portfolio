import { initOverlay } from './portfolio-overlay.js'

// ══════════════════════════════════════════
//  CORE — Project Page Shell
//  Injects shared HTML (nav, side-nav, scroll hint, next-project panel)
//  and wires navigation for all case study pages.
//
//  Usage:
//    import { initShell } from '../../core/page-shell.js'
//    initShell({ backIdx: 1, title: 'Suntimer', next: PROJECT.next })
// ══════════════════════════════════════════

export function initShell({ backIdx = 0, title = '', next = null } = {}) {
  const target = document.getElementById('page-content')
  if (!target) return

  target.insertAdjacentHTML('beforebegin', `
    <!-- TOP NAV -->
    <nav id="top-nav" class="nav-on">
      <div class="tn-logo-wrap" id="tn-logo-link" style="cursor:pointer">
        <img src="../../assets/LOGO.svg" alt="Nifdel Rivera" class="tn-logo-img">
      </div>
      <div class="tn-pills">
        <div class="tn-pill">
          <span class="tp-name">Nifdel Rivera</span>
          <span class="tp-sep">·</span>
          <span class="tp-role">Creative Technologist</span>
        </div>
        <div class="tn-pill">
          <span class="tn-dot"></span>
          <span class="tp-state" id="nav-title"></span>
        </div>
        <button class="tn-pill tn-pill-btn" id="audio-btn" aria-label="Audio">
          <div class="ab-icon">
            <span></span><span></span><span></span><span></span>
          </div>
          <span id="ab-label">Enable Audio</span>
        </button>
        <button class="tn-pill tn-pill-btn" id="portfolio-btn" aria-label="Portfolio Mode">
          <div class="pb-icon">
            <span></span><span></span><span></span><span></span>
          </div>
          <span>Portfolio Mode</span>
        </button>
      </div>
    </nav>

    <!-- SIDE NAV -->
    <div id="side-nav" class="visible">
      <button class="sn-clickable" id="back-btn">
        <div class="sn-state-dot"></div>
        <span class="sn-label">Volver</span>
        <div class="sn-arrow">
          <svg class="sn-ring" viewBox="0 0 44 44" fill="none">
            <circle class="sn-ring-track"    cx="22" cy="22" r="19"/>
            <circle class="sn-ring-progress" cx="22" cy="22" r="19"/>
          </svg>
          <svg class="sn-chevron" viewBox="0 0 14 14" fill="none">
            <polyline points="9,2 5,7 9,12"
              stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="sn-sub">al trabajo</span>
      </button>
    </div>

    <!-- SCROLL HINT -->
    <div id="scroll-hint">
      <span id="scroll-hint-label">Scroll Down</span>
      <div id="scroll-hint-icon">
        <svg viewBox="0 4 24 16" fill="none">
          <polyline points="6,6 12,12 18,6"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <!-- NEXT PROJECT -->
    <a href="../" id="next-project">
      <div class="np-panel">
        <iframe id="np-iframe" allow="autoplay; fullscreen; picture-in-picture"></iframe>
        <div class="np-panel-overlay"></div>
      </div>
      <div class="np-text">
        <div class="np-label">SIGUIENTE PROYECTO</div>
        <div class="np-title-row">
          <div class="np-title" id="np-title"></div>
          <div class="np-arrow-wrap">
            <svg viewBox="0 0 24 24" fill="none">
              <line x1="5" y1="12" x2="19" y2="12"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round"/>
              <polyline points="13,6 19,12 13,18"
                stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </a>
  `)

  // ── Nav title ──────────────────────────────────────────────────────
  if (title) {
    const navTitle = document.getElementById('nav-title')
    if (navTitle) navTitle.textContent = `Work · ${title}`
  }

  // ── Portfolio overlay ───────────────────────────────────────────────
  initOverlay({ basePath: '../../' })

  // ── Logo → hub ─────────────────────────────────────────────────────
  document.getElementById('tn-logo-link')?.addEventListener('click', () => {
    window.location.href = '../../?back=1'
  })

  // ── Micro audio (UI tones para interacciones de shell) ──────────────
  let _sCtx = null
  function _sTone(freq, gain = 0.030, dur = 0.10) {
    try {
      if (!_sCtx) _sCtx = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = _sCtx, now = ctx.currentTime
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq
      g.gain.setValueAtTime(0, now)
      g.gain.linearRampToValueAtTime(gain, now + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
      o.connect(g); g.connect(ctx.destination)
      o.start(now); o.stop(now + dur + 0.05)
    } catch(e) {}
  }

  // Logo hover + click
  const _logo = document.getElementById('tn-logo-link')
  _logo?.addEventListener('mouseenter', () => _sTone(880, 0.018, 0.08))
  _logo?.addEventListener('click',      () => _sTone(660, 0.035, 0.14))

  // Nav pills hover
  document.querySelectorAll('.tn-pill').forEach(p => {
    p.addEventListener('mouseenter', () => _sTone(1046, 0.014, 0.07))
  })

  // Scroll hint click
  document.getElementById('scroll-hint')?.addEventListener('mouseenter', () => _sTone(523, 0.016, 0.09))

  // Next project hover
  document.getElementById('next-project')?.addEventListener('mouseenter', () => {
    _sTone(440, 0.022, 0.12)
    setTimeout(() => _sTone(330, 0.014, 0.18), 60)
  })

  // ── Back button ────────────────────────────────────────────────────
  document.getElementById('back-btn')?.addEventListener('mouseenter', () => _sTone(220, 0.022, 0.13))
  document.getElementById('back-btn')?.addEventListener('click', e => {
    e.preventDefault()
    sessionStorage.setItem('returnPanel',    'WORK')
    sessionStorage.setItem('returnFlag',     '1')
    sessionStorage.setItem('fromProject',    '1')
    sessionStorage.setItem('fromProjectIdx', String(backIdx))
    window.location.href = '../?r=' + Date.now()
  })

  // ── Next project ───────────────────────────────────────────────────
  if (next) {
    const iframe  = document.getElementById('np-iframe')
    const titleEl = document.getElementById('np-title')
    if (iframe)  iframe.src = `https://player.vimeo.com/video/${next.vimeo}?autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&dnt=1&background=1`
    if (titleEl) titleEl.textContent = next.title
    document.getElementById('next-project')?.addEventListener('click', e => {
      e.preventDefault()
      sessionStorage.setItem('returnPanel', 'WORK')
      sessionStorage.setItem('returnFlag',  '1')
      window.location.href = `../${next.slug}/`
    })
  }
}
