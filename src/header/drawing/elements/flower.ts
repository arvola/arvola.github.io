import { SpecDrawingFunc } from "./base.ts";
import { applyPalette, ColorPalette, darken, lighten } from "../color.ts";

export interface Point { x: number; y: number; }
export interface StemCurve { p0: Point; p1: Point; p2: Point; }

export interface FlowerColorStop {
    offset: number;
    hex: string;
}

export type FlowerColorSpec =
    | { type: "single"; baseHex: string }
    | { type: "multi"; stops: FlowerColorStop[] };

export interface StemParams {
    length: number;
    thickness: number;
    baseAngle: number;
    curveStrength: number;
    color: FlowerColorSpec;
    outlineColor?: string;
}

export interface LeafInstance {
    t: number;
    side: 1 | -1;
    angleOffset: number;
    size: number;
    widthRatio: number;
    isSerrated?: boolean;
    serrationCount?: number;
    serrationDepth?: number;
    color: FlowerColorSpec;
    outlineColor?: string;
    shape?: "arrow" | "teardrop";
}

export interface LeafParams {
    instances: LeafInstance[];
}

export interface PetalParams {
    petalCount: number;
    petalLength: number;
    petalWidth: number;
    petalDroop: number;
    petalColor: FlowerColorSpec;
    petalOutlineColor?: string;
    petalAngleOffsets: number[];
    petalLengthMultipliers: number[];
    petalShape?: "pointed" | "elliptical" | "notched";
}

export interface FlowerHeadParams extends PetalParams {
    type?: "petal";
    discRadius: number;
    discDomeHeight: number;
    discColor: FlowerColorSpec;
    discOutlineColor?: string;
    backPetals?: PetalParams;
    palette?: ColorPalette;
}

export interface GoldenAlexanderClusterParams {
    circleCount: number;
    radius: number;
    spread: number;
    color: FlowerColorSpec;
    speckleColor: string;
    outlineColor?: string;
    palette?: ColorPalette;
}

export interface GoldenAlexanderHeadParams {
    type: "golden-alexander";
    splitStemCount: number;
    splitStemLength: number;
    splitStemThickness: number;
    fanAngle: number;
    upwardCurveStrength: number;
    splitStemColor: FlowerColorSpec;
    splitStemOutlineColor?: string;
    cluster: GoldenAlexanderClusterParams;
    palette?: ColorPalette;
}

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

export type FlowerHeadSpec = FlowerHeadParams | GoldenAlexanderHeadParams | ConeflowerHeadParams;

export interface SpeciesProfile {
    stem: StemParams;
    leaf: LeafParams;
    head: FlowerHeadSpec;
}

export interface FlowerSpec {
    type: "flower";
    x: number;
    y: number;
    species: SpeciesProfile;
    palette?: ColorPalette;
}

function tintColorSpec(spec: FlowerColorSpec, palette: ColorPalette): FlowerColorSpec {
    if (spec.type === "single") {
        return { type: "single", baseHex: applyPalette(spec.baseHex, palette) };
    }
    return {
        type: "multi",
        stops: spec.stops.map(s => ({ offset: s.offset, hex: applyPalette(s.hex, palette) })),
    };
}

function tintSpecies(species: SpeciesProfile, palette: ColorPalette | undefined): SpeciesProfile {
    if (!palette) return species;
    const stem: StemParams = {
        ...species.stem,
        color: tintColorSpec(species.stem.color, palette),
        outlineColor: species.stem.outlineColor && applyPalette(species.stem.outlineColor, palette),
    };
    const leaf: LeafParams = {
        instances: species.leaf.instances.map(l => ({
            ...l,
            color: tintColorSpec(l.color, palette),
            outlineColor: l.outlineColor && applyPalette(l.outlineColor, palette),
        })),
    };
    let head: FlowerHeadSpec;
    if (species.head.type === "golden-alexander") {
        head = {
            ...species.head,
            splitStemColor: tintColorSpec(species.head.splitStemColor, palette),
            splitStemOutlineColor: species.head.splitStemOutlineColor && applyPalette(species.head.splitStemOutlineColor, palette),
            cluster: {
                ...species.head.cluster,
                color: tintColorSpec(species.head.cluster.color, palette),
                speckleColor: applyPalette(species.head.cluster.speckleColor, palette),
                outlineColor: species.head.cluster.outlineColor && applyPalette(species.head.cluster.outlineColor, palette),
                palette,
            },
            palette,
        };
    } else if (species.head.type === "coneflower") {
        head = {
            ...species.head,
            coneColor: tintColorSpec(species.head.coneColor, palette),
            coneOutlineColor: species.head.coneOutlineColor && applyPalette(species.head.coneOutlineColor, palette),
            petalColor: tintColorSpec(species.head.petalColor, palette),
            petalOutlineColor: species.head.petalOutlineColor && applyPalette(species.head.petalOutlineColor, palette),
            petalCenterVeinColor: species.head.petalCenterVeinColor && applyPalette(species.head.petalCenterVeinColor, palette),
            palette,
        };
    } else {
        head = {
            ...species.head,
            discColor: tintColorSpec(species.head.discColor, palette),
            discOutlineColor: species.head.discOutlineColor && applyPalette(species.head.discOutlineColor, palette),
            petalColor: tintColorSpec(species.head.petalColor, palette),
            petalOutlineColor: species.head.petalOutlineColor && applyPalette(species.head.petalOutlineColor, palette),
            backPetals: species.head.backPetals && {
                ...species.head.backPetals,
                petalColor: tintColorSpec(species.head.backPetals.petalColor, palette),
                petalOutlineColor: species.head.backPetals.petalOutlineColor && applyPalette(species.head.backPetals.petalOutlineColor, palette),
            },
            palette,
        };
    }
    return { stem, leaf, head };
}

