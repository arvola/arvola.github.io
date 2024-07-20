import { cloud2 } from "./cloud.ts";
import { mediumClouds, smallClouds } from "./drawing/elements/clouds.ts";
import { Drawing } from "./drawing/canvases.ts";

/**
 * Draw the clouds.
 */
export function clouds({ ctx, c }: Drawing) {
    cloud2(ctx.base, [c.clouds, c.cloudsDark], 100, 45, smallClouds[0]);
    cloud2(ctx.base, [c.clouds, c.cloudsDark], 450, 50, smallClouds[1]);
    cloud2(ctx.base, [c.clouds, c.cloudsDark], 650, 80, smallClouds[2]);
    cloud2(ctx.base, [c.clouds, c.cloudsDark], 850, 30, mediumClouds[2]);
    cloud2(ctx.base, [c.clouds, c.cloudsDark], 1100, 85, mediumClouds[1]);
    cloud2(ctx.base, [c.clouds, c.cloudsDark], 1300, 30, smallClouds[3]);
    cloud2(ctx.base, [c.clouds, c.cloudsDark], 1600, 80, smallClouds[4]);
}

