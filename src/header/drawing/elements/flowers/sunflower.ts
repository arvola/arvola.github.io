import { noise } from "../../../graphics.ts";
import { FlowerData } from "./spec.ts";
import { 
    getNoiseBasedColorVariation, 
    drawFlowerCenter, 
    drawCircularPetals 
} from "./utils";
import { LeafParams } from "./leaves.ts";
import { drawLeaves } from "./leaves.ts";

// Define sunflower colors
const SUNFLOWER_COLORS = {
    petals: "#ffd700",
    center: "#704214",
    seeds: "#3a2204",
    leaves: "#2e8b57"
};

/**
 * Draw sunflower-specific leaves
 * Sunflowers typically have large ovate leaves with stems
 */
function drawSunflowerLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Use noise based on flower position to add variety
    const noiseValue = (1 + noise(flower.x * 0.01, flower.y * 0.01)) / 2;

    // Create leaf parameters based on noise
    const leafParams: LeafParams[] = [];

    // Sunflowers have large ovate leaves
    const leafCount = 2 + Math.floor(noiseValue * 2); // 2-3 leaves

    for (let i = 0; i < leafCount; i++) {
        // Larger leaves for larger sunflowers
        const sizeMultiplier = 0.5 + (size / 15); // Adjust based on flower size

        leafParams.push({ 
            shape: "ovate", 
            width: size * (2 + noiseValue * 0.1) * sizeMultiplier,
            length: size * (0.8 + noiseValue * 0.2) * sizeMultiplier,
            stemLength: size * (0.2 + noiseValue * 0.1)
        });
    }

    // Draw the leaves
    drawLeaves(ctx, size, stemHeight, flower, leafParams);
}

export function drawSunflower(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData
) {
    const petalCount = 18;
    const petalLength = size * 1.2;
    const centerRadius = size / 2;

    // Get color variations based on flower position
    const { color: petalColor, noiseValue } = getNoiseBasedColorVariation(
        SUNFLOWER_COLORS.petals, 
        flower, 
        0.005 // Very subtle variation for sunflower petals
    );

    // Draw the petals
    drawCircularPetals(ctx, petalCount, size, petalColor, {
        petalLength: petalLength,
        petalWidthRatio: 1/8,
        useRadialGradient: false, // Use linear gradient for sunflower
        darkenInnerColor: 0.015,
        lightenOuterColor: 0.01,
        rotateContext: true, // Sunflower uses context rotation
        tipShape: "pointed",
        tipSharpness: 0.6 // More pronounced point for sunflower petals
    });

    // Get center color variation
    const { color: centerColor } = getNoiseBasedColorVariation(
        SUNFLOWER_COLORS.center, 
        flower, 
        0.075 // Higher intensity for more noticeable variation
    );

    // Draw the center
    drawFlowerCenter(ctx, centerColor, centerRadius, true, 0.1);

    // Get seed color variation
    const { color: seedColor } = getNoiseBasedColorVariation(
        SUNFLOWER_COLORS.seeds, 
        flower, 
        0.05
    );

    // Draw seed pattern
    ctx.fillStyle = seedColor;
    const seedCount = 20;

    // Use deterministic seed positions based on flower position
    for (let i = 0; i < seedCount; i++) {
        const angle = (i / seedCount) * Math.PI * 2;
        // Use noise for deterministic but varied seed positions
        const seedNoise = noise(flower.x * 0.02 + i, flower.y * 0.02 + i);
        const distance = (0.3 + 0.5 * ((1 + seedNoise) / 2)) * (centerRadius * 0.8);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        ctx.beginPath();
        ctx.arc(x, y, size / 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Export the leaf drawing function for sunflowers
export function drawSunflowerWithLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Draw the leaves
    drawSunflowerLeaves(ctx, size, stemHeight, flower);
}
