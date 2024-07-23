import { noise } from "./graphics.ts";

export function cloud2(
    ctx: CanvasRenderingContext2D,
    color: [string, string] | CanvasGradient,
    x: number,
    y: number,
    points: [number, number, number][],
    tilt = 0
) {
    ctx.beginPath();

    for (let [p1, p2, size] of points) {
        ctx.moveTo(x + p1, y + p2);
        ctx.arc(x + p1, y + p2, size, 0, Math.PI * 2);
    }
    if (!Array.isArray(color)) {
        ctx.fillStyle = color;
    } else {
        let grad = ctx.createLinearGradient(tilt, y, 0, y + 70);
        grad.addColorStop(0, color[0]);
        grad.addColorStop(1, color[1]);

        ctx.fillStyle = grad;
    }
    ctx.fill();
    ctx.closePath();
}

const tanhA = Math.tanh(2) * 2;

export function easer(x: number, y: number, width = 150, height = 80) {
    return (
        Math.tanh(2 * Math.sin(Math.PI * (x / width))) / tanhA +
        Math.tanh(2 * Math.sin(Math.PI * (y / height + 50))) / tanhA
    );
}

export function noiseCloud(
    ctx: CanvasRenderingContext2D,
    c1: string,
    c2: string,
    x: number,
    y: number,
    threshold: number,
    sizeMultiplier: number,
    noiseOffset: number,
    width: number,
    height: number,
    noiseFunc: (x: number, y: number) => number = (x, y) => noise(x * 4, y * 3)
) {
    ctx.beginPath();
    let grad = ctx.createLinearGradient(0, y - 20, 0, y + 40);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);

    ctx.fillStyle = grad;
    let points: [number, number, number][] = [];
    for (let xp = 0; xp < width; ) {
        for (let yp = 0; yp < height; ) {
            // let val =
            //     (noise(noiseOffset + xp * 4, yp * 3) +
            //         noise(noiseOffset + xp, yp)) /
            //     2;
            let val = noiseFunc(noiseOffset + xp, yp);
            val *= easer(xp, yp, width, height);

            if (val > threshold) {
                let totalX = x + xp;
                let totalY = y + yp;
                let totalSize =
                    10 +
                    Math.floor(
                        ((val - threshold) / (1 - threshold)) * sizeMultiplier,
                    );
                ctx.moveTo(totalX, totalY);
                ctx.arc(totalX, totalY, totalSize, 0, Math.PI * 2);
                points.push([totalX - x, totalY - y, totalSize]);
            }
                yp += 2;
        }
        xp += 10;
    }
    ctx.fill();
    ctx.closePath();
    return points;
}