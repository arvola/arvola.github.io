import { FlowerData } from "./spec.ts";
import { noise } from "../../../graphics.ts";
import { LeafParams, LeafShape } from "./leaves.ts";



export interface PositionNoiseOptions {
    /**
     * Base noise scale on X for the first octave.
     * Default: 0.02
     */
    scale1X?: number;
    /**
     * Base noise scale on Y for the first octave.
     * Default: 0.02
     */
    scale1Y?: number;
    /**
     * Base noise scale on X for the second octave.
     * Default: 0.02
     */
    scale2X?: number;
    /**
     * Base noise scale on Y for the second octave.
     * Default: 0.02
     */
    scale2Y?: number;
    /**
     * X offset applied to the second octave noise channel.
     * Default: 5.23
     */
    offset2X?: number;
    /**
     * Y offset applied to the second octave noise channel.
     * Default: -4.11
     */
    offset2Y?: number;
    /**
     * X offset for the independent per‑leaf variation channel.
     * Default: -3.7
     */
    varOffsetX?: number;
    /**
     * Y offset for the independent per‑leaf variation channel.
     * Default: 2.9
     */
    varOffsetY?: number;
    /**
     * Mixing weight for the first octave (n1) in the combined noise.
     * Default: 0.65
     */
    mixW1?: number;
    /**
     * Mixing weight for the second octave (n2) in the combined noise.
     * Default: 0.35
     */
    mixW2?: number;
}

export interface StemBandOptions {
    /**
     * Lower bound as a fraction along the stem from the base.
     * Range: 0..1. Default: 0.12
     */
    lowBand?: number;
    /**
     * Additional span above `lowBand` to distribute leaves within.
     * Range: 0..1. Default: 0.40
     */
    bandSpan?: number;
    /**
     * Absolute maximum fraction along the stem where leaves may appear.
     * Range: 0..1. Default: 0.60
     */
    hardCap?: number;
    /**
     * Minimum spacing between adjacent leaf attachment positions (in fraction of stem length).
     * Range: 0..1. Default: 0.12
     */
    minGap?: number;
    /**
     * Easing power shaping the bias toward lower positions (higher values push more leaves lower).
     * Default: 1.4
     */
    easePower?: number;
    /**
     * Threshold above which positions are compressed downward.
     * Range: 0..1. Default: 0.5
     */
    pushDownAbove?: number;
    /**
     * Compression factor applied to the amount above `pushDownAbove`.
     * Range: 0..1. Default: 0.4
     */
    pushDownFactor?: number;
}


const clamp01 = (v: number) => Math.max(0, Math.min(1, v));



// -----------------------------------------------------------------------------
// Simple parameter-based API (no callbacks) for generating leaves
// -----------------------------------------------------------------------------

export interface SimpleLeafGeometryOptions {
    /**
     * Base leaf width multiplier relative to `size`.
     * The final width is `size * (widthBase + widthVar * nMix)`.
     * Default: 0.30
     */
    widthBase?: number;
    /**
     * Additional width variation scaled by `nMix` (0..1).
     * Default: 0.10
     */
    widthVar?: number;
    /**
     * Base leaf length multiplier relative to `size`.
     * Default: 1.20
     */
    lengthBase?: number;
    /**
     * Additional length variation scaled by `nMix` (0..1).
     * Default: 0.60
     */
    lengthVar?: number;
    /**
     * Base petiole (leaf stem) length multiplier relative to `size`.
     * Default: 0.25
     */
    stemBase?: number;
    /**
     * Additional petiole length variation scaled by `nMix` (0..1).
     * Default: 0.10
     */
    stemVar?: number;
}

export interface SimpleLeafOrientationOptions {
    /**
     * Base rotation around the stem.
     * Range: 0..1 (0 = facing forward, 0.5 = profile). Default: 0.50
     */
    rotationBase?: number;
    /**
     * Side-dependent rotation bias added as ±value depending on left/right.
     * Default: 0.00
     */
    rotationSideBias?: number;
    /**
     * Additional rotation jitter scaled by `(nVar - 0.5)`.
     * Default: 0.00
     */
    rotationJitter?: number;
    /**
     * Base stem tilt (radians).
     * Default: 0.00
     */
    tiltBase?: number;
    /**
     * Additional tilt jitter scaled by `(nVar - 0.5)`.
     * Default: 0.00
     */
    tiltJitter?: number;
}

export interface SimpleLeafCurvatureOptions {
    /**
     * Base downward arch due to gravity.
     * Range: 0..1. Default: 0.00
     */
    archBase?: number;
    /**
     * Additional arch variation scaled by `nMix` (0..1).
     * Default: 0.00
     */
    archVar?: number;
    /**
     * Base initial upward lift near the leaf base before droop.
     * Range: 0..1. Default: 0.00
     */
    archUpBase?: number;
    /**
     * Additional upward lift variation scaled by `(1 - nMix)`.
     * Default: 0.00
     */
    archUpVar?: number;
}


