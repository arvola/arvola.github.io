import hatch from "../tex/hatch2.jpg";
import { bzCurve, colorsFromCanvas } from "./graphics.ts";
import { img } from "../img.ts";

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

/**
 * Contains adjustments for the position of the kitty.
 */
export const positionAdjust = {
    offsetX: 1,
    offsetY: 1,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    direction: 1,
};

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

// Allow dragging the kitty around with the mouse.

const kitty = document.getElementById("kitty") as HTMLDivElement;
kitty.ondragstart = () => false;
kitty.addEventListener("mousedown", (event: MouseEvent) => {
    const rect = kitty.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    function move(left: number, top: number) {
        positionAdjust.x = left - x;
        positionAdjust.y = top - y;
        positionAdjust.offsetX = 0;
        positionAdjust.offsetY = 0;
        redrawSprites();
    }

    function onMouseMove(event: MouseEvent) {
        move(event.pageX, event.pageY);
    }

    function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        kitty.removeEventListener("mouseup", onMouseUp);
    }

    kitty.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
});

/**
 * Redraw all the "sprites" on top of the graphic.
 */
export function redrawSprites() {
    kitty.style.left = positionAdjust.offsetX + positionAdjust.x + "px";
    kitty.style.top = positionAdjust.offsetY + positionAdjust.y + "px";
}

/**
 * Draw the clouds.
 */
export function clouds({ ctx, c }: Drawing) {
    cloud(ctx.base, c.clouds, c.cloudsDark, 100, 50, [
        [20, 0],
        [40, 18],
        [0, 20],
        [20, 20],
        [25, 20],
        [30, 10],
    ]);
    cloud(ctx.base, c.clouds, c.cloudsDark, 250, 120, [
        [30, 0],
        [60, 18],
        [20, 10],
        [25, 20],
        [30, 10],
        [70, 30],
        [50, 30],
        [90, 45],
        [100, 40],
        [0, 30],
    ]);
    cloud(ctx.base, c.clouds, c.cloudsDark, 460, 90, [
        [30, 0],
        [45, 20],
        [0, 20],
        [10, 15],
        [80, 30],
        [20, 22],
        [30, 22],
        [50, 22],
        [60, 25],
        [50, 8],
    ]);
    cloud(ctx.base, c.clouds, c.cloudsDark, 600, 50, [
        [10, 0],
        [10, 18],
        [0, 20],
        [20, 20],
        [40, 20],
        [50, 20],
        [40, 10],
    ]);
    cloud(ctx.base, c.clouds, c.cloudsDark, 800, 0, [
        [30, 0],
        [30, 0],
        [0, 0],
        [45, 20],
        [0, 20],
        [10, 15],
        [40, 30],
        [20, 22],
        [30, 22],
        [50, 22],
        [60, 25],
        [50, 18],
    ]);
    cloud(ctx.base, c.clouds, c.cloudsDark, 960, 100, [
        [30, 0],
        [0, 0],
        [45, 20],
        [0, 20],
        [10, 15],
        [40, 30],
        [20, 22],
        [30, 22],
        [50, 22],
        [60, 25],
        [50, 18],
    ]);
}

/**
 * Variability in the radiuses of the circles when drawing clouds.
 */
const radiuses = [0, 5, 2, 8, 0, 3, 7, 6, 4];

/**
 * Renders a cloud based on a distribution of points.
 *
 * Each cloudy is basically just a bunch of circles jumbled together.
 */
function cloud(
    ctx: CanvasRenderingContext2D,
    c1: string,
    c2: string,
    x: number,
    y: number,
    points: [number, number][],
) {
    ctx.beginPath();
    let grad = ctx.createLinearGradient(0, y - 20, 0, y + 40);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);

    ctx.fillStyle = grad;

    let i = 0;
    for (let [p1, p2] of points) {
        ctx.moveTo(x + p1, y + p2);
        ctx.arc(
            x + p1,
            y + p2,
            22 + radiuses[i++ % radiuses.length],
            0,
            Math.PI * 2,
        );
    }
    ctx.fill();
    ctx.closePath();
}

let groundses: [number, number][][] = [
    [
        [0, 167],
        [165, 120],
        [257, 126],
        [427, 168],
        [504, 183],
        [576, 200],
        [592, 201],
        [651, 198],
        [699, 201],
        [788, 206],
    ],
    [
        [0, 176],
        [171, 129],
        [256, 133],
        [425, 172],
        [591, 207],
        [549, 211],
        [585, 207],
    ],
    [
        [1, 154],
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
        [30, 137],
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
        [0, 156],
        [30, 147],
        [89, 152],
        [217, 198],
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
 * @param texOpacity Opacity to use for the hatch texture.
 * @param texBlend Blend mode to use for the hatch texture.
 */
export function grounds(
    drawing: Drawing,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    c: ReturnType<typeof colorsFromCanvas>,
    texOpacity = 0.7,
    texBlend: GlobalCompositeOperation = "multiply",
) {
    stuff = [];
    curveAdjustPosition = 0;
    let g = 0;
    ground(drawing, ctx, c.groundLight, c.groundLighter, groundses[g++], -40);
    ground(drawing, ctx, c.groundLight, c.groundDark, groundses[g++], 0);
    ground(drawing, ctx, c.groundMid, c.groundMidder, groundses[g++], -10);
    ground(drawing, ctx, c.groundMid, c.groundMidder, groundses[g++], 20);
    ground(drawing, ctx, c.groundDark, c.groundDarkish, groundses[g++], 0);

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

    if (recordCurve) {
        bzCurve(ctx, curve);
        curveAdjust = curveAdjust.concat(curve);
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
