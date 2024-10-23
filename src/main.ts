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
let isDrawing = false;
let paths: Array<DisplayObject> = [];
let currentPath: LineSegment | null = null;
let undoStack: Array<DisplayObject> = [];
let redoStack: Array<DisplayObject> = [];
let lineThickness = 1;
let toolPreview: ToolPreview | null = null;
let currentSticker: Sticker | null = null;
let currentTool: "draw" | "sticker" = "draw";

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d")!;
const clearButton = document.createElement("button");
const undoButton = document.createElement("button");
const redoButton = document.createElement("button");
const thinButton = document.createElement("button");
const thickButton = document.createElement("button");
const createStickerButton = document.createElement("button");
const exportButton = document.createElement("button");
const emojiStickers = [
    { emoji: "☺️", label: "Smile 1" },
    { emoji: "😊", label: "Smile 2" },
    { emoji: "😄", label: "Smile 3" }
];

clearButton.textContent = "Clear Canvas";
undoButton.textContent = "Undo";
redoButton.textContent = "Redo";
thinButton.textContent = "Thin Marker";
thickButton.textContent = "Thick Marker";
createStickerButton.textContent = "Create Your Own Sticker!";
exportButton.textContent = "Export Canvas (PNG)";

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

class Sticker implements DisplayObject {
    private x: number;
    private y: number;
    private emoji: string;

    constructor(x: number, y: number, emoji: string) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
    }

    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.font = "30px Arial";
        ctx.fillText(this.emoji, this.x - 15, this.y + 10);  // Adjust the positioning to center
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

function createSticker(x: number, y: number, emoji: string): Sticker {
    return new Sticker(x, y, emoji);
}

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
        path.display(context);
    });

    if (!isDrawing && toolPreview) {
        toolPreview.display(context);
    }
    if (currentSticker) {
        currentSticker.display(context);
    }
}

function selectTool(button: HTMLButtonElement, thickness: number) {
    currentTool = "draw";
    lineThickness = thickness;
    toolPreview = createToolPreview(0, 0, lineThickness);
    document.querySelectorAll(".selectedTool").forEach(btn => btn.classList.remove("selectedTool"));
    button.classList.add("selectedTool");
}

function selectSticker(emoji: string) {
    currentTool = "sticker";
    currentSticker = createSticker(0, 0, emoji);
    toolPreview = null; // No drawing tool preview when using stickers
}

function exportCanvas() {
    const tempCanvas = document.createElement("canvas");  // Temporary canvas sized 1024x204
    const exportContext = tempCanvas.getContext("2d")!;
    
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;
    exportContext.scale(4, 4);

    paths.forEach((path) => {   // Redraws paths onto the temp canvas
        path.display(exportContext);
    });

    tempCanvas.toBlob((blob) => {   // Trigger the download
        if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "canvas-export.png";
            link.click();
            URL.revokeObjectURL(url);
        }
    });
}

// ===================================
// ADD EVENT LISTENERS TO PAGE ELEMENTS
canvas.addEventListener("mousedown", (event) => {
    if (currentTool === "draw") {
        isDrawing = true;
        currentPath = createLineSegment(event.offsetX, event.offsetY, lineThickness);
        toolPreview = null; // Hide tool preview while drawing
    } else if (currentTool === "sticker" && currentSticker) {
        currentSticker.updatePosition(event.offsetX, event.offsetY);
        paths.push(currentSticker);
        currentSticker = null;
    }
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing && currentTool === "draw") {
        if (!toolPreview) {
            toolPreview = createToolPreview(event.offsetX, event.offsetY, lineThickness);
        } else {
            toolPreview.updatePosition(event.offsetX, event.offsetY);
        }
        canvas.dispatchEvent(new Event("tool-moved"));
    } else if (!isDrawing && currentTool === "sticker" && currentSticker) {
        currentSticker.updatePosition(event.offsetX, event.offsetY);
        canvas.dispatchEvent(new Event("tool-moved"));
    } else if (isDrawing && currentPath) {
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

createStickerButton.addEventListener("click", () => {   // Button for user to create a sticker
    const emoji = prompt("Input your own emoji to create a new sticker:", "😎");    // Ensure a real emoji character is pasted in
    if (emoji) {
        const button = document.createElement("button");
        button.textContent = emoji;
        button.addEventListener("click", () => selectSticker(emoji));
        app.appendChild(button);
    }
});

// Create buttons dynamically
emojiStickers.forEach(sticker => {
    const button = document.createElement("button");
    button.textContent = sticker.emoji;
    button.addEventListener("click", () => selectSticker(sticker.emoji));
    app.appendChild(button);
});

exportButton.addEventListener("click", exportCanvas);

// ===================================
// MAIN PROGRAM
app.appendChild(canvas);
app.appendChild(undoButton);
app.appendChild(redoButton);
app.appendChild(clearButton);
app.appendChild(thinButton);
app.appendChild(thickButton);
app.appendChild(createStickerButton);
app.appendChild(exportButton);

toolPreview = createToolPreview(0, 0, lineThickness);   // Create the initial tool preview object when the app starts
