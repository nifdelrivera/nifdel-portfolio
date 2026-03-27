/* ══════════════════════════════════════════════════════════════════
   SCROLL INDICATOR  —  core/scroll-indicator.js
   Custom scroll indicator with velocity feedback + section marks.

   Usage:
     import { initScrollIndicator } from '../../core/scroll-indicator.js'
     initScrollIndicator(lenis)   // pass the Lenis instance

   Dependencies: Lenis (passed in), GSAP (window.gsap)
   Compatible with: all work/* project pages
══════════════════════════════════════════════════════════════════ */

/* ── CSS ────────────────────────────────────────────────────────── */
const CSS = `
  /* Hide native scrollbar */
  html { scrollbar-width: none; }
  ::-webkit-scrollbar { display: none; }

  /* ── Root — glass pill matching nav UI kit ── */
  #si {
    position: fixed;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 200;
    pointer-events: none;
    opacity: 0;

    width: 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 18px 0;

    background: rgba(8, 10, 18, 0.38);
    backdrop-filter: blur(28px) saturate(1.7);
    -webkit-backdrop-filter: blur(28px) saturate(1.7);
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 99px;
  }

  /* ── Track wrapper — contains fill, marks, thumb ── */
  .si-track {
    position: relative;
    width: 2px;
    height: 280px;
    background: rgba(255,255,255,0.08);
    border-radius: 999px;
    overflow: visible;
  }

  /* ── Fill — accent color grows from top ── */
  .si-fill {
    position: absolute;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    transform-origin: top center;
    transform: scaleY(0);
    background: linear-gradient(
      to bottom,
      rgba(58,102,204,0.90) 0%,
      rgba(58,102,204,0.35) 100%
    );
    border-radius: 999px;
    will-change: transform;
  }

  /* ── Thumb — bright pill riding the fill ── */
  .si-thumb {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 6px;
    height: 28px;
    background: rgba(255,255,255,0.88);
    border-radius: 4px;
    transform-origin: top center;
    will-change: transform, opacity;
    box-shadow: 0 0 8px rgba(58,102,204,0.5);
  }

  /* ── Section marks — dots ── */
  .si-mark {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    background: rgba(255,255,255,0.20);
    border-radius: 50%;
    transition: background 0.35s ease, transform 0.25s ease;
    z-index: 1;
  }
  .si-mark.si-active {
    background: rgba(255,255,255,0.70);
    transform: translate(-50%, -50%) scale(1.4);
  }

  /* ── Percentage label ── */
  .si-pct {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.06em;
    color: rgba(255,255,255,0.22);
    line-height: 1;
    transition: color 0.3s ease;
    user-select: none;
  }
  .si-pct.si-active {
    color: rgba(255,255,255,0.45);
  }
`

