/**
 * Standalone test page entry for the procedural flower renderer.
 *
 * Renders golden alexanders using the procedural flower renderer.
 */

import { generateFlower } from "./header/drawing/elements/flower.ts";
import { makeGoldenAlexander } from "./header/drawing/elements/golden-alexander.ts";

const canvas = document.getElementById("flower-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const scale = 2;
const visualScale = 1.5;
const totalScale = scale * visualScale;
ctx.scale(totalScale, totalScale);

// Background fill (subtle gradient like the reference).
const bg = ctx.createLinearGradient(0, 0, 0, canvas.height / totalScale);
bg.addColorStop(0, "#eef7f1");
bg.addColorStop(1, "#dcebe1");
ctx.fillStyle = bg;
ctx.fillRect(0, 0, canvas.width / totalScale, canvas.height / totalScale);

const center = makeGoldenAlexander({
    stemLength: 104,
    stemThickness: 3,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.04,
    splitStemCount: 12,
    splitStemLength: 45,
    fanAngle: 1.18,
    clusterCircleCount: 16,
    clusterRadius: 2.5,
    clusterSpread: 8,
});

const left = makeGoldenAlexander({
    stemLength: 74,
    stemThickness: 2.4,
    baseAngle: -Math.PI / 2 - 0.2,
    curveStrength: -0.06,
    splitStemCount: 7,
    splitStemLength: 34,
    fanAngle: 1.02,
    clusterCircleCount: 13,
    clusterRadius: 2.2,
    clusterSpread: 7,
});

const right = makeGoldenAlexander({
    stemLength: 82,
    stemThickness: 2.5,
    baseAngle: -Math.PI / 2 + 0.24,
    curveStrength: 0.07,
    splitStemCount: 8,
    splitStemLength: 38,
    fanAngle: 1.08,
    clusterCircleCount: 14,
    clusterRadius: 2.25,
    clusterSpread: 7.4,
});

const leftOuter = makeGoldenAlexander({
    stemLength: 58,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 - 0.48,
    curveStrength: -0.12,
    splitStemCount: 6,
    splitStemLength: 28,
    fanAngle: 0.92,
    clusterCircleCount: 11,
    clusterRadius: 1.9,
    clusterSpread: 6.2,
});

const rightOuter = makeGoldenAlexander({
    stemLength: 62,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 + 0.48,
    curveStrength: 0.1,
    splitStemCount: 6,
    splitStemLength: 30,
    fanAngle: 0.95,
    clusterCircleCount: 12,
    clusterRadius: 2,
    clusterSpread: 6.4,
});

// Ground line for stem bases.
const groundY = (canvas.height / totalScale) - 30;

// Render order: back-most first so layering reads correctly.
const centerX = (canvas.width / totalScale) / 2;

generateFlower(ctx, centerX + (315 - 320), groundY, center);
generateFlower(ctx, centerX + (286 - 320), groundY, left);
generateFlower(ctx, centerX + (342 - 320), groundY, right);
generateFlower(ctx, centerX + (254 - 320), groundY, leftOuter);
generateFlower(ctx, centerX + (378 - 320), groundY, rightOuter);
