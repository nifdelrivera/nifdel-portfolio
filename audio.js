// ══════════════════════════════════════════
//  AUDIO.JS — Sistema de audio completo
//  UI sounds · Ambient drone · Moods · Tones
//  Importado por ui.js vía ES module import
// ══════════════════════════════════════════

// ── UI AUDIO CONTEXT (hover sounds, intro) ──
let uiCtx = null;

function ensureUICtx() {
  if (uiCtx) return true;
  try { uiCtx = new (window.AudioContext || window.webkitAudioContext)(); return true; }
  catch(e) { return false; }
}

['mousedown','touchstart','keydown'].forEach(ev =>
  document.addEventListener(ev, () => ensureUICtx(), { once: true })
);

function uiTone(freq, gain, atk, dec, type = 'sine', lpMult = 4) {
  if (!ensureUICtx()) return;
  const now = uiCtx.currentTime;
  const o = uiCtx.createOscillator(), g = uiCtx.createGain(), lp = uiCtx.createBiquadFilter();
  o.type = type; o.frequency.value = freq;
  lp.type = 'lowpass'; lp.frequency.value = freq * lpMult; lp.Q.value = 0.5;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + atk);
  g.gain.exponentialRampToValueAtTime(0.0001, now + atk + dec);
  o.connect(lp); lp.connect(g); g.connect(uiCtx.destination);
  o.start(now); o.stop(now + atk + dec);
}

export function uiChord(freqs, gain, atk, dec, spread = 0) {
  if (!ensureUICtx()) return;
  const now = uiCtx.currentTime;
  freqs.forEach((f, i) => {
    const d = i * spread;
    const o = uiCtx.createOscillator(), g = uiCtx.createGain(), lp = uiCtx.createBiquadFilter();
    o.type = 'sine'; o.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.value = f * 4; lp.Q.value = 0.5;
    g.gain.setValueAtTime(0, now + d);
    g.gain.linearRampToValueAtTime(gain * Math.pow(0.78, i), now + d + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, now + d + atk + dec);
    o.connect(lp); lp.connect(g); g.connect(uiCtx.destination);
    o.start(now + d); o.stop(now + d + atk + dec);
  });
}

// ══════════════════════════════════════════
//  AMBIENT AUDIO — drone + moods
// ══════════════════════════════════════════
let audioCtx = null, masterGain = null, gainNode = null,
    audioPlaying = false, filterNode = null;
const oscillators = [];

export function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const ctx = audioCtx, now = ctx.currentTime;

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  gainNode = masterGain;

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 20; comp.ratio.value = 4;
  comp.attack.value = 0.08; comp.release.value = 0.5;

  const masterLP = ctx.createBiquadFilter();
  masterLP.type = 'lowpass'; masterLP.frequency.value = 3500; masterLP.Q.value = 0.4;
  masterGain.connect(masterLP); masterLP.connect(comp); comp.connect(ctx.destination);

  function makeDelay(time, fb) {
    const d = ctx.createDelay(3.0), f = ctx.createGain();
    d.delayTime.value = time; f.gain.value = fb; d.connect(f); f.connect(d); return d;
  }
  const d0 = makeDelay(.29,.12), d1 = makeDelay(.47,.10),
        d2 = makeDelay(.71,.08), d3 = makeDelay(1.13,.06);
  const wetBus = ctx.createGain(); wetBus.gain.value = 0.13;
  d0.connect(wetBus); d1.connect(wetBus); d2.connect(wetBus); d3.connect(wetBus);
  wetBus.connect(masterGain);

  filterNode = ctx.createBiquadFilter();
  filterNode.type = 'lowpass'; filterNode.frequency.value = 800; filterNode.Q.value = 0.6;

  const fLFO = ctx.createOscillator(), fLFOG = ctx.createGain();
  fLFO.type = 'sine'; fLFO.frequency.value = 0.025; fLFOG.gain.value = 180;
  fLFO.connect(fLFOG); fLFOG.connect(filterNode.frequency); fLFO.start(now);

  filterNode.connect(masterGain);
  filterNode.connect(d0); d0.connect(d1); d1.connect(d2); d2.connect(d3);

  const layers = [
    [55.00,55.07,.048,0,.011,.6,0],    [82.41,82.50,.036,-.2,.017,.6,.8],
    [110.0,110.09,.030,.25,.013,.5,1.6],[130.8,130.88,.022,-.3,.019,.5,2.4],
    [98.00,98.06,.020,.3,.015,.4,3.2], [220.0,220.11,.014,0,.022,.3,4.0]
  ];
  layers.forEach(([f1,f2,vol,pan,lfoF,lfoA,delay]) => {
    [f1,f2].forEach((f,j) => {
      const osc = ctx.createOscillator(), g = ctx.createGain(),
            p   = ctx.createStereoPanner(), lp = ctx.createBiquadFilter();
      osc.type = f < 100 ? 'triangle' : 'sine'; osc.frequency.value = f;
      lp.type = 'lowpass'; lp.frequency.value = f * 6; lp.Q.value = 0.5;
      p.pan.value = pan + (j === 1 ? -pan * 0.3 : 0);
      const v = vol * (j === 1 ? .65 : 1);
      g.gain.setValueAtTime(0, now + delay);
      g.gain.setTargetAtTime(v, now + delay, 4.5 + j * .5);
      const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
      lfo.type = 'sine'; lfo.frequency.value = lfoF + j * .003; lfoG.gain.value = v * lfoA * .18;
      lfo.connect(lfoG); lfoG.connect(g.gain); lfo.start(now + delay);
      osc.connect(lp); lp.connect(g); g.connect(p); p.connect(filterNode);
      osc.start(now + delay); oscillators.push(osc);
    });
  });
}