export const drawFlower: SpecDrawingFunc<FlowerSpec> = (spec, { ctx }) => {
    generateFlower(ctx, spec.x, spec.y, tintSpecies(spec.species, spec.palette));
};

export function getBezierPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
    const u = 1 - t;
    return {
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
}

export function getBezierTangentAngle(t: number, p0: Point, p1: Point, p2: Point): number {
    const u = 1 - t;
    const dx = 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
    const dy = 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
    return Math.atan2(dy, dx);
}

export const adjustBrightness = (hex: string, p: number) =>
    p < 0 ? darken(hex, -p) : p > 0 ? lighten(hex, p) : hex;

export function createLinearGradientFromSpec(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    colorSpec: FlowerColorSpec,
): CanvasGradient {
    const grad = ctx.createLinearGradient(startX, startY, endX, endY);
    if (colorSpec.type === "single") {
        grad.addColorStop(0.0, adjustBrightness(colorSpec.baseHex, -0.15));
        grad.addColorStop(1.0, adjustBrightness(colorSpec.baseHex, 0.1));
    } else {
        colorSpec.stops.forEach(s => grad.addColorStop(s.offset, s.hex));
    }
    return grad;
}

function createRadialDiscGradient(
    ctx: CanvasRenderingContext2D,
    radius: number,
    domeHeight: number,
    colorSpec: FlowerColorSpec,
): CanvasGradient {
    const grad = ctx.createRadialGradient(0, -radius * 0.3 - domeHeight * 0.4, 0, 0, 0, radius);
    if (colorSpec.type === "single") {
        grad.addColorStop(0.0, adjustBrightness(colorSpec.baseHex, 0.15));
        grad.addColorStop(1.0, adjustBrightness(colorSpec.baseHex, -0.2));
    } else {
        colorSpec.stops.forEach(s => grad.addColorStop(s.offset, s.hex));
    }
    return grad;
}

function drawTeardrop(ctx: CanvasRenderingContext2D, len: number, w: number): void {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.3, -w / 2, len * 0.7, -w / 2, len, 0);
    ctx.bezierCurveTo(len * 0.7, w / 2, len * 0.3, w / 2, 0, 0);
    ctx.closePath();
}

function drawArrowLeaf(
    ctx: CanvasRenderingContext2D,
    len: number,
    w: number,
): void {
    const halfW = w / 2;
    const sideInset = len * 0.22;
    const baseInset = len * 0.15;
    const tipX = len;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Upper side: curved inward to a sharp tip.
    ctx.quadraticCurveTo(sideInset, -halfW, tipX, 0);
    // Lower side: mirror curve to keep a pointed arrow-head profile.
    ctx.quadraticCurveTo(sideInset, halfW, 0, 0);
    // Base edge: slight inward notch (concave third edge).
    ctx.quadraticCurveTo(baseInset, 0, 0, 0);

    ctx.closePath();
}

function drawEllipsePetal(ctx: CanvasRenderingContext2D, len: number, w: number): void {
    ctx.beginPath();
    ctx.ellipse(len / 2, 0, len / 2, w / 2, 0, 0, Math.PI * 2);
    ctx.closePath();
}

