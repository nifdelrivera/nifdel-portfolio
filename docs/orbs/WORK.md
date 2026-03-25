# ORBE — WORK
**Ruta:** `/work/index.html`
**Estado:** En desarrollo visual activo
**Última sesión:** 2026-03-23

---

## 1. IDENTIDAD DEL ORBE

> El orbe WORK es un visor orbital de proyectos. La metáfora es espacial: tarjetas flotando en el vacío alrededor de un planeta, cada una un proyecto. El usuario navega con scroll/teclado, el universo reacciona.

**Tono visual:** Oscuro, cinematográfico, bloom selectivo, tipografía fría (Space Mono + Syne). No es un portfolio — es una misión.

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Stack
- Three.js r160 (ES modules via importmap)
- EffectComposer + UnrealBloomPass + custom ShaderPasses
- Canvas 2D → CanvasTexture → MeshBasicMaterial (texto de tarjetas)
- THREE.VideoTexture para preview de proyecto con video

### 2.2 Capas de render (orden back → front)

```
Planeta + atmósfera + anillos     (escena, background)
  ↓
videoMesh  (renderOrder: 0, detrás del bgMesh)
  ↓
bgMesh     (renderOrder: 0, #060c1c opacity 0.40–0.80)  ← actúa de overlay natural sobre el video
  ↓
frame      (LineSegments, borde dashed del card)
  ↓
textMesh   (renderOrder: 1, depthTest: false)            ← siempre encima, bloom completo
  ↓
EffectComposer (bloom → eventHorizon → vignette/chroma → lens)
```

**Decisión clave:** Video detrás del bgMesh, no enfrente. El bgMesh al 80% de opacidad limita la luminancia del video a ~20% → imposible que el video dispare bloom. El texto queda libre para brillar.

### 2.3 Pipeline de texto (CanvasTexture)
```
document.fonts.ready
  → canvas 2048×1229 dibujado con Syne + Space Mono
  → CanvasTexture con maxAnisotropy
  → PlaneGeometry CARD_W × CARD_H
  → MeshBasicMaterial transparent, opacity animada por JS
```

**Problema resuelto:** Si el canvas se dibuja antes de `fonts.ready`, usa el fallback del sistema. Siempre esperar `document.fonts.ready.then(→ _buildCards())`.

---

## 3. SISTEMAS ACTIVOS

### 3.1 Sistema de tarjetas

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `CARD_W` | 5.0 | Ancho en world-units |
| `CARD_H` | 3.0 | Alto en world-units |
| `CV_W / CV_H` | 2048 / 1229 | Resolución del canvas de texto |
| `NZ` | 0.8 | Offset Z del textMesh frente al bgMesh |
| `VZ` | 0.015 | Offset Z del videoMesh detrás del bgMesh |
| `pad` | 100 | Margen izquierdo en canvas (px) |

### 3.2 Sistema de bloom

| Parámetro | Valor | Nota |
|-----------|-------|------|
| strength | 1.5 | Intensidad general |
| radius | 0.4 | Radio de dispersión |
| threshold | 0.32 | Luminancia mínima para bloom |

Texto al 0.48 de opacidad en canvas → ~0.48 en escena → por encima del threshold → bloom. Video máximo ~0.20 → por debajo del threshold → sin bloom.

### 3.3 Animación de texto (por card)

```
textAlpha    — fade in/out de la opacidad del textMesh
textDrift    — offset Y que simula "asentamiento" desde abajo al activar
textDelay    — countdown en segundos antes de que empiece el fade-in
```

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Fade-in speed | 0.045 | Lento, con peso |
| Fade-out speed | 0.09 | Rápido, con decisión |
| Delay | 0.5s | Pausa antes de aparecer |
| Drift Y inicial | 0.08 | Unidades abajo del punto final |
| Drift lerp | 0.055 | Velocidad de asentamiento |

Primera tarjeta: sin delay ni animación (arranca visible).

### 3.4 Tilt reactivo al mouse

Rotación sutil de todos los meshes del card en dirección contraria al mouse.

```javascript
const _tx = Math.sign(mouse.sx) * Math.pow(Math.abs(mouse.sx), 0.6); // ease-out
const _ty = Math.sign(mouse.sy) * Math.pow(Math.abs(mouse.sy), 0.6);
tilt.x += (-_tx * 0.18 - tilt.x) * 0.06;
tilt.y += (-_ty * 0.11 - tilt.y) * 0.06;
```

Curva `pow(|x|, 0.6)` — muy reactivo en zona central, suaviza en extremos.
Lerp 0.06 — ligeramente más lento que la cámara (0.035×2) → inercia diferencial → profundidad.

### 3.5 Video Texture

- Formato recomendado: `.webm` (VP9, CRF 33–38, sin audio)
- Ruta: `/work/{slug}/assets/preview.webm`
- `preload: 'none'` — no descarga hasta que sea el card activo
- Blur suave en ShaderMaterial (5 samples en cruz, b=0.004) — video como textura de fondo, no como contenido
- `play()` solo en card activo; `pause()` en todos los demás

