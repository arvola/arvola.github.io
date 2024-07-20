import { colorFromSpec, ColorMap, ColorSpec } from "../color.ts";
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

export const drawHalo: SpecDrawingFunc<HaloSpec> = (spec, {ctx, c})  => {
    ctx.beginPath();
    const radius = spec.stops.reduce((acc, val) => acc + val.width, 0);
    const gradient = ctx.createRadialGradient(spec.x, spec.y, 0, spec.x, spec.y, radius);

    let offset = 0;
    let i = 0;
    for (let it of spec.stops) {
        ++i;
        const color = it.color ? colorFromSpec(it.color, c) : "#00000000";
        if (i === spec.stops.length) {
            offset = 1;
        }
        gradient.addColorStop(offset, color);
        offset += it.width / radius;
        if (i < spec.stops.length) {
            // Add another stop right before the next color, which makes it bands
            // of color rather than a smooth gradient.
            gradient.addColorStop(offset - 0.0001, color)
        }
    }
    ctx.fillStyle = gradient;
    ctx.arc(350, 20, 500, 0, 2 * Math.PI);

    ctx.fill();
    ctx.closePath();
}