import {
    BeardtongueHeadParams,
    createLinearGradientFromSpec,
    FlowerColorSpec,
    SpeciesProfile
} from "./flower.ts";

// Calico beardtongue (Penstemon calycosus): a dusty pink-lilac tubular corolla. The tube is
// shaded as a soft cylinder (darker edges, lit center) and the flared mouth lips are a touch
// paler, with a dark throat oval opening into the tube.
const tubePink: FlowerColorSpec = {
    type: "multi",
    stops: [
        { offset: 0.0, hex: "#d6a9c2" },
        { offset: 0.5, hex: "#b68aa3" },
        { offset: 1.0, hex: "#b68aa3" },
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
        { offset: 0.0, hex: "#9e7d95" },
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

export interface BeardtongueLobe {
    /** Direction of the lobe tip in screen radians (-π/2 points up). */
    angle: number;
    /** Tip distance from the mouth center. */
    reach: number;
    /** Angular half-support of the raised-cosine bump, in radians. */
    halfWidth: number;
}

export function drawTube(ctx: CanvasRenderingContext2D, p: BeardtongueHeadParams, cutY: number): void {
    // A tall narrow ellipse hanging from the attach point (+y), clipped flat at `cutY` so the
    // mouth sits near the oval's center rather than at its tip ("clipped oval").
    const cy = p.tubeLength / 2;
    const rx = p.tubeWidth / 2;
    const ry = p.tubeLength / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(-rx * 4, cy - ry - 2, rx * 8, cutY - (cy - ry - 2));
    ctx.clip();

    ctx.beginPath();
    ctx.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2);
    // Vertical gradient (light top, dark bottom).
    ctx.fillStyle = createLinearGradientFromSpec(ctx, 0, cy - ry, 0, cy + ry, p.tubeColor);
    ctx.fill();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = p.tubeOutlineColor ?? "rgba(0, 0, 0, 0.4)";
    ctx.stroke();
    ctx.restore();
}

export function drawTubeSpeckles(
    ctx: CanvasRenderingContext2D,
    p: BeardtongueHeadParams,
    cutY: number,
): void {
    if (!p.speckleColor || !p.speckleCount) return;

    const cy = p.tubeLength / 2;
    const rx = p.tubeWidth / 2;
    const ry = p.tubeLength / 2;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();

    let seed = (p.speckleSeed ?? 1) * 9973 + 1;
    const rand = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };

    ctx.fillStyle = p.speckleColor;
    for (let i = 0; i < p.speckleCount; i++) {
        const radial = Math.sqrt(rand());
        const ang = rand() * Math.PI * 2;
        const ex = Math.cos(ang) * radial * rx * 0.92;
        const ey = cy + Math.sin(ang) * radial * ry * 0.92;
        const dot = 0.4 + rand() * 0.7;
        if (ey >= cutY) continue;
        ctx.beginPath();
        ctx.ellipse(ex, ey, dot, dot * 1.4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

export interface FaceNotch {
    /** Angle (screen radians) where the inward cleft is carved. */
    angle: number;
    halfWidth: number;
    depth: number;
}

export function buildBeardtongueFacePath(
    ctx: CanvasRenderingContext2D,
    lobes: BeardtongueLobe[],
    valleyR: number,
    squashY: number,
    notch?: FaceNotch,
): void {
    const faceRadius = (theta: number): number => {
        let r = valleyR;
        for (const lobe of lobes) {
            let d = theta - lobe.angle;
            while (d > Math.PI) d -= Math.PI * 2;
            while (d < -Math.PI) d += Math.PI * 2;
            const x = d / lobe.halfWidth;
            if (Math.abs(x) < 1) {
                const bump =
                    valleyR +
                    (lobe.reach - valleyR) * 0.5 * (1 + Math.cos(Math.PI * x));
                if (bump > r) r = bump;
            }
        }
        if (notch) {
            let d = theta - notch.angle;
            while (d > Math.PI) d -= Math.PI * 2;
            while (d < -Math.PI) d += Math.PI * 2;
            const x = d / notch.halfWidth;
            if (Math.abs(x) < 1) {
                r -= notch.depth * 0.5 * (1 + Math.cos(Math.PI * x));
            }
        }
        return Math.max(0, r);
    };

    const steps = 160;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
        const theta = -Math.PI + (i / steps) * Math.PI * 2;
        const r = faceRadius(theta);
        const px = Math.cos(theta) * r;
        const py = Math.sin(theta) * r * squashY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

export function drawBeardtongueHead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    p: BeardtongueHeadParams,
    _stemEndAngle: number,
): void {
    // Beardtongue flowers nod: the narrow tube tilts/hangs along nodAngle. The mouth, however,
    // is drawn gravity-aligned (three lobes always point down) and only sheared to hint at the
    // tube's 3D turn — turning the flower must not swing the lobes sideways.
    const tubeAngle = p.nodAngle ?? 0;
    const minReach = Math.min(p.upperLobeReach, p.lowerLobeReach);

    // Mouth opening sits partway down the tube, near the oval's center.
    const mouthX = Math.cos(tubeAngle) * (p.tubeLength * 0.3);
    const mouthY = p.tubeLength * 0.45 + Math.sin(tubeAngle) * (p.tubeLength * 0.3);

    const squashY = 0.5 + Math.abs(Math.cos(tubeAngle)) * 0.35;
    const valleyR = minReach * 0.52;

    const upperLobes: BeardtongueLobe[] = [
        { angle: -Math.PI * 0.68, reach: p.upperLobeReach, halfWidth: 0.55 },
        { angle: -Math.PI * 0.32, reach: p.upperLobeReach, halfWidth: 0.55 },
    ];
    const lowerLobes: BeardtongueLobe[] = [
        { angle: Math.PI * 0.22, reach: p.lowerLobeReach, halfWidth: 0.55 },
        { angle: Math.PI * 0.5, reach: p.lowerLobeReach * 1.08, halfWidth: 0.65 },
        { angle: Math.PI * 0.78, reach: p.lowerLobeReach, halfWidth: 0.55 },
    ];

    ctx.save();
    ctx.translate(x, y);

    // Draw the tube first (it's "behind" the mouth lips).
    ctx.save();
    ctx.rotate(tubeAngle);
    drawTube(ctx, p, mouthY);
    drawTubeSpeckles(ctx, p, mouthY);
    ctx.restore();

    ctx.translate(mouthX, mouthY);

    // Back lip (upper lobes)
    ctx.save();
    buildBeardtongueFacePath(ctx, upperLobes, valleyR, squashY);
    ctx.fillStyle = createLinearGradientFromSpec(ctx, 0, -p.upperLobeReach, 0, 0, p.lobeColor);
    ctx.fill();
    ctx.strokeStyle = p.lobeOutlineColor ?? "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    // Throat interior (darker "hole").
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, valleyR * 0.9, valleyR * 0.8 * squashY, 0, 0, Math.PI * 2);
    ctx.fillStyle = createLinearGradientFromSpec(ctx, 0, -valleyR, 0, valleyR, p.throatColor);
    ctx.fill();
    ctx.strokeStyle = p.throatOutlineColor ?? "rgba(0,0,0,0.4)";
    ctx.lineWidth = 0.4;
    ctx.stroke();
    ctx.restore();

    // Front lip (lower lobes).
    ctx.save();
    // The lower lip has a slight notch at the very bottom center.
    const lowerNotch: FaceNotch = { angle: Math.PI / 2, halfWidth: 0.18, depth: p.lowerLobeReach * 0.12 };
    buildBeardtongueFacePath(ctx, lowerLobes, valleyR, squashY, lowerNotch);
    ctx.fillStyle = createLinearGradientFromSpec(ctx, 0, 0, 0, p.lowerLobeReach, p.lobeColor);
    ctx.fill();
    ctx.strokeStyle = p.lobeOutlineColor ?? "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
}

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
