import { lighten, darken } from "../../color.ts";
import { FlowerData } from "./spec.ts";
import { getNoiseBasedColorVariation } from "./utils";

// Define snowdrop colors
const SNOWDROP_COLORS = {
    petals: "#ffffff",
    tips: "#4caf50",
};

export function drawSnowdrop(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData,
    options: {
        bellWidth?: number; // Controls the width of the bell (0-1)
        bellCurvature?: number; // Controls the curvature of the bell sides (0-1)
        tipShape?: "rounded" | "pointed" | "scalloped"; // Shape of the bottom edge
    } = {}
) {
    // Set default options
    const {
        bellWidth = 0.5,
        bellCurvature = 0.5,
        tipShape = "rounded"
    } = options;
    // Get color variations based on flower position
    const { color: petalColor } = getNoiseBasedColorVariation(
        SNOWDROP_COLORS.petals, 
        flower, 
        0.075, // Higher intensity for more noticeable variation
        1      // Default scale
    );

    // Create a gradient for the bell shape
    const gradient = ctx.createLinearGradient(
        0, 0,    // Top of bell
        0, size  // Bottom of bell
    );

    // Add gradient stops - brighter at top, slightly darker at bottom
    gradient.addColorStop(0, lighten(petalColor, 0.1));
    gradient.addColorStop(0.7, petalColor);
    gradient.addColorStop(1, darken(petalColor, 0.05));

    ctx.fillStyle = gradient;

    // Calculate bell dimensions based on parameters
    const bellWidthFactor = 0.2 + bellWidth * 0.3; // Range from 0.2 to 0.5
    const bellSideX = size * bellWidthFactor;
    const controlOffset = size * (0.25 + bellCurvature * 0.25); // Range from 0.25 to 0.5

    // Draw hanging bell shape
    ctx.beginPath();
    ctx.moveTo(-bellSideX, 0);

    // Left side of bell
    ctx.quadraticCurveTo(
        -controlOffset, size/2,
        -bellSideX, size
    );

    // Bottom edge of bell - varies based on tipShape
    if (tipShape === "rounded") {
        // Original rounded bottom
        ctx.lineTo(bellSideX, size);
    } else if (tipShape === "pointed") {
        // Pointed bottom
        ctx.lineTo(0, size * 1.1); // Center point extends slightly lower
        ctx.lineTo(bellSideX, size);
    } else if (tipShape === "scalloped") {
        // Scalloped bottom with three gentle curves
        const scallop1 = -bellSideX * 0.6;
        const scallop2 = 0;
        const scallop3 = bellSideX * 0.6;

        ctx.lineTo(scallop1, size);
        ctx.quadraticCurveTo(
            (scallop1 + scallop2) / 2, size * 1.05,
            scallop2, size
        );
        ctx.quadraticCurveTo(
            (scallop2 + scallop3) / 2, size * 1.05,
            scallop3, size
        );
        ctx.lineTo(bellSideX, size);
    }

    // Right side of bell
    ctx.quadraticCurveTo(
        controlOffset, size/2,
        bellSideX, 0
    );

    ctx.closePath();
    ctx.fill();

    // Get tip color variation
    const { color: tipColor } = getNoiseBasedColorVariation(
        SNOWDROP_COLORS.tips, 
        flower, 
        0.1, // Higher intensity for more noticeable variation
        1    // Default scale
    );

    // Create a radial gradient for the tips - adjust center based on tip shape
    let tipCenterY = size;
    if (tipShape === "pointed") {
        // For pointed shape, center the gradient at the lower center tip
        tipCenterY = size * 1.1;
    }

    const tipGradient = ctx.createRadialGradient(
        0, tipCenterY, 0,
        0, tipCenterY, size/8
    );

    // Add gradient stops - brighter at center, full color at edge
    tipGradient.addColorStop(0, lighten(tipColor, 0.1));
    tipGradient.addColorStop(1, tipColor);

    ctx.fillStyle = tipGradient;

    // Draw green tips - position based on bell shape and tip shape
    ctx.beginPath();

    if (tipShape === "rounded") {
        // Original tip positions
        ctx.arc(-bellSideX * 0.6, size, size/8, 0, Math.PI * 2);
        ctx.arc(0, size, size/8, 0, Math.PI * 2);
        ctx.arc(bellSideX * 0.6, size, size/8, 0, Math.PI * 2);
    } else if (tipShape === "pointed") {
        // Tips for pointed shape - center tip is lower
        ctx.arc(-bellSideX * 0.6, size, size/8, 0, Math.PI * 2);
        ctx.arc(0, size * 1.1, size/8, 0, Math.PI * 2); // Lower center tip
        ctx.arc(bellSideX * 0.6, size, size/8, 0, Math.PI * 2);
    } else if (tipShape === "scalloped") {
        // Tips for scalloped shape - follow the scallop curves
        const scallop1 = -bellSideX * 0.6;
        const scallop2 = 0;
        const scallop3 = bellSideX * 0.6;

        ctx.arc(scallop1, size, size/8, 0, Math.PI * 2);
        ctx.arc(scallop2, size, size/8, 0, Math.PI * 2);
        ctx.arc(scallop3, size, size/8, 0, Math.PI * 2);
    }

    ctx.fill();
}
