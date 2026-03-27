// ══════════════════════════════════════════
//  UI.JS — Splash · Enter flow · Page transitions
//  El audio vive en audio.js (importado abajo)
// ══════════════════════════════════════════
import {
  toggleAudio, startAudioFromSilence, fadeInAudio, fadeOutAudio,
  getGainNode, getAudioCtx, isAudioPlaying,
  uiChord, uiSound, playIntroSound
} from './audio.js';
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.13/+esm';

// ── SHARED STATE (accesible desde navigation.js y main.js) ──
window.entered    = false;
window.activeKey  = null;
window.hoveredKey = null;

// ── MOTION CONSTANTS — same language as work pages ──
const M = {
  ease:     { default: 'power3.out', soft: 'power2.out', cinematic: 'power4.inOut' },
  duration: { fast: 0.5, default: 0.8, slow: 1.2 }
}

// ── SPLASH GSAP TIMELINE ──
;(function initSplashTimeline() {
  const tl = gsap.timeline()
  tl
    .to('#splash-bg',     { opacity: 1,  duration: 2.8, ease: M.ease.soft }, 0.2)
    .to('.splash-time',   { opacity: 1,  duration: 0.8, ease: M.ease.soft }, 0.4)
    .to('.splash-phrase', { opacity: 1,  y: 0, duration: 1.0, ease: M.ease.default }, 1.0)
    .to('.splash-line2',  { opacity: 1,  y: 0, duration: 0.9, ease: M.ease.default }, 1.7)
    .to('.splash-dash',   { opacity: 1,  duration: 0.6, ease: M.ease.soft }, 2.4)
    .to('.splash-hint',   { opacity: 1,  duration: 0.8, ease: M.ease.soft }, 2.8)

  // Pulse suave en la frase principal
  gsap.to('.splash-phrase', {
    opacity: 0.78, duration: 2.8, ease: 'sine.inOut',
    yoyo: true, repeat: -1, delay: 2.4
  })
  // Blink hint
  gsap.to('.splash-hint', {
    opacity: 0.52, duration: 1.4, ease: 'sine.inOut',
    yoyo: true, repeat: -1, delay: 3.8
  })
})()

// ── INTRO REVEAL — GSAP timeline ──
function revealIntro() {
  const tl = gsap.timeline()
  tl
    .fromTo('.i-line1',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: M.duration.default, ease: M.ease.default }, 0.3)
    .fromTo('.i-phrase',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: M.duration.slow,    ease: M.ease.default }, 0.6)
    .fromTo('.i-dash',
      { opacity: 0 },
      { opacity: 1,        duration: M.duration.fast,   ease: M.ease.soft }, 1.5)
    .fromTo('.i-sub',
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: M.duration.default, ease: M.ease.default }, 1.7)
    .fromTo('.i-disclaimer',
      { opacity: 0 },
      { opacity: 1,        duration: M.duration.default, ease: M.ease.soft }, 2.0)
    .fromTo('.i-enter',
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: M.duration.default, ease: M.ease.default }, 2.3)
}

// ── SPLASH CLOCK — live date/time ──
;(function initSplashClock() {
  const el = document.getElementById('splash-time')
  if (!el) return
  function tick() {
    const n   = new Date()
    const dd  = String(n.getDate()).padStart(2,'0')
    const mm  = String(n.getMonth()+1).padStart(2,'0')
    const yy  = String(n.getFullYear()).slice(2)
    const hh  = String(n.getHours()).padStart(2,'0')
    const min = String(n.getMinutes()).padStart(2,'0')
    el.textContent = `${dd}.${mm}.${yy} — ${hh}:${min}`
  }
  tick()
  setInterval(tick, 30000)
})()

// ══════════════════════════════════════════
//  PAGE TRANSITIONS
// ══════════════════════════════════════════
function pageFadeOut(cb, duration = 420) {
  const el = document.getElementById('page-fade');
  el.style.pointerEvents = 'auto'; el.style.opacity = '1';
  setTimeout(cb, duration);
}

function pageFadeIn() {
  const el = document.getElementById('page-fade');
  el.style.opacity = '0';
  setTimeout(() => { el.style.pointerEvents = 'none'; }, 450);
}

function navigateOut(e, url) {
  e.preventDefault();
  if (window.activeKey) {
    sessionStorage.setItem('returnPanel', window.activeKey);
    sessionStorage.setItem('returnFlag',  '1');
  }
  if (isAudioPlaying() && getGainNode()) {
    sessionStorage.setItem('audioOn', '1');
    fadeOutAudio(0.3);
  } else {
    sessionStorage.removeItem('audioOn');
  }
  pageFadeOut(() => { window.location.href = url; }, 380);
  return false;
}

// ══════════════════════════════════════════
//  SPLASH → INTRO
// ══════════════════════════════════════════
let splashDone = false;

function activateSplash() {
  if (splashDone) return;
  splashDone = true;
  const splash = document.getElementById('splash');
  const intro  = document.getElementById('intro');

  startAudioFromSilence(0.18, 3.0);

  setTimeout(() => {
    const btn = document.getElementById('audio-btn'), lbl = document.getElementById('ab-label');
    if (btn) btn.classList.add('playing');
    if (lbl) lbl.textContent = 'Audio On';
  }, 800);

  uiChord([110,164.8,220,330], .07, .04, 3.2, .12);

  pageFadeOut(() => {
    splash.classList.add('hidden');
    intro.classList.add('visible');
    pageFadeIn();
    revealIntro();
    setTimeout(() => playIntroSound(), 150);
    getGainNode().gain.setTargetAtTime(.35, getAudioCtx().currentTime, 2.5);
  }, 500);
}

