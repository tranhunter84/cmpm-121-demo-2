import "./style.css";

// ===================================
// BASIC APP HEADERS & STYLING
const APP_NAME = "HUNTER'S DEMO #2!!";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;
const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// ===================================
// INITIALIZATION OF CORE VARIABLES
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d")!;
const clearButton = document.createElement("button");
const undoButton = document.createElement("button");
const redoButton = document.createElement("button");
const thinButton = document.createElement("button");
const thickButton = document.createElement("button");

let isDrawing = false;
let paths: Array<DisplayObject> = [];
let currentPath: LineSegment | null = null;
let undoStack: Array<DisplayObject> = [];
let redoStack: Array<DisplayObject> = [];
let lineThickness = 1;
let toolPreview: ToolPreview | null = null;

clearButton.textContent = "Clear Canvas";
undoButton.textContent = "Undo";
redoButton.textContent = "Redo";
thinButton.textContent = "Thin Marker";
thickButton.textContent = "Thick Marker";

canvas.width = 256;
canvas.height = 256;

// ===================================
// INTERFACES
interface DisplayObject {
display(ctx: CanvasRenderingContext2D): void;
}

interface LineSegment extends DisplayObject {
addPoint(x: number, y: number): void;
}

interface ToolPreview extends DisplayObject {
    updatePosition(x: number, y: number): void;
}

// ===================================
// HELPER FUNCTIONS
function createLineSegment(initialX: number, initialY: number, thickness: number): LineSegment {
    const points: { x: number, y: number }[] = [{ x: initialX, y: initialY }];

    return {
        addPoint(x: number, y: number) {
            points.push({ x, y });
        },
        display(ctx: CanvasRenderingContext2D) {
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (const point of points) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.lineWidth = thickness;
            ctx.stroke();
            ctx.closePath();
        }
    };
}

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
        path.display(context);
    });
}

function selectTool(button: HTMLButtonElement, thickness: number) {
    lineThickness = thickness;
    document.querySelectorAll(".selectedTool").forEach(btn => btn.classList.remove("selectedTool"));
    button.classList.add("selectedTool");
}

// ===================================
// ADD EVENT LISTENERS TO PAGE ELEMENTS
canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;
    currentPath = createLineSegment(event.offsetX, event.offsetY, lineThickness);
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing || !currentPath) return;
    currentPath.addPoint(event.offsetX, event.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
    if (currentPath) {
        paths.push(currentPath);
        currentPath = null;
        redoStack = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
    isDrawing = false;
});

canvas.addEventListener("drawing-changed", redraw);

undoButton.addEventListener("click", () => {
    if (paths.length > 0) {
        const lastPath = paths.pop();
        if (lastPath) undoStack.push(lastPath);
            canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

redoButton.addEventListener("click", () => {
    if (undoStack.length > 0) {
        const lastUndo = undoStack.pop();
        if (lastUndo) {
            paths.push(lastUndo);
            redoStack.push(lastUndo);
        }
        canvas.dispatchEvent(new Event("drawing-changed"));
    }   
});

clearButton.addEventListener("click", () => {
    paths = [];
    undoStack = [];
    redoStack = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
});

thinButton.addEventListener("click", () => selectTool(thinButton, 1));
thickButton.addEventListener("click", () => selectTool(thickButton, 5));

// ===================================
// MAIN PROGRAM
app.appendChild(canvas);
app.appendChild(undoButton);
app.appendChild(redoButton);
app.appendChild(clearButton);
app.appendChild(thinButton);
app.appendChild(thickButton);