export interface SimpleLeafOptions {
    /**
     * Number of leaves to generate.
     */
    count: number;
    /**
     * Leaf shape to render for all generated leaves.
     */
    shape: LeafShape;
    /**
     * Controls how leaves are distributed along the stem.
     */
    position?: StemBandOptions;
    /**
     * Noise parameters that drive spacing and per‑leaf variation.
     */
    noise?: PositionNoiseOptions;
    /**
     * Size-related parameters (width, length, petiole) for each leaf.
     */
    geometry?: SimpleLeafGeometryOptions;
    /**
     * Orientation around the stem and tilt relative to the stem.
     */
    orientation?: SimpleLeafOrientationOptions;
    /**
     * Curvature parameters for droop and initial upward lift.
     */
    curvature?: SimpleLeafCurvatureOptions;
}

/**
 * Generate leaves using only numeric parameters (no callbacks or extras).
 * This function handles placement along the stem and per‑leaf variation internally.
 */
export function generateLeaves(
    size: number,
    flower: FlowerData,
    options: SimpleLeafOptions,
): LeafParams[] {
    const {
        count,
        shape,
        position = {},
        noise: noiseOpts = {},
        geometry = {},
        orientation = {},
        curvature = {},
    } = options;

    const {
        widthBase = 0.30,
        widthVar = 0.10,
        lengthBase = 1.20,
        lengthVar = 0.60,
        stemBase = 0.25,
        stemVar = 0.10,
    } = geometry;

    const {
        rotationBase = 0.50,
        rotationSideBias = 0.00,
        rotationJitter = 0.00,
        tiltBase = 0.00,
        tiltJitter = 0.00,
    } = orientation;

    const {
        archBase = 0.00,
        archVar = 0.00,
        archUpBase = 0.00,
        archUpVar = 0.00,
    } = curvature;

    const {
        lowBand = 0.12,
        bandSpan = 0.40,
        hardCap = 0.60,
        minGap = 0.12,
        easePower = 1.4,
        pushDownAbove = 0.5,
        pushDownFactor = 0.4,
    } = position;

    const {
        scale1X = 0.02,
        scale1Y = 0.02,
        scale2X = 0.02,
        scale2Y = 0.02,
        offset2X = 5.23,
        offset2Y = -4.11,
        varOffsetX = -3.7,
        varOffsetY = 2.9,
        mixW1 = 0.65,
        mixW2 = 0.35,
    } = noiseOpts;

    const perLeafNoise = (i: number, ox: number = 0, oy: number = 0) => (
        1 + noise(
            flower.x * scale1X + i * 7.13 + ox,
            flower.y * scale1Y - i * 3.17 + oy,
        )
    ) / 2;

    type PosWithIdx = { idx: number; pos: number; nMix: number; nVar: number };
    const candidates: PosWithIdx[] = [];

    for (let i = 0; i < count; i++) {
        const n1 = perLeafNoise(i, 0.0, 0.0);
        const n2 = (
            1 + noise(
                flower.x * scale2X + i * 7.13 + offset2X,
                flower.y * scale2Y - i * 3.17 + offset2Y,
            )
        ) / 2;
        const nMix = clamp01(n1 * mixW1 + n2 * mixW2);
        const eased = Math.pow(nMix, easePower);
        let pos = lowBand + eased * bandSpan;
        if (pos > pushDownAbove) pos = pushDownAbove + (pos - pushDownAbove) * pushDownFactor;
        pos = Math.min(pos, hardCap);
        const nVar = perLeafNoise(i, varOffsetX, varOffsetY);
        candidates.push({ idx: i, pos, nMix, nVar });
    }

    // Enforce monotone spacing (bottom -> top)
    candidates.sort((a, b) => a.pos - b.pos);
    let last = lowBand - minGap;
    for (const c of candidates) {
        c.pos = Math.min(Math.max(c.pos, last + minGap), hardCap);
        last = c.pos;
    }
    // Restore original order (for side alternation stability)
    candidates.sort((a, b) => a.idx - b.idx);

    const results: LeafParams[] = [];
    for (let i = 0; i < candidates.length; i++) {
        const { pos: stemPos, nMix, nVar } = candidates[i];
        const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
        const width = size * (widthBase + widthVar * nMix);
        const length = size * (lengthBase + lengthVar * nMix);
        const stemLength = size * (stemBase + stemVar * nMix);
        const rotation = rotationBase + side * rotationSideBias + (nVar - 0.5) * rotationJitter;
        const tilt = tiltBase + (nVar - 0.5) * tiltJitter;
        const arch = archBase + archVar * nMix;
        const archUp = archUpBase + archUpVar * (1 - nMix);

        results.push({
            shape,
            stemPos,
            width,
            length,
            stemLength,
            rotation,
            tilt,
            arch,
            archUp,
        });
    }

    return results;
}
