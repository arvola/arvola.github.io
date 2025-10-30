import { FlowerData } from "./spec.ts";
import {
    drawCircularPetals,
    drawFlowerCenter,
    getNoiseBasedColorVariation,
} from "./utils";
import { noise } from "../../../graphics.ts";
import { drawLeaves, LeafParams } from "./leaves.ts";
import { generateLeaves } from "./leaf-layout.ts"; // Define daisy colors

// Define daisy colors
const DAISY_COLORS = {
    petals: "#f8f8e5",
    center: "#ffdd00",
    leaves: "#2e8b57",
};

/**
 * Draw daisy-specific leaves
 * Daisies typically have oval leaves with rounded tips or thread leaves
 */
function drawDaisyLeaves(
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
            lowBand: 0.12,
            bandSpan: 0.40,
            hardCap: 0.60,
            minGap: 0.12,
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
            widthBase: 0.30,
            widthVar: 0.12,
            lengthBase: 1.90,
            lengthVar: 0.80,
            stemBase: 0.345,
            stemVar: 0.135,
        },
        orientation: {
            rotationBase: 0.49,
            rotationSideBias: 0.01,
            rotationJitter: 0.02,
            tiltBase: -0.85,
            tiltJitter: 0.25,
        },
        curvature: {
            archBase: 0.50,
            archVar: 0.45,
            archUpBase: 0.12,
            archUpVar: 0.25,
        },
    });

    // Draw the leaves
    drawLeaves(ctx, size, stemHeight, flower, leafParams);
}

export function drawDaisy(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData,
) {
    const petalCount = 12;
    const centerRadius = size / 3;

    // Get color variations based on flower position
    const { color: petalColor, noiseValue } = getNoiseBasedColorVariation(
        DAISY_COLORS.petals,
        flower,
        0.01, // Lower intensity for subtle variation
    );

    // Draw the petals
    drawCircularPetals(ctx, petalCount, size, petalColor, {
        petalLength: size,
        petalWidthRatio: 1 / 6,
        useRadialGradient: true,
        darkenInnerColor: 0.1,
        offsetX: 0.5,
        offsetY: 0.5,
        tipShape: "rounded",
        tipSharpness: 0.1, // Subtle point for daisy petals
    });

    // Get center color variation
    const { color: centerColor } = getNoiseBasedColorVariation(
        DAISY_COLORS.center,
        flower,
        0.075, // Higher intensity for more noticeable variation
    );

    // Draw the center
    drawFlowerCenter(ctx, centerColor, centerRadius, false);
}

// Export the leaf drawing function for daisies
export function drawDaisyWithLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData,
) {
    // Draw the leaves
    drawDaisyLeaves(ctx, size, stemHeight, flower);
}
