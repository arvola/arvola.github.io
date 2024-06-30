import { curveAdjust, stuff } from "./header/header.ts";
import { html } from "./template.ts";
import { noise } from "./header/graphics.ts";
import { cloud2, noiseCloud } from "./header/cloud.ts";

export function generateSamples() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("generate-wrapper");
    document.body.insertBefore(wrapper, document.getElementById("app"));

    let thresholds = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    let threshold = 0.55;
    let offset = 4;
    let mult = 13;
    for (let offset = 43; offset < 85; offset++) {
        sample(wrapper, threshold, offset, mult);
    }
}

function sample(
    wrapper: HTMLDivElement,
    threshold: number,
    offset: number,
    mult: number,
) {
    wrapper.insertAdjacentHTML(
        "beforeend",
        html` <div class="generated">
            <div class="generated-info"></div>
            <div>
                <button type="button">Copy</button>
            </div>
            <canvas></canvas>
        </div>`,
    );
    const box = wrapper.lastElementChild as HTMLDivElement;
    const info = box.querySelector(".generated-info") as HTMLDivElement;
    const canvas = box.querySelector("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;

    canvas.width = 400;
    canvas.height = 220;
    context.fillStyle = "#60dddbff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let points = noiseCloud(
        context,
        "#e0f5f3",
        "#bdefed",
        50,
        50,
        threshold,
        34,
        offset,
        300,
        120,
        (x, y) => (noise(x * mult, y * mult) + noise(y, x)) / 2,
    );
    info.innerText = `Offset ${offset}, threshold ${threshold}, points ${points.length}`;
    box.querySelector("button")!.addEventListener("click", () => {
        let xAdjust = canvas.width;
        let yAdjust = canvas.height;
        for (let [x, y, r] of points) {
            if (x - r < xAdjust) {
                xAdjust = x - r;
            }
            if (y - r < yAdjust) {
                yAdjust = y - r;
            }
        }

        navigator.clipboard.writeText(JSON.stringify(points.map(([x, y, r]) => [x - xAdjust, y - yAdjust, r])));
    });

    canvas.addEventListener("click", function (ev) {
        if (ev.button === 0) {
            let rect = canvas.getBoundingClientRect();
            let x = ev.x - rect.x - 50;
            let y = ev.y - rect.y - 50;
            let index = points.findIndex(
                ([px, py, r]) => Math.abs(x - px) < 8 && Math.abs(y - py) < 8,
            );
            console.log(x, y, index);
            if (index !== -1) {
                let it = points.splice(index, 1);
                console.log(it);
                info.innerText = `Offset ${offset}, threshold ${threshold}, points ${points.length}`;
                context.fillStyle = "#60dddbff";
                context.fillRect(0, 0, canvas.width, canvas.height);
                cloud2(context, "#e0f5f3", "#bdefed", 50, 50, points);
            }
        }
    });
    let startTime = 0;
    let point: [number, number, number] | null;
    let timer: any;
    canvas.addEventListener("mousedown", function (ev) {
        let rect = canvas.getBoundingClientRect();
        let x = Math.floor(ev.x - rect.x - 50);
        let y = Math.floor(ev.y - rect.y - 50);
        console.log(ev.button);
        if (ev.button === 2) {
            startTime = Date.now();
            point = [x, y, 1];
            points.push(point);
            info.innerText = `Offset ${offset}, threshold ${threshold}, points ${points.length}`;
            context.fillStyle = "#60dddbff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            cloud2(context, "#e0f5f3", "#bdefed", 50, 50, points);
            timer = setInterval(() => {
                point![2] += 1;
                context.fillStyle = "#60dddbff";
                context.fillRect(0, 0, canvas.width, canvas.height);
                cloud2(context, "#e0f5f3", "#bdefed", 50, 50, points);
            }, 50);
            ev.preventDefault();
            return false;
        }
    });
    canvas.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
    });
    canvas.addEventListener("mouseup", function (ev) {
        if (ev.button === 2) {
            clearInterval(timer);
            startTime = 0;
            point = null;
            ev.preventDefault();
            return false;
        }
    });
}

export function initDots() {
    const overlay = document.getElementById(
        "overlay-canvas",
    ) as HTMLCanvasElement;

    let moveIndex = -1;
    let start: [number, number] | null = null;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    let onMove = (ev: MouseEvent) => {
        let posX = ev.x - startX;
        let posY = ev.y - startY;
        if (start) {
            curveAdjust[moveIndex] = [start[0] + posX, start[1] + posY];
            window.dispatchEvent(new CustomEvent("grounds"));
        }
    };

    overlay.addEventListener("mousedown", (ev) => {
        if (start) {
            console.warn("Already mouse moving, not registering down!");
            return;
        }
        startX = ev.x;
        startY = ev.y;

        let rect = overlay.getBoundingClientRect();
        offsetX = rect.x;
        offsetY = rect.y;

        let posX = startX - offsetX;
        let posY = startY - offsetY;

        moveIndex = curveAdjust.findIndex(
            ([x, y]) => Math.abs(posX - x) < 5 && Math.abs(posY - y) < 5,
        );
        console.log("start in", posX, posY, moveIndex);
        console.log(curveAdjust);

        if (moveIndex > -1) {
            start = curveAdjust[moveIndex];
            overlay.addEventListener("mousemove", onMove);
        }
    });

    overlay.addEventListener("mouseup", (ev) => {
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
    });
}
