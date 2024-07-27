import { positionAdjust, redrawSprites } from "./kitty.ts";
import { Drawing } from "./canvases.ts";
import { AnySpec, drawWithSpec } from "./elements";
import { ColorMap } from "./color.ts";

export async function drawSpec(drawing: Drawing, c: ColorMap, spec: AnySpec[]) {
    const { ctx, canvas, width, height } = drawing;

    // If the kitty has not been positioned yet, do that now
    if (positionAdjust.offsetX === 1) {
        const bounds = canvas.base.getBoundingClientRect();
        positionAdjust.offsetX = bounds.left + 40 + window.scrollX;
        positionAdjust.offsetY = bounds.top + 69 + window.scrollY;
        redrawSprites();
    }

    ctx.overlay.clearRect(0, 0, width, height);
    ctx.base.save();
    ctx.overlay.save();

    for (let it of spec) {
        let context = ctx.base;
        context.save();
        if ("layer" in it) {
            switch (it.layer) {
                case "overlay":
                    context = ctx.overlay;
                    break;
            }
        }

        await drawWithSpec(it, { ctx: context, c, width, height });
        context.restore();
    }
}
