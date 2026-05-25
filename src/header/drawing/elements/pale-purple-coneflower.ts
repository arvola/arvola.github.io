import {
    ConeflowerHeadParams,
    createLinearGradientFromSpec,
    FlowerColorSpec,
    SpeciesProfile
} from "./flower.ts";

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

    const widthScale = Math.max(0.6, Math.sqrt(sinT * sinT + cosT * cosT * tilt * tilt));

    return { attachX, attachY, tipX, tipY, ctrlX, ctrlY, normalX, normalY, widthScale };
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
        const dx = 2 * u * (pe.ctrlX - pe.attachX) + 2 * t * (pe.tipX - pe.ctrlX);
        const dy = 2 * u * (pe.ctrlY - pe.attachY) + 2 * t * (pe.tipY - pe.ctrlY);
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

    ctx.beginPath();
    ctx.moveTo(upperBaseX, upperBaseY);
    ctx.bezierCurveTo(
        c1Center.x + c1Tan.px * halfW * 0.75,
        c1Center.y + c1Tan.py * halfW * 0.75,
        c2Center.x + c2Tan.px * halfW,
        c2Center.y + c2Tan.py * halfW,
        upperTipX, upperTipY,
    );
    ctx.arc(pe.tipX, pe.tipY, tipR, Math.atan2(t1.py, t1.px) - Math.PI / 2, Math.atan2(t1.py, t1.px) + Math.PI / 2);
    ctx.bezierCurveTo(
        c2Center.x - c2Tan.px * halfW,
        c2Center.y - c2Tan.py * halfW,
        c1Center.x - c1Tan.px * halfW * 0.75,
        c1Center.y - c1Tan.py * halfW * 0.75,
        lowerBaseX, lowerBaseY,
    );
    ctx.closePath();

    ctx.fillStyle = createLinearGradientFromSpec(ctx, pe.attachX, pe.attachY, pe.tipX, pe.tipY, p.petalColor);
    ctx.fill();
    ctx.strokeStyle = p.petalOutlineColor ?? "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.45;
    ctx.stroke();
}

function drawConeDomePath(ctx: CanvasRenderingContext2D, p: ConeflowerHeadParams): void {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.coneWidth, p.coneRimDepth, 0, 0, Math.PI);
    ctx.bezierCurveTo(-p.coneWidth, -p.coneHeight * 0.65, p.coneWidth, -p.coneHeight * 0.65, p.coneWidth, 0);
    ctx.closePath();
}

function drawConeDome(ctx: CanvasRenderingContext2D, p: ConeflowerHeadParams): void {
    ctx.save();
    drawConeDomePath(ctx, p);
    const grad = ctx.createRadialGradient(0, -p.coneHeight * 0.45, 0, 0, -p.coneHeight * 0.2, p.coneHeight * 1.2);
    if (p.coneColor.type === "single") {
        grad.addColorStop(0, p.coneColor.baseHex);
        grad.addColorStop(1, p.coneColor.baseHex);
    } else {
        p.coneColor.stops.forEach(s => grad.addColorStop(s.offset, s.hex));
    }
    ctx.fillStyle = grad;
    ctx.fill();

    // Texture the cone with "seeds/spikes" using a Fibonacci spiral projected onto the dome.
    const spikeCount = 140;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    ctx.fillStyle = p.coneOutlineColor ?? "rgba(0,0,0,0.4)";
    for (let i = 0; i < spikeCount; i++) {
        const r = Math.sqrt(i / spikeCount);
        const theta = i * goldenAngle;
        const lx = Math.cos(theta) * r;
        const ly = Math.sin(theta) * r;

        // Map the unit disc spiral onto the dome silhouette: horizontal is coneWidth,
        // vertical is a blend of rim foreshortening (at bottom) and dome height (at top).
        const px = lx * p.coneWidth * 0.95;
        const py = ly < 0
            ? ly * p.coneHeight * 0.8  // Upper dome
            : ly * p.coneRimDepth * 0.95; // Lower rim

        const dotSize = 0.4 + (1 - r) * 0.65;
        ctx.beginPath();
        ctx.arc(px, py, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.strokeStyle = p.coneOutlineColor ?? "rgba(0,0,0,0.5)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.restore();
}

export function drawConeflowerHead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    p: ConeflowerHeadParams,
    stemEndAngle: number,
): void {
    ctx.save();
    ctx.translate(x, y);
    const headRotation = stemEndAngle + Math.PI / 2;
    ctx.rotate(headRotation);

    const petals: ConeflowerPetalLayout[] = [];
    for (let i = 0; i < p.petalCount; i++) {
        const theta = (i / p.petalCount) * Math.PI * 2 + (p.petalAngleOffsets?.[i] ?? 0);
        petals.push(buildConeflowerPetal(theta, p.petalLengthMultipliers?.[i] ?? 1, p, headRotation));
    }

    const backPetals = petals
        .filter(pe => pe.attachY < 0)
        .sort((a, b) => a.attachY - b.attachY);
    const frontPetals = petals
        .filter(pe => pe.attachY >= 0)
        .sort((a, b) => a.attachY - b.attachY);

    backPetals.forEach(pe => drawConeflowerPetal(ctx, pe, p));
    drawConeDome(ctx, p);
    frontPetals.forEach(pe => drawConeflowerPetal(ctx, pe, p));

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
