import { ColorMap, ColorSpec } from "../color.ts";
import { SpecDrawingFunc } from "./base.ts";

export interface GroundSpec {
    type: "ground";
    colors: ColorSpec[];
}


export const drawGround: SpecDrawingFunc<GroundSpec> = (spec, ctx, c) => {

}