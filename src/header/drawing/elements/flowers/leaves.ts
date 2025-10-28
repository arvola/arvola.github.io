import { darken, lighten } from "../../color.ts";
import { FlowerData } from "./spec.ts";

// Define leaf types
export type LeafShape = "ovate" | "oval" | "cordate" | "thread" | "lanceolate";

// Interface for leaf parameters
export interface LeafParams {
    shape: LeafShape;
    width?: number;      // Width of the leaf
    length?: number;     // Length of the leaf
    stemLength?: number; // Length of the leaf stem
    tipShape?: "rounded" | "sharp"; // For oval leaves
    color?: string;      // Optional custom color
    tilt?: number;       // Angle of the leaf stem compared to the flower stem (in radians)
    rotation?: number;   // Rotation around the stem (0-1, where 0 is facing forward, 0.5 is profile)
    arch?: number;       // Downward bend (0..1) where 0 is straight, 1 is strong arch due to gravity
    archUp?: number;     // Initial upward lift near the base (0..1), then droop
    stemPos?: number;    // Optional explicit position along stem (0..1 from base to top); overrides default spacing
}

// Default leaf color
const DEFAULT_LEAF_COLOR = "#2e8b57"; // Same as stem color

/**
 * Draws leaves on a flower stem
 * @param ctx The canvas context
 * @param size Base size of the flower
 * @param stemHeight Height of the stem
 * @param flower The flower data
 * @param leafParams Parameters for the leaves
 */
export function drawLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData,
    leafParams?: LeafParams[]
): void {
    // If no leaf parameters provided, don't draw any leaves
    if (!leafParams || leafParams.length === 0) {
        return;
    }

    // Save the current context state
    ctx.save();

    // Build drawing queue with computed positions and stable sides based on original order
    type LeafDrawItem = { params: LeafParams; stemPosition: number; side: number };
    const items: LeafDrawItem[] = [];

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    for (let i = 0; i < leafParams.length; i++) {
        const params = leafParams[i];
        const side = i % 2 === 0 ? 1 : -1; // keep alternating pattern by declaration order
        const positionRatio = typeof params.stemPos === "number"
            ? clamp01(params.stemPos)
            : (i + 1) / (leafParams.length + 1);
        const stemPosition = positionRatio * stemHeight;
        items.push({ params, stemPosition, side });
    }

    // Draw bottom-to-top for natural layering
    items.sort((a, b) => a.stemPosition - b.stemPosition);

    for (const item of items) {
        const params = item.params;
        const stemPosition = item.stemPosition;
        const side = item.side;

        // Default values if not specified
        const width = params.width || size * 0.5;
        const length = params.length || size * 0.8;
        const stemLength = params.stemLength || size * 0.2;
        const leafColor = params.color || DEFAULT_LEAF_COLOR;

        // Get tilt and rotation parameters (default to 0 if not specified)
        const tilt = params.tilt || 0;
        const rotation = params.rotation || 0;

        // Draw the leaf based on its shape
        switch (params.shape) {
            case "ovate":
                drawOvateLeaf(ctx, stemPosition, side, width, length, stemLength, leafColor, tilt, rotation);
                break;
            case "oval":
                drawOvalLeaf(ctx, stemPosition, side, width, length, stemLength, leafColor, params.tipShape || "rounded", tilt, rotation);
                break;
            case "cordate":
                drawCordateLeaf(ctx, stemPosition, side, width, length, leafColor, tilt, rotation);
                break;
            case "thread":
                drawThreadLeaf(ctx, stemPosition, side, length, leafColor, tilt, rotation);
                break;
            case "lanceolate":
                drawLanceolateLeaf(ctx, stemPosition, side, width, length, stemLength, leafColor, tilt, rotation, params.arch || 0, params.archUp);
                break;
        }
    }

    // Restore the context state
    ctx.restore();
}

/**
 * Draws an ovate (egg-shaped) leaf
 */