function drawNotchedPetal(ctx: CanvasRenderingContext2D, len: number, w: number): void {
    // Coreopsis-style wedge: narrow base, widest at tip, tip divided into three rounded teeth
    // with pronounced notches between them.
    const halfW = w / 2;
    const baseHalfW = halfW * 0.18;
    const shoulderX = len * 0.88;
    const notchDepth = len * 0.16;
    const sideToothInnerY = halfW * 0.68;
    const middleToothInnerY = halfW * 0.24;
    const middleToothBulge = notchDepth * 0.15;

    ctx.beginPath();
    ctx.moveTo(0, -baseHalfW);
    // Upper edge: gradual outward curve from base to shoulder of upper tooth.
    ctx.bezierCurveTo(len * 0.28, -halfW * 0.55, len * 0.7, -halfW * 0.98, shoulderX, -halfW);
    // Upper (outer) tooth: round around outer corner, then inward to upper notch.
    ctx.quadraticCurveTo(len, -halfW, len, -sideToothInnerY);
    ctx.quadraticCurveTo(len - notchDepth, -middleToothInnerY, len, -middleToothInnerY);
    // Middle tooth: slight outward bulge across center.
    ctx.quadraticCurveTo(len + middleToothBulge, 0, len, middleToothInnerY);
    // Lower notch + lower (outer) tooth, mirrored.
    ctx.quadraticCurveTo(len - notchDepth, middleToothInnerY, len, sideToothInnerY);
    ctx.quadraticCurveTo(len, halfW, shoulderX, halfW);
    // Lower edge: back to base.
    ctx.bezierCurveTo(len * 0.7, halfW * 0.98, len * 0.28, halfW * 0.55, 0, baseHalfW);
    ctx.closePath();
}

const applyDroop = (ctx: CanvasRenderingContext2D, d: number) =>
    d > 0 && ctx.transform(1, d * 0.35, 0, 1 - d * 0.15, 0, 0);

export function computeStemCurve(startX: number, startY: number, p: StemParams): StemCurve {
    const endX = startX + Math.cos(p.baseAngle) * p.length;
    const endY = startY + Math.sin(p.baseAngle) * p.length;
    const normal = p.baseAngle - Math.PI / 2;
    const offset = p.curveStrength * p.length;
    const cpX = (startX + endX) / 2 + Math.cos(normal) * offset;
    const cpY = (startY + endY) / 2 + Math.sin(normal) * offset;

    return { p0: { x: startX, y: startY }, p1: { x: cpX, y: cpY }, p2: { x: endX, y: endY } };
}

export function drawStemCurve(ctx: CanvasRenderingContext2D, stem: StemCurve, p: StemParams): void {
    ctx.save();
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(stem.p0.x, stem.p0.y);
    ctx.quadraticCurveTo(stem.p1.x, stem.p1.y, stem.p2.x, stem.p2.y);
    
    ctx.lineWidth = p.thickness + 0.2;
    ctx.strokeStyle = p.outlineColor ?? "rgba(0, 0, 0, 0.5)";
    ctx.stroke();

    ctx.strokeStyle = createLinearGradientFromSpec(ctx, stem.p0.x, stem.p0.y, stem.p2.x, stem.p2.y, p.color);
    ctx.lineWidth = p.thickness;
    ctx.stroke();
    ctx.restore();
}

export function drawStem(ctx: CanvasRenderingContext2D, startX: number, startY: number, p: StemParams): StemCurve {
    const stem = computeStemCurve(startX, startY, p);
    drawStemCurve(ctx, stem, p);
    return stem;
}

export function drawLeaves(ctx: CanvasRenderingContext2D, stem: StemCurve, params: LeafParams): void {
    params.instances.forEach(leaf => {
        const pos = getBezierPoint(leaf.t, stem.p0, stem.p1, stem.p2);
        const tangentAngle = getBezierTangentAngle(leaf.t, stem.p0, stem.p1, stem.p2);
        const finalAngle = tangentAngle + (Math.PI / 2 + leaf.angleOffset) * leaf.side;

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(finalAngle);

        const s = Math.sin(finalAngle), c = Math.cos(finalAngle);
        const L = leaf.size, W = L * leaf.widthRatio;
        const r = (Math.abs(s) * L + Math.abs(c) * W) / 2;
        const cx = L / 2;

        ctx.fillStyle = createLinearGradientFromSpec(ctx, cx + r * s, r * c, cx - r * s, -r * c, leaf.color);
        if (leaf.shape === "arrow") {
            drawArrowLeaf(ctx, L, W);
        } else {
            drawTeardrop(ctx, L, W);
        }
        ctx.fill();
        ctx.lineWidth = 0.2;
        ctx.strokeStyle = leaf.outlineColor ?? "rgba(0, 0, 0, 0.5)";
        ctx.stroke();
        ctx.restore();
    });
}

