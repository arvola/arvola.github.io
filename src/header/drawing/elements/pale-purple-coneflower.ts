import {
    createLinearGradientFromSpec,
    FlowerColorSpec,
    SpeciesProfile,
} from "./flower-primitives.ts";
import { applyPalette, ColorPalette } from "../color.ts";

export interface ConeflowerHeadParams {
    type: "coneflower";
    coneWidth: number;
    coneRimDepth: number;
    coneHeight: number;
    coneColor: FlowerColorSpec;
    coneOutlineColor?: string;
    petalCount: number;
    petalLength: number;
    petalWidth: number;
    petalRadialReach: number;
    petalDroop: number;
    /**
     * 0 = straight petal (ctrl at attach→tip midpoint),
     * 1 = full L-curve (ctrl at the corner (tipX, attachY) so petals start radial then hook
     * straight down). Values around 0.7–0.85 produce a strong gravity bend.
     */
    petalCurveStrength: number;
    petalColor: FlowerColorSpec;
    petalOutlineColor?: string;
    petalCenterVeinColor?: string;
    petalAngleOffsets: number[];
    petalLengthMultipliers: number[];
    palette?: ColorPalette;
}

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
        { offset: 0.0, hex: "#aa6126" }, // golden-orange highlight on top of dome
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

const petalOutline = "#a152bf";
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

interface ConeflowerPetalLayout {
    attachX: number;
    attachY: number;
    tipX: number;
    tipY: number;
    ctrlX: number;
    ctrlY: number;
    normalX: number;
    normalY: number;
    widthScale: number;
}

function buildConeflowerPetal(
    theta: number,
    lengthMul: number,
    p: ConeflowerHeadParams,
    headRotation: number,
): ConeflowerPetalLayout {
    const L = p.petalLength * lengthMul;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const tilt = p.coneRimDepth / Math.max(0.001, p.coneWidth);
    const cosH = Math.cos(headRotation);
    const sinH = Math.sin(headRotation);

    const attachX = cosT * p.coneWidth;
    const attachY = sinT * p.coneRimDepth;

    // Radial direction in local frame (perpendicular to cone axis, projected through rim
    // foreshortening). When the head is rotated this direction also rotates — and for petals
    // attached to the "upper" part of the rim in screen, the radial would point upward,
    // creating an unwanted hump where the petal arcs up before gravity yanks it down.
    const localRadialX = cosT;
    const localRadialY = sinT * tilt;

    // Project the radial into screen space, then force its Y component to zero so the radial
    // leg is purely horizontal in screen for every petal. This is the only way to keep the
    // gravity drop length identical on every side of a tilted head — otherwise the side facing
    // the tilt picks up an extra screen-Y contribution from the radial while the opposite side
    // (whose radial points up in screen) gets it clamped away, producing a lopsided flower.
    const screenRadialX = cosH * localRadialX - sinH * localRadialY;
    const adjustedRadialX = cosH * screenRadialX;
    const adjustedRadialY = -sinH * screenRadialX;

    // World gravity (screen +y) expressed in the head's local frame.
    const gravityLocalX = sinH;
    const gravityLocalY = cosH;

    const reach = p.petalRadialReach;

    // Corner: radial extension off the rim (clamped to never travel upward in screen).
    const cornerX = attachX + L * reach * adjustedRadialX;
    const cornerY = attachY + L * reach * adjustedRadialY;

    // Tip: drop from the corner in the world gravity direction by L*droop. Because
    // (tip - corner) is exactly L*droop * gravity, the petal's tangent at the tip points
    // straight down in screen regardless of head tilt.
    const tipX = cornerX + L * p.petalDroop * gravityLocalX;
    const tipY = cornerY + L * p.petalDroop * gravityLocalY;

    // Blend ctrl between midpoint (straight petal) and the L-corner (full gravity hook).
    const curveBlend = Math.min(1, Math.max(0, p.petalCurveStrength));
    const midX = (attachX + tipX) / 2;
    const midY = (attachY + tipY) / 2;
    const ctrlX = midX * (1 - curveBlend) + cornerX * curveBlend;
    const ctrlY = midY * (1 - curveBlend) + cornerY * curveBlend;

    const dx = tipX - attachX;
    const dy = tipY - attachY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const normalX = -dy / len;
    const normalY = dx / len;

    const widthScale = Math.max(
        0.6,
        Math.sqrt(sinT * sinT + cosT * cosT * tilt * tilt),
    );

    return {
        attachX,
        attachY,
        tipX,
        tipY,
        ctrlX,
        ctrlY,
        normalX,
        normalY,
        widthScale,
    };
}