function drawOvateLeaf(
    ctx: CanvasRenderingContext2D,
    stemPosition: number,
    side: number,
    width: number,
    length: number,
    stemLength: number,
    color: string,
    tilt: number = 0,
    rotation: number = 0
): void {
    // Save context for this leaf
    ctx.save();

    // Move to the position on the stem
    ctx.translate(0, -stemPosition);

    // Calculate the actual rotation angle based on the side and rotation parameter
    // When rotation is 0.5 (profile view), we want to see the leaf from the side
    const rotationAngle = side * Math.PI * (rotation - 0.5);

    // Apply tilt to the leaf stem - tilt is now applied in 3D space
    // When leaf is rotated to profile view, tilt should affect the apparent height
    // When leaf is facing forward, tilt should affect the apparent angle
    // Normalize sign so positive tilt is upward regardless of which side the leaf is on
    const effectiveTilt = tilt * side * (1 - Math.abs(rotation - 0.5) * 2);
    ctx.rotate(effectiveTilt);

    // Apply rotation around the stem
    ctx.rotate(rotationAngle);

    // Create a gradient for the leaf
    const gradient = ctx.createLinearGradient(0, 0, side * (stemLength + width), 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, lighten(color, 0.1));

    ctx.fillStyle = gradient;

    // Draw the leaf stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * stemLength, 0);
    ctx.strokeStyle = darken(color, 0.1);
    ctx.lineWidth = width * 0.1;
    ctx.stroke();

    // Save context before drawing the leaf
    ctx.save();

    // Move to the end of the stem where the leaf will be drawn
    ctx.translate(side * stemLength, 0);

    // Calculate rotation factor for 3D effect (0 when facing forward/back, 1 when in profile)
    const rotationFactor = Math.sin(Math.abs(rotationAngle));

    // Adjust width based on rotation - smoother transition
    const adjustedWidth = width * (1 - rotationFactor * 0.9); // Not completely flat even in profile

    // Apply perspective skew based on rotation and tilt
    // This creates a more convincing 3D effect by skewing the leaf shape
    const skewFactor = rotationFactor * 0.2 * Math.sign(rotation - 0.5);
    ctx.transform(1, 0, skewFactor, 1, 0, 0); // Apply horizontal skew

    // Apply vertical skew based on tilt when rotated
    // Normalize sign so positive tilt is upward regardless of side
    const verticalSkew = tilt * side * rotationFactor * 0.3;
    ctx.transform(1, verticalSkew, 0, 1, 0, 0);

    // Draw the ovate leaf shape
    ctx.beginPath();

    // Start at the stem connection point (now at origin after translation)
    ctx.moveTo(0, 0);

    // Draw the top curve of the leaf (wider at the base, narrower at the tip)
    // Use bezier curve for more natural shape
    ctx.bezierCurveTo(
        length * 0.3, -adjustedWidth * 0.1,
        length * 0.7, -adjustedWidth * 0.4,
        length, 0
    );

    // Draw the bottom curve back to the stem
    ctx.bezierCurveTo(
        length * 0.7, adjustedWidth * 0.4,
        length * 0.3, adjustedWidth * 0.1,
        0, 0
    );

    ctx.fill();

    // Draw a simple vein down the middle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Draw a curved vein that follows the leaf shape
    ctx.bezierCurveTo(
        length * 0.3, 0,
        length * 0.6, 0,
        length, 0
    );
    ctx.strokeStyle = darken(color, 0.2);
    ctx.lineWidth = width * 0.02; // Much thinner than the leaf stem (which is width * 0.1)
    ctx.stroke();

    // Restore context after rotation
    ctx.restore();

    // Restore context for the leaf
    ctx.restore();
}

/**
 * Draws an oval leaf with either rounded or sharp tip
 */
