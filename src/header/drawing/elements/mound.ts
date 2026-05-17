import { SpecDrawingFunc } from "./base.ts";
import { applyPalette, ColorPalette } from "../color.ts";

export interface MoundSpec {
    type: "mound";
    x: number;
    y: number;
    width: number;
    height: number;
    /** Draw full ellipse (default), or just the bottom half for layering on top of stems. */
    half?: "bottom";
    /** Optional rotation (radians) to follow the slope of the ground. */
    tilt?: number;
    palette?: ColorPalette;
}

const moundLight = "#b07848";
const moundMid = "#8c5c30";
const moundDark = "#6a4320";

export const drawMound: SpecDrawingFunc<MoundSpec> = (spec, { ctx }) => {
    const p = spec.palette;
    const cLight = applyPalette(moundLight, p);
    const cMid = applyPalette(moundMid, p);
    const cDark = applyPalette(moundDark, p);

    ctx.save();
    ctx.translate(spec.x, spec.y);
    if (spec.tilt) ctx.rotate(spec.tilt);

    const w = spec.width;
    const h = spec.height;

    const grad = ctx.createLinearGradient(0, -h, 0, h);
    grad.addColorStop(0, cLight);
    grad.addColorStop(0.5, cMid);
    grad.addColorStop(1, cDark);
    ctx.fillStyle = grad;
    ctx.beginPath();
    if (spec.half === "bottom") {
        // Bottom half only: arc from 0 → PI going clockwise through the bottom
        ctx.ellipse(0, 0, w, h, 0, 0, Math.PI);
        ctx.closePath();
    } else {
        ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.restore();
};
