import { LayerSpec, SpecDrawingFunc } from "./base.ts";
import { ColorMap, colorFromSpec, ColorSpec, lighten, darken } from "../color.ts";
import { noise } from "../../graphics.ts";
import { FlowerPositionSpec } from "../../seasonal-flowers.ts";

export interface FlowersSpec extends LayerSpec {
    type: "flowers";
    flowers: FlowerData[];
    colors: ColorSpec[];
}

export interface FlowerData {
    x: number;
    y: number;
    size: number;
    rotation: number;
    type: FlowerType;
}

// For defining flower positions in the spec
export interface FlowerPosition {
    x: number;           // 0-1 representing percentage across canvas width
    y: number;           // Ground level position (typically around 180-200)
    size: number;        // Base size of the flower
    type: FlowerType;    // Type of flower
    cluster?: Array<{
        offsetX: number;  // X offset from the main position
        offsetY: number;  // Y offset from the main position
        sizeRatio?: number;// Size as a ratio of the main flower's size (0.8-1.2 typical)
        type?: FlowerType;// Optional specific flower type (defaults to main flower type)
    }>;
}

export type FlowerType = "daisy" | "tulip" | "sunflower" | "rose" | "snowdrop";

// Define consistent colors for each flower type
export const FLOWER_COLORS = {
    daisy: {
        petals: "#f8f8e5",
        center: "#ffdd00"
    },
    tulip: {
        petals: "#ff6b6b"
    },
    sunflower: {
        petals: "#ffd700",
        center: "#704214",
        seeds: "#3a2204"
    },
    rose: {
        petals: "#e91e63"
    },
    snowdrop: {
        petals: "#ffffff",
        tips: "#4caf50"
    }
};

// Get appropriate flowers based on the month
export function getSeasonalFlowers(month: number): FlowerType[] {
    // Spring (March-May)
    if (month >= 2 && month <= 4) {
        return ["tulip", "daisy"];
    }
    // Summer (June-August)
    else if (month >= 5 && month <= 7) {
        return ["sunflower", "daisy", "rose"];
    }
    // Autumn/Fall (September-November)
    else if (month >= 8 && month <= 10) {
        return ["sunflower"];
    }
    // Winter (December-February)
    else {
        return ["snowdrop"];
    }
}

