import { FlowerData } from "./spec.ts";
import {
    getNoiseBasedColorVariation,
} from "./utils";
import { noise } from "../../../graphics.ts";
import { drawLeaves, LeafParams } from "./leaves.ts";
import { lighten, darken } from "../../color.ts";

// Define coneflower colors
const CONEFLOWER_COLORS = {
    petals: "#b04090", // Purple/Pinkish
    center: "#6b3e1e", // Dark Brown/Orange
    leaves: "#2e8b57",
};

/**
 * Draw coneflower-specific leaves
 * Coneflowers have lanceolate leaves, similar to daisies but often rougher
 */
function drawConeflowerLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData,
) {
    const countNoise = (1 + noise(flower.x * 0.019 + 11.4, flower.y * 0.017 - 9.2)) / 2;
    const lowerExtraNoise = (1 + noise(flower.x * 0.021 - 6.2, flower.y * 0.016 + 7.1)) / 2;
    const upperExtraNoise = (1 + noise(flower.x * 0.023 + 2.4, flower.y * 0.019 - 1.9)) / 2;

    const lowerCount = size < 8 ? 2 : (lowerExtraNoise > 0.6 ? 3 : 2);
    const upperCount = size < 8 ? 1 : (upperExtraNoise > 0.58 ? 2 : 1);
    const midCount = countNoise > 0.72 ? 1 : 0;
    const mainLeafCount = lowerCount + midCount + upperCount;

    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const smoothstep = (t: number) => t * t * (3 - 2 * t);
    const leafParams: LeafParams[] = [];
    const basePairNoise = (1 + noise(flower.x * 0.017 + 3.1, flower.y * 0.019 - 2.2)) / 2;

    const baseSide: 1 | -1 = countNoise > 0.5 ? 1 : -1;
    const dominantUpperSide: 1 | -1 = ((1 + noise(flower.x * 0.02 - 2.7, flower.y * 0.021 + 4.4)) / 2) > 0.5
        ? baseSide
        : (baseSide * -1) as 1 | -1;

    for (let i = 0; i < mainLeafCount; i++) {
        const t = i / Math.max(1, mainLeafCount - 1);
        const baseNoise = (1 + noise(flower.x * 0.024 + i * 6.17, flower.y * 0.023 - i * 4.31)) / 2;
        const shapeNoise = (1 + noise(flower.x * 0.031 - i * 5.27, flower.y * 0.029 + i * 3.11)) / 2;
        const bendNoise = (1 + noise(flower.x * 0.036 + i * 8.73, flower.y * 0.032 - i * 2.57)) / 2;
        const posNoise = (1 + noise(flower.x * 0.018 + i * 4.83, flower.y * 0.02 + i * 6.91)) / 2;
        const sideNoise = (1 + noise(flower.x * 0.028 + i * 1.37, flower.y * 0.021 + i * 7.91)) / 2;
        const sizeNoise = (1 + noise(flower.x * 0.034 - i * 2.71, flower.y * 0.018 + i * 5.43)) / 2;

        const isLowerZone = i < lowerCount;
        const isUpperZone = i >= lowerCount + midCount;
        const isPrimaryBasePair = isLowerZone && i < 2;
        const zoneT = isLowerZone
            ? i / Math.max(1, lowerCount - 1)
            : isUpperZone
                ? (i - (lowerCount + midCount)) / Math.max(1, upperCount - 1)
                : 0.5;

        let stemPos: number;
        let naturalSide: 1 | -1;

        if (isLowerZone) {
            // Strong, explicit bilateral base leaves.
            const lowerAnchors = lowerCount === 3 ? [0.11, 0.18, 0.25] : [0.13, 0.22];
            stemPos = clamp01(lowerAnchors[i] + (posNoise - 0.5) * 0.04);

            if (i === 0) {
                naturalSide = -1;
            } else if (i === 1) {
                naturalSide = 1;
            } else {
                naturalSide = baseSide;
            }
        } else if (isUpperZone) {
            // Upper leaves are intentionally sparse and one-sided.
            const upperAnchors = upperCount > 1 ? [0.46, 0.58] : [0.52];
            const upperIndex = i - (lowerCount + midCount);
            stemPos = clamp01(upperAnchors[upperIndex] + (posNoise - 0.5) * 0.03);

            const oppositeChance = lerp(0.16, 0.05, smoothstep(zoneT));
            naturalSide = sideNoise < oppositeChance
                ? (dominantUpperSide * -1) as 1 | -1
                : dominantUpperSide;
        } else {
            // Transitional mid leaf, slightly biased toward the upcoming dominant side.
            stemPos = clamp01(0.35 + (posNoise - 0.5) * 0.05);
            naturalSide = sideNoise > 0.82
                ? (dominantUpperSide * -1) as 1 | -1
                : dominantUpperSide;
        }

        const upperBias = smoothstep(t);
        const lowerBias = 1 - upperBias;

        const lengthBase = isPrimaryBasePair
            ? 2.95
            : isLowerZone
                ? lerp(2.95, 2.35, zoneT)
            : isUpperZone
                ? lerp(1.32, 1.05, zoneT)
                : 1.75;
        const widthBase = isPrimaryBasePair
            ? 0.38
            : isLowerZone
                ? lerp(0.38, 0.31, zoneT)
            : isUpperZone
                ? lerp(0.17, 0.12, zoneT)
                : 0.24;

        const sizeBias = isPrimaryBasePair ? lerp(0.94, 1.08, basePairNoise) : lerp(0.9, 1.1, sizeNoise);
        const length = size * lengthBase * sizeBias * (isPrimaryBasePair ? 1 : lerp(0.93, 1.08, baseNoise));
        const width = size * widthBase * (isPrimaryBasePair ? lerp(0.95, 1.05, basePairNoise) : lerp(0.92, 1.08, shapeNoise));
        const stemLength = size * (isLowerZone ? 0.1 : isUpperZone ? 0.05 : 0.07) * lerp(0.9, 1.12, bendNoise);

        leafParams.push({
            shape: "lanceolate",
            side: naturalSide,
            stemPos,
            width,
            length,
            stemLength,
            rotation: clamp01(0.48 + naturalSide * lerp(0.025, 0.012, upperBias) + (shapeNoise - 0.5) * lerp(0.14, 0.05, upperBias)),
            // Keep attachment angle clearly upward, then bend down strongly.
            // -0.52 rad is ~30° upward minimum from horizontal.
            tilt: lerp(-0.8, -0.52, upperBias) + naturalSide * lerp(0.06, 0.02, upperBias) + (bendNoise - 0.5) * lerp(0.08, 0.04, upperBias),
            arch: clamp01(lerp(0.68, 0.92, upperBias) + (shapeNoise - 0.5) * 0.08 + (posNoise - 0.5) * 0.06),
            archUp: clamp01(lerp(0.62, 0.44, upperBias) + (baseNoise - 0.5) * 0.1),
            serrated: lowerBias > 0.35,
            roughness: lerp(0.24, 0.04, upperBias) * lerp(0.9, 1.08, bendNoise),
        });
    }

    // Draw the leaves
    drawLeaves(ctx, size, stemHeight, flower, leafParams);
}

