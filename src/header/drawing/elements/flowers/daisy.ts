import { FlowerData } from "./spec.ts";
import { 
    getNoiseBasedColorVariation, 
    drawFlowerCenter, 
    drawCircularPetals 
} from "./utils";

// Define daisy colors
const DAISY_COLORS = {
    petals: "#f8f8e5",
    center: "#ffdd00",
};

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
