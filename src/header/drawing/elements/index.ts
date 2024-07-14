import { drawSky, SkySpec } from "./sky.ts";
import { drawHalo } from "./halo.ts";
import { drawSun } from "./sun.ts";
import { drawClouds } from "./clouds.ts";
import { drawGround } from "./ground.ts";
import { ColorMap } from "../color.ts";

export const DrawingSpec = {
    sky: drawSky,
    halo: drawHalo,
    sun: drawSun,
    clouds: drawClouds,
    ground: drawGround
}

export type AnySpec = Parameters<typeof DrawingSpec[keyof typeof DrawingSpec]>[0];

export function drawWithSpec(spec: AnySpec, ctx: CanvasRenderingContext2D, c: ColorMap) {
    DrawingSpec[spec.type](spec as any, ctx, c);
}