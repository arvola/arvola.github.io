import { colorFromSpec, ColorSpec } from "../color.ts";
import { SpecDrawingFunc } from "./base.ts";

export interface SkySpec {
    type: "sky";
    colors: ColorSpec[];
}
export const drawSky: SpecDrawingFunc<SkySpec> = (spec, ctx, c) => {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, 80);

    let offsetAdd = 1 / (spec.colors.length - 1);
    let offset = 0;
    let i = 0;
    for (let it of spec.colors) {
        ++i;
        if (i === spec.colors.length) {
            offset = 1;
        }
        skyGradient.addColorStop(offset, colorFromSpec(it, c));
        offset += offsetAdd;
    }

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, 2500, 220);
}