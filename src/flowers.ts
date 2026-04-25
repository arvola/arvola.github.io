import "./style.css";
import { colorsFromCanvas } from "./header/drawing/color.ts";
import { drawFlowers } from "./header/drawing/elements/flowers/index";
import { FlowerData, FlowersSpec } from "./header/drawing/elements/flowers/spec.ts";

const CANVAS_WIDTH = 340;
const CANVAS_HEIGHT = 340;
const CANVAS_DISPLAY_SCALE = 1.8;
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;

const TEST_FLOWERS: FlowerData[] = [
    { x: CANVAS_CENTER_X - 18, y: 90, size: 10, rotation: -0.04, type: "coneflower" },
    { x: CANVAS_CENTER_X + 22, y: 120, size: 14, rotation: 0.05, type: "coneflower" },
    { x: CANVAS_CENTER_X - 20, y: 150, size: 13, rotation: 0.0, type: "coneflower" },
    { x: CANVAS_CENTER_X + 60, y: 170, size: 14, rotation: 0.05, type: "coneflower" },
];

function setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const dpr = window.devicePixelRatio || 1;
    const renderScale = dpr * CANVAS_DISPLAY_SCALE;

    canvas.width = Math.floor(CANVAS_WIDTH * renderScale);
    canvas.height = Math.floor(CANVAS_HEIGHT * renderScale);
    canvas.style.width = `${Math.round(CANVAS_WIDTH * CANVAS_DISPLAY_SCALE)}px`;
    canvas.style.height = `${Math.round(CANVAS_HEIGHT * CANVAS_DISPLAY_SCALE)}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        return null;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(renderScale, renderScale);
    return ctx;
}

function draw(canvas: HTMLCanvasElement): void {
    const ctx = setupCanvas(canvas);
    if (!ctx) {
        return;
    }

    const colors = colorsFromCanvas(canvas);
    const spec: FlowersSpec = {
        type: "flowers",
        flowers: TEST_FLOWERS,
    };

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = colors.background || "#eef8f7";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawFlowers(spec, {
        ctx,
        c: colors,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
    });
}

window.addEventListener("load", () => {
    const canvas = document.getElementById("flower-canvas") as HTMLCanvasElement | null;

    if (!canvas) {
        return;
    }

    draw(canvas);
});