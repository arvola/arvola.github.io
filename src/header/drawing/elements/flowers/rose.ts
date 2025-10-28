import { darken } from "../../color.ts";
import { FlowerData } from "./spec.ts";
import { getNoiseBasedColorVariation, drawSpiralPetals, drawFlowerCenter } from "./utils";
import { noise } from "../../../graphics.ts";
import { LeafParams } from "./leaves.ts";
import { drawLeaves } from "./leaves.ts";

// Define rose colors
const ROSE_COLORS = {
    petals: "#e91e63",
    leaves: "#2e8b57"
};

/**
 * Draw rose-specific leaves
 * Roses typically have cordate (heart-shaped) or ovate leaves
 */
function drawRoseLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Use noise based on flower position to add variety
    const noiseValue = (1 + noise(flower.x * 0.01, flower.y * 0.01)) / 2;

    // Create leaf parameters based on noise
    const leafParams: LeafParams[] = [];

    // Decide leaf type based on noise
    const useCordate = noiseValue > 0.5;

    if (useCordate) {
        // Cordate (heart-shaped) leaves
        leafParams.push(
            { 
                shape: "cordate", 
                width: size * (0.4 + noiseValue * 0.1), 
                length: size * (0.5 + noiseValue * 0.1)
            },
            { 
                shape: "cordate", 
                width: size * (0.3 + noiseValue * 0.1), 
                length: size * (0.4 + noiseValue * 0.1)
            }
        );

        // Add a third leaf for larger roses
        if (size > 10) {
            leafParams.push({ 
                shape: "cordate", 
                width: size * (0.25 + noiseValue * 0.1), 
                length: size * (0.35 + noiseValue * 0.1)
            });
        }
    } else {
        // Ovate leaves
        leafParams.push(
            { 
                shape: "ovate", 
                width: size * (0.4 + noiseValue * 0.1), 
                length: size * (0.7 + noiseValue * 0.1),
                stemLength: size * (0.15 + noiseValue * 0.05)
            },
            { 
                shape: "ovate", 
                width: size * (0.3 + noiseValue * 0.1), 
                length: size * (0.6 + noiseValue * 0.1),
                stemLength: size * (0.1 + noiseValue * 0.05)
            }
        );

        // Add a third leaf for larger roses
        if (size > 10) {
            leafParams.push({ 
                shape: "ovate", 
                width: size * (0.25 + noiseValue * 0.1), 
                length: size * (0.5 + noiseValue * 0.1),
                stemLength: size * 0.1
            });
        }
    }

    // Draw the leaves
    drawLeaves(ctx, size, stemHeight, flower, leafParams);
}

export function drawRose(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData
) {
    const petalCount = 12;

    // Get color variations based on flower position
    const { color: petalColor, noiseValue } = getNoiseBasedColorVariation(
        ROSE_COLORS.petals, 
        flower, 
        0.1, // Higher intensity for more variation in roses
        1    // Default scale
    );

    // Create a slightly darker color for inner petals
    const innerPetalColor = darken(petalColor, 0.15);

    // Draw the center
    drawFlowerCenter(ctx, darken(petalColor, 0.35), 4, true);

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

// Export the leaf drawing function for roses
export function drawRoseWithLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Draw the leaves
    drawRoseLeaves(ctx, size, stemHeight, flower);
}
