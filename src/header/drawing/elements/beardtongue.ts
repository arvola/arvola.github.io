import {
    createLinearGradientFromSpec,
    createRadialGradientFromSpec,
    FlowerColorSpec,
    getBezierPoint,
    getBezierTangentAngle,
    SpeciesProfile,
    StemCurve,
} from "./flower-primitives.ts";
import { ColorPalette } from "../color.ts";

export interface BeardtongueHeadParams {
    type: "beardtongue";
    /** Length of the oval corolla tube along the stem axis. */
    tubeLength: number;
    /** Width of the oval corolla tube. */
    tubeWidth: number;
    tubeColor: FlowerColorSpec;
    tubeOutlineColor?: string;
    /** Tip distance of the two upper-lip lobes from the mouth center. */
    upperLobeReach: number;
    /** Tip distance of the three lower-lip lobes from the mouth center. */
    lowerLobeReach: number;
    lobeColor: FlowerColorSpec;
    lobeOutlineColor?: string;

    throatOutlineColor?: string;
    /** Spots scattered across the tube (calico = spotted). */
    speckleColor?: string;
    speckleCount?: number;
    speckleSeed?: number;
    /** Nod direction in radians: 0 = hangs straight down, positive leans left, negative right. */
    nodAngle?: number;

    // --- Inflorescence arrangement ---
    // Beardtongues carry their flowers in opposite pairs spaced up the stem, each flower held out
    // on a short curved pedicel. These params lay out that array; with tierCount <= 1 the head
    // collapses to a single flower at the stem tip.
    /** Number of paired tiers along the upper stem (each tier = one flower per side). */
    tierCount?: number;
    /** Distance along the stem axis between adjacent tiers. */
    tierSpacing?: number;
    /** Gap from the stem tip down to the topmost tier. */
    topOffset?: number;
    /** Lateral reach of the topmost pedicel from the stem out to its flower. */
    pedicelLength?: number;
    /** Height the pedicel arches up before the flower hangs (along the stem axis). */
    pedicelArch?: number;
    /** Fraction the pedicel reach/arch shrinks per tier going down (0 = uniform). */
    pedicelShrink?: number;
    pedicelThickness?: number;
    pedicelColor?: FlowerColorSpec;
    pedicelOutlineColor?: string;
    /** Outward lean of each flower tube away from the stem, in radians. */
    flowerNod?: number;
    /** Per-tier size growth from top to bottom (0 = uniform, positive = larger toward base). */
    tierScaleStep?: number;
    palette?: ColorPalette;
}

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
        { offset: 0.0, hex: "#cf9fbd" }, // pale upper lip
        { offset: 0.55, hex: "#edc6dd" },
        { offset: 1.0, hex: "#fde6f2" }, // slightly deeper lower lip
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
const throatOutline = "#bc90b8";
const speckleColor = "rgba(120, 60, 95, 0.5)";
const stemOutline = "#3b5028";
const leafOutline = "#4c6a2c";

interface BeardtongueLobe {
    /** Direction of the lobe tip in screen radians (-π/2 points up). */
    angle: number;
    /** Tip distance from the mouth center. */
    reach: number;
    /** Angular half-support of the raised-cosine bump, in radians. */
    halfWidth: number;
}

function drawTube(
    ctx: CanvasRenderingContext2D,
    p: BeardtongueHeadParams,
    cutY: number,
): void {
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
    // Vertical gradient starts at the top of the tube (cy - ry) and goes down to the bottom
    // (cy + ry), preserving the tube's tilt via the saved transform.
    ctx.fillStyle = createLinearGradientFromSpec(
        ctx,
        0,
        cy - ry,
        0,
        cy + ry,
        p.tubeColor,
    );
    ctx.fill();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = p.tubeOutlineColor ?? "rgba(0, 0, 0, 0.4)";
    ctx.stroke();
    ctx.restore();
}

