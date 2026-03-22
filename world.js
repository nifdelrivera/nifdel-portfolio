// ══════════════════════════════════════════
//  WORLD — objetos 3D: logo, nodos, partículas
// ══════════════════════════════════════════
import * as THREE      from 'three';
import { GLTFLoader }  from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from './config.js';
import { nodeVertexShader, nodeFragmentShader,
         particleVertexShader, particleFragmentShader,
         NebulaShader } from './shaders.js';
import { scene, renderer } from './scene.js';

// ══════════════════════════════════════════
//  PROCEDURAL HDRI (rainbow prism environment)
// ══════════════════════════════════════════
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

const envScene   = new THREE.Scene();
envScene.background = new THREE.Color(0x000000);

const stripGeo      = new THREE.PlaneGeometry(4, 50);
const rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

// Wall Right
rainbowColors.forEach((c, i) => {
    const p = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ color: c }));
    p.position.set(25, 0, -15 + i * 5);
    p.lookAt(0, 0, 0);
    envScene.add(p);
});
// Wall Left
rainbowColors.forEach((c, i) => {
    const p = new THREE.Mesh(stripGeo, new THREE.MeshBasicMaterial({ color: c }));
    p.position.set(-25, 0, 15 - i * 5);
    p.lookAt(0, 0, 0);
    envScene.add(p);
});

const whiteRimMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const topRim = new THREE.Mesh(new THREE.PlaneGeometry(50, 4), whiteRimMat);
topRim.position.set(0, 25, 0); topRim.lookAt(0, 0, 0); envScene.add(topRim);
const botRim = new THREE.Mesh(new THREE.PlaneGeometry(50, 4), whiteRimMat);
botRim.position.set(0, -25, 0); botRim.lookAt(0, 0, 0); envScene.add(botRim);

// Generamos el cubemap UNA sola vez y lo compartimos entre ambas escenas
const envTexture = pmremGenerator.fromScene(envScene).texture;
scene.environment = envTexture;

pmremGenerator.dispose(); // CRÍTICO: Libera la máquina de generación de la VRAM (memoria de video)

// ══════════════════════════════════════════
//  LIGHTS  (escena principal — nodos, partículas, nebula)
// ══════════════════════════════════════════
scene.add(new THREE.AmbientLight(0xffffff, 0.2));
const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 8);
scene.add(dirLight);

// ══════════════════════════════════════════
//  GROUPS
// ══════════════════════════════════════════
export const universeGroup = new THREE.Group();
scene.add(universeGroup);

// Orbit pivot — rota todos los nodos juntos
export const orbitGroup = new THREE.Group();
universeGroup.add(orbitGroup);

// Centro — independiente del scroll
export const centerGroup = new THREE.Group();
universeGroup.add(centerGroup);

// ══════════════════════════════════════════
//  LOGO GLTF + MATERIAL HOLOGRÁFICO
// ══════════════════════════════════════════
export const holographicMaterial = new THREE.MeshPhysicalMaterial({
    color:                     0xffffff,
    metalness:                 0.0,
    roughness:                 0.02,

    transmission:              0.87,
    thickness:                 1.2,
    ior:                       1.5,

    clearcoat:                 1.0,
    clearcoatRoughness:        0.0,

    iridescence:               1.0,
    iridescenceIOR:            1.3,
    iridescenceThicknessRange: [150, 600],

    reflectivity:              1.0,
    envMapIntensity:           2.0,
});

const loader = new GLTFLoader();
loader.load(
    'assets/models/logo2.gltf',
    (gltf) => {
        const model  = gltf.scene;
        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        model.traverse(child => { if (child.isMesh) child.material = holographicMaterial; });
        model.scale.set(500, 500, 500);
        centerGroup.add(model);
    },
    undefined,
    (err) => {
        console.error('Error cargando logo2.gltf, usando fallback', err);
        centerGroup.add(new THREE.Mesh(new THREE.IcosahedronGeometry(4, 1), holographicMaterial));
    }
);