// ══════════════════════════════════════════
//  ENTER → MAPA 3D
// ══════════════════════════════════════════
function enter() {
  const intro   = document.getElementById('intro');
  const trans   = document.getElementById('enter-transition');
  const content = document.getElementById('i-content');

  // Audio
  if (isAudioPlaying()) {
    getGainNode().gain.setTargetAtTime(.7, getAudioCtx().currentTime, 2.0);
  } else {
    fadeInAudio(0.7, 2.5);
  }
  document.getElementById('audio-btn').classList.add('playing');
  document.getElementById('ab-label').textContent = 'Audio On';

  const tl = gsap.timeline()

  tl
    // Intro content sale
    .to(content, { opacity: 0, scale: 0.97, y: -10,
        duration: 0.45, ease: 'power2.in' }, 0)

    // Intro bg se desvanece
    .to(intro, { opacity: 0, duration: 0.6, ease: 'power2.in' }, 0.2)

    // Overlay negro — tapa la escena mientras el logo 3D arranca en la oscuridad
    .to(trans, { opacity: 1, duration: 0.5, ease: 'power2.out',
        pointerEvents: 'auto' }, 0.3)

    // Corner coords
    .to('.et-coord', { opacity: 1, duration: 0.6,
        stagger: 0.08, ease: 'power2.out' }, 0.6)

    // Ocultar labels durante el entrance — evita que se filtren por el overlay semi-transparente
    .call(() => {
      const lc = document.getElementById('labels-container');
      if (lc) lc.style.opacity = '0';
    }, null, 0.3)

    // Logo 3D comienza — GSAP anima rotación 180°→0° + viaje z hacia el centro
    .call(() => {
      if (typeof window.triggerLogoEntrance === 'function') window.triggerLogoEntrance();
    }, null, 0.7)

    // ── DARKNESS REVEAL
    //    t=1.0–3.5: overlay casi negro — logo apenas insinuado (frames 1-2)
    .to(trans, { backgroundColor: 'rgba(3,3,5,0.86)',
        duration: 2.5, ease: 'power1.inOut' }, 1.0)

    //    t=3.8: logo ~60% rotado, empieza a encarar la cámara — overlay se abre (frame 3)
    //           partículas empiezan a filtrarse al mismo tiempo
    .to(trans, { backgroundColor: 'rgba(3,3,5,0.18)',
        duration: 1.6, ease: 'power2.inOut' }, 3.8)

    //    t=5.0: overlay completamente transparente — logo frente a cámara (frame 4)
    .to(trans, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 5.0)

    // Orbs emergen cuando el overlay empieza a abrirse — sincronizan con el logo (frame 3→4)
    .call(() => {
      if (typeof window.triggerOrbsEntrance === 'function') window.triggerOrbsEntrance();
    }, null, 3.8)

    // Hub + UI — logo ya está en posición final
    .call(() => {
      intro.style.display = 'none';
      intro.classList.remove('visible');
      trans.style.pointerEvents = 'none';

      document.getElementById('hud').classList.add('on');
      if (typeof window.initLabels === 'function') window.initLabels();
      window.entered = true;
      pageFadeIn();

      // Restaurar labels — se desvanecen al mismo tiempo que los orbs emergen
      const lc = document.getElementById('labels-container');
      if (lc) gsap.to(lc, { opacity: 1, duration: 1.2, ease: 'power2.out' });

      const manifesto = document.getElementById('hub-manifesto')
      if (manifesto) {
        setTimeout(() => {
          manifesto.style.opacity = '1'
          setTimeout(() => { manifesto.style.opacity = '0' }, 3200)
        }, 800)
      }
    }, null, 5.6)
}

// ══════════════════════════════════════════
//  INTRO PARALLAX
// ══════════════════════════════════════════
document.addEventListener('mousemove', e => {
  if (window.entered) return;
  const content = document.getElementById('i-content'); if (!content) return;
  const dx = (e.clientX / innerWidth  - .5) * 18;
  const dy = (e.clientY / innerHeight - .5) * 10;
  content.style.transform = `translate(${dx}px, ${dy}px)`;
  const svg = document.getElementById('intro-svg');
  if (svg) svg.style.transform = `translate(${-dx*.3}px, ${-dy*.3}px) scale(1.04)`;
});


// ══════════════════════════════════════════
//  RETORNO DESDE SUBPÁGINA (?back=1)
// ══════════════════════════════════════════
if (new URLSearchParams(location.search).get('back')) {
  document.getElementById('hud').classList.add('on');
  window.entered = true;

  if (sessionStorage.getItem('audioOn')) {
    sessionStorage.removeItem('audioOn');
    try {
      startAudioFromSilence(0.7, 2.5);
      document.getElementById('audio-btn').classList.add('playing');
      document.getElementById('ab-label').textContent = 'Audio On';
    } catch(e) {}
  }

  pageFadeIn();
}

// ══════════════════════════════════════════
//  EXPOSE GLOBALS
// ══════════════════════════════════════════
window.toggleAudio    = toggleAudio;
window.activateSplash = activateSplash;
window.enter          = enter;
window.pageFadeOut    = pageFadeOut;
window.pageFadeIn     = pageFadeIn;
window.navigateOut    = navigateOut;
window.uiSound        = uiSound;
