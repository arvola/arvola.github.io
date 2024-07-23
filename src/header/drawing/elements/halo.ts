import { colorFromSpec, GradienStop, widthColorStops } from "../color.ts";
import { LayerSpec, SpecDrawingFunc } from "./base.ts";

export interface HaloSpec extends LayerSpec {
    type: "halo";
    x: number;
    y: number;
    stops: GradienStop[];
    banded?: boolean;
}

export const drawHalo: SpecDrawingFunc<HaloSpec> = (spec, { ctx, c }) => {
    ctx.beginPath();
    let r0 = 0;
    let stops = [...spec.stops];
    if (!stops[0].color) {
        r0 = stops[0].width;
        stops.shift();
    }
    let radius = stops.reduce((acc, val) => acc + val.width, 0);
    const gradient = ctx.createRadialGradient(
        spec.x,
        spec.y,
        r0,
        spec.x,
        spec.y,
        radius + r0,
    );

    if (spec.banded) {
        let offset = 0;
        let i = 0;
        for (let it of stops) {
            ++i;
            if (i === 1 && !it.color) {
                offset += it.width / radius;
                continue;
            }
            const color = it.color ? colorFromSpec(it.color, c) : "#00000000";
            gradient.addColorStop(offset, color);
            offset += it.width / radius;
            if (i < stops.length) {
                // Add another stop right before the next color, which makes it bands
                // of color rather than a smooth gradient.
                gradient.addColorStop(offset - 0.001, color);
            } else {
                gradient.addColorStop(1, color);
            }
        }
    } else {
        widthColorStops(gradient, stops, c);
    }
    ctx.fillStyle = gradient;
    ctx.arc(spec.x, spec.y, radius, 0, 2 * Math.PI);

    ctx.fill();
    ctx.closePath();
};
