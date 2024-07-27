import "./style.css";
import { html } from "./template";
import "./data";
import {positionAdjust, redrawSprites} from "./header/drawing/kitty.ts";
import {drawScene, SceneType, Styles} from "./header/header.ts";

let styleIndex = 0;

window.addEventListener("load", () => {
    // Add the different time of day options to the page
    const select = document.getElementById("time-select")!;
    for (let it of Styles) {
        select.insertAdjacentHTML(
            "beforeend",
            html`<div class="time-item-wrap"><input
                    type="radio"
                    id="time-${it}"
                    name="times"
                    value="${it}"
                />
                <label for="time-${it}">${it.replace(/_/g, " ")}</label></div>`,
        );
        let input = document.getElementById(`time-${it}`) as HTMLInputElement;

        input.addEventListener("change", (ev) => {
            let val = (ev.target as HTMLInputElement).value;
            drawScene(val as any);
        });
    }
    document.getElementById("header")?.addEventListener("click", () => {
        drawScene(Styles[styleIndex++ % Styles.length]);
    });

    // Draw the art based on Central Standard Time
    // const hour = (new Date().getUTCHours() + 18) % 24;
    // if (hour >= 9 && hour < 18) {
    //     drawScene("day");
    // } else if (hour >= 18 && hour < 21) {
    //     drawScene("evening");
    // } else {
    //     drawScene("night");
    // }

    drawScene("rainy_day");
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

