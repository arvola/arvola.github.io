import { FlowerSpec } from "./drawing/elements/flower.ts";
import { makeNewEnglandAster } from "./drawing/elements/new-england-aster.ts";

const center = makeNewEnglandAster({
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

const left = makeNewEnglandAster({
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

const right = makeNewEnglandAster({
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

const leftOuter = makeNewEnglandAster({
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

const rightOuter = makeNewEnglandAster({
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

export const flowers: FlowerSpec[] = [
    { type: "flower", x: 220, y: 190, species: center },
    { type: "flower", x: 214, y: 190, species: left },
    { type: "flower", x: 222, y: 190, species: right },
    { type: "flower", x: 220, y: 190, species: leftOuter },
    { type: "flower", x: 228, y: 190, species: rightOuter },
];
