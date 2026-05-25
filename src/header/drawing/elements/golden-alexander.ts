import {
    computeStemCurve,
    createRadialDiscGradient,
    drawStemCurve,
    FlowerColorSpec,
    GoldenAlexanderClusterParams,
    GoldenAlexanderHeadParams,
    SpeciesProfile,
    StemCurve,
} from "./flower-primitives.ts";
import { applyPalette } from "../color.ts";

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

function drawGoldenAlexanderCluster(
    ctx: CanvasRenderingContext2D,
    p: GoldenAlexanderClusterParams,
): void {
    ctx.save();
    ctx.lineWidth = 0.25;
    ctx.strokeStyle =
        p.outlineColor ?? applyPalette("rgba(124, 95, 0, 0.45)", p.palette);
    for (let i = 0; i < p.circleCount; i++) {
        const angle = i * Math.PI * (3 - Math.sqrt(5));
        const distance =
            p.spread * Math.sqrt(i / Math.max(1, p.circleCount - 1));
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance * 0.65;
        const radius = p.radius * (0.82 + Math.sin(i * 2.17) * 0.14);

        ctx.fillStyle = createRadialDiscGradient(
            ctx,
            radius,
            radius * 0.3,
            p.color,
        );
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
    ctx.restore();
}

export function drawGoldenAlexanderHead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    p: GoldenAlexanderHeadParams,
    mainStemAngle: number,
): void {
    const maxSplitAngle = Math.PI / 2.6;
    const minSplitAngle = Math.max(0, maxSplitAngle - p.fanAngle);
    const halfSplitCount = Math.max(1, Math.ceil(p.splitStemCount / 2));
    const stems: StemCurve[] = [];

    for (let i = 0; i < p.splitStemCount; i++) {
        const normalized =
            p.splitStemCount > 1 ? i / (p.splitStemCount - 1) : 0.5;
        const side = normalized < 0.5 ? -1 : normalized > 0.5 ? 1 : 0;
        const sideIndex = side < 0 ? i : p.splitStemCount - 1 - i;
        const sideNormalized =
            side === 0 ? 1 : sideIndex / Math.max(1, halfSplitCount - 1);
        const splitAngle =
            side *
            (maxSplitAngle - (maxSplitAngle - minSplitAngle) * sideNormalized);
        const angle = mainStemAngle + splitAngle;
        const lengthTier = i % 2 === 0 ? 1 : 0.6;
        const length =
            p.splitStemLength *
            lengthTier *
            (0.82 +
                Math.sin(i * 1.71) * 0.1 +
                Math.sin(normalized * Math.PI) * 0.14);
        const curveDirection = side < 0 ? 1 : side > 0 ? -1 : 0;
        stems.push(
            computeStemCurve(x, y, {
                length,
                thickness: p.splitStemThickness,
                baseAngle: angle,
                curveStrength: p.upwardCurveStrength * curveDirection,
                color: p.splitStemColor,
                outlineColor: p.splitStemOutlineColor,
            }),
        );
    }

    stems.forEach((stem) =>
        drawStemCurve(ctx, stem, {
            length: 0,
            thickness: p.splitStemThickness,
            baseAngle: 0,
            curveStrength: 0,
            color: p.splitStemColor,
            outlineColor: p.splitStemOutlineColor,
        }),
    );
    stems.forEach((stem) => {
        ctx.save();
        ctx.translate(stem.p2.x, stem.p2.y);
        ctx.rotate(mainStemAngle + Math.PI / 2);
        drawGoldenAlexanderCluster(ctx, p.cluster);
        ctx.restore();
    });
}

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
