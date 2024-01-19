import hatch from "./tex/hatch2.jpg";
import kitty from "./img/kitty.svg";
import milky from "./img/milkyway.png";
import { bzCurve, colorsFromCanvas, noise, NoiseParam, octaves } from "./graphics.ts";
import { img } from "./img.ts";

export type Canvases = {
    base: HTMLCanvasElement;
    ground: HTMLCanvasElement;
    sprites: HTMLCanvasElement;
};

export type Contexts = {
    base: CanvasRenderingContext2D;
    ground: CanvasRenderingContext2D;
    sprites: CanvasRenderingContext2D;
};

export type Drawing = {
    canvas: Canvases;
    ctx: Contexts;
    c: ReturnType<typeof colorsFromCanvas>;
};

let spriteCanvas: HTMLCanvasElement;
let spriteCtx: CanvasRenderingContext2D;

function initCanvases(canvas: Canvases): Drawing {
    let ctx: Contexts = {
        base: canvas.base.getContext("2d")!,
        ground: canvas.ground.getContext("2d")!,
        sprites: canvas.sprites.getContext("2d")!,
    };
    spriteCanvas = canvas.sprites;
    spriteCtx = ctx.sprites;

    for (let it of Object.values(canvas)) {
        it.width = 2200 * devicePixelRatio;
        it.height = 220 * devicePixelRatio;
    }

    ctx.base.clearRect(0, 0, 2200, 220);

    ctx.base.scale(devicePixelRatio, devicePixelRatio);
    ctx.ground.scale(devicePixelRatio, devicePixelRatio);
    ctx.sprites.scale(devicePixelRatio, devicePixelRatio);

    const c = colorsFromCanvas(canvas.base);

    return {
        canvas,
        ctx,
        c,
    };
}

export const positionAdjust = {
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
};

export function redrawSprites() {
    img(
        kitty,
        {
            scale: 0.3 * positionAdjust.scale,
            rotate: -0.24 + positionAdjust.rotation,
            mirror: true,
        },
        (image) => {
            requestAnimationFrame(() => {
                spriteCtx.clearRect(0, 0, 2200, 220);
                spriteCtx.drawImage(
                    image,
                    101 + positionAdjust.x,
                    34 + positionAdjust.y,
                    image.width / devicePixelRatio,
                    image.height / devicePixelRatio
                );
            });
        }
    );
}

export function drawDaytimeYard(
    base: HTMLCanvasElement,
    ground: HTMLCanvasElement,
    sprites: HTMLCanvasElement
) {
    const drawing = initCanvases({ base, ground, sprites });
    const { ctx, canvas, c } = drawing;

    const skyGradient = ctx.base.createLinearGradient(0, 0, 0, 80);
    skyGradient.addColorStop(0, c.sky);
    skyGradient.addColorStop(1, c.lightSky);

    ctx.base.fillStyle = skyGradient;
    ctx.base.fillRect(0, 0, 2500, 220);

    const sunGradient = ctx.base.createRadialGradient(
        350,
        20,
        30,
        350,
        20,
        100
    );
    sunGradient.addColorStop(0, c.sunner);
    sunGradient.addColorStop(0.33, c.sunner);
    sunGradient.addColorStop(0.331, c.sun);
    sunGradient.addColorStop(0.66, c.sun);
    sunGradient.addColorStop(0.661, "#fff");
    sunGradient.addColorStop(1, "#fff");
    ctx.base.fillStyle = sunGradient;
    ctx.base.arc(350, 20, 100, 0, 2 * Math.PI);
    ctx.base.globalAlpha = 0.1;
    ctx.base.fill();
    ctx.base.closePath();
    ctx.base.globalAlpha = 1;
    ctx.base.globalCompositeOperation = "source-over";

    ctx.base.beginPath();
    ctx.base.fillStyle = c.sun;
    ctx.base.strokeStyle = c.sunner;
    ctx.base.arc(350, 20, 25, 0, 2 * Math.PI);
    ctx.base.fill();

    redrawSprites();

    clouds(drawing);
    grounds(canvas.ground, ctx.ground, c, 0.5, "multiply");
}

const milkywayX = 400;
const milkywayY = 300;

const nCanv = document.createElement("canvas");
nCanv.width = milkywayX * devicePixelRatio;
nCanv.height = milkywayY * devicePixelRatio;
const nCtx = nCanv.getContext("2d")!;
const n2Canv = document.createElement("canvas");
n2Canv.width = milkywayX * devicePixelRatio;
n2Canv.height = milkywayY * devicePixelRatio;
const n2Ctx = n2Canv.getContext("2d")!;
n2Ctx.scale(devicePixelRatio, devicePixelRatio);