// ══════════════════════════════════════════
//  NODOS ORBITALES
// ══════════════════════════════════════════
export const nodes     = [];
const numNodes         = CONFIG.labels.length;
const angleStep        = (Math.PI * 2) / numNodes;
const labelsContainer  = document.getElementById('labels-container');

for (let i = 0; i < numNodes; i++) {
    const angle     = CONFIG.orbitStartAngle + i * angleStep;
    const nodeGroup = new THREE.Group();

    const identityColor = new THREE.Color(CONFIG.colors.nodes[i]);
    const neutralColor  = new THREE.Color(CONFIG.colors.neutral);
    const currentColor  = neutralColor.clone();

    const s = CONFIG.nodeScales[i];
    nodeGroup.scale.set(s, s, s);

    // ── Plasma core ──
    const coreUniforms = {
        uTime:  { value: 0.0 },
        uColor: { value: currentColor }
    };
    const coreMesh = new THREE.Mesh(
        new THREE.SphereGeometry(CONFIG.nodeSize * 0.6, 64, 64),
        new THREE.ShaderMaterial({
            vertexShader:   nodeVertexShader,
            fragmentShader: nodeFragmentShader,
            uniforms:       coreUniforms,
            transparent:    true
        })
    );
    coreMesh.userData = { uniforms: coreUniforms };
    coreMesh.scale.setScalar(0.07);
    nodeGroup.add(coreMesh);

    // ── Base ring — ADN compartido, igual en todos los nodos ──
    const shellMat = new THREE.MeshBasicMaterial({
        color:      currentColor,
        transparent: true,
        opacity:    0.08,
        depthWrite: false,
        blending:   THREE.NormalBlending,
        side:       THREE.DoubleSide
    });
    const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(CONFIG.nodeSize * 1.15, CONFIG.nodeSize * 0.007, 16, 80),
        shellMat
    );
    baseRing.rotation.x = Math.PI / 2; // horizontal — plano XZ
    nodeGroup.add(baseRing);

    // ── Geometría única por nodo ──
    const uniqueMat = new THREE.MeshBasicMaterial({
        color:      currentColor,
        wireframe:  true,
        transparent: true,
        opacity:    0.04,
        depthWrite: false,
        blending:   THREE.NormalBlending
    });
    const uniqueGroup = new THREE.Group();
    nodeGroup.add(uniqueGroup);

    let updateGeometry;
    const speedRef = { v: 1.0 }; // GSAP tweenea este valor en hover → spike + decay

    if (i === 0) {
        // WORK — clockwork de precisión
        // 5 anillos horizontales contrarrotantes (velocidad escalonada) +
        // 2 marcos verticales que giran en sentidos opuestos.
        // Referencia: orrery / mecanismo de relojería visto desde arriba.
        const workRings = [];

        // Plano horizontal (XZ) — alternando CW / CCW, radio y grosor crecientes
        [
            [0.28, 0.016, 0.012,  1],
            [0.44, 0.014, 0.009, -1],
            [0.60, 0.013, 0.007,  1],
            [0.76, 0.011, 0.005, -1],
            [0.94, 0.009, 0.003,  1],
        ].forEach(([r, tube, speed, dir]) => {
            const mesh = new THREE.Mesh(
                new THREE.TorusGeometry(CONFIG.nodeSize * r, CONFIG.nodeSize * tube, 8, 56),
                uniqueMat
            );
            mesh.rotation.x = Math.PI / 2;
            uniqueGroup.add(mesh);
            workRings.push({ mesh, speedZ: speed * dir });
        });

        // Marcos verticales — el "bastidor" del mecanismo
        [[0, 0.004], [Math.PI / 2, -0.003]].forEach(([ry, speed]) => {
            const mesh = new THREE.Mesh(
                new THREE.TorusGeometry(CONFIG.nodeSize * 1.05, CONFIG.nodeSize * 0.008, 8, 64),
                uniqueMat
            );
            mesh.rotation.y = ry;
            uniqueGroup.add(mesh);
            workRings.push({ mesh, speedY: speed });
        });

        updateGeometry = (time) => {
            const s = speedRef.v;
            workRings.forEach(({ mesh, speedZ, speedY }) => {
                if (speedZ !== undefined) mesh.rotation.z += speedZ * s;
                if (speedY !== undefined) mesh.rotation.y += speedY * s;
            });
            uniqueGroup.rotation.y  = Math.sin(time * 0.10) * 0.35;
            baseRing.rotation.z    += 0.001 * s;
        };

    } else if (i === 1) {
        // THOUGHTS — ondas de pensamiento con pulsación de escala
        // 6 anillos de radio creciente, cada uno con su fase de pulsación propia.
        // Como ondas cerebrales: nunca dos en el mismo estado al mismo tiempo.
        const tRings = [];
        const numT   = 6;

        for (let j = 0; j < numT; j++) {
            const t    = j / (numT - 1);
            const r    = CONFIG.nodeSize * (0.28 + t * 0.80);
            const mesh = new THREE.Mesh(
                new THREE.TorusGeometry(r, CONFIG.nodeSize * 0.014, 8, 48),
                uniqueMat
            );
            // Inclinaciones orgánicas — no simétricas, como ideas sin orden
            mesh.rotation.z = j * (Math.PI / numT) + Math.PI / 9;
            mesh.rotation.x = Math.sin(j * 1.5) * 0.55;
            uniqueGroup.add(mesh);
            tRings.push({
                mesh,
                phase: j * (Math.PI * 2 / numT),
                speed: (0.004 + j * 0.0007) * (j % 2 === 0 ? 1 : -0.75)
            });
        }

        updateGeometry = (time) => {
            const s = speedRef.v;
            tRings.forEach(({ mesh, phase, speed }) => {
                mesh.rotation.y += speed * s;
                const pulse = 1.0 + Math.sin(time * 0.85 + phase) * 0.07;
                mesh.scale.setScalar(pulse);
            });
            uniqueGroup.rotation.x = Math.sin(time * 0.20) * 0.22;
            uniqueGroup.rotation.z = Math.cos(time * 0.15) * 0.14;
            baseRing.rotation.z   += 0.001 * s;
        };

    } else if (i === 2) {
        // EXPERIMENTS — knot (3,5) + corona de 3 anillos que precesan
        // El knot (3,5) tiene más cruces y topología más compleja que el (2,3).
        // Los 3 anillos orbitales añaden un segundo plano de movimiento caótico.
        const knot = new THREE.Mesh(
            new THREE.TorusKnotGeometry(CONFIG.nodeSize * 0.44, CONFIG.nodeSize * 0.022, 160, 8, 3, 5),
            uniqueMat
        );
        uniqueGroup.add(knot);

        // 3 anillos orbitando en planos muy distintos — caos estructurado
        const expOrbit = [
            [0.82,  0,              0,           0.008, 'z'],
            [0.86,  Math.PI / 3,    0,          -0.007, 'z'],
            [0.80,  2 * Math.PI/3,  Math.PI/4,   0.009, 'y'],
        ].map(([r, rx, ry, speed, axis]) => {
            const mesh = new THREE.Mesh(
                new THREE.TorusGeometry(CONFIG.nodeSize * r, CONFIG.nodeSize * 0.010, 8, 48),
                uniqueMat
            );
            mesh.rotation.x = rx;
            mesh.rotation.y = ry;
            uniqueGroup.add(mesh);
            return { mesh, speed, axis };
        });

        updateGeometry = (time) => {
            const s = speedRef.v;
            knot.rotation.x += 0.005 * s;
            knot.rotation.y += 0.009 * s;
            knot.rotation.z += 0.003 * s;
            expOrbit.forEach(({ mesh, speed, axis }) => {
                mesh.rotation[axis] += speed * s;
            });
            uniqueGroup.rotation.y += 0.004 * s;
            uniqueGroup.rotation.x  = Math.sin(time * 0.28) * 0.18;
            baseRing.rotation.z    += 0.002 * s;
        };

    } else if (i === 3) {
        // SYSTEMS — esfera armilar completa
        // 4 anillos exteriores en meridianos (0°, 60°, 120° + ecuador) +
        // 2 anillos interiores en órbitas inclinadas + 1 anillo central rápido.
        // Referencia: orrery de latón con sistema de levitación magnética.
        const sysRings = [];

        // Anillos exteriores — meridianos y ecuador
        [
            [Math.PI / 2, 0,              0.92, 0.003,  'z'],   // ecuador
            [0,           0,              0.92, 0.004,  'y'],   // meridiano 0°
            [0,           Math.PI / 3,    0.92, -0.004, 'y'],   // meridiano 60°
            [0,           2 * Math.PI/3,  0.92, 0.004,  'y'],   // meridiano 120°
        ].forEach(([rx, ry, r, speed, axis]) => {
            const mesh = new THREE.Mesh(
                new THREE.TorusGeometry(CONFIG.nodeSize * r, CONFIG.nodeSize * 0.010, 8, 64),
                uniqueMat
            );
            mesh.rotation.x = rx;
            mesh.rotation.y = ry;
            uniqueGroup.add(mesh);
            sysRings.push({ mesh, speed, axis });
        });

        // Anillos interiores — órbitas inclinadas (como bandas eclípticas)
        [
            [Math.PI / 2 + Math.PI / 6,  0.62, -0.008, 'z'],
            [Math.PI / 2 - Math.PI / 6,  0.72,  0.006, 'z'],
        ].forEach(([rx, r, speed, axis]) => {
            const mesh = new THREE.Mesh(
                new THREE.TorusGeometry(CONFIG.nodeSize * r, CONFIG.nodeSize * 0.013, 8, 48),
                uniqueMat
            );
            mesh.rotation.x = rx;
            uniqueGroup.add(mesh);
            sysRings.push({ mesh, speed, axis });
        });

        // Anillo central — el "sol" del sistema, gira rápido
        const innerRing = new THREE.Mesh(
            new THREE.TorusGeometry(CONFIG.nodeSize * 0.32, CONFIG.nodeSize * 0.016, 8, 32),
            uniqueMat
        );
        innerRing.rotation.x = Math.PI / 4;
        uniqueGroup.add(innerRing);
        sysRings.push({ mesh: innerRing, speed: 0.016, axis: 'y' });

        updateGeometry = (time) => {
            const s = speedRef.v;
            sysRings.forEach(({ mesh, speed, axis }) => {
                mesh.rotation[axis] += speed * s;
            });
            uniqueGroup.rotation.y += 0.002 * s;
            uniqueGroup.rotation.x  = Math.sin(time * 0.08) * 0.10;
            baseRing.rotation.z    += 0.001 * s;
        };

    } else if (i === 4) {
        // INFO — giroscopio de anillos escalonados
        // Anillos de radio creciente, cada uno con inclinación y velocidad propias.
        // Los anillos pequeños giran más rápido → desfase natural →
        // loop periódico: disco plano (alineados) ↔ esfera caótica (dispersos).
        const numInfoRings = 9;
        const infoRings = [];

        for (let j = 0; j < numInfoRings; j++) {
            const t    = j / (numInfoRings - 1);                        // 0 → 1
            const r    = CONFIG.nodeSize * (0.18 + t * 1.05);           // radio creciente

            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(r, CONFIG.nodeSize * 0.013, 8, 64),
                uniqueMat
            );

            // Inclinación inicial distribuida entre 0 y π en Z,
            // más una ligera variación senoidal en X → ningún par de anillos
            // arranca en el mismo plano, garantizando el caos inicial
            ring.rotation.z = (j / numInfoRings) * Math.PI;
            ring.rotation.x = Math.sin((j / numInfoRings) * Math.PI) * 0.45;

            uniqueGroup.add(ring);

            // Velocidad inversa al radio — interior rápido, exterior lento
            // (como planetas en órbita: período ∝ radio)
            const speed = 0.013 - t * 0.008;  // 0.013 (inner) → 0.005 (outer)
            infoRings.push({ mesh: ring, speed });
        }

        updateGeometry = (time) => {
            const s = speedRef.v;
            infoRings.forEach(({ mesh, speed }) => {
                mesh.rotation.y += speed * s;
            });
            uniqueGroup.rotation.x = Math.sin(time * 0.13) * 0.28;
            uniqueGroup.rotation.z = Math.cos(time * 0.09) * 0.20;
            baseRing.rotation.z   += 0.0015 * s;
        };
    }

    // ── Hitbox invisible para raycaster ──
    const hitMesh = new THREE.Mesh(
        new THREE.SphereGeometry(CONFIG.nodeSize * 1.5, 16, 16),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    nodeGroup.add(hitMesh);

    nodeGroup.position.x = Math.cos(angle) * CONFIG.orbitRadius;
    nodeGroup.position.z = Math.sin(angle) * CONFIG.orbitRadius;
    nodeGroup.position.y = CONFIG.nodeYOffsets[i];

    hitMesh.userData = {
        isNode:         true,
        id:             i,
        name:           CONFIG.labels[i],
        angle,
        parentGroup:    nodeGroup,
        coreMesh,
        shellMat,
        uniqueMat,
        updateGeometry,
        speedRef,
        identityColor,
        neutralColor,
        currentColor
    };

    orbitGroup.add(nodeGroup);
    nodes.push(hitMesh);

    // HTML label pill
    const label       = document.createElement('div');
    label.className   = 'node-label visible';
    label.textContent = hitMesh.userData.name;
    label.id          = `label-${i}`;
    label.dataset.key = hitMesh.userData.name;
    labelsContainer.appendChild(label);
    hitMesh.userData.labelEl = label;
}