function drawOvalLeaf(
    ctx: CanvasRenderingContext2D,
    stemPosition: number,
    side: number,
    width: number,
    length: number,
    stemLength: number,
    color: string,
    tipShape: "rounded" | "sharp",
    tilt: number = 0,
    rotation: number = 0
): void {
    // Save context for this leaf
    ctx.save();

    // Move to the position on the stem
    ctx.translate(0, -stemPosition);

    // Calculate the actual rotation angle based on the side and rotation parameter
    // When rotation is 0.5 (profile view), we want to see the leaf from the side
    const rotationAngle = side * Math.PI * (rotation - 0.5);

    // Apply tilt to the leaf stem - tilt is now applied in 3D space
    // When leaf is rotated to profile view, tilt should affect the apparent height
    // When leaf is facing forward, tilt should affect the apparent angle
    // Normalize sign so positive tilt is upward regardless of which side the leaf is on
    const effectiveTilt = tilt * side * (1 - Math.abs(rotation - 0.5) * 2);
    ctx.rotate(effectiveTilt);

    // Apply rotation around the stem
    ctx.rotate(rotationAngle);

    // Create a gradient for the leaf
    const gradient = ctx.createLinearGradient(0, 0, side * (stemLength + length), 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, lighten(color, 0.1));

    ctx.fillStyle = gradient;

    // Draw the leaf stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * stemLength, 0);
    ctx.strokeStyle = darken(color, 0.1);
    ctx.lineWidth = width * 0.1;
    ctx.stroke();

    // Save context before drawing the leaf
    ctx.save();

    // Move to the end of the stem where the leaf will be drawn
    ctx.translate(side * stemLength, 0);

    // Calculate rotation factor for 3D effect (0 when facing forward/back, 1 when in profile)
    const rotationFactor = Math.sin(Math.abs(rotationAngle));

    // Adjust width based on rotation - smoother transition
    const adjustedWidth = width * (1 - rotationFactor * 0.9); // Not completely flat even in profile

    // Apply perspective skew based on rotation and tilt
    // This creates a more convincing 3D effect by skewing the leaf shape
    const skewFactor = rotationFactor * 0.2 * Math.sign(rotation - 0.5);
    ctx.transform(1, 0, skewFactor, 1, 0, 0); // Apply horizontal skew

    // Apply vertical skew based on tilt when rotated
    // Normalize sign so positive tilt is upward regardless of side
    const verticalSkew = tilt * side * rotationFactor * 0.3;
    ctx.transform(1, verticalSkew, 0, 1, 0, 0);

    // Use a smooth transition between profile and front view instead of abrupt change
    const profileBlend = smoothStep(0.6, 0.8, rotationFactor); // Smooth transition between 0.6-0.8

    // Draw the oval leaf shape
    ctx.beginPath();

    if (tipShape === "rounded") {
        if (profileBlend > 0) {
            // Blend between normal ellipse and profile view
            // In profile view, draw a semi-ellipse above the stem
            const normalHeight = adjustedWidth/2;
            const profileHeight = width/2;
            const blendedHeight = normalHeight * (1 - profileBlend) + profileHeight * profileBlend;

            if (profileBlend < 1) {
                // Partial blend - draw a full ellipse with adjusted height
                ctx.ellipse(
                    length/2, -blendedHeight * profileBlend, // Shift center up as we approach profile
                    length/2, blendedHeight,
                    0, 0, Math.PI * 2
                );
            } else {
                // Full profile view
                ctx.moveTo(0, 0);
                ctx.lineTo(length, 0);
                ctx.ellipse(
                    length/2, -blendedHeight,
                    length/2, blendedHeight,
                    0, Math.PI, 0, true
                );
                ctx.closePath();
            }
        } else {
            // Normal view - draw a full ellipse
            ctx.ellipse(
                length/2, 0,
                length/2, adjustedWidth/2,
                0, 0, Math.PI * 2
            );
        }
    } else {
        // Draw a sharp-tipped oval leaf
        if (profileBlend > 0) {
            // Blend between normal shape and profile view
            const normalHeight = adjustedWidth * 0.4;
            const profileHeight = width;
            const blendedHeight = normalHeight * (1 - profileBlend) + profileHeight * profileBlend;

            // Start at the stem connection point
            ctx.moveTo(0, 0);

            // Draw the top curve - blend between quadratic curve and straight line
            if (profileBlend < 1) {
                // Partial blend
                const midX = length * 0.5;
                const midY = -blendedHeight;

                ctx.quadraticCurveTo(
                    midX, midY,
                    length, 0
                );

                // Draw the bottom curve back to the stem - less curved in profile
                ctx.quadraticCurveTo(
                    midX, adjustedWidth * 0.4 * (1 - profileBlend),
                    0, 0
                );
            } else {
                // Full profile view - triangular shape
                ctx.lineTo(length, 0);
                ctx.lineTo(length/2, -blendedHeight);
                ctx.closePath();
            }
        } else {
            // Normal view
            // Start at the stem connection point
            ctx.moveTo(0, 0);

            // Draw the top curve
            ctx.quadraticCurveTo(
                length * 0.5, -adjustedWidth * 0.4,
                length, 0
            );

            // Draw the bottom curve back to the stem
            ctx.quadraticCurveTo(
                length * 0.5, adjustedWidth * 0.4,
                0, 0
            );
        }
    }

    ctx.fill();

    // Draw a simple vein down the middle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.strokeStyle = darken(color, 0.2);
    ctx.lineWidth = width * 0.02; // Much thinner than the leaf stem (which is width * 0.1)
    ctx.stroke();

    // Restore context after rotation
    ctx.restore();

    // Restore context for the leaf
    ctx.restore();
}

