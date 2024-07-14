import { ColorMap } from "../color.ts";

export interface LayerSpec {
    layer?: "overlay";
}

export type SpecDrawingFunc<Spec> = (spec: Spec,  ctx: CanvasRenderingContext2D, c: ColorMap) => void;
