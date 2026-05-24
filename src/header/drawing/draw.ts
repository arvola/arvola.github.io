import { positionAdjust, redrawSprites } from "./kitty.ts";
import { Drawing } from "./canvases.ts";
import { AnySpec, drawWithSpec } from "./elements";
import { ColorMap } from "./color.ts";
import { makeProjectedShadowCanvas } from "./shadow.ts";

// Specs that should cast a ground shadow when there's a sun in the scene.
const SHADOW_CASTING_TYPES = new Set(["flower"]);

function findSun(spec: AnySpec[]): { x: number; y: number } | null {
    for (const it of spec) {
        if (it.type === "sun") return { x: it.x, y: it.y };
    }
    return null;
}

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

    const sun = findSun(spec);

    let shadows = spec.filter((it) => SHADOW_CASTING_TYPES.has(it.type));

    for (let it of spec) {
        // draw all shadows together behind the first spec with shadows
        if (sun && it === shadows[0]) {
            await drawShadowedBatch(drawing, c, shadows, sun);
            continue;
        }

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

async function drawShadowedBatch(
    drawing: Drawing,
    c: ColorMap,
    batch: AnySpec[],
    sun: { x: number; y: number },
) {
    const { ctx, width, height } = drawing;

    // Render the batch of elements into an offscreen canvas that shares the base
    // canvas's coordinate space, so positions inside specs line up.
    // Full render of the batch (flowers + mounds) — this is what we'll
    // composite on top of the shadow.
    const off = document.createElement("canvas");
    off.width = ctx.base.canvas.width;
    off.height = ctx.base.canvas.height;
    const offCtx = off.getContext("2d")!;
    offCtx.scale(devicePixelRatio, devicePixelRatio);

    // Accumulated shadow canvas for the entire batch.
    // We draw all shadows here as solid silhouettes first to avoid overlap artifacts.
    const allShadows = document.createElement("canvas");
    allShadows.width = ctx.base.canvas.width;
    allShadows.height = ctx.base.canvas.height;
    const allShadowsCtx = allShadows.getContext("2d")!;

    // We draw each individual flower onto `off`
    for (const it of batch) {
        offCtx.save();
        await drawWithSpec(it, { ctx: offCtx, c, width, height });
        offCtx.restore();
    }

    // Now, for each spec in the batch, we project its shadow individually
    // and draw it onto the accumulated shadow canvas.
    for (const it of batch) {
        // Shadow source for this specific spec
        const shadowSrc = document.createElement("canvas");
        shadowSrc.width = ctx.base.canvas.width;
        shadowSrc.height = ctx.base.canvas.height;
        const shadowSrcCtx = shadowSrc.getContext("2d")!;
        shadowSrcCtx.scale(devicePixelRatio, devicePixelRatio);

        shadowSrcCtx.save();
        await drawWithSpec(it, { ctx: shadowSrcCtx, c, width, height });
        shadowSrcCtx.restore();

        let anchorX = width / 2;
        let anchorY = height / 2;
        if ("x" in it && "y" in it) {
            anchorX = (it as any).x;
            anchorY = (it as any).y;
        }

        const shadowCanvas = makeProjectedShadowCanvas(shadowSrc, {
            sun,
            anchor: { x: anchorX, y: anchorY },
            lengthScale: 0.35,
            blur: 1,
            color: "black", // Solid color for the silhouette
        });

        // Draw this individual shadow into the accumulated canvas.
        // Since both are the same size and at identity transform, we just blit.
        allShadowsCtx.drawImage(shadowCanvas, 0, 0);
    }

    // Blit the accumulated shadows onto the base canvas with the desired opacity.
    ctx.base.save();
    ctx.base.setTransform(1, 0, 0, 1, 0, 0);
    ctx.base.globalAlpha = 0.25;
    ctx.base.drawImage(allShadows, 0, 0);
    ctx.base.restore();

    // Blit the combined flowers offscreen canvas on top of all the shadows
    ctx.base.save();
    ctx.base.setTransform(1, 0, 0, 1, 0, 0);
    ctx.base.drawImage(off, 0, 0);
    ctx.base.restore();
}
