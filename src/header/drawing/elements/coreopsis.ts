import { FlowerColorSpec, SpeciesProfile } from "./flower.ts";

const pinkPetal: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#c95483" },
        { offset: 0.55, hex: "#e3729c" },
        { offset: 1.0, hex: "#f3a8c1" },
    ],
};

const yellowDisc: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#f6c948" },
        { offset: 0.7, hex: "#e5b02f" },
        { offset: 1.0, hex: "#c88f1a" },
    ],
};

const stemGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#5d7a37" },
        { offset: 0.65, hex: "#7a9445" },
        { offset: 1.0, hex: "#92a851" },
    ],
};

const leafGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#445e26" },
        { offset: 0.55, hex: "#74934a" },
        { offset: 1.0, hex: "#a3b358" },
    ],
};

const petalOutline = "#8a3a63";
const discOutline = "#7a5410";
const stemOutline = "#3f5224";
const leafOutline = "#4e6a2d";

function buildPetalArrays(count: number, seed: number) {
    const angleOffsets: number[] = [];
    const lengthMultipliers: number[] = [];
    for (let i = 0; i < count; i++) {
        angleOffsets.push(Math.sin((i + 1) * 1.7 + seed) * 0.03);
        lengthMultipliers.push(1 + Math.cos((i + 1) * 1.1 + seed * 1.3) * 0.04);
    }
    return { angleOffsets, lengthMultipliers };
}

export function makeCoreopsis(opts: {
    stemLength: number;
    stemThickness: number;
    baseAngle: number;
    curveStrength: number;
    petalCount?: number;
    petalLength: number;
    petalWidth: number;
    discRadius: number;
    leafSeed: number;
    petalSeed: number;
}): SpeciesProfile {
    const petalCount = opts.petalCount ?? 8;
    const petals = buildPetalArrays(petalCount, opts.petalSeed);

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
                    t: 0.28,
                    side: -1,
                    angleOffset: -0.85,
                    size: 14,
                    widthRatio: 0.18,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.5,
                    side: 1,
                    angleOffset: -0.85 + Math.sin(opts.leafSeed) * 0.05,
                    size: 13,
                    widthRatio: 0.18,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
            ],
        },
        head: {
            discRadius: opts.discRadius,
            discDomeHeight: 0,
            discColor: yellowDisc,
            discOutlineColor: discOutline,
            petalCount,
            petalLength: opts.petalLength,
            petalWidth: opts.petalWidth,
            petalDroop: 0,
            petalColor: pinkPetal,
            petalOutlineColor: petalOutline,
            petalAngleOffsets: petals.angleOffsets,
            petalLengthMultipliers: petals.lengthMultipliers,
            petalShape: "notched",
        },
    };
}