// Helper function for smooth transitions
const smoothStep = function(min: number, max: number, value: number): number {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
};

/**
 * Draws a heart-shaped (cordate) leaf
 */
function drawCordateLeaf(
    ctx: CanvasRenderingContext2D,
    stemPosition: number,
    side: number,
    width: number,
    length: number,
    color: string,
    tilt: number = 0,
    rotation: number = 0
): void {
    // Save context for this leaf
    ctx.save();

    // Move to the position on the stem
    ctx.translate(0, -stemPosition);

    // Calculate the actual rotation angle based on the side and rotation parameter
    // When rotation is 0.5 (profile view), we want to see the leaf from the side
    const rotationAngle = side * Math.PI * (rotation - 0.5);

    // Apply tilt to the leaf stem - tilt is now applied in 3D space
    // When leaf is rotated to profile view, tilt should affect the apparent height
    // When leaf is facing forward, tilt should affect the apparent angle
    // Normalize sign so positive tilt is upward regardless of which side the leaf is on
    const effectiveTilt = tilt * side * (1 - Math.abs(rotation - 0.5) * 2);
    ctx.rotate(effectiveTilt);

    // Apply rotation around the stem
    ctx.rotate(rotationAngle);

    // Create a gradient for the leaf
    const gradient = ctx.createLinearGradient(0, 0, side * width, 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, lighten(color, 0.1));

    ctx.fillStyle = gradient;

    // Calculate rotation factor for 3D effect (0 when facing forward/back, 1 when in profile)
    const rotationFactor = Math.sin(Math.abs(rotationAngle));

    // Adjust width based on rotation - smoother transition
    const adjustedWidth = width * (1 - rotationFactor * 0.9); // Not completely flat even in profile

    // Apply perspective skew based on rotation and tilt
    // This creates a more convincing 3D effect by skewing the leaf shape
    const skewFactor = rotationFactor * 0.2 * Math.sign(rotation - 0.5);
    ctx.transform(1, 0, skewFactor, 1, 0, 0); // Apply horizontal skew

    // Apply vertical skew based on tilt when rotated
    // Normalize sign so positive tilt is upward regardless of side
    const verticalSkew = tilt * side * rotationFactor * 0.3;
    ctx.transform(1, verticalSkew, 0, 1, 0, 0);

    // Use a smooth transition between profile and front view instead of abrupt change
    const profileBlend = smoothStep(0.6, 0.8, rotationFactor); // Smooth transition between 0.6-0.8

    // Draw the heart-shaped leaf
    ctx.beginPath();

    // Start at the stem connection point
    ctx.moveTo(0, 0);

    if (profileBlend > 0) {
        // Blend between normal heart shape and profile view
        // Calculate control points that blend between the two shapes
        const normalLobeHeight = length * 0.8;
        const profileLobeHeight = length * 0.8;
        const blendedLobeHeight = normalLobeHeight * (1 - profileBlend) + profileLobeHeight * profileBlend;

        // Calculate the width of the heart lobes based on profile blend
        const lobeWidth = side * width * 0.5 * (1 - profileBlend * 0.5); // Reduce width in profile

        // Calculate the depth of the cleft based on profile blend
        const cleftDepth = length * 0.5 * (1 - profileBlend); // Reduce cleft in profile

        if (profileBlend < 0.8) {
            // Partial blend - still draw a heart shape but with adjusted parameters

            // Draw the left lobe of the heart - adjusted for rotation
            ctx.bezierCurveTo(
                side * width * 0.1 * (1 - profileBlend), -length * 0.3 * (1 - profileBlend * 0.5),  // First control point
                side * width * 0.3 * (1 - profileBlend * 0.3), -blendedLobeHeight,  // Second control point
                side * width * 0.5, -cleftDepth   // End point at the cleft of the heart
            );

            // Draw the right lobe of the heart - adjusted for rotation
            ctx.bezierCurveTo(
                side * width * 0.7 * (1 - profileBlend * 0.3), -blendedLobeHeight,  // First control point
                side * width * 0.9 * (1 - profileBlend), -length * 0.3 * (1 - profileBlend * 0.5),  // Second control point
                side * width, 0                     // End point at the right edge
            );

            // Draw the bottom curve back to the stem - flatter in profile view
            ctx.bezierCurveTo(
                side * width * 0.8, length * 0.2 * (1 - profileBlend),   // First control point
                side * width * 0.2, length * 0.2 * (1 - profileBlend),   // Second control point
                0, 0                               // Back to the start
            );
        } else {
            // Near full profile view - simplified curved shape
            // Draw a curved line up and back
            ctx.quadraticCurveTo(
                side * width * 0.5, -blendedLobeHeight,
                side * width, 0
            );

            // Draw the bottom curve back to the stem - flatter in profile
            ctx.quadraticCurveTo(
                side * width * 0.5, length * 0.2 * (1 - (profileBlend - 0.8) * 5), // Gradually flatten
                0, 0
            );
        }
    } else {
        // Normal view with rotation
        // Draw the left lobe of the heart
        ctx.bezierCurveTo(
            side * width * 0.1, -length * 0.3,  // First control point closer to stem
            side * width * 0.3, -length * 0.8,  // Second control point higher up
            side * width * 0.5, -length * 0.5   // End point at the cleft of the heart
        );

        // Draw the right lobe of the heart
        ctx.bezierCurveTo(
            side * width * 0.7, -length * 0.8,  // First control point higher up
            side * width * 0.9, -length * 0.3,  // Second control point closer to edge
            side * width, 0                     // End point at the right edge
        );

        // Draw the bottom curve back to the stem
        ctx.bezierCurveTo(
            side * width * 0.8, length * 0.2,   // First control point
            side * width * 0.2, length * 0.2,   // Second control point
            0, 0                               // Back to the start
        );
    }

    ctx.fill();

    // Draw veins
    ctx.beginPath();

    // Blend the vein drawing based on profile blend
    if (profileBlend > 0) {
        // Simplified vein that gets simpler as we approach profile view
        ctx.moveTo(0, 0);

        // Main vein - gets straighter in profile view
        const controlY = -length * 0.4 * (1 - profileBlend * 0.5);
        ctx.quadraticCurveTo(
            side * width * 0.5, controlY,
            side * width, 0
        );

        // Only draw additional veins if not too close to profile
        if (profileBlend < 0.5) {
            // Fade out the secondary veins as we approach profile
            const opacity = 1 - profileBlend * 2;
            const originalStrokeStyle = ctx.strokeStyle;

            // Draw with reduced opacity
            ctx.strokeStyle = darken(color, 0.2 * opacity);

            // Draw two smaller veins to each lobe - adjusted for rotation
            const veinScale = 1 - profileBlend;

            ctx.moveTo(side * width * 0.25, -length * 0.25 * veinScale);
            ctx.bezierCurveTo(
                side * width * 0.2, -length * 0.4 * veinScale,
                side * width * 0.15, -length * 0.5 * veinScale,
                side * width * 0.25, -length * 0.6 * veinScale
            );

            ctx.moveTo(side * width * 0.25, -length * 0.25 * veinScale);
            ctx.bezierCurveTo(
                side * width * 0.4, -length * 0.3 * veinScale,
                side * width * 0.6, -length * 0.4 * veinScale,
                side * width * 0.75, -length * 0.3 * veinScale
            );

            // Draw these secondary veins
            ctx.stroke();

            // Restore original stroke style for main vein
            ctx.strokeStyle = originalStrokeStyle;

            // Clear the path and redraw the main vein
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                side * width * 0.5, controlY,
                side * width, 0
            );
        }
    } else {
        // Normal view veins
        ctx.moveTo(0, 0);

        // Draw a curved main vein to the cleft of the heart
        ctx.bezierCurveTo(
            side * width * 0.2, -length * 0.2,  // First control point
            side * width * 0.4, -length * 0.4,  // Second control point
            side * width * 0.5, -length * 0.5   // End at the cleft
        );

        // Draw two smaller veins to each lobe
        ctx.moveTo(side * width * 0.25, -length * 0.25);
        ctx.bezierCurveTo(
            side * width * 0.2, -length * 0.4,
            side * width * 0.15, -length * 0.5,
            side * width * 0.25, -length * 0.6
        );

        ctx.moveTo(side * width * 0.25, -length * 0.25);
        ctx.bezierCurveTo(
            side * width * 0.4, -length * 0.3,
            side * width * 0.6, -length * 0.4,
            side * width * 0.75, -length * 0.3
        );
    }

    ctx.strokeStyle = darken(color, 0.2);
    ctx.lineWidth = width * 0.02; // Much thinner than the leaf stem
    ctx.stroke();

    // Restore context
    ctx.restore();
}

