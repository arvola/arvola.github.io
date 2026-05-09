/**
 * Standalone test page entry for the procedural flower renderer.
 *
 * Renders three purple daisies (one tall center, two shorter side flowers)
 * matching the reference image. All variation is pre-computed here and
 * passed to the deterministic renderer in `header/drawing/elements/flower.ts`.
 */

import {
    generateFlower,
    FlowerColorSpec,
    SpeciesProfile,
} from "./header/drawing/elements/flower.ts";

const canvas = document.getElementById("flower-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Background fill (subtle gradient like the reference).
const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
bg.addColorStop(0, "#eef7f1");
bg.addColorStop(1, "#dcebe1");
ctx.fillStyle = bg;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// --- Color palette (from the reference image) ---------------------------

const purplePetal: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#3a1d6e" }, // deep purple at base
        { offset: 0.55, hex: "#6b3fbf" },
        { offset: 1.0, hex: "#a987e6" }, // light lilac at tip
    ],
};

const yellowDisc: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#edc83e" },
        { offset: 0.7, hex: "#dcb833" },
        { offset: 1.0, hex: "#c89a1a" },
    ],
};

const stemGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#6b8a46" },
        { offset: 1.0, hex: "#7ea659" },
    ],
};

const leafGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#3f5a2c" },
        { offset: 1.0, hex: "#7fa55a" },
    ],
};

// --- Deterministic per-flower variation ---------------------------------

/** Build petal angle/length arrays with subtle but explicit fuzz. */
function buildPetalArrays(count: number, seed: number) {
    const angleOffsets: number[] = [];
    const lengthMultipliers: number[] = [];
    for (let i = 0; i < count; i++) {
        // Small deterministic trig-based fuzz, no Math.random.
        const a = Math.sin((i + 1) * 1.3 + seed) * 0.04;
        const l = 1 + Math.cos((i + 1) * 0.9 + seed * 1.7) * 0.06;
        angleOffsets.push(a);
        lengthMultipliers.push(l);
    }
    return { angleOffsets, lengthMultipliers };
}

function makeDaisy(opts: {
    stemLength: number;
    stemThickness: number;
    baseAngle: number;
    curveStrength: number;
    petalCount: number;
    petalLength: number;
    petalWidth: number;
    discRadius: number;
    leafSeed: number;
    petalSeed: number;
    petalShape?: "pointed" | "elliptical";
}): SpeciesProfile {
    const petals = buildPetalArrays(opts.petalCount, opts.petalSeed);

    return {
        stem: {
            length: opts.stemLength,
            thickness: opts.stemThickness,
            baseAngle: opts.baseAngle,
            curveStrength: opts.curveStrength,
            color: stemGreen,
        },
        leaf: {
            instances: [
                {
                    t: 0.35,
                    side: 1,
                    angleOffset: -0.9,
                    size: 90,
                    widthRatio: 0.35,
                    serrationCount: 4,
                    serrationDepth: 1.25,
                    color: leafGreen,
                },
                {
                    t: 0.55,
                    side: -1,
                    angleOffset: -0.8 - Math.sin(opts.leafSeed) * 0.05,
                    size: 80,
                    widthRatio: 0.55,
                    serrationCount: 4,
                    serrationDepth: 1.2,
                    color: leafGreen,
                },
            ],
        },
        head: {
            discRadius: opts.discRadius,
            discDomeHeight: 0,
            discColor: yellowDisc,
            petalCount: opts.petalCount,
            petalLength: opts.petalLength,
            petalWidth: opts.petalWidth,
            petalDroop: 0,
            petalColor: purplePetal,
            petalAngleOffsets: petals.angleOffsets,
            petalLengthMultipliers: petals.lengthMultipliers,
            petalShape: opts.petalShape,
        },
    };
}

// --- Three flowers matching the attachment ------------------------------

// Tall center flower.
const center = makeDaisy({
    stemLength: 360,
    stemThickness: 9,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.02,
    petalCount: 16,
    petalLength: 90,
    petalWidth: 28,
    discRadius: 32,
    leafSeed: 1.1,
    petalSeed: 0.3,
});

// Left smaller flower.
const left = makeDaisy({
    stemLength: 240,
    stemThickness: 7,
    baseAngle: -Math.PI / 2 - 0.08,
    curveStrength: -0.06,
    petalCount: 24,
    petalLength: 70,
    petalWidth: 24,
    discRadius: 20,
    leafSeed: 2.4,
    petalSeed: 1.7,
    petalShape: "pointed",
});

// Right smaller flower.
const right = makeDaisy({
    stemLength: 270,
    stemThickness: 7,
    baseAngle: -Math.PI / 2 + 0.06,
    curveStrength: 0.05,
    petalCount: 14,
    petalLength: 72,
    petalWidth: 24,
    discRadius: 27,
    leafSeed: 3.7,
    petalSeed: 2.2,
});

// Ground line for stem bases.
const groundY = canvas.height - 30;

// Render order: back-most first so layering reads correctly.
generateFlower(ctx, 320, groundY, center);
generateFlower(ctx, 140, groundY, left);
generateFlower(ctx, 500, groundY, right);
