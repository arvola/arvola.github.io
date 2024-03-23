import { createNoise2D } from "simplex-noise";

export const seedAlpha = "abcdefghjklmnopqrstuvwxyz ";
export const seedText =
    "reed organ plays funny music when smashed together in big fists and given enough speed to crumble with pizzazz in your face loudly proclaiming truth and beauty that at the end is nothing but empty gibberish masquerading as profound but which in itself becomes deeper through its satire of depth oh god how long does this need to be i just want some perlin simplex noise to make pretty stars and maybe some clouds and stuff the galaxy would also be cool i just need it to get to over five hundred twelve so it can be yay";
export const seed: number[] = [];


for (let i = 511; i >= 0; i--) {
    let one = seedText[i];
    let two = seedText[i--];
    seed.push(seedAlpha.indexOf(one) / 27 + seedAlpha.indexOf(two) / 270);
}


const seedFunc = () => {
    let i = 0;
    return () => seed[i++ % 256]!;
};
export const noise = createNoise2D(seedFunc());

function circ(x: number, curve = 2) {
    return x === 0
        ? 0
        : x === 1
            ? 1
            : x < 0.5
                ? Math.pow(x, curve) * Math.pow(2, curve - 1)
                : 1 - Math.pow(-2 * x + 2, curve) / 2;
}

function sweepIt(
    pos: number,
    start: number,
    end: number,
    curve?: 2 | 4 | 6 | 8 | 10
) {
    if (pos < start) {
        return 0;
    } else if (pos > end) {
        return 0;
    } else {
        let sw = (2 * pos - start - end) / (end - start);
        if (curve) {
            sw = Math.pow(Math.E, -2 * Math.pow(sw / 0.6, curve));
        } else {
            sw = 1 - Math.abs(sw);
        }
        return sw;
    }
}

export function octaves(x: number, y: number, param: NoiseParam[]) {
    let val = 0;
    let div = 0;
    let thr = 0;
    let cur: NoiseParam["curve"] = 0;
    let xs: NoiseParam["xSweep"];
    let ys: NoiseParam["ySweep"];
    for (let { f, amp, curve, threshold, xSweep, ySweep } of param) {
        if (amp > 0) {
            let n = (1 + noise(x * f, y * f)) / 2;
            //val = val === -1 ? n : n * val;
            val += n * amp;
            div += amp;
            thr = threshold || thr;
            cur = curve || cur;
            xs = xSweep || xs;
            ys = ySweep || ys;
        }
        ++f;
    }

    val = val / div;

    if (xs) {
        val *= sweepIt(x, xs.start, xs.end, xs.curve);
    }
    if (ys) {
        val *= sweepIt(y, ys.start, ys.end, ys.curve);
    }

    if (thr) {
        if (val < thr) {
            val = 0;
        } else {
            val = (val - thr) / (1 - thr);
        }
    }
    if (cur) {
        val = circ(val, cur);
    }

    return val;
}

export type NoiseParam = {
    f: number;
    amp: number;
    curve?: number;
    threshold?: number;
    xSweep?: {
        start: number;
        end: number;
        curve?: 2 | 4 | 6 | 8 | 10;
    };
    ySweep?: {
        start: number;
        end: number;
        curve?: 2 | 4 | 6 | 8 | 10;
    };
};

function gradient(a: [number, number], b: [number, number]) {
    return (b[1] - a[1]) / (b[0] - a[0]);
}

export function bzCurve(ctx: CanvasRenderingContext2D, points: [number, number][]) {
    const f = 0.3;
    const t = 0.6;

    ctx.moveTo(points[0][0], points[0][1]);

    let m = 0;
    let dx1 = 0;
    let dy1 = 0;

    let preP = points[0];

    for (let i = 1; i < points.length; i++) {
        let curP = points[i];
        let nexP = points[i + 1];
        let dx2: number;
        let dy2: number;
        if (nexP) {
            m = gradient(preP, nexP);
            dx2 = (nexP[0] - curP[0]) * -f;
            dy2 = dx2 * m * t;
        } else {
            dx2 = 0;
            dy2 = 0;
        }

        ctx.bezierCurveTo(
            preP[0] - dx1,
            preP[1] - dy1,
            curP[0] + dx2,
            curP[1] + dy2,
            curP[0],
            curP[1]
        );

        dx1 = dx2;
        dy1 = dy2;
        preP = curP;
    }
}

/**
 * Get the actual color values from CSS variables for the canvas.
 */
export function colorsFromCanvas(canvas: HTMLCanvasElement) {
    const style = getComputedStyle(canvas);

    const colors = {
        sky: "--sky",
        lightSky: "--light-sky",
        groundDark: "--ground-dark",
        groundDarkish: "--ground-darkish",
        groundMid: "--ground-mid",
        groundMidder: "--ground-midder",
        groundLight: "--ground-light",
        groundLighter: "--ground-lighter",
        clouds: "--clouds",
        cloudsDark: "--clouds-dark",
        sun: "--sun",
        sunner: "--sunner",
        underground: "--underground",
        background: "--background"
    };

    return Object.fromEntries(
        Object.entries(colors).map(([key, val]) => {
            return [key, style.getPropertyValue(val)];
        })
    ) as typeof colors;
}

/**
 * Returns a hex color with a new given opacity.
 *
 * This is necessary for certain versions of Firefox that seem to have a bug with
 * gradients and global opacity.
 */
export function opacity(color: string, opacity: number | string) {
    let val = color.trim();
    if (val.startsWith('#')) {
        val = val.slice(1);
    }
    let op: string;
    if (typeof opacity === "number") {
        op = Math.floor(opacity * 255).toString(16);
        if (op.length === 1) {
            op = "0" + op;
        }
    } else {
        op = opacity;
    }

    if (op.length !== 2) {
        console.warn("Invalid opacity given to opacity function:", opacity);
    }

    if (val.length >= 6) {
        let ret = '#' + val.slice(0, 6) + op;
        return ret;
    }
    if (val.length === 3) {
        let ret = '#' + val[0] + val[0] + val[1] + val[1] + val[2] + val[2] + op;
        return ret;
    }

    // Not sure how to convert, just return color as is
    return color;
}

export function zeroOpacity(color: string) {
    return opacity(color,0);
}