// ══════════════════════════════════════════
//  LAYER 1 — MACRO DUST (bokeh)
// ══════════════════════════════════════════
const macroDustCount  = 10000;
const macroDustPos    = new Float32Array(macroDustCount * 3);
const macroDustColors = new Float32Array(macroDustCount * 3);
const macroDustSizes  = new Float32Array(macroDustCount);

for (let i = 0; i < macroDustCount; i++) {
    const theta = Math.random() * 2.0 * Math.PI;
    const phi   = Math.acos(2.0 * Math.random() - 1.0);
    const r     = 25.0 + Math.pow(Math.random(), 1.5) * 180;
    macroDustPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    macroDustPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    macroDustPos[i*3+2] = r * Math.cos(phi);

    const c   = new THREE.Color();
    const rnd = Math.random();
    if      (rnd > 0.90) c.setHex(0xffddaa);
    else if (rnd > 0.85) c.setHex(0xddeeff);
    else                 c.setHex(0xffffff);
    macroDustColors[i*3]   = c.r;
    macroDustColors[i*3+1] = c.g;
    macroDustColors[i*3+2] = c.b;

    macroDustSizes[i] = Math.random() > 0.95
        ? (Math.random() * 15.0 + 5.0)
        : (Math.random() * 2.0  + 0.5);
}

