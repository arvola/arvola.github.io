import { Drawing, initCanvases } from "./drawing/canvases.ts";
import { colorsFromCanvas } from "./drawing/color.ts";
import {cloudyDay, daytimeSpec, overcastDay, rainyDay} from "./daytime.ts";
import { drawSpec } from "./drawing/draw.ts";
import {eveningCloudy, eveningOvercast, eveningRain, eveningSpec} from "./evening.ts";
import {cloudyNightSpec, nightRain, nightSpec, overcastNight} from "./night.ts";
import { AnySpec } from "./drawing/elements";

const scenes = {
    day: {
        clear: daytimeSpec,
        cloudy: cloudyDay,
        overcast: overcastDay,
        rain: rainyDay
    } as Record<string, AnySpec[]>,
    evening: {
        clear: eveningSpec,
        cloudy: eveningCloudy,
        overcast: eveningOvercast,
        rain: eveningRain
    } as Record<string, AnySpec[]>,
    night: {
        clear: nightSpec,
        cloudy: cloudyNightSpec,
        overcast: overcastNight,
        rain: nightRain
    } as Record<string, AnySpec[]>,
};

export type SceneType = keyof typeof scenes;
export const Styles = Object.keys(scenes) as SceneType[];

let drawing: Drawing;

export function drawScene(scene: keyof typeof scenes, weather = "clear") {
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

    document.body.classList.value = scene + " " + weather;
    const c = colorsFromCanvas(drawing.canvas.base);

    let spec = scenes[scene]?.[weather];
    if (!spec) {
        spec = scenes[scene]?.["clear"];
    }

    drawSpec(drawing, c, spec);

    (document.getElementById(`time-${scene}`) as HTMLInputElement).checked =
        true;

    (document.getElementById("weather-select") as HTMLInputElement).value = weather;
}
