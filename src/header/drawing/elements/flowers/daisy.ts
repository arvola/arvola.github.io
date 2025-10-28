import { FlowerData } from "./spec.ts";
import {
    drawCircularPetals,
    drawFlowerCenter,
    getNoiseBasedColorVariation,
} from "./utils";
import { noise } from "../../../graphics.ts";
import { drawLeaves, LeafParams } from "./leaves.ts"; // Define daisy colors

// Define daisy colors
const DAISY_COLORS = {
    petals: "#f8f8e5",
    center: "#ffdd00",
    leaves: "#2e8b57",
};

/**
 * Draw daisy-specific leaves
 * Daisies typically have oval leaves with rounded tips or thread leaves
 */
function drawDaisyLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData,
) {
    // Use noise based on flower position to add variety
    const noiseValue = (1 + noise(flower.x * 0.01, flower.y * 0.01)) / 2;

    // Create leaf parameters based on noise
    const leafParams: LeafParams[] = [];

    // Decide how many main leaves with noise + size bias
    const countNoise = (1 + noise(flower.x * 0.021 + 13.1, flower.y * 0.019 - 7.7)) / 2;
    let mainLeafCount = 3;
    if (size < 8) {
        mainLeafCount = countNoise > 0.55 ? 3 : 2;
    } else if (size > 12) {
        mainLeafCount = countNoise > 0.74 ? 4 : 3;
    } else {
        mainLeafCount = countNoise > 0.82 ? 4 : 3;
    }

    // Helper to get a per-leaf noise value in [0,1]
    const perLeafNoise = (i: number, ox: number = 0, oy: number = 0) => (
        1 + noise(flower.x * 0.02 + i * 7.13 + ox, flower.y * 0.02 - i * 3.17 + oy)
    ) / 2;

    // Precompute candidate stem positions using multi-octave noise and keep leaves low on the stem
    const lowBand = 0.12; // 12% up from base
    const bandSpan = 0.40; // up to ~52%
    const hardCap = 0.60; // never above 60%
    const minGap = 0.12; // minimum spacing between leaf attachments in stem fraction

    type PosWithIdx = { idx: number; pos: number; nMix: number; nVar: number };
    const candidates: PosWithIdx[] = [];

    for (let i = 0; i < mainLeafCount; i++) {
        // Two different noise scales + offsets for richer variety
        const n1 = perLeafNoise(i, 0.0, 0.0);
        const n2 = perLeafNoise(i, 5.23, -4.11);
        const nMix = Math.min(1, Math.max(0, n1 * 0.65 + n2 * 0.35));
        // Ease to bias lower positions
        const eased = Math.pow(nMix, 1.4);
        let pos = lowBand + eased * bandSpan; // now 0.12..0.52 typical
        // Soft pushdown near the upper band and clamp to hard cap
        if (pos > 0.5) pos = 0.5 + (pos - 0.5) * 0.4;
        pos = Math.min(pos, hardCap);
        candidates.push({ idx: i, pos, nMix, nVar: perLeafNoise(i, -3.7, 2.9) });
    }

    // Enforce monotone spacing (bottom -> top) to avoid clustering
    candidates.sort((a, b) => a.pos - b.pos);
    let last = lowBand - minGap;
    for (const c of candidates) {
        c.pos = Math.min(Math.max(c.pos, last + minGap), hardCap);
        last = c.pos;
    }
    // Restore original declaration order but carry computed positions/variability
    candidates.sort((a, b) => a.idx - b.idx);

    // Generate main lanceolate leaves with stronger per-leaf variability
    for (let i = 0; i < candidates.length; i++) {
        const { pos: stemPos, nMix: n, nVar } = candidates[i];

        // Derive multiple attributes from independent noise channels
        const sideBias = (i % 2 === 0 ? -1 : 1);
        const w = size * (0.30 + 0.10 * n + 0.04 * (i % 2 === 0 ? noiseValue : 1 - noiseValue));
        const len = size * (1.9 + 0.8 * n);
        const petiole = size * (0.30 + 0.18 * (0.25 + n * 0.75));
        const rot = 0.49 + sideBias * (0.01 + (nVar - 0.5) * 0.02); // keep near broadside with tiny side-specific offset
        const tilt = -0.85 + (nVar - 0.5) * 0.25; // mostly downward, with slight variation
        const arch = 0.50 + 0.45 * n; // stronger droop toward tip
        const archUp = Math.max(0, 0.12 + 0.25 * (1 - n) + (0.1 * (0.5 - Math.abs(nVar - 0.5))));

        leafParams.push({
            shape: "lanceolate",
            width: w,
            length: len,
            stemLength: petiole,
            rotation: rot,
            tilt,
            arch,
            archUp,
            stemPos,
        });
    }

    // Occasionally add a tiny young thread leaf very low on the stem
    if (size > 9 && noiseValue > 0.45) {
        const nT = perLeafNoise(99, 3.3, -5.5);
        leafParams.push({
            shape: "thread",
            length: size * (0.9 + nT * 0.4),
            stemLength: size * 0.16,
            rotation: 0.10,
            tilt: 0.02,
            stemPos: 0.08 + nT * 0.10, // 8%–18% of the stem
        });
    }

    // Draw the leaves
    drawLeaves(ctx, size, stemHeight, flower, leafParams);
}

export function drawDaisy(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData,
) {
    const petalCount = 12;
    const centerRadius = size / 3;

    // Get color variations based on flower position
    const { color: petalColor, noiseValue } = getNoiseBasedColorVariation(
        DAISY_COLORS.petals,
        flower,
        0.01, // Lower intensity for subtle variation
    );

    // Draw the petals
    drawCircularPetals(ctx, petalCount, size, petalColor, {
        petalLength: size,
        petalWidthRatio: 1 / 6,
        useRadialGradient: true,
        darkenInnerColor: 0.1,
        offsetX: 0.5,
        offsetY: 0.5,
        tipShape: "rounded",
        tipSharpness: 0.1, // Subtle point for daisy petals
    });

    // Get center color variation
    const { color: centerColor } = getNoiseBasedColorVariation(
        DAISY_COLORS.center,
        flower,
        0.075, // Higher intensity for more noticeable variation
    );

    // Draw the center
    drawFlowerCenter(ctx, centerColor, centerRadius, false);
}

// Export the leaf drawing function for daisies
export function drawDaisyWithLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData,
) {
    // Draw the leaves
    drawDaisyLeaves(ctx, size, stemHeight, flower);
}