const macroDustGeo = new THREE.BufferGeometry();
macroDustGeo.setAttribute('position', new THREE.BufferAttribute(macroDustPos,    3));
macroDustGeo.setAttribute('aColor',   new THREE.BufferAttribute(macroDustColors, 3));
macroDustGeo.setAttribute('aSize',    new THREE.BufferAttribute(macroDustSizes,  1));

export const macroUniforms = {
    uTime:       { value: 0.0 },
    uSpeed:      { value: 0.05 },
    uFreq:       { value: 0.02 },
    uAmp:        { value: 8.0  },
    uAlphaMult:  { value: 0.08 },
    uMouse:      { value: new THREE.Vector2(0, 0) },
    uAspect:     { value: window.innerWidth / window.innerHeight },
    uMouseForce: { value: 0.0  },
    uLogoPos:    { value: new THREE.Vector2(0, 0) },
    uLogoForce:  { value: 0.0  },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
};

export const macroDustSystem = new THREE.Points(
    macroDustGeo,
    new THREE.ShaderMaterial({
        vertexShader:   particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms:       macroUniforms,
        transparent:    true,
        depthWrite:     false,
        blending:       THREE.AdditiveBlending
    })
);
universeGroup.add(macroDustSystem);

// ══════════════════════════════════════════
//  LAYER 2 — MICRO DUST (ambient)
// ══════════════════════════════════════════
const microDustCount  = 30000;
const microDustPos    = new Float32Array(microDustCount * 3);
const microDustColors = new Float32Array(microDustCount * 3);
const microDustSizes  = new Float32Array(microDustCount);

