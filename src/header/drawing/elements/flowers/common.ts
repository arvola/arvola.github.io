import { noise } from "../../../graphics.ts";

// Import flower drawing functions
import { drawDaisy } from "./daisy";
import { drawTulip } from "./tulip";
import { drawSunflower } from "./sunflower";
import { drawRose } from "./rose";
import { drawSnowdrop } from "./snowdrop";
import { FlowerData, FlowerPositionSpec, FlowerType } from "./spec.ts";

// Generate flowers based on predefined positions with specific cluster flower locations
export function generateFlowers(
    width: number,
    count: number = 10,
    specificTypes: FlowerType[],
    positions?: Array<FlowerPositionSpec>,
): FlowerData[] {
    // Early return if no positions are defined
    if (!positions || positions.length === 0) {
        console.warn(
            "No flower positions provided in spec, no flowers will be generated",
        );
        return [];
    }

    const month = new Date().getMonth();
    // Use provided flower types or get seasonal ones based on month
    const flowerTypes = specificTypes;
    const flowers: FlowerData[] = [];

    // If predefined positions are provided, use them
    if (positions && positions.length > 0) {
        const result: FlowerData[] = [];

        for (const pos of positions) {
            // Calculate actual x-coordinate based on canvas width
            const actualX = pos.x * width;

            // Use predefined type or pick random from available types
            const type =
                (pos.type as FlowerType) ||
                flowerTypes[Math.floor(Math.random() * flowerTypes.length)];

            // Generate random rotation for natural swaying effect
            const rotation = Math.random() * 0.4 - 0.2;

            // Add the main flower
            result.push({
                x: actualX,
                y: pos.y,
                size: pos.size,
                rotation,
                type,
            });

            // Add cluster flowers if specified
            if (pos.cluster && pos.cluster.length > 0) {
                for (const clusterItem of pos.cluster) {
                    // For each cluster flower, use deterministic noise for size variation
                    // Use flower position as seed for the noise function
                    const noiseValue =
                        (1 + noise(actualX * 0.01, pos.y * 0.01)) / 2;
                    const sizeRatio =
                        clusterItem.sizeRatio !== undefined
                            ? clusterItem.sizeRatio
                            : 0.8 + noiseValue * 0.4; // Size between 0.8-1.2 of main flower

                    // Generate a unique rotation for each cluster flower
                    const clusterRotation = Math.random() * 0.4 - 0.2;

                    // Add the cluster flower
                    result.push({
                        x: actualX + clusterItem.offsetX,
                        y: pos.y + clusterItem.offsetY,
                        size: pos.size * sizeRatio,
                        rotation: clusterRotation,
                        type: (clusterItem.type as FlowerType) || type,
                    });
                }
            }
        }

        return result;
    }

    // Fallback to random generation if no positions provided
    for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = 180 + Math.random() * 20; // Position flowers near the ground
        const size = 5 + Math.random() * 15;

        // Limit rotation to a small range for gentle swaying effect
        // Random value between -0.2 and 0.2 radians (approx ±11 degrees)
        const rotation = Math.random() * 0.4 - 0.2;

        const type =
            flowerTypes[Math.floor(Math.random() * flowerTypes.length)];

        flowers.push({ x, y, size, rotation, type });
    }

    return flowers;
}

// Function to draw just the shadow for a flower
export function drawFlowerShadow(
    ctx: CanvasRenderingContext2D,
    flower: FlowerData,
) {
    const size = flower.size;
    const stemHeight = size * 2;

    // Save the context before any transformations
    ctx.save();

    // Translate to the bottom of where the stem will be (the root position)
    ctx.translate(flower.x, flower.y + stemHeight);

    // Draw shadow beneath the flower
    // Create an elliptical shadow
    const shadowWidth = size * 1.0;
    const shadowHeight = size * 0.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);

    // Use solid black with moderate opacity for the shadow
    // This will be blurred later to create a unified shadow blob
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fill();

    ctx.restore();
}

// Function to draw a flower without its shadow
export function drawFlowerWithoutShadow(
    ctx: CanvasRenderingContext2D,
    flower: FlowerData,
) {
    const size = flower.size;
    const stemHeight = size * 2;

    // First save the context before any transformations
    ctx.save();

    // 1. Translate to the bottom of where the stem will be (the root position)
    ctx.translate(flower.x, flower.y + stemHeight);

    // 2. Draw the stem (now moving upward from the root)
    ctx.beginPath();

    // Apply rotation from the bottom of the stem (root stays fixed)
    ctx.rotate(flower.rotation);

    // Control point offset for the stem curve
    const curveOffset = size * 0.2 * (flower.rotation / 0.2); // Scale curve with rotation

    // Start at the root (bottom of stem), which is now our origin
    ctx.moveTo(0, 0);

    // Draw stem moving upward (negative y direction)
    ctx.quadraticCurveTo(curveOffset, -stemHeight / 2, 0, -stemHeight);

    ctx.strokeStyle = "#2e8b57"; // Green stem
    ctx.lineWidth = size / 8;
    ctx.stroke();

    // 3. Move context to the top of the stem where the flower will be drawn
    ctx.translate(0, -stemHeight);

    // Draw specific flower type
    // The context is already positioned at the top of the stem, ready for flower drawing
    switch (flower.type) {
        case "daisy":
            drawDaisy(ctx, size, flower);
            break;
        case "tulip":
            drawTulip(ctx, size, flower);
            break;
        case "sunflower":
            drawSunflower(ctx, size, flower);
            break;
        case "rose":
            drawRose(ctx, size, flower);
            break;
        case "snowdrop":
            drawSnowdrop(ctx, size, flower);
            break;
    }

    ctx.restore();
}
