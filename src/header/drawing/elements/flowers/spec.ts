import { LayerSpec } from "../base.ts";
import { ColorSpec } from "../../color.ts";

export type FlowerType = "daisy" | "tulip" | "sunflower" | "rose" | "snowdrop";


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