for (let i = 0; i < microDustCount; i++) {
    const theta = Math.random() * 2.0 * Math.PI;
    const phi   = Math.acos(2.0 * Math.random() - 1.0);
    const r     = 35.0 + Math.sqrt(Math.random()) * 85.0;
    microDustPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    microDustPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    microDustPos[i*3+2] = r * Math.cos(phi);

    const c = new THREE.Color(0xffffff);
    if (Math.random() > 0.95) c.setHex(0xbbffff);
    microDustColors[i*3]   = c.r;
    microDustColors[i*3+1] = c.g;
    microDustColors[i*3+2] = c.b;

    microDustSizes[i] = (Math.random() * 3.2 + 1.3);
}

const microDustGeo = new THREE.BufferGeometry();
microDustGeo.setAttribute('position', new THREE.BufferAttribute(microDustPos,    3));
microDustGeo.setAttribute('aColor',   new THREE.BufferAttribute(microDustColors, 3));
microDustGeo.setAttribute('aSize',    new THREE.BufferAttribute(microDustSizes,  1));

export const microUniforms = {
    uTime:       { value: 0.0  },
    uSpeed:      { value: 0.015 },
    uFreq:       { value: 0.05  },
    uAmp:        { value: 1.5   },
    uAlphaMult:  { value: 0.65 },
    uMouse:      { value: new THREE.Vector2(0, 0) },
    uAspect:     { value: window.innerWidth / window.innerHeight },
    uMouseForce: { value: 0.15  },
    uLogoPos:    { value: new THREE.Vector2(0, 0) },
    uLogoForce:  { value: 0.28  },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
};

