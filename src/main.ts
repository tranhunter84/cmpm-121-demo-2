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
canvas.style.cursor = "none"; // Hide the default cursor

// ===================================
// INTERFACES
interface DisplayObject {
    display(ctx: CanvasRenderingContext2D): void;
}

// ===================================
// CLASSES
class LineSegment implements DisplayObject {
    private points: { x: number, y: number }[];
    private thickness: number;

    constructor(initialX: number, initialY: number, thickness: number) {
        this.points = [{ x: initialX, y: initialY }];
        this.thickness = thickness;
    }

    addPoint(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D): void {
        if (this.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (const point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineWidth = this.thickness;
        ctx.stroke();
        ctx.closePath();
    }
}

class ToolPreview implements DisplayObject {
    private x: number;
    private y: number;
    private thickness: number;

    constructor(x: number, y: number, thickness: number) {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
    }

    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    display(ctx: CanvasRenderingContext2D): void {
        const previewSize = this.thickness * 4; // Make the preview 4 times the thickness
        ctx.beginPath();
        ctx.arc(this.x, this.y, previewSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.closePath();
    }
}

// ===================================
// HELPER FUNCTIONS
function createLineSegment(initialX: number, initialY: number, thickness: number): LineSegment {
    return new LineSegment(initialX, initialY, thickness);
}

function createToolPreview(initialX: number, initialY: number, thickness: number): ToolPreview {
    return new ToolPreview(initialX, initialY, thickness);
}

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
        path.display(context);
    });

    // Draw the tool preview only if not drawing and preview exists
    if (!isDrawing && toolPreview) {
        toolPreview.display(context);
    }
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
    toolPreview = null; // Hide tool preview while drawing
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) {
        // Update the tool preview's position
        if (!toolPreview) {
            toolPreview = createToolPreview(event.offsetX, event.offsetY, lineThickness);
        } else {
            toolPreview.updatePosition(event.offsetX, event.offsetY);
        }
        canvas.dispatchEvent(new Event("tool-moved"));
    } else if (currentPath) {
        // Add point to the current path when drawing
        currentPath.addPoint(event.offsetX, event.offsetY);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
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

// Add the "tool-moved" event listener to trigger a redraw for tool preview
canvas.addEventListener("tool-moved", redraw);

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

// Create the initial tool preview object when the app starts
toolPreview = createToolPreview(0, 0, lineThickness);
