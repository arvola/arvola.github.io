import { positionAdjust, redrawSprites } from "./kitty.ts";
import { initCanvases } from "./canvases.ts";
import { AnySpec, drawWithSpec } from "./elements";

export function drawSpec(
    base: HTMLCanvasElement,
    ground: HTMLCanvasElement,
    overlay: HTMLCanvasElement,
    spec: AnySpec[]) {
    const drawing = initCanvases({ base, ground, overlay });
    const { ctx, canvas, c } = drawing;

    // If the kitty has not been positioned yet, do that now
    if (positionAdjust.offsetX === 1) {
        const bounds = canvas.base.getBoundingClientRect();
        positionAdjust.offsetX = bounds.left + 40 + window.scrollX;
        positionAdjust.offsetY = bounds.top + 69 + window.scrollY;
        redrawSprites();
    }

    ctx.base.save();
    ctx.overlay.save();

    for (let it of spec) {
        let context = ctx.base;
        if ("layer" in it) {
            switch (it.layer) {
                case "overlay":
                    context = ctx.overlay;
                    break;
            }
        }

        drawWithSpec(it, context, c);
        context.restore();
    }
}