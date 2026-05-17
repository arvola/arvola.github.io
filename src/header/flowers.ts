import { FlowerSpec } from "./drawing/elements/flower.ts";
import { makeNewEnglandAster } from "./drawing/elements/new-england-aster.ts";
import { makeGoldenAlexander } from "./drawing/elements/golden-alexander.ts";
import { makePalePurpleConeflower } from "./drawing/elements/pale-purple-coneflower.ts";
import { ColorPalette } from "./drawing/color.ts";

const asterCenter = makeNewEnglandAster({
    stemLength: 50,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.02,
    petalCount: 22,
    petalLength: 8,
    petalWidth: 2,
    discRadius: 2,
    leafSeed: 1.1,
    petalSeed: 0.3,
    petalShape: "pointed",
});

const asterLeft = makeNewEnglandAster({
    stemLength: 34,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 - 0.28,
    curveStrength: -0.06,
    petalCount: 24,
    petalLength: 7,
    petalWidth: 2,
    discRadius: 2,
    leafSeed: 2.4,
    petalSeed: 1.7,
    petalShape: "pointed",
});

const asterRight = makeNewEnglandAster({
    stemLength: 37,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 + 0.26,
    curveStrength: 0.05,
    petalCount: 23,
    petalLength: 7,
    petalWidth: 2,
    discRadius: 2,
    leafSeed: 3.7,
    petalSeed: 2.2,
    petalShape: "pointed",
});

const asterLeftOuter = makeNewEnglandAster({
    stemLength: 28,
    stemThickness: 1.8,
    baseAngle: -Math.PI / 2 - 0.1,
    curveStrength: -0.1,
    petalCount: 20,
    petalLength: 6,
    petalWidth: 1.8,
    discRadius: 1.8,
    leafSeed: 4.2,
    petalSeed: 3.1,
    petalShape: "pointed",
});

const asterRightOuter = makeNewEnglandAster({
    stemLength: 30,
    stemThickness: 1.8,
    baseAngle: -Math.PI / 2 + 0.45,
    curveStrength: 0.08,
    petalCount: 21,
    petalLength: 6,
    petalWidth: 1.8,
    discRadius: 1.8,
    leafSeed: 5.5,
    petalSeed: 4.4,
    petalShape: "pointed",
});

const gaCenter = makeGoldenAlexander({
    stemLength: 15,
    stemThickness: 1.0,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.04,
    splitStemCount: 12,
    splitStemLength: 15,
    fanAngle: 1.18,
    clusterCircleCount: 16,
    clusterRadius: 0.83,
    clusterSpread: 2.67,
    leafScale: 0.33,
});

const gaRight = makeGoldenAlexander({
    stemLength: 9,
    stemThickness: 0.83,
    baseAngle: -Math.PI / 2 + 0.24,
    curveStrength: 0.07,
    splitStemCount: 8,
    splitStemLength: 12.7,
    fanAngle: 1.08,
    clusterCircleCount: 14,
    clusterRadius: 0.75,
    clusterSpread: 2.47,
    leafScale: 0.33,
});

const gaLeftOuter = makeGoldenAlexander({
    stemLength: 12,
    stemThickness: 0.67,
    baseAngle: -Math.PI / 2 - 0.38,
    curveStrength: -0.12,
    splitStemCount: 6,
    splitStemLength: 9.3,
    fanAngle: 0.92,
    clusterCircleCount: 11,
    clusterRadius: 0.63,
    clusterSpread: 2.07,
    leafScale: 0.33,
});

const gaRightOuter = makeGoldenAlexander({
    stemLength: 17,
    stemThickness: 0.67,
    baseAngle: -Math.PI / 2 + 0.48,
    curveStrength: 0.1,
    splitStemCount: 6,
    splitStemLength: 10,
    fanAngle: 0.95,
    clusterCircleCount: 12,
    clusterRadius: 0.67,
    clusterSpread: 2.13,
    leafScale: 0.33,
});

// Pale purple coneflowers (Echinacea pallida) — scaled to ~0.2 of the test-page sizes so the
// flower heads sit alongside the asters in size, with leafScale matched so the basal teardrop
// leaves stay in proportion to the stems.
const coneflowerCenter = makePalePurpleConeflower({
    stemLength: 46,
    stemThickness: 1.2,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.03,
    coneWidth: 2.4,
    coneRimDepth: 0.85,
    coneHeight: 3,
    petalCount: 14,
    petalLength: 10.8,
    petalWidth: 1.3,
    petalRadialReach: 0.55,
    petalDroop: 0.85,
    petalCurveStrength: 0.78,
    leafSeed: 1.1,
    petalSeed: 0.4,
    leafScale: 0.2,
});

const coneflowerLeft = makePalePurpleConeflower({
    stemLength: 59,
    stemThickness: 1.0,
    baseAngle: -Math.PI / 2 - 0.22,
    curveStrength: -0.06,
    coneWidth: 2.0,
    coneRimDepth: 0.72,
    coneHeight: 2.6,
    petalCount: 13,
    petalLength: 8.8,
    petalWidth: 1.12,
    petalRadialReach: 0.55,
    petalDroop: 0.85,
    petalCurveStrength: 0.78,
    leafSeed: 2.3,
    petalSeed: 1.6,
    leafScale: 0.2,
});

const coneflowerRight = makePalePurpleConeflower({
    stemLength: 41,
    stemThickness: 1.0,
    baseAngle: -Math.PI / 2 + 0.24,
    curveStrength: 0.07,
    coneWidth: 2.1,
    coneRimDepth: 0.74,
    coneHeight: 2.7,
    petalCount: 14,
    petalLength: 9.2,
    petalWidth: 1.16,
    petalRadialReach: 0.55,
    petalDroop: 0.85,
    petalCurveStrength: 0.78,
    leafSeed: 3.7,
    petalSeed: 2.2,
    leafScale: 0.2,
});

export const flowers: FlowerSpec[] = [
    { type: "flower", x: 220, y: 150, species: asterCenter },
    { type: "flower", x: 214, y: 150, species: asterLeft },
    { type: "flower", x: 222, y: 150, species: asterRight },
    { type: "flower", x: 220, y: 150, species: asterLeftOuter },
    { type: "flower", x: 228, y: 150, species: asterRightOuter },

    { type: "flower", x: 283, y: 145, species: coneflowerLeft },
    { type: "flower", x: 289, y: 145, species: coneflowerCenter },
    { type: "flower", x: 294, y: 145, species: coneflowerRight },

    { type: "flower", x: 270, y: 202, species: gaCenter },
    { type: "flower", x: 275, y: 202, species: gaRight },
    { type: "flower", x: 268, y: 202, species: gaLeftOuter },
    { type: "flower", x: 280, y: 202, species: gaRightOuter },
];

export function tintedFlowers(palette: ColorPalette): FlowerSpec[] {
    return flowers.map(f => ({ ...f, palette }));
}
