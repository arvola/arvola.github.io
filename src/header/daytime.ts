import { clouds, grounds, initCanvases, redrawSprites } from "./header.ts";
import { opacity, zeroOpacity } from "./graphics.ts";

/**
 * Draw the daytime yard graphic onto the given canvases.
 */
export function drawDaytimeYard(
    base: HTMLCanvasElement,
    ground: HTMLCanvasElement,
) {
    const drawing = initCanvases({ base, ground });
    const { ctx, canvas, c } = drawing;

    const skyGradient = ctx.base.createLinearGradient(0, 0, 0, 80);
    skyGradient.addColorStop(0, c.sky);
    skyGradient.addColorStop(1, c.lightSky);

    ctx.base.fillStyle = skyGradient;
    ctx.base.fillRect(0, 0, 2500, 220);

    const sunlightGradient = ctx.base.createRadialGradient(
        350,
        20,
        30,
        350,
        20,
        400,
    );
    sunlightGradient.addColorStop(0, opacity(c.lightSky, 0.5));
    sunlightGradient.addColorStop(1, zeroOpacity(c.lightSky));
    ctx.base.fillStyle = sunlightGradient;
    ctx.base.arc(350, 20, 500, 0, 2 * Math.PI);

    ctx.base.fill();
    ctx.base.closePath();

    const sunGradient = ctx.base.createRadialGradient(
        350,
        20,
        30,
        350,
        20,
        100,
    );
    sunGradient.addColorStop(0, opacity(c.sunner, 0.1));
    sunGradient.addColorStop(0.33, opacity(c.sunner, 0.1));
    sunGradient.addColorStop(0.331,opacity( c.sun, 0.1));
    sunGradient.addColorStop(0.66, opacity(c.sun, 0.1));
    sunGradient.addColorStop(0.661,opacity( "#fff", 0.1));
    sunGradient.addColorStop(1, opacity("#fff", 0.1));
    ctx.base.fillStyle = sunGradient;
    ctx.base.arc(350, 20, 100, 0, 2 * Math.PI);
    //ctx.base.globalAlpha = 0.1;
    ctx.base.fill();
    ctx.base.closePath();

    ctx.base.globalAlpha = 1;
    ctx.base.globalCompositeOperation = "source-over";

    ctx.base.beginPath();
    ctx.base.fillStyle = c.sun;
    ctx.base.strokeStyle = c.sunner;
    ctx.base.arc(350, 20, 25, 0, 2 * Math.PI);
    ctx.base.fill();

    redrawSprites();

    clouds(drawing);
    grounds(canvas.ground, ctx.ground, c, 0.5, "multiply");
}