function milkyway(
    color: string,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    param: NoiseParam[]
) {
    nCtx.clearRect(
        0,
        0,
        milkywayX * devicePixelRatio,
        milkywayY * devicePixelRatio
    );
    nCtx.fillStyle = color;
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    let a = color.length > 7 ? parseInt(color.slice(7, 9), 16) : 255;

    x1 = Math.floor(x1 * devicePixelRatio);
    x2 = Math.floor(x2 * devicePixelRatio);
    y1 = Math.floor(y1 * devicePixelRatio);
    y2 = Math.floor(y2 * devicePixelRatio);

    let data = nCtx.createImageData(nCanv.width, nCanv.height);
    for (let x = x1; x < x2; ) {
        for (let y = y1; y < y2; ) {
            let val = octaves(
                x / devicePixelRatio,
                y / devicePixelRatio,
                param
            );
            let index = y * data.width * 4 + x * 4;

            data.data[index] = r;
            data.data[index + 1] = g;
            data.data[index + 2] = b;
            data.data[index + 3] = Math.round(val * a);

            y += 1;
        }
        x += 1;
    }

    //n2Ctx.filter = `blur(${blur * devicePixelRatio}px)`;
    nCtx.putImageData(data, 0, 0);
    n2Ctx.drawImage(nCanv, 0, 0, milkywayX, milkywayY);
}

function drawMilkyway(drawing: Drawing) {
    const { ctx } = drawing;
    let start = Date.now();

    milkyway("#0047b588", 0, 440, 0, 350, [
        {
            f: 0.01,
            amp: 20,
            xSweep: {
                start: 0,
                end: 440,
                curve: 2,
            },
        },
        {
            f: 0.1,
            amp: 2,
        },
        {
            f: 0.05,
            amp: 4,
        },
    ]);

    console.log("one", Date.now() - start);
    start = Date.now();

    milkyway("#3F00B5aa", 50, 390, 0, 350, [
        {
            f: 0.02,
            amp: 20,
            threshold: 0.1,
            xSweep: {
                start: 50,
                end: 390,
            },
        },
        {
            f: 0.1,
            amp: 4,
        },
        {
            f: 0.05,
            amp: 8,
        },
    ]);
    milkyway("#2A0EFF66", 80, 360, 0, 350, [
        {
            f: 0.002,
            amp: 20,
            xSweep: {
                start: 80,
                end: 360,
                curve: 4,
            },
        },
        {
            f: 0.2,
            amp: 4,
        },
        {
            f: 0.1,
            amp: 8,
        },
    ]);

    milkyway("#0047b588", 100, 340, 0, 350, [
        {
            f: 0.001,
            amp: 20,
            curve: 10,
            threshold: 0.1,
            xSweep: {
                start: 100,
                end: 340,
                curve: 4,
            },
        },
        {
            f: 0.1,
            amp: 4,
        },
        {
            f: 0.05,
            amp: 8,
        },
    ]);

    console.log("two", Date.now() - start);
    start = Date.now();

    milkyway("#e1e7fa88", 100, 340, 0, 350, [
        {
            f: 0.012,
            amp: 10,
            curve: 2,
            xSweep: {
                start: 160,
                end: 290,
                curve: 4,
            },
            ySweep: {
                start: 100,
                end: 300,
            },
        },
        {
            f: 0.12,
            amp: 1,
        },
        {
            f: 0.05,
            amp: 1,
        },
    ]);

    console.log("three", Date.now() - start);
    start = Date.now();

    milkyway("#000000", 100, 280, 0, 350, [
        {
            f: 0.05,
            amp: 1,
            curve: 2,
            xSweep: {
                start: 210,
                end: 230,
                curve: 6,
            },
        },
    ]);
    milkyway("#000000", 100, 280, 0, 350, [
        {
            f: 0.051,
            amp: 1,
            curve: 2,
            xSweep: {
                start: 190,
                end: 250,
                curve: 2,
            },
        },
    ]);

    console.log("four", Date.now() - start);
    start = Date.now();

    const temp = document.createElement("canvas");
    temp.width = 400 * devicePixelRatio;
    temp.height = 180 * devicePixelRatio;
    const tempCtx = temp.getContext("2d")!;
    tempCtx.scale(devicePixelRatio, devicePixelRatio);
    tempCtx.rotate(-0.5);
    tempCtx.drawImage(n2Canv, -100, 10, milkywayX, milkywayY);

    var aDownloadLink = document.createElement("a");
    // Add the name of the file to the link
    aDownloadLink.download = "canvas_image.png";
    // Attach the data to the link
    aDownloadLink.href = temp.toDataURL();
    // Get the code to click the download link
    aDownloadLink.innerText = "Download";
    document.getElementById("app")?.append(aDownloadLink);

    ctx.base.globalAlpha = 0.6;
    ctx.base.globalCompositeOperation = "screen";
    ctx.base.rotate(-0.5);
    ctx.base.drawImage(n2Canv, 0, 70, milkywayX, milkywayY);
    ctx.base.rotate(0.5);
    ctx.base.filter = "none";
}

