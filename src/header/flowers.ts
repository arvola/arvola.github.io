import { FlowerSpec } from "./drawing/elements/flower.ts";
import { makeNewEnglandAster } from "./drawing/elements/new-england-aster.ts";
import { makeGoldenAlexander } from "./drawing/elements/golden-alexander.ts";
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

export const flowers: FlowerSpec[] = [
    { type: "flower", x: 220, y: 150, species: asterCenter },
    { type: "flower", x: 214, y: 150, species: asterLeft },
    { type: "flower", x: 222, y: 150, species: asterRight },
    { type: "flower", x: 220, y: 150, species: asterLeftOuter },
    { type: "flower", x: 228, y: 150, species: asterRightOuter },

    { type: "flower", x: 270, y: 202, species: gaCenter },
    { type: "flower", x: 275, y: 202, species: gaRight },
    { type: "flower", x: 268, y: 202, species: gaLeftOuter },
    { type: "flower", x: 280, y: 202, species: gaRightOuter },
];

export function tintedFlowers(palette: ColorPalette): FlowerSpec[] {
    return flowers.map(f => ({ ...f, palette }));
}