export function drawConeflower(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData,
) {
    // Coneflower has drooping petals and a prominent cone center
    
    // Get color variations based on flower position
    const { color: petalColor } = getNoiseBasedColorVariation(
        CONEFLOWER_COLORS.petals,
        flower,
        0.02, 
    );
    
    const { color: centerColor } = getNoiseBasedColorVariation(
        CONEFLOWER_COLORS.center,
        flower,
        0.05,
    );

    const petalLength = size * 1.5;
    const petalWidth = size * 0.35;
    const coneHeight = size * 0.8;
    const coneWidth = size * 0.9;

    // 1. Draw Petals (behind the cone)
    // Draw them in a fan downwards
    const petalCount = 9;
    const startAngle = Math.PI * 0.1; // Slightly below horizontal right
    const endAngle = Math.PI * 0.9;   // Slightly below horizontal left
    
    ctx.save();
    // Translate slightly up so petals connect to the base of the cone
    ctx.translate(0, -coneHeight * 0.2);

    for (let i = 0; i < petalCount; i++) {
        const t = i / (petalCount - 1); // 0 to 1
        // Distribute angles
        // We want random variation in angles? Or even?
        // Even is fine for now with some noise
        
        const baseAngle = startAngle + (endAngle - startAngle) * t;
        // Add slight random jitter to angle
        const angleJitter = (noise(flower.x + i, flower.y) - 0.5) * 0.2;
        const angle = baseAngle + angleJitter;

        ctx.save();
        ctx.rotate(angle);
        
        // Draw a single petal
        // Petal shape: wide near base, tapering to rounded point
        ctx.fillStyle = petalColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        // Control points for petal shape
        // Draw along X axis (since we rotated)
        // Actually, if we rotate by `angle`, and `angle` is around PI/2 (down),
        // 0 is Right.
        // If angle is PI/2, we want to draw Down.
        // So if we rotate by PI/2, drawing along +X means drawing Down? 
        // Yes, because +X rotated 90deg is +Y.
        
        // Draw petal along local +X
        ctx.quadraticCurveTo(petalLength * 0.5, -petalWidth, petalLength, 0);
        ctx.quadraticCurveTo(petalLength * 0.5, petalWidth, 0, 0);
        
        // Gradient for petal
        const gradient = ctx.createLinearGradient(0, 0, petalLength, 0);
        gradient.addColorStop(0, darken(petalColor, 0.3));
        gradient.addColorStop(0.5, petalColor);
        gradient.addColorStop(1, lighten(petalColor, 0.2));
        ctx.fillStyle = gradient;
        
        ctx.fill();
        ctx.restore();
    }
    ctx.restore();

    // 2. Draw the Cone Center
    // A dome shape pointing up
    ctx.save();
    // Position the cone base at (0, -coneHeight * 0.2) approximately
    ctx.translate(0, -coneHeight * 0.1);
    
    ctx.beginPath();
    // Draw a semi-ellipse or dome
    // Base of cone
    ctx.ellipse(0, 0, coneWidth/2, coneWidth/6, 0, 0, Math.PI * 2);
    // Sides of cone
    ctx.moveTo(-coneWidth/2, 0);
    ctx.quadraticCurveTo(0, -coneHeight * 1.5, coneWidth/2, 0);
    
    // Fill with gradient
    const coneGradient = ctx.createRadialGradient(
        -coneWidth * 0.2, -coneHeight * 0.5, 0,
        0, -coneHeight * 0.2, coneWidth
    );
    coneGradient.addColorStop(0, lighten(centerColor, 0.3)); // Highlight
    coneGradient.addColorStop(0.6, centerColor);
    coneGradient.addColorStop(1, darken(centerColor, 0.4));
    
    ctx.fillStyle = coneGradient;
    ctx.fill();
    
    // Add texture to cone (dots/spikes)
    ctx.fillStyle = darken(centerColor, 0.6);
    const dotCount = 15;
    for (let i = 0; i < dotCount; i++) {
        // Random positions inside the cone area roughly
        const dx = (Math.random() - 0.5) * coneWidth * 0.8;
        const dy = -Math.random() * coneHeight * 0.9;
        const dotSize = size * 0.05;
        ctx.beginPath();
        ctx.arc(dx, dy, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// Export the leaf drawing function for coneflowers
export function drawConeflowerWithLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData,
) {
    // Draw the leaves
    drawConeflowerLeaves(ctx, size, stemHeight, flower);
}
