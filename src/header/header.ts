import { bzCurve, colorsFromCanvas } from "./graphics.ts";
import { mediumClouds, smallClouds } from "./clouds.ts";
import { cloud2 } from "./cloud.ts";
import { positionAdjust, redrawSprites } from "./kitty.ts";

export type Canvases = {
    base: HTMLCanvasElement;
    ground: HTMLCanvasElement;
    overlay: HTMLCanvasElement;
};

export type Contexts = {
    base: CanvasRenderingContext2D;
    ground: CanvasRenderingContext2D;
    overlay: CanvasRenderingContext2D;
};

export type Drawing = {
    canvas: Canvases;
    ctx: Contexts;
    c: ReturnType<typeof colorsFromCanvas>;
};

export const curveDots = false;
export let recordCurve = true;
export let curveAdjust: [number, number][] = [];
export let curveAdjustPosition = 0;

export function initCanvases(canvas: Canvases): Drawing {
    let ctx: Contexts = {
        base: canvas.base.getContext("2d")!,
        ground: canvas.ground.getContext("2d")!,
        overlay: canvas.overlay.getContext("2d")!,
    };

    // Enlarge the canvases by the device pixel ratio to improve graphics quality
    for (let it of Object.values(canvas)) {
        it.width = 2200 * devicePixelRatio;
        it.height = 220 * devicePixelRatio;
    }

    ctx.base.clearRect(0, 0, 2200, 220);

    // Scale the canvases to the right size after enlarging
    ctx.base.scale(devicePixelRatio, devicePixelRatio);
    ctx.ground.scale(devicePixelRatio, devicePixelRatio);
    ctx.overlay.scale(devicePixelRatio, devicePixelRatio);

    const c = colorsFromCanvas(canvas.base);

    // If the kitty has not been positioned yet, do that now
    if (positionAdjust.offsetX === 1) {
        const bounds = canvas.base.getBoundingClientRect();
        positionAdjust.offsetX = bounds.left + 40 + window.scrollX;
        positionAdjust.offsetY = bounds.top + 69 + window.scrollY;
        redrawSprites();
    }

    return {
        canvas,
        ctx,
        c,
    };
}

/**
 * Draw the clouds.
 */
export function clouds({ ctx, c }: Drawing) {
    cloud2(ctx.base, c.clouds, c.cloudsDark, 100, 45, smallClouds[0]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 450, 50, smallClouds[1]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 650, 80, smallClouds[2]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 850, 30, mediumClouds[2]);

    if (window.innerWidth > 1000) {
        cloud2(ctx.base, c.clouds, c.cloudsDark, 1100, 85, mediumClouds[1]);

        cloud2(ctx.base, c.clouds, c.cloudsDark, 1300, 30, smallClouds[3]);
        cloud2(ctx.base, c.clouds, c.cloudsDark, 1600, 80, smallClouds[4]);
    }
}

let groundses: [number, number][][] = [
    [
        [0, 175],
        [172, 127],
        [258, 131],
        [420, 168],
        [541, 193],
        [576, 200],
        [592, 201],
        [788, 206],
    ],
    [
        [0, 176],
        [171, 129],
        [256, 133],
        [424, 171],
        [591, 207],
    ],
    [
        [0, 157],
        [70, 133],
        [126, 139],
        [271, 205],
        [318, 207],
        [381, 211],
        [450, 204],
        [570, 186],
        [796, 182],
    ],
    [
        [0, 143],
        [31, 137],
        [83, 142],
        [219, 192],
        [278, 201],
        [323, 203],
        [414, 203],
        [496, 198],
        [560, 190],
        [660, 187],
        [782, 185],
        [919, 188],
    ],
    [
        [0, 145],
        [31, 140],
        [84, 145],
        [223, 196],
        [338, 208],
        [560, 211],
    ],
    [
        [0, 203],
        [200, 210],
        [350, 215],
    ],
];

export let stuff: [number, number][][];

/**
 * Render the landscape ground.
 *
 * The ground is drawn on a separate canvas because adding the hatch pattern onto just the ground
 * in a single canvas always caused some artifacts.
 *
 * @param drawing
 * @param canvas Canvas to draw on.
 * @param ctx Canvas context.
 * @param c Color set.
 */
export function grounds(
    drawing: Drawing,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    c: ReturnType<typeof colorsFromCanvas>
) {
    stuff = [];
    curveAdjustPosition = 0;
    let g = 0;
    ground(drawing, ctx, c.groundLighter, c.groundLighter, groundses[g++], -40);
    ground(drawing, ctx, c.groundLight, c.groundLight, groundses[g++], 0);
    ground(drawing, ctx, c.groundMid, c.groundMid, groundses[g++], -10);
    ground(drawing, ctx, c.groundMidder, c.groundMidder, groundses[g++], 20);
    ground(drawing, ctx, c.groundDarkish, c.groundDarkish, groundses[g++], 0);

    // Draw one last ground without any texture
    ground(drawing, ctx, c.groundDark, c.groundDark, groundses[g++], 60);

    recordCurve = false;
}

function ground(
    drawing: Drawing,
    ctx: CanvasRenderingContext2D,
    color1: string,
    color2: string,
    curve: [number, number][],
    gradientAdjust = 0,
) {
    ctx.beginPath();
    const glGradient = ctx.createLinearGradient(
        4,
        130 + gradientAdjust,
        0,
        220 + gradientAdjust,
    );
    glGradient.addColorStop(0, color1);
    glGradient.addColorStop(1, color2);

    ctx.fillStyle = glGradient;
    let cr = curve;

    if (!curveDots || recordCurve) {
        bzCurve(ctx, curve);
        if (recordCurve) {
            curveAdjust = curveAdjust.concat(curve);
        }
    } else {
        let slice = curveAdjust.slice(
            curveAdjustPosition,
            curveAdjustPosition + curve.length,
        );
        curveAdjustPosition += curve.length;
        bzCurve(ctx, slice);
        cr = slice;
    }

    ctx.lineTo(2200, 220);
    ctx.lineTo(0, 220);
    ctx.closePath();

    ctx.fill();

    if (curveDots) {
        let ov = drawing.ctx.overlay;

        stuff.push(cr);
        ov.fillStyle = "#ffffff";
        for (let [x, y] of cr) {
            ov.beginPath();
            ov.arc(x, y, 2, 0, Math.PI * 2);
            ov.fill();
            ov.closePath();
        }
    }
}
