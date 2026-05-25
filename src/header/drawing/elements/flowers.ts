import {
    computeStemCurve,
    drawFlowerHead,
    drawLeaves,
    drawStemCurve,
    FlowerHeadParams,
    FlowerSpec,
    getBezierTangentAngle,
    SpeciesProfile,
    tintSpecies,
} from "./flower-primitives.ts";
import { makeNewEnglandAster } from "./new-england-aster.ts";
import {
    drawGoldenAlexanderHead,
    GoldenAlexanderHeadParams,
    makeGoldenAlexander,
} from "./golden-alexander.ts";
import {
    ConeflowerHeadParams,
    drawConeflowerHead,
    makePalePurpleConeflower,
} from "./pale-purple-coneflower.ts";
import { MoundSpec } from "./mound.ts";
import { ColorPalette } from "../color.ts";
import { BeardtongueHeadParams, drawBeardtongueHead } from "./beardtongue.ts";
import { SpecDrawingFunc } from "./base.ts";

export type FlowerSceneSpec = FlowerSpec | MoundSpec;

const asterCenter = makeNewEnglandAster({
    stemLength: 67.5,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.02,
    petalCount: 22,
    petalLength: 7.5,
    petalWidth: 3,
    discRadius: 2.25,
    leafSeed: 1.1,
    petalSeed: 0.3,
    petalShape: "pointed",
});

const asterLeft = makeNewEnglandAster({
    stemLength: 51,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 - 0.28,
    curveStrength: -0.06,
    petalCount: 24,
    petalLength: 7.5,
    petalWidth: 3,
    discRadius: 2.25,
    leafSeed: 2.4,
    petalSeed: 1.7,
    petalShape: "pointed",
});

const asterRight = makeNewEnglandAster({
    stemLength: 55.5,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 + 0.26,
    curveStrength: 0.05,
    petalCount: 23,
    petalLength: 7.5,
    petalWidth: 3,
    discRadius: 2.25,
    leafSeed: 3.7,
    petalSeed: 2.2,
    petalShape: "pointed",
});

const asterLeftOuter = makeNewEnglandAster({
    stemLength: 42,
    stemThickness: 2.1,
    baseAngle: -Math.PI / 2 - 0.1,
    curveStrength: -0.1,
    petalCount: 20,
    petalLength: 7.5,
    petalWidth: 2.7,
    discRadius: 2.25,
    leafSeed: 4.2,
    petalSeed: 3.1,
    petalShape: "pointed",
});

const asterRightOuter = makeNewEnglandAster({
    stemLength: 45,
    stemThickness: 2.1,
    baseAngle: -Math.PI / 2 + 0.3,
    curveStrength: 0.08,
    petalCount: 21,
    petalLength: 7.5,
    petalWidth: 2.7,
    discRadius: 2.25,
    leafSeed: 5.5,
    petalSeed: 4.4,
    petalShape: "pointed",
});

const asterMidLeft = makeNewEnglandAster({
    stemLength: 61.5,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 - 0.12,
    curveStrength: -0.02,
    petalCount: 22,
    petalLength: 7.5,
    petalWidth: 3,
    discRadius: 2.25,
    leafSeed: 6.8,
    petalSeed: 5.1,
    petalShape: "pointed",
});

const asterMidRight = makeNewEnglandAster({
    stemLength: 64.5,
    stemThickness: 2,
    baseAngle: -Math.PI / 2 + 0.14,
    curveStrength: 0.03,
    petalCount: 23,
    petalLength: 7.5,
    petalWidth: 3,
    discRadius: 2.25,
    leafSeed: 7.9,
    petalSeed: 6.2,
    petalShape: "pointed",
});

const gaCenter = makeGoldenAlexander({
    stemLength: 22.5,
    stemThickness: 1.5,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.04,
    splitStemCount: 12,
    splitStemLength: 22.5,
    fanAngle: 1.18,
    clusterCircleCount: 16,
    clusterRadius: 1.245,
    clusterSpread: 4.005,
    leafScale: 0.495,
});

