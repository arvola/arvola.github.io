
// Allow dragging the kitty around with the mouse.


/**
 * Contains adjustments for the position of the kitty.
 */
export const positionAdjust = {
    offsetX: 1,
    offsetY: 1,
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
    direction: 1,
};

const kitty = document.getElementById("kitty") as HTMLDivElement;
kitty.ondragstart = () => false;
kitty.addEventListener("mousedown", (event: MouseEvent) => {
    const rect = kitty.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    function move(left: number, top: number) {
        positionAdjust.x = left - x;
        positionAdjust.y = top - y;
        positionAdjust.offsetX = 0;
        positionAdjust.offsetY = 0;
        redrawSprites();
    }

    function onMouseMove(event: MouseEvent) {
        move(event.pageX, event.pageY);
    }

    function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        kitty.removeEventListener("mouseup", onMouseUp);
    }

    kitty.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
});

/**
 * Redraw all the "sprites" on top of the graphic.
 */
export function redrawSprites() {
    kitty.style.left = positionAdjust.offsetX + positionAdjust.x + "px";
    kitty.style.top = positionAdjust.offsetY + positionAdjust.y + "px";
}