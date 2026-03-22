// ══════════════════════════════════════════
//  SHADERS — todos los GLSL + GrainShader
// ══════════════════════════════════════════
import * as THREE from 'three';

// Simplex 3D Noise (compartido internamente entre shaders)
const noiseGLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  vec3 a0 = x0.xyz;
  vec3 a1 = x1.xyz;
  vec3 a2 = x2.xyz;
  vec3 a3 = x3.xyz;
  vec4 h = max(0.6 - vec4(dot(a0,a0), dot(a1,a1), dot(a2,a2), dot(a3,a3)), 0.0);
  float n = h.x * h.x * h.x * h.x * dot(a0, a0) +
            h.y * h.y * h.y * h.y * dot(a1, a1) +
            h.z * h.z * h.z * h.z * dot(a2, a2) +
            h.w * h.w * h.w * h.w * dot(a3, a3);
  return 8.0 * n;
}
`;

// ── PARTICLES ──
export const particleVertexShader = `
uniform float uTime;
uniform float uSpeed;
uniform float uFreq;
uniform float uAmp;
uniform vec2  uMouse;
uniform float uAspect;
uniform float uMouseForce;
uniform vec2  uLogoPos;
uniform float uLogoForce;
uniform float uPixelRatio;

attribute float aSize;
attribute vec3  aColor;
varying float vAlpha;
varying vec3  vColor;

${noiseGLSL}

void main() {
    vec3 pos = position;
    vColor = aColor;

    vec3 noisePos = vec3(pos.x * uFreq + uTime * uSpeed,
                         pos.y * uFreq,
                         pos.z * uFreq + uTime * (uSpeed * 2.0));
    pos.x += snoise(noisePos)              * uAmp;
    pos.y += snoise(noisePos + vec3(100.0)) * uAmp;
    pos.z += snoise(noisePos + vec3(200.0)) * uAmp;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position  = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (150.0 / -mvPosition.z) / uPixelRatio;

    vAlpha = (snoise(pos * 0.05 + uTime * (uSpeed * 4.0)) * 0.5 + 0.5) * 0.8;

    // Mouse black-hole — void interior + acumulación en borde (horizonte de eventos)
    if (uMouseForce > 0.0) {
        vec2 screenPos    = gl_Position.xy / gl_Position.w;
        vec2 aspectScreen = vec2(screenPos.x * uAspect, screenPos.y);
        vec2 aspectMouse  = vec2(uMouse.x    * uAspect, uMouse.y);
        vec2 dir  = aspectScreen - aspectMouse;
        float dist = length(dir);

        float rVoid = 0.245; // radio del void en NDC aspect-corregido
        float band  = dist - rVoid;
        float force;

        if (band < 0.0) {
            // Dentro del void: repulsión fuerte en el centro, se anula en el borde
            force = (1.0 - smoothstep(-rVoid, 0.0, band)) * uMouseForce;
        } else {
            // Justo fuera del borde: atracción suave → partículas se acumulan en el ring
            force = -exp(-band * 14.0) * uMouseForce * 0.45;
        }

        vec2 push = (dir / (dist + 0.0001)) * force;
        push.x /= uAspect;
        gl_Position.xy += push * gl_Position.w;
    }

    // Logo force-field repulsion
    if (uLogoForce > 0.0) {
        vec2 aspectScreen = vec2((gl_Position.x / gl_Position.w) * uAspect,
                                  (gl_Position.y / gl_Position.w));
        vec2 aspectLogo   = vec2(uLogoPos.x * uAspect, uLogoPos.y);
        vec2 dir  = aspectScreen - aspectLogo;
        float dist = length(dir);
        float force = exp(-dist * 2.0) * uLogoForce;
        vec2 push = (dir / (dist + 0.0001)) * force;
        push.x /= uAspect;
        gl_Position.xy += push * gl_Position.w;
    }
}
`;

export const particleFragmentShader = `
uniform float uAlphaMult;
varying float vAlpha;
varying vec3  vColor;

void main() {
    vec2  xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    float glow = pow((0.5 - ll) * 2.0, 1.5);
    gl_FragColor = vec4(vColor, glow * vAlpha * uAlphaMult);
}
`;

// ── NODES (plasma sphere) ──
export const nodeVertexShader = `
uniform float uTime;
varying vec2  vUv;
varying vec3  vPosition;

