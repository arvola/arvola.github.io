import { Drawing, initCanvases } from "./drawing/canvases.ts";
import { colorsFromCanvas } from "./drawing/color.ts";
import { cloudyDay, daytimeSpec, overcastDay, rainyDay } from "./daytime.ts";
import { drawSpec } from "./drawing/draw.ts";
import {
    eveningCloudy,
    eveningOvercast,
    eveningRain,
    eveningSpec,
} from "./evening.ts";
import {
    cloudyNightSpec,
    nightRain,
    nightSpec,
    overcastNight,
} from "./night.ts";
import { AnySpec } from "./drawing/elements";
import { mergeFlowersIntoScene } from "./seasonal-flowers.ts";

export interface TimeOfDay {
    clear: AnySpec[];
    cloudy: AnySpec[];
    overcast: AnySpec[];
    rain: AnySpec[];
}

export interface Season {
    day: TimeOfDay;
    evening: TimeOfDay;
    night: TimeOfDay;
}

export interface Scenes {
    spring: Season;
    summer: Season;
    autumn: Season;
    winter: Season;
}

export const scenes: Scenes = {
    spring: {
        day: {
            clear: daytimeSpec,
            cloudy: cloudyDay,
            overcast: overcastDay,
            rain: rainyDay,
        },
        evening: {
            clear: eveningSpec,
            cloudy: eveningCloudy,
            overcast: eveningOvercast,
            rain: eveningRain,
        },
        night: {
            clear: nightSpec,
            cloudy: cloudyNightSpec,
            overcast: overcastNight,
            rain: nightRain,
        },
    },
    summer: {
        day: {
            clear: daytimeSpec,
            cloudy: cloudyDay,
            overcast: overcastDay,
            rain: rainyDay,
        },
        evening: {
            clear: eveningSpec,
            cloudy: eveningCloudy,
            overcast: eveningOvercast,
            rain: eveningRain,
        },
        night: {
            clear: nightSpec,
            cloudy: cloudyNightSpec,
            overcast: overcastNight,
            rain: nightRain,
        },
    },
    autumn: {
        day: {
            clear: daytimeSpec,
            cloudy: cloudyDay,
            overcast: overcastDay,
            rain: rainyDay,
        },
        evening: {
            clear: eveningSpec,
            cloudy: eveningCloudy,
            overcast: eveningOvercast,
            rain: eveningRain,
        },
        night: {
            clear: nightSpec,
            cloudy: cloudyNightSpec,
            overcast: overcastNight,
            rain: nightRain,
        },
    },
    winter: {
        day: {
            clear: daytimeSpec,
            cloudy: cloudyDay,
            overcast: overcastDay,
            rain: rainyDay,
        },
        evening: {
            clear: eveningSpec,
            cloudy: eveningCloudy,
            overcast: eveningOvercast,
            rain: eveningRain,
        },
        night: {
            clear: nightSpec,
            cloudy: cloudyNightSpec,
            overcast: overcastNight,
            rain: nightRain,
        },
    },
};

export type SceneType = keyof typeof scenes;
export const Styles = Object.keys(scenes) as SceneType[];

let drawing: Drawing;

export function drawScene(season: keyof Scenes, time: keyof Season, weather: keyof TimeOfDay = "clear") {
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

    document.body.classList.value = season + " " + time + " " + weather;
    const c = colorsFromCanvas(drawing.canvas.base);

    let spec = scenes[season]?.[time]?.[weather];
    if (!spec) {
        spec = scenes.summer.day.clear;
    }

    // Add flowers from the current month's flower spec
    // The mergeFlowersIntoScene function handles checking for rain
    spec = mergeFlowersIntoScene(spec, weather, drawing.width);

    console.log(season, time, weather);
    console.log(spec);

    drawSpec(drawing, c, spec);

    (document.getElementById(time) as HTMLInputElement).checked =
        true;

    (document.getElementById("weather-select") as HTMLInputElement).value =
        weather;
}
