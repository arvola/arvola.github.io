import { FlowerColorSpec, FlowerHeadParams, SpeciesProfile } from "./flower-primitives.ts";

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
        { offset: 0.0, hex: "#f8d463" },
        { offset: 0.7, hex: "#efc351" },
        { offset: 1.0, hex: "#e6bb4c" },
    ],
};

const stemGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#534629" },
        { offset: 0.2, hex: "#6f9465" },
        { offset: 0.7, hex: "#829a57" },
        { offset: 1.0, hex: "#94aa56" },
    ],
};

const leafGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#3f5a2c" },
        { offset: 0.5, hex: "#7fa55a" },
        { offset: 1.0, hex: "#b0b95e" },
    ],
};

const petalOutline = "#8566c6";
const discOutline = "#655116";
const stemOutline = "#3d5238";
const leafOutline = "#5a7c3f";

function buildPetalArrays(count: number, seed: number) {
    const angleOffsets: number[] = [];
    const lengthMultipliers: number[] = [];
    for (let i = 0; i < count; i++) {
        const a = Math.sin((i + 1) * 1.3 + seed) * 0.04;
        const l = 1 + Math.cos((i + 1) * 0.9 + seed * 1.7) * 0.06;
        angleOffsets.push(a);
        lengthMultipliers.push(l);
    }
    return { angleOffsets, lengthMultipliers };
}

export function makeNewEnglandAster(opts: {
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
}): SpeciesProfile<FlowerHeadParams> {
    const petals = buildPetalArrays(opts.petalCount, opts.petalSeed);

    return {
        stem: {
            length: opts.stemLength,
            thickness: opts.stemThickness,
            baseAngle: opts.baseAngle,
            curveStrength: opts.curveStrength,
            color: stemGreen,
            outlineColor: stemOutline,
        },
        leaf: {
            instances: [
                {
                    t: 0.15,
                    side: -1,
                    angleOffset: -0.9,
                    size: 15,
                    widthRatio: 0.35,
                    serrationCount: 4,
                    serrationDepth: 1.25,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "arrow",
                },
                {
                    t: 0.35,
                    side: 1,
                    angleOffset: -0.9,
                    size: 15,
                    widthRatio: 0.35,
                    serrationCount: 4,
                    serrationDepth: 1.25,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "arrow",
                },
                {
                    t: 0.55,
                    side: -1,
                    angleOffset: -0.8 - Math.sin(opts.leafSeed) * 0.05,
                    size: 15,
                    widthRatio: 0.35,
                    serrationCount: 4,
                    serrationDepth: 1.2,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "arrow",
                },
            ],
        },
        head: {
            type: "petal",
            discRadius: opts.discRadius,
            discDomeHeight: 0,
            discColor: yellowDisc,
            discOutlineColor: discOutline,
            petalCount: opts.petalCount,
            petalLength: opts.petalLength,
            petalWidth: opts.petalWidth,
            petalDroop: 0,
            petalColor: purplePetal,
            petalOutlineColor: petalOutline,
            petalAngleOffsets: petals.angleOffsets,
            petalLengthMultipliers: petals.lengthMultipliers,
            petalShape: opts.petalShape,
        },
    };
}