function drawConeflowerPetal(
    ctx: CanvasRenderingContext2D,
    pe: ConeflowerPetalLayout,
    p: ConeflowerHeadParams,
): void {
    const halfW = (p.petalWidth / 2) * pe.widthScale;

    // Sample the curved centerline (quadratic bezier attach → ctrl → tip) for position and tangent.
    const center = (t: number) => {
        const u = 1 - t;
        return {
            x: u * u * pe.attachX + 2 * u * t * pe.ctrlX + t * t * pe.tipX,
            y: u * u * pe.attachY + 2 * u * t * pe.ctrlY + t * t * pe.tipY,
        };
    };
    const tangent = (t: number) => {
        const u = 1 - t;
        const dx =
            2 * u * (pe.ctrlX - pe.attachX) + 2 * t * (pe.tipX - pe.ctrlX);
        const dy =
            2 * u * (pe.ctrlY - pe.attachY) + 2 * t * (pe.tipY - pe.ctrlY);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        return { tx: dx / len, ty: dy / len, px: -dy / len, py: dx / len };
    };

    // Paddle silhouette: narrow rounded base, widest near the tip, broad rounded tip.
    const baseR = halfW * 0.35;
    const tipR = halfW * 0.72;

    const t0 = tangent(0);
    const t1 = tangent(1);

    const upperBaseX = pe.attachX + t0.px * baseR;
    const upperBaseY = pe.attachY + t0.py * baseR;
    const lowerBaseX = pe.attachX - t0.px * baseR;
    const lowerBaseY = pe.attachY - t0.py * baseR;
    const upperTipX = pe.tipX + t1.px * tipR;
    const upperTipY = pe.tipY + t1.py * tipR;
    const lowerTipX = pe.tipX - t1.px * tipR;
    const lowerTipY = pe.tipY - t1.py * tipR;

    // Silhouette control points sampled along the curved centerline so the petal width follows
    // the bend instead of cutting across the chord. Widest at ~80% of arc for the wider tip.
    const c1Center = center(0.35);
    const c1Tan = tangent(0.35);
    const c2Center = center(0.8);
    const c2Tan = tangent(0.8);
    const c1Off = halfW * 0.95;
    const c2Off = halfW * 1.3;

    const upperC1x = c1Center.x + c1Tan.px * c1Off;
    const upperC1y = c1Center.y + c1Tan.py * c1Off;
    const upperC2x = c2Center.x + c2Tan.px * c2Off;
    const upperC2y = c2Center.y + c2Tan.py * c2Off;
    const lowerC1x = c2Center.x - c2Tan.px * c2Off;
    const lowerC1y = c2Center.y - c2Tan.py * c2Off;
    const lowerC2x = c1Center.x - c1Tan.px * c1Off;
    const lowerC2y = c1Center.y - c1Tan.py * c1Off;

    // Rounded caps: extend in the centerline tangent direction at each end.
    const tipCapDist = tipR * 1.35;
    const tipCapC1x = upperTipX + t1.tx * tipCapDist;
    const tipCapC1y = upperTipY + t1.ty * tipCapDist;
    const tipCapC2x = lowerTipX + t1.tx * tipCapDist;
    const tipCapC2y = lowerTipY + t1.ty * tipCapDist;

    const baseCapDist = baseR * 1.35;
    const baseCapC1x = lowerBaseX - t0.tx * baseCapDist;
    const baseCapC1y = lowerBaseY - t0.ty * baseCapDist;
    const baseCapC2x = upperBaseX - t0.tx * baseCapDist;
    const baseCapC2y = upperBaseY - t0.ty * baseCapDist;

    const grad = createLinearGradientFromSpec(
        ctx,
        pe.attachX,
        pe.attachY,
        pe.tipX,
        pe.tipY,
        p.petalColor,
    );

    ctx.beginPath();
    ctx.moveTo(upperBaseX, upperBaseY);
    ctx.bezierCurveTo(
        upperC1x,
        upperC1y,
        upperC2x,
        upperC2y,
        upperTipX,
        upperTipY,
    );
    ctx.bezierCurveTo(
        tipCapC1x,
        tipCapC1y,
        tipCapC2x,
        tipCapC2y,
        lowerTipX,
        lowerTipY,
    );
    ctx.bezierCurveTo(
        lowerC1x,
        lowerC1y,
        lowerC2x,
        lowerC2y,
        lowerBaseX,
        lowerBaseY,
    );
    ctx.bezierCurveTo(
        baseCapC1x,
        baseCapC1y,
        baseCapC2x,
        baseCapC2y,
        upperBaseX,
        upperBaseY,
    );
    ctx.closePath();

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = p.petalOutlineColor ?? "rgba(0, 0, 0, 0.4)";
    ctx.stroke();
}

