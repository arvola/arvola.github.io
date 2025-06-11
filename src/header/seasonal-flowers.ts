import { AnySpec } from "./drawing/elements";
import { generateFlowers } from "./drawing/elements/flowers.ts";

export interface FlowerPositionSpec {
        x: number;      // 0-1 representing percentage across canvas width
        y: number;      // Ground level position (typically around 180-200)
        size: number;   // Size of the flower
        type: string;   // Type of flower (required)
        cluster?: Array<{
            offsetX: number;  // X offset from the main position
            offsetY: number;  // Y offset from the main position
            type?: string;
            sizeRatio?: number;// Size as a ratio of the main flower's size (0.8-1.2 typical)
            rotation?: number;// Optional specific rotation in radians
        }>;
    }

// Monthly flower specifications with colors and positions
export interface FlowerSpec {
    colors: string[];
    positions: Array<FlowerPositionSpec>;
    // Deprecated - no longer used as all flowers must be in positions array
    count?: number;
    flowerTypes?: string[];
}

// Define flower specs for each month (0-11, January is 0)
export const monthlyFlowers: Record<number, FlowerSpec> = {
    // Winter (December - February)
    0: { // January
        colors: ["#FFFFFF", "#ADD8E6", "#6B8E23"],
        positions: [
            { x: 0.1, y: 180, size: 6, type: "snowdrop" },
            { x: 0.3, y: 182, size: 8, type: "snowdrop" },
            { x: 0.6, y: 185, size: 7, type: "snowdrop" },
            { x: 0.8, y: 183, size: 6, type: "snowdrop" }
        ]
    },
    1: { // February
        colors: ["#FFFFFF", "#E0FFFF", "#7CFC00"],
        positions: [
            { x: 0.05, y: 180, size: 7, type: "snowdrop" },
            { x: 0.25, y: 182, size: 9, type: "snowdrop" },
            { x: 0.45, y: 184, size: 8, type: "snowdrop" },
            { x: 0.7, y: 183, size: 9, type: "snowdrop" },
            { x: 0.9, y: 181, size: 7, type: "snowdrop" }
        ]
    },

    // Spring (March - May)
    2: { // March - Early spring
        colors: ["#FFEB3B", "#FFFFFF", "#8BC34A"],
        positions: [
            { x: 0.05, y: 180, size: 8, type: "tulip" },
            { x: 0.15, y: 182, size: 7, type: "daisy" },
            { x: 0.25, y: 183, size: 9, type: "tulip" },
            { x: 0.4, y: 180, size: 10, type: "daisy" },
            { x: 0.55, y: 182, size: 8, type: "tulip" },
            { x: 0.7, y: 184, size: 9, type: "daisy" },
            { x: 0.85, y: 183, size: 7, type: "tulip" },
            { x: 0.95, y: 181, size: 8, type: "daisy" }
        ]
    },
    3: { // April - Mid spring
        colors: ["#FF97BB", "#FFFF00", "#FF5733"],
        positions: [
            { x: 0.03, y: 180, size: 9, type: "tulip" },
            { x: 0.12, y: 183, size: 8, type: "daisy" },
            { x: 0.2, y: 182, size: 10, type: "tulip" },
            { x: 0.27, y: 180, size: 9, type: "daisy" },
            { x: 0.35, y: 183, size: 11, type: "tulip" },
            { x: 0.45, y: 181, size: 8, type: "daisy" },
            { x: 0.55, y: 184, size: 10, type: "tulip" },
            { x: 0.65, y: 182, size: 9, type: "daisy" },
            { x: 0.75, y: 180, size: 8, type: "tulip" },
            { x: 0.83, y: 183, size: 11, type: "daisy" },
            { x: 0.92, y: 181, size: 9, type: "tulip" },
            { x: 0.98, y: 182, size: 10, type: "daisy" }
        ]
    },
    4: { // May - Late spring
        colors: ["#E91E63", "#FFEB3B", "#4CAF50"],
        positions: [
            { 
                x: 0.02, y: 180, size: 10, type: "rose",
                cluster: [
                    { offsetX: -5, offsetY: 3 },
                    { offsetX: 5, offsetY: 2 },
                    { offsetX: 2, offsetY: -3 }
                ]
            },
            { x: 0.08, y: 183, size: 8, type: "tulip" },
            { x: 0.15, y: 181, size: 9, type: "daisy" },
            { 
                x: 0.22, y: 182, size: 11, type: "rose",
                cluster: [
                    { offsetX: -6, offsetY: 4, type: "daisy" },
                    { offsetX: 7, offsetY: 3 },
                    { offsetX: 3, offsetY: -4, sizeRatio: 0.9 }
                ]
            },
            { x: 0.29, y: 180, size: 9, type: "tulip" },
            { x: 0.35, y: 183, size: 10, type: "daisy" },
            { 
                x: 0.42, y: 181, size: 12, type: "rose",
                cluster: [
                    { offsetX: -8, offsetY: 5 },
                    { offsetX: 8, offsetY: 4 },
                    { offsetX: 4, offsetY: -5 },
                    { offsetX: -5, offsetY: -3, type: "tulip" }
                ]
            },
            { x: 0.5, y: 182, size: 9, type: "tulip" },
            { x: 0.58, y: 180, size: 8, type: "daisy" },
            { 
                x: 0.65, y: 183, size: 11, type: "rose",
                cluster: [
                    { offsetX: -7, offsetY: 5 },
                    { offsetX: 7, offsetY: 3 }
                ]
            },
            { x: 0.72, y: 181, size: 10, type: "tulip" },
            { x: 0.79, y: 182, size: 9, type: "daisy" },
            { 
                x: 0.86, y: 180, size: 12, type: "rose",
                cluster: [
                    { offsetX: -6, offsetY: 4 },
                    { offsetX: 8, offsetY: 3, type: "daisy" },
                    { offsetX: 3, offsetY: -4 }
                ]
            },
            { x: 0.93, y: 183, size: 8, type: "tulip" },
            { x: 0.98, y: 181, size: 9, type: "daisy" }
        ]
    },

    // Summer (June - August)
    5: { // June - Early summer
        colors: ["#FF5733", "#FFFF00", "#E91E63"],
        positions: [
            { 
                x: 0.05, y: 180, size: 12, type: "sunflower",
                cluster: [
                    { offsetX: -10, offsetY: 6 },
                    { offsetX: 10, offsetY: 4}
                ]
            },
            { x: 0.15, y: 183, size: 8, type: "daisy" },
            { 
                x: 0.25, y: 181, size: 10, type: "rose",
                cluster: [
                    { offsetX: -8, offsetY: 5 },
                    { offsetX: 7, offsetY: 3 },
                    { offsetX: 3, offsetY: -5}
                ]
            },
            { 
                x: 0.35, y: 182, size: 13, type: "sunflower",
                cluster: [
                    { offsetX: -11, offsetY: 7 },
                    { offsetX: 11, offsetY: 5 },
                    { offsetX: 5, offsetY: -6 }
                ]
            },
            { x: 0.45, y: 180, size: 9, type: "daisy" },
            { 
                x: 0.55, y: 183, size: 11, type: "rose",
                cluster: [
                    { offsetX: -9, offsetY: 6 },
                    { offsetX: 8, offsetY: 4 }
                ]
            },
            { 
                x: 0.65, y: 181, size: 14, type: "sunflower",
                cluster: [
                    { offsetX: -12, offsetY: 7},
                    { offsetX: 12, offsetY: 6 },
                    { offsetX: 5, offsetY: -8 }
                ]
            },
            { x: 0.75, y: 182, size: 8, type: "daisy" },
            { 
                x: 0.85, y: 180, size: 10, type: "rose",
                cluster: [
                    { offsetX: -8, offsetY: 5 },
                    { offsetX: 9, offsetY: 4 }
                ]
            },
            { 
                x: 0.95, y: 183, size: 12, type: "sunflower",
                cluster: [
                    { offsetX: -10, offsetY: 6 },
                    { offsetX: 11, offsetY: 5}
                ]
            }
        ]
    },
    6: { // July - Mid summer
        colors: ["#FF9800", "#FFEB3B", "#F44336"],
        positions: [
            { x: 0.08, y: 180, size: 14, type: "sunflower" },
            { x: 0.2, y: 182, size: 9, type: "daisy" },
            { x: 0.33, y: 181, size: 11, type: "rose" },
            { x: 0.47, y: 180, size: 15, type: "sunflower" },
            { x: 0.6, y: 183, size: 8, type: "daisy" },
            { x: 0.73, y: 182, size: 12, type: "rose" },
            { x: 0.88, y: 181, size: 13, type: "sunflower" },
            { x: 0.97, y: 180, size: 9, type: "daisy" }
        ]
    },
    7: { // August - Late summer
        colors: ["#FF9800", "#FFC107", "#FF5722"],
        positions: [
            { x: 0.07, y: 180, size: 15, type: "sunflower" },
            { x: 0.22, y: 182, size: 8, type: "daisy" },
            { x: 0.38, y: 181, size: 10, type: "rose" },
            { x: 0.54, y: 183, size: 14, type: "sunflower" },
            { x: 0.67, y: 180, size: 9, type: "daisy" },
            { x: 0.82, y: 182, size: 11, type: "rose" },
            { x: 0.94, y: 181, size: 13, type: "sunflower" }
        ]
    },

    // Autumn (September - November)
    8: { // September - Early autumn
        colors: ["#FFA500", "#FF4500", "#8B4513"],
        positions: [
            { x: 0.1, y: 180, size: 13, type: "sunflower" },
            { x: 0.28, y: 182, size: 14, type: "sunflower" },
            { x: 0.45, y: 181, size: 12, type: "sunflower" },
            { x: 0.65, y: 183, size: 15, type: "sunflower" },
            { x: 0.8, y: 182, size: 13, type: "sunflower" },
            { x: 0.92, y: 180, size: 14, type: "sunflower" }
        ]
    },
    9: { // October - Mid autumn
        colors: ["#A0522D", "#8B4513", "#B22222"],
        positions: [
            { x: 0.15, y: 180, size: 14, type: "sunflower" },
            { x: 0.35, y: 182, size: 13, type: "sunflower" },
            { x: 0.55, y: 181, size: 15, type: "sunflower" },
            { x: 0.75, y: 183, size: 12, type: "sunflower" },
            { x: 0.9, y: 182, size: 14, type: "sunflower" }
        ]
    },
    10: { // November - Late autumn
        colors: ["#8B4513", "#A52A2A", "#800000"],
        positions: [
            { x: 0.25, y: 180, size: 12, type: "sunflower" },
            { x: 0.5, y: 182, size: 14, type: "sunflower" },
            { x: 0.75, y: 181, size: 13, type: "sunflower" }
        ]
    },

    // Winter (December)
    11: { // December
        colors: ["#FFFFFF", "#B0C4DE", "#6B8E23"],
        positions: [
            { x: 0.2, y: 180, size: 6, type: "snowdrop" },
            { x: 0.4, y: 182, size: 7, type: "snowdrop" },
            { x: 0.6, y: 181, size: 6, type: "snowdrop" },
            { x: 0.8, y: 183, size: 7, type: "snowdrop" }
        ]
    }
};

/**
 * Get the flower specification for the current month
 * @returns The flower specification for the current month
 */
function getCurrentMonthFlowerSpec(): FlowerSpec {
    const month = new Date().getMonth();
    return monthlyFlowers[month] || monthlyFlowers[0]; // Default to January if not found
}

/**
 * Generate a flower spec for the current month
 * @param width The canvas width
 * @returns A flower spec ready to be added to a scene
 */
export function getMonthlyFlowerSpec(width: number): AnySpec {
    const spec = getCurrentMonthFlowerSpec();

    return {
        type: "flowers",
        flowers: generateFlowers(
            width,
            spec.count || 0,
            spec.flowerTypes as any,
            spec.positions
        ),
        colors: spec.colors
    };
}

/**
 * Merge the current month's flower spec into a scene spec
 * Only adds flowers to non-rainy scenes
 * @param specs The original scene specs
 * @param weather The current weather condition
 * @param width The canvas width
 * @returns The merged specs with flowers added if appropriate
 */
export function mergeFlowersIntoScene(specs: AnySpec[], weather: string, width: number): AnySpec[] {
    // Don't add flowers during rain
    if (weather === "rain") {
        return specs;
    }

    return [...specs, getMonthlyFlowerSpec(width)];
}