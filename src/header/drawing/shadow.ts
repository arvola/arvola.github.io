/**
 * Utilities for building a shadow canvas from a source canvas.
 *
 * The idea: treat the source canvas's alpha as the silhouette of whatever
 * was drawn into it (flowers, mound, kitty, ...), then render a blurred,
 * recolored copy offset along a given direction. The result is returned as
 * a new canvas so callers can composite it wherever they like.
 */

export interface ShadowOptions {
    /** Direction (in radians) that the shadow falls. 0 = +x, PI/2 = +y. */
    angle: number;
    /** Pixels of offset along that angle. */
    distance: number;
    /** Blur radius in pixels (passed to ctx.filter = "blur(...)"). */
    blur: number;
    /** CSS color string for the shadow. Defaults to a soft black. */
    color?: string;
    /**
     * Extra padding around the source so blur halos don't get clipped.
     * Defaults to ceil(blur * 2 + |distance|).
     */
    padding?: number;
}

export interface ShadowCanvas {
    canvas: HTMLCanvasElement;
    /** Padding baked into the result; caller should draw at (-padding, -padding). */
    padding: number;
}

/**
 * Build a shadow canvas from `source`. The returned canvas is larger than
 * `source` by `padding` on every side so the blur isn't clipped — draw it
 * at `(x - padding, y - padding)` relative to where `source` would have gone.
 */
export function makeShadowCanvas(
    source: HTMLCanvasElement,
    opts: ShadowOptions,
): ShadowCanvas {
    const { angle, distance, blur } = opts;
    const color = opts.color ?? "rgba(0, 0, 0, 0.35)";
    const padding = opts.padding ?? Math.ceil(blur * 2 + Math.abs(distance));

    const out = document.createElement("canvas");
    out.width = source.width + padding * 2;
    out.height = source.height + padding * 2;
    const ctx = out.getContext("2d")!;

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    // 1) Draw the source shifted into the padded canvas, blurred.
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(source, padding + dx, padding + dy);
    ctx.filter = "none";

    // 2) Recolor: keep the blurred alpha, replace RGB with the shadow color.
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, out.width, out.height);

    return { canvas: out, padding };
}

export interface Point {
    x: number;
    y: number;
}

/**
 * Compute the angle (radians) at which a shadow should fall when light
 * comes from `sun` and hits a subject anchored at `subject`. The shadow
 * direction is simply the vector from sun to subject, extended outward.
 *
 * Because the sun in this project always sits in the background of the
 * header scene, this naturally produces shadows that fall toward the
 * viewer (downward) and slightly to whichever side of the sun the
 * subject is on.
 */
export function shadowAngleFromSun(sun: Point, subject: Point): number {
    return Math.atan2(subject.y - sun.y, subject.x - sun.x);
}

export interface SunShadowOptions {
    sun: Point;
    /** Anchor point of the subject (e.g. base of the flower mound). */
    subject: Point;
    distance: number;
    blur: number;
    color?: string;
    padding?: number;
}

/**
 * Convenience wrapper around `makeShadowCanvas` that derives the shadow
 * angle from a sun position and a subject anchor.
 */
export function makeSunShadowCanvas(
    source: HTMLCanvasElement,
    opts: SunShadowOptions,
): ShadowCanvas {
    return makeShadowCanvas(source, {
        angle: shadowAngleFromSun(opts.sun, opts.subject),
        distance: opts.distance,
        blur: opts.blur,
        color: opts.color,
        padding: opts.padding,
    });
}

export interface ProjectedShadowOptions {
    /** Sun position, in the same coordinate space as `source`. */
    sun: Point;
    /** Anchor on the ground where the subject meets the ground (in source coords). */
    anchor: Point;
    /**
     * How tall the shadow is along the ground compared to the subject's
     * height above the anchor. With the sun high & behind, this is small
     * (~0.4–0.7); a low sun makes it large.
     */
    lengthScale?: number;
    /** Blur radius in pixels. */
    blur?: number;
    /** CSS color for the shadow. */
    color?: string;
    /**
     * Device-pixel ratio of the source canvas. The source is drawn at
     * `devicePixelRatio` scale, but `sun`/`anchor` are given in CSS pixels,
     * so we need to know the factor to convert. Defaults to
     * `window.devicePixelRatio`.
     */
    dpr?: number;
}

/**
 * Build a "cast on the ground" shadow canvas. The subject in `source` is
 * projected onto a horizontal ground plane passing through `anchor`,
 * producing a sheared, foreshortened silhouette that falls away from the
 * sun and toward the viewer.
 *
 * The returned canvas has the same dimensions as `source` and is drawn in
 * the same coordinate space — composite it onto the base canvas at (0, 0)
 * (after resetting transforms to identity, since `source` is DPR-scaled).
 */
export function makeProjectedShadowCanvas(
    source: HTMLCanvasElement,
    opts: ProjectedShadowOptions,
): HTMLCanvasElement {
    const lengthScale = opts.lengthScale ?? 0.55;
    const blur = opts.blur ?? 3;
    const color = opts.color ?? "rgba(0, 0, 0, 0.35)";
    const dpr = opts.dpr ?? (typeof window !== "undefined" ? window.devicePixelRatio : 1);

    // Work in CSS-pixel space — anchor/sun are in CSS px, and we scale
    // the destination context by dpr so drawImage(source) (which is DPR-
    // sized) lands 1:1 in CSS coords.
    const ax = opts.anchor.x;
    const ay = opts.anchor.y;
    const sx = opts.sun.x;
    const sy = opts.sun.y;

    const horiz = ax - sx;
    const vert = Math.max(1, ay - sy);
    const shearX = horiz / vert;

    const out = document.createElement("canvas");
    out.width = source.width;
    out.height = source.height;
    const ctx = out.getContext("2d")!;

    ctx.save();
    ctx.filter = `blur(${blur}px)`;

    // First scale to CSS-pixel space, then apply the projection transform.
    ctx.scale(dpr, dpr);
    // Affine ground projection of a parallel light cast from `sun`:
    //   x' = px + (ay - py) * shearX
    //   y' = ay + (ay - py) * lengthScale   (with vertical flip baked in)
    // In matrix form (a, b, c, d, e, f) where x' = a*px + c*py + e:
    //   a = 1, c = -shearX, e =  ay * shearX
    //   b = 0, d = -lengthScale, f = ay * (1 + lengthScale)
    ctx.transform(
        1,
        0,
        -shearX,
        -lengthScale,
        ay * shearX,
        ay * (1 + lengthScale),
    );
    // drawImage uses the source's CSS size; source canvas is DPR-sized
    // pixels but we want CSS-px logical size when drawn under our scaled
    // ctx, so divide.
    ctx.drawImage(source, 0, 0, source.width / dpr, source.height / dpr);
    ctx.restore();

    // Recolor: keep alpha from the projected silhouette, replace RGB.
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, out.width, out.height);

    return out;
}
