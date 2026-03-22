// ══════════════════════════════════════════
//  UI.JS — Splash · Enter flow · Page transitions
//  El audio vive en audio.js (importado abajo)
// ══════════════════════════════════════════
import {
  toggleAudio, startAudioFromSilence, fadeInAudio, fadeOutAudio,
  getGainNode, getAudioCtx, isAudioPlaying,
  uiChord, uiSound, playIntroSound
} from './audio.js';

// ── SHARED STATE (accesible desde navigation.js y main.js) ──
window.entered    = false;
window.activeKey  = null;
window.hoveredKey = null;

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

  content.style.transition = 'opacity .4s ease, transform .6s ease';
  content.style.opacity    = '0';
  content.style.transform  = 'scale(.97) translateY(-10px)';
  trans.classList.add('flash');

  if (isAudioPlaying()) {
    getGainNode().gain.setTargetAtTime(.7, getAudioCtx().currentTime, 2.0);
  } else {
    fadeInAudio(0.7, 2.5);
  }
  document.getElementById('audio-btn').classList.add('playing');
  document.getElementById('ab-label').textContent = 'Audio On';

  setTimeout(() => {
    pageFadeOut(() => {
      intro.style.display = 'none';
      intro.classList.remove('visible');
      document.getElementById('hud').classList.add('on');

      if (typeof window.initLabels === 'function') window.initLabels();

      window.entered = true;
      trans.classList.remove('flash');
      pageFadeIn();
    }, 350);
  }, 2100);
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