function drawPetalRing(ctx: CanvasRenderingContext2D, p: PetalParams): void {
    const step = (2 * Math.PI) / p.petalCount;
    const shape = p.petalShape ?? "elliptical";

    ctx.lineWidth = 1;
    ctx.strokeStyle = p.petalOutlineColor ?? "rgba(0, 0, 0, 0.5)";
    for (let i = 0; i < p.petalCount; i++) {
        const len = p.petalLength * (p.petalLengthMultipliers[i] ?? 1);
        ctx.save();
        ctx.rotate(i * step + (p.petalAngleOffsets[i] ?? 0));
        applyDroop(ctx, p.petalDroop);
        if (shape === "pointed") {
            drawTeardrop(ctx, len, p.petalWidth);
        } else if (shape === "notched") {
            drawNotchedPetal(ctx, len, p.petalWidth);
        } else {
            drawEllipsePetal(ctx, len, p.petalWidth);
        }
        ctx.stroke();
        ctx.restore();
    }

    for (let i = 0; i < p.petalCount; i++) {
        const len = p.petalLength * (p.petalLengthMultipliers[i] ?? 1);
        ctx.save();
        ctx.rotate(i * step + (p.petalAngleOffsets[i] ?? 0));
        applyDroop(ctx, p.petalDroop);
        ctx.fillStyle = createLinearGradientFromSpec(ctx, 0, 0, len, 0, p.petalColor);
        if (shape === "pointed") {
            drawTeardrop(ctx, len, p.petalWidth);
        } else if (shape === "notched") {
            drawNotchedPetal(ctx, len, p.petalWidth);
        } else {
            drawEllipsePetal(ctx, len, p.petalWidth);
        }
        ctx.fill();
        ctx.restore();
    }
}

