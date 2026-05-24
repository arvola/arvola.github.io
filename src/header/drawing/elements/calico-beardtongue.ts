import { FlowerColorSpec, SpeciesProfile } from "./flower.ts";

// Calico beardtongue (Penstemon calycosus): a dusty pink-lilac tubular corolla. The tube is
// shaded as a soft cylinder (darker edges, lit center) and the flared mouth lips are a touch
// paler, with a dark throat oval opening into the tube.
const tubePink: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#9c6f8e" },  // shaded left edge
        { offset: 0.5, hex: "#d6a9c2" },  // lit center
        { offset: 1.0, hex: "#9c6f8e" },  // shaded right edge
    ],
};

const lobePink: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#e7c6d8" },  // pale upper lip
        { offset: 0.55, hex: "#dcb3cb" },
        { offset: 1.0, hex: "#cf9fbd" },  // slightly deeper lower lip
    ],
};

const throatPurple: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#af829e" },
        { offset: 1.0, hex: "#bc90b8" },  // muted interior shadow
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

const tubeOutline = "#7e5570";
const lobeOutline = "#a87a99";
const throatOutline = "#af7cba";
const speckleColor = "rgba(120, 60, 95, 0.5)";
const stemOutline = "#3b5028";
const leafOutline = "#4c6a2c";

export function makeCalicoBeardtongue(opts: {
    stemLength: number;
    stemThickness: number;
    baseAngle: number;
    curveStrength: number;
    tubeLength: number;
    tubeWidth: number;
    upperLobeReach: number;
    lowerLobeReach: number;
    nodAngle?: number;
    speckleCount?: number;
    speckleSeed?: number;
    leafSeed: number;
    leafScale?: number;
}): SpeciesProfile {
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
                    t: 0.18,
                    side: -1,
                    angleOffset: -0.55 + Math.sin(opts.leafSeed) * 0.05,
                    size: 40 * leafScale,
                    widthRatio: 0.32,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.22,
                    side: 1,
                    angleOffset: -0.55 - Math.cos(opts.leafSeed) * 0.05,
                    size: 40 * leafScale,
                    widthRatio: 0.32,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.5,
                    side: 1,
                    angleOffset: -0.5 + Math.sin(opts.leafSeed * 1.7) * 0.05,
                    size: 28 * leafScale,
                    widthRatio: 0.3,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.54,
                    side: -1,
                    angleOffset: -0.5 - Math.cos(opts.leafSeed * 1.3) * 0.05,
                    size: 28 * leafScale,
                    widthRatio: 0.3,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
            ],
        },
        head: {
            type: "beardtongue",
            tubeLength: opts.tubeLength,
            tubeWidth: opts.tubeWidth,
            tubeColor: tubePink,
            tubeOutlineColor: tubeOutline,
            upperLobeReach: opts.upperLobeReach,
            lowerLobeReach: opts.lowerLobeReach,
            lobeColor: lobePink,
            lobeOutlineColor: lobeOutline,
            throatColor: throatPurple,
            throatOutlineColor: throatOutline,
            speckleColor,
            speckleCount: opts.speckleCount ?? 14,
            speckleSeed: opts.speckleSeed ?? opts.leafSeed,
            nodAngle: opts.nodAngle,
        },
    };
}
