import { FlowerData } from "./spec.ts";
import { 
    getNoiseBasedColorVariation, 
    drawFlowerCenter, 
    drawCircularPetals 
} from "./utils";
import { noise } from "../../../graphics.ts";
import { LeafParams } from "./leaves.ts";
import { drawLeaves } from "./leaves.ts";

// Define daisy colors
const DAISY_COLORS = {
    petals: "#f8f8e5",
    center: "#ffdd00",
    leaves: "#2e8b57"
};

/**
 * Draw daisy-specific leaves
 * Daisies typically have oval leaves with rounded tips or thread leaves
 */
function drawDaisyLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Use noise based on flower position to add variety
    const noiseValue = (1 + noise(flower.x * 0.01, flower.y * 0.01)) / 2;

    // Create leaf parameters based on noise
    const leafParams: LeafParams[] = [];

        leafParams.push(
            {
                shape: "ovate",
                width: size * (0.3 + noiseValue * 0.1),
                length: size * (2 + noiseValue * 0.1),
                tipShape: "rounded",
                stemLength: 2
            },
            {
                shape: "cordate",
                width: size * (0.5 + noiseValue * 0.1),
                length: size * (2.4 + noiseValue * 0.1),
                tipShape: "rounded",
                stemLength: 3,
                rotation: 0.4,
                tilt: 1
            },
            {
                shape: "oval",
                width: size * (0.5 + noiseValue * 0.1),
                length: size * (2.4 + noiseValue * 0.1),
                tipShape: "rounded",
                stemLength: 1,
                rotation: 0.5,
                tilt: 0.2
            }
        );

        // Add a third leaf for larger daisies
        if (size > 9) {
            leafParams.push({
                shape: "oval",
                width: size * (0.2 + noiseValue * 0.1),
                length: size * (0.3 + noiseValue * 0.1),
                tipShape: "rounded"
            });
        }

    // Draw the leaves
    drawLeaves(ctx, size, stemHeight, flower, leafParams);
}

export function drawDaisy(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData
) {
    const petalCount = 12;
    const centerRadius = size / 3;

    // Get color variations based on flower position
    const { color: petalColor, noiseValue } = getNoiseBasedColorVariation(
        DAISY_COLORS.petals, 
        flower, 
        0.01 // Lower intensity for subtle variation
    );

    // Draw the petals
    drawCircularPetals(ctx, petalCount, size, petalColor, {
        petalLength: size,
        petalWidthRatio: 1/6,
        useRadialGradient: true,
        darkenInnerColor: 0.1,
        offsetX: 0.5,
        offsetY: 0.5,
        tipShape: "rounded",
        tipSharpness: 0.1 // Subtle point for daisy petals
    });

    // Get center color variation
    const { color: centerColor } = getNoiseBasedColorVariation(
        DAISY_COLORS.center, 
        flower, 
        0.075 // Higher intensity for more noticeable variation
    );

    // Draw the center
    drawFlowerCenter(ctx, centerColor, centerRadius, false);
}

// Export the leaf drawing function for daisies
export function drawDaisyWithLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Draw the leaves
    drawDaisyLeaves(ctx, size, stemHeight, flower);
}