export const microDustSystem = new THREE.Points(
    microDustGeo,
    new THREE.ShaderMaterial({
        vertexShader:   particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms:       microUniforms,
        transparent:    true,
        depthWrite:     false,
        blending:       THREE.AdditiveBlending
    })
);
universeGroup.add(microDustSystem);

// ══════════════════════════════════════════
//  NEBULA BILLBOARDS (atmospheric background)
//  Dos planos lejanos con FBM shader — teal dominante, amber como acento cálido.
//  Añadidos a scene directamente (no universeGroup) → fondo estático, sin órbita.
//  depthTest: false + renderOrder:-10 garantiza que rendericen detrás de todo.
// ══════════════════════════════════════════
export const nebulaPlanes = [];

const nebConfigs = [
        {
            pos: [-25, 12, -110],
            rot: [-0.12, 0.28, 0.05],
            opacity: 0.55,
            w: 200, h: 140
        },
        {
            pos: [35, -18, -155],
            rot: [0.08, -0.22, -0.03],
            opacity: 0.45,
            w: 240, h: 160
        }
];

nebConfigs.forEach(({ pos, rot, opacity, w, h }) => {
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTime:    { value: 0.0 },
                uColor1:  { value: new THREE.Color(0x4ab8e8) },  // teal brillante — aditivo requiere colores claros
                uColor2:  { value: new THREE.Color(0x263e49) },  // amber cálido brillante
                uOpacity: { value: opacity }
            },
            vertexShader:   NebulaShader.vertexShader,
            fragmentShader: NebulaShader.fragmentShader,
            transparent: true,
            depthWrite:  false,
            depthTest:   false,
            blending:    THREE.AdditiveBlending,  // aditivo: nunca puede oscurecer el fondo
            side:        THREE.DoubleSide
        });

        const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        plane.position.set(...pos);
        plane.rotation.set(...rot);
        plane.renderOrder = -10;
        // Callback de animación — llamado desde main.js animate() con elapsedTime
        plane.userData.update = (t) => { mat.uniforms.uTime.value = t; };
        scene.add(plane);
        nebulaPlanes.push(plane);
    });

