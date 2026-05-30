import {
    FlowerColorSpec,
    FlowerHeadParams,
    LeafInstance,
    SpeciesProfile,
} from "./flower-primitives.ts";

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
            { offset: 0.31, hex: "#8c2a0c" },
            { offset: 0.40, hex: "#cd5531" },
            { offset: 0.49, hex: "#edbc51" },
            { offset: 0.55, hex: "#ffe071" },
            { offset: 0.85, hex: "#ecf65e" },
            { offset: 1.0, hex: "#faff71" },
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
    /** Rotates the whole ray-petal ring (radians) so neighbouring heads don't all line up. */
    petalStartAngle?: number;
    discRadius: number;
    leafSeed: number;
    petalSeed: number;
    leafScale?: number;
    /**
     * Foliage habit. "thread" = the fine, almost threadlike leaves of rose coreopsis
     * (C. rosea); "lance" = the broader, more numerous lanceolate leaves of large-flowered
     * tickseed (C. grandiflora).
     */
    leafStyle?: "thread" | "lance";
    palette?: CoreopsisPalette;
}): SpeciesProfile<FlowerHeadParams> {
    const petalCount = opts.petalCount ?? 8;
    const petals = buildPetalArrays(petalCount, opts.petalSeed);
    const palette = opts.palette ?? coreopsisRosePalette;
    const leafScale = opts.leafScale ?? 1;
    const leafStyle = opts.leafStyle ?? "thread";

    const threadLeaves: LeafInstance[] = [
        {
            t: 0.06,
            side: -1,
            angleOffset: -0.15 + Math.sin(opts.leafSeed) * 0.05,
            size: 34 * leafScale,
            widthRatio: 0.11,
            color: leafGreen,
            outlineColor: leafOutline,
            shape: "teardrop",
        },
        {
            t: 0.1,
            side: 1,
            angleOffset: -0.18 + Math.cos(opts.leafSeed * 1.4) * 0.05,
            size: 30 * leafScale,
            widthRatio: 0.11,
            color: leafGreen,
            outlineColor: leafOutline,
            shape: "teardrop",
        },
        {
            t: 0.32,
            side: Math.sin(opts.leafSeed * 0.7) > 0 ? 1 : -1,
            angleOffset: -0.45,
            size: 18 * leafScale,
            widthRatio: 0.11,
            color: leafGreen,
            outlineColor: leafOutline,
            shape: "teardrop",
        },
    ];

    // Lanceolate leaves: broader than the thread form and more numerous, clustered low and up
    // the lower-to-mid stem in opposite pairs that taper toward the head.
    const lanceLeaves: LeafInstance[] = [
        { t: 0.08, side: -1, angleOffset: -0.5, size: 18 },
        { t: 0.13, side: 1, angleOffset: -0.52, size: 17 },
        { t: 0.26, side: -1, angleOffset: -0.55, size: 15 },
        { t: 0.32, side: 1, angleOffset: -0.58, size: 14 },
        { t: 0.46, side: -1, angleOffset: -0.62, size: 11 },
        { t: 0.54, side: 1, angleOffset: -0.64, size: 10 },
    ].map((l, i) => ({
        t: l.t,
        side: l.side as 1 | -1,
        angleOffset: l.angleOffset + Math.sin(opts.leafSeed + i) * 0.05,
        size: l.size * leafScale,
        widthRatio: 0.22,
        color: leafGreen,
        outlineColor: leafOutline,
        shape: "teardrop" as const,
    }));

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
            instances: leafStyle === "lance" ? lanceLeaves : threadLeaves,
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
            petalRotation: opts.petalStartAngle ?? 0,
        },
    };
}
