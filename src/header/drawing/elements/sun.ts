import { colorFromSpec, ColorMap, ColorSpec } from "../color.ts";
import { SpecDrawingFunc } from "./base.ts";

export interface SunSpec {
    type: "sun";
    x: number;
    y: number;
    radius: number;
    fill: ColorSpec;
    stroke?: ColorSpec;
}
export const drawSun: SpecDrawingFunc<SunSpec> = (spec, {ctx, c}) => {
    ctx.beginPath();
    ctx.fillStyle = colorFromSpec(spec.fill, c);
    if (spec.stroke) {
        ctx.strokeStyle = colorFromSpec(spec.stroke, c);
    }
    ctx.arc(spec.x, spec.y, spec.radius, 0, 2 * Math.PI);
    ctx.fill();
}