/**
 * Draws a lanceolate (spear-shaped) leaf — narrow, tapered with subtle serrations
 */
function drawLanceolateLeaf(
    ctx: CanvasRenderingContext2D,
    stemPosition: number,
    side: number,
    width: number,
    length: number,
    stemLength: number,
    color: string,
    tilt: number = 0,
    rotation: number = 0,
    arch: number = 0,
    archUp?: number
): void {
    ctx.save();

    // Move to the position on the stem
    ctx.translate(0, -stemPosition);

    // Rotation around stem and tilt handling consistent with other leaves
    const rotationAngle = side * Math.PI * (rotation - 0.5);
    // Normalize sign so positive tilt is upward regardless of which side the leaf is on
    const effectiveTilt = tilt * side * (1 - Math.abs(rotation - 0.5) * 2);
    ctx.rotate(effectiveTilt);
    ctx.rotate(rotationAngle);

    // Gradient along the leaf direction
    const gradient = ctx.createLinearGradient(0, 0, side * (stemLength + length), 0);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, lighten(color, 0.1));
    ctx.fillStyle = gradient;

    // Draw the small petiole (leaf stem)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * stemLength, 0);
    ctx.strokeStyle = darken(color, 0.1);
    ctx.lineWidth = Math.max(1, width * 0.08);
    ctx.stroke();

    ctx.save();
    ctx.translate(side * stemLength, 0);
    // Ensure the blade extends outward on its assigned side even in broadside view
    // Mirror horizontally for left-side leaves so the silhouette points away from the stem
    ctx.scale(side, 1);

    const rotationFactor = Math.sin(Math.abs(rotationAngle));
    const adjustedWidth = width * (1 - rotationFactor * 0.9);

    // Subtle perspective skew
    const skewFactor = rotationFactor * 0.18 * Math.sign(rotation - 0.5);
    ctx.transform(1, 0, skewFactor, 1, 0, 0);
    // Normalize sign so positive tilt is upward regardless of side
    const verticalSkew = tilt * side * rotationFactor * 0.25;
    ctx.transform(1, verticalSkew, 0, 1, 0, 0);

    // Main lanceolate silhouette — start with slight upward lift, then droop (S-curve)
    // Make the arch clearly visible even on smaller leaves and add base upturn control
    const a = Math.max(0, Math.min(1, arch));
    const up = Math.max(0, Math.min(1, archUp ?? a * 0.45));
    const sagRaw = Math.pow(a, 0.7) * length * 0.55; // up to ~55% of length at full arch
    const sag = a > 0 ? Math.max(sagRaw, Math.min(length * 0.12, 3)) : 0; // at least ~3px on small leaves
    const upLift = up * length * 0.14; // upward lift near base

    // Helper: S-shaped vertical offset along blade centerline
    const archCurve = (t: number) => {
        // Ease from up at base to sag at tip; stronger downward bias after mid
        const ease = t * t * (3 - 2 * t); // smoothstep 0..1
        return -(1 - ease) * upLift + ease * sag;
    };

    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Upper edge to tip: begin slightly above stem, then descend
    ctx.bezierCurveTo(
        length * 0.18, -adjustedWidth * 0.45 - upLift * 0.6,
        length * 0.62, -adjustedWidth * 0.28 + archCurve(0.65) * 0.9,
        length, archCurve(1)
    );
    // Lower edge back to base: fuller belly, follows the S profile
    ctx.bezierCurveTo(
        length * 0.68, adjustedWidth * 0.34 + archCurve(0.7) * 1.0,
        length * 0.22, adjustedWidth * 0.48 + archCurve(0.3) * 0.5,
        0, 0
    );
    ctx.fill();

    // Central vein following the S-curve (cubic Bezier)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
        length * 0.15, -upLift * 0.95,
        length * 0.55, archCurve(0.7) * 0.95,
        length, archCurve(1)
    );
    ctx.strokeStyle = darken(color, 0.18);
    ctx.lineWidth = Math.max(0.5, width * 0.02);
    ctx.stroke();

    // A couple of faint lateral veins curving with the S profile
    ctx.beginPath();
    const yBase = archCurve(0.25);
    ctx.moveTo(length * 0.24, yBase);
    ctx.quadraticCurveTo(length * 0.34, -adjustedWidth * 0.25 + archCurve(0.45), length * 0.55, -adjustedWidth * 0.12 + archCurve(0.65));
    ctx.moveTo(length * 0.24, yBase);
    ctx.quadraticCurveTo(length * 0.34, adjustedWidth * 0.25 + archCurve(0.45), length * 0.55, adjustedWidth * 0.12 + archCurve(0.65));
    ctx.strokeStyle = darken(color, 0.12);
    ctx.lineWidth = Math.max(0.4, width * 0.015);
    ctx.stroke();

    // Subtle serration impression along the upper margin using a thin highlight; follow the S arch
    const rgb = color.startsWith('#') ? hexToRgb(color) : { r: 46, g: 139, b: 87 };
    ctx.beginPath();
    let steps = 8;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = t * length;
        const archOffset = archCurve(t);
        const y = -adjustedWidth * 0.02 - Math.sin(t * Math.PI * 6) * adjustedWidth * 0.06 + archOffset;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
    ctx.lineWidth = Math.max(0.4, width * 0.02);
    ctx.stroke();

    ctx.restore();
    ctx.restore();
}

