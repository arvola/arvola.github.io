import { ColorMap } from "./color.ts";

export interface Canvases {
    base: HTMLCanvasElement;
    ground: HTMLCanvasElement;
    overlay: HTMLCanvasElement;
}

export interface Contexts {
    base: CanvasRenderingContext2D;
    ground: CanvasRenderingContext2D;
    overlay: CanvasRenderingContext2D;
}

export interface Drawing {
    canvas: Canvases;
    ctx: Contexts;
    width: number;
    height: number;
}

export interface DrawingProps {
    ctx: CanvasRenderingContext2D;
    c: ColorMap;
    width: number;
    height: number;
}

export function initCanvases(canvas: Canvases): Drawing {
    let ctx: Contexts = {
        base: canvas.base.getContext("2d")!,
        ground: canvas.ground.getContext("2d")!,
        overlay: canvas.overlay.getContext("2d")!,
    };

    // 50% extra to give a little room for resizing the window
    let width = Math.min(2200, Math.floor(window.innerWidth * 1.5));
    let height = 220;

    // Enlarge the canvases by the device pixel ratio to improve graphics quality
    for (let it of Object.values(canvas)) {
        it.width = width * devicePixelRatio;
        it.height = height * devicePixelRatio;
        it.style.width = `${width}px`;
    }

    ctx.base.clearRect(0, 0, width, height);

    // Scale the canvases to the right size after enlarging
    ctx.base.scale(devicePixelRatio, devicePixelRatio);
    ctx.ground.scale(devicePixelRatio, devicePixelRatio);
    ctx.overlay.scale(devicePixelRatio, devicePixelRatio);

    return {
        canvas,
        ctx,
        width,
        height,
    };
}
