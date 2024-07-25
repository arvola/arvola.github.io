export type ColorSpec = string | [string, number];

export interface GradienStop {
    color?: ColorSpec;
    width: number;
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
        background: "--background",
    };

    return Object.fromEntries(
        Object.entries(colors).map(([key, val]) => {
            return [key, style.getPropertyValue(val)];
        }),
    ) as typeof colors;
}

export function colorFromSpec(spec: ColorSpec, map: ColorMap) {
    let color: string;
    let op: number | null = null;
    if (typeof spec === "string") {
        color = spec;
    } else {
        color = spec[0];
        op = spec[1];
    }

    if (!color) {
        return "#00000000";
    }

    if (map[color as keyof ColorMap]) {
        color = map[color as keyof ColorMap];
    }

    if (op === null) {
        return color;
    }
    return opacity(color, op);
}

export type ColorMap = ReturnType<typeof colorsFromCanvas>;
export type ColorName = keyof ColorMap;

/**
 * Returns a hex color with a new given opacity.
 *
 * This is necessary for certain versions of Firefox that seem to have a bug with
 * gradients and global opacity.
 */
export function opacity(color: string, opacity: number | string) {
    let val = color.trim();
    if (val.startsWith("#")) {
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
        let ret = "#" + val.slice(0, 6) + op;
        return ret;
    }
    if (val.length === 3) {
        let ret =
            "#" + val[0] + val[0] + val[1] + val[1] + val[2] + val[2] + op;
        return ret;
    }

    // Not sure how to convert, just return color as is
    return color;
}

export function zeroOpacity(color: string) {
    return opacity(color, 0);
}

export function addColorStops(
    gradient: CanvasGradient,
    colors: ColorSpec[],
    c: ColorMap,
) {
    let offsetAdd = 1 / (colors.length - 1);
    let offset = 0;
    let i = 0;
    for (let it of colors) {
        ++i;
        if (i === colors.length) {
            offset = 1;
        }
        gradient.addColorStop(offset, colorFromSpec(it, c));
        offset += offsetAdd;
    }
}

export function widthColorStops(
    gradient: CanvasGradient,
    stops: GradienStop[],
    c: ColorMap,
) {
    let radius = stops.reduce((acc, val) => acc + val.width, 0);
    let offset = 0;
    let i = 0;
    for (let it of stops) {
        ++i;
        if (i === stops.length) {
            offset = 1;
        }
        gradient.addColorStop(
            offset,
            it.color ? colorFromSpec(it.color, c) : "#00000000",
        );
        offset += it.width / radius;
    }

    return radius;
}

// https://en.wikipedia.org/wiki/HSL_and_HSV
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let d = max - min;
    let h = 0;
    if (d === 0) h = 0;
    else if (max === r) h = ((((g - b) / d) % 6) + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
    let l = (min + max) / 2;
    let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let hp = h / 60.0;
    let x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb1: [number, number, number] = [0, 0, 0];
    if (isNaN(h)) rgb1 = [0, 0, 0];
    else if (hp <= 1) rgb1 = [c, x, 0];
    else if (hp <= 2) rgb1 = [x, c, 0];
    else if (hp <= 3) rgb1 = [0, c, x];
    else if (hp <= 4) rgb1 = [0, x, c];
    else if (hp <= 5) rgb1 = [x, 0, c];
    else if (hp <= 6) rgb1 = [c, 0, x];
    let m = l - c * 0.5;
    return [
        Math.round(255 * (rgb1[0] + m)),
        Math.round(255 * (rgb1[1] + m)),
        Math.round(255 * (rgb1[2] + m)),
    ];
}
