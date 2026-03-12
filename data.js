// ══════════════════════════════════════════
//  DATA — single source of truth for nodes
// ══════════════════════════════════════════
const NODES = {
  WORK: {
    size: 42, angle: -110, dist: 215,
    col: [107, 159, 255], theme: 't-work',
    eye: 'Portfolio', title: 'Work',
    desc: 'Professional applications. Campaigns, branding, motion graphics, 3D, and visual development that shipped into the world.',
    body: 'work', badgeR: 40,
  },
  THOUGHTS: {
    size: 22, angle: 135, dist: 175,
    col: [184, 160, 110], theme: 't-thoughts',
    eye: 'Escritos', title: 'Thoughts',
    desc: 'Essays, reflexiones, and conceptual explorations. Philosophy of ego, consciousness, and paradox.',
    body: 'thoughts', badgeR: 42,
  },
  EXPERIMENTS: {
    size: 18, angle: 10, dist: 165,
    col: [220, 220, 215], theme: 't-experiments',
    eye: 'Lab', title: 'Experiments',
    desc: 'Visual and technical explorations outside commercial constraints. Curiosity made visible.',
    body: 'experiments', badgeR: 37,
  },
  INFO: {
    size: 10, angle: 90, dist: 295,
    col: 'rgba(255,255,255,0.55)', theme: 'info',
    eye: '◎', title: 'Info', desc: 'Quién soy. Cómo pienso. Dónde encontrarme.',
    body: 'info', badgeR: 25,
  },
  SYSTEMS: {
    size: 14, angle: -30, dist: 155,
    col: [0, 200, 50], theme: 't-systems',
    eye: '> systems.exe', title: 'Systems',
    desc: 'Frameworks and methodologies. Pipelines, analytical models, and the invisible architecture behind everything visible.',
    body: 'systems', badgeR: 32,
  }
};

function angleToXY(deg, r) {
  const rad = (deg - 90) * Math.PI / 180;
  return [Math.cos(rad) * r, Math.sin(rad) * r];
}

// Pre-computed index map — avoids Object.keys().indexOf() O(n) calls in the render loop
const nodeIndices = Object.fromEntries(Object.keys(NODES).map((k, i) => [k, i]));
