import "./style.css";
import { html } from "./template";
import "./data";
import { drawDaytimeYard } from "./header/daytime.ts";
import { drawEveningYard } from "./header/evening.ts";
import { drawNightYard } from "./header/night.ts";
import {positionAdjust, redrawSprites} from "./header/drawing/kitty.ts";

type Styles = "daytime" | "evening" | "night";
const styles: Styles[] = ["daytime", "evening", "night"];
let styleIndex = 0;

window.addEventListener("load", () => {
    // Add the different time of day options to the page
    const select = document.getElementById("time-select")!;
    for (let it of styles) {
        select.insertAdjacentHTML(
            "beforeend",
            html`<div class="time-item-wrap"><input
                    type="radio"
                    id="time-${it}"
                    name="times"
                    value="${it}"
                />
                <label for="time-${it}">${it}</label></div>`,
        );
        let input = document.getElementById(`time-${it}`) as HTMLInputElement;

        input.addEventListener("change", (ev) => {
            let val = (ev.target as HTMLInputElement).value;
            draw(val as any);
        });
    }
    document.getElementById("header")?.addEventListener("click", () => {
        draw(styles[styleIndex++ % styles.length]);
    });

    // Draw the art based on Central Standard Time
    const hour = (new Date().getUTCHours() + 18) % 24;
    // if (hour >= 9 && hour < 18) {
        draw("daytime");
    // } else if (hour >= 18 && hour < 21) {
    //     draw("evening");
    // } else {
    //     draw("night");
    // }
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
        draw("daytime");
    } else if (ev.key === "e") {
        draw("evening");
    } else if (ev.key === "n") {
        draw("night");
    }
});

function draw(time?: Styles) {
    const header = document.getElementById(
        "header-canvas",
    ) as HTMLCanvasElement;
    const ground = document.getElementById(
        "ground-canvas",
    ) as HTMLCanvasElement;
    const overlay = document.getElementById(
        "overlay-canvas",
    ) as HTMLCanvasElement;

    document.body.classList.value = time || "";
    switch (time) {
        case "evening":
            drawEveningYard(header, ground, overlay);
            break;
        case "night":
            drawNightYard(header, ground, overlay);
            break;
        default:
            drawDaytimeYard(header, ground, overlay);
    }

    (document.getElementById(`time-${time}`) as HTMLInputElement).checked =
        true;
}
