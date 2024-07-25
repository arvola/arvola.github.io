import { AnySpec } from "./drawing/elements";
import {bigClouds, mediumClouds, smallClouds} from "./drawing/elements/clouds.ts";

export const daytimeSpec: AnySpec[] = [
    {
        type: "sky",
        stops: [
            {
                color: "sky",
                width: 0
            },
            {
                color: "lightSky",
                width: 110
            }
        ],
        height: 0.4
    },
    {
        type: "halo",
        x: 350,
        y: 20,
        stops: [
            {
                width: 75,
            },
            {
                width: 0,
                color: ["#8af1ef", 0.6],
            },
            {
                width: 425,
                color: ["#8af1ef", 0.1],
            },
        ],
    },
    {
        type: "halo",
        x: 350,
        y: 20,
        stops: [
            {
                width: 25,
                color: "#00000000"
            },
            {
                width: 25,
                color: ["sunner", 0.1],
            },
            {
                width: 25,
                color: ["sun", 0.1],
            },
        ],
        banded: true
    },
    {
        type: "sun",
        x: 350,
        y: 20,
        radius: 25,
        fill: "sun",
        stroke: "sunner"
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
        ],
    },
    {
        type: "ground",
    },
];

export const cloudyDay: AnySpec[] = [
    {
        type: "sky",
        stops: [
            {
                color: "#e3faf6",
                width: 0
            },
            {
                color: "#b8d3d2",
                width: 110
            }
        ],
        height: 0.4
    },
    {
        type: "clouds",
        colors: ["#c2d3d2", "#b6cdcc"],
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
        colors: ["#afc6c5", "#afc3c2"],
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
        colors: ["#9caeab", "#afc3c2"],
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
    },
];
