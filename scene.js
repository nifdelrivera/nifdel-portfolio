// ══════════════════════════════════════════
//  SCENE — Three.js setup + post-processing
// ══════════════════════════════════════════
import * as THREE from 'three';
import { EffectComposer }  from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass }      from 'three/addons/postprocessing/ShaderPass.js';
import { GrainShader, ZoomBlurShader, ChromaticAberrationShader, GodRaysShader, EventHorizonShader, VignetteChromaShader } from './shaders.js';
import { CONFIG } from './config.js';

const canvas = document.getElementById('webgl-canvas');

// ── SCENE ──
export const scene = new THREE.Scene();
scene.background = new THREE.Color(CONFIG.colors.bg);
scene.fog        = new THREE.FogExp2(CONFIG.colors.bg, 0.006);

// ── CAMERA GROUP ──
export const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

export const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, CONFIG.cameraOrbitY, CONFIG.cameraOrbitZ);
camera.lookAt(0, 0, 0);
cameraGroup.add(camera);

// ── RENDERER ──
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
renderer.toneMapping         = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ── POST-PROCESSING ──
// Orden: Render → ZoomBlur → Bloom → BgRays → GodRays → Chroma → Grain
const renderScene = new RenderPass(scene, camera);

export const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85
);
bloomPass.threshold = 0.18;
bloomPass.strength  = 0.8;
bloomPass.radius    = 0.3;

export const composer = new EffectComposer(renderer);
composer.addPass(renderScene);

export const zoomBlurPass = new ShaderPass(ZoomBlurShader);
composer.addPass(zoomBlurPass);

composer.addPass(bloomPass);

// ── BG RAYS — god rays ambientales desde esquina superior izquierda (fijo)
// Decay bajo (0.94) = rayos cortos → solo pixeles muy brillantes los propagan.
// Impide que partículas pequeñas acumulen scatter.
export const bgRaysPass = new ShaderPass({
    uniforms: {
        tDiffuse:   { value: null },
        uLightPos:  { value: new THREE.Vector2(0.08, 0.92) },
        uIntensity: { value: 0.04 },
        uDecay:     { value: 0.94 },
        uDensity:   { value: 0.96 }
    },
    vertexShader:   GodRaysShader.vertexShader,
    fragmentShader: GodRaysShader.fragmentShader
});
composer.addPass(bgRaysPass);

// ── GOD RAYS — radial scatter desde el logo (sigue al centro en main.js)
// Decay 0.92 = alcance corto, solo el logo y bright stars lo propagan.
export const godRaysPass = new ShaderPass({
    uniforms: {
        tDiffuse:   { value: null },
        uLightPos:  { value: new THREE.Vector2(0.5, 0.5) },
        uIntensity: { value: 0.07 },
        uDecay:     { value: 0.92 },
        uDensity:   { value: 0.93 }
    },
    vertexShader:   GodRaysShader.vertexShader,
    fragmentShader: GodRaysShader.fragmentShader
});
composer.addPass(godRaysPass);

// ── EVENT HORIZON — halo en borde del void del mouse (actualizado en main.js)
export const eventHorizonPass = new ShaderPass(EventHorizonShader);
eventHorizonPass.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
composer.addPass(eventHorizonPass);

// ── CHROMATIC ABERRATION — RGB split en edges
export const chromaPass = new ShaderPass(ChromaticAberrationShader);
composer.addPass(chromaPass);

// ── GRAIN
export const grainPass = new ShaderPass(GrainShader);
composer.addPass(grainPass);

// ── VIGNETTE CHROMA — RGB split + blur en esquinas, siempre activo, va al último
export const vignetteChromaPass = new ShaderPass(VignetteChromaShader);
vignetteChromaPass.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
composer.addPass(vignetteChromaPass);
