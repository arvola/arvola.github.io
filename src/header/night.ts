import milky from "../img/milkyway.png";
import {AnySpec} from "./drawing/elements";
import {bigClouds, mediumClouds, smallClouds} from "./drawing/elements/clouds.ts";

export const nightSpec: AnySpec[] = [
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
        type: "image",
        image: milky,
        x: 80,
        y: 0,
        width: 400,
        height: 180,
        alpha: 0.5,
        op: "screen",
    },
    {
        type: "stars",
        color: "#ffffff"
    },
    {
        type: "ground"
    }
];
export const cloudyNightSpec: AnySpec[] = [
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
        type: "image",
        image: milky,
        x: 80,
        y: 0,
        width: 400,
        height: 180,
        alpha: 0.1,
        op: "screen",
    },
    {
        type: "stars",
        color: "#ffffff44"
    },
    {
        type: "clouds",
        colors: ["clouds", "cloudsDark"],
        clouds: [
            [100, 45, bigClouds[0]],
            [450, 50, bigClouds[1]],
            [650, 80, bigClouds[2]],
            [250, 40, bigClouds[2]],
            [1100, 85, mediumClouds[1]],
            [1300, 30, smallClouds[3]],
            [1600, 80, smallClouds[4]],
        ]
    },
    {
        type: "clouds",
        colors: ["#0a1c37", "#08152b"],
        clouds: [
            [100, 45, mediumClouds[0]],
            [450, 70, mediumClouds[1]],
            [650, 80, mediumClouds[2]],
            [250, 55, mediumClouds[3]],
            [-10, 65, mediumClouds[4]],
            [120, 25, smallClouds[0]],
            [450, 50, smallClouds[1]],
            [650, 80, smallClouds[2]],
        ]
    },
    {
        type: "ground"
    }
]