export function toggleAudio() {
  initAudio();
  const btn = document.getElementById('audio-btn'), label = document.getElementById('ab-label');
  if (!audioPlaying) {
    masterGain.gain.setTargetAtTime(.9, audioCtx.currentTime, 3.5);
    audioPlaying = true; btn.classList.add('playing'); label.textContent = 'Audio On';
  } else {
    masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 3.0);
    audioPlaying = false; btn.classList.remove('playing'); label.textContent = 'Enable Audio';
  }
}

// Helper: arranca audio desde silencio (usado en splash + ?back=1)
export function startAudioFromSilence(targetGain = 0.7, timeConstant = 2.5) {
  ensureUICtx();
  if (uiCtx && uiCtx.state === 'suspended') uiCtx.resume();
  initAudio();
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, timeConstant);
  audioPlaying = true;
}

// Helper: fade in suave (usado en enter())
export function fadeInAudio(targetGain = 0.7, timeConstant = 2.5) {
  initAudio();
  gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, timeConstant);
  audioPlaying = true;
}

// Helper: fade out (usado en navigateOut)
export function fadeOutAudio(timeConstant = 0.3) {
  if (!gainNode || !audioCtx) return;
  gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, timeConstant);
}

// ── AUDIO MOODS ──
const AUDIO_CUTOFFS = {
  WORK: 1100, THOUGHTS: 480, EXPERIMENTS: 1400, SYSTEMS: 620, INFO: 800
};

export function setAudioMood(key) {
  if (!audioCtx || !audioPlaying) return;
  filterNode.frequency.setTargetAtTime(AUDIO_CUTOFFS[key] ?? 800, audioCtx.currentTime, 4.0);
}

let lastHoveredForTone = null;
export function playHoverTone(key) {
  if (!audioCtx || !audioPlaying || key === lastHoveredForTone) return;
  lastHoveredForTone = key;
  const now = audioCtx.currentTime;
  const cfg = {
    WORK:        { freqs:[440,440.08],   gain:.026, atk:.14, dec:1.8 },
    THOUGHTS:    { freqs:[261.6,261.66], gain:.023, atk:.24, dec:2.6 },
    EXPERIMENTS: { freqs:[329.6,329.68], gain:.024, atk:.12, dec:1.5 },
    SYSTEMS:     { freqs:[196,196.05],   gain:.020, atk:.10, dec:1.3 },
  };
  const c = cfg[key]; if (!c) return;
  c.freqs.forEach((f,i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(), lp = audioCtx.createBiquadFilter();
    o.type = 'sine'; o.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.value = f * 4; lp.Q.value = .5;
    const vol = c.gain * (i === 1 ? .55 : 1);
    g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(vol,now+c.atk);
    g.gain.exponentialRampToValueAtTime(.0001,now+c.atk+c.dec);
    o.connect(lp); lp.connect(g); g.connect(masterGain); o.start(now); o.stop(now+c.atk+c.dec);
  });
}

