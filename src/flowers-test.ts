/**
 * Standalone test page entry for the procedural flower renderer.
 *
 * Renders pale purple coneflowers (Echinacea pallida) using the procedural flower renderer.
 */

import { generateFlower } from "./header/drawing/elements/flower.ts";
import { makePalePurpleConeflower } from "./header/drawing/elements/pale-purple-coneflower.ts";

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

const center = makePalePurpleConeflower({
    stemLength: 230,
    stemThickness: 2.8,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.03,
    coneWidth: 12,
    coneRimDepth: 4.2,
    coneHeight: 15,
    petalCount: 14,
    petalLength: 54,
    petalWidth: 6.5,
    petalRadialReach: 0.55,
    petalDroop: 0.85,
    petalCurveStrength: 0.78,
    leafSeed: 1.1,
    petalSeed: 0.4,
});

const left = makePalePurpleConeflower({
    stemLength: 296,
    stemThickness: 2.4,
    baseAngle: -Math.PI / 2 - 0.22,
    curveStrength: -0.06,
    coneWidth: 10,
    coneRimDepth: 3.6,
    coneHeight: 13,
    petalCount: 13,
    petalLength: 44,
    petalWidth: 5.6,
    petalRadialReach: 0.55,
    petalDroop: 0.85,
    petalCurveStrength: 0.78,
    leafSeed: 2.3,
    petalSeed: 1.6,
});

const right = makePalePurpleConeflower({
    stemLength: 204,
    stemThickness: 2.5,
    baseAngle: -Math.PI / 2 + 0.24,
    curveStrength: 0.07,
    coneWidth: 10.5,
    coneRimDepth: 3.7,
    coneHeight: 13.5,
    petalCount: 14,
    petalLength: 46,
    petalWidth: 5.8,
    petalRadialReach: 0.55,
    petalDroop: 0.85,
    petalCurveStrength: 0.78,
    leafSeed: 3.7,
    petalSeed: 2.2,
});

const leftOuter = makePalePurpleConeflower({
    stemLength: 172,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 - 0.5,
    curveStrength: -0.12,
    coneWidth: 8,
    coneRimDepth: 2.9,
    coneHeight: 10.5,
    petalCount: 13,
    petalLength: 35,
    petalWidth: 4.6,
    petalRadialReach: 0.55,
    petalDroop: 0.84,
    petalCurveStrength: 0.78,
    leafSeed: 4.2,
    petalSeed: 3.1,
});

const rightOuter = makePalePurpleConeflower({
    stemLength: 178,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 + 0.5,
    curveStrength: 0.1,
    coneWidth: 8.2,
    coneRimDepth: 2.9,
    coneHeight: 10.8,
    petalCount: 13,
    petalLength: 37,
    petalWidth: 4.6,
    petalRadialReach: 0.55,
    petalDroop: 0.85,
    petalCurveStrength: 0.78,
    leafSeed: 5.5,
    petalSeed: 4.4,
});

const groundY = (canvas.height / totalScale) - 30;
const centerX = (canvas.width / totalScale) / 2;

generateFlower(ctx, centerX + (315 - 320), groundY, center);
generateFlower(ctx, centerX + (286 - 320), groundY, left);
generateFlower(ctx, centerX + (342 - 320), groundY, right);
// generateFlower(ctx, centerX + (254 - 320), groundY, leftOuter);
// generateFlower(ctx, centerX + (378 - 320), groundY, rightOuter);