const gaRight = makeGoldenAlexander({
    stemLength: 13.5,
    stemThickness: 1.245,
    baseAngle: -Math.PI / 2 + 0.24,
    curveStrength: 0.07,
    splitStemCount: 8,
    splitStemLength: 19.05,
    fanAngle: 1.08,
    clusterCircleCount: 14,
    clusterRadius: 1.125,
    clusterSpread: 3.705,
    leafScale: 0.495,
});

const gaLeftOuter = makeGoldenAlexander({
    stemLength: 18,
    stemThickness: 1.005,
    baseAngle: -Math.PI / 2 - 0.38,
    curveStrength: -0.12,
    splitStemCount: 6,
    splitStemLength: 13.95,
    fanAngle: 0.92,
    clusterCircleCount: 11,
    clusterRadius: 0.945,
    clusterSpread: 3.105,
    leafScale: 0.495,
});

const gaRightOuter = makeGoldenAlexander({
    stemLength: 25.5,
    stemThickness: 1.005,
    baseAngle: -Math.PI / 2 + 0.48,
    curveStrength: 0.1,
    splitStemCount: 6,
    splitStemLength: 15,
    fanAngle: 0.95,
    clusterCircleCount: 12,
    clusterRadius: 1.005,
    clusterSpread: 3.195,
    leafScale: 0.495,
});

// Pale purple coneflowers (Echinacea pallida) — scaled to ~0.2 of the test-page sizes so the
// flower heads sit alongside the asters in size, with leafScale matched so the basal teardrop
// leaves stay in proportion to the stems.
const coneflowerCenter = makePalePurpleConeflower({
    stemLength: 69,
    stemThickness: 1.8,
    baseAngle: -Math.PI / 2 + 0.02,
    curveStrength: 0.03,
    coneWidth: 3.6,
    coneRimDepth: 1.275,
    coneHeight: 4.5,
    petalCount: 14,
    petalLength: 12.2,
    petalWidth: 1.95,
    petalRadialReach: 0.525,
    petalDroop: 1.175,
    petalCurveStrength: 1.17,
    leafSeed: 1.1,
    petalSeed: 0.4,
    leafScale: 0.3,
});

const coneflowerLeft = makePalePurpleConeflower({
    stemLength: 88.5,
    stemThickness: 1.5,
    baseAngle: -Math.PI / 2 - 0.22,
    curveStrength: -0.06,
    coneWidth: 3.0,
    coneRimDepth: 1.08,
    coneHeight: 3.9,
    petalCount: 13,
    petalLength: 11.2,
    petalWidth: 1.48,
    petalRadialReach: 0.825,
    petalDroop: 1.075,
    petalCurveStrength: 1.17,
    leafSeed: 2.3,
    petalSeed: 1.6,
    leafScale: 0.3,
});

const coneflowerRight = makePalePurpleConeflower({
    stemLength: 61.5,
    stemThickness: 1.5,
    baseAngle: -Math.PI / 2 + 0.24,
    curveStrength: 0.07,
    coneWidth: 3.15,
    coneRimDepth: 1.11,
    coneHeight: 4.05,
    petalCount: 14,
    petalLength: 10.8,
    petalWidth: 1.74,
    petalRadialReach: 0.625,
    petalDroop: 1.275,
    petalCurveStrength: 1.17,
    leafSeed: 3.7,
    petalSeed: 2.2,
    leafScale: 0.3,
});

const coneflowerBase = { x: 312, y: 185 };
const gaBase = { x: 274, y: 190 };
const asterBase = { x: 220, y: 150 };

