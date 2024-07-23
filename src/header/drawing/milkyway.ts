
/*
The milkyway is not normally drawn, but instead it has been saved to an image. The process of generating
the milkyway is too slow to do every time the page is loaded.
 */

import {NoiseParam, octaves} from "../graphics.ts";
import {Drawing} from "./canvases.ts";

const milkywayX = 400;
const milkywayY = 300;

// Some temporary off-screen canvases to speed up drawing
const nCanv = document.createElement("canvas");
nCanv.width = milkywayX * devicePixelRatio;
nCanv.height = milkywayY * devicePixelRatio;
const nCtx = nCanv.getContext("2d")!;
const n2Canv = document.createElement("canvas");
n2Canv.width = milkywayX * devicePixelRatio;
n2Canv.height = milkywayY * devicePixelRatio;
const n2Ctx = n2Canv.getContext("2d")!;
n2Ctx.scale(devicePixelRatio, devicePixelRatio);

/**
 * Draw one layer of the milkyway.
 *
 * The final milkyway image is a collection of several overlaid noise patterns in different colors.
 * See {@link NoiseParam} for details of the parameters.
 */
function milkyway(
    color: string,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    param: NoiseParam[],
) {
    nCtx.clearRect(
        0,
        0,
        milkywayX * devicePixelRatio,
        milkywayY * devicePixelRatio,
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
            // The noise value from octaves will be applied to the alpha
            let val = octaves(
                x / devicePixelRatio,
                y / devicePixelRatio,
                param,
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
    nCtx.putImageData(data, 0, 0);
    n2Ctx.drawImage(nCanv, 0, 0, milkywayX, milkywayY);
}

/**
 * Draw the milkyway and add a download link to the page.
 *
 * This is not normally called in production.
 */
function drawMilkyway(drawing: Drawing) {
    const { ctx } = drawing;
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

    const temp = document.createElement("canvas");
    temp.width = 400 * devicePixelRatio;
    temp.height = 180 * devicePixelRatio;
    const tempCtx = temp.getContext("2d")!;
    tempCtx.scale(devicePixelRatio, devicePixelRatio);
    tempCtx.rotate(-0.5);
    tempCtx.drawImage(n2Canv, -100, 10, milkywayX, milkywayY);

    const aDownloadLink = document.createElement("a");
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