// ══════════════════════════════════════════
//  LAYER 3 — STAR FIELD (reactivo)
//  Mismo shader que macro/micro dust — hereda mouse repulsion + logo force field.
//  Posicionado muy lejos (r:200-600), drift mínimo, reacción al mouse sutil.
//  Añadido a universeGroup → rota con la órbita igual que las otras capas.
// ══════════════════════════════════════════
const starCount    = 3000;
const starPos      = new Float32Array(starCount * 3);
const starColors   = new Float32Array(starCount * 3);
const starSizes    = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * 2.0 * Math.PI;
    const phi   = Math.acos(2.0 * Math.random() - 1.0);
    const r     = 200.0 + Math.pow(Math.random(), 0.8) * 400.0; // r: 200–600
    starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i*3+2] = r * Math.cos(phi);

    // 98% blanco puro, 2% tinte cyan frío
    const c = new THREE.Color();
    c.setHex(Math.random() > 0.98 ? 0xbbddff : 0xffffff);
    starColors[i*3]   = c.r;
    starColors[i*3+1] = c.g;
    starColors[i*3+2] = c.b;

    // Mayoritariamente pequeñas — 5% son ligeramente más grandes (estrellas destacadas)
    starSizes[i] = Math.random() > 0.95
        ? Math.random() * 2.5 + 1.5   // 1.5–4.0 px
        : Math.random() * 0.8 + 0.2;  // 0.2–1.0 px
}

const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,    3));
starGeo.setAttribute('aColor',   new THREE.BufferAttribute(starColors, 3));
starGeo.setAttribute('aSize',    new THREE.BufferAttribute(starSizes,  1));

export const starUniforms = {
    uTime:       { value: 0.0   },
    uSpeed:      { value: 0.008 },  // casi estáticas — son lejanas
    uFreq:       { value: 0.005 },  // drift muy lento
    uAmp:        { value: 1.0   },  // desplazamiento mínimo
    uAlphaMult:  { value: 0.06  },  // muy tenues — fondo, no protagonistas
    uMouse:      { value: new THREE.Vector2(0, 0) },
    uAspect:     { value: window.innerWidth / window.innerHeight },
    uMouseForce: { value: 0.04  },  // reacción sutil — están lejos
    uLogoPos:    { value: new THREE.Vector2(0, 0) },
    uLogoForce:  { value: 0.03  },  // campo del logo apenas perceptible a esta distancia
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
};

export const starSystem = new THREE.Points(
    starGeo,
    new THREE.ShaderMaterial({
        vertexShader:   particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms:       starUniforms,
        transparent:    true,
        depthWrite:     false,
        blending:       THREE.AdditiveBlending
    })
);
universeGroup.add(starSystem);

// ── Layer B: bright stars with diffraction spike ──
export let brightStars = null;

{
    // 12 posiciones — todas con z negativo (en frente de la cámara en z=58)
    // z positivo grande = detrás de la cámara → clipped por near plane
    const bPositions = new Float32Array([
         180,  55, -220,
        -230,  30, -150,
         140, -70, -180,
        -150,  90, -130,
         260,  15, -120,
        -190, -50, -200,
         110, 110, -260,
        -270,  40, -110,
         210, -85, -190,
        -120,  65, -310,
         320,   8, -160,
        -170, -75, -250
    ]);

    const bGeo = new THREE.BufferGeometry();
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPositions, 3));

    brightStars = new THREE.Points(bGeo, new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
            void main() {
                vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
                gl_Position  = projectionMatrix * mvPos;
                gl_PointSize = 10.0;
            }
        `,
        fragmentShader: `
            void main() {
                vec2  uv   = gl_PointCoord - 0.5;
                float dist = length(uv);

                // Núcleo brillante
                float core = 1.0 - smoothstep(0.0, 0.08, dist);

                // Spikes de difracción — horizontal y vertical
                float spikeH = exp(-abs(uv.y) * 80.0) * exp(-abs(uv.x) * 3.0) * 0.6;
                float spikeV = exp(-abs(uv.x) * 80.0) * exp(-abs(uv.y) * 3.0) * 0.6;

                float brightness = core + spikeH + spikeV;
                gl_FragColor = vec4(1.0, 1.0, 1.0, clamp(brightness, 0.0, 1.0));
            }
        `,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending
    }));
    brightStars.renderOrder = -8;
    scene.add(brightStars);
}