/**
 * Draws a very thin thread-like leaf
 */
function drawThreadLeaf(
    ctx: CanvasRenderingContext2D,
    stemPosition: number,
    side: number,
    length: number,
    color: string,
    tilt: number = 0,
    rotation: number = 0
): void {
    // Save context for this leaf
    ctx.save();

    // Move to the position on the stem
    ctx.translate(0, -stemPosition);

    // Calculate the actual rotation angle based on the side and rotation parameter
    // When rotation is 0.5 (profile view), we want to see the leaf from the side
    const rotationAngle = side * Math.PI * (rotation - 0.5);

    // Apply tilt to the leaf stem - tilt is now applied in 3D space
    // When leaf is rotated to profile view, tilt should affect the apparent height
    // When leaf is facing forward, tilt should affect the apparent angle
    // Normalize sign so positive tilt is upward regardless of which side the leaf is on
    const effectiveTilt = tilt * side * (1 - Math.abs(rotation - 0.5) * 2);
    ctx.rotate(effectiveTilt);

    // Apply rotation around the stem
    ctx.rotate(rotationAngle);

    // Calculate rotation factor for 3D effect (0 when facing forward/back, 1 when in profile)
    const rotationFactor = Math.sin(Math.abs(rotationAngle));

    // Apply perspective skew based on rotation and tilt
    // This creates a more convincing 3D effect by skewing the leaf shape
    const skewFactor = rotationFactor * 0.1 * Math.sign(rotation - 0.5); // Less skew for thread leaves
    ctx.transform(1, 0, skewFactor, 1, 0, 0); // Apply horizontal skew

    // Apply vertical skew based on tilt when rotated
    // Normalize sign so positive tilt is upward regardless of side
    const verticalSkew = tilt * side * rotationFactor * 0.2; // Less vertical skew for thread leaves
    ctx.transform(1, verticalSkew, 0, 1, 0, 0);

    // Use a smooth transition between profile and front view
    const profileBlend = smoothStep(0.6, 0.8, rotationFactor);

    // Adjust the curve height based on rotation - smoother transition
    // When viewed from the side (rotation = 0.5), the curve should be minimal but not zero
    const maxCurveHeight = length * 0.3;
    const minCurveHeight = length * 0.05; // Minimum curve even in profile
    const curveHeight = maxCurveHeight * (1 - profileBlend) + minCurveHeight * profileBlend;

    // Adjust the apparent length based on rotation - smoother transition
    // When viewed from the side, the leaf appears shorter but not too short
    const maxLength = length;
    const minLength = length * 0.8; // Minimum length in profile
    const apparentLength = minLength + (maxLength - minLength) * (1 - profileBlend);

    // Adjust the thickness based on rotation
    // Thread leaves should appear thinner when viewed from the side
    const maxThickness = length * 0.05;
    const minThickness = length * 0.02; // Thinner in profile
    const adjustedThickness = maxThickness * (1 - profileBlend) + minThickness * profileBlend;

    // Draw the thread leaf
    ctx.beginPath();
    ctx.moveTo(0, 0);

    // For thread leaves, we'll use a more natural curve that changes with rotation
    // In profile view, the curve should be more S-shaped to suggest 3D
    if (profileBlend > 0.5) {
        // More S-shaped curve for profile view
        const controlPoint1X = side * apparentLength * 0.3;
        const controlPoint1Y = -curveHeight * 0.7;
        const controlPoint2X = side * apparentLength * 0.7;
        const controlPoint2Y = -curveHeight * 1.3;

        // Use bezier curve for more control over the S-shape
        ctx.bezierCurveTo(
            controlPoint1X, controlPoint1Y,
            controlPoint2X, controlPoint2Y,
            side * apparentLength, 0
        );
    } else {
        // Simple curved leaf for front view, gradually becoming more complex
        // Blend between quadratic and more complex curve
        const blendFactor = profileBlend / 0.5; // 0 to 1 as profileBlend goes from 0 to 0.5

        // Calculate control points that blend between simple and complex curves
        const midX = side * apparentLength * 0.5;
        const midY = -curveHeight;

        // Second control point for more complex curve
        const controlPoint2X = side * apparentLength * 0.7;
        const controlPoint2Y = -curveHeight * 0.8;

        if (blendFactor < 0.5) {
            // Closer to simple curve
            ctx.quadraticCurveTo(
                midX, midY,
                side * apparentLength, 0
            );
        } else {
            // Transition to more complex curve
            ctx.bezierCurveTo(
                midX * 0.8, midY * 1.1, // Adjust first control point
                controlPoint2X, controlPoint2Y,
                side * apparentLength, 0
            );
        }
    }

    // Apply color with slight transparency for more delicate appearance
    const alpha = 0.9 - profileBlend * 0.2; // Slightly more transparent in profile
    const rgbColor = color.startsWith('#') 
        ? hexToRgb(color) 
        : { r: 46, g: 139, b: 87 }; // Default to #2e8b57 if not hex

    ctx.strokeStyle = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${alpha})`;
    ctx.lineWidth = adjustedThickness;
    ctx.stroke();

    // Restore context
    ctx.restore();
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number, g: number, b: number } {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return { r, g, b };
}
