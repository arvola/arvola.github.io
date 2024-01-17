import {
    positionAdjust,
    drawDaytimeYard,
    redrawSprites,
    drawEveningYard,
    drawNightYard,
} from "./header";
import "./style.css";
import { html } from "./template";

type Styles = "daytime" | "evening" | "night";
const styles: Styles[] = ["daytime", "evening", "night"];
let styleIndex = 0;

window.addEventListener("load", () => {
    const select = document.getElementById("time-select")!;

    for (let it of styles) {
        select.insertAdjacentHTML(
            "beforeend",
            html`<input
                    type="radio"
                    id="time-${it}"
                    name="times"
                    value="${it}"
                />
                <label for="time-${it}">${it}</label>`
        );
        let input = document.getElementById(
            `time-${it}`
        ) as HTMLInputElement;

        input.addEventListener("change", (ev) => {
            let val = (ev.target as HTMLInputElement).value;
            draw(val as any);
        })
    }
    draw("daytime");

    document.getElementById("header")?.addEventListener("click", () => {
        draw(styles[styleIndex++ % styles.length]);
    });
});

const adjustments: {
    key: string;
    attr: keyof typeof positionAdjust;
    value: number;
    shiftValue?: number;
    op?: "+" | "*";
}[] = [
    {
        key: "ArrowLeft",
        attr: "x",
        value: -1,
        shiftValue: -10,
    },
    {
        key: "ArrowRight",
        attr: "x",
        value: 1,
        shiftValue: 10,
    },
    {
        key: "ArrowUp",
        attr: "y",
        value: -1,
        shiftValue: -10,
    },
    {
        key: "ArrowDown",
        attr: "y",
        value: 1,
        shiftValue: 10,
    },
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
        console.log(positionAdjust);
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
    const wrap = document.getElementById("header-wrap")!;
    const header = document.getElementById(
        "header-canvas"
    ) as HTMLCanvasElement;
    const sprites = document.getElementById("sprites") as HTMLCanvasElement;
    const ground = document.getElementById(
        "ground-canvas"
    ) as HTMLCanvasElement;

    document.body.classList.value = time || "";
    switch (time) {
        case "evening":
            drawEveningYard(header, ground, sprites);
            break;
        case "night":
            drawNightYard(header, ground, sprites);
            break;
        default:
            drawDaytimeYard(header, ground, sprites);
    }

    (document.getElementById(`time-${time}`) as HTMLInputElement).checked =
        true;
}
