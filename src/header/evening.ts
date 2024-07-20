import { clouds } from "./header.ts";
import {redrawSprites} from "./drawing/kitty.ts";
import { initCanvases } from "./drawing/canvases.ts";
import { opacity } from "./drawing/color.ts";
import { grounds } from "./drawing/elements/ground.ts";

export function drawEveningYard(
    base: HTMLCanvasElement,
    ground: HTMLCanvasElement,
    overlay: HTMLCanvasElement,
) {
    const drawing = initCanvases({ base, ground, overlay });
    const { ctx, canvas, c } = drawing;

    const skyGradient = ctx.base.createLinearGradient(0, 0, 0, 220);
    skyGradient.addColorStop(0, c.underground);
    skyGradient.addColorStop(0.2, c.sky);
    skyGradient.addColorStop(0.8, c.lightSky);

    ctx.base.fillStyle = skyGradient;
    ctx.base.fillRect(0, 0, 2500, 220);

    const sunX = 450;
    const sunY = 188;
    const sunGradient = ctx.base.createRadialGradient(
        sunX,
        sunY,
        0,
        sunX,
        sunY,
        200
    );
    sunGradient.addColorStop(0, opacity(c.sunner, 0.4));
    sunGradient.addColorStop(1, "#ffffff00");
    ctx.base.fillStyle = sunGradient;
    ctx.base.arc(sunX, sunY, 200, 0, 2 * Math.PI);
    ctx.base.fill();
    ctx.base.closePath();
    ctx.base.globalAlpha = 1;
    ctx.base.globalCompositeOperation = "source-over";

    ctx.base.beginPath();
    ctx.base.fillStyle = c.sun;
    ctx.base.strokeStyle = c.sunner;
    ctx.base.arc(sunX, sunY, 25, 0, 2 * Math.PI);
    ctx.base.fill();

    redrawSprites();

    clouds(drawing);
    grounds(drawing, canvas.ground, ctx.ground, c);
}