// Generate flowers based on predefined positions with specific cluster flower locations
export function generateFlowers(
    width: number,
    count: number = 10,
    specificTypes?: FlowerType[],
    positions?: Array<FlowerPositionSpec>
): FlowerData[] {
    // Early return if no positions are defined
    if (!positions || positions.length === 0) {
        console.warn('No flower positions provided in spec, no flowers will be generated');
        return [];
    }

    const month = new Date().getMonth();
    // Use provided flower types or get seasonal ones based on month
    const flowerTypes = specificTypes || getSeasonalFlowers(month);
    const flowers: FlowerData[] = [];

    // If predefined positions are provided, use them
    if (positions && positions.length > 0) {
        const result: FlowerData[] = [];

        for (const pos of positions) {
            // Calculate actual x-coordinate based on canvas width
            const actualX = pos.x * width;

            // Use predefined type or pick random from available types
            const type = (pos.type as FlowerType) ||
                flowerTypes[Math.floor(Math.random() * flowerTypes.length)];

            // Generate random rotation for natural swaying effect
            const rotation = (Math.random() * 0.4 - 0.2);

            // Add the main flower
            result.push({
                x: actualX,
                y: pos.y,
                size: pos.size,
                rotation,
                type
            });

            // Add cluster flowers if specified
            if (pos.cluster && pos.cluster.length > 0) {
                for (const clusterItem of pos.cluster) {
                    // For each cluster flower, use deterministic noise for size variation
                    // Use flower position as seed for the noise function
                    const noiseValue = (1 + noise(actualX * 0.01, pos.y * 0.01)) / 2;
                    const sizeRatio = clusterItem.sizeRatio !== undefined ? clusterItem.sizeRatio : 0.8 + noiseValue * 0.4; // Size between 0.8-1.2 of main flower

                    // Generate a unique rotation for each cluster flower
                    const clusterRotation = (Math.random() * 0.4 - 0.2);

                    // Add the cluster flower
                    result.push({
                        x: actualX + clusterItem.offsetX,
                        y: pos.y + clusterItem.offsetY,
                        size: pos.size * sizeRatio,
                        rotation: clusterRotation,
                        type: (clusterItem.type as FlowerType) || type
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
        const rotation = (Math.random() * 0.4 - 0.2);

        const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];

        flowers.push({ x, y, size, rotation, type });
    }

    return flowers;
}

export const drawFlowers: SpecDrawingFunc<FlowersSpec> = (spec, { ctx, c, width }) => {
    // Create an offscreen canvas for drawing shadows
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = width;
    shadowCanvas.height = ctx.canvas.height;
    const shadowCtx = shadowCanvas.getContext('2d');

    if (!shadowCtx) {
        console.error('Could not create shadow context');
        return;
    }

    // Clear the shadow canvas
    shadowCtx.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);

    // Draw all shadows at full opacity
    for (const flower of spec.flowers) {
        drawFlowerShadow(shadowCtx, flower);
    }

    // Create a second canvas for the blurred shadow
    const blurCanvas = document.createElement('canvas');
    blurCanvas.width = width;
    blurCanvas.height = ctx.canvas.height;
    const blurCtx = blurCanvas.getContext('2d');

    if (!blurCtx) {
        console.error('Could not create blur context');
        return;
    }

    // Apply blur filter - use a larger blur for a more diffuse shadow
    blurCtx.filter = 'blur(5px)';
    blurCtx.globalAlpha = 0.3;

    // Draw the shadow canvas onto the blur canvas (with blur applied)
    blurCtx.drawImage(shadowCanvas, 0, 0);

    // Draw the blurred shadow canvas onto the main canvas
    ctx.drawImage(blurCanvas, 0, 0);

    // Draw all flowers without shadows
    for (const flower of spec.flowers) {
        drawFlowerWithoutShadow(ctx, flower, c);
    }
};

// Function to draw just the shadow for a flower
function drawFlowerShadow(
    ctx: CanvasRenderingContext2D,
    flower: FlowerData
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
function drawFlowerWithoutShadow(
    ctx: CanvasRenderingContext2D,
    flower: FlowerData,
    c: ColorMap
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
            drawDaisy(ctx, size, c, flower);
            break;
        case "tulip":
            drawTulip(ctx, size, c, flower);
            break;
        case "sunflower":
            drawSunflower(ctx, size, c, flower);
            break;
        case "rose":
            drawRose(ctx, size, c, flower);
            break;
        case "snowdrop":
            drawSnowdrop(ctx, size, c, flower);
            break;
    }

    ctx.restore();
}

// Original function kept for backward compatibility
function drawFlower(
    ctx: CanvasRenderingContext2D,
    flower: FlowerData,
    c: ColorMap
) {
    // Draw shadow
    drawFlowerShadow(ctx, flower);

    // Draw flower
    drawFlowerWithoutShadow(ctx, flower, c);
}

function drawDaisy(
    ctx: CanvasRenderingContext2D,
    size: number,
    c: ColorMap,
    flower: FlowerData
) {
    const petalCount = 12;
    const petalLength = size;
    const centerRadius = size / 3;

    // Generate deterministic color variance based on flower position
    const noiseValue = (1 + noise(flower.x, flower.y)) / 2;

    // Slightly vary the petal color
    const baseColor = FLOWER_COLORS.daisy.petals;
    const petalColor = noiseValue > 0.5 
        ? lighten(baseColor, (noiseValue - 0.5) * 0.02)
        : darken(baseColor, (0.5 - noiseValue) * 0.02);

    console.log("baseColor: ", baseColor, " petalColor: ", petalColor, " noiseValue: ", noiseValue, "")

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;

        // Create a radial gradient for each petal
        const gradient = ctx.createRadialGradient(
            x / 4, y / 4, 0,           // Inner point (closer to center)
            x / 2, y / 2, petalLength / 2  // Outer point (petal tip)
        );

        // Add gradient stops - from slightly darker at center to full color at tip
        gradient.addColorStop(0, darken(petalColor, 0.1));
        gradient.addColorStop(1, petalColor);

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.ellipse(
            x / 2, y / 2,
            petalLength / 2, petalLength / 6,
            angle,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    // Vary the center color slightly
    const baseCenterColor = FLOWER_COLORS.daisy.center;
    const centerColor = noiseValue > 0.5 
        ? lighten(baseCenterColor, (noiseValue - 0.5) * 0.15) 
        : darken(baseCenterColor, (0.5 - noiseValue) * 0.15);

    // Draw center with a radial gradient
    const centerGradient = ctx.createRadialGradient(
        0, 0, 0,
        0, 0, centerRadius
    );
    centerGradient.addColorStop(0, lighten(centerColor, 0.1));
    centerGradient.addColorStop(1, centerColor);

    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerColor;
    ctx.fill();
}

function drawTulip(
    ctx: CanvasRenderingContext2D,
    size: number,
    c: ColorMap,
    flower: FlowerData
) {
    const petalSize = size * 0.8;

    // Generate deterministic color variance based on flower position
    const noiseValue = (1 + noise(flower.x, flower.y)) / 2;

    // Slightly vary the petal color
    const baseColor = FLOWER_COLORS.tulip.petals;
    const petalColor = noiseValue > 0.5 
        ? lighten(baseColor, (noiseValue - 0.5) * 0.025)
        : darken(baseColor, (0.5 - noiseValue) * 0.025);
    console.log("baseColor: ", baseColor, " petalColor: ", petalColor, " noiseValue: ", noiseValue, "")

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
    ctx.quadraticCurveTo(
        0, -petalSize * 1.5,
        petalSize / 2, 0
    );
    ctx.quadraticCurveTo(
        0, petalSize / 2,
        -petalSize / 2, 0
    );
    ctx.fill();
}

function drawSunflower(
    ctx: CanvasRenderingContext2D,
    size: number,
    c: ColorMap,
    flower: FlowerData
) {
    const petalCount = 18;
    const petalLength = size * 1.2;
    const centerRadius = size / 2;

    // Generate deterministic color variance based on flower position
    const noiseValue = (1 + noise(flower.x, flower.y)) / 2;

    // Slightly vary the petal color
    const baseColor = FLOWER_COLORS.sunflower.petals;
    const petalColor = noiseValue > 0.5 
        ? lighten(baseColor, (noiseValue - 0.5) * 0.01)
        : darken(baseColor, (0.5 - noiseValue) * 0.01);
    console.log("baseColor: ", baseColor, " petalColor: ", petalColor, " noiseValue: ", noiseValue, "lighten", noiseValue > 0.5 ? ((noiseValue - 0.5) * 0.01) : ((0.5 - noiseValue) * 0.01))

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;

        ctx.save();
        ctx.rotate(angle);

        // Create a linear gradient for each petal
        const gradient = ctx.createLinearGradient(
            size / 3, 0,     // Inner point (closer to center)
            size * 1.5, 0    // Outer point (petal tip)
        );

        // Add gradient stops - from slightly darker at base to full color at tip
        gradient.addColorStop(0, darken(petalColor, 0.015));
        gradient.addColorStop(0.7, petalColor);
        gradient.addColorStop(1, lighten(petalColor, 0.01));

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.ellipse(
            size / 1.5, 0,
            petalLength / 2, petalLength / 8,
            0,
            0, Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
    }

    // Vary the center color slightly
    const baseCenterColor = FLOWER_COLORS.sunflower.center;
    const centerColor = noiseValue > 0.5 
        ? lighten(baseCenterColor, (noiseValue - 0.5) * 0.15) 
        : darken(baseCenterColor, (0.5 - noiseValue) * 0.15);

    // Create a radial gradient for the center
    const centerGradient = ctx.createRadialGradient(
        0, 0, 0,
        0, 0, centerRadius
    );
    centerGradient.addColorStop(0, lighten(centerColor, 0.1));
    centerGradient.addColorStop(1, centerColor);

    // Draw center
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();

    // Vary the seed color slightly
    const baseSeedColor = FLOWER_COLORS.sunflower.seeds;
    const seedColor = noiseValue > 0.5 
        ? lighten(baseSeedColor, (noiseValue - 0.5) * 0.1) 
        : darken(baseSeedColor, (0.5 - noiseValue) * 0.1);

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

function drawRose(
    ctx: CanvasRenderingContext2D,
    size: number,
    c: ColorMap,
    flower: FlowerData
) {
    const petalCount = 12;

    // Generate deterministic color variance based on flower position
    const noiseValue = (1 + noise(flower.x * 0.01, flower.y * 0.01)) / 2;

    // Slightly vary the petal color
    const baseColor = FLOWER_COLORS.rose.petals;
    const petalColor = noiseValue > 0.5 
        ? lighten(baseColor, (noiseValue - 0.5) * 0.2) 
        : darken(baseColor, (0.5 - noiseValue) * 0.2);

    // Create a slightly darker color for inner petals
    const innerPetalColor = darken(petalColor, 0.15);

    // Draw rose spiral
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 4;
        const scale = 0.3 + (i / petalCount) * 0.7;
        const x = Math.cos(angle) * size * scale * 0.5;
        const y = Math.sin(angle) * size * scale * 0.5;

        // Create a radial gradient for each petal
        // For inner petals, use darker color; for outer petals, use lighter color
        const petalRadius = size * 0.4 * scale;
        const normalizedScale = (scale - 0.3) / 0.7; // 0 for innermost petal, 1 for outermost

        // Blend between inner and outer petal colors based on position in spiral
        const currentPetalColor = normalizedScale < 0.5 
            ? innerPetalColor 
            : petalColor;

        // Create gradient from center of petal outward
        const gradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, petalRadius
        );

        // Inner petals are darker, outer petals get lighter at the edges
        if (normalizedScale < 0.5) {
            // Inner petals: darker center, slightly lighter edges
            gradient.addColorStop(0, darken(currentPetalColor, 0.1));
            gradient.addColorStop(1, currentPetalColor);
        } else {
            // Outer petals: base color at center, lighter at edges
            gradient.addColorStop(0, currentPetalColor);
            gradient.addColorStop(1, lighten(currentPetalColor, 0.1));
        }

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.ellipse(
            x, y,
            size * 0.4 * scale,
            size * 0.25 * scale,
            angle,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

function drawSnowdrop(
    ctx: CanvasRenderingContext2D,
    size: number,
    c: ColorMap,
    flower: FlowerData
) {
    // Generate deterministic color variance based on flower position
    const noiseValue = (1 + noise(flower.x * 0.01, flower.y * 0.01)) / 2;

    // Slightly vary the petal color
    const baseColor = FLOWER_COLORS.snowdrop.petals;
    const petalColor = noiseValue > 0.5 
        ? lighten(baseColor, (noiseValue - 0.5) * 0.15) 
        : darken(baseColor, (0.5 - noiseValue) * 0.15);

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

    // Draw hanging bell shape
    ctx.beginPath();
    ctx.moveTo(-size/4, 0);
    ctx.quadraticCurveTo(
        -size/3, size/2,
        -size/4, size
    );
    ctx.lineTo(size/4, size);
    ctx.quadraticCurveTo(
        size/3, size/2,
        size/4, 0
    );
    ctx.closePath();
    ctx.fill();

    // Slightly vary the tip color
    const baseTipColor = FLOWER_COLORS.snowdrop.tips;
    const tipColor = noiseValue > 0.5 
        ? lighten(baseTipColor, (noiseValue - 0.5) * 0.2) 
        : darken(baseTipColor, (0.5 - noiseValue) * 0.2);

    // Create a radial gradient for each tip
    const tipGradient = ctx.createRadialGradient(
        0, size, 0,
        0, size, size/8
    );

    // Add gradient stops - brighter at center, full color at edge
    tipGradient.addColorStop(0, lighten(tipColor, 0.1));
    tipGradient.addColorStop(1, tipColor);

    ctx.fillStyle = tipGradient;

    // Draw green tips
    ctx.beginPath();
    ctx.arc(-size/4, size, size/8, 0, Math.PI * 2);
    ctx.arc(0, size, size/8, 0, Math.PI * 2);
    ctx.arc(size/4, size, size/8, 0, Math.PI * 2);
    ctx.fill();
}
