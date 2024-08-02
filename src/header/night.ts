import milky from "../img/milkyway.png";
import {AnySpec} from "./drawing/elements";
import {bigClouds, mediumClouds, smallClouds} from "./drawing/elements/clouds.ts";

export const overcastNight: AnySpec[] = [
            {
        type: "sky",
        stops: [
            {
                color: "#000",
                width: 44,
            },
            {
                color: "underground",
                width: 132,
            },
        ],
    },
    {
        type: "clouds",
        colors: ["#030303", "#070707"],
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
        colors: ["#020202", "#070707"],
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
        colors: ["#050505", "#050505"],
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
        type: "ground"
    }
]

export const nightRain: AnySpec[] = [
            {
        type: "sky",
        stops: [
            {
                color: "#000",
                width: 44,
            },
            {
                color: "underground",
                width: 132,
            },
        ],
    },
    {
        type: "clouds",
        colors: ["#030303", "#070707"],
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
        colors: ["#020202", "#070707"],
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
        colors: ["#050505", "#050505"],
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
        type: "rain",
        colors: ["#c4d6e111", "#c4d6e122", "#B5A3DC9C"],
        tilt: 20
    },
    {
        type: "ground"
    }
]

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
        alpha: 0.3,
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
        color: "#ffffff66"
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
