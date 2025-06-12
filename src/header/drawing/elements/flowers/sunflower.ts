import { noise } from "../../../graphics.ts";
import { FlowerData } from "./spec.ts";
import { 
    getNoiseBasedColorVariation, 
    drawFlowerCenter, 
    drawCircularPetals 
} from "./utils";

// Define sunflower colors
const SUNFLOWER_COLORS = {
    petals: "#ffd700",
    center: "#704214",
    seeds: "#3a2204",
};

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
