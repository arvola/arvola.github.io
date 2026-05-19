/**
 * Standalone test page entry for the procedural flower renderer.
 *
 * Renders large-flowered tickseed (Coreopsis grandiflora) — bright yellow rays with the
 * signature maroon ring around a golden disc.
 */

import { generateFlower } from "./header/drawing/elements/flower.ts";
import { makeCoreopsis, coreopsisGrandifloraPalette } from "./header/drawing/elements/coreopsis.ts";

const canvas = document.getElementById("flower-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const scale = 2;
const visualScale = 1.5;
const totalScale = scale * visualScale;
ctx.scale(totalScale, totalScale);

const bg = ctx.createLinearGradient(0, 0, 0, canvas.height / totalScale);
bg.addColorStop(0, "#eef7f1");
bg.addColorStop(1, "#dcebe1");
ctx.fillStyle = bg;
ctx.fillRect(0, 0, canvas.width / totalScale, canvas.height / totalScale);

const palette = coreopsisGrandifloraPalette;

const center = makeCoreopsis({
    stemLength: 240,
    stemThickness: 2.4,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.03,
    petalCount: 8,
    petalLength: 44,
    petalWidth: 22,
    discRadius: 9,
    leafSeed: 1.1,
    petalSeed: 0.4,
    palette,
});

const left = makeCoreopsis({
    stemLength: 296,
    stemThickness: 2.2,
    baseAngle: -Math.PI / 2 - 0.2,
    curveStrength: -0.05,
    petalCount: 8,
    petalLength: 37,
    petalWidth: 19,
    discRadius: 7.4,
    leafSeed: 2.3,
    petalSeed: 1.6,
    palette,
});

const right = makeCoreopsis({
    stemLength: 210,
    stemThickness: 2.3,
    baseAngle: -Math.PI / 2 + 0.22,
    curveStrength: 0.06,
    petalCount: 8,
    petalLength: 38,
    petalWidth: 19,
    discRadius: 7.6,
    leafSeed: 3.7,
    petalSeed: 2.2,
    palette,
});

const leftOuter = makeCoreopsis({
    stemLength: 178,
    stemThickness: 1.9,
    baseAngle: -Math.PI / 2 - 0.46,
    curveStrength: -0.1,
    petalCount: 8,
    petalLength: 30,
    petalWidth: 15,
    discRadius: 5.8,
    leafSeed: 4.2,
    petalSeed: 3.1,
    palette,
});

const rightOuter = makeCoreopsis({
    stemLength: 184,
    stemThickness: 1.9,
    baseAngle: -Math.PI / 2 + 0.48,
    curveStrength: 0.09,
    petalCount: 8,
    petalLength: 31,
    petalWidth: 15,
    discRadius: 6,
    leafSeed: 5.5,
    petalSeed: 4.4,
    palette,
});

const groundY = (canvas.height / totalScale) - 30;
const centerX = (canvas.width / totalScale) / 2;

generateFlower(ctx, centerX + (315 - 320), groundY, center);
generateFlower(ctx, centerX + (280 - 320), groundY, left);
generateFlower(ctx, centerX + (346 - 320), groundY, right);
generateFlower(ctx, centerX + (246 - 320), groundY, leftOuter);
generateFlower(ctx, centerX + (380 - 320), groundY, rightOuter);