export function playActivationSound(key) {
  if (!audioCtx || !audioPlaying) return;
  const now = audioCtx.currentTime;
  const cfg = {
    WORK:        { freqs:[261.6,329.6,392,493.8], atk:.12, dec:2.0, gain:.028, sp:.10 },
    THOUGHTS:    { freqs:[130.8,164.8,196,261.6], atk:.30, dec:3.5, gain:.022, sp:.24 },
    EXPERIMENTS: { freqs:[196,246.9,293.7,370],   atk:.09, dec:1.8, gain:.026, sp:.09 },
    SYSTEMS:     { freqs:[98,130.8,164.8,196],     atk:.07, dec:1.5, gain:.024, sp:.13 },
  };
  const c = cfg[key]; if (!c) return;
  c.freqs.forEach((f,i) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain(), lp = audioCtx.createBiquadFilter();
    o.type = 'sine'; o.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.value = f * 5; lp.Q.value = .4;
    const d = i * c.sp, vol = c.gain * Math.pow(.72, i);
    g.gain.setValueAtTime(0,now+d); g.gain.linearRampToValueAtTime(vol,now+d+c.atk);
    g.gain.exponentialRampToValueAtTime(.0001,now+d+c.atk+c.dec);
    o.connect(lp); lp.connect(g); g.connect(masterGain); o.start(now+d); o.stop(now+d+c.atk+c.dec);
  });
}

// ══════════════════════════════════════════
//  UI SOUND SYSTEM
// ══════════════════════════════════════════
function _uiSoundBase(type) {
  ensureUICtx(); if (!uiCtx) return;
  switch(type) {
    case 'hover:enter-btn':             uiTone(880,.09,.006,.18); uiTone(1100,.055,.006,.14); break;
    case 'hover:audio-btn':             uiTone(660,.07,.008,.22); break;
    case 'hover:node-work':             uiTone(528,.085,.01,.35); uiTone(528.1,.052,.01,.35); break;
    case 'hover:node-thoughts':         uiTone(396,.075,.06,.9);  break;
    case 'hover:node-experiments':      uiTone(622,.080,.01,.28); uiTone(623,.042,.01,.28); break;
    case 'hover:node-systems':          uiTone(220,.085,.008,.22); break;
    case 'hover:center':                uiChord([220,277.2,330],.065,.08,1.8,.10); break;
    case 'hover:close-btn':             uiTone(440,.07,.008,.20); uiTone(349.2,.042,.012,.28); break;
    case 'hover:panel-cta-work':        uiTone(528,.075,.010,.30); break;
    case 'hover:panel-cta-thoughts':    uiTone(396,.070,.05,.80); break;
    case 'hover:panel-cta-experiments': uiTone(622,.072,.010,.30); break;
    case 'hover:panel-cta-systems':     uiTone(293.7,.072,.008,.22); break;
    case 'hover:see-all':               uiChord([392,493.8,587.3],.075,.012,.8,.06); break;
    case 'hover:back-btn':              uiTone(493.8,.07,.010,.28); uiTone(392,.042,.015,.35); break;
    case 'hover:pm-card':               uiTone(493.8,.065,.008,.40); break;
    case 'hover:pm-card-cta':           uiChord([493.8,622],.070,.010,.55,.05); break;
  }
}

const _uiLast = {};
export function uiSound(type, ms = 160) {
  const n = performance.now();
  if (_uiLast[type] && n - _uiLast[type] < ms) return;
  _uiLast[type] = n; _uiSoundBase(type);
}

