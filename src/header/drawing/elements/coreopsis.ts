import { FlowerColorSpec, FlowerHeadParams, SpeciesProfile } from "./flower-primitives.ts";

export interface CoreopsisPalette {
    petalColor: FlowerColorSpec;
    discColor: FlowerColorSpec;
    petalOutlineColor: string;
    discOutlineColor: string;
}

// Rose coreopsis (Coreopsis rosea): soft pink ray petals with a slightly deeper rose at the
// base, plain yellow disc, no maroon ring.
export const coreopsisRosePalette: CoreopsisPalette = {
    petalColor: {
        type: "multi",
        stops: [
            { offset: 0.0, hex: "#c46a92" },
            { offset: 0.35, hex: "#dd8aab" },
            { offset: 0.7, hex: "#ecaac5" },
            { offset: 1.0, hex: "#f4c2d6" },
        ],
    },
    discColor: {
        type: "multi",
        stops: [
            { offset: 0.0, hex: "#f7d23a" },
            { offset: 0.65, hex: "#e2a81c" },
            { offset: 1.0, hex: "#a87410" },
        ],
    },
    petalOutlineColor: "rgba(150, 80, 110, 0.55)",
    discOutlineColor: "#7a5410",
};

// Large-flowered tickseed (Coreopsis grandiflora / lanceolata): bright yellow rays with the
// signature deep maroon-red ring at the petal base, golden disc with a darker rim.
export const coreopsisGrandifloraPalette: CoreopsisPalette = {
    petalColor: {
        type: "multi",
        stops: [
            { offset: 0.0, hex: "#5a1408" },
            { offset: 0.18, hex: "#8c1d0c" },
            { offset: 0.28, hex: "#b03217" },
            { offset: 0.36, hex: "#e89224" },
            { offset: 0.55, hex: "#fcd03a" },
            { offset: 0.85, hex: "#ffe35e" },
            { offset: 1.0, hex: "#fff088" },
        ],
    },
    discColor: {
        type: "multi",
        stops: [
            { offset: 0.0, hex: "#f7c83a" },
            { offset: 0.6, hex: "#d18a18" },
            { offset: 1.0, hex: "#7d3a08" },
        ],
    },
    petalOutlineColor: "rgba(110, 50, 10, 0.5)",
    discOutlineColor: "#4a2406",
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
    palette?: CoreopsisPalette;
}): SpeciesProfile<FlowerHeadParams> {
    const petalCount = opts.petalCount ?? 8;
    const petals = buildPetalArrays(petalCount, opts.petalSeed);
    const palette = opts.palette ?? coreopsisRosePalette;

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
                    t: 0.06,
                    side: -1,
                    angleOffset: -0.15 + Math.sin(opts.leafSeed) * 0.05,
                    size: 34,
                    widthRatio: 0.11,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.1,
                    side: 1,
                    angleOffset: -0.18 + Math.cos(opts.leafSeed * 1.4) * 0.05,
                    size: 30,
                    widthRatio: 0.11,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.32,
                    side: Math.sin(opts.leafSeed * 0.7) > 0 ? 1 : -1,
                    angleOffset: -0.45,
                    size: 18,
                    widthRatio: 0.11,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
            ],
        },
        head: {
            type: "petal",
            discRadius: opts.discRadius,
            discDomeHeight: 0,
            discColor: palette.discColor,
            discOutlineColor: palette.discOutlineColor,
            petalCount,
            petalLength: opts.petalLength,
            petalWidth: opts.petalWidth,
            petalDroop: 0,
            petalColor: palette.petalColor,
            petalOutlineColor: palette.petalOutlineColor,
            petalAngleOffsets: petals.angleOffsets,
            petalLengthMultipliers: petals.lengthMultipliers,
            petalShape: "notched",
        },
    };
}