${noiseGLSL}

void main() {
    vUv       = uv;
    vPosition = position;
    vec3 pos  = position;
    float n   = snoise(pos * 0.8 + uTime * 0.5) * 0.15;
    pos      += normal * n;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const nodeFragmentShader = `
uniform float uTime;
uniform vec3  uColor;
varying vec2  vUv;
varying vec3  vPosition;

${noiseGLSL}

void main() {
    float n       = snoise(vPosition * 1.5 - uTime * 0.8);
    float pattern = smoothstep(0.0, 1.0, n * 0.5 + 0.5);
    vec3  bright  = uColor + vec3(0.15);
    gl_FragColor  = vec4(mix(uColor, bright, pattern), 0.9);
}
`;

// ── VIGNETTE CHROMA — RGB split + blur suave solo en las esquinas ──
// Siempre activo, independiente del chroma dinámico del dive.
// Peso cúbico desde el centro → prácticamente invisible en nodos,
// máximo en las 4 esquinas. Cinematográfico, no agresivo.
export const VignetteChromaShader = {
    uniforms: {
        tDiffuse:    { value: null },
        uAspect:     { value: 1.0 },
        uIntensity:  { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uAspect;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
            vec2 center = vec2(0.5, 0.5);
            vec2 offset = vUv - center;
            // Aspect-correct para que la vignette sea circular
            vec2 offsetA = vec2(offset.x * uAspect, offset.y);
            float dist = length(offsetA);

            // Peso cúbico — casi 0 en el centro, sube fuerte en esquinas (~0.7)
            float w = clamp(pow(dist * 1.15, 4.0), 0.0, 1.0);

            // RGB split radial — los canales se separan hacia los bordes
            float splitAmt = w * 0.0022 * uIntensity;
            vec2 splitDir  = normalize(offset + 0.0001) * splitAmt;

            float r = texture2D(tDiffuse, clamp(vUv + splitDir,       0.0, 1.0)).r;
            float g = texture2D(tDiffuse, vUv).g;
            float b = texture2D(tDiffuse, clamp(vUv - splitDir,       0.0, 1.0)).b;

            // Blur radial suave en esquinas (5 samples)
            vec2 blurDir = normalize(offset + 0.0001) * (w * 0.003);
            vec3 blurred = vec3(0.0);
            blurred += texture2D(tDiffuse, clamp(vUv - blurDir * 2.0, 0.0, 1.0)).rgb;
            blurred += texture2D(tDiffuse, clamp(vUv - blurDir,       0.0, 1.0)).rgb;
            blurred += texture2D(tDiffuse, vUv).rgb;
            blurred += texture2D(tDiffuse, clamp(vUv + blurDir,       0.0, 1.0)).rgb;
            blurred += texture2D(tDiffuse, clamp(vUv + blurDir * 2.0, 0.0, 1.0)).rgb;
            blurred /= 5.0;

            // Mezcla chroma + blur según peso
            vec3 chromaCol = vec3(r, g, b);
            vec3 result    = mix(chromaCol, blurred, w * 0.11 * uIntensity);

            // Oscurecimiento sutil de vignette en esquinas
            result *= 1.0 - w * 0.10 * uIntensity;

            gl_FragColor = vec4(result, 1.0);
        }
    `
};

// ── FILM GRAIN + VIGNETTE (post-processing) ──
export const GrainShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime:    { value: 0.0 },
        amount:   { value: 0.04 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float amount;
        varying vec2 vUv;

        float random(vec2 p) {
            vec2 K1 = vec2(23.14069263277926, 2.665144142690225);
            return fract(cos(dot(p, K1)) * 12345.6789);
        }

        void main() {
            vec4 color     = texture2D(tDiffuse, vUv);
            vec2 uvRandom  = vUv;
            uvRandom.y    *= random(vec2(uvRandom.y, uTime));
            color.rgb     += random(uvRandom) * amount - (amount / 2.0);

            // Vignette
            float dist  = distance(vUv, vec2(0.5));
            color.rgb  *= smoothstep(0.8, 0.3, dist * 0.8);

            gl_FragColor = color;
        }
    `
};

// ── CHROMATIC ABERRATION (post-processing) ──
// RGB split radial con peso cuadrático desde centro.
// Cuadrático garantiza centro intacto, efecto concentrado en edges — como una lente real.
export const ChromaticAberrationShader = {
    uniforms: {
        tDiffuse:   { value: null },
        uIntensity: { value: 0.002 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
            vec2 dir = vUv - 0.5;
            float aberration = uIntensity * dot(dir, dir);
            vec4 color;
            color.r = texture2D(tDiffuse, vUv + dir * aberration).r;
            color.g = texture2D(tDiffuse, vUv).g;
            color.b = texture2D(tDiffuse, vUv - dir * aberration).b;
            color.a = 1.0;
            gl_FragColor = color;
        }
    `
};

// ── NEBULA (ShaderMaterial para billboard planes en world.js) ──
// FBM 5-octave sobre UVs animados. Dos colores blend por noise.
// Vignette radial garantiza que los edges del plano desaparezcan sin hard cut.
export const NebulaShader = {
    uniforms: {
        uTime:    { value: 0.0 },
        uColor1:  { value: new THREE.Color(0x1a4a5c) },
        uColor2:  { value: new THREE.Color(0x663814) },
        uOpacity: { value: 0.12 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec3  uColor1;
        uniform vec3  uColor2;
        uniform float uOpacity;
        varying vec2  vUv;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
                u.y
            );
        }
        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 5; i++) {
                value += amplitude * noise(p);
                p *= 2.1;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            vec2 driftUv = vUv + vec2(uTime * 0.003, uTime * 0.0015);
            float n = fbm(driftUv * 1.8);

            vec3 nebColor = mix(uColor1, uColor2, smoothstep(0.3, 0.7, n));

            // Vignette radial — edges del plano se disuelven
            vec2 centered = vUv - 0.5;
            float vignette = 1.0 - smoothstep(0.25, 0.55, length(centered));

            float alpha = n * vignette * uOpacity;
            gl_FragColor = vec4(nebColor, alpha);
        }
    `
};

// ── GOD RAYS (ShaderPass post-processing) ──
// Radial light scatter (Crytek-style) desde un punto screen-space.
// Colocado DESPUÉS de Bloom → rays amplifican el glow natural del logo.
// NUM_SAMPLES se reemplaza via string en scene.js para mid quality (32→16).
export const GodRaysShader = {
    uniforms: {
        tDiffuse:   { value: null },
        uLightPos:  { value: new THREE.Vector2(0.5, 0.5) },
        uIntensity: { value: 0.06 },
        uDecay:     { value: 0.95 },
        uDensity:   { value: 0.97 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        #define NUM_SAMPLES 32
        uniform sampler2D tDiffuse;
        uniform vec2  uLightPos;
        uniform float uIntensity;
        uniform float uDecay;
        uniform float uDensity;
        varying vec2  vUv;

        void main() {
            vec2 delta = (vUv - uLightPos) / float(NUM_SAMPLES) * uDensity;
            float illuminationDecay = 1.0;
            vec3 rays = vec3(0.0);
            vec2 sampleUv = vUv;

            for (int i = 0; i < NUM_SAMPLES; i++) {
                sampleUv -= delta;
                vec3 samp = texture2D(tDiffuse, clamp(sampleUv, 0.0, 1.0)).rgb;
                rays += samp * illuminationDecay;
                illuminationDecay *= uDecay;
            }

            rays /= float(NUM_SAMPLES);
            vec3 scene = texture2D(tDiffuse, vUv).rgb;
            gl_FragColor = vec4(scene + rays * uIntensity, 1.0);
        }
    `
};

// ── EVENT HORIZON — halo sutil en el borde del void del mouse ──
// Ring fino en screen-space alrededor del cursor.
// En reposo: ring completo muy tenue con pulso lento.
// Al mover: arco concentrado en la dirección del movimiento (~20% del círculo).
export const EventHorizonShader = {
    uniforms: {
        tDiffuse:       { value: null },
        uMousePos:      { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVelocity: { value: new THREE.Vector2(0.0, 0.0) },
        uMouseSpeed:    { value: 0.0 },
        uTime:          { value: 0.0 },
        uAspect:        { value: 1.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2  uMousePos;
        uniform vec2  uMouseVelocity;
        uniform float uMouseSpeed;
        uniform float uTime;
        uniform float uAspect;
        varying vec2  vUv;

        void main() {
            vec3 scene = texture2D(tDiffuse, vUv).rgb;

            // Dirección aspect-corrected desde mouse al fragmento
            vec2 dir = vUv - uMousePos;
            dir.x *= uAspect;
            float dist = length(dir);

            float ringRadius = 0.091; // rVoid/2 — coincide con el void del particle shader en UV

            // Edge fade — disuelve el efecto cuando el mouse se acerca a cualquier borde
            float edgeMargin = ringRadius * 1.4;
            float edgeFade = smoothstep(0.0, edgeMargin, uMousePos.x)
                           * smoothstep(0.0, edgeMargin, 1.0 - uMousePos.x)
                           * smoothstep(0.0, edgeMargin, uMousePos.y)
                           * smoothstep(0.0, edgeMargin, 1.0 - uMousePos.y);

            // Capa 1 — ring interior brillante y fino
            float innerRing = 1.0 - smoothstep(0.0, 0.010, abs(dist - ringRadius));
            // Capa 2 — halo exterior suave
            float outerHalo = 1.0 - smoothstep(0.0, 0.048, abs(dist - ringRadius));
            // Capa 3 — atmósfera difusa solo en el borde exterior
            float atmo = smoothstep(ringRadius - 0.01, ringRadius, dist)
                       * (1.0 - smoothstep(ringRadius, ringRadius + 0.07, dist));

            // Idle: ring completo muy sutil con pulso lento
            float idlePulse = 0.6 + 0.4 * sin(uTime * 0.65);
            float idleGlow  = (innerRing * 0.04 + outerHalo * 0.025 + atmo * 0.012) * idlePulse;

            // Moving: eclipse-style bright spot en leading edge
            float arcGlow = 0.0;
            if (uMouseSpeed > 0.0001) {
                float velAngle  = atan(uMouseVelocity.y, uMouseVelocity.x);
                float fragAngle = atan(dir.y, dir.x);
                float angleDiff = abs(mod(fragAngle - velAngle + 3.14159265, 6.28318530) - 3.14159265);

                // Bright spot muy concentrado (~15 grados, 4% del circulo)
                float brightSpot = 1.0 - smoothstep(0.0, 0.26, angleDiff);
                // Glow ala más amplia (~90 grados)
                float glowWing   = 1.0 - smoothstep(0.0, 0.785, angleDiff);

                float speed01 = clamp(uMouseSpeed * 500.0, 0.0, 1.0);
                arcGlow = (innerRing * brightSpot * 0.40
                         + outerHalo * glowWing  * 0.10
                         + atmo      * glowWing  * 0.06) * speed01;
            }

            float total = (idleGlow + arcGlow) * edgeFade;
            // Color: cyan tenue en reposo → blanco puro en el bright spot
            vec3 glowColor = mix(vec3(0.65, 0.88, 1.0), vec3(1.0, 0.97, 0.92), clamp(arcGlow * 3.0, 0.0, 1.0));

            gl_FragColor = vec4(scene + glowColor * total, 1.0);
        }
    `
};

// ── NATIVE ZOOM BLUR (Reemplazo hiper-seguro del CSS filter y bounce) ──
export const ZoomBlurShader = {
    uniforms: {
        tDiffuse:  { value: null },
        uCenter:   { value: new THREE.Vector2(0.5, 0.5) },
        uStrength: { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uCenter;
        uniform float uStrength;
        varying vec2 vUv;

        float random(vec3 scale, float seed) {
            return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
        }

        void main() {
            vec4 color = vec4(0.0);
            float total = 0.0;
            vec2 toCenter = uCenter - vUv;
            
            float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
            for(float t = 0.0; t <= 10.0; t++) {
                float percent = (t + offset) / 10.0;
                float weight = 1.0 - percent;
                vec4 sampleColor = texture2D(tDiffuse, vUv + toCenter * percent * uStrength);
                color += sampleColor * weight;
                total += weight;
            }
            
            gl_FragColor = color / total;
            gl_FragColor.rgb *= (1.0 + uStrength * 1.5);
        }
    `
};
