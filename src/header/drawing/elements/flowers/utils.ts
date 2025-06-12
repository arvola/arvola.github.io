import { lighten, darken } from "../../color.ts";
import { noise } from "../../../graphics.ts";
import { FlowerData } from "./spec.ts";

/**
 * Generates a color variation based on noise from the flower's position
 * @param baseColor The base color to vary
 * @param flower The flower data containing position
 * @param intensity The intensity of the variation (higher = more variation)
 * @param scale The scale factor for the noise calculation
 * @returns The varied color
 */
export function getNoiseBasedColorVariation(
    baseColor: string,
    flower: FlowerData,
    intensity: number = 0.1,
    scale: number = 1
): { color: string, noiseValue: number } {
    // Generate deterministic color variance based on flower position
    const noiseValue = (1 + noise(flower.x * 0.01 * scale, flower.y * 0.01 * scale)) / 2;

    // Slightly vary the color
    const color = noiseValue > 0.5 
        ? lighten(baseColor, (noiseValue - 0.5) * intensity * 2)
        : darken(baseColor, (0.5 - noiseValue) * intensity * 2);

    return { color, noiseValue };
}

/**
 * Creates a radial gradient for a flower center
 * @param ctx The canvas context
 * @param centerColor The base color for the center
 * @param centerRadius The radius of the center
 * @param lightenFactor How much to lighten the center color at the middle
 * @returns The created gradient
 */
export function createCenterGradient(
    ctx: CanvasRenderingContext2D,
    centerColor: string,
    centerRadius: number,
    lightenFactor: number = 0.1
): CanvasGradient {
    const gradient = ctx.createRadialGradient(
        0, 0, 0,
        0, 0, centerRadius
    );
    gradient.addColorStop(0, lighten(centerColor, lightenFactor));
    gradient.addColorStop(1, centerColor);
    return gradient;
}

/**
 * Draws a circular flower center
 * @param ctx The canvas context
 * @param centerColor The color for the center
 * @param centerRadius The radius of the center
 * @param useGradient Whether to use a gradient (true) or solid color (false)
 * @param lightenFactor How much to lighten the center color at the middle if using gradient
 */
export function drawFlowerCenter(
    ctx: CanvasRenderingContext2D,
    centerColor: string,
    centerRadius: number,
    useGradient: boolean = true,
    lightenFactor: number = 0.1
): void {
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);

    if (useGradient) {
        ctx.fillStyle = createCenterGradient(ctx, centerColor, centerRadius, lightenFactor);
    } else {
        ctx.fillStyle = centerColor;
    }

    ctx.fill();
}

/**
 * Draws multiple petals in a circular pattern
 * @param ctx The canvas context
 * @param petalCount Number of petals to draw
 * @param size Base size of the flower
 * @param petalColor Color of the petals
 * @param options Additional options for customizing the petals
 */
