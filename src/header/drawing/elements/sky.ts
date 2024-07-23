import { GradienStop, widthColorStops } from "../color.ts";
import { SpecDrawingFunc } from "./base.ts";

export interface SkySpec {
    type: "sky";
    stops: GradienStop[];
    height?: number;
}

export const drawSky: SpecDrawingFunc<SkySpec> = (
    spec,
    { ctx, c, width, height },
) => {
    const skyGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        height * (spec.height || 1),
    );

    widthColorStops(skyGradient, spec.stops, c);

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
};