function drawTubeSpeckles(
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

interface FaceNotch {
    /** Angle (screen radians) where the inward cleft is carved. */
    angle: number;
    halfWidth: number;
    depth: number;
}

function buildBeardtongueFacePath(
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
                    (lobe.reach - valleyR) * 0.6 * (1 + Math.cos(Math.PI * x));
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

function drawSingleBeardtongueFlower(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    params: BeardtongueHeadParams,
    tubeAngle: number,
    scale: number,
): void {
    // Beardtongue flowers nod: the narrow tube tilts/hangs along tubeAngle. The mouth, however,
    // is drawn gravity-aligned (three lobes always point down) and only sheared to hint at the
    // tube's 3D turn — turning the flower must not swing the lobes sideways.
    const p: BeardtongueHeadParams =
        scale === 1
            ? params
            : {
                  ...params,
                  tubeLength: params.tubeLength * scale,
                  tubeWidth: params.tubeWidth * scale,
                  upperLobeReach: params.upperLobeReach * scale,
                  lowerLobeReach: params.lowerLobeReach * scale,
              };
    const minReach = Math.min(p.upperLobeReach, p.lowerLobeReach);

    // Mouth opening sits partway down the tube, near the oval's center.
    const cutY = p.tubeLength * 0.62;

    // Tube (tilted), clipped at the mouth, then its spots.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tubeAngle);
    drawTube(ctx, p, cutY);
    ctx.restore();

    // World position of the mouth, walked out along the tilted tube axis.
    const dirX = -Math.sin(tubeAngle);
    const dirY = Math.cos(tubeAngle);
    const mx = x + dirX * cutY;
    const my = y + dirY * cutY;

    // Five lobes in two lips, gravity-aligned: a wide lower trio pointing down (+y) and a
    // smaller upper pair folding back over the throat (-y). Wide gaps at the corners (no lobe
    // near 0°/180°) pinch the face into a two-lipped mouth.
    const D = Math.PI / 180;
    const lobes: BeardtongueLobe[] = [
        { angle: 48 * D, reach: p.lowerLobeReach, halfWidth: 0.82 }, // lower-right
        { angle: 90 * D, reach: p.lowerLobeReach * 1.05, halfWidth: 0.68 }, // lower-middle
        { angle: 132 * D, reach: p.lowerLobeReach , halfWidth: 0.82 }, // lower-left
        { angle: -148 * D, reach: p.upperLobeReach, halfWidth: 1 }, // upper-left
        { angle: -62 * D, reach: p.upperLobeReach, halfWidth: 1 }, // upper-right
    ];
    const valleyR = minReach * 0.92;
    const squashY = 0.82;
    const shear = Math.sin(tubeAngle) * 0.55;
    // Carve a small cleft at the very top so the two upper lobes read as rounded halves meeting
    // in the middle rather than one flat shoulder.
    const notch: FaceNotch = {
        angle: -Math.PI / 2,
        halfWidth: 0.42,
        depth: p.upperLobeReach * 0.2,
    };

    ctx.save();
    ctx.translate(mx, my);
    // Horizontal shear fakes the perspective of the opening rotating with the tube while the
    // lobe layout stays locked to gravity.
    ctx.transform(1, 0, shear, 1, 0, 0);

    buildBeardtongueFacePath(ctx, lobes, valleyR, squashY, notch);
    const throatCyForFace = -p.upperLobeReach * 0.05;
    const faceRadius = Math.max(p.upperLobeReach, p.lowerLobeReach) * 1.1;
    ctx.fillStyle = createRadialGradientFromSpec(
        ctx,
        0,
        throatCyForFace,
        faceRadius,
        p.lobeColor,
    );
    ctx.fill();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = p.lobeOutlineColor ?? "rgba(0, 0, 0, 0.4)";
    ctx.stroke();

    // Dark throat opening: a narrow horizontal oval, set toward the upper lip (the "inside"
    // seen above the mouth center).
    const throatRx = minReach * 0.45;
    const throatRy = minReach * 0.19;
    const throatCy = -p.upperLobeReach * 0.05;
    ctx.beginPath();
    ctx.ellipse(0, throatCy, throatRx, throatRy, 0, 0, Math.PI * 2);

    ctx.lineWidth = 0.5;
    ctx.strokeStyle = p.throatOutlineColor ?? "rgba(0, 0, 0, 0.45)";
    ctx.stroke();

    ctx.restore();
}

function drawPedicel(
    ctx: CanvasRenderingContext2D,
    ax: number,
    ay: number,
    cpx: number,
    cpy: number,
    fx: number,
    fy: number,
    p: BeardtongueHeadParams,
): void {
    const thickness = p.pedicelThickness ?? 2;
    ctx.save();
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(cpx, cpy, fx, fy);
    ctx.lineWidth = thickness + 0.4;
    ctx.strokeStyle = p.pedicelOutlineColor ?? stemOutline;
    ctx.stroke();
    ctx.strokeStyle = createLinearGradientFromSpec(
        ctx,
        ax,
        ay,
        fx,
        fy,
        p.pedicelColor ?? stemGreen,
    );
    ctx.lineWidth = thickness;
    ctx.stroke();
    ctx.restore();
}

/**
 * Walk the stem bezier from the tip (t=1) back toward the base, accumulating arc length until
 * `dist` has been travelled. Returns that point and the tangent angle pointing up-stem (toward
 * the tip). Tiers are attached along this real curve so they hug the stem all the way down
 * instead of drifting off a straight axis taken from the tip.
 */
function sampleStemFromTip(
    stem: StemCurve,
    dist: number,
): { x: number; y: number; angle: number } {
    const steps = 120;
    let prev = getBezierPoint(1, stem.p0, stem.p1, stem.p2);
    let acc = 0;
    for (let i = steps - 1; i >= 0; i--) {
        const t = i / steps;
        const pt = getBezierPoint(t, stem.p0, stem.p1, stem.p2);
        const seg = Math.hypot(pt.x - prev.x, pt.y - prev.y);
        if (acc + seg >= dist) {
            const f = seg > 0 ? (dist - acc) / seg : 0;
            return {
                x: prev.x + (pt.x - prev.x) * f,
                y: prev.y + (pt.y - prev.y) * f,
                // getBezierTangentAngle increases with t, so it already points up-stem.
                angle: getBezierTangentAngle(t, stem.p0, stem.p1, stem.p2),
            };
        }
        acc += seg;
        prev = pt;
    }
    return {
        x: prev.x,
        y: prev.y,
        angle: getBezierTangentAngle(0, stem.p0, stem.p1, stem.p2),
    };
}

export function drawBeardtongueHead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    p: BeardtongueHeadParams,
    stemEndAngle: number,
    stem?: StemCurve,
): void {
    const tierCount = p.tierCount ?? 1;
    if (tierCount <= 1) {
        drawSingleBeardtongueFlower(ctx, x, y, p, p.nodAngle ?? 0, 1);
        return;
    }

    const spacing = p.tierSpacing ?? p.tubeLength * 0.9;
    // Topmost tier sits at (or just below) the very tip so the bare stem doesn't poke out above
    // the flowers — its upswept pedicels cover the tip.
    const topOffset = p.topOffset ?? 0;
    const out = p.pedicelLength ?? p.tubeWidth * 0.8;
    const arch = p.pedicelArch ?? out * 0.7;
    const shrink = p.pedicelShrink ?? 0;
    const flowerNod = p.flowerNod ?? 0.35;
    const scaleStep = p.tierScaleStep ?? 0;

    // Draw bottom tiers first so each higher tier layers in front of the one below it, matching
    // how a spike's upper flowers overlap the ones beneath them.
    for (let i = tierCount - 1; i >= 0; i--) {
        const d = topOffset + i * spacing;
        // Attach point + local stem axes, taken from the actual curve at this depth so pedicels
        // stay anchored to the stem as it bends. (ux, uy) points up-stem; perp is its +x side.
        const sample = stem
            ? sampleStemFromTip(stem, d)
            : { x: x - Math.cos(stemEndAngle) * d, y: y - Math.sin(stemEndAngle) * d, angle: stemEndAngle };
        const ax = sample.x;
        const ay = sample.y;
        const ux = Math.cos(sample.angle);
        const uy = Math.sin(sample.angle);
        const perpX = -uy;
        const perpY = ux;

        // Pedicels shorten toward the base; the top one keeps its full reach/arch.
        const k = Math.pow(1 - shrink, i);
        const reach = out * k;
        const lift = arch * k;
        const drop = reach * 0.15;
        const scale = 1 + i * scaleStep;

        for (const side of [-1, 1] as const) {
            const fx = ax + perpX * side * reach + -ux * drop;
            const fy = ay + perpY * side * reach + -uy * drop;
            // Control point lifted up-stem and partway out gives the little upswept crook.
            const cpx = ax + perpX * side * reach * 0.55 + ux * lift;
            const cpy = ay + perpY * side * reach * 0.55 + uy * lift;

            drawPedicel(ctx, ax, ay, cpx, cpy, fx, fy, p);
            // Negative tubeAngle leans right; pair each flower so it tilts away from the stem.
            drawSingleBeardtongueFlower(ctx, fx, fy, p, -side * flowerNod, scale);
        }
    }
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
    tierCount?: number;
    tierSpacing?: number;
    topOffset?: number;
    pedicelLength?: number;
    pedicelArch?: number;
    pedicelShrink?: number;
    pedicelThickness?: number;
    flowerNod?: number;
    tierScaleStep?: number;
    leafSeed: number;
    leafScale?: number;
}): SpeciesProfile<BeardtongueHeadParams> {
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
                // Largest pair at the very base of the stem.
                {
                    t: 0.02,
                    side: -1,
                    angleOffset: -0.8 + Math.sin(opts.leafSeed * 0.7) * 0.05,
                    size: 72 * leafScale,
                    widthRatio: 0.35,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.02,
                    side: 1,
                    angleOffset: -0.8 - Math.cos(opts.leafSeed * 0.8) * 0.05,
                    size: 72 * leafScale,
                    widthRatio: 0.35,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                // Large basal pair low on the stem.
                {
                    t: 0.1,
                    side: -1,
                    angleOffset: -0.78 + Math.sin(opts.leafSeed * 0.9) * 0.05,
                    size: 56 * leafScale,
                    widthRatio: 0.34,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.11,
                    side: 1,
                    angleOffset: -0.78 - Math.cos(opts.leafSeed * 1.1) * 0.05,
                    size: 56 * leafScale,
                    widthRatio: 0.34,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.21,
                    side: -1,
                    angleOffset: -0.7 + Math.sin(opts.leafSeed) * 0.05,
                    size: 46 * leafScale,
                    widthRatio: 0.32,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.22,
                    side: 1,
                    angleOffset: -0.7 - Math.cos(opts.leafSeed) * 0.05,
                    size: 46 * leafScale,
                    widthRatio: 0.32,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.5,
                    side: 1,
                    angleOffset: -0.65 + Math.sin(opts.leafSeed * 1.7) * 0.05,
                    size: 28 * leafScale,
                    widthRatio: 0.3,
                    color: leafGreen,
                    outlineColor: leafOutline,
                    shape: "teardrop",
                },
                {
                    t: 0.54,
                    side: -1,
                    angleOffset: -0.65 - Math.cos(opts.leafSeed * 1.3) * 0.05,
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
            throatOutlineColor: throatOutline,
            speckleColor,
            speckleCount: opts.speckleCount ?? 14,
            speckleSeed: opts.speckleSeed ?? opts.leafSeed,
            nodAngle: opts.nodAngle,
            tierCount: opts.tierCount,
            tierSpacing: opts.tierSpacing,
            topOffset: opts.topOffset,
            pedicelLength: opts.pedicelLength,
            pedicelArch: opts.pedicelArch,
            pedicelShrink: opts.pedicelShrink,
            pedicelThickness: opts.pedicelThickness,
            flowerNod: opts.flowerNod,
            tierScaleStep: opts.tierScaleStep,
            pedicelColor: stemGreen,
            pedicelOutlineColor: stemOutline,
        },
    };
}