export function drawNightYard(
    base: HTMLCanvasElement,
    ground: HTMLCanvasElement,
    sprites: HTMLCanvasElement
) {
    const drawing = initCanvases({ base, ground, sprites });
    const { ctx, canvas, c } = drawing;

    const skyGradient = ctx.base.createLinearGradient(0, 0, 0, 220);
    skyGradient.addColorStop(0, c.underground);
    skyGradient.addColorStop(0.2, c.sky);
    skyGradient.addColorStop(0.8, c.lightSky);

    ctx.base.fillStyle = skyGradient;
    ctx.base.fillRect(0, 0, 2500, 220);

    img(milky, null, (image) => {
        ctx.base.globalAlpha = 0.6;
        ctx.base.globalCompositeOperation = "screen";

        ctx.base.drawImage(image, 80, 0, 400, 180);

        ctx.base.globalCompositeOperation = "source-over";
        ctx.base.fillStyle = "#ffffff";
        for (let x = 5; x < 2200; ) {
            for (let y = 5; y < 210; ) {
                let val = (noise(x * 4, y * 3) + noise(x, y)) / 2;
                if (val > 0.8 || val < -0.6) {
                    if (val > 0.8) {
                        ctx.base.globalAlpha = (val - 0.8) * 5;
                        ctx.base.fillRect(x, y, 1, 1);
                    } else {
                        val = Math.abs(val);
                        ctx.base.globalAlpha = 0.2 * val;
                        ctx.base.fillRect(x, y, 1, 1);
                    }
                }

                y += 1;
            }
            x += 1;
        }

        redrawSprites();

        grounds(canvas.ground, ctx.ground, c, 0.4, "multiply");
    });
}

export function drawEveningYard(
    base: HTMLCanvasElement,
    ground: HTMLCanvasElement,
    sprites: HTMLCanvasElement
) {
    const drawing = initCanvases({ base, ground, sprites });
    const { ctx, canvas, c } = drawing;

    const skyGradient = ctx.base.createLinearGradient(0, 0, 0, 220);
    skyGradient.addColorStop(0, c.underground);
    skyGradient.addColorStop(0.2, c.sky);
    skyGradient.addColorStop(0.8, c.lightSky);

    ctx.base.fillStyle = skyGradient;
    ctx.base.fillRect(0, 0, 2500, 220);

    const sunX = 450;
    const sunY = 188;
    const sunGradient = ctx.base.createRadialGradient(
        sunX,
        sunY,
        0,
        sunX,
        sunY,
        200
    );
    sunGradient.addColorStop(0, c.sunner);
    sunGradient.addColorStop(1, "#ffffff00");
    ctx.base.fillStyle = sunGradient;
    ctx.base.arc(sunX, sunY, 200, 0, 2 * Math.PI);
    ctx.base.globalAlpha = 0.4;
    ctx.base.fill();
    ctx.base.closePath();
    ctx.base.globalAlpha = 1;
    ctx.base.globalCompositeOperation = "source-over";

    ctx.base.beginPath();
    ctx.base.fillStyle = c.sun;
    ctx.base.strokeStyle = c.sunner;
    ctx.base.arc(sunX, sunY, 25, 0, 2 * Math.PI);
    ctx.base.fill();

    redrawSprites();

    clouds(drawing);
    grounds(canvas.ground, ctx.ground, c, 0.4, "multiply");
}

function clouds({ ctx, c }: Drawing) {
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

const radiuses = [0, 5, 2, 8, 0, 3, 7, 6, 4];

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

function grounds(
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

    img(hatch, null, (image) => {
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

        ctx.globalAlpha = texOpacity;
        ctx.globalCompositeOperation = texBlend;
        ctx.drawImage(temp, 0, 1, 2200, 220);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

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
