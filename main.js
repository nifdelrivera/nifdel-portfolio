// ══════════════════════════════════════════
//  MAIN — entry point: estado, eventos, loop
// ══════════════════════════════════════════
import * as THREE from 'three';
import { CONFIG, ANGLE_STEP } from './config.js';
import { camera, renderer, composer, grainPass, zoomBlurPass, cameraGroup, bloomPass,
         bgRaysPass, godRaysPass, chromaPass, eventHorizonPass, vignetteChromaPass } from './scene.js';
import { nodes, orbitGroup, centerGroup, holographicMaterial,
         macroUniforms, microUniforms, starUniforms,
         macroDustSystem, microDustSystem, starSystem,
         nebulaPlanes, brightStars } from './world.js';

// ══════════════════════════════════════════
//  APP STATE
// ══════════════════════════════════════════
let targetOrbitRotation = 0;
let isInsideNode        = false;
let isCinematicReady    = false;
let hoveredNode         = null;
let lastTargetPos       = new THREE.Vector3();
let isAnimatingSnap     = false;
// LookAt persistente — se interpola suavemente en carousel mode
let currentLookAt       = new THREE.Vector3();
let lastClosestNode     = null;  // para detectar cambio de nodo en carousel
let divingToNode        = null;  // nodo objetivo durante el camera dive
let bloomTarget         = 0.8;   // bloom base
let _bloomTimer         = null;
window._zoomBlur        = zoomBlurPass; // expuesto para transitions externas
let particleScrollVel   = 0;     // velocidad de scroll → parallax rotacional en dust

let macroDustRotY       = 0;     // rotación Y acumulada del macro dust (scroll)
let microDustRotY       = 0;     // rotación Y acumulada del micro dust (scroll)

// ── Variables reutilizables fuera del loop (evitar GC jank) ──
const _lightVec = new THREE.Vector3();  // para tracking de god rays
let   _prevCamZ = CONFIG.cameraOrbitZ; // para calcular velocidad de cámara → chroma

// ══════════════════════════════════════════
//  MOUSE
// ══════════════════════════════════════════
const mouse = new THREE.Vector2();
// UV (0-1, y flipped) para EventHorizonShader y raycaster screen-space
const mouseUV     = new THREE.Vector2(0.5, 0.5);
const mouseUVPrev = new THREE.Vector2(0.5, 0.5);
const mouseVel    = new THREE.Vector2(0.0, 0.0);

window.addEventListener('mousemove', (e) => {
    mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseUV.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
});

// ══════════════════════════════════════════
//  SCROLL → ORBIT ROTATION
//  (Ajuste 3: independiente del panel — si el scroll
//   ocurre sobre el panel, deja que el browser lo maneje)
// ══════════════════════════════════════════
window.addEventListener('wheel', (e) => {
    // Si el panel está abierto y el cursor está sobre él, no orbitamos
    const panel = document.getElementById('panel');
    if (panel && panel.classList.contains('open')) {
        const rect = panel.getBoundingClientRect();
        if (e.clientX >= rect.left) return;
    }

    if (isInsideNode) {
        // Carousel discreto cuando la cámara está dentro
        if (isAnimatingSnap) return;
        isAnimatingSnap = true;
        targetOrbitRotation += Math.sign(e.deltaY) * ANGLE_STEP;
        setTimeout(() => { isAnimatingSnap = false; }, 800);

        // Motion blur cinematográfico seguro (WebGL):
        // Elimina el CSS scale() que provocaba el "bounce" indeseado en la cámara
        zoomBlurPass.uniforms.uStrength.value = 0.45;
        gsap.to(zoomBlurPass.uniforms.uStrength, {
            value: 0.0,
            duration: 0.8,
            ease: "power2.out"
        });

        clearTimeout(_bloomTimer);
        bloomTarget = 2.8;
        _bloomTimer = setTimeout(() => {
            bloomTarget = 0.8;
        }, 120);
    } else {
        targetOrbitRotation += e.deltaY * CONFIG.scrollSpeed;
        // Impulso de profundidad — macro dust se mueve más que micro (parallax)
        particleScrollVel   += e.deltaY * 0.28;
    }
});

