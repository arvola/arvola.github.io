import { FlowerColorSpec, SpeciesProfile } from "./flower.ts";

const yellowCluster: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#4e4524" },
        { offset: 0.58, hex: "#c5af38" },
        { offset: 0.95, hex: "#ecd64c" },
        { offset: 1.0, hex: "#fff000" },
    ],
};

const stemGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#667a35" },
        { offset: 0.65, hex: "#7d8f42" },
        { offset: 1.0, hex: "#91a84d" },
    ],
};

const leafGreen: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#516327" },
        { offset: 0.6, hex: "#7f9144" },
        { offset: 1.0, hex: "#a3ae58" },
    ],
};

export function makeGoldenAlexander(opts: {
    stemLength: number;
    stemThickness: number;
    baseAngle: number;
    curveStrength: number;
    splitStemCount: number;
    splitStemLength: number;
    fanAngle: number;
    clusterCircleCount?: number;
    clusterRadius?: number;
    clusterSpread?: number;
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
            outlineColor: "#52612e",
        },
        leaf: {
            instances: [
                {
                    t: 0.38,
                    side: -1,
                    angleOffset: -0.75,
                    size: 16 * leafScale,
                    widthRatio: 0.3,
                    color: leafGreen,
                    outlineColor: "#596b30",
                    shape: "teardrop",
                },
                {
                    t: 0.52,
                    side: 1,
                    angleOffset: -0.82,
                    size: 15 * leafScale,
                    widthRatio: 0.28,
                    color: leafGreen,
                    outlineColor: "#596b30",
                    shape: "teardrop",
                },
            ],
        },
        head: {
            type: "golden-alexander",
            splitStemCount: opts.splitStemCount,
            splitStemLength: opts.splitStemLength,
            splitStemThickness: Math.max(0.8, opts.stemThickness * 0.55),
            fanAngle: opts.fanAngle,
            upwardCurveStrength: 0.28,
            splitStemColor: stemGreen,
            splitStemOutlineColor: "#52612e",
            cluster: {
                circleCount: opts.clusterCircleCount ?? 13,
                radius: opts.clusterRadius ?? 1.8,
                spread: opts.clusterSpread ?? 6,
                color: yellowCluster,
                speckleColor: "rgba(167, 128, 0, 0.5)",
                outlineColor: "rgba(142, 112, 0, 0.35)",
            },
        },
    };
}