export const flowers: FlowerSceneSpec[] = [
    // { type: "mound", x: asterBase.x + 1, y: asterBase.y + 1, width: 11, height: 3, tilt: -0.05 },
    // { type: "flower", x: asterBase.x, y: asterBase.y, species: asterCenter },
    // { type: "flower", x: asterBase.x - 3, y: asterBase.y, species: asterMidLeft },
    // { type: "flower", x: asterBase.x + 5, y: asterBase.y, species: asterMidRight },
    // { type: "flower", x: asterBase.x - 6, y: asterBase.y, species: asterLeft },
    // { type: "flower", x: asterBase.x + 2, y: asterBase.y, species: asterRight },
    // { type: "flower", x: asterBase.x, y: asterBase.y, species: asterLeftOuter },
    // { type: "flower", x: asterBase.x + 8, y: asterBase.y, species: asterRightOuter },
    // { type: "mound", x: asterBase.x + 1, y: asterBase.y + 1, width: 11, height: 3, tilt: -0.05, half: "bottom" },

    {
        type: "mound",
        x: coneflowerBase.x,
        y: coneflowerBase.y + 1,
        width: 11,
        height: 3,
        tilt: -0.05,
    },
    {
        type: "flower",
        x: coneflowerBase.x - 6,
        y: coneflowerBase.y,
        species: coneflowerLeft,
    },
    {
        type: "flower",
        x: coneflowerBase.x,
        y: coneflowerBase.y,
        species: coneflowerCenter,
    },
    {
        type: "flower",
        x: coneflowerBase.x + 5,
        y: coneflowerBase.y,
        species: coneflowerRight,
    },
    {
        type: "mound",
        x: coneflowerBase.x,
        y: coneflowerBase.y + 1,
        width: 11,
        height: 3,
        tilt: -0.05,
        half: "bottom",
    },

    {
        type: "mound",
        x: gaBase.x,
        y: gaBase.y + 1,
        width: 9,
        height: 2.5,
        tilt: 0.04,
    },
    { type: "flower", x: gaBase.x - 4, y: gaBase.y, species: gaCenter },
    { type: "flower", x: gaBase.x + 1, y: gaBase.y, species: gaRight },
    { type: "flower", x: gaBase.x - 6, y: gaBase.y, species: gaLeftOuter },
    { type: "flower", x: gaBase.x + 6, y: gaBase.y, species: gaRightOuter },
    {
        type: "mound",
        x: gaBase.x,
        y: gaBase.y + 1,
        width: 9,
        height: 2.5,
        tilt: 0.04,
        half: "bottom",
    },
];

export function tintedFlowers(palette: ColorPalette): FlowerSceneSpec[] {
    return flowers.map((f) => ({ ...f, palette }));
}

export function generateFlower(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    species: SpeciesProfile,
): void {
    const stem = computeStemCurve(x, y, species.stem);
    drawLeaves(ctx, stem, species.leaf);
    drawStemCurve(ctx, stem, species.stem);
    if (species.head.type === "golden-alexander") {
        const stemEndAngle = getBezierTangentAngle(
            1,
            stem.p0,
            stem.p1,
            stem.p2,
        );
        drawGoldenAlexanderHead(
            ctx,
            stem.p2.x,
            stem.p2.y,
            species.head as GoldenAlexanderHeadParams,
            stemEndAngle,
        );
    } else if (species.head.type === "coneflower") {
        const stemEndAngle = getBezierTangentAngle(
            1,
            stem.p0,
            stem.p1,
            stem.p2,
        );
        drawConeflowerHead(
            ctx,
            stem.p2.x,
            stem.p2.y,
            species.head as ConeflowerHeadParams,
            stemEndAngle,
        );
    } else if (species.head.type === "beardtongue") {
        const stemEndAngle = getBezierTangentAngle(
            1,
            stem.p0,
            stem.p1,
            stem.p2,
        );
        drawBeardtongueHead(
            ctx,
            stem.p2.x,
            stem.p2.y,
            species.head as BeardtongueHeadParams,
            stemEndAngle,
        );
    } else {
        drawFlowerHead(ctx, stem.p2.x, stem.p2.y, species.head as FlowerHeadParams);
    }
}

export const drawFlower: SpecDrawingFunc<FlowerSpec> = (spec, { ctx }) => {
    generateFlower(
        ctx,
        spec.x,
        spec.y,
        tintSpecies(spec.species, spec.palette),
    );
};
