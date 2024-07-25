import { Drawing, initCanvases } from "./drawing/canvases.ts";
import { colorsFromCanvas } from "./drawing/color.ts";
import {cloudyDay, daytimeSpec} from "./daytime.ts";
import { drawSpec } from "./drawing/draw.ts";
import { eveningSpec } from "./evening.ts";
import { nightSpec } from "./night.ts";

const scenes = {
    day: daytimeSpec,
    evening: eveningSpec,
    night: nightSpec,
    day_cloudy: cloudyDay
};

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

    document.body.classList.value = scene.split("_")[0] || "";

    const c = colorsFromCanvas(drawing.canvas.base);

    if (scenes[scene]) {
        drawSpec(drawing, c, scenes[scene]);
    }

    (document.getElementById(`time-${scene}`) as HTMLInputElement).checked =
        true;
}
