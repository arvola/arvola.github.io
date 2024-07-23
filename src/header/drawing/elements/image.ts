import { SpecDrawingFunc } from "./base.ts";
import { img } from "../../../img.ts";

export interface ImageSpec {
    type: "image";
    alpha?: number;
    op?: GlobalCompositeOperation;
    image: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export const drawImage: SpecDrawingFunc<ImageSpec> = async (
    spec,
    { ctx},
) => {
    return new Promise((resolve) => {
        img(spec.image, null, (im) => {
            if (spec.alpha) {
                ctx.globalAlpha = spec.alpha;
            }
            if (spec.op) {
                ctx.globalCompositeOperation = spec.op;
            }

            // First draw the milkyway on to the sky gradient
            ctx.drawImage(im, spec.x, spec.y, spec.width, spec.height);
            resolve();
        });
    });
};