/* ── INIT ───────────────────────────────────────────────────────── */
export function initScrollIndicator(lenis) {
  const gsap = window.gsap
  if (!gsap || !lenis) return

  /* Inject CSS */
  const style = document.createElement('style')
  style.textContent = CSS
  document.head.appendChild(style)

  /* Build DOM */
  const root = document.createElement('div')
  root.id    = 'si'
  root.innerHTML = `
    <div class="si-track">
      <div class="si-fill"></div>
      <div class="si-thumb"></div>
    </div>
    <div class="si-pct">0%</div>
  `
  document.body.appendChild(root)

  const track = root.querySelector('.si-track')
  const fill  = root.querySelector('.si-fill')
  const thumb = root.querySelector('.si-thumb')
  const pct   = root.querySelector('.si-pct')

  const TRACK_H = 280   // matches .si-track height in CSS
  const THUMB_H = 28    // matches .si-thumb height in CSS
  const MAX_Y   = TRACK_H - THUMB_H

  /* ── SECTION MARKS ─────────────────────────────────────────────
     Scans meaningful narrative sections after render() has run.
  ─────────────────────────────────────────────────────────────── */
  let sectionData = []  // { top: number, mark: Element }

  function buildMarks() {
    const totalH = document.body.scrollHeight - window.innerHeight
    if (totalH <= 0) return

    const selectors = [
      '.block-case-overview',
      '.editorial-pin-wrap',
      '.block-mp4',
      '.block-stack',
      '.block-awards',
      '.block-credits',
      '.block-closing',
      '#np-wrapper',
    ]

    const els = []
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => els.push(el))
    })

    /* Sort top → bottom */
    els.sort((a, b) => a.compareDocumentPosition(b) & 4 ? -1 : 1)

    /* Deduplicate — skip marks within 3% of each other */
    const used = []
    els.forEach(el => {
      const pos = el.offsetTop / totalH
      if (pos <= 0.01 || pos >= 0.99) return
      if (used.some(p => Math.abs(p - pos) < 0.03)) return
      used.push(pos)

      const mark = document.createElement('div')
      mark.className  = 'si-mark'
      mark.style.top  = `${pos * TRACK_H}px`
      track.appendChild(mark)

      sectionData.push({ top: el.offsetTop, mark })
    })
  }

  requestAnimationFrame(() => requestAnimationFrame(buildMarks))

  /* ── IDLE SYSTEM ────────────────────────────────────────────────
     After 1.8s without scroll → fade to dim.
     On scroll → return to full opacity.
  ─────────────────────────────────────────────────────────────── */
  let idleTimer = null
  let isVisible = false

  function onActive() {
    if (!isVisible) {
      gsap.to(root, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      isVisible = true
    }
    pct.classList.add('si-active')
    clearTimeout(idleTimer)
    idleTimer = setTimeout(onIdle, 1800)
  }

  function onIdle() {
    gsap.to(root, { opacity: 0.20, duration: 1.0, ease: 'power2.out' })
    pct.classList.remove('si-active')
    isVisible = false
  }

  gsap.set(root, { opacity: 0 })

  /* ── SCROLL HANDLER ─────────────────────────────────────────────
     velocity from Lenis ≈ px/frame. Normalize over 380 range.
  ─────────────────────────────────────────────────────────────── */
  let snapTimer = null

  lenis.on('scroll', ({ progress, velocity, direction }) => {
    onActive()

    const absVel        = Math.abs(velocity || 0)
    const normalizedVel = Math.min(1, absVel / 380)
    const stretch       = 1 + normalizedVel * 1.85
    const thumbOpacity  = gsap.utils.clamp(0.60, 1.0, 0.60 + normalizedVel * 0.40)
    const origin        = (direction || 1) > 0 ? 'top center' : 'bottom center'
    const thumbY        = progress * MAX_Y

    /* Thumb — move + velocity stretch */
    gsap.to(thumb, {
      y:               thumbY,
      scaleY:          stretch,
      opacity:         thumbOpacity,
      transformOrigin: origin,
      duration:        0.12,
      ease:            'none',
      overwrite:       'auto',
    })

    /* Fill — accent gradient grows with progress */
    gsap.to(fill, {
      scaleY:   progress,
      duration: 0.18,
      ease:     'none',
      overwrite: 'auto',
    })

    /* Percentage label */
    pct.textContent = Math.round(progress * 100) + '%'

    /* Elastic snap back on scroll settle */
    clearTimeout(snapTimer)
    snapTimer = setTimeout(() => {
      gsap.to(thumb, {
        scaleY:   1,
        opacity:  0.88,
        duration: 0.9,
        ease:     'elastic.out(1, 0.42)',
        overwrite: 'auto',
      })
    }, 90)

    /* ── Active section mark ── */
    if (sectionData.length) {
      const scrollY   = progress * (document.body.scrollHeight - window.innerHeight)
      let   activeIdx = -1

      sectionData.forEach((s, i) => {
        if (scrollY >= s.top - 60) activeIdx = i
      })

      sectionData.forEach((s, i) => {
        s.mark.classList.toggle('si-active', i === activeIdx)
      })
    }
  })
}
