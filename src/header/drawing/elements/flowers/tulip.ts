import { lighten, darken } from "../../color.ts";
import { FlowerData } from "./spec.ts";
import { getNoiseBasedColorVariation } from "./utils";
import { noise } from "../../../graphics.ts";
import { LeafParams } from "./leaves.ts";
import { drawLeaves } from "./leaves.ts";

// Define tulip colors
const TULIP_COLORS = {
    petals: "#ff6b6b",
    leaves: "#2e8b57"
};

/**
 * Draw tulip-specific leaves
 * Tulips typically have oval leaves with sharp tips
 */
function drawTulipLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Use noise based on flower position to add variety
    const noiseValue = (1 + noise(flower.x * 0.01, flower.y * 0.01)) / 2;

    // Create leaf parameters based on noise
    const leafParams: LeafParams[] = [];

    // Tulips have oval leaves with sharp tips
    leafParams.push(
        { 
            shape: "oval", 
            width: size * (0.4 + noiseValue * 0.1), 
            length: size * (0.7 + noiseValue * 0.1),
            tipShape: "sharp"
        },
        { 
            shape: "oval", 
            width: size * (0.35 + noiseValue * 0.1), 
            length: size * (0.6 + noiseValue * 0.1),
            tipShape: "sharp"
        }
    );

    // Add a third leaf for larger tulips
    if (size > 10) {
        leafParams.push({ 
            shape: "oval", 
            width: size * (0.3 + noiseValue * 0.1), 
            length: size * (0.5 + noiseValue * 0.1),
            tipShape: "sharp"
        });
    }

    // Draw the leaves
    drawLeaves(ctx, size, stemHeight, flower, leafParams);
}

export function drawTulip(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData,
    options: {
        tipSharpness?: number; // Controls how pointed the tip is (0-1)
        tipCurvature?: number; // Controls the curvature of the tip (0-1)
    } = {}
) {
    // Set default options
    const {
        tipSharpness = 0.5,
        tipCurvature = 0.5
    } = options;

    const petalSize = size * 0.8;

    // Get color variations based on flower position
    const { color: petalColor } = getNoiseBasedColorVariation(
        TULIP_COLORS.petals, 
        flower, 
        0.0125 // Subtle variation for tulip
    );

    // Create a gradient for the tulip
    const gradient = ctx.createLinearGradient(
        0, -petalSize * 1.5,  // Top of tulip
        0, petalSize / 2      // Bottom of tulip
    );

    // Add gradient stops - darker at bottom, brighter at top
    gradient.addColorStop(0, lighten(petalColor, 0.1));  // Lighter at the top
    gradient.addColorStop(0.7, petalColor);              // Base color in the middle
    gradient.addColorStop(1, darken(petalColor, 0.15));  // Darker at the bottom

    ctx.fillStyle = gradient;

    // Main tulip shape
    ctx.beginPath();
    ctx.moveTo(-petalSize / 2, 0);

    // Calculate control point height based on tipSharpness
    // Higher tipSharpness = higher control point = more pointed tip
    const tipHeight = petalSize * (1.2 + tipSharpness * 0.6);

    // Calculate control point position based on tipCurvature
    // Higher tipCurvature = more curved sides
    const controlX = tipCurvature * (petalSize / 4);

    // Draw top curve with adjusted control point
    ctx.quadraticCurveTo(
        controlX, -tipHeight,
        petalSize / 2, 0
    );

    // Draw bottom curve
    ctx.quadraticCurveTo(
        0, petalSize / 2,
        -petalSize / 2, 0
    );

    ctx.fill();
}

// Export the leaf drawing function for tulips
export function drawTulipWithLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Draw the leaves
    drawTulipLeaves(ctx, size, stemHeight, flower);
}