### 3.6 Panel lateral derecho

4 bloques separados por reglas:
1. **Mission Header** — dot + MISSION BRIEF + contador + título + cliente
2. **Data Matrix** — grid: año / rol / tipo / tools
3. **Brief** — descripción + stats + awards (scrollable, flex:1)
4. **Mission Controls** — nav mini (prev/next) + CTA "Iniciar Misión" + links externos (Behance / web)

Links externos condicionales: solo aparecen si `p.behance` o `p.link` tienen valor.

---

## 4. DATOS DE PROYECTO

Estructura mínima requerida por card:

```javascript
{
  slug:    'nombre-url',
  title:   'Título',
  client:  'Cliente o "Original IP"',
  year:    2024,
  cat:     ['Motion', '3D'],     // primer elemento se muestra en el card
  col:     [r, g, b],            // color accent (0–1)
  role:    'Concepto · 3D · Motion',
  tools:   'C4D · Redshift · AE',
  desc:    'Descripción del proyecto.',
  stats:   null | { key: value },
  awards:  null | ['Award 1'],
  behance: null | 'https://...',
  link:    null | 'https://...',
  videoSrc: null | 'slug/assets/preview.webm',
}
```

---

## 5. PROBLEMAS RESUELTOS → SOLUCIONES

| Problema | Causa | Solución |
|----------|-------|----------|
| Video sobreexpuesto (bloom) | Video en frente del bgMesh con threshold 0.18 | Mover video DETRÁS del bgMesh. El bgMesh actúa de overlay, luminancia ≤ 20% |
| Texto borroso / fuente incorrecta | Canvas dibujado antes de cargar Google Fonts | Envolver `_buildCards()` en `document.fonts.ready.then()` |
| Texto a mitad de tamaño tras doblar canvas | Font sizes no se doblaron al subir CV_W×CV_H | Mantener font sizes en px proporcionales al canvas (20px en 1024 → mantener 20px en 2048 = texto más fino pero nitido) |
| "3D" se partía en "3" + "D" en `_breakTitle()` | Regex `(\d)([a-zA-Z])` | Solo usar `([a-z])([A-Z])` para camelCase |
| VideoMesh no seguía el float del card | No estaba en el loop de animación | Añadir `card.videoMesh.position.y = fy` en el forEach del animate loop |
| Selective bloom fallado | `renderer.render()` después de `composer.render()` no overlay | No implementado — workaround con threshold + overlay oscuro |

---

## 6. PENDIENTE ESTE ORBE

- [ ] Rellenar los 8 proyectos con datos reales
- [ ] Videos preview para los proyectos que los tengan
- [ ] Páginas interiores (`/work/{slug}/index.html`) usando `work-project-viewer.html` como template
- [ ] Disección del `index.html` (~1800 líneas) en módulos cuando el visual esté cerrado
- [ ] Guía de estilos UI (ver sección 8)

---

## 7. PATRÓN PARA OTROS ORBES

Cada orbe nuevo parte de estas preguntas:

### 7.1 Preguntas de identidad
- ¿Qué metáfora visual representa este contenido?
- ¿Cómo navega el usuario? (scroll, drag, click, none)
- ¿Qué información necesita ser legible de un vistazo?

### 7.2 Decisiones técnicas a evaluar por orbe
- ¿Necesita EffectComposer? ¿Qué passes?
- ¿Hay contenido dinámico (video, audio, texto vivo)?
- ¿El panel de información es el mismo o diferente?
- ¿Cómo se relaciona visualmente con el hub principal?

### 7.3 Problemas comunes anticipados

| Problema probable | Prevención |
|-------------------|-----------|
| Fuentes no cargadas en canvas | Siempre `document.fonts.ready` |
| Bloom destruyendo contenido | Diseñar con el threshold en mente (0.32). Contenido vivo siempre detrás de un overlay controlado |
| Performance en móvil | Quality tier system (ver `NIFDEL ENGINE.md`) |
| Texto ilegible sobre fondo dinámico | `renderOrder: 1` + `depthTest: false` en textMesh |
| Video no se reproduce en móvil | `playsInline`, `muted`, requiere gesto de usuario |

### 7.4 Orbes planificados

| Orbe | Metáfora | Navegación | Estado |
|------|----------|-----------|--------|
| **Work** | Tarjetas orbitales | Scroll / teclado | En desarrollo |
| **Thoughts** | Planeta de archivos / documentos | Por definir | Pendiente |
| **Experiments** | Sistema técnico / terminal | Por definir | Pendiente |
| *(otros)* | Por definir | Por definir | — |

---

## 8. GUÍA DE ESTILOS UI

> Sección en construcción — se poblará al definir el sistema visual compartido entre orbes.

Elementos a documentar:
- Barra de navegación (estilo a migrar desde WORK)
- Botones y CTAs
- Tipografía de UI (tamaños, pesos, letter-spacing)
- Colores base y accents
- Corner marks y separadores
- Animaciones de entrada/salida de UI

---

*Este documento se actualiza con cada sesión de trabajo sobre el orbe.*
