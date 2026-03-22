// ══════════════════════════════════════════
//  CONFIG — single source of truth
//  QUALITY fijado en 'full' durante desarrollo.
//  Sistema de tiers → ver quality_tiers_plan.md
// ══════════════════════════════════════════
export const QUALITY = 'full';

export const CONFIG = {
    orbitRadius:     28,
    cameraOrbitZ:    58,
    cameraOrbitY:    22,
    scrollSpeed:     0.003,
    nodeSize:        3,
    diveDuration:    2.5,

    orbitStartAngle: 0,

    colors: {
        bg:      0x030305,
        center:  0xffffff,
        nodes:   [0x6b9fff, 0xb8a06e, 0xc8c8c0, 0x00c832, 0xb0b8c8],
        neutral: 0xdedede
    },
    labels: ["WORK", "THOUGHTS", "EXPERIMENTS", "SYSTEMS", "INFO"],

    nodeYOffsets: [1.0, -2.5, 2.5, -1.5, 4.0],
    nodeScales:   [1.0,  1.1,  0.95, 0.85, 0.60],
};

export const ANGLE_STEP = (Math.PI * 2) / CONFIG.labels.length;
