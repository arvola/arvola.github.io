import { LayerSpec } from "../base.ts";
import { ColorSpec } from "../../color.ts";
import { LeafParams } from "./leaves.ts";

export type FlowerType = "daisy" | "tulip" | "sunflower" | "rose" | "snowdrop" | "coneflower";


export interface FlowersSpec extends LayerSpec {
    type: "flowers";
    flowers: FlowerData[];
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
    /**
     * Horizontal position as a fraction 0..1 across the canvas width.
     */
    x: number;
    /**
     * Ground level Y position in canvas units (typically around 180–200).
     */
    y: number;
    /**
     * Base size of the flower.
     */
    size: number;
    /**
     * Type of flower.
     */
    type: FlowerType;
    /**
     * Optional cluster of additional flowers placed relative to this position.
     */
    cluster?: Array<{
        /** X offset from the main position, in canvas units. */
        offsetX: number;
        /** Y offset from the main position, in canvas units. */
        offsetY: number;
        /** Size as a ratio of the main flower's size (typical range 0.8–1.2). */
        sizeRatio?: number;
        /** Optional specific flower type (defaults to the main flower type). */
        type?: FlowerType;
    }>;
}
export interface FlowerPositionSpec {
    /**
     * Horizontal position as a fraction 0..1 across the canvas width.
     */
    x: number;
    /**
     * Ground level Y position in canvas units (typically around 180–200).
     */
    y: number;
    /**
     * Size of the flower (base size units for rendering).
     */
    size: number;
    /**
     * Type of flower (required).
     */
    type: FlowerType;
    /**
     * Optional cluster of additional flowers placed relative to this position.
     */
    cluster?: Array<{
        /** X offset from the main position, in canvas units. */
        offsetX: number;
        /** Y offset from the main position, in canvas units. */
        offsetY: number;
        /** Optional specific flower type for this cluster item. */
        type?: FlowerType;
        /** Size as a ratio of the main flower's size (typical range 0.8–1.2). */
        sizeRatio?: number;
        /** Optional specific rotation in radians. */
        rotation?: number;
    }>;
}

// Monthly flower specifications with positions
export interface FlowerSpec {
    /**
     * List of flower positions for this period.
     */
    positions: Array<FlowerPositionSpec>;
    /**
     * @deprecated No longer used; all flowers must be specified in `positions`.
     */
    count?: number;
    /**
     * @deprecated No longer used; specify types per position in `positions`.
     */
    flowerTypes?: string[];
}
