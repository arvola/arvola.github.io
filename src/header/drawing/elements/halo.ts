import { ColorMap, ColorSpec } from "../color.ts";
import { LayerSpec, SpecDrawingFunc } from "./base.ts";

export interface HaloSpecStop {
    width: number;
    color?: ColorSpec;
}

export interface HaloSpec extends LayerSpec {
    type: "halo";
    x: number;
    y: number;
    stops: HaloSpecStop[];
}

export const drawHalo: SpecDrawingFunc<HaloSpec> = (spec, ctx, c)  => {

}