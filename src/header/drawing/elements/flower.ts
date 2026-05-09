import { SpecDrawingFunc } from "./base.ts";
import { darken, lighten } from "../color.ts";

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
    petalShape?: "pointed" | "elliptical";
}

export interface FlowerHeadParams extends PetalParams {
    discRadius: number;
    discDomeHeight: number;
    discColor: FlowerColorSpec;
    discOutlineColor?: string;
    backPetals?: PetalParams;
}

export interface SpeciesProfile {
    stem: StemParams;
    leaf: LeafParams;
    head: FlowerHeadParams;
}

export interface FlowerSpec {
    type: "flower";
    x: number;
    y: number;
    species: SpeciesProfile;
}

export const drawFlower: SpecDrawingFunc<FlowerSpec> = (spec, { ctx }) => {
    generateFlower(ctx, spec.x, spec.y, spec.species);
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
    
    ctx.lineWidth = p.thickness + 1;
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
        ctx.lineWidth = 1;
        ctx.strokeStyle = leaf.outlineColor ?? "rgba(0, 0, 0, 0.5)";
        ctx.stroke();
        ctx.restore();
    });
}

function drawPetalRing(ctx: CanvasRenderingContext2D, p: PetalParams): void {
    const step = (2 * Math.PI) / p.petalCount;
    const shape = p.petalShape ?? "elliptical";

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = p.petalOutlineColor ?? "rgba(0, 0, 0, 0.5)";
    for (let i = 0; i < p.petalCount; i++) {
        const len = p.petalLength * (p.petalLengthMultipliers[i] ?? 1);
        ctx.save();
        ctx.rotate(i * step + (p.petalAngleOffsets[i] ?? 0));
        applyDroop(ctx, p.petalDroop);
        if (shape === "pointed") {
            drawTeardrop(ctx, len, p.petalWidth);
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
    ctx.lineWidth = 1;
    ctx.strokeStyle = p.discOutlineColor ?? "rgba(0, 0, 0, 0.5)";
    ctx.stroke();
    ctx.restore();
}

export function generateFlower(ctx: CanvasRenderingContext2D, x: number, y: number, species: SpeciesProfile): void {
    const stem = computeStemCurve(x, y, species.stem);
    drawLeaves(ctx, stem, species.leaf);
    drawStemCurve(ctx, stem, species.stem);
    drawFlowerHead(ctx, stem.p2.x, stem.p2.y, species.head);
}
