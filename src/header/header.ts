import hatch from "../tex/hatch2.jpg";
import { bzCurve, colorsFromCanvas } from "./graphics.ts";
import { img } from "../img.ts";

export type Canvases = {
    base: HTMLCanvasElement;
    ground: HTMLCanvasElement;
};

export type Contexts = {
    base: CanvasRenderingContext2D;
    ground: CanvasRenderingContext2D;
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
    direction: 1
};

export function initCanvases(canvas: Canvases): Drawing {
    let ctx: Contexts = {
        base: canvas.base.getContext("2d")!,
        ground: canvas.ground.getContext("2d")!,
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

    const c = colorsFromCanvas(canvas.base);

    // If the kitty has not been positioned yet, do that now
    if (positionAdjust.offsetX === 1) {
        const bounds = canvas.base.getBoundingClientRect();
        positionAdjust.offsetX = bounds.left + 113;
        positionAdjust.offsetY = bounds.top + 43;
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
        positionAdjust.x = (left - x);
        positionAdjust.y = (top - y);
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

})

/**
 * Redraw all the "sprites" on top of the graphic.
 */
export function redrawSprites() {
    kitty.style.left = (positionAdjust.offsetX + positionAdjust.x) + "px";
    kitty.style.top = (positionAdjust.offsetY + positionAdjust.y) + "px";
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
    points: [number, number][]
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
            Math.PI * 2
        );
    }
    ctx.fill();
    ctx.closePath();
}

/**
 * Render the landscape ground.
 *
 * The ground is drawn on a separate canvas because adding the hatch pattern onto just the ground
 * in a single canvas always caused some artifacts.
 *
 * @param canvas Canvas to draw on.
 * @param ctx Canvas context.
 * @param c Color set.
 * @param texOpacity Opacity to use for the hatch texture.
 * @param texBlend Blend mode to use for the hatch texture.
 */
export function grounds(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    c: ReturnType<typeof colorsFromCanvas>,
    texOpacity = 0.7,
    texBlend: GlobalCompositeOperation = "multiply"
) {
    ground(
        ctx,
        c.groundDarkish,
        c.groundDark,
        [
            [0, 130],
            [150, 130],
            [150, 130],
            [200, 150],
            [210, 140],
            [550, 180],
            [560, 179],
        ],
        0
    );
    ground(ctx, c.groundMid, c.groundMidder, [
        [0, 130],
        [40, 100],
        [100, 100],
        [140, 130],
        [150, 130],
        [200, 150],
        [210, 152],
        [550, 180],
        [560, 200],
    ]);
    ground(ctx, c.groundLight, c.groundLighter, [
        [0, 130],
        [40, 100],
        [80, 100],
        [120, 130],
        [150, 130],
        [200, 150],
        [210, 152],
        [290, 172],
        [550, 180],
        [560, 179],
        [660, 175],
        [700, 177],
        [740, 180],
    ]);
    ground(
        ctx,
        c.groundMid,
        c.groundMidder,
        [
            [0, 135],
            [40, 110],
            [80, 120],
            [120, 150],
            [150, 160],
            [200, 170],
            [300, 180],
            [550, 190],
            [560, 190],
            [660, 187],
            [700, 189],
            [740, 190],
        ],
        10
    );
    ground(
        ctx,
        c.groundDark,
        c.groundDarkish,
        [
            [0, 150],
            [40, 145],
            [80, 155],
            [150, 170],
            [220, 190],
            [230, 192],
            [280, 198],
            [290, 199],
            [350, 205],
            [550, 210],
            [560, 211],
        ],
        30
    );

    // After drawing most of the ground, load the hatch image
    img(hatch, null, (image) => {
        // First create a pattern on a temporary canvas
        const temp = document.createElement("canvas");
        temp.width = 2200 * devicePixelRatio;
        temp.height = 220 * devicePixelRatio;
        const tctx = temp.getContext("2d")!;
        tctx.scale(devicePixelRatio, devicePixelRatio);
        tctx.drawImage(canvas, 0, 0, 2200, 220);
        const pattern = ctx.createPattern(image, "repeat")!;
        pattern.setTransform(new DOMMatrix([1, 0, 0, 1, 0, 0]).scale(0.5));
        tctx.globalCompositeOperation = "source-in";
        tctx.fillStyle = pattern;
        tctx.rotate(0);
        tctx.fillRect(0, 0, 2200, 220);

        // Then draw the temporary canvas with the filled pattern on the ground
        ctx.globalAlpha = texOpacity;
        ctx.globalCompositeOperation = texBlend;
        ctx.drawImage(temp, 0, 1, 2200, 220);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        // Draw one last ground without any texture
        ground(
            ctx,
            c.groundDark,
            c.groundDark,
            [
                [0, 190],
                [40, 192],
                [80, 200],
                [120, 210],
                [200, 210],
                [350, 215],
            ],
            60
        );
    });
}

function ground(
    ctx: CanvasRenderingContext2D,
    color1: string,
    color2: string,
    curve: [number, number][],
    gradientAdjust = 0
) {
    ctx.beginPath();
    const glGradient = ctx.createLinearGradient(
        2,
        130 + gradientAdjust,
        0,
        220 + gradientAdjust
    );
    glGradient.addColorStop(0, color1);
    glGradient.addColorStop(1, color2);

    ctx.fillStyle = glGradient;

    bzCurve(ctx, curve);

    ctx.lineTo(2200, 220);
    ctx.lineTo(0, 220);
    ctx.closePath();

    ctx.fill();
}

