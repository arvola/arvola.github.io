import {curveAdjust, positionAdjust, redrawSprites, stuff} from "./header/header.ts";
import "./style.css";
import { html } from "./template";
import "./data";
import { drawDaytimeYard } from "./header/daytime.ts";
import { drawEveningYard } from "./header/evening.ts";
import { drawNightYard } from "./header/night.ts";

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
    // document.getElementById("header")?.addEventListener("click", () => {
    //     draw(styles[styleIndex++ % styles.length]);
    // });

    // Draw the art based on Central Standard Time
    // const hour = (new Date().getUTCHours() + 18) % 24;
    // if (hour >= 9 && hour < 18) {
    //     draw("daytime");
    // } else if (hour >= 18 && hour < 21) {
    //     draw("evening");
    // } else {
    //     draw("night");
    // }

    draw("daytime");

    const overlay = document.getElementById("overlay-canvas") as HTMLCanvasElement;

    let moveIndex = -1;
    let start: [number, number] | null = null;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    let onMove = (ev: MouseEvent)=> {
        let posX = (ev.x - startX);
        let posY = (ev.y - startY);
        if (start) {
            curveAdjust[moveIndex] = [start[0] + posX, start[1] + posY];
            window.dispatchEvent(new CustomEvent("grounds"));
        }
    }

    overlay.addEventListener("mousedown", ev => {
        if (start) {
            console.warn("Already mouse moving, not registering down!");
            return;
        }
        startX = ev.x;
        startY = ev.y;

        let rect = overlay.getBoundingClientRect();
        offsetX = rect.x;
        offsetY = rect.y;

        let posX = (startX - offsetX);
        let posY = (startY - offsetY);

        moveIndex = curveAdjust.findIndex(([x, y]) => Math.abs(posX - x) < 5 && Math.abs(posY - y) < 5);
        console.log("start in", posX, posY, moveIndex);
        console.log(curveAdjust);

        if (moveIndex > -1) {
            start = curveAdjust[moveIndex];
            overlay.addEventListener("mousemove", onMove);
        }
    });

    overlay.addEventListener("mouseup", ev => {
        if (moveIndex > -1) {
            overlay.removeEventListener("mousemove", onMove);
            moveIndex = -1;
            start = null;
        }
    });

    document.getElementById("dots")?.addEventListener("change", (ev) => {
        if (ev.target instanceof HTMLInputElement) {
            if (ev.target.checked) {
                overlay.style.setProperty("opacity", "1");
                console.log(stuff);
            } else {
                overlay.style.setProperty("opacity", "0");
            }
        }
    })
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
