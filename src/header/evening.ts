import { AnySpec } from "./drawing/elements";
import {bigClouds, mediumClouds, smallClouds} from "./drawing/elements/clouds.ts";

export const eveningSpec: AnySpec[] = [
    {
        type: "sky",
        stops: [
            {
                color: "underground",
                width: 44,
            },
            {
                color: "sky",
                width: 132,
            },
            {
                color: "lightSky",
                width: 44,
            },
            {
                color: "lightSky",
                width: 0,
            },
        ],
    },
    {
        type: "halo",
        x: 450,
        y: 188,
        stops: [
            {
                width: 0,
                color: ["sunner", 0.4],
            },
            {
                width: 200,
                color: ["sunner", 0],
            },
        ],
    },
    {
        type: "sun",
        x: 450,
        y: 188,
        radius: 25,
        fill: "sun",
        stroke: "sunner",
    },
    {
        type: "clouds",
        colors: ["clouds", "cloudsDark"],
        clouds: [
            [100, 45, smallClouds[0]],
            [450, 50, smallClouds[1]],
            [650, 80, smallClouds[2]],
            [850, 30, mediumClouds[2]],
            [1100, 85, mediumClouds[1]],
            [1300, 30, smallClouds[3]],
            [1600, 80, smallClouds[4]],
        ]
    },
    {
        type: "ground",
    },
];

export const eveningCloudy: AnySpec[] = [
    {
        type: "sky",
        stops: [
            {
                color: "underground",
                width: 44,
            },
            {
                color: "sky",
                width: 132,
            },
            {
                color: "lightSky",
                width: 44,
            },
            {
                color: "lightSky",
                width: 0,
            },
        ],
    },
    {
        type: "halo",
        x: 450,
        y: 188,
        stops: [
            {
                width: 0,
                color: ["sunner", 0.4],
            },
            {
                width: 200,
                color: ["sunner", 0],
            },
        ],
    },
    {
        type: "sun",
        x: 450,
        y: 188,
        radius: 25,
        fill: "sun",
        stroke: "sunner",
    },
    {
        type: "clouds",
        colors: ["clouds", "sky"],
        clouds: [
            [140, 35, mediumClouds[5]],
            [220, 75, mediumClouds[4]],
            [150, 75, mediumClouds[2]],
            [0, 75, bigClouds[0]],
            [0, -10, bigClouds[1]],
            [230, 0, mediumClouds[1]],
            [350, 50, mediumClouds[2]],
            [450, 50, smallClouds[1]],
            [555, 50, mediumClouds[4]],
            [650, 80, smallClouds[2]],
            [850, 30, mediumClouds[2]],
            [1100, 85, mediumClouds[1]],
            [1300, 30, smallClouds[3]],
            [1600, 80, smallClouds[4]],
        ]
    },
    {
        type: "ground",
    },
];

export const eveningOvercast: AnySpec[] = [
    {
        type: "sky",
        stops: [
            {
                color: "underground",
                width:170,
            },
            {
                color: "#352b3a",
                width: 44,
            },
            {
                color: "lightSky",
                width: 0,
            },
        ],
    },

    {
        type: "clouds",
        colors: ["#041c42ff", "#090e1b"],
        clouds: [
            [-20, 0, bigClouds[1]],
            [170, 0, bigClouds[0]],
            [340, -20, bigClouds[2]],
            [540, -20, bigClouds[1]],
            [640, -0, bigClouds[2]],
            [760, -0, bigClouds[0]],
            [910, -20, bigClouds[1]],
            [940, -10, bigClouds[2]],
            [1110, -20, bigClouds[0]],
            [1210, -10, bigClouds[1]],
            [1310, -10, bigClouds[2]],
        ],
    },
    {
        type: "clouds",
        colors: ["#041c42ff", "#372a35"],
        clouds: [
            [90, 25, bigClouds[0]],
            [110, 45, bigClouds[0]],
            [450, 30, bigClouds[1]],
            [650, 50, bigClouds[2]],
            [300, 45, bigClouds[0]],
            [10, 20, bigClouds[1]],
            [500, 50, bigClouds[2]],
            [800, 20, bigClouds[1]],
            [1100, 85, bigClouds[1]],
            [1600, 80, smallClouds[4]],
        ],
    },
    {
        type: "clouds",
        colors: ["#1b223c", "#372a35"],
        clouds: [
            [190, 40, mediumClouds[0]],
            [30, 40, mediumClouds[1]],
            [300, 60, mediumClouds[2]],
            [410, 90, mediumClouds[3]],
            [520, 110, bigClouds[1]],
            [630, 90, mediumClouds[4]],
            [730, 110, mediumClouds[5]],
            [1600, 80, smallClouds[4]],
        ],
    },
    {
        type: "ground",
        darken: 0.5
    },
];

export const eveningRain: AnySpec[] = [
    {
        type: "sky",
        stops: [
            {
                color: "underground",
                width:170,
            },
            {
                color: "#251925",
                width: 44,
            },
            {
                color: "#2e1d2e",
                width: 0,
            },
        ],
    },

    {
        type: "clouds",
        colors: ["#0f0e15", "#0e111b"],
        clouds: [
            [-20, 40, bigClouds[1]],
            [170, 40, bigClouds[0]],
            [340, 60, bigClouds[2]],
            [440, 110, bigClouds[2]],
            [540, 70, bigClouds[1]],
            [640, 90, bigClouds[2]],
            [760, 90, bigClouds[0]],
            [630, 10, bigClouds[1]],
            [900, 10, bigClouds[0]],
            [1100, 10, bigClouds[2]],
            [910, 80, bigClouds[1]],
            [940, 70, bigClouds[2]],
            [1110, 80, bigClouds[0]],
            [1210, 50, bigClouds[1]],
            [1310, 60, bigClouds[2]],
            [110, 95, mediumClouds[0]],
            [350, 100, mediumClouds[1]],
            [480, 100, mediumClouds[1]],
            [650, 120, mediumClouds[2]],
            [300, 45, bigClouds[0]],
            [10, 20, bigClouds[1]],
            [500, 50, bigClouds[2]],
            [800, 20, bigClouds[1]],
            [1100, 85, bigClouds[1]],
            [1600, 80, smallClouds[4]],
        ],
    },
    {
        type: "clouds",
        colors: ["#041c42ff", "#041c42ff"],
        clouds: [
            //[90, 25, mediumClouds[0]],
        ],
    },
    {
        layer: "overlay",
        type: "rain",
        colors: ["#c4d6e111", "#c4d6e133", "#DEC4E144"],
        tilt: 20
    },
    {
        type: "ground",
        darken: 0.7
    },
];
