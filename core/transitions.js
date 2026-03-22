// ══════════════════════════════════════════
//  CORE — Page Transitions
//  GSAP-powered transitions between pages.
//  Used by every page in the site.
//
//  Depends on: gsap (global or imported)
//  Usage:
//    import { navigateTo, initPage } from '/core/transitions.js';
//    initPage();            // call on DOMContentLoaded
//    navigateTo('/work/');  // call on nav click
// ══════════════════════════════════════════

// ── Config ────────────────────────────────
const DURATION_OUT = 0.42;
const DURATION_IN  = 0.52;
const EASE_OUT     = 'power3.in';
const EASE_IN      = 'power3.out';

// ── Overlay element ───────────────────────
function getOverlay() {
  let el = document.getElementById('page-transition');
  if (!el) {
    el = document.createElement('div');
    el.id = 'page-transition';
    el.style.cssText = `
      position:fixed; inset:0; z-index:9000;
      background:#060608; pointer-events:none; opacity:0;
    `;
    document.body.appendChild(el);
  }
  return el;
}

// ── Navigate with transition ──────────────
export function navigateTo(url, opts = {}) {
  const overlay = getOverlay();
  const { audioFadeCallback } = opts;

  // Run audio fade if provided
  if (audioFadeCallback) audioFadeCallback();

  // Save audio state if applicable
  if (opts.preserveAudio) {
    sessionStorage.setItem('audioOn', '1');
  }

  gsap.timeline()
    .to(overlay, {
      opacity: 1,
      duration: DURATION_OUT,
      ease: EASE_OUT,
      onComplete: () => {
        window.location.href = url;
      }
    });
}

// ── Page enter (call on load) ─────────────
export function initPage(opts = {}) {
  const overlay = getOverlay();

  // Ensure overlay starts visible so entrance animates in
  gsap.set(overlay, { opacity: 1 });

  gsap.to(overlay, {
    opacity: 0,
    duration: DURATION_IN,
    ease: EASE_IN,
    delay: opts.delay ?? 0.05,
    onComplete: () => {
      overlay.style.pointerEvents = 'none';
    }
  });
}

// ── Intercept all [data-nav] links ────────
//  <a href="/work/" data-nav>Work</a>
export function initNavLinks(opts = {}) {
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const url = link.getAttribute('href') || link.dataset.href;
      if (!url) return;
      navigateTo(url, opts);
    });
  });
}

// ── Lenis smooth scroll init ──────────────
export function initLenis(opts = {}) {
  if (typeof Lenis === 'undefined') return null;

  const lenis = new Lenis({
    duration: opts.duration ?? 1.2,
    easing: opts.easing ?? (t => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
    orientation: opts.orientation ?? 'vertical',
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // GSAP ScrollTrigger integration
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  return lenis;
}

// ── GSAP text reveal ─────────────────────
//  Staggered line-by-line reveal
export function revealText(selector, opts = {}) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;

  gsap.from(els, {
    opacity: 0,
    y: opts.y ?? 24,
    duration: opts.duration ?? 0.7,
    stagger: opts.stagger ?? 0.08,
    ease: opts.ease ?? 'power3.out',
    delay: opts.delay ?? 0,
  });
}

// ── GSAP scroll-triggered reveal ─────────
export function scrollReveal(selector, opts = {}) {
  if (typeof ScrollTrigger === 'undefined') return;

  document.querySelectorAll(selector).forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: opts.y ?? 32,
      duration: opts.duration ?? 0.8,
      ease: opts.ease ?? 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: opts.start ?? 'top 85%',
        once: true,
      }
    });
  });
}
