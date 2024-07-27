import { Drawing, initCanvases } from "./drawing/canvases.ts";
import { colorsFromCanvas } from "./drawing/color.ts";
import {overcastDay, daytimeSpec, cloudyDay, rainyDay} from "./daytime.ts";
import { drawSpec } from "./drawing/draw.ts";
import { eveningSpec } from "./evening.ts";
import { nightSpec } from "./night.ts";

const scenes = {
    day: daytimeSpec,
    evening: eveningSpec,
    night: nightSpec,
    cloudy_day: cloudyDay,
    overcast_day: overcastDay,
    rainy_day: rainyDay
};

export type SceneType = keyof typeof scenes;
export const Styles = Object.keys(scenes) as SceneType[];

let drawing: Drawing;

export function drawScene(scene: keyof typeof scenes) {
    if (!drawing) {
        const base = document.getElementById(
            "header-canvas",
        ) as HTMLCanvasElement;
        const ground = document.getElementById(
            "ground-canvas",
        ) as HTMLCanvasElement;
        const overlay = document.getElementById(
            "overlay-canvas",
        ) as HTMLCanvasElement;

        drawing = initCanvases({ base, ground, overlay });
    }

    document.body.classList.value = scene.split("_").join(" ");

    const c = colorsFromCanvas(drawing.canvas.base);

    if (scenes[scene]) {
        drawSpec(drawing, c, scenes[scene]);
    }

    (document.getElementById(`time-${scene}`) as HTMLInputElement).checked =
        true;
}
