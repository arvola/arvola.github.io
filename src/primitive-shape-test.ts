interface SweptTriangleSpec {
    x: number;
    y: number;
    width: number;
    height: number;
    sideSweep: number;
    topConcavity: number;
    tipInset: number;
    flipVertical: boolean;
}

function drawSweptTriangle(ctx: CanvasRenderingContext2D, spec: SweptTriangleSpec) {
    const halfWidth = spec.width / 2;
    const topLeftX = spec.x - halfWidth;
    const topRightX = spec.x + halfWidth;
    const topY = spec.y;
    const tipX = spec.x;
    const tipY = spec.y + spec.height;

    const sideControlY = topY + spec.height * 0.44;
    const clampedSweep = Math.max(0, Math.min(1, spec.sideSweep));
    const sideSweepX = spec.width * clampedSweep * 0.5;
    const leftControlX = topLeftX + sideSweepX;
    const rightControlX = topRightX - sideSweepX;

    const topControlX = spec.x;
    const topControlY = topY + spec.height * spec.topConcavity;

    const tipInsetY = spec.height * spec.tipInset;

    ctx.beginPath();
    ctx.moveTo(topLeftX, topY);
    ctx.quadraticCurveTo(leftControlX, sideControlY, tipX, tipY - tipInsetY);
    ctx.quadraticCurveTo(rightControlX, sideControlY, topRightX, topY);
    ctx.quadraticCurveTo(topControlX, topControlY, topLeftX, topY);
    ctx.closePath();
}

const canvas = document.getElementById("primitive-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const controlIds = ["sideSweep", "topConcavity", "tipInset", "width", "height", "x", "y"] as const;
const controls = controlIds.reduce((acc, id) => {
    acc[id] = document.getElementById(id) as HTMLInputElement;
    return acc;
}, {} as Record<(typeof controlIds)[number], HTMLInputElement>);

const shapeSelect = document.getElementById("shapeSelect") as HTMLSelectElement;
const addShapeButton = document.getElementById("addShape") as HTMLButtonElement;
const removeShapeButton = document.getElementById("removeShape") as HTMLButtonElement;
const exportShapesButton = document.getElementById("exportShapes") as HTMLButtonElement;
const exportOutput = document.getElementById("exportOutput") as HTMLTextAreaElement;
const flipVerticalControl = document.getElementById("flipVertical") as HTMLInputElement;
const flipVerticalValue = document.getElementById("flipVerticalValue") as HTMLSpanElement;

const defaultShapes: SweptTriangleSpec[] = [
    {
        x: 320,
        y: 352,
        width: 257,
        height: 198,
        sideSweep: 0.21,
        topConcavity: 0.08,
        tipInset: 0.02,
        flipVertical: false,
    },
    {
        x: 320,
        y: 253,
        width: 236,
        height: 228,
        sideSweep: 0.06,
        topConcavity: 0.08,
        tipInset: 0.02,
        flipVertical: false,
    },
    {
        x: 320,
        y: 153,
        width: 184,
        height: 387,
        sideSweep: 0,
        topConcavity: 0.145,
        tipInset: 0.02,
        flipVertical: false,
    },
    {
        x: 320,
        y: 54,
        width: 129,
        height: 198,
        sideSweep: 0.21,
        topConcavity: 0.08,
        tipInset: 0.02,
        flipVertical: true,
    },
];

const defaultShape = (): SweptTriangleSpec => ({ ...defaultShapes[0] });

const shapes: SweptTriangleSpec[] = defaultShapes.map((shape) => ({ ...shape }));
let selectedShapeIndex = 0;

function updateValueLabel(id: (typeof controlIds)[number]) {
    const valueNode = document.getElementById(`${id}Value`)!;
    const value = Number(controls[id].value);
    valueNode.textContent = id === "width" || id === "height" || id === "x" || id === "y"
        ? `${Math.round(value)}px`
        : value.toFixed(3);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#e7e7e7";
    ctx.strokeStyle = "#f4f4f4";
    ctx.lineWidth = 1.5;

    shapes.forEach((shape) => {
        if (shape.flipVertical) {
            const centerY = shape.y + shape.height / 2;
            ctx.save();
            ctx.translate(0, centerY * 2);
            ctx.scale(1, -1);
            drawSweptTriangle(ctx, shape);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            return;
        }

        drawSweptTriangle(ctx, shape);
        ctx.fill();
        ctx.stroke();
    });
}

function renderShapeList() {
    shapeSelect.innerHTML = "";
    shapes.forEach((_, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `Shape ${index + 1}`;
        if (index === selectedShapeIndex) {
            option.selected = true;
        }
        shapeSelect.append(option);
    });
    removeShapeButton.disabled = shapes.length <= 1;
}

function syncControlsFromSelectedShape() {
    const selectedShape = shapes[selectedShapeIndex];
    controlIds.forEach((id) => {
        controls[id].value = String(selectedShape[id]);
        updateValueLabel(id);
    });
    flipVerticalControl.checked = selectedShape.flipVertical;
    flipVerticalValue.textContent = selectedShape.flipVertical ? "On" : "Off";
}

function updateSelectedShapeFromControls() {
    const selectedShape = shapes[selectedShapeIndex];
    controlIds.forEach((id) => {
        selectedShape[id] = Number(controls[id].value);
    });
    selectedShape.flipVertical = flipVerticalControl.checked;
    flipVerticalValue.textContent = selectedShape.flipVertical ? "On" : "Off";
}

controlIds.forEach((id) => {
    controls[id].addEventListener("input", () => {
        updateValueLabel(id);
        updateSelectedShapeFromControls();
        draw();
    });
});

flipVerticalControl.addEventListener("input", () => {
    updateSelectedShapeFromControls();
    draw();
});

shapeSelect.addEventListener("change", () => {
    selectedShapeIndex = Number(shapeSelect.value);
    syncControlsFromSelectedShape();
    draw();
});

addShapeButton.addEventListener("click", () => {
    shapes.push(defaultShape());
    selectedShapeIndex = shapes.length - 1;
    renderShapeList();
    syncControlsFromSelectedShape();
    draw();
});

removeShapeButton.addEventListener("click", () => {
    if (shapes.length <= 1) {
        return;
    }
    shapes.splice(selectedShapeIndex, 1);
    selectedShapeIndex = Math.min(selectedShapeIndex, shapes.length - 1);
    renderShapeList();
    syncControlsFromSelectedShape();
    draw();
});

exportShapesButton.addEventListener("click", async () => {
    const exportJson = JSON.stringify(shapes, null, 2);
    exportOutput.value = exportJson;
    try {
        await navigator.clipboard.writeText(exportJson);
    } catch {
        // Clipboard is not available in all contexts.
    }
});

renderShapeList();
syncControlsFromSelectedShape();
draw();