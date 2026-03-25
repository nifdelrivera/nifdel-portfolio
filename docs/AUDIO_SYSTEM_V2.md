# AUDIO SYSTEM V2 — Nifdel Rivera
> Navigation as sound synthesis

---

## 0. Premisa

Este no es un sistema de audio decorativo.

Es un sistema donde:

> la navegación = resolución musical

El sonido no acompaña la interfaz.  
El sonido ES la interfaz.

---

## 1. Idea Central

Un sistema de 5 notas distribuidas en un círculo.

Cada dominio del sitio corresponde a una nota dentro de un sistema cerrado.

No es música tradicional.  
Es una estructura sonora que evoluciona según la interacción.

---

## 2. Mapa Sonoro (Dominios → Notas)

```js
const DOMAIN_TONES = {
  WORK:        440.0,   // A
  THOUGHTS:    261.6,   // C
  SYSTEMS:     196.0,   // G
  EXPERIMENTS: 329.6,   // E
  INFO:        293.7    // D
};
Distribución conceptual:

Cada nota está equidistante en un círculo
No importa la teoría musical exacta
Importa la percepción espacial y relacional
3. Estados del Sistema
3.1 — Estado 0: MAPA GENERAL (Caos coherente)

Descripción:

Todo abierto
Señal no definida
Potencial sin resolver

Características:

Drone activo (todas las capas)
Detune leve (±10–20 cents)
Filtro bajo (400–800hz)
Reverb alta
Stereo abierto

Resultado:

Ambiente difuso
Sensación cósmica
No hay identidad clara
3.2 — Estado 1: INTERACCIÓN (Deformación)

Trigger:

Hover sobre nodo

Comportamiento:

onHover(key):
  ↑ volumen parcial de esa nota
  ↓ volumen de las demás
  ↑ claridad (filter cutoff)
  ↓ reverb

Resultado:

El caos empieza a “organizarse”
La nota del dominio emerge
Sistema sigue siendo inestable
3.3 — Estado 2: DOMINIO (Comprensión)

Trigger:

Enter node (WORK, THOUGHTS, etc.)

Comportamiento:

Lock en nota base del dominio
Introducción de intervalos (quinta / tercera)
Reducción de aleatoriedad
Filtro más abierto
setAudioMood(key)
→ ya implementado parcialmente vía filter cutoff

Resultado:

El sonido se entiende
Aparece identidad
Sistema coherente
3.4 — Estado 3: PROYECTO (Claridad total)

Trigger:

Entrar a proyecto específico

Comportamiento:

Estructura rítmica leve
Loop reconocible
Reducción de ruido
Identidad sonora clara

Variaciones por dominio:

WORK → más rítmico / sólido
THOUGHTS → más lento / espacial
SYSTEMS → más seco / mecánico
EXPERIMENTS → más caótico / glitch

Resultado:

Casi música
Sistema completamente resuelto
4. Variable Global: CLARITY
let clarity = 0;
// 0 → caos
// 1 → estructura
// 2 → claridad total

Controla:

filter cutoff
reverb amount
stereo width
detune amount
noise presence
5. Integración con Sistema Actual
Ya existente:
Drone base con múltiples osciladores
Filtro dinámico por dominio
Hover tones
Activation chords
Sistema de layers
Falta:
Unificar todo bajo:
notas base
estados de claridad
morph continuo
6. Implementación Técnica
6.1 — Morph hacia dominio
function morphToDomain(key) {
  const base = DOMAIN_TONES[key];

  oscillators.forEach((osc, i) => {
    const offset = smallOffsets[i];

    osc.frequency.setTargetAtTime(
      base * (1 + offset),
      audioCtx.currentTime,
      2.5
    );
  });
}
6.2 — Distorsión en hover
function distortTowards(key) {
  // 1. Subir volumen parcial del dominio
  // 2. Bajar otras capas
  // 3. Reducir reverb
  // 4. Subir claridad momentánea
}
6.3 — Control de claridad
function setClarity(level) {
  clarity = level;

  // ejemplo
  filterNode.frequency.setTargetAtTime(
    400 + level * 1200,
    audioCtx.currentTime,
    2.0
  );

  reverbGain.gain.setTargetAtTime(
    0.2 - level * 0.15,
    audioCtx.currentTime,
    2.0
  );
}
7. Relación con la UI (Muy importante)

El sistema de audio debe mapear exactamente con:

UI State	Audio State
Orbit (mapa)	Caos
Hover nodo	Deformación
Enter dominio	Estructura
Proyecto	Claridad total

Esto ya existe en:

main.js → estados de cámara
world.js → nodos
navigation.js → transición

El audio debe seguir ese mismo flujo.

8. Principio Filosófico

El sonido empieza como posibilidad
se deforma con intención
y se convierte en significado

Esto es equivalente a:

pensamiento
navegación
percepción
9. Nivel Avanzado (Opcional)
No usar notas fijas

En vez de notas:

usar intervalos
usar relaciones matemáticas

Ejemplo:

WORK → base * 1.5
THOUGHTS → base * 1.25
SYSTEMS → base * 2.0

Resultado:

sistema más abstracto
menos “musical”
más “universal”
10. Definición Final

Esto no es:

sound design
ambient audio
UX feedback

Esto es:

un sistema donde la interfaz se revela como música

11. Frase de Sistema

“You are not navigating a website.
You are resolving a signal.”