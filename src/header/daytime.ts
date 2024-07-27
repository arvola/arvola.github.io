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
        ],
    },
    {
        type: "ground",
        darken: 0.1
    },
];

export const overcastDay: AnySpec[] = [
    {
        type: "sky",
        stops: [
            {
                color: "#b6cdcb",
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
        colors: ["#cddcda", "#b1c5c3"],
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
        darken: 0.4
    },
];

export const rainyDay: AnySpec[] = [
    {
        type: "sky",
        stops: [
            {
                color: "#8a9e9d",
                width: 0
            },
            {
                color: "#7c8f8c",
                width: 110
            }
        ],
        height: 0.4
    },
    {
        type: "clouds",
        colors: ["#899897", "#6c7a7a"],
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
        colors: ["#6a7574", "#8a9c9a"],
        clouds: [
            //[90, 25, mediumClouds[0]],
        ],
    },
    {
        layer: "overlay",
        type: "rain",
        colors: ["#ffffff22", "#c4d6e166"],
        tilt: 20
    },
    {
        layer: "overlay",
        type: "clouds",
        colors: ["#8c9a97", "#5e6a69"],
        clouds: [
            [-50, -70, mediumClouds[3]],
            [100, -50, mediumClouds[5]],
            [190, -60, mediumClouds[0]],
            [30, -75, mediumClouds[1]],
            [300, -60, mediumClouds[2]],
            [240, -80, mediumClouds[2]],
            [410, -50, mediumClouds[3]],
            [500, -40, mediumClouds[4]],
            [400, -60, bigClouds[1]],
            [600, -54, mediumClouds[4]],
            [730, -60, mediumClouds[5]],
            [800, -70, mediumClouds[3]],
            [900, -50, mediumClouds[5]],
            [990, -60, mediumClouds[0]],
            [830, -75, mediumClouds[1]],
            [1100, -60, mediumClouds[2]],
            [1040, -80, mediumClouds[2]],
            [1210, -50, mediumClouds[3]],
            [1300, -40, mediumClouds[4]],
            [1200, -60, bigClouds[1]],
            [1400, -54, mediumClouds[4]],
            [1530, -60, mediumClouds[5]],
            [1600, -65, smallClouds[4]],
        ],
    },
    {
        type: "ground",
        darken: 0.5
    },
];
