import { colorFromSpec, ColorSpec } from "../color.ts";
import { SpecDrawingFunc } from "./base.ts";
import { bzCurve } from "../../graphics.ts";

export interface GroundSpec {
    type: "ground";
    colors?: ColorSpec[];
    darken?: number;
}

export const drawGround: SpecDrawingFunc<GroundSpec> = (spec, { ctx, c }) => {
    let colors = spec.colors || [
            "groundLighter",
            "groundLight",
            "groundMid",
            "groundMidder",
            "groundDarkish",
            "groundDark",
        ];
        grounds(ctx, colors.map(it => colorFromSpec(it, c)));
};

let groundses: [number, number][][] = [
    [
        [0, 175],
        [172, 127],
        [258, 131],
        [420, 168],
        [541, 193],
        [576, 200],
        [592, 201],
        [788, 206]
    ],
    [
        [0, 176],
        [171, 129],
        [256, 133],
        [424, 171],
        [591, 207]
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
        [796, 182]
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
        [919, 188]
    ],
    [
        [0, 145],
        [31, 140],
        [84, 145],
        [223, 196],
        [338, 208],
        [560, 211]
    ],
    [
        [0, 203],
        [200, 210],
        [350, 215]
    ]
];

export function grounds(
    ctx: CanvasRenderingContext2D,
    colors: string[]
) {
    groundses.map((it, index) => {
        ground(ctx, colors[index], it);
    });
}

function ground(
    ctx: CanvasRenderingContext2D,
    color: string,
    curve: [number, number][]
) {
    ctx.beginPath();

    ctx.fillStyle = color;

    bzCurve(ctx, curve);

    ctx.lineTo(2200, 220);
    ctx.lineTo(0, 220);
    ctx.closePath();

    ctx.fill();
}