// ══════════════════════════════════════════
//  DATA — Thoughts / Essays
//  Manifest for all written pieces.
// ══════════════════════════════════════════

export const THOUGHTS = [
  {
    id: 'aire-y-melodia',
    title: 'Aire y melodía',
    year: 2025,
    type: 'audio-reactive',
    url: '/thoughts/aire-y-melodia/',
    readTime: '3 min',
    published: false,
    tagline: 'Disolverse en la música. El trance como forma de presencia.',
    accent: { r: 255, g: 255, b: 255 },
  },
  {
    id: 'anestesiado',
    title: 'Anestesiado',
    year: 2025,
    type: 'threejs-prism',
    url: '/thoughts/anestesiado/',
    readTime: '8 min',
    published: false,
    tagline: 'Percepción en capas simultáneas. Ver el código con el que fuiste escrito.',
    accent: { r: 180, g: 140, b: 255 },
  },
  {
    id: 'bitacora-37',
    title: 'Bitácora 37',
    year: 2025,
    type: 'typewriter',
    url: '/thoughts/bitacora-37/',
    readTime: '4 min',
    published: false,
    tagline: 'El acto de escribir como acto de existir.',
    accent: { r: 200, g: 200, b: 190 },
  },
  {
    id: 'estados-sin-base',
    title: 'Estados sin base',
    year: 2025,
    type: 'threejs-fracture',
    url: '/thoughts/estados-sin-base/',
    readTime: '3 min',
    published: false,
    tagline: 'No hay suelo firme — y visualmente tampoco lo hay.',
    accent: { r: 255, g: 255, b: 255 },
  },
  {
    id: 'mendicidad-atencion',
    title: 'La Mendicidad de la Atención',
    year: 2025,
    type: 'glitch-ui',
    url: '/thoughts/mendicidad-atencion/',
    readTime: '12 min',
    published: false,
    tagline: 'Criticar el espectáculo usando los artefactos del espectáculo como fondo.',
    accent: { r: 255, g: 100, b: 100 },
  },
  {
    id: 'melancolico-cronico',
    title: 'Un melancólico crónico frente al vacío de sentido',
    year: 2025,
    type: 'interactive-type',
    url: '/thoughts/melancolico-cronico/',
    readTime: '3 min',
    published: false,
    tagline: 'El lector activa los sentidos. Leer es participar.',
    accent: { r: 184, g: 160, b: 110 },
  },
  {
    id: 'jaula-transparente',
    title: 'La Jaula Transparente',
    year: 2025,
    type: 'threejs-essay',
    url: '/thoughts/jaula-transparente/',
    readTime: '18 min',
    published: true,
    tagline: 'On ego, consciousness, and the transparent cage we cannot see from within.',
    accent: { r: 184, g: 160, b: 110 },
  },
];

export function getPublished() {
  return THOUGHTS.filter(t => t.published);
}

export function getThoughtById(id) {
  return THOUGHTS.find(t => t.id === id) ?? null;
}
