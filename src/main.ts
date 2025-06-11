import "./style.css";
import "./data";
import { positionAdjust, redrawSprites } from "./header/drawing/kitty.ts";
import { drawScene, Scenes, Season, TimeOfDay } from "./header/header.ts";

let styleIndex = 0;

function getSelectedScene(): [keyof Scenes, keyof Season, keyof TimeOfDay] {
    let season = document.getElementById("season-select") as HTMLInputElement;
    let weather = document.getElementById("weather-select") as HTMLInputElement;
    let time = document.querySelector(
        "#time-select :checked",
    ) as HTMLInputElement;

    return [
        season.value as keyof Scenes,
        time.value as keyof Season,
        weather.value as keyof TimeOfDay,
    ];
}

window.addEventListener("load", () => {
    document.querySelectorAll("#time-select input")?.forEach((element) => {
        element.addEventListener("change", () => {
            drawScene(...getSelectedScene());
        });
    });

    document
        .getElementById("weather-select")
        ?.addEventListener("change", () => {
            drawScene(...getSelectedScene());
        });


    // Determine current season based on the month
    const getCurrentSeason = (): keyof Scenes => {
        const month = new Date().getMonth(); // 0-11, 0 is January and 11 is December
        let season: keyof Scenes;

        if (month >= 2 && month <= 4) {
            season = "spring";
        } else if (month >= 5 && month <= 7) {
            season = "summer";
        } else if (month >= 8 && month <= 10) {
            season = "autumn";
        } else {
            season = "winter";
        }

        console.log(`Current month: ${month+1}, season: ${season}`);
        return season;
    };

    const season = getCurrentSeason();
    // Draw the art based on Central Standard Time
    const hour = (new Date().getUTCHours() + 18) % 24;
    if (hour >= 9 && hour < 18) {
        drawScene(season, "day");
    } else if (hour >= 18 && hour < 21) {
        drawScene(season, "evening");
    } else {
        drawScene(season, "night");
    }
});

/**
 * Keyboard shortcuts to adjust the positioning of the kitty.
 */
const adjustments: {
    key: string;
    attr: keyof typeof positionAdjust;
    value: number;
    shiftValue?: number;
    op?: "+" | "*";
}[] = [
    {
        key: "[",
        attr: "rotation",
        value: 0.02,
    },
    {
        key: "]",
        attr: "rotation",
        value: -0.02,
    },
    {
        key: "{",
        attr: "rotation",
        value: 0.1,
    },
    {
        key: "}",
        attr: "rotation",
        value: -0.1,
    },
    {
        key: "+",
        attr: "scale",
        value: 1.02,
        shiftValue: 1.1,
        op: "*",
    },
    {
        key: "-",
        attr: "scale",
        value: 0.98,
        shiftValue: 0.9,
        op: "*",
    },
];

window.addEventListener("keydown", (ev) => {
    let adj = adjustments.find((it) => it.key === ev.key);

    if (adj) {
        const shift = ev.getModifierState("Shift");
        let value = shift ? adj.shiftValue || adj.value : adj.value;
        if (adj.op === "*") {
            positionAdjust[adj.attr] *= value;
        } else {
            positionAdjust[adj.attr] += value;
        }
        redrawSprites();
    }

    if (ev.key === "d") {
        //draw("day");
    } else if (ev.key === "e") {
        //draw("evening");
    } else if (ev.key === "n") {
        //draw("night");
    }
});
