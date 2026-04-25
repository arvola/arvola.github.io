import { FlowerData } from "./spec.ts";
import {
    getNoiseBasedColorVariation,
} from "./utils";
import { noise } from "../../../graphics.ts";
import { drawLeaves, LeafParams } from "./leaves.ts";
import { generateLeaves } from "./leaf-layout.ts";
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
    // Decide how many main leaves with noise + size bias
    const countNoise = (1 + noise(flower.x * 0.021 + 13.1, flower.y * 0.019 - 7.7)) / 2;
    let mainLeafCount = 3;
    if (size < 8) {
        mainLeafCount = countNoise > 0.55 ? 3 : 2;
    } else if (size > 12) {
        mainLeafCount = countNoise > 0.74 ? 4 : 3;
    } else {
        mainLeafCount = countNoise > 0.82 ? 4 : 3;
    }

    const leafParams: LeafParams[] = generateLeaves(size, flower, {
        count: mainLeafCount,
        shape: "lanceolate",
        position: {
            lowBand: 0.15,
            bandSpan: 0.45,
            hardCap: 0.65,
            minGap: 0.15,
            easePower: 1.4,
            pushDownAbove: 0.5,
            pushDownFactor: 0.4,
        },
        noise: {
            scale1X: 0.02, scale1Y: 0.02,
            scale2X: 0.02, scale2Y: 0.02,
            offset2X: 5.23, offset2Y: -4.11,
            varOffsetX: -3.7, varOffsetY: 2.9,
            mixW1: 0.65, mixW2: 0.35,
        },
        geometry: {
            widthBase: 0.28,
            widthVar: 0.10,
            lengthBase: 2.10,
            lengthVar: 0.90,
            stemBase: 0.30,
            stemVar: 0.10,
        },
        orientation: {
            rotationBase: 0.5,
            rotationSideBias: 0.01,
            rotationJitter: 0.02,
            tiltBase: -0.80,
            tiltJitter: 0.25,
        },
        curvature: {
            archBase: 0.55,
            archVar: 0.45,
            archUpBase: 0.15,
            archUpVar: 0.25,
        },
    });

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
