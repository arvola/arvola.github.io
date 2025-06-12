import { lighten, darken } from "../../color.ts";
import { FlowerData } from "./spec.ts";
import { getNoiseBasedColorVariation } from "./utils";

// Define tulip colors
const TULIP_COLORS = {
    petals: "#ff6b6b",
};

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
