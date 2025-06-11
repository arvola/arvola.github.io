import { LayerSpec, SpecDrawingFunc } from "./base.ts";
import { ColorMap, colorFromSpec, ColorSpec } from "../color.ts";
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
    for (const flower of spec.flowers) {
        drawFlower(ctx, flower, spec.colors, c);
    }
};

function drawFlower(
    ctx: CanvasRenderingContext2D,
    flower: FlowerData,
    colors: ColorSpec[],
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

    ctx.strokeStyle = colorFromSpec("#2e8b57", c); // Green stem
    ctx.lineWidth = size / 8;
    ctx.stroke();

    // 3. Move context to the top of the stem where the flower will be drawn
    ctx.translate(0, -stemHeight);

    // Draw specific flower type
    // The context is already positioned at the top of the stem, ready for flower drawing
    switch (flower.type) {
        case "daisy":
            drawDaisy(ctx, size, colors, c);
            break;
        case "tulip":
            drawTulip(ctx, size, colors, c);
            break;
        case "sunflower":
            drawSunflower(ctx, size, colors, c);
            break;
        case "rose":
            drawRose(ctx, size, colors, c);
            break;
        case "snowdrop":
            drawSnowdrop(ctx, size, colors, c);
            break;
    }

    ctx.restore();
}

function drawDaisy(
    ctx: CanvasRenderingContext2D,
    size: number,
    colors: ColorSpec[],
    c: ColorMap
) {
    const petalCount = 12;
    const petalLength = size;
    const centerRadius = size / 3;

    // Draw petals
    ctx.fillStyle = colorFromSpec(colors[0] || "#ffffff", c);

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;

        ctx.beginPath();
        ctx.ellipse(
            x / 2, y / 2,
            petalLength / 2, petalLength / 6,
            angle,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    // Draw center
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = colorFromSpec(colors[1] || "#ffdd00", c);
    ctx.fill();
}

function drawTulip(
    ctx: CanvasRenderingContext2D,
    size: number,
    colors: ColorSpec[],
    c: ColorMap
) {
    const petalSize = size * 0.8;

    // Draw petals
    ctx.fillStyle = colorFromSpec(colors[0] || "#ff6b6b", c);

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
    colors: ColorSpec[],
    c: ColorMap
) {
    const petalCount = 18;
    const petalLength = size * 1.2;
    const centerRadius = size / 2;

    // Draw petals
    ctx.fillStyle = colorFromSpec(colors[0] || "#ffd700", c); // Gold

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;

        ctx.save();
        ctx.rotate(angle);

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

    // Draw center
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = colorFromSpec(colors[1] || "#704214", c); // Dark brown
    ctx.fill();

    // Draw seed pattern
    ctx.fillStyle = colorFromSpec(colors[2] || "#3a2204", c); // Darker brown
    const seedCount = 20;
    for (let i = 0; i < seedCount; i++) {
        const angle = (i / seedCount) * Math.PI * 2;
        const distance = Math.random() * (centerRadius * 0.8);
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
    colors: ColorSpec[],
    c: ColorMap
) {
    const petalCount = 12;
    ctx.fillStyle = colorFromSpec(colors[0] || "#e91e63", c); // Pink

    // Draw rose spiral
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 4;
        const scale = 0.3 + (i / petalCount) * 0.7;
        const x = Math.cos(angle) * size * scale * 0.5;
        const y = Math.sin(angle) * size * scale * 0.5;

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
    colors: ColorSpec[],
    c: ColorMap
) {
    ctx.fillStyle = colorFromSpec(colors[0] || "#ffffff", c); // White

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

    // Draw green tips
    ctx.fillStyle = colorFromSpec("#4caf50", c); // Green
    ctx.beginPath();
    ctx.arc(-size/4, size, size/8, 0, Math.PI * 2);
    ctx.arc(0, size, size/8, 0, Math.PI * 2);
    ctx.arc(size/4, size, size/8, 0, Math.PI * 2);
    ctx.fill();
}
