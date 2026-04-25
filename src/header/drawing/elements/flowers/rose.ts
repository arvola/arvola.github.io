import { lighten, darken } from "../../color.ts";
import { FlowerData } from "./spec.ts";
import { getNoiseBasedColorVariation } from "./utils";
import { noise } from "../../../graphics.ts";
import { LeafParams } from "./leaves.ts";
import { drawLeaves } from "./leaves.ts";

// Define rose colors
const ROSE_COLORS = {
    petals: "#e91e63",
    leaves: "#2e8b57",
    center: "#880e4f"
};

/**
 * Draw rose-specific leaves
 * Roses typically have cordate (heart-shaped) or ovate leaves
 */
function drawRoseLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Use noise based on flower position to add variety
    const noiseValue = (1 + noise(flower.x * 0.01, flower.y * 0.01)) / 2;

    // Create leaf parameters based on noise
    const leafParams: LeafParams[] = [];

    // Decide leaf type based on noise
    const useCordate = noiseValue > 0.5;

    if (useCordate) {
        // Cordate (heart-shaped) leaves
        leafParams.push(
            { 
                shape: "cordate", 
                width: size * (0.4 + noiseValue * 0.1), 
                length: size * (0.5 + noiseValue * 0.1),
                serrated: true
            },
            { 
                shape: "cordate", 
                width: size * (0.3 + noiseValue * 0.1), 
                length: size * (0.4 + noiseValue * 0.1),
                serrated: true
            }
        );

        // Add a third leaf for larger roses
        if (size > 10) {
            leafParams.push({ 
                shape: "cordate", 
                width: size * (0.25 + noiseValue * 0.1), 
                length: size * (0.35 + noiseValue * 0.1),
                serrated: true
            });
        }
    } else {
        // Ovate leaves
        leafParams.push(
            { 
                shape: "ovate", 
                width: size * (0.4 + noiseValue * 0.1), 
                length: size * (0.7 + noiseValue * 0.1),
                stemLength: size * (0.15 + noiseValue * 0.05),
                serrated: true
            },
            { 
                shape: "ovate", 
                width: size * (0.3 + noiseValue * 0.1), 
                length: size * (0.6 + noiseValue * 0.1),
                stemLength: size * (0.1 + noiseValue * 0.05),
                serrated: true
            }
        );

        // Add a third leaf for larger roses
        if (size > 10) {
            leafParams.push({ 
                shape: "ovate", 
                width: size * (0.25 + noiseValue * 0.1), 
                length: size * (0.5 + noiseValue * 0.1),
                stemLength: size * 0.1,
                serrated: true
            });
        }
    }

    // Draw the leaves
    drawLeaves(ctx, size, stemHeight, flower, leafParams);
}

// Helper to draw a single stylized rose petal
function drawPetal(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    size: number,
    color: string,
    variant: "outer" | "inner" | "core" = "outer"
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Create gradient for each petal
    const gradient = ctx.createRadialGradient(
        0, size * 0.2, 0,
        0, 0, size
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, lighten(color, 0.15));
    
    ctx.fillStyle = gradient;
    
    // Draw a stylized petal shape (not just an ellipse)
    ctx.beginPath();
    
    const w = size;     // width scale
    const h = size;     // height scale
    
    // Start at base (stem connection)
    ctx.moveTo(0, 0);
    
    if (variant === "core") {
        // Core petals are tighter and asymmetric to create a spiral
        // Curve out to the left and up
        ctx.bezierCurveTo(
            -w * 0.5, -h * 0.2,
            -w * 0.5, -h * 0.9,
            0, -h * 1.0
        );
        // Curve down to the right and tuck in
        ctx.bezierCurveTo(
            w * 0.6, -h * 0.9,
            w * 0.5, -h * 0.2,
            0, 0
        );
    } else {
        // Outer petals are wider and have a slight fold/dip
        // Left side curve
        ctx.bezierCurveTo(
            -w * 0.5, -h * 0.1,  // CP1
            -w * 0.6, -h * 0.6,  // CP2
            -w * 0.2, -h * 0.9   // Top left
        );
        
        // Top edge (slight dip/point in middle)
        ctx.quadraticCurveTo(
            0, -h * 0.95,        // Control point slightly higher
            w * 0.2, -h * 0.9    // Top right
        );
        
        // Right side curve
        ctx.bezierCurveTo(
            w * 0.6, -h * 0.6,   // CP1
            w * 0.5, -h * 0.1,   // CP2
            0, 0                 // Back to base
        );
    }
    
    ctx.fill();
    
    // Add definition with a strong stroke for the stylized look
    ctx.strokeStyle = darken(color, 0.4);
    ctx.lineWidth = size * 0.03; // Proportional line width
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    
    // Optional: Add a central fold line or detail for outer petals
    if (variant === "outer") {
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.1);
        ctx.quadraticCurveTo(0, -h * 0.4, 0, -h * 0.5);
        ctx.strokeStyle = darken(color, 0.2);
        ctx.lineWidth = size * 0.01;
        ctx.stroke();
    }
    
    ctx.restore();
}

export function drawRose(
    ctx: CanvasRenderingContext2D,
    size: number,
    flower: FlowerData
) {
    // Get color variations based on flower position
    const { color: petalColor } = getNoiseBasedColorVariation(
        ROSE_COLORS.petals, 
        flower, 
        0.2, 
        1 
    );

    // Create darker colors for depth
    const innerPetalColor = darken(petalColor, 0.2);
    const coreColor = darken(innerPetalColor, 0.2);
    
    // Draw center background to hide stem/gap
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = coreColor;
    ctx.fill();
    ctx.restore();

    // Draw outer petals first (bottom layer)
    const outerCount = 7;
    for (let i = 0; i < outerCount; i++) {
        const angle = (i / outerCount) * Math.PI * 2;
        // Vary distance slightly
        const dist = size * 0.3; 
        const petalSize = size * 0.8;
        
        drawPetal(
            ctx, 
            Math.cos(angle) * dist, 
            Math.sin(angle) * dist, 
            angle + Math.PI / 2, // Rotate to face outward
            petalSize, 
            petalColor, 
            "outer"
        );
    }
    
    // Draw inner petals (middle layer)
    const innerCount = 5;
    for (let i = 0; i < innerCount; i++) {
        const angle = (i / innerCount) * Math.PI * 2 + Math.PI / innerCount; // Offset angle
        const dist = size * 0.15;
        const petalSize = size * 0.6;
        
        drawPetal(
            ctx, 
            Math.cos(angle) * dist, 
            Math.sin(angle) * dist, 
            angle + Math.PI / 2,
            petalSize, 
            innerPetalColor, 
            "inner"
        );
    }
    
    // Draw core petals (center spiral)
    const coreCount = 3;
    for (let i = 0; i < coreCount; i++) {
        const angle = (i / coreCount) * Math.PI * 2;
        const dist = size * 0.05;
        const petalSize = size * 0.4;
        
        drawPetal(
            ctx, 
            Math.cos(angle) * dist, 
            Math.sin(angle) * dist, 
            angle + Math.PI * 0.6, // Rotate to form spiral
            petalSize, 
            coreColor, 
            "core"
        );
    }
}

// Export the leaf drawing function for roses
export function drawRoseWithLeaves(
    ctx: CanvasRenderingContext2D,
    size: number,
    stemHeight: number,
    flower: FlowerData
) {
    // Draw the leaves
    drawRoseLeaves(ctx, size, stemHeight, flower);
}
