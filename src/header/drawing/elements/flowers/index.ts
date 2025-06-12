// Re-export everything from the flower modules
import { SpecDrawingFunc } from "../base.ts";

export * from './common';
export * from './daisy';
export * from './tulip';
export * from './sunflower';
export * from './rose';
export * from './snowdrop';

// Export the main drawFlowers function
import { drawFlowerShadow, drawFlowerWithoutShadow } from "./common";
import { FlowersSpec } from "./spec.ts";

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

    // Sort flowers by y-coordinate (vertically higher flowers first)
    // This ensures flowers in the background are drawn first
    const sortedFlowers = [...spec.flowers].sort((a, b) => a.y - b.y);

    // Find the highest and lowest y values to normalize the size adjustment
    // Calculate this once for use with both shadows and flowers
    const minY = Math.min(...sortedFlowers.map(f => f.y));
    const maxY = Math.max(...sortedFlowers.map(f => f.y));
    const range = maxY - minY;

    // Draw all shadows at full opacity
    for (const flower of sortedFlowers) {
        // Create a copy of the flower with adjusted size based on vertical position
        const adjustedFlower = { ...flower };

        if (range > 0) {
            // Scale factor: flowers at the top (minY) will be smaller, flowers at the bottom (maxY) will be normal size
            const scaleFactor = 0.8 + 0.2 * ((flower.y - minY) / range);
            adjustedFlower.size = flower.size * scaleFactor;
        }

        drawFlowerShadow(shadowCtx, adjustedFlower);
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
    // Use the same sorted order to ensure consistency
    // We already calculated minY, maxY, and range above

    for (const flower of sortedFlowers) {
        // Create a copy of the flower with adjusted size based on vertical position
        // Higher flowers (lower y values) should be slightly smaller to create depth perception
        const adjustedFlower = { ...flower };

        if (range > 0) {
            // Scale factor: flowers at the top (minY) will be smaller, flowers at the bottom (maxY) will be normal size
            // Adjust the 0.8 value to control how much smaller the background flowers should be
            const scaleFactor = 0.8 + 0.2 * ((flower.y - minY) / range);
            adjustedFlower.size = flower.size * scaleFactor;
        }

        drawFlowerWithoutShadow(ctx, adjustedFlower);
    }
};
