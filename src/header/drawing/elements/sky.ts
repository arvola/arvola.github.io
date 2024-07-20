import { addColorStops, colorFromSpec, ColorSpec } from "../color.ts";
import { SpecDrawingFunc } from "./base.ts";

export interface SkySpec {
    type: "sky";
    colors: ColorSpec[];
    height?: number;
}
export const drawSky: SpecDrawingFunc<SkySpec> = (spec, {ctx, c, height}) => {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, spec.height || (height / 2));

    addColorStops(skyGradient, spec.colors, c);

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 2500, 220);
}