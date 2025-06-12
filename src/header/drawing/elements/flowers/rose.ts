import { darken } from "../../color.ts";
import { FlowerData } from "./spec.ts";
import { getNoiseBasedColorVariation, drawSpiralPetals, drawFlowerCenter } from "./utils";

// Define rose colors
const ROSE_COLORS = {
    petals: "#e91e63",
};

export function drawRose(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData
) {
    const petalCount = 12;

    // Get color variations based on flower position
    const { color: petalColor } = getNoiseBasedColorVariation(
        ROSE_COLORS.petals, 
        flower, 
        0.1, // Higher intensity for more variation in roses
        1    // Default scale
    );

    // Create a slightly darker color for inner petals
    const innerPetalColor = darken(petalColor, 0.15);

    // Draw the center
    drawFlowerCenter(ctx, innerPetalColor, 3, true);

    // Draw rose spiral
    drawSpiralPetals(
        ctx,
        petalCount,
        size,
        petalColor,
        innerPetalColor,
        {
            spiralFactor: 4,
            minScale: 0.7,
            maxScale: 1.0,
            widthRatio: 0.625, // 0.25 / 0.4
            tipShape: "notched",
            notchDepth: 0.15 // Subtle notch for rose petals
        }
    );
}
