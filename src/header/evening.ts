import { AnySpec } from "./drawing/elements";
import { mediumClouds, smallClouds } from "./drawing/elements/clouds.ts";

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
