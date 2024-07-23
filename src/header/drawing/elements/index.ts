import { drawSky } from "./sky.ts";
import { drawHalo } from "./halo.ts";
import { drawSun } from "./sun.ts";
import { drawClouds } from "./clouds.ts";
import { drawGround } from "./ground.ts";
import { DrawingProps } from "../canvases.ts";
import { drawImage } from "./image.ts";
import {drawStars} from "./stars.ts";

export const DrawingSpec = {
    sky: drawSky,
    halo: drawHalo,
    sun: drawSun,
    clouds: drawClouds,
    ground: drawGround,
    image: drawImage,
    stars: drawStars
};

export type AnySpec = Parameters<
    (typeof DrawingSpec)[keyof typeof DrawingSpec]
>[0];

export function drawWithSpec(spec: AnySpec, props: DrawingProps) {
    return DrawingSpec[spec.type](spec as any, props);
}
