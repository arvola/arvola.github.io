import { ColorMap } from "../color.ts";
import { SpecDrawingFunc } from "./base.ts";

export interface SunSpec {
    type: "sun";
    x: number;
    y: number;
    radius: number;
}
export const drawSun: SpecDrawingFunc<SunSpec> = (spec, ctx, c) => {


}