import {LayerSpec, SpecDrawingFunc} from "./base.ts";
import { noise } from "../../graphics.ts";
import {addColorStops, ColorSpec} from "../color.ts";

export interface RainSpec extends LayerSpec {
    type: "rain";
    colors: ColorSpec[];
    tilt?: number;
}

export const drawRain: SpecDrawingFunc<RainSpec> = async (
    spec,
    { ctx, c, width, height },
) => {

    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        10,
    );
    addColorStops(gradient, spec.colors, c);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 0.5;
    const tilt = Math.PI / 2 * ( 1 - ((spec.tilt || 0) /90));
    const dX = Math.floor(Math.cos(tilt) * 10)
    const dY = Math.floor(Math.sin(tilt) * 10)

    for (let x = 1; x < width; ) {
        for (let y = 1; y < height - 20; ) {
            // Combining two layers of noise makes the stars look more realistic
            let val = (noise(x * 4, y * 3));
            let val2 = noise(x, y);

            // Adding a high and low filter turns the continuous noise into individual dots,
            // and then the values are normalized to a continuous alpha spread
            if (val > 0.91 || val < -0.91) {

                    ctx.translate(x, y);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                if (val > 0.9) {
                    ctx.globalAlpha = (val - 0.84) * 5;
                    ctx.lineTo(val2 * 2 + dX,  dY);
                } else {

                    val = Math.abs(val);
                    ctx.globalAlpha = 0.4 * val;
                    ctx.lineTo((val2 * 2 + dX) / 2,  dY/2);
                }
                    ctx.stroke();
                    ctx.closePath();
                    ctx.translate(-x, -y);
            }

            y += 1;
        }
        x += 1;
    }
};