// ══════════════════════════════════════════
//  CLICK → ENTER NODE  /  CERRAR PANEL
//  (Ajuste 4: click en canvas estando dentro = cierra panel)
// ══════════════════════════════════════════
window.addEventListener('click', (e) => {
    // Ajuste 4: si la cámara ya está dentro de un nodo y hay panel abierto,
    // un click en el canvas (fuera del panel) lo cierra y vuelve a órbita
    if (isInsideNode) {
        const panel   = document.getElementById('panel');
        const topNav  = document.getElementById('top-nav');
        const sideNav = document.getElementById('side-nav');
        if (window.activeKey && typeof window.closePanel === 'function') {
            const inPanel   = panel   && panel.contains(e.target);
            const inTopNav  = topNav  && topNav.contains(e.target);
            const inSideNav = sideNav && sideNav.contains(e.target);
            if (!inPanel && !inTopNav && !inSideNav) window.closePanel();
        }
        return;
    }
    if (!hoveredNode) return;
    enterNode(hoveredNode);
});

// ══════════════════════════════════════════
//  ENTER NODE — camera dive
// ══════════════════════════════════════════
function enterNode(hitMesh) {
    isInsideNode     = true;
    isCinematicReady = false;
    divingToNode     = hitMesh;

    nodes.forEach(n => n.userData.labelEl.classList.add('fade-out'));

    const targetPos = new THREE.Vector3();
    hitMesh.userData.parentGroup.getWorldPosition(targetPos);
    lastTargetPos.copy(targetPos);

    const dir            = targetPos.clone().normalize();
    const cameraStopPos  = targetPos.clone().add(dir.multiplyScalar(CONFIG.nodeSize + 2));

    // Encuadre cinematográfico — desplaza el lookAt lateralmente para que
    // el nodo quede en el tercio izquierdo (panel abre a la derecha).
    // El vector "right" es perpendicular a la dirección cámara→nodo en el plano XZ.
    const camDir   = targetPos.clone().sub(cameraStopPos).normalize();
    const worldUp  = new THREE.Vector3(0, 1, 0);
    const rightVec = new THREE.Vector3().crossVectors(camDir, worldUp).normalize();
    const framedLookAt = targetPos.clone().add(rightVec.multiplyScalar(3));

    // Neutralizar parallax durante el vuelo
    gsap.to(cameraGroup.position, { x: 0, y: 0, z: 0, duration: 1.0, ease: 'power2.out' });

    // Chroma spike al inicio del dive — se calma al llegar
    if (chromaPass) {
        gsap.to(chromaPass.uniforms.uIntensity, { value: 0.016, duration: 0.35, ease: 'power2.in' });
    }

    // Volar cámara al nodo
    gsap.to(camera.position, {
        x: cameraStopPos.x,
        y: cameraStopPos.y,
        z: cameraStopPos.z,
        duration: CONFIG.diveDuration,
        ease: 'power3.inOut'
    });

    // Animar lookAt hacia el punto encuadrado (nodo desplazado lateralmente)
    const dummyLookAt = new THREE.Vector3(0, 0, 0);
    gsap.to(dummyLookAt, {
        x: framedLookAt.x,
        y: framedLookAt.y,
        z: framedLookAt.z,
        duration: CONFIG.diveDuration,
        ease: 'power3.inOut',
        onUpdate:   () => { camera.lookAt(dummyLookAt); },
        onComplete: () => {
            isCinematicReady = true;
            currentLookAt.copy(framedLookAt);
            if (chromaPass) {
                gsap.to(chromaPass.uniforms.uIntensity, { value: 0.001, duration: 1.4, ease: 'power3.out' });
            }
            if (typeof window.onNodeEntered === 'function')
                window.onNodeEntered(hitMesh.userData.name);
        }
    });
}