export function drawCircularPetals(
    ctx: CanvasRenderingContext2D,
    petalCount: number,
    size: number,
    petalColor: string,
    options: {
        petalLength?: number;
        petalWidthRatio?: number;
        useRadialGradient?: boolean;
        darkenInnerColor?: number;
        lightenOuterColor?: number;
        rotateContext?: boolean;
        offsetX?: number;
        offsetY?: number;
        tipShape?: "rounded" | "pointed" | "notched";
        tipSharpness?: number; // Controls how sharp the point is (0-1)
        notchDepth?: number; // Controls how deep the notch is (0-1)
    } = {}
): void {
    // Set default options
    const {
        petalLength = size,
        petalWidthRatio = 1/6,
        useRadialGradient = true,
        darkenInnerColor = 0.1,
        lightenOuterColor = 0,
        rotateContext = false,
        offsetX = 0.5,
        offsetY = 0.5,
        tipShape = "rounded",
        tipSharpness = 0.5,
        notchDepth = 0.2
    } = options;

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        const x = Math.cos(angle) * size;
        const y = Math.sin(angle) * size;

        if (rotateContext) {
            ctx.save();
            ctx.rotate(angle);
        }

        // Create gradient for the petal
        let gradient: CanvasGradient;

        if (useRadialGradient) {
            gradient = ctx.createRadialGradient(
                x * offsetX / 2, y * offsetY / 2, 0,
                x * offsetX, y * offsetY, petalLength / 2
            );
            gradient.addColorStop(0, darken(petalColor, darkenInnerColor));
            gradient.addColorStop(1, lightenOuterColor > 0 ? lighten(petalColor, lightenOuterColor) : petalColor);
        } else {
            // Use linear gradient if radial is not specified
            if (rotateContext) {
                gradient = ctx.createLinearGradient(
                    size / 3, 0,
                    size * 1.5, 0
                );
            } else {
                gradient = ctx.createLinearGradient(
                    x * offsetX / 2, y * offsetY / 2,
                    x * offsetX, y * offsetY
                );
            }
            gradient.addColorStop(0, darken(petalColor, darkenInnerColor));
            gradient.addColorStop(0.7, petalColor);
            gradient.addColorStop(1, lightenOuterColor > 0 ? lighten(petalColor, lightenOuterColor) : petalColor);
        }

        ctx.fillStyle = gradient;

        // Draw the petal based on the tip shape
        ctx.beginPath();

        if (rotateContext) {
            // For rotated context (like sunflower)
            if (tipShape === "rounded") {
                // Original rounded petal shape
                ctx.ellipse(
                    size / 1.5, 0,
                    petalLength / 2, petalLength * petalWidthRatio,
                    0,
                    0, Math.PI * 2
                );
            } else if (tipShape === "pointed") {
                // Pointed petal shape
                const petalWidth = petalLength * petalWidthRatio;
                const centerX = size / 1.5;
                const tipX = centerX + petalLength / 2 + (petalLength / 2) * tipSharpness;

                // Start at the base of the petal
                ctx.moveTo(centerX - petalLength / 4, -petalWidth);

                // Draw the top edge to the tip
                ctx.quadraticCurveTo(
                    centerX + petalLength / 4, -petalWidth * 1.5,
                    tipX, 0
                );

                // Draw the bottom edge back to the base
                ctx.quadraticCurveTo(
                    centerX + petalLength / 4, petalWidth * 1.5,
                    centerX - petalLength / 4, petalWidth
                );

                // Close the path
                ctx.closePath();
            } else if (tipShape === "notched") {
                // Notched petal shape
                const petalWidth = petalLength * petalWidthRatio;
                const centerX = size / 1.5;
                const tipX = centerX + petalLength / 2;
                const notchX = tipX - (petalLength / 8) * notchDepth;

                // Start at the base of the petal
                ctx.moveTo(centerX - petalLength / 4, -petalWidth);

                // Draw the top edge to the first tip
                ctx.quadraticCurveTo(
                    centerX + petalLength / 6, -petalWidth * 1.5,
                    tipX - petalWidth / 2, -petalWidth / 3
                );

                // Draw the notch
                ctx.lineTo(notchX, 0);

                // Draw to the second tip
                ctx.lineTo(tipX - petalWidth / 2, petalWidth / 3);

                // Draw the bottom edge back to the base
                ctx.quadraticCurveTo(
                    centerX + petalLength / 6, petalWidth * 1.5,
                    centerX - petalLength / 4, petalWidth
                );

                // Close the path
                ctx.closePath();
            }
        } else {
            // For non-rotated context (like daisy)
            const centerX = x * offsetX;
            const centerY = y * offsetY;

            if (tipShape === "rounded") {
                // Original rounded petal shape
                ctx.ellipse(
                    centerX, centerY,
                    petalLength / 2, petalLength * petalWidthRatio,
                    angle,
                    0, Math.PI * 2
                );
            } else if (tipShape === "pointed") {
                // Save context to restore rotation later
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);

                const petalWidth = petalLength * petalWidthRatio;
                const tipDistance = petalLength / 2 + (petalLength / 2) * tipSharpness;

                // Start at the base of the petal
                ctx.moveTo(-petalLength / 4, -petalWidth);

                // Draw the top edge to the tip
                ctx.quadraticCurveTo(
                    petalLength / 4, -petalWidth * 1.5,
                    tipDistance, 0
                );

                // Draw the bottom edge back to the base
                ctx.quadraticCurveTo(
                    petalLength / 4, petalWidth * 1.5,
                    -petalLength / 4, petalWidth
                );

                // Close the path
                ctx.closePath();

                // Restore context
                ctx.restore();
            } else if (tipShape === "notched") {
                // Save context to restore rotation later
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(angle);

                const petalWidth = petalLength * petalWidthRatio;
                const tipDistance = petalLength / 2;
                const notchDistance = tipDistance - (petalLength / 8) * notchDepth;

                // Start at the base of the petal
                ctx.moveTo(-petalLength / 4, -petalWidth);

                // Draw the top edge to the first tip
                ctx.quadraticCurveTo(
                    petalLength / 6, -petalWidth * 1.5,
                    tipDistance - petalWidth / 2, -petalWidth / 3
                );

                // Draw the notch
                ctx.lineTo(notchDistance, 0);

                // Draw to the second tip
                ctx.lineTo(tipDistance - petalWidth / 2, petalWidth / 3);

                // Draw the bottom edge back to the base
                ctx.quadraticCurveTo(
                    petalLength / 6, petalWidth * 1.5,
                    -petalLength / 4, petalWidth
                );

                // Close the path
                ctx.closePath();

                // Restore context
                ctx.restore();
            }
        }

        ctx.fill();

        if (rotateContext) {
            ctx.restore();
        }
    }
}

