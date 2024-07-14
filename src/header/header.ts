import { bzCurve } from "./graphics.ts";
import { cloud2 } from "./cloud.ts";
import { mediumClouds, smallClouds } from "./drawing/elements/clouds.ts";
import { Drawing } from "./drawing/canvases.ts";
import { ColorMap } from "./drawing/color.ts";

export const curveDots = false;
export let recordCurve = true;
export let curveAdjust: [number, number][] = [];
export let curveAdjustPosition = 0;

/**
 * Draw the clouds.
 */
export function clouds({ ctx, c }: Drawing) {
    cloud2(ctx.base, c.clouds, c.cloudsDark, 100, 45, smallClouds[0]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 450, 50, smallClouds[1]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 650, 80, smallClouds[2]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 850, 30, mediumClouds[2]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 1100, 85, mediumClouds[1]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 1300, 30, smallClouds[3]);
    cloud2(ctx.base, c.clouds, c.cloudsDark, 1600, 80, smallClouds[4]);
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
    c: ColorMap
) {
    stuff = [];
    curveAdjustPosition = 0;
    let g = 0;
    ground(drawing, ctx, c.groundLighter, c.groundLighter, groundses[g++], -40);
    ground(drawing, ctx, c.groundLight, c.groundLight, groundses[g++], 0);
    ground(drawing, ctx, c.groundMid, c.groundMid, groundses[g++], -10);
    ground(drawing, ctx, c.groundMidder, c.groundMidder, groundses[g++], 20);
    ground(drawing, ctx, c.groundDarkish, c.groundDarkish, groundses[g++], 0);
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
