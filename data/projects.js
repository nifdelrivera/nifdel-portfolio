// ══════════════════════════════════════════
//  DATA — Projects
//  Single source of truth for all work items.
//  Import this in work/index.js and any case study.
// ══════════════════════════════════════════

export const PROJECTS = [
  // ── Tier 1 — Hero Pieces ────────────────
  {
    num: '01', slug: 'rachin', room: 'featured', tier: 1,
    title: 'Rachin',
    subtitle: '3D Character · 360 Campaign · AI',
    client: 'Personal', year: '2024',
    tagline: 'Personaje propio — 3D, AI y campaña en un universo único.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }, { label: '3D', cls: 'cat-3d' }, { label: 'Character', cls: 'cat-character' }],
    accent: { r: 124, g: 58,  b: 237 },
    grad: 'radial-gradient(ellipse at 60% 40%, rgba(124,58,237,0.55) 0%, rgba(80,20,160,0.3) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null,        // → '/work/rachin/hero.mp4'
    behance: null,
    blocks: [
      { type: 'text', body: 'Rachin nació como una idea personal: ¿qué pasa cuando diseñas un personaje con criterio de brand, lo animas con 3D y lo lanzas como una campaña completa? El resultado fue una demostración de lo que puede hacer un director creativo cuando no tiene cliente que lo limite.' },
      { type: 'quote', text: 'Un personaje propio, una campaña completa, una exploración sin red.' },
      { type: 'text', body: 'El proceso combinó modelado y rigging en Cinema 4D, render en Octane, y generación IA para expandir los fondos y texturas de manera que sería imposible producir de forma tradicional en el mismo tiempo.' },
    ],
    awards: [],
  },
  {
    num: '02', slug: 'michelob-nba', room: 'featured', tier: 1,
    title: 'Michelob Ultra NBA',
    subtitle: 'Campaign · Guatemala',
    client: 'Michelob Ultra', year: '2023',
    tagline: 'Activación NBA para Guatemala — motion e integración de campaña.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }, { label: 'Campaign', cls: 'cat-campaign' }],
    accent: { r: 107, g: 159, b: 255 },
    grad: 'radial-gradient(ellipse at 30% 60%, rgba(107,159,255,0.4) 0%, rgba(50,80,200,0.2) 50%, rgba(6,6,8,0.95) 80%)',
    hero: null,
    behance: null,
    blocks: [
      { type: 'text', body: 'Case de activación NBA para Michelob Ultra en el mercado guatemalteco. Motion design integrado con la identidad visual de la NBA y los assets de la marca.' },
    ],
    awards: [],
  },
  {
    num: '03', slug: 'pilsener-fomo', room: 'featured', tier: 1,
    title: 'Pilsener FOMO',
    subtitle: 'Case Film',
    client: 'Pilsener', year: '2023',
    tagline: 'Case film completo — estrategia, concepto y ejecución en motion.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }, { label: 'Campaign', cls: 'cat-campaign' }],
    accent: { r: 245, g: 158, b: 11 },
    grad: 'radial-gradient(ellipse at 60% 40%, rgba(245,158,11,0.45) 0%, rgba(180,90,0,0.25) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null,
    behance: null,
    blocks: [
      { type: 'text', body: 'Case film para Pilsener que documenta una campaña completa desde concepto hasta ejecución. El FOMO como insight cultural convertido en pieza de comunicación.' },
    ],
    awards: [],
  },
  {
    num: '04', slug: 'semeantoja', room: 'featured', tier: 1,
    title: '#SeMeAntojaGuate',
    subtitle: 'Pepsi · 8.4K views · 655 likes',
    client: 'Pepsi', year: '2022',
    tagline: 'Campaña de orgullo local — 8.4K views, 655 likes en Behance.',
    cats: [{ label: 'Campaign', cls: 'cat-campaign' }, { label: 'Motion', cls: 'cat-motion' }],
    accent: { r: 59, g: 130, b: 246 },
    grad: 'radial-gradient(ellipse at 40% 65%, rgba(59,130,246,0.5) 0%, rgba(20,50,180,0.28) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null,
    behance: null,
    blocks: [
      { type: 'text', body: 'Una de las piezas con mayor alcance orgánico del portafolio. El brief era simple: orgullo guatemalteco con Pepsi.' },
      { type: 'quote', text: '8,400 vistas y 655 likes en Behance — métricas que el trabajo se ganó solo.' },
    ],
    awards: [],
  },
  {
    num: '05', slug: 'siconpepsi', room: 'featured', tier: 1,
    title: '#SICONPEPSI',
    subtitle: 'Pepsi · 7.7K views · 437 likes',
    client: 'Pepsi', year: '2022',
    tagline: 'El "sí" como afirmación de identidad — campaña de actitud.',
    cats: [{ label: 'Campaign', cls: 'cat-campaign' }],
    accent: { r: 37, g: 99, b: 235 },
    grad: 'radial-gradient(ellipse at 70% 50%, rgba(37,99,235,0.45) 0%, rgba(10,30,140,0.25) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },

  // ── Tier 2 — Campaigns ─────────────────
  {
    num: '06', slug: 'suntimer', room: 'campaigns', tier: 2,
    title: 'Suntimer',
    subtitle: 'Corona · Motion 3D',
    client: 'Corona', year: '2023',
    tagline: 'El tiempo como concepto visual — motion 3D para Corona.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }],
    accent: { r: 249, g: 115, b: 22 },
    grad: 'radial-gradient(ellipse at 50% 50%, rgba(249,115,22,0.35) 0%, rgba(160,60,0,0.2) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },
  {
    num: '07', slug: 'salcita', room: 'campaigns', tier: 2,
    title: 'Salcita',
    subtitle: 'Pollo Granjero · Motion',
    client: 'Pollo Granjero', year: '2024',
    tagline: 'Frescura y sabor en motion — la pieza más reciente en Behance.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }],
    accent: { r: 132, g: 204, b: 22 },
    grad: 'radial-gradient(ellipse at 40% 60%, rgba(132,204,22,0.3) 0%, rgba(60,120,0,0.18) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },
  {
    num: '08', slug: 'michelove', room: 'campaigns', tier: 2,
    title: 'Michelove',
    subtitle: 'Michelob · Case Film',
    client: 'Michelob Ultra', year: '2023',
    tagline: 'Edición de case film — amor y marca en una narrativa.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }],
    accent: { r: 107, g: 159, b: 255 },
    grad: 'radial-gradient(ellipse at 60% 40%, rgba(107,159,255,0.3) 0%, rgba(50,80,200,0.15) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },
  {
    num: '09', slug: 'newborn-athletes', room: 'campaigns', tier: 2,
    title: 'Newborn Athletes',
    subtitle: 'Gatorade · Concept',
    client: 'Gatorade', year: '2022',
    tagline: 'Un brief que no existía — concepto original para Gatorade.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }],
    accent: { r: 249, g: 115, b: 22 },
    grad: 'radial-gradient(ellipse at 30% 70%, rgba(249,115,22,0.35) 0%, rgba(160,60,0,0.2) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },
  {
    num: '10', slug: 'corona-zero', room: 'campaigns', tier: 2,
    title: 'Corona Zero',
    subtitle: 'Elevador · Concept Spot',
    client: 'Corona', year: '2023',
    tagline: 'Concept spot — cero grados, máximo concepto.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }],
    accent: { r: 100, g: 116, b: 139 },
    grad: 'radial-gradient(ellipse at 50% 30%, rgba(100,116,139,0.35) 0%, rgba(40,50,70,0.2) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },
  {
    num: '15', slug: '7up', room: 'campaigns', tier: 3,
    title: '7UP',
    subtitle: 'Nueva Imagen · Amixers',
    client: '7UP', year: '2022',
    tagline: 'Nueva imagen + Amixers — dos campañas, un universo de frescura.',
    cats: [{ label: 'Campaign', cls: 'cat-campaign' }],
    accent: { r: 74, g: 222, b: 128 },
    grad: 'radial-gradient(ellipse at 40% 50%, rgba(74,222,128,0.3) 0%, rgba(0,120,50,0.18) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },
  {
    num: '16', slug: 'pepsi-universe', room: 'campaigns', tier: 3,
    title: 'Pepsi Universe',
    subtitle: 'FIZZ & CRUNCH · #PEP_SI',
    client: 'Pepsi', year: '2021–22',
    tagline: 'FIZZ & CRUNCH + #PEP_SI — exploración tipográfica y motion.',
    cats: [{ label: 'Motion', cls: 'cat-motion' }, { label: 'Campaign', cls: 'cat-campaign' }],
    accent: { r: 59, g: 130, b: 246 },
    grad: 'radial-gradient(ellipse at 60% 40%, rgba(59,130,246,0.3) 0%, rgba(20,50,180,0.18) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },

  // ── Tier 2 — 3D Renders ─────────────────
  {
    num: '11', slug: 'imperial-3d', room: 'renders', tier: 2,
    title: 'Imperial 3D',
    subtitle: 'Product Renders',
    client: 'Imperial', year: '2023',
    tagline: 'Renders de producto en 3D — precisión y carácter visual.',
    cats: [{ label: '3D', cls: 'cat-3d' }],
    accent: { r: 212, g: 160, b: 23 },
    grad: 'radial-gradient(ellipse at 60% 50%, rgba(212,160,23,0.4) 0%, rgba(140,90,0,0.2) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },
  {
    num: '12', slug: 'pilsener-3d', room: 'renders', tier: 2,
    title: 'Pilsener 3D',
    subtitle: 'Product Renders',
    client: 'Pilsener', year: '2023',
    tagline: 'Renders fotorrealistas — el producto como protagonista.',
    cats: [{ label: '3D', cls: 'cat-3d' }],
    accent: { r: 245, g: 158, b: 11 },
    grad: 'radial-gradient(ellipse at 40% 60%, rgba(245,158,11,0.35) 0%, rgba(180,90,0,0.18) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },

  // ── Personal / Lab ──────────────────────
  {
    num: '13', slug: 'paradox', room: 'personal', tier: 2,
    title: 'Paradox',
    subtitle: 'UX/UI Film Case',
    client: 'Personal', year: '2023',
    tagline: 'UX/UI Film Case — interface y motion en una sola narrativa.',
    cats: [{ label: 'UX/UI', cls: 'cat-ux' }, { label: 'Motion', cls: 'cat-motion' }],
    accent: { r: 6, g: 182, b: 212 },
    grad: 'radial-gradient(ellipse at 70% 40%, rgba(6,182,212,0.4) 0%, rgba(0,80,120,0.22) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null,
    blocks: [
      { type: 'text', body: 'Paradox es la pieza que demuestra que el criterio no se limita al motion — hay un sistema detrás. Un case UX/UI que también es una película.' },
    ],
    awards: [],
  },
  {
    num: '14', slug: 'poll8bytes', room: 'personal', tier: 3,
    title: 'Poll8Bytes',
    subtitle: 'Experiment · 3D + Data',
    client: 'Personal', year: '2024',
    tagline: 'Datos y 3D — experimento en la intersección de lo visual y lo informacional.',
    cats: [{ label: 'Experiment', cls: 'cat-experiment' }, { label: '3D', cls: 'cat-3d' }],
    accent: { r: 16, g: 185, b: 129 },
    grad: 'radial-gradient(ellipse at 50% 60%, rgba(16,185,129,0.3) 0%, rgba(0,80,60,0.18) 45%, rgba(6,6,8,0.95) 80%)',
    hero: null, behance: null, blocks: [], awards: [],
  },
];

// ── Room manifest ─────────────────────────────────────────────
export const ROOMS = [
  {
    id: 'featured',
    name: 'Piezas Ancla',
    tag: 'Tier 1 · Hero Pieces',
    accent: { r: 107, g: 159, b: 255 },
    bgNum: 'I',
  },
  {
    id: 'campaigns',
    name: 'Campañas',
    tag: 'Motion · Campaign · Brand',
    accent: { r: 245, g: 158, b: 11 },
    bgNum: 'II',
  },
  {
    id: 'renders',
    name: '3D',
    tag: '3D · Renders · Spatial',
    accent: { r: 184, g: 160, b: 110 },
    bgNum: 'III',
  },
  {
    id: 'personal',
    name: 'Personal',
    tag: 'UX · Concept · Experiment',
    accent: { r: 100, g: 210, b: 255 },
    bgNum: 'IV',
  },
];

// ── Helpers ───────────────────────────────────────────────────
export function getProjectsByRoom(roomId) {
  return PROJECTS.filter(p => p.room === roomId);
}

export function getProjectBySlug(slug) {
  return PROJECTS.find(p => p.slug === slug) ?? null;
}

export function accentCss(p) {
  const { r, g, b } = p.accent;
  return `rgba(${r},${g},${b}`;
}
