import { DrawingProps } from "../canvases.ts";

export interface LayerSpec {
    layer?: "overlay";
}


export type SpecDrawingFunc<Spec> = (spec: Spec,  props: DrawingProps) => void | Promise<void>;
