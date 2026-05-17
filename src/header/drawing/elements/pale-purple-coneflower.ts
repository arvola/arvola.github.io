import { FlowerColorSpec, SpeciesProfile } from "./flower.ts";

const palePurplePetal: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#8a4ea6" }, // saturated purple at cone-attach (top of drooping petal)
        { offset: 0.25, hex: "#a875be" },
        { offset: 0.6, hex: "#cea4cf" },
        { offset: 0.85, hex: "#e6c8d8" },
        { offset: 1.0, hex: "#f1dde2" }, // very pale pink-lilac at drooping tip
    ],
};

const coneColor: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#c9712a" }, // golden-orange highlight on top of dome
        { offset: 0.45, hex: "#a04f1c" },
        { offset: 1.0, hex: "#5a280e" }, // dark reddish-brown around rim shadow
    ],
};

const stemGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#5e7a3f" },
        { offset: 0.65, hex: "#7a9249" },
        { offset: 1.0, hex: "#8fa654" },
    ],
};

const leafGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#3d5a26" },
        { offset: 0.55, hex: "#6f8e3e" },
        { offset: 1.0, hex: "#9eb152" },
    ],
};

const petalOutline = "#b388c5";
const coneOutline = "#391704";
const stemOutline = "#3b5028";
const leafOutline = "#4c6a2c";

function buildPetalArrays(count: number, seed: number) {
    const angleOffsets: number[] = [];
    const lengthMultipliers: number[] = [];
    for (let i = 0; i < count; i++) {
        const a = Math.sin((i + 1) * 1.7 + seed) * 0.04;
        const l = 1 + Math.cos((i + 1) * 0.7 + seed * 1.3) * 0.08;
        angleOffsets.push(a);
        lengthMultipliers.push(l);
    }
    return { angleOffsets, lengthMultipliers };
}

export function makePalePurpleConeflower(opts: {
    stemLength: number;
    stemThickness: number;
    baseAngle: number;
    curveStrength: number;
    coneWidth: number;
    coneRimDepth: number;
    coneHeight: number;
    petalCount: number;
    petalLength: number;
    petalWidth: number;
    petalRadialReach?: number;
    petalDroop?: number;
    petalCurveStrength?: number;
    leafSeed: number;
    petalSeed: number;
    leafScale?: number;
}): SpeciesProfile {
    const petals = buildPetalArrays(opts.petalCount, opts.petalSeed);
    const leafScale = opts.leafScale ?? 1;

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
                    t: 0.01,
                    side: -1,
                    angleOffset: -1.2,
                    size: 107 * leafScale,
                    widthRatio: 0.22,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.02,
                    side: 1,
                    angleOffset: -1.2 - Math.sin(opts.leafSeed) * 0.05,
                    size: 107 * leafScale,
                    widthRatio: 0.22,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.56,
                    side: -1,
                    angleOffset: -0.9 + Math.cos(opts.leafSeed) * 0.04,
                    size: 44 * leafScale,
                    widthRatio: 0.22,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
            ],
        },
        head: {
            type: "coneflower",
            coneWidth: opts.coneWidth,
            coneRimDepth: opts.coneRimDepth,
            coneHeight: opts.coneHeight,
            coneColor,
            coneOutlineColor: coneOutline,
            petalCount: opts.petalCount,
            petalLength: opts.petalLength,
            petalWidth: opts.petalWidth,
            petalRadialReach: opts.petalRadialReach ?? 0.55,
            petalDroop: opts.petalDroop ?? 0.85,
            petalCurveStrength: opts.petalCurveStrength ?? 0.78,
            petalColor: palePurplePetal,
            petalOutlineColor: petalOutline,
            petalAngleOffsets: petals.angleOffsets,
            petalLengthMultipliers: petals.lengthMultipliers,
        },
    };
}
