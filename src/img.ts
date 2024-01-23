/**
 * Simple cache to keep images in memory after first load.
 */
let imgCache: Record<string, HTMLImageElement | HTMLCanvasElement> = {};

/**
 * Load an image from a URL and apply optional transformations.
 */
export function img(
    src: string,
    opt: {
        scale?: number;
        rotate?: number;
        mirror?: boolean;
    } | null,
    cb: (image: HTMLImageElement | HTMLCanvasElement) => void
) {
    const key = src + JSON.stringify(opt);

    if (imgCache[key]) {
        cb(imgCache[key]);
        return;
    }

    var im = new Image();
    im.src = src;
    im.addEventListener(
        "load",
        () => {
            if (opt) {
                let w = im.width;
                let h = im.height;
                if (opt.scale) {
                    w *= opt.scale;
                    h *= opt.scale;
                }

                let max = Math.max(w, h);
                max = Math.sqrt(2 * Math.pow(max, 2));
                let halfMax = max / 2;
                const can2 = document.createElement("canvas");
                can2.width = max * devicePixelRatio;
                can2.height = max * devicePixelRatio;
                const ct = can2.getContext("2d")!;
                if (opt.mirror) {
                    ct.scale(devicePixelRatio * -1, devicePixelRatio);
                    if (opt.rotate) {
                        ct.translate(-halfMax, halfMax);
                        ct.rotate(opt.rotate);
                        ct.translate(halfMax, -halfMax);
                    }
                } else if (opt.rotate) {
                    ct.translate(halfMax, halfMax);
                    ct.rotate(opt.rotate);
                    ct.translate(-halfMax, -halfMax);
                }
                ct.drawImage(
                    im,
                    opt.mirror ? -w / 2 - halfMax : halfMax - w / 2,
                    halfMax - h / 2,
                    w,
                    h
                );

                ct.setTransform(1, 0, 0, 1, 0, 0);
                imgCache[key] = can2;
                cb(can2);
            } else {
                imgCache[key] = im;
                cb(im);
            }
        },
        { once: true, capture: false }
    );
}
