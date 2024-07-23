import { AnySpec } from "./drawing/elements";
import { mediumClouds, smallClouds } from "./drawing/elements/clouds.ts";

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