export function playIntroSound() {
  ensureUICtx(); if (!uiCtx) return;
  const now = uiCtx.currentTime;
  const comp = uiCtx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 18; comp.ratio.value = 5;
  comp.attack.value = .02; comp.release.value = .4;
  comp.connect(uiCtx.destination);

  [55,82.41,110].forEach((f,i) => {
    const o = uiCtx.createOscillator(), g = uiCtx.createGain(), lp = uiCtx.createBiquadFilter();
    o.type = 'sine'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = f*5; lp.Q.value = .4;
    const d = i * .18;
    g.gain.setValueAtTime(0,now+d); g.gain.linearRampToValueAtTime(.055-i*.01,now+d+1.2);
    g.gain.setTargetAtTime(.022,now+3.0,1.0);
    o.connect(lp); lp.connect(g); g.connect(comp); o.start(now+d); o.stop(now+12);
  });

  const dotFreqs  = [523.2,587.3,659.2,698.5,783.9,880];
  const dotDelays = [1.0,1.4,1.7,2.0,2.3,2.6];
  dotFreqs.forEach((f,i) => {
    const d = dotDelays[i];
    const o = uiCtx.createOscillator(), g = uiCtx.createGain(), lp = uiCtx.createBiquadFilter();
    o.type = 'sine'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = f*3.5; lp.Q.value = .6;
    g.gain.setValueAtTime(0,now+d); g.gain.linearRampToValueAtTime(.068,now+d+.04);
    g.gain.exponentialRampToValueAtTime(.0001,now+d+1.5);
    o.connect(lp); lp.connect(g); g.connect(comp); o.start(now+d); o.stop(now+d+1.5);
  });

  [1320,1760,2200].forEach((f,i) => {
    const d = 2.35 + i * .07;
    const o = uiCtx.createOscillator(), g = uiCtx.createGain(), lp = uiCtx.createBiquadFilter();
    o.type = 'sine'; o.frequency.value = f; lp.type = 'lowpass'; lp.frequency.value = f*1.8; lp.Q.value = 1.2;
    g.gain.setValueAtTime(0,now+d); g.gain.linearRampToValueAtTime(.052-i*.012,now+d+.06);
    g.gain.exponentialRampToValueAtTime(.0001,now+d+2.4);
    o.connect(lp); lp.connect(g); g.connect(comp); o.start(now+d); o.stop(now+d+2.4);
  });
}

// ── Mouse reactivo al audio (Optimizado con rAF) ──
let lastMouseX = 0, lastMouseY = 0;
let _audioRaf = null;

document.addEventListener('mousemove', e => {
  if (!window.entered || !audioCtx || !audioPlaying || !filterNode) return;
  const dx = e.clientX - lastMouseX, dy = e.clientY - lastMouseY;
  lastMouseX = e.clientX; lastMouseY = e.clientY;
  
  if (_audioRaf) return;
  _audioRaf = requestAnimationFrame(() => {
    _audioRaf = null;
    const vel = Math.min(Math.sqrt(dx*dx + dy*dy), 40);
    if (vel > 3) {
      const b = AUDIO_CUTOFFS[window.activeKey] ?? 800;
      filterNode.frequency.setTargetAtTime(b + vel*2.8, audioCtx.currentTime, .18);
      filterNode.frequency.setTargetAtTime(b, audioCtx.currentTime + .2, 1.2);
    }
  });
});

// ── Helpers ──
export function playCTAHover(variant) { uiSound('hover:panel-cta-' + variant); }
export function playCardHover()        { uiSound('hover:pm-card'); }

// ── Getters para ui.js ──
export function getAudioCtx()    { return audioCtx; }
export function getGainNode()    { return gainNode; }
export function isAudioPlaying() { return audioPlaying; }

// ══════════════════════════════════════════
//  EXPOSE GLOBALS
//  (HTML onclick + navigation.js + work/index.html)
// ══════════════════════════════════════════
window.toggleAudio         = toggleAudio;
window.uiSound             = uiSound;
window.uiChord             = uiChord;
window.setAudioMood        = setAudioMood;
window.playHoverTone       = playHoverTone;
window.playActivationSound = playActivationSound;
window.playCTAHover        = playCTAHover;
window.playCardHover       = playCardHover;
window._getAudioCtx        = getAudioCtx;
window._getGainNode        = getGainNode;
window._isAudioPlaying     = isAudioPlaying;
