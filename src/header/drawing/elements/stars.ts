import { SpecDrawingFunc } from "./base.ts";
import { noise } from "../../graphics.ts";
import {colorFromSpec, ColorSpec} from "../color.ts";

export interface StarsSpec {
    type: "stars";
    color: ColorSpec;
}

export const drawStars: SpecDrawingFunc<StarsSpec> = async (
    spec,
    { ctx, c, width, height },
) => {
    ctx.fillStyle = colorFromSpec(spec.color, c);
    for (let x = 1; x < width; ) {
        for (let y = 1; y < height; ) {
            // Combining two layers of noise makes the stars look more realistic
            let val = (noise(x * 4, y * 3) + noise(x, y)) / 2;

            // Adding a high and low filter turns the continuous noise into individual dots,
            // and then the values are normalized to a continuous alpha spread
            if (val > 0.8 || val < -0.6) {
                if (val > 0.8) {
                    ctx.globalAlpha = (val - 0.8) * 5;
                    ctx.fillRect(x, y, 1, 1);
                } else {
                    val = Math.abs(val);
                    ctx.globalAlpha = 0.2 * val;
                    ctx.fillRect(x, y, 1, 1);
                }
            }

            y += 1;
        }
        x += 1;
    }
};