// ══════════════════════════════════════════
//  RESTORE NODE BY KEY — llamado al volver con browser back
//  Posiciona la cámara instantáneamente (sin animación) y abre el panel.
//  El usuario ya estaba ahí — no necesita el dive de nuevo.
// ══════════════════════════════════════════
window.restoreNodeByKey = function(key) {
    const hitMesh = nodes.find(n => n.userData.name === key);
    if (!hitMesh) return;

    isInsideNode     = true;
    isCinematicReady = true;
    divingToNode     = hitMesh;

    nodes.forEach(n => n.userData.labelEl.classList.add('fade-out'));

    const targetPos = new THREE.Vector3();
    hitMesh.userData.parentGroup.getWorldPosition(targetPos);
    lastTargetPos.copy(targetPos);

    const dir           = targetPos.clone().normalize();
    const cameraStopPos = targetPos.clone().add(dir.multiplyScalar(CONFIG.nodeSize + 2));

    // Calcular encuadre cinematográfico (mismo que enterNode)
    const camDir2   = targetPos.clone().sub(cameraStopPos).normalize();
    const rightVec2 = new THREE.Vector3().crossVectors(camDir2, new THREE.Vector3(0,1,0)).normalize();
    const framedLookAt2 = targetPos.clone().add(rightVec2.multiplyScalar(3));

    // Posicionar y mirar instantáneamente — sin GSAP
    camera.position.copy(cameraStopPos);
    camera.lookAt(framedLookAt2);
    currentLookAt.copy(framedLookAt2);

    // Abrir panel directamente
    if (typeof window.onNodeEntered === 'function')
        window.onNodeEntered(key);
};

// ══════════════════════════════════════════
//  RETURN TO ORBIT — llamado por navigation.js
//  cuando el usuario cierra un panel
// ══════════════════════════════════════════
window.returnToOrbit = function() {
    isCinematicReady  = false;
    lastClosestNode   = null;
    divingToNode      = null;
    nodes.forEach(n => n.userData.labelEl.classList.add('fade-out'));

    // Neutralizar parallax
    gsap.to(cameraGroup.position, { x: 0, y: 0, z: 0, duration: 1.0, ease: 'power2.out' });

    gsap.to(camera.position, {
        x: 0, y: CONFIG.cameraOrbitY, z: CONFIG.cameraOrbitZ,
        duration: 2.0, ease: 'power3.inOut'
    });

    const dummyLookAt = lastTargetPos.clone();
    gsap.to(dummyLookAt, {
        x: 0, y: 0, z: 0,
        duration: 2.0,
        ease: 'power3.inOut',
        onUpdate:   () => { camera.lookAt(dummyLookAt); },
        onComplete: () => {
            camera.lookAt(0, 0, 0);
            isInsideNode = false;
            nodes.forEach(n => n.userData.labelEl.classList.remove('fade-out'));
        }
    });
};

