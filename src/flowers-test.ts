/**
 * Standalone test page entry for the procedural flower renderer.
 *
 * Renders calico beardtongue (Penstemon calycosus) — dusty pink-lilac tubular flowers with a
 * spotted corolla tube and a five-lobed, two-lipped mouth around a dark throat.
 */


import { makeCalicoBeardtongue } from "./header/drawing/elements/beardtongue.ts";
import { generateFlower } from "./header/drawing/elements/flowers.ts";

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

const center = makeCalicoBeardtongue({
    stemLength: 250,
    stemThickness: 2.4,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.04,
    tubeLength: 58,
    tubeWidth: 15,
    upperLobeReach: 12,
    lowerLobeReach: 19,
    nodAngle: 0.12,
    speckleCount: 20,
    leafSeed: 1.1,
});

const left = makeCalicoBeardtongue({
    stemLength: 300,
    stemThickness: 2.3,
    baseAngle: -Math.PI / 2 - 0.22,
    curveStrength: -0.06,
    tubeLength: 52,
    tubeWidth: 14,
    upperLobeReach: 12,
    lowerLobeReach: 19,
    nodAngle: 0.5,
    speckleCount: 17,
    leafSeed: 2.4,
});

const right = makeCalicoBeardtongue({
    stemLength: 214,
    stemThickness: 2.3,
    baseAngle: -Math.PI / 2 + 0.24,
    curveStrength: 0.07,
    tubeLength: 53,
    tubeWidth: 14,
    upperLobeReach: 12,
    lowerLobeReach: 19,
    nodAngle: -0.5,
    speckleCount: 17,
    leafSeed: 3.7,
});

const leftOuter = makeCalicoBeardtongue({
    stemLength: 182,
    stemThickness: 2.0,
    baseAngle: -Math.PI / 2 - 0.5,
    curveStrength: -0.11,
    tubeLength: 44,
    tubeWidth: 12,
    upperLobeReach: 12,
    lowerLobeReach: 19,
    nodAngle: 0.72,
    speckleCount: 14,
    leafSeed: 4.2,
    leafScale: 0.85,
});

const rightOuter = makeCalicoBeardtongue({
    stemLength: 188,
    stemThickness: 2.0,
    baseAngle: -Math.PI / 2 + 0.52,
    curveStrength: 0.1,
    tubeLength: 45,
    tubeWidth: 12,
    upperLobeReach: 12,
    lowerLobeReach: 19,
    nodAngle: -0.72,
    speckleCount: 14,
    leafSeed: 5.5,
    leafScale: 0.85,
});

const groundY = (canvas.height / totalScale) - 30;
const centerX = (canvas.width / totalScale) / 2;

generateFlower(ctx, centerX - 5, groundY, center);
generateFlower(ctx, centerX - 40, groundY, left);
generateFlower(ctx, centerX + 26, groundY, right);
generateFlower(ctx, centerX - 74, groundY, leftOuter);
generateFlower(ctx, centerX + 60, groundY, rightOuter);