/**
 * Draws a spiral pattern of petals (like a rose)
 * @param ctx The canvas context
 * @param petalCount Number of petals to draw
 * @param size Base size of the flower
 * @param petalColor Color of the outer petals
 * @param innerPetalColor Color of the inner petals
 * @param options Additional options for customizing the spiral
 */
export function drawSpiralPetals(
    ctx: CanvasRenderingContext2D,
    petalCount: number,
    size: number,
    petalColor: string,
    innerPetalColor: string,
    options: {
        spiralFactor?: number;
        minScale?: number;
        maxScale?: number;
        widthRatio?: number;
        tipShape?: "rounded" | "pointed" | "notched";
        tipSharpness?: number; // Controls how sharp the point is (0-1)
        notchDepth?: number; // Controls how deep the notch is (0-1)
    } = {}
): void {
    // Set default options
    const {
        spiralFactor = 4,
        minScale = 0.3,
        maxScale = 1.0,
        widthRatio = 0.625, // 0.25 / 0.4
        tipShape = "rounded",
        tipSharpness = 0.5,
        notchDepth = 0.2
    } = options;

    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * spiralFactor;
        const scale = minScale + (i / petalCount) * (maxScale - minScale);
        const x = Math.cos(angle) * size * scale * 0.5;
        const y = Math.sin(angle) * size * scale * 0.5;

        // Create a radial gradient for each petal
        const petalRadius = size * 0.4 * scale;
        const normalizedScale = (scale - minScale) / (maxScale - minScale); // 0 for innermost petal, 1 for outermost

        // Blend between inner and outer petal colors based on position in spiral
        const currentPetalColor = normalizedScale < 0.5 
            ? innerPetalColor 
            : petalColor;

        // Create gradient from center of petal outward
        const gradient = ctx.createRadialGradient(
            x, y, 0,
            x, y, petalRadius
        );

        // Create a consistent gradient for all petals
        // Use the base color at the center and a slightly lighter color at the edges
        gradient.addColorStop(0, currentPetalColor);
        gradient.addColorStop(1, lighten(currentPetalColor, 0.1));

        ctx.fillStyle = gradient;

        // Draw the petal based on the tip shape
        ctx.beginPath();

        if (tipShape === "rounded") {
            // Original rounded petal shape
            ctx.ellipse(
                x, y,
                petalRadius,
                petalRadius * widthRatio,
                angle,
                0, Math.PI * 2
            );
        } else {
            // Save context to restore rotation later
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            const petalWidth = petalRadius * widthRatio;

            if (tipShape === "pointed") {
                // Pointed petal shape
                const tipDistance = petalRadius + petalRadius * tipSharpness;

                // Start at the base of the petal
                ctx.moveTo(-petalRadius / 2, -petalWidth);

                // Draw the top edge to the tip
                ctx.quadraticCurveTo(
                    petalRadius / 4, -petalWidth * 1.5,
                    tipDistance, 0
                );

                // Draw the bottom edge back to the base
                ctx.quadraticCurveTo(
                    petalRadius / 4, petalWidth * 1.5,
                    -petalRadius / 2, petalWidth
                );

                // Close the path
                ctx.closePath();
            } else if (tipShape === "notched") {
                // Notched petal shape
                const tipDistance = petalRadius;
                const notchDistance = tipDistance - (petalRadius / 4) * notchDepth;

                // Start at the base of the petal
                ctx.moveTo(-petalRadius / 2, -petalWidth);

                // Draw the top edge to the first tip
                ctx.quadraticCurveTo(
                    petalRadius / 6, -petalWidth * 1.5,
                    tipDistance - petalWidth / 2, -petalWidth / 3
                );

                // Draw the notch
                ctx.lineTo(notchDistance, 0);

                // Draw to the second tip
                ctx.lineTo(tipDistance - petalWidth / 2, petalWidth / 3);

                // Draw the bottom edge back to the base
                ctx.quadraticCurveTo(
                    petalRadius / 6, petalWidth * 1.5,
                    -petalRadius / 2, petalWidth
                );

                // Close the path
                ctx.closePath();
            }

            // Restore context
            ctx.restore();
        }

        ctx.fill();
    }
}