// ══════════════════════════════════════════
//  ANIMATION LOOP
// ══════════════════════════════════════════
const raycaster = new THREE.Raycaster();
const clock     = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Uniforms de tiempo
    macroUniforms.uTime.value = time;
    microUniforms.uTime.value = time;
    starUniforms.uTime.value  = time;
    microUniforms.uMouse.value.copy(mouse);
    starUniforms.uMouse.value.copy(mouse);
    if (grainPass) grainPass.uniforms.uTime.value = time;

    // Event Horizon — velocidad del mouse + posición UV
    if (eventHorizonPass) {
        mouseVel.subVectors(mouseUV, mouseUVPrev).multiplyScalar(60); // normalizar a ~pixels/s independiente de FPS
        mouseUVPrev.copy(mouseUV);
        const spd = mouseVel.length();
        eventHorizonPass.uniforms.uMousePos.value.copy(mouseUV);
        eventHorizonPass.uniforms.uMouseVelocity.value.copy(mouseVel);
        eventHorizonPass.uniforms.uMouseSpeed.value = spd;
        eventHorizonPass.uniforms.uTime.value = time;
    }

    // Nebula drift — FBM necesita uTime actualizado cada frame
    nebulaPlanes.forEach(p => p.userData.update?.(time));

    // God Rays — proyectar el centro del logo a screen-space UV cada frame
    if (godRaysPass) {
        centerGroup.getWorldPosition(_lightVec);
        _lightVec.project(camera);
        godRaysPass.uniforms.uLightPos.value.set(
            (_lightVec.x + 1) * 0.5,
            (_lightVec.y + 1) * 0.5
        );
    }

    // Chromatic Aberration — intensidad proporcional a velocidad de cámara
    if (chromaPass) {
        const camVelocity = Math.abs(camera.position.z - _prevCamZ);
        const chromaTarget = 0.002 + camVelocity * 0.008;
        chromaPass.uniforms.uIntensity.value +=
            (chromaTarget - chromaPass.uniforms.uIntensity.value) * 0.06;
    }
    _prevCamZ = camera.position.z;

    // Bloom lerp — sube rápido en scroll, baja suave (cola de luz cinematográfica)
    const bSpeed = bloomTarget > bloomPass.strength ? 0.35 : 0.05;
    bloomPass.strength += (bloomTarget - bloomPass.strength) * bSpeed;

    // Proyectar logo al espacio de pantalla para el force-field de partículas
    const logoWorldPos = new THREE.Vector3();
    centerGroup.getWorldPosition(logoWorldPos);
    logoWorldPos.project(camera);
    microUniforms.uLogoPos.value.set(logoWorldPos.x, logoWorldPos.y);
    starUniforms.uLogoPos.value.set(logoWorldPos.x, logoWorldPos.y);

    // Rotación suave de la órbita (scroll)
    orbitGroup.rotation.y += (targetOrbitRotation - orbitGroup.rotation.y) * 0.05;

    // Parallax de cámara (solo en overview)
    if (!isInsideNode) {
        cameraGroup.position.x += (mouse.x *  3 - cameraGroup.position.x) * 0.05;
        cameraGroup.position.y += (mouse.y * -3 - cameraGroup.position.y) * 0.05;
    }

    // Animación del logo central
    centerGroup.position.y  = Math.sin(time * 1.2) * 1.5;
    centerGroup.rotation.y  = Math.sin(time * 0.5) * 0.25;
    centerGroup.rotation.x  = Math.sin(time * 0.7) * 0.10;
    centerGroup.rotation.z  = Math.cos(time * 0.4) * 0.05;

    // Parallax rotacional — scroll acelera cada capa a distinta velocidad
    // Macro (lejano) acumula más rotación, micro (cercano) menos → profundidad
    if (!isInsideNode) {
        particleScrollVel *= 0.90;
        macroDustRotY     += particleScrollVel * 0.00022;  // capa lejana — acumula más
        microDustRotY     += particleScrollVel * 0.00008;  // capa cercana — acumula menos
    }

    // Rotación del campo de partículas (base orbital + offset de scroll)
    macroDustSystem.rotation.y = time * 0.02  + macroDustRotY;
    microDustSystem.rotation.y = time * 0.01  + microDustRotY;
    microDustSystem.rotation.x = time * 0.005;
    starSystem.rotation.y      = time * 0.004; // muy lento — estrellas lejanas

    // ── RAYCASTING ──
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);
    document.body.style.cursor = 'none';

    // Nodo más cercano a la cámara (para cinematic title en carousel)
    let closestNode = null;
    let minDist     = Infinity;
    for (const hitMesh of nodes) {
        const tempV = new THREE.Vector3();
        hitMesh.userData.parentGroup.getWorldPosition(tempV);
        const d = camera.position.distanceTo(tempV);
        if (d < minDist) { minDist = d; closestNode = hitMesh; }
    }

    // ── CAROUSEL CAMERA TRACKING ──
    // En cinematic mode la cámara sigue con lerp al nodo más cercano
    // → los nodos con Y offset diferente no salen del encuadre al hacer scroll
    if (isInsideNode && isCinematicReady && closestNode) {
        const _closestPos = new THREE.Vector3();
        closestNode.userData.parentGroup.getWorldPosition(_closestPos);
        // Aplicar el mismo encuadre lateral que en enterNode:
        // el nodo queda en el tercio izquierdo mientras el panel ocupa la derecha
        const _carouselDir   = _closestPos.clone().sub(camera.position).normalize();
        const _carouselRight = new THREE.Vector3().crossVectors(_carouselDir, new THREE.Vector3(0,1,0)).normalize();
        const _carouselFramed = _closestPos.clone().add(_carouselRight.multiplyScalar(3));
        currentLookAt.lerp(_carouselFramed, 0.05);
        camera.lookAt(currentLookAt);

        // Detectar cambio de nodo activo → actualizar panel lateral
        if (closestNode !== lastClosestNode) {
            lastClosestNode = closestNode;
            const newKey = closestNode.userData.name;
            if (typeof window.updateCarouselPanel === 'function')
                window.updateCarouselPanel(newKey);
        }
    }

    // ── POR NODO: colores, opacidad, labels ──
    for (const hitMesh of nodes) {
        const nodeGroup = hitMesh.userData.parentGroup;

        // Actualizar uniforms del plasma core
        hitMesh.userData.coreMesh.userData.uniforms.uTime.value = time;

        // Color y opacidad — tres estados:
        // 1. Overview + hover   2. Overview sin hover   3. Carousel (isInsideNode)
        const isHovered  = hitMesh === hoveredNode;
        const isClosest  = hitMesh === closestNode;
        let targetColor, targetOpacity;

        if (isInsideNode && isCinematicReady) {
            // Carousel: nodo más cercano = brillante, resto = muy tenue (blur progresivo)
            targetColor   = isClosest ? hitMesh.userData.identityColor : hitMesh.userData.neutralColor;
            targetOpacity = isClosest ? 0.55 : 0.02;
        } else {
            // Overview normal
            targetColor   = isHovered ? hitMesh.userData.identityColor : hitMesh.userData.neutralColor;
            targetOpacity = isHovered ? 0.4 : 0.05;
        }

        if (isHovered) {
            hitMesh.userData.labelEl.classList.add('hovered');
            hitMesh.userData.labelEl.style.color = '#000000';
        } else {
            hitMesh.userData.labelEl.classList.remove('hovered');
            hitMesh.userData.labelEl.style.color = 'rgba(255,255,255,0.85)';
        }

        // Lerp de color y opacidad
        hitMesh.userData.currentColor.lerp(targetColor, 0.08);
        hitMesh.userData.shellMat.color.copy(hitMesh.userData.currentColor);
        hitMesh.userData.coreMesh.userData.uniforms.uColor.value.copy(hitMesh.userData.currentColor);
        hitMesh.userData.shellMat.opacity += (targetOpacity - hitMesh.userData.shellMat.opacity) * 0.1;

        const isDivingTarget = hitMesh === divingToNode;

        // Geometría única — color, opacidad y animación
        if (hitMesh.userData.uniqueMat) {
            const uTarget = isInsideNode && isCinematicReady
                ? (isClosest     ? 0.40 : 0.01)
                : isInsideNode && !isCinematicReady
                ? (isDivingTarget ? 0.40 : 0.01)
                : (isHovered      ? 0.22 : 0.04);
            hitMesh.userData.uniqueMat.color.copy(hitMesh.userData.currentColor);
            hitMesh.userData.uniqueMat.opacity += (uTarget - hitMesh.userData.uniqueMat.opacity) * 0.1;
        }
        if (hitMesh.userData.updateGeometry) hitMesh.userData.updateGeometry(time);

        // Escala del plasma core
        // hover → 20% del original · no-hover → 7% (casi un punto)
        // en carousel → closest = hover size, resto = no-hover
        const coreTargetScale = isInsideNode && isCinematicReady
            ? (isClosest     ? 0.45 : 0.07)   // carousel: activo grande, resto punto
            : isInsideNode && !isCinematicReady
            ? (isDivingTarget ? 0.45 : 0.07)  // dive: el nodo objetivo crece con la cámara
            : (isHovered      ? 0.30 : 0.07); // overview: hover visible, resto punto
        const cm = hitMesh.userData.coreMesh;
        const coreSpeed = coreTargetScale > cm.scale.x ? 0.10 : 0.06;
        const newCoreS = cm.scale.x + (coreTargetScale - cm.scale.x) * coreSpeed;
        cm.scale.setScalar(newCoreS);

        // ── LABEL POSITIONING (state machine) ──
        const nodeWorldPos = new THREE.Vector3();
        nodeGroup.getWorldPosition(nodeWorldPos);

        if (isInsideNode) {
            hitMesh.userData.labelEl.style.pointerEvents = 'none';

            if (isCinematicReady) {
                // Carousel: solo muestra el nodo más cercano como cinematic title
                if (hitMesh === closestNode) {
                    hitMesh.userData.labelEl.style.opacity = '';
                    hitMesh.userData.labelEl.classList.remove('fade-out', 'cinematic-hidden');
                    hitMesh.userData.labelEl.classList.add('cinematic-title');
                } else {
                    if (hitMesh.userData.labelEl.classList.contains('cinematic-title')) {
                        hitMesh.userData.labelEl.classList.remove('cinematic-title');
                        hitMesh.userData.labelEl.classList.add('cinematic-hidden');
                    }
                }
            } else {
                // Durante el vuelo: tracking 3D→2D mientras fade-out
                hitMesh.userData.labelEl.classList.remove('cinematic-title', 'cinematic-hidden');
                const tempV = nodeWorldPos.clone().project(camera);
                hitMesh.userData.labelEl.style.left = `${(tempV.x *  0.5 + 0.5) * window.innerWidth}px`;
                hitMesh.userData.labelEl.style.top  = `${(tempV.y * -0.5 + 0.5) * window.innerHeight - 85}px`;
            }
        } else {
            // Overview: labels normales siguiendo sus nodos
            hitMesh.userData.labelEl.style.opacity      = '';
            hitMesh.userData.labelEl.style.pointerEvents = 'auto';
            hitMesh.userData.labelEl.classList.remove('cinematic-title', 'cinematic-hidden');

            const tempV = nodeWorldPos.clone().project(camera);
            hitMesh.userData.labelEl.style.left = `${(tempV.x *  0.5 + 0.5) * window.innerWidth}px`;
            hitMesh.userData.labelEl.style.top  = `${(tempV.y * -0.5 + 0.5) * window.innerHeight - 85}px`;
        }
    }

    // Actualizar hover
    const prevHovered = hoveredNode;
    if (intersects.length > 0 && !isInsideNode) {
        hoveredNode = intersects[0].object;
        document.body.style.cursor = 'none';
    } else {
        hoveredNode = null;
    }

    // Notificar a navigation.js cuando cambia el nodo hovered
    if (hoveredNode !== prevHovered) {
        const key = hoveredNode ? hoveredNode.userData.name : null;
        if (typeof window.onNodeHovered === 'function') window.onNodeHovered(key);

        // Vignette chroma: sube en hover, vuelve a 1.0 al salir
        if (vignetteChromaPass) {
            gsap.to(vignetteChromaPass.uniforms.uIntensity, {
                value:    hoveredNode ? 2.2 : 1.0,
                duration: hoveredNode ? 0.4 : 0.6,
                ease:     hoveredNode ? 'power2.out' : 'power2.inOut'
            });
        }

        // ── Reset nodo anterior ──
        if (prevHovered) {
            const pd = prevHovered.userData;

            // Ring speed → normal
            if (pd.speedRef) {
                gsap.killTweensOf(pd.speedRef);
                gsap.to(pd.speedRef, { v: 1.0, duration: 0.8, ease: 'power2.out' });
            }
            // Scale → normal
            const pGroup = pd.parentGroup;
            if (pGroup) {
                gsap.killTweensOf(pGroup.scale);
                const ps = CONFIG.nodeScales[pd.id];
                gsap.to(pGroup.scale, { x: ps, y: ps, z: ps, duration: 0.6, ease: 'power2.out' });
            }
            // Core color → neutral
            if (pd.coreMesh?.userData?.uniforms?.uColor) {
                gsap.to(pd.coreMesh.userData.uniforms.uColor.value, {
                    r: pd.neutralColor.r, g: pd.neutralColor.g, b: pd.neutralColor.b,
                    duration: 0.6, ease: 'power2.out'
                });
            }
            // Shell opacity → normal
            if (pd.uniqueMat) {
                gsap.killTweensOf(pd.uniqueMat);
                gsap.to(pd.uniqueMat, { opacity: 0.04, duration: 0.6, ease: 'power2.out' });
            }
        }

        // ── Activar hover en nodo nuevo ──
        if (hoveredNode) {
            const hd = hoveredNode.userData;

            // 1. Ring speed spike → decay
            if (hd.speedRef) {
                gsap.killTweensOf(hd.speedRef);
                gsap.to(hd.speedRef, {
                    v: 5.0, duration: 0.25, ease: 'power3.out',
                    onComplete: () => {
                        gsap.to(hd.speedRef, { v: 1.0, duration: 1.2, ease: 'power2.inOut' });
                    }
                });
            }

            // 2. Scale micro-punch → settle
            const hGroup = hd.parentGroup;
            if (hGroup) {
                gsap.killTweensOf(hGroup.scale);
                const hs = CONFIG.nodeScales[hd.id];
                gsap.to(hGroup.scale, {
                    x: hs * 1.06, y: hs * 1.06, z: hs * 1.06,
                    duration: 0.2, ease: 'power3.out',
                    onComplete: () => {
                        gsap.to(hGroup.scale, { x: hs, y: hs, z: hs, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
                    }
                });
            }

            // 3. Core brightness → identity color spike → decay
            if (hd.coreMesh?.userData?.uniforms?.uColor) {
                gsap.to(hd.coreMesh.userData.uniforms.uColor.value, {
                    r: hd.identityColor.r, g: hd.identityColor.g, b: hd.identityColor.b,
                    duration: 0.2, ease: 'power3.out',
                    onComplete: () => {
                        gsap.to(hd.coreMesh.userData.uniforms.uColor.value, {
                            r: hd.neutralColor.r, g: hd.neutralColor.g, b: hd.neutralColor.b,
                            duration: 1.0, ease: 'power2.inOut'
                        });
                    }
                });
            }

            // 4. Shell opacity burst → decay
            if (hd.uniqueMat) {
                gsap.killTweensOf(hd.uniqueMat);
                gsap.to(hd.uniqueMat, {
                    opacity: 0.18, duration: 0.2, ease: 'power3.out',
                    onComplete: () => {
                        gsap.to(hd.uniqueMat, { opacity: 0.04, duration: 1.0, ease: 'power2.inOut' });
                    }
                });
            }
        }
    }

    // Spotlight hover — sigue al nodo hovered en overview
    if (hoveredNode && typeof window.updateFocusSpot === 'function') {
        const _spotPos = new THREE.Vector3();
        hoveredNode.userData.parentGroup.getWorldPosition(_spotPos);
        _spotPos.project(camera);
        window.updateFocusSpot(
            (_spotPos.x *  0.5 + 0.5) * window.innerWidth,
            (_spotPos.y * -0.5 + 0.5) * window.innerHeight
        );
    }

    // Depth-blur vignette — sigue al nodo activo en carousel
    if (isInsideNode && isCinematicReady && closestNode &&
        typeof window.updateDepthBlurSpot === 'function') {
        const _dbPos = new THREE.Vector3();
        closestNode.userData.parentGroup.getWorldPosition(_dbPos);
        _dbPos.project(camera);
        window.updateDepthBlurSpot(
            (_dbPos.x *  0.5 + 0.5) * window.innerWidth,
            (_dbPos.y * -0.5 + 0.5) * window.innerHeight
        );
    }

    // Logo absorbe el color del nodo hovered
    if (holographicMaterial?.attenuationColor) {
        const targetLogoColor = hoveredNode?.userData?.isNode
            ? hoveredNode.userData.identityColor
            : new THREE.Color(0xffffff);
        holographicMaterial.attenuationColor.lerp(targetLogoColor, 0.08);
    }

    composer.render();
}

// ══════════════════════════════════════════
//  RESIZE
// ══════════════════════════════════════════
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    macroUniforms.uAspect.value      = camera.aspect;
    microUniforms.uAspect.value      = camera.aspect;
    starUniforms.uAspect.value       = camera.aspect;
    if (eventHorizonPass)    eventHorizonPass.uniforms.uAspect.value    = camera.aspect;
    if (vignetteChromaPass)  vignetteChromaPass.uniforms.uAspect.value  = camera.aspect;
    const dpr = Math.min(window.devicePixelRatio, 2);
    macroUniforms.uPixelRatio.value  = dpr;
    microUniforms.uPixelRatio.value  = dpr;
    starUniforms.uPixelRatio.value   = dpr;
});

// ── START ──
animate();