export function drawFlowerHead(ctx: CanvasRenderingContext2D, x: number, y: number, p: FlowerHeadParams): void {
    ctx.save();
    ctx.translate(x, y);
    if (p.backPetals) drawPetalRing(ctx, p.backPetals);
    drawPetalRing(ctx, p);
    ctx.fillStyle = createRadialDiscGradient(ctx, p.discRadius, p.discDomeHeight, p.discColor);
    ctx.beginPath();
    if (p.discDomeHeight > 0) ctx.ellipse(0, 0, p.discRadius, p.discRadius + p.discDomeHeight, 0, Math.PI, 0);
    else ctx.arc(0, 0, p.discRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = p.discOutlineColor ?? "rgba(0, 0, 0, 0.5)";
    ctx.stroke();
    ctx.restore();
}

function drawGoldenAlexanderCluster(ctx: CanvasRenderingContext2D, p: GoldenAlexanderClusterParams): void {
    ctx.save();
    ctx.lineWidth = 0.25;
    ctx.strokeStyle = p.outlineColor ?? applyPalette("rgba(124, 95, 0, 0.45)", p.palette);
    for (let i = 0; i < p.circleCount; i++) {
        const angle = i * Math.PI * (3 - Math.sqrt(5));
        const distance = p.spread * Math.sqrt(i / Math.max(1, p.circleCount - 1));
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance * 0.65;
        const radius = p.radius * (0.82 + Math.sin(i * 2.17) * 0.14);

        ctx.fillStyle = createRadialDiscGradient(ctx, radius, radius * 0.3, p.color);
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
        const normalized = p.splitStemCount > 1 ? i / (p.splitStemCount - 1) : 0.5;
        const side = normalized < 0.5 ? -1 : normalized > 0.5 ? 1 : 0;
        const sideIndex = side < 0 ? i : p.splitStemCount - 1 - i;
        const sideNormalized = side === 0 ? 1 : sideIndex / Math.max(1, halfSplitCount - 1);
        const splitAngle = side * (maxSplitAngle - (maxSplitAngle - minSplitAngle) * sideNormalized);
        const angle = mainStemAngle + splitAngle;
        const lengthTier = i % 2 === 0 ? 1 : 0.6;
        const length = p.splitStemLength * lengthTier * (0.82 + Math.sin(i * 1.71) * 0.1 + Math.sin(normalized * Math.PI) * 0.14);
        const curveDirection = side < 0 ? 1 : side > 0 ? -1 : 0;
        stems.push(computeStemCurve(x, y, {
            length,
            thickness: p.splitStemThickness,
            baseAngle: angle,
            curveStrength: p.upwardCurveStrength * curveDirection,
            color: p.splitStemColor,
            outlineColor: p.splitStemOutlineColor,
        }));
    }

    stems.forEach(stem => drawStemCurve(ctx, stem, {
        length: 0,
        thickness: p.splitStemThickness,
        baseAngle: 0,
        curveStrength: 0,
        color: p.splitStemColor,
        outlineColor: p.splitStemOutlineColor,
    }));
    stems.forEach(stem => {
        ctx.save();
        ctx.translate(stem.p2.x, stem.p2.y);
        ctx.rotate(mainStemAngle + Math.PI / 2);
        drawGoldenAlexanderCluster(ctx, p.cluster);
        ctx.restore();
    });
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

    const grad = createLinearGradientFromSpec(ctx, pe.attachX, pe.attachY, pe.tipX, pe.tipY, p.petalColor);

    ctx.beginPath();
    ctx.moveTo(upperBaseX, upperBaseY);
    ctx.bezierCurveTo(upperC1x, upperC1y, upperC2x, upperC2y, upperTipX, upperTipY);
    ctx.bezierCurveTo(tipCapC1x, tipCapC1y, tipCapC2x, tipCapC2y, lowerTipX, lowerTipY);
    ctx.bezierCurveTo(lowerC1x, lowerC1y, lowerC2x, lowerC2y, lowerBaseX, lowerBaseY);
    ctx.bezierCurveTo(baseCapC1x, baseCapC1y, baseCapC2x, baseCapC2y, upperBaseX, upperBaseY);
    ctx.closePath();

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = p.petalOutlineColor ?? "rgba(0, 0, 0, 0.4)";
    ctx.stroke();
}

function drawConeDomePath(ctx: CanvasRenderingContext2D, p: ConeflowerHeadParams): void {
    ctx.beginPath();
    ctx.moveTo(-p.coneWidth, 0);
    ctx.ellipse(0, 0, p.coneWidth, p.coneHeight, 0, Math.PI, 2 * Math.PI);
    ctx.ellipse(0, 0, p.coneWidth, p.coneRimDepth, 0, 0, Math.PI);
    ctx.closePath();
}

function drawConeDome(ctx: CanvasRenderingContext2D, p: ConeflowerHeadParams): void {
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
    ctx.strokeStyle = p.coneOutlineColor ?? applyPalette("rgba(60, 25, 8, 0.7)", p.palette);
    ctx.stroke();

    const highlight = ctx.createRadialGradient(
        -p.coneWidth * 0.25,
        -p.coneHeight * 0.55,
        0,
        -p.coneWidth * 0.25,
        -p.coneHeight * 0.55,
        p.coneWidth * 0.6,
    );
    highlight.addColorStop(0, applyPalette("rgba(255, 220, 170, 0.35)", p.palette));
    highlight.addColorStop(1, applyPalette("rgba(255, 220, 170, 0)", p.palette));
    ctx.save();
    drawConeDomePath(ctx, p);
    ctx.clip();
    ctx.fillStyle = highlight;
    ctx.fillRect(-p.coneWidth * 1.2, -p.coneHeight * 1.2, p.coneWidth * 2.4, (p.coneHeight + p.coneRimDepth) * 1.2);
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
        const theta = (i / p.petalCount) * 2 * Math.PI + (p.petalAngleOffsets[i] ?? 0);
        const lengthMul = p.petalLengthMultipliers[i] ?? 1;
        petals.push(buildConeflowerPetal(theta, lengthMul, p, headRotation));
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

export function generateFlower(ctx: CanvasRenderingContext2D, x: number, y: number, species: SpeciesProfile): void {
    const stem = computeStemCurve(x, y, species.stem);
    drawLeaves(ctx, stem, species.leaf);
    drawStemCurve(ctx, stem, species.stem);
    if (species.head.type === "golden-alexander") {
        const stemEndAngle = getBezierTangentAngle(1, stem.p0, stem.p1, stem.p2);
        drawGoldenAlexanderHead(ctx, stem.p2.x, stem.p2.y, species.head, stemEndAngle);
    } else if (species.head.type === "coneflower") {
        const stemEndAngle = getBezierTangentAngle(1, stem.p0, stem.p1, stem.p2);
        drawConeflowerHead(ctx, stem.p2.x, stem.p2.y, species.head, stemEndAngle);
    } else {
        drawFlowerHead(ctx, stem.p2.x, stem.p2.y, species.head);
    }
}