function drawConeDomePath(
    ctx: CanvasRenderingContext2D,
    p: ConeflowerHeadParams,
): void {
    ctx.beginPath();
    ctx.moveTo(-p.coneWidth, 0);
    ctx.ellipse(0, 0, p.coneWidth, p.coneHeight, 0, Math.PI, 2 * Math.PI);
    ctx.ellipse(0, 0, p.coneWidth, p.coneRimDepth, 0, 0, Math.PI);
    ctx.closePath();
}

function drawConeDome(
    ctx: CanvasRenderingContext2D,
    p: ConeflowerHeadParams,
): void {
    drawConeDomePath(ctx, p);

    const grad = createLinearGradientFromSpec(
        ctx,
        0,
        -p.coneHeight,
        0,
        p.coneRimDepth,
        p.coneColor,
    );
    ctx.fillStyle = grad;
    ctx.fill();

    drawConeDomePath(ctx, p);
    ctx.lineWidth = 0.6;
    ctx.strokeStyle =
        p.coneOutlineColor ?? applyPalette("rgba(60, 25, 8, 0.7)", p.palette);
    ctx.stroke();

    const highlight = ctx.createRadialGradient(
        -p.coneWidth * 0.25,
        -p.coneHeight * 0.55,
        0,
        -p.coneWidth * 0.25,
        -p.coneHeight * 0.55,
        p.coneWidth * 0.6,
    );
    highlight.addColorStop(
        0,
        applyPalette("rgba(255, 220, 170, 0.35)", p.palette),
    );
    highlight.addColorStop(
        1,
        applyPalette("rgba(255, 220, 170, 0)", p.palette),
    );
    ctx.save();
    drawConeDomePath(ctx, p);
    ctx.clip();
    ctx.fillStyle = highlight;
    ctx.fillRect(
        -p.coneWidth * 1.2,
        -p.coneHeight * 1.2,
        p.coneWidth * 2.4,
        (p.coneHeight + p.coneRimDepth) * 1.2,
    );
    ctx.restore();
}

export function drawConeflowerHead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    p: ConeflowerHeadParams,
    stemEndAngle: number,
): void {
    // Align head with the stem direction. A stem tangent of -π/2 (pointing up) maps to no rotation.
    const headRotation = stemEndAngle + Math.PI / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(headRotation);
    ctx.translate(0, -p.coneRimDepth);

    const petals: ConeflowerPetalLayout[] = [];
    for (let i = 0; i < p.petalCount; i++) {
        const theta =
            (i / p.petalCount) * 2 * Math.PI + (p.petalAngleOffsets[i] ?? 0);
        const lengthMul = p.petalLengthMultipliers[i] ?? 1;
        petals.push(buildConeflowerPetal(theta, lengthMul, p, headRotation));
    }

    const backPetals = petals
        .filter((pe) => pe.attachY < 0)
        .sort((a, b) => a.attachY - b.attachY);
    const frontPetals = petals
        .filter((pe) => pe.attachY >= 0)
        .sort((a, b) => a.attachY - b.attachY);

    backPetals.forEach((pe) => drawConeflowerPetal(ctx, pe, p));
    drawConeDome(ctx, p);
    frontPetals.forEach((pe) => drawConeflowerPetal(ctx, pe, p));

    ctx.restore();
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
}): SpeciesProfile<ConeflowerHeadParams> {
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
