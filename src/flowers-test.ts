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
    tubeLength: 40,
    tubeWidth: 11,
    upperLobeReach: 9,
    lowerLobeReach: 14,
    speckleCount: 16,
    leafSeed: 1.1,
    tierCount: 5,
    tierSpacing: 34,
    topOffset: 0,
    pedicelLength: 11,
    pedicelArch: 9,
    pedicelShrink: 0.12,
    pedicelThickness: 2,
    flowerNod: 0.4,
});

const left = makeCalicoBeardtongue({
    stemLength: 300,
    stemThickness: 2.3,
    baseAngle: -Math.PI / 2 - 0.22,
    curveStrength: -0.06,
    tubeLength: 36,
    tubeWidth: 10,
    upperLobeReach: 8,
    lowerLobeReach: 13,
    speckleCount: 14,
    leafSeed: 2.4,
    tierCount: 6,
    tierSpacing: 31,
    topOffset: 0,
    pedicelLength: 10,
    pedicelArch: 8,
    pedicelShrink: 0.12,
    pedicelThickness: 1.9,
    flowerNod: 0.4,
});

const right = makeCalicoBeardtongue({
    stemLength: 214,
    stemThickness: 2.3,
    baseAngle: -Math.PI / 2 + 0.24,
    curveStrength: 0.07,
    tubeLength: 37,
    tubeWidth: 10,
    upperLobeReach: 8,
    lowerLobeReach: 13,
    speckleCount: 14,
    leafSeed: 3.7,
    tierCount: 4,
    tierSpacing: 32,
    topOffset: 0,
    pedicelLength: 10,
    pedicelArch: 8,
    pedicelShrink: 0.12,
    pedicelThickness: 1.9,
    flowerNod: 0.4,
});

const groundY = (canvas.height / totalScale) - 30;
const centerX = (canvas.width / totalScale) / 2;

generateFlower(ctx, centerX - 5, groundY, center);
generateFlower(ctx, centerX - 70, groundY, left);
generateFlower(ctx, centerX + 60, groundY